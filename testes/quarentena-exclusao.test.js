/* Só armazenamento local do Chromium: callback de quarentena atrasado não pode recriar cópia pessoal excluída.
   O transporte Firebase é integralmente bloqueado; a fixture serve apenas HTML/SDK estático e ações de UI. */
const fs = require('fs'), path = require('path'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  const f = await fixture.abrir(alvo), ctx = await f.contexto(); let falhou = false;
  try {
    await ctx.route(/http:\/\/127\.0\.0\.1:(8180|9199)\//, r => r.abort());
    const A = await f.pagina(ctx); await f.importar(A, { v: 1, cfg: { nome: 'Quarentena Fictícia' }, feito: { 'T:base': true } });
    const B = await f.pagina(ctx); await f.estado(B);
    const cdp = await ctx.newCDPSession(A); await cdp.send('Debugger.enable');
    const fonte = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8'), linhas = fonte.split('\n');
    const novo = linhas.findIndex(l => l.includes('transacaoConta(id, (r, t) =>'));
    const lineNumber = novo >= 0 ? novo : linhas.findIndex(l => l.includes("const t = db.transaction('quarentena', 'readwrite'"));
    if (lineNumber < 0) throw new Error('Revisar ponto antes da gravação tardia da quarentena.');
    const bp = await cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', A.url()).href, lineNumber, condition: 'origem.indexOf("quarentena-tardia") >= 0' });
    const parada = new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Não parou o callback de quarentena')), 10000); cdp.once('Debugger.paused', p => { clearTimeout(t); resolve(p); }); });
    const raw = '{"nome":"Pessoa Privada Fictícia","quebrado":';
    await A.evaluate(raw => localStorage.setItem('missao-eear-v1-diario#quarentena-tardia', raw), raw); await parada;
    await f.clicar(B, 'tab', { v: 'plano' }); await B.click('[data-a="dadosapagar"]'); await B.waitForSelector('[data-a="dadosapagarok"]'); await B.click('[data-a="dadosapagarok"]');
    const confirmou = await f.ate(async () => (await B.locator('body').innerText()).includes('Os dados deste aparelho foram apagados.'));
    await cdp.send('Debugger.removeBreakpoint', { breakpointId: bp.breakpointId }); await cdp.send('Debugger.resume');
    await f.ate(async () => !(await f.estado(A)).feito['T:base']);
    const dados = await B.evaluate(() => new Promise((resolve, reject) => {
      const o = window.indexedDB.open('eear-operacoes', 1); o.onerror = () => reject(o.error);
      o.onsuccess = () => { const db = o.result, t = db.transaction('quarentena', 'readonly'), q = t.objectStore('quarentena').getAll(); t.oncomplete = () => { db.close(); resolve(q.result); }; };
    }));
    falhou = !confirmou || dados.some(d => d.conta === '');
    console.log(`${falhou ? '✗' : '✓'} quarentena-apos-exclusao: ${JSON.stringify({ confirmou, copiasPessoais: dados.filter(d => d.conta === '').length })}`);
  } finally { await ctx.close(); await f.fechar(); }
  process.exitCode = falhou ? 1 : 0;
})().catch(e => { console.error('FALHA DE PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
