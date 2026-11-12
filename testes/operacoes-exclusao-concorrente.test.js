/* A exclusão já conferiu pendências, mas a transação ainda não terminou. Outra aba aceita estudo e cai.
   Breakpoint nativo após editar(), antes de put(); nenhuma leitura/escrita de Storage é falsificada. */
const fs = require('fs'), path = require('path'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'operacoes-exclusao-concorrente.test.js'))) return;
  const f = await fixture.abrir(alvo), ctx = await f.contexto(); let falhas = 0;
  try {
    const A = await f.pagina(ctx); await f.importar(A, { v: 1, cfg: { nome: 'Exclusão Fictícia' }, feito: { 'T:antiga': true }, act: { [new Date().toISOString().slice(0, 10)]: 2 } });
    const B = await f.pagina(ctx);
    if (!await f.ate(async () => (await f.estado(B)).feito['T:antiga'])) throw new Error('Base não chegou a B.');
    const cdp = await ctx.newCDPSession(A); await cdp.send('Debugger.enable');
    const lineNumber = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n').findIndex(l => l.includes('if (resultado !== undefined)'));
    if (lineNumber < 0) throw new Error('Revisar ponto após última conferência da exclusão.');
    const bp = await cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', A.url()).href, lineNumber, condition: 'resultado && resultado.apagado === true && (!q.result || q.result.gen !== resultado.gen)' });
    const pausa = new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Não interrompeu exclusão')), 10000); cdp.once('Debugger.paused', p => { clearTimeout(t); resolve(p); }); });
    await f.clicar(A, 'dadosapagar'); const apagando = f.clicar(A, 'dadosapagarok').catch(() => null); const ponto = await pausa;
    const prova = await cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: ponto.callFrames[0].callFrameId, expression: '({nova:resultado.gen,anterior:q.result&&q.result.gen,apagado:resultado.apagado})', returnByValue: true });
    console.log('Exclusão após conferir pendências: ' + JSON.stringify(prova.result.value));
    await f.clicar(B, 'marcar', { k: 'T:aceita-depois-da-conferencia' });
    const aceitou = (await f.estado(B)).feito['T:aceita-depois-da-conferencia'];
    const reserva = await B.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('missao-eear-v1-diario#') && localStorage.getItem(k).includes('T:aceita-depois-da-conferencia')));
    const db = await ctx.newCDPSession(B), caiu = B.waitForEvent('crash'); db.send('Page.crash').catch(() => null); await caiu; await B.close();
    await cdp.send('Debugger.removeBreakpoint', { breakpointId: bp.breakpointId }); await cdp.send('Debugger.resume'); await apagando;
    await f.ate(async () => /apagados|Nada foi apagado/.test(await A.locator('body').innerText()));
    const C = await f.pagina(ctx); let s;
    const recuperou = await f.ate(async () => { s = await f.estado(C); return s.feito['T:aceita-depois-da-conferencia']; }, 10000);
    const mensagem = (await A.locator('body').innerText()).split('\n').filter(x => /apagados|Nada foi apagado/.test(x)).join(' ');
    const esperado = s.feito['T:antiga'] ? 3 : 1, atividade = s.act[new Date().toISOString().slice(0, 10)];
    const passou = aceitou && reserva && recuperou && atividade === esperado;
    if (!passou) falhas++; console.log(`${passou ? '✓' : '✗'} exclusao-apos-ultima-conferencia: ${JSON.stringify({ aceitou, reserva, recuperou, mensagem, feito: s.feito, atividade, esperado })}`);
  } finally { await ctx.close(); await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error('FALHA DE PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
