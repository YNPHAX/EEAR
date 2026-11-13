/* Autoauditoria independente: abort real de transação, recuperação da reserva e inicialização bloqueada.
   Dados fictícios, app real e armazenamento real do Chromium; nenhuma função interna é exposta. */
const path = require('path'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'operacoes-falhas.test.js'))) return;
  const f = await fixture.abrir(alvo), ctx = await f.contexto(); let falhas = 0;
  try {
    const A = await f.pagina(ctx); await f.importar(A, { v: 1, t: Date.now(), cfg: { nome: 'Falha Fictícia', certs: [] }, feito: { 'T:base': true } });
    await f.ate(() => A.evaluate(() => { const s = JSON.parse(localStorage.getItem('missao-eear-v1') || 'null'); return s && s.feito['T:base']; }));
    await A.evaluate(() => {
      const original = window.IDBObjectStore.prototype.put;
      window.__restaurarPut = () => { window.IDBObjectStore.prototype.put = original; };
      window.IDBObjectStore.prototype.put = function (valor, k) {
        const r = original.call(this, valor, k);
        if (this.name === 'contas' && valor.st && valor.st.feito['T:abortada']) this.transaction.abort();
        return r;
      };
    });
    await f.clicar(A, 'marcar', { k: 'T:abortada' });
    const avisou = await f.ate(async () => /não está sendo salv/.test(await A.locator('#sync').innerText()));
    const antes = await f.estado(A), reserva = await A.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('missao-eear-v1-diario#') && localStorage.getItem(k).includes('T:abortada')));
    await A.evaluate(() => window.__restaurarPut());
    const B = await f.pagina(ctx);
    const recuperou = await f.ate(async () => (await f.estado(B)).feito['T:abortada']);
    await A.close(); await B.close(); const C = await f.pagina(ctx), s = await f.estado(C);
    const passou = avisou && reserva && antes.feito['T:abortada'] && recuperou && s.feito['T:base'] && s.feito['T:abortada'];
    if (!passou) falhas++; console.log(`${passou ? '✓' : '✗'} transacao-abortada: ${JSON.stringify({ avisou, reserva, recuperou, feito: s.feito })}`);
    // Mantém uma transação ativa em página sem app para bloquear a carga de uma aba nova.
    const controle = await ctx.newPage(); await controle.goto(new URL('__controle-sem-app', C.url()).href);
    await controle.evaluate(() => new Promise(resolve => {
      const o = window.indexedDB.open('eear-operacoes', 1);
      o.onsuccess = () => { const db = o.result, t = db.transaction('contas', 'readwrite'), st = t.objectStore('contas'); window.__liberar = false;
        const ciclo = () => { const r = st.get(''); r.onsuccess = () => { if (!window.__liberar) ciclo(); }; }; ciclo();
        t.oncomplete = () => db.close(); resolve();
      };
    }));
    const D = await f.pagina(ctx);
    await D.evaluate(() => { const e = document.createElement('button'); e.dataset.a = 'marcar'; e.dataset.k = 'T:durante-carga'; document.body.appendChild(e); e.click(); e.remove(); });
    const bloqueou = await D.evaluate(() => document.documentElement.dataset.armazenamento === 'carregando' && document.getElementById('app').innerText.includes('Preparando seus dados'));
    await controle.evaluate(() => { window.__liberar = true; }); await controle.close();
    await f.clicar(D, 'marcar', { k: 'T:depois-carga' }); const final = await f.estado(D);
    const carregou = bloqueou && !final.feito['T:durante-carga'] && final.feito['T:depois-carga'] && final.feito['T:abortada'];
    if (!carregou) falhas++; console.log(`${carregou ? '✓' : '✗'} carga-bloqueada: ${JSON.stringify({ bloqueou, feito: final.feito })}`);
  } finally { await ctx.close(); await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error('FALHA DE PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
