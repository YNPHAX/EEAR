/* Preservação do progresso: um progresso gravado por outra versão do curso abre igual nesta versão
   e continua inteiro depois que o app grava de novo.
   Uso: node testes/progresso.test.js [pasta_do_projeto] [fixture.json ...]
   Sem fixture, usa todas as de testes/fixtures/. Para gerar uma fixture de outra versão:
   node testes/ferramentas/gerar-fixture.js <pasta_do_projeto_da_versao> <saida.json> */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { RAIZ, relatorio, montar, carregarDados, servir } = require('./lib/base');

const META = 0.8;

async function testarProgresso(fonte = RAIZ, fixtures = null) {
  const r = relatorio('Preservação do progresso do aluno');
  const pasta = path.join(__dirname, 'fixtures');
  fixtures = fixtures && fixtures.length ? fixtures : fs.readdirSync(pasta).filter(f => f.endsWith('.json')).map(f => path.join(pasta, f));
  const { EEAR } = carregarDados(fonte);
  const ids = new Set(EEAR.modulos.map(m => m.id));
  const site = montar(fonte);
  const srv = await servir(site.destino);
  const b = await chromium.launch();
  try {
    for (const arq of fixtures) {
      const fx = JSON.parse(fs.readFileSync(arq, 'utf8')), nome = path.basename(arq);
      await r.etapa(nome, async () => {
        const ctx = await b.newContext({ viewport: { width: 390, height: 860 } });
        const p = await ctx.newPage(); const erros = [];
        p.on('pageerror', e => erros.push(e.message));
        await ctx.addInitScript(s => { if (!sessionStorage.getItem('fx')) { localStorage.setItem('missao-eear-v1', s); sessionStorage.setItem('fx', '1'); } }, JSON.stringify(fx.estado));
        await p.goto(srv.url); await p.waitForTimeout(400);
        await p.click('[data-a="tab"][data-v="hoje"]'); await p.waitForTimeout(150);
        const hoje = (await p.locator('main').innerText()).replace(/\s*\n+\s*/g, ' | ');
        const primeiro = (fx.estado.cfg.nome || '').split(' ')[0];
        r.ok(!primeiro || hoje.includes('Missão de hoje, ' + primeiro), `${nome}: abre direto no curso com o nome do aluno`);
        for (const s of ['por', 'ing', 'mat', 'fis']) {
          const dom = EEAR.modulos.filter(m => m.m === s && fx.estado.mod[m.id] && fx.estado.mod[m.id].best >= META).length;
          r.ok(new RegExp(`${dom}/${EEAR.modulos.filter(m => m.m === s).length} dominados`).test(hoje), `${nome}: ${s} com ${dom} aulas dominadas`);
        }
        await p.click('[data-a="tab"][data-v="simulados"]'); await p.waitForTimeout(150);
        const linhas = await p.locator('table tr').count();
        r.ok(linhas >= fx.estado.sims.length, `${nome}: histórico mostra os ${fx.estado.sims.length} simulados`);
        // o app grava de novo (revisão de cartões de outra aula) e nada do progresso antigo se perde
        const m = EEAR.modulos.find(x => !Object.keys(fx.estado.fc).some(k => k.startsWith(x.id + '~')));
        await p.click('[data-a="tab"][data-v="materias"]'); await p.waitForTimeout(80);
        await p.click(`[data-a="mat"][data-s="${m.m}"]`); await p.waitForTimeout(80);
        await p.click(`[data-id="${m.id}"]`); await p.waitForTimeout(120);
        await p.click('[data-a="aba"][data-aba="cards"]'); await p.waitForTimeout(80);
        await p.click('[data-a="fcmod"]'); await p.waitForTimeout(120);
        await p.click('[data-a="fcvirar"]'); await p.waitForTimeout(40); await p.click('[data-a="fcaval"][data-ok="1"]'); await p.waitForTimeout(200);
        const depois = await p.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1')));
        const perdidos = [];
        for (const k of ['mod', 'fc', 'erros', 'feito', 'act', 'aula']) Object.entries(fx.estado[k] || {}).forEach(([id, v]) => {
          if (k === 'mod' && !ids.has(id)) return;
          if (JSON.stringify((depois[k] || {})[id]) !== JSON.stringify(v)) perdidos.push(`${k}.${id}`);
        });
        if (JSON.stringify(depois.sims) !== JSON.stringify(fx.estado.sims)) perdidos.push('sims');
        ['nome', 'horas', 'prova', 'alvo', 'dias'].forEach(c => { if (JSON.stringify(depois.cfg[c]) !== JSON.stringify(fx.estado.cfg[c])) perdidos.push('cfg.' + c); });
        r.igual(perdidos, [], `${nome}: depois de gravar de novo, nada do progresso antigo se perdeu`);
        const descartados = Object.keys(fx.estado).filter(k => !(k in depois));
        if (descartados.length) r.nota(`${nome}: campos que esta versão não conhece e descarta: ${descartados.join(', ')}`);
        const semAula = Object.keys(fx.estado.mod).filter(id => !ids.has(id));
        if (semAula.length) r.nota(`${nome}: notas de aulas que não existem nesta versão (ficam guardadas, sem aparecer): ${semAula.join(', ')}`);
        r.igual(erros, [], `${nome}: sem erros de JavaScript`);
        await ctx.close();
      });
    }
  } finally { await b.close(); srv.fechar(); }
  return r;
}

if (require.main === module) {
  testarProgresso(path.resolve(process.argv[2] || RAIZ), process.argv.slice(3).map(f => path.resolve(f))).then(r => { r.imprimir(); process.exit(r.falhas() ? 1 : 0); });
}
module.exports = { testarProgresso };
