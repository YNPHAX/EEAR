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
  const ctx = await b.newContext({ serviceWorkers: 'block' });
  try {
    const hj = new Date().toISOString().slice(0, 10);
    await ctx.addInitScript(([k, s]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(s)); Object.defineProperty(navigator, 'locks', { get: () => undefined, configurable: true }); Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('exportar'); } } }); }, ['missao-eear-v1', Object.assign(base({}), { feito: { 'T:base': true }, act: { [hj]: 2 } })]);
    const abrir = async () => { const p = await ctx.newPage(); await p.goto(srv.url); await p.waitForFunction(() => document.documentElement.dataset.armazenamento !== 'carregando'); return p; };
    const clicar = (p, a, d = {}) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d); document.body.appendChild(x); x.click(); x.remove(); }, [a, d]);
    const estado = async p => { await clicar(p, 'tab', { v: 'plano' }); await clicar(p, 'expcopiar'); await p.waitForSelector('#exp-txt'); return JSON.parse(await p.locator('#exp-txt').inputValue()); };
    const paginas = [await abrir(), await abrir(), await abrir()];
    const r = await require('./operacoes-interrupcao.js')({ ctx, paginas, clicar, estado, abrir, fonte: fs.readFileSync(path.join(saida, 'app.js'), 'utf8') });
    ok(r.passou, `transação interrompida: três abas, B aceita e preservada por mais de 2s; após crash, ambas as marcações e atividade 4 [${JSON.stringify(r.estado.feito)}]`);
  } catch (e) { ok(false, 'escrita interrompida: ' + e.message); } finally { await ctx.close(); }

};
