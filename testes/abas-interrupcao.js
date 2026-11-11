/* Escrita interrompida entre abas, com pontos de parada reais do Chromium (equivalente, para curso/app/14-abas.js, ao
   cenário "escrita-interrompida" de testes/f01-riscos.test.js do Codex, que mira linhas do código anterior). Nada é
   falsificado (getItem, setItem e o conteúdo são os reais):
   1. a aba A pega a trava, LÊ a cópia principal e para ali (ponto de parada logo depois da leitura);
   2. a aba B marca, grava o diário dela (durável) e FECHA, sem conseguir a trava;
   3. A continua, GRAVA a cópia principal sem a marcação de B, para logo depois do setItem e FECHA, sem processar mais nada;
   4. a aba C abre: tem de ter as duas marcações (o diário órfão de B é absorvido).
   Se as linhas do trecho crítico mudarem, o teste falha explicitamente (não se adapta sozinho). Usado por
   testes/plataforma.test.js. */
const fs = require('fs'), path = require('path');
module.exports = async function testarInterrupcao({ b, srv, saida, base, ok }) {
  console.log('\n== escrita interrompida entre abas (pontos de parada reais do Chromium)');
  const K = 'missao-eear-v1', tem = (s, k) => !!(s && s.feito && s.feito[k]);
  const linhas = fs.readFileSync(path.join(saida, 'app.js'), 'utf8').split('\n');
  const leitura = linhas.findIndex(l => l === '    let txt0 = null; try { txt0 = localStorage.getItem(k); } catch (e) { return; }');
  const escrita = linhas.findIndex(l => l === '      gravouLocal = true; txt = novo;');
  if (leitura < 0 || escrita < 0) { ok(false, 'escrita interrompida: os pontos de parada do trecho crítico não foram encontrados (revisar o teste; não adaptar sozinho)'); return; }
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const clicar = (p, a, d) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d || {}); document.body.appendChild(x); x.click(); x.remove(); }, [a, d]);
  const estado = async p => { await clicar(p, 'tab', { v: 'plano' }); await clicar(p, 'expcopiar'); await p.waitForSelector('#exp-txt'); return JSON.parse(await p.locator('#exp-txt').inputValue()); };
  try {
    const A = await ctx.newPage(); await A.goto(srv.url);
    await A.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [K, Object.assign(base({}), { t: Date.now() - 60000, feito: { 'T:base': true } })]);
    await A.reload(); await A.waitForTimeout(400);
    const B = await ctx.newPage(); await B.goto(srv.url); await B.waitForTimeout(400);
    const cdp = await ctx.newCDPSession(A); await cdp.send('Debugger.enable');
    const url = new URL('app.js', A.url()).href;
    const bp1 = await cdp.send('Debugger.setBreakpointByUrl', { url, lineNumber: leitura + 1 });
    await cdp.send('Debugger.setBreakpointByUrl', { url, lineNumber: escrita + 1 });
    const pausa = () => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('ponto de parada não atingido')), 10000); cdp.once('Debugger.paused', r => { clearTimeout(t); res(r); }); });
    let p = pausa(); const marcandoA = clicar(A, 'marcar', { k: 'T:A-race' }).catch(() => null); await p; // A leu e parou, com a trava
    await Promise.race([clicar(B, 'marcar', { k: 'T:B-race' }), new Promise((_, rej) => setTimeout(() => rej(new Error('outra aba presa pelo depurador')), 10000))]);
    const diarioB = await B.evaluate(() => Object.keys(localStorage).filter(k => k.indexOf('missao-eear-v1-diario#') === 0).map(k => localStorage.getItem(k)).some(v => v.indexOf('T:B-race') >= 0));
    await B.close(); await cdp.send('Debugger.removeBreakpoint', { breakpointId: bp1.breakpointId });
    p = pausa(); await cdp.send('Debugger.resume'); await p; // A gravou a cópia principal (sem T:B-race) e parou logo depois
    const principalSemB = await (async () => { const C0 = await ctx.newPage(); const v = await C0.evaluate(k => JSON.parse(localStorage.getItem(k)), K).catch(() => null); await C0.close(); return v; })();
    await A.close(); await marcandoA;
    /* A fechou parada no depurador: as travas dela são soltas quando o navegador termina de descartar a página, e a
       absorção do diário de B espera a trava. Espera (até 10 s) e registra quanto levou; o que importa é não perder. */
    const C = await ctx.newPage(); await C.goto(srv.url);
    const t0 = Date.now(); let s = null, cache = null;
    while (Date.now() - t0 < 10000) { cache = await C.evaluate(k => JSON.parse(localStorage.getItem(k)), K); if (tem(cache, 'T:B-race')) break; await C.waitForTimeout(200); }
    const ms = Date.now() - t0; s = await estado(C);
    ok(diarioB && tem(s, 'T:A-race') && tem(s, 'T:B-race') && tem(cache, 'T:A-race') && tem(cache, 'T:B-race') && tem(cache, 'T:base'),
      `escrita interrompida: A leu, B gravou o diário e fechou, A gravou por cima e fechou; a aba que abre tem as duas marcações [diário de B: ${diarioB}; principal depois de A: ${principalSemB ? Object.keys(principalSemB.feito) : '?'}; aberta: ${Object.keys(s.feito)}; absorvido em ${ms} ms]`);
  } catch (e) { ok(false, 'escrita interrompida: o cenário não terminou — ' + e.message); } finally { await ctx.close(); }
};
