/* Reserva localStorage sem quota + abort real da transação IDB. A operação aceita em memória precisa ser
   reenviada ao checkpoint quando o armazenamento voltar, sem depender de um diário que nunca foi gravado.
   Nenhum setItem/getItem é falsificado; as transações abortam de verdade até a liberação explícita da falha. */
const path = require('path'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'operacoes-dupla-falha.test.js'))) return;
  const f = await fixture.abrir(alvo), ctx = await f.contexto(), hj = new Date().toISOString().slice(0, 10);
  try {
    const A = await f.pagina(ctx); await f.importar(A, { v: 1, cfg: { nome: 'Dupla falha fictícia' }, feito: { 'T:base': true }, act: { [hj]: 2 } });
    const ler = p => p.evaluate(() => new Promise(resolve => { const o = window.indexedDB.open('eear-operacoes', 1); o.onsuccess = () => { const db = o.result, t = db.transaction('contas', 'readonly'), q = t.objectStore('contas').get(''); t.oncomplete = () => { db.close(); resolve(q.result.st); }; }; }));
    if (!await f.ate(async () => (await ler(A)).feito['T:base'])) throw new Error('Checkpoint inicial não confirmado.');
    await A.evaluate(() => {
      let n = 0; for (const tamanho of [65536, 1024, 1]) { try { for (;;) localStorage.setItem('quota-ficticia-' + n++, 'x'.repeat(tamanho)); } catch (e) { if (e.name !== 'QuotaExceededError') throw e; } }
      const put = window.IDBObjectStore.prototype.put; window.__bloquearDupla = true;
      window.IDBObjectStore.prototype.put = function (v, ...args) {
        if (window.__bloquearDupla && this.name === 'contas' && v.st && v.st.feito['T:dupla-falha']) { window.__abortouDupla = true; this.transaction.abort(); }
        return put.call(this, v, ...args);
      };
    });
    await f.clicar(A, 'marcar', { k: 'T:dupla-falha' });
    if (!await f.ate(async () => A.evaluate(() => window.__abortouDupla === true))) throw new Error('Não comprovou abort real.');
    const aceito = (await f.estado(A)).feito['T:dupla-falha'];
    const semReserva = await A.evaluate(() => !Object.keys(localStorage).some(k => k.startsWith('missao-eear-v1-diario#') && localStorage.getItem(k).includes('T:dupla-falha')));
    const falhou = /não está sendo salv|Aguardando confirmação/.test(await A.locator('#sync').innerText()) && (await A.locator('#sync').getAttribute('data-local')) !== 'confirmado';
    await A.evaluate(() => { window.__bloquearDupla = false; Object.keys(localStorage).filter(k => k.startsWith('quota-ficticia-')).forEach(k => localStorage.removeItem(k)); });
    const recuperou = await f.ate(async () => (await ler(A)).feito['T:dupla-falha'], 15000);
    const r = await ler(A);
    console.log('DIAGNÓSTICO dupla-falha: ' + JSON.stringify({ aceito, semReserva, falhou, recuperou, checkpoint: r.feito, atividade: r.act[hj] }));
    if (!aceito || !semReserva || !falhou || !recuperou || r.act[hj] !== 3) throw new Error('Operação aceita não foi confirmada após recuperar armazenamento.');
    const d = await ctx.newCDPSession(A), caiu = A.waitForEvent('crash'); d.send('Page.crash').catch(() => null); await caiu; await A.close();
    const B = await f.pagina(ctx); const voltou = await f.ate(async () => { const s = await f.estado(B); return s.feito['T:base'] && s.feito['T:dupla-falha'] && s.act[hj] === 3; });
    if (!voltou) throw new Error('Checkpoint recuperado não sobreviveu à queda.');
    console.log('✓ quota real + abort IDB: aviso sem falsa confirmação, recuperação automática, 3/3 e crash.');
  } finally { await ctx.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
