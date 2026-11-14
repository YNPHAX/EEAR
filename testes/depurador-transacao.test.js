/* Controle do laboratório: pausa JS dentro de uma transação mantém a fila IDB bloqueada.
   Sem emulador/serviço: todas as rotas Firebase são abortadas; bundle publicado inalterado. */
const path = require('path'), fs = require('fs'), assert = require('assert'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  const f = await fixture.abrir(alvo), ctx = await f.contexto();
  try {
    await ctx.route(/http:\/\/127\.0\.0\.1:(8180|9199)\//, r => r.abort());
    const A = await f.pagina(ctx); await f.importar(A, { v: 1, cfg: { nome: 'Controle Fictício' }, feito: { 'T:base': true } });
    await A.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado');
    const B = await f.pagina(ctx); await B.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado');
    const linhas = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n');
    const linha = linhas.findIndex(l => l.includes('resultado = editar(q.result || null, t);')); assert(linha >= 0);
    const d = await ctx.newCDPSession(B); await d.send('Debugger.enable');
    const parada = new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Controle não pausou transação real')), 10000); d.once('Debugger.paused', x => { clearTimeout(t); resolve(x); }); });
    const bp = await d.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', B.url()).href, lineNumber: linha });
    const ponto = await parada;
    const q = await d.send('Debugger.evaluateOnCallFrame', { callFrameId: ponto.callFrames[0].callFrameId, expression: 'q.readyState', returnByValue: true });
    assert.strictEqual(q.result.value, 'done');
    await A.evaluate(() => {
      window.__controleIDB = { terminou: false, erro: '' };
      const o = window.indexedDB.open('eear-operacoes', 1);
      o.onerror = () => { window.__controleIDB.erro = String(o.error); };
      o.onsuccess = () => { const db = o.result, t = db.transaction(['contas', 'quarentena'], 'readwrite'); t.oncomplete = () => { window.__controleIDB.terminou = true; db.close(); }; t.onabort = t.onerror = () => { window.__controleIDB.erro = String(t.error); db.close(); }; };
    });
    await A.waitForTimeout(250);
    assert.deepStrictEqual(await A.evaluate(() => window.__controleIDB), { terminou: false, erro: '' });
    await d.send('Debugger.removeBreakpoint', { breakpointId: bp.breakpointId }); await d.send('Debugger.resume'); await d.send('Debugger.disable');
    await A.waitForFunction(() => window.__controleIDB.terminou || window.__controleIDB.erro);
    assert.deepStrictEqual(await A.evaluate(() => window.__controleIDB), { terminou: true, erro: '' });
    assert((await f.estado(A)).feito['T:base']);
    console.log('✓ Controle: pausa em transação real bloqueou a barreira de outra aba; retomar liberou a fila sem alterar o checkpoint.');
  } finally { await ctx.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
