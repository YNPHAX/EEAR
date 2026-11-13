/* Regressões de interrupção e exclusão na arquitetura IDB. Nenhum get/put falsificado.
   A operação de outra aba está aceita e reservada, mas sua transação é abortada por Page.crash. */
const fs = require('fs'), path = require('path');
module.exports = async function testarRecuperacao({ b, srv, saida, base, ok }) {
  console.log('\n== recuperação e exclusão com transação pendente');
  await require('./abas-interrupcao.js')({ b, srv, saida, base, ok });
  const ctx = await b.newContext({ serviceWorkers: 'block' });
  try {
    await ctx.addInitScript(([k, s]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(s)); Object.defineProperty(navigator, 'locks', { get: () => undefined }); }, ['missao-eear-v1', Object.assign(base({}), { feito: { 'T:base': true } })]);
    const abrir = async () => { const p = await ctx.newPage(); await p.goto(srv.url); await p.waitForFunction(() => document.documentElement.dataset.armazenamento !== 'carregando'); return p; };
    const A = await abrir(), B = await abrir();
    const clicar = (p, a, d = {}) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d); document.body.appendChild(x); x.click(); x.remove(); }, [a, d]);
    const fonte = fs.readFileSync(path.join(saida, 'app.js'), 'utf8'), lineNumber = fonte.split('\n').findIndex(l => l.includes('resultado = editar(q.result || null, t);'));
    if (lineNumber < 0) throw new Error('Revisar ponto nativo da transação.');
    const dbp = await ctx.newCDPSession(B); await dbp.send('Debugger.enable'); const parouB = new Promise(r => dbp.once('Debugger.paused', r)); await dbp.send('Debugger.pause'); await parouB;
    const cdp = await ctx.newCDPSession(A); await cdp.send('Debugger.enable');
    await cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', A.url()).href, lineNumber, condition: '(loc.ops || []).some(o => o.st.feito["T:pendente"]) && !(q.result && q.result.st && q.result.st.feito["T:pendente"])' });
    const pausa = new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Ponto não atingido')), 10000); cdp.once('Debugger.paused', p => { clearTimeout(t); resolve(p); }); });
    const acao = clicar(A, 'marcar', { k: 'T:pendente' }).catch(() => null); await pausa;
    await dbp.send('Debugger.resume'); await dbp.send('Debugger.disable');
    await clicar(B, 'tab', { v: 'plano' }); await clicar(B, 'dadosapagar'); await clicar(B, 'dadosapagarok');
    const reservado = await B.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('missao-eear-v1-diario#') && localStorage.getItem(k).includes('T:pendente')));
    const sucessoPrematuro = (await B.locator('main').innerText()).includes('Os dados deste aparelho foram apagados.');
    const caiu = A.waitForEvent('crash'); cdp.send('Page.crash').catch(() => null); await caiu; await A.close(); await acao;
    const voltou = await B.waitForFunction(() => { const s = JSON.parse(localStorage.getItem('missao-eear-v1') || 'null'); return s && s.feito['T:pendente']; }, null, { timeout: 15000 }).then(() => true).catch(() => false);
    if (!voltou) console.log('DIAGNÓSTICO exclusão pendente: ' + JSON.stringify(await B.evaluate(() => ({ principal: localStorage.getItem('missao-eear-v1'), reservas: Object.keys(localStorage).filter(k => k.startsWith('missao-eear-v1-diario#')).map(k => localStorage.getItem(k)), tela: document.getElementById('app').innerText }))));
    const st = await B.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1')));
    const aviso = await B.locator('main').innerText();
    ok(voltou && reservado && !sucessoPrematuro && st && st.feito['T:pendente'] && aviso.includes('Nada foi apagado'), 'exclusão concorrente não confirma nem apaga operação aceita fora do checkpoint; após crash, a pendência é recuperada');
  } catch (e) { ok(false, 'exclusão com operação pendente: ' + e.message); } finally { await ctx.close(); }
};
