/* Diários pendentes (curso/app/15-diarios-pendentes.js), com pontos de parada reais do Chromium e queda real da página
   (Page.crash), sem falsificar leituras ou gravações:
   1. sem Web Locks: a aba marca, grava o diário e cai antes de consolidar; a aba que abre depois recupera a marcação
      (F11 de auditoria/firebase-codex-61e1d32.md);
   2. "Apagar os dados deste aparelho" numa aba enquanto outra tem um diário ainda fora da cópia principal: o diário
      pendente não é apagado, e o estudo dele volta depois que a outra aba cai (F10; aqui sem conta, onde apagar não exige
      a nuvem; com conta, o bloqueio da exclusão está em testes/firebase-auditoria.js e na auditoria do Codex).
   Se a linha do ponto de parada mudar, o teste falha explicitamente. Usado por testes/plataforma.test.js. */
const fs = require('fs'), path = require('path');
module.exports = async function testarRecuperacao({ b, srv, saida, base, ok }) {
  console.log('\n== diários pendentes: queda sem Web Locks e exclusão com diário de outra aba');
  const K = 'missao-eear-v1', tem = (s, k) => !!(s && s.feito && s.feito[k]);
  const linha = fs.readFileSync(path.join(saida, 'app.js'), 'utf8').split('\n').findIndex(l => l === '    loc.escritora = true;');
  if (linha < 0) { ok(false, 'diários pendentes: o ponto de parada depois da gravação do diário não foi encontrado (revisar o teste)'); return; }
  const clicar = (p, a, d) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d || {}); document.body.appendChild(x); x.click(); x.remove(); }, [a, d]);
  const exportado = async p => { await clicar(p, 'tab', { v: 'plano' }); await clicar(p, 'expcopiar'); await p.waitForSelector('#exp-txt'); return JSON.parse(await p.locator('#exp-txt').inputValue()); };
  /* Marca k na página p e a faz cair logo depois de gravar o diário (antes de qualquer consolidação). */
  async function marcarECair(ctx, p, k) {
    const cdp = await ctx.newCDPSession(p); await cdp.send('Debugger.enable');
    await cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', p.url()).href, lineNumber: linha + 1 });
    const parou = new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('ponto de parada não atingido')), 10000); cdp.once('Debugger.paused', r => { clearTimeout(t); res(r); }); });
    clicar(p, 'marcar', { k }).catch(() => null); await parou;
    return async () => { const caiu = p.waitForEvent('crash', { timeout: 10000 }); cdp.send('Page.crash').catch(() => null); await caiu; await p.close(); };
  }
  const ate = async (f, ms) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await f()) return true; await new Promise(r => setTimeout(r, 200)); } return false; };
  const semente = () => Object.assign(base({}), { t: Date.now() - 60000, feito: { 'T:base': true } });

  { // 1. sem Web Locks
    const ctx = await b.newContext({ serviceWorkers: 'block' });
    try {
      await ctx.addInitScript(() => Object.defineProperty(navigator, 'locks', { get: () => undefined, configurable: true }));
      const A = await ctx.newPage(); await A.goto(srv.url);
      await A.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [K, semente()]); await A.reload(); await A.waitForTimeout(400);
      const cair = await marcarECair(ctx, A, 'T:sem-trava');
      const B = await ctx.newPage(); await B.goto(srv.url);
      const antes = await B.evaluate(k => JSON.parse(localStorage.getItem(k)), K);
      await cair();
      const t0 = Date.now(), voltou = await ate(async () => tem(await B.evaluate(k => JSON.parse(localStorage.getItem(k)), K), 'T:sem-trava'), 20000);
      const s = await exportado(B);
      ok(!tem(antes, 'T:sem-trava') && voltou && tem(s, 'T:sem-trava') && tem(s, 'T:base'),
        `sem Web Locks: a aba que caiu depois de gravar o diário não perde a marcação; outra aba a recupera [cópia antes: ${!tem(antes, 'T:sem-trava') ? 'sem' : 'com'} a marcação; recuperada em ${Date.now() - t0} ms]`);
    } catch (e) { ok(false, 'sem Web Locks: o cenário não terminou — ' + e.message); } finally { await ctx.close(); }
  }
  { // 2. exclusão com diário pendente de outra aba
    const ctx = await b.newContext({ serviceWorkers: 'block' });
    try {
      const A = await ctx.newPage(); await A.goto(srv.url);
      await A.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [K, semente()]); await A.reload(); await A.waitForTimeout(400);
      const B = await ctx.newPage(); await B.goto(srv.url); await B.waitForTimeout(400);
      const cair = await marcarECair(ctx, B, 'T:pendente');
      await clicar(A, 'tab', { v: 'plano' }); await clicar(A, 'dadosapagar'); await clicar(A, 'dadosapagarok'); await A.waitForTimeout(300);
      const diarios = await A.evaluate(() => Object.keys(localStorage).filter(k => k.indexOf('missao-eear-v1-diario#') === 0).map(k => localStorage.getItem(k)).filter(v => v.indexOf('T:pendente') >= 0).length);
      await cair(); await A.close();
      const C = await ctx.newPage(); await C.goto(srv.url);
      const voltou = await ate(async () => tem(await C.evaluate(k => JSON.parse(localStorage.getItem(k)), K), 'T:pendente'), 20000);
      const s = await exportado(C);
      ok(diarios === 1 && voltou && tem(s, 'T:pendente') && !tem(s, 'T:base'),
        `apagar os dados com um diário pendente de outra aba: o diário fica, e o estudo dele volta depois que a aba cai (o resto continua apagado) [diários com a marcação depois de apagar: ${diarios}; feito: ${Object.keys(s.feito)}]`);
    } catch (e) { ok(false, 'exclusão com diário pendente: o cenário não terminou — ' + e.message); } finally { await ctx.close(); }
  }
};
