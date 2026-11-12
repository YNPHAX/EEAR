/* Escrita de cache atrasada não pode repor dados pessoais depois da exclusão confirmada.
   Para B após seu checkpoint, imediatamente antes do setItem real; A exclui; B retorna. */
const fs = require('fs'), path = require('path'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'operacoes-cache-exclusao.test.js'))) return;
  const f = await fixture.abrir(alvo), ctx = await f.contexto(); let falhou = false;
  try {
    const A = await f.pagina(ctx); await f.importar(A, { v: 1, cfg: { nome: 'Nome Privado Fictício' }, feito: { 'T:antiga': true } });
    const B = await f.pagina(ctx); if (!await f.ate(async () => (await f.estado(B)).feito['T:antiga'])) throw new Error('Não confirmou a base.');
    await f.clicar(B, 'marcar', { k: 'T:checkpoint-B' });
    if (!await f.ate(() => B.evaluate(() => { const s = JSON.parse(localStorage.getItem('missao-eear-v1') || 'null'); return s && s.feito['T:checkpoint-B'] && !Object.keys(localStorage).some(k => k.startsWith('missao-eear-v1-diario#')); }))) throw new Error('A operação de B não concluiu o checkpoint.');
    const obs = await ctx.newCDPSession(A); await obs.send('Debugger.enable'); const suspensa = new Promise(r => obs.once('Debugger.paused', r)); await obs.send('Debugger.pause'); await suspensa;
    const cdp = await ctx.newCDPSession(B); await cdp.send('Debugger.enable');
    const lineNumber = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n').findIndex(l => l.includes('const bruto = JSON.stringify(novo); localStorage.setItem'));
    if (lineNumber < 0) throw new Error('Revisar ponto anterior à escrita real do cache.');
    const bp = await cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', B.url()).href, lineNumber, condition: 'novo.feito["T:checkpoint-B"] === true' });
    const parada = new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Cache não atingiu breakpoint')), 10000); cdp.once('Debugger.paused', p => { clearTimeout(t); resolve(p); }); });
    // Cache ausente é uma condição de preparação; o banco canônico e as APIs de Storage continuam reais.
    await B.evaluate(() => localStorage.removeItem('missao-eear-v1')); await parada;
    await obs.send('Debugger.resume'); await obs.send('Debugger.disable');
    await f.clicar(A, 'tab', { v: 'plano' }); await A.waitForSelector('[data-a="dadosapagar"]');
    await A.click('[data-a="dadosapagar"]'); await A.waitForSelector('[data-a="dadosapagarok"]'); await A.click('[data-a="dadosapagarok"]');
    const confirmouPausada = await f.ate(async () => (await A.locator('body').innerText()).includes('Os dados deste aparelho foram apagados.'), 1500);
    await cdp.send('Debugger.removeBreakpoint', { breakpointId: bp.breakpointId }); await cdp.send('Debugger.resume');
    const confirmou = await f.ate(async () => (await A.locator('body').innerText()).includes('Os dados deste aparelho foram apagados.'));
    // Aguarda a página viva reconciliar o checkpoint apagado; não exige instante arbitrário de recuperação.
    const reconciliou = await f.ate(async () => !(await f.estado(B)).feito['T:checkpoint-B']);
    const C = await f.pagina(ctx), s = await f.estado(C);
    const residuos = await C.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('missao-eear-v1')).filter(k => /Nome Privado Fictício|T:checkpoint-B|T:antiga/.test(localStorage.getItem(k))));
    const serializado = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').includes('transacaoConta(id, atual =>');
    falhou = !confirmou || (serializado && confirmouPausada) || !reconciliou || !!s.feito['T:antiga'] || !!s.feito['T:checkpoint-B'] || residuos.length > 0;
    console.log(`${falhou ? '✗' : '✓'} cache-atrasado-apos-exclusao: ${JSON.stringify({ serializado, confirmouPausada, confirmou, reconciliou, feito: s.feito, residuos })}`);
  } finally { await ctx.close(); await f.fechar(); }
  process.exitCode = falhou ? 1 : 0;
})().catch(e => { console.error('FALHA DE PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
