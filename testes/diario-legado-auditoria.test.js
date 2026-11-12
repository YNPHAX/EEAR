/* Migração de diário produzido pelo runtime antigo, sem reescrever seu formato.
   EEAR_REPO_LEGADO=<snapshot 8bd32d2>; demais variáveis da fixture F01.
   A alteração passa pelo handler real, fica fora da principal e sofre Page.crash.
   Três abas do candidato devem recuperá-la uma única vez. Sem Firebase real. */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const legado = process.env.EEAR_REPO_LEGADO;
(async () => {
  if (!legado) throw new Error('Defina EEAR_REPO_LEGADO: o teste não fabrica diários legados.');
  const js = fs.readFileSync(path.join(legado, 'curso/app.js'), 'utf8');
  console.log('Migração independente: ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: legado, encoding: 'utf8' }).trim() + ' → ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'diario-legado-auditoria.test.js'))) return;
  const f = await fixture.abrir(alvo), ctx = await f.contexto(), hj = new Date().toISOString().slice(0, 10);
  try {
    await ctx.addInitScript(() => Object.defineProperty(navigator, 'locks', { get: () => undefined, configurable: true }));
    await ctx.route('**/app.js', r => r.fulfill({ contentType: 'text/javascript', body: js }));
    const A = await f.pagina(ctx);
    await f.importar(A, { v: 1, t: Date.now() - 20000, cfg: { nome: 'Legado Fictício', certs: [] }, feito: { 'T:base': true }, act: { [hj]: 2 } });
    if (!await f.ate(() => A.evaluate(() => !!JSON.parse(localStorage.getItem('missao-eear-v1')).feito['T:base']))) throw new Error('A principal inicial não foi confirmada.');
    await f.estado(A); // deixa a exportação visível para conferir o aceite antes da interrupção
    const linhas = js.split('\n'), lineNumber = linhas.findIndex(l => l === '    const k = chave(LS);');
    if (lineNumber < 0) throw new Error('Revisar ponto nativo de consolidação no snapshot antigo.');
    const cdp = await ctx.newCDPSession(A); await cdp.send('Debugger.enable');
    await cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', A.url()).href, lineNumber, condition: '!!S.feito["T:legado"]' });
    const parou = new Promise((r, reject) => { const t = setTimeout(() => reject(new Error('Breakpoint não atingido')), 10000); cdp.once('Debugger.paused', p => { clearTimeout(t); r(p); }); });
    await f.clicar(A, 'marcar', { k: 'T:legado' });
    const pausa = await parou;
    const r = await cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: pausa.callFrames[0].callFrameId, returnByValue: true,
      expression: '({principal:JSON.parse(localStorage.getItem(chave(LS))),diario:JSON.parse(localStorage.getItem(chaveDiario(loc.tab))),UI:JSON.parse(document.getElementById("exp-txt").value)})' });
    const antes = r.result.value;
    if (!antes.UI.feito['T:legado'] || !antes.diario.st.feito['T:legado'] || antes.principal.feito['T:legado']) throw new Error('Não comprovou aceite na UI e diário antigo pendente.');
    const caiu = A.waitForEvent('crash', { timeout: 10000 }); cdp.send('Page.crash').catch(() => null); await caiu; await A.close();
    await ctx.unroute('**/app.js');
    const paginas = await Promise.all([f.pagina(ctx), f.pagina(ctx), f.pagina(ctx)]);
    const correto = s => s && s.feito['T:base'] && s.feito['T:legado'] && s.act[hj] === 3;
    const recuperou = await f.ate(async () => { for (const p of paginas) if (!correto(await f.estado(p))) return false; return true; });
    const estados = await Promise.all(paginas.map(f.estado)); await Promise.all(paginas.map(p => p.close()));
    const C = await f.pagina(ctx), reaberto = await f.estado(C), passou = recuperou && correto(reaberto);
    console.log(`${passou ? '✓' : '✗'} diario-legado-tres-abas: ${JSON.stringify({ aceiteAntigo: true, camposLegados: Object.keys(antes.diario), semTs: antes.diario.ts === undefined, semAnt: antes.diario.ant === undefined, recuperou, contagens: estados.map(s => s.act[hj]), reaberto: reaberto.act[hj], feito: reaberto.feito })}`);
    process.exitCode = passou ? 0 : 1;
  } catch (e) { console.log('✗ FALHA DE PREPARAÇÃO/EXECUÇÃO: ' + e.message); process.exitCode = 1; }
  finally { await ctx.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
