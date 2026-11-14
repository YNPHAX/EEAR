/* Transação de exclusão abortada de verdade após o corte; duas importadoras do mesmo backup identificado.
   Dois Page.crash reais, nenhuma alteração de fonte. Esperado: base preservada + IDs importados uma vez. */
const fs = require('fs'), path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), hj = new Date().toISOString().slice(0, 10);
(async () => {
  const f = await fixture.abrir(alvo), origem = await f.contexto(), c = await f.contexto(); let d, bp;
  const bloquear = ctx => ctx.route(/http:\/\/127\.0\.0\.1:(8280|9299)\//, r => r.abort());
  const cair = async p => { const cd = await c.newCDPSession(p), crash = p.waitForEvent('crash'); cd.send('Page.crash').catch(() => null); await crash; await p.close(); };
  try {
    await bloquear(origem); await bloquear(c); await c.addInitScript(() => Object.defineProperty(navigator, 'locks', { value: undefined }));
    const O = await f.pagina(origem), cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'ABORT-CERT', o: 'curso', t: 1792195200000 };
    await f.importar(O, { v: 1, cfg: { nome: 'Origem Fictícia', certs: [cert] }, act: { [hj]: 5 }, feito: { 'T:importada-abort': true } });
    const backup = await f.estado(O); assert(backup.cfg._ops);
    const A = await f.pagina(c); await f.importar(A, { v: 1, cfg: { nome: 'Base Fictícia' }, act: { [hj]: 2 }, feito: { 'T:base-abort': true } });
    await A.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado');
    const B = await f.pagina(c), C = await f.pagina(c); for (const p of [B, C]) assert.strictEqual((await f.estado(p)).act[hj], 2);
    d = await c.newCDPSession(A); await d.send('Debugger.enable');
    const lineNumber = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n').findIndex(l => l.includes('if (resultado !== undefined)'));
    assert(lineNumber >= 0); bp = await d.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', A.url()).href, lineNumber, condition: 'resultado && resultado.apagado === true && (!q.result || q.result.gen !== resultado.gen)' });
    const parar = new Promise((r, j) => { const t = setTimeout(() => j(new Error('Exclusão não alcançou corte')), 15000); d.once('Debugger.paused', p => { clearTimeout(t); r(p); }); });
    await f.clicar(A, 'dadosapagar'); const apagando = f.clicar(A, 'dadosapagarok').catch(() => null); const pausa = await parar;
    for (const p of [B, C]) { await f.importar(p, backup); assert.strictEqual((await f.estado(p)).act[hj], 7); }
    const reservas = await C.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('missao-eear-v1-diario#')).map(k => JSON.parse(localStorage.getItem(k))));
    assert(reservas.length >= 2); await cair(B);
    await d.send('Debugger.evaluateOnCallFrame', { callFrameId: pausa.callFrames[0].callFrameId, expression: 't.abort()' });
    await d.send('Debugger.removeBreakpoint', { breakpointId: bp.breakpointId }); bp = null; await d.send('Debugger.resume'); await apagando;
    const esperado = s => s.act[hj] === 7 && s.feito['T:base-abort'] && s.feito['T:importada-abort'] && s.cfg.certs.filter(x => x.c === cert.c).length === 1;
    const D = await f.pagina(c); let s; assert(await f.ate(async () => { s = await f.estado(D); return esperado(s) && await D.locator('#sync').getAttribute('data-local') === 'confirmado'; }));
    assert(!(await A.locator('body').innerText()).includes('Os dados deste aparelho foram apagados.'));
    await cair(C); await D.close(); const E = await f.pagina(c); const final = await f.estado(E); assert(esperado(final));
    console.log('✓ Exclusão abortada + duas importações identificadas + dois Page.crash: 7/7, base e certificado preservados, nenhuma confirmação falsa de exclusão.');
  } finally { if (d && bp) { await d.send('Debugger.removeBreakpoint', { breakpointId: bp.breakpointId }).catch(() => null); await d.send('Debugger.resume').catch(() => null); } await origem.close(); await c.close(); await f.fechar(); }
})().catch(e => { console.error('PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
