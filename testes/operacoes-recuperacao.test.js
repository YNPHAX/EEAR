/* Autoauditoria da durabilidade: indisponibilidade transitória, checkpoint corrompido e exclusão confirmada.
   IndexedDB real, dados fictícios e somente emuladores. Não substitui os testes de queda de processo. */
const path = require('path'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'operacoes-recuperacao.test.js'))) return;
  console.log('Preparando autoauditoria de recuperação');
  const f = await fixture.abrir(alvo); let falhas = 0;
  const ok = (cond, nome, detalhes) => { if (!cond) falhas++; console.log(`${cond ? '✓' : '✗'} ${nome}: ${JSON.stringify(detalhes)}`); };
  const ler = p => p.evaluate(async () => {
    if (!(await window.indexedDB.databases()).some(d => d.name === 'eear-operacoes')) return { principal: null, copias: [] };
    return new Promise((resolve, reject) => {
    const o = window.indexedDB.open('eear-operacoes', 1); o.onerror = () => reject(o.error);
    o.onupgradeneeded = () => { o.transaction.abort(); reject(new Error('Leitura da sonda não pode criar banco.')); };
    o.onsuccess = () => { const db = o.result; try { const t = db.transaction(['contas', 'quarentena'], 'readonly'), q = t.objectStore('contas').get(''), c = t.objectStore('quarentena').getAll(); t.oncomplete = () => { db.close(); resolve({ principal: q.result, copias: c.result }); }; } catch (e) { db.close(); reject(e); } };
    });
  });
  try {
    {
      const ctx = await f.contexto();
      try {
        await ctx.addInitScript(() => {
          const real = window.indexedDB; window.__bdDisponivel = false;
          Object.defineProperty(window, 'indexedDB', { configurable: true, get() { if (!window.__bdDisponivel) throw new window.DOMException('Indisponibilidade transitória fictícia', 'SecurityError'); return real; } });
        });
        console.log('Abrindo com IndexedDB indisponível');
        const A = await f.pagina(ctx); console.log('App carregado'); await f.importar(A, { v: 1, cfg: { nome: 'Recuperação Fictícia' }, feito: { 'T:base': true } });
        console.log('Importação preparada'); await f.clicar(A, 'marcar', { k: 'T:durante-indisponibilidade' }); console.log('Estudo aceito');
        const aviso = await A.locator('#sync').innerText();
        await A.evaluate(() => { window.__bdDisponivel = true; }); console.log('IndexedDB restabelecido');
        const confirmou = await f.ate(async () => { const d = await ler(A); return d.principal && d.principal.st.feito['T:durante-indisponibilidade'] && !(await A.locator('#sync').innerText()).includes('sem proteção contra queda'); });
        // Fecha o renderer após confirmação; a página nova mantém a indisponibilidade, depois recupera o mesmo IDB.
        await A.close(); const B = await f.pagina(ctx); await B.evaluate(() => { window.__bdDisponivel = true; });
        const reabriu = await f.ate(async () => { const s = await f.estado(B); return s.feito['T:base'] && s.feito['T:durante-indisponibilidade']; });
        ok(/sem proteção contra queda/.test(aviso) && confirmou && reabriu, 'indexeddb-restabelecido', { aviso, confirmou, reabriu });
      } finally { await ctx.close(); }
    }
    {
      const ctx = await f.contexto();
      try {
        const A = await f.pagina(ctx); await f.importar(A, { v: 1, cfg: { nome: 'Pessoa Fictícia Corrompida' }, feito: { 'T:preservar': true } });
        if (!await f.ate(async () => { const d = await ler(A); return d.principal && d.principal.st.feito['T:preservar']; })) throw new Error('Preparação não confirmou checkpoint.');
        // Página sem app impede consolidação durante a preparação da corrupção.
        await A.goto(new URL('__preparar-corrupcao-sem-app', A.url()).href);
        const bruto = await A.evaluate(() => new Promise(resolve => {
          const o = window.indexedDB.open('eear-operacoes', 1); o.onsuccess = () => { const db = o.result, t = db.transaction('contas', 'readwrite'), st = t.objectStore('contas'), q = st.get('');
            q.onsuccess = () => { q.result.meta = { v: 99, pessoal: 'Pessoa Fictícia Corrompida' }; st.put(q.result, ''); };
            t.oncomplete = () => { db.close(); resolve(true); };
          };
        }));
        await A.goto(new URL('/', A.url()).href); await f.clicar(A, 'marcar', { k: 'T:recusada' });
        const d = await ler(A), aviso = await A.locator('#sync').innerText();
        const preservou = bruto && d.principal.meta.v === 99 && d.copias.some(c => c.texto.includes('Pessoa Fictícia Corrompida'));
        const aceitou = (await f.estado(A)).feito['T:recusada'];
        ok(preservou && !aceitou && /não está sendo salvo/.test(aviso), 'checkpoint-corrompido-preservado', { preservou, aceitou: !!aceitou, aviso });
        await f.clicar(A, 'dadosapagar'); await f.clicar(A, 'dadosapagarok');
        const apagou = await f.ate(async () => { const x = await ler(A); return x.principal.apagado && !JSON.stringify(x).includes('Pessoa Fictícia Corrompida'); });
        const cacheLimpo = await A.evaluate(() => !Object.keys(localStorage).filter(k => k.startsWith('missao-eear-v1')).some(k => (localStorage.getItem(k) || '').includes('Pessoa Fictícia Corrompida')));
        ok(apagou && cacheLimpo, 'exclusao-confirmada-elimina-quarentena', { apagou, cacheLimpo });
        const futuro = { v: 1, cfg: { nome: 'Cópia Futura Fictícia', _ops: { v: 99 } }, feito: { 'T:futura': true } };
        await f.importar(A, futuro);
        const importou = (await f.estado(A)).feito['T:futura'];
        const copia = await A.evaluate(() => localStorage.getItem('missao-eear-v1-recuperar'));
        ok(!importou && copia === JSON.stringify(futuro), 'importacao-incompativel-preservada', { importou: !!importou, preservou: copia === JSON.stringify(futuro) });
      } finally { await ctx.close(); }
    }
  } finally { await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error('FALHA DE PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
