/* Inglês por opção do edital: básico (Opção 1, aulas INGB) e intermediário (BCT, aulas INGI).
   Confere a separação (aulas, cartões, erros, provas e simulados), a troca de opção e a preservação do progresso
   de antes da separação (aulas ING01 a ING13).
   Uso: node testes/ingles.test.js [pasta_do_projeto] */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { RAIZ, relatorio, montar, carregarDados, servir } = require('./lib/base');

const NIVEIS = { basico: 'INGB', bct: 'INGI' };
const edicao = id => id.replace(/-bct$/, '');

async function testarIngles(fonte = RAIZ) {
  const r = relatorio('Inglês por opção do edital');
  const { EEAR } = carregarDados(fonte);
  const M = EEAR.modulos, P = EEAR.provas || [];
  const ing = nv => M.filter(m => m.m === 'ing' && (nv ? m.nivel === nv : !m.nivel));
  const ativas = nv => M.filter(m => m.m !== 'ing' || (nv ? m.nivel === nv : !m.nivel));

  // dados
  r.igual(ing(null).map(m => m.id), Array.from({ length: 13 }, (_, i) => 'ING' + String(i + 1).padStart(2, '0')), 'as 13 aulas de antes (ING01 a ING13) continuam no curso');
  for (const [nv, pre] of Object.entries(NIVEIS)) {
    const ms = ing(nv);
    r.ok(ms.length >= 13 && ms.every(m => m.id.startsWith(pre)), `${nv}: ${ms.length} aulas próprias (${ms[0].id} a ${ms[ms.length - 1].id})`);
    r.igual(ms.filter(m => !(EEAR.videoaulas[m.id] || []).length).map(m => m.id), [], `${nv}: toda aula tem videoaula`);
  }
  r.igual(M.filter(m => m.nivel && (m.m !== 'ing' || !NIVEIS[m.nivel])).map(m => m.id), [], 'só aulas de Inglês têm opção, e só "basico" ou "bct"');
  r.igual(P.filter(p => !NIVEIS[p.modalidade]).map(p => p.id), [], `as ${P.length} provas têm opção do edital`);
  r.igual(P.flatMap(p => p.q.filter(q => q.m === 'ing' && !q.mod.startsWith(NIVEIS[p.modalidade])).map(q => p.id + ' q' + q.n)), [], 'o Inglês de cada prova aponta para as aulas da opção dela');
  for (const nv of Object.keys(NIVEIS)) {
    const eds = P.filter(p => p.modalidade === nv).map(p => edicao(p.id));
    r.igual(eds.length, new Set(eds).size, `${nv}: uma prova por edição (Português, Matemática e Física não se repetem no simulado misto)`);
  }

  const site = montar(fonte);
  const srv = await servir(site.destino);
  const b = await chromium.launch();
  const erros = [];
  const nova = async (estado) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 860 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => erros.push('JS: ' + e.message));
    if (estado) await ctx.addInitScript(s => { if (!sessionStorage.getItem('fx')) { localStorage.setItem('missao-eear-v1', s); sessionStorage.setItem('fx', '1'); } }, JSON.stringify(estado));
    await p.goto(srv.url); await p.waitForTimeout(300);
    if (await p.locator('#ini-nome').count()) { await p.fill('#ini-nome', 'Aluna Teste'); await p.click('[data-a="comecar"]'); await p.waitForTimeout(200); }
    return { ctx, p };
  };
  const clica = async (p, s, espera = 80) => { await p.click(s); await p.waitForTimeout(espera); };
  const texto = async p => (await p.locator('main').innerText()).replace(/\s*\n+\s*/g, ' | ');
  const estado = p => p.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1') || 'null'));
  const gravar = async (p, s) => { s.t = Date.now(); await p.evaluate(s => localStorage.setItem('missao-eear-v1', JSON.stringify(s)), s); await p.reload(); await p.waitForTimeout(300); };
  const trilha = async p => { await clica(p, '[data-a="tab"][data-v="materias"]'); await clica(p, '[data-a="mat"][data-s="ing"]'); return p.$$eval('.trow', bs => bs.map(x => x.dataset.id)); };
  const provasListadas = async p => { await clica(p, '[data-a="tab"][data-v="simulados"]'); return p.$$eval('[data-a="simini"][data-tipo="prova"]', bs => bs.map(x => x.dataset.s)); };
  const simulado = async (p, tipo) => {
    await clica(p, '[data-a="tab"][data-v="simulados"]');
    await clica(p, `[data-a="simini"][data-tipo="${tipo}"]`, 250);
    const ids = (await estado(p)).ativo.ids;
    await clica(p, '[data-a="descartar"]'); await clica(p, '[data-a="descartarok"]', 150);
    return ids;
  };
  const trocar = async (p, nv) => { await clica(p, '[data-a="tab"][data-v="plano"]'); await p.selectOption('#cfg-nivel', nv); await p.waitForTimeout(150); };

  try {
    // aluno novo, sem opção: nada é escolhido sozinho
    await r.etapa('sem opção escolhida', async () => {
      const { ctx, p } = await nova();
      r.ok(/Qual é a sua opção no edital\?/.test(await texto(p)), 'a tela Hoje pergunta a opção do edital');
      r.ok(!(await estado(p)).cfg.modalidade, 'nenhuma opção escolhida sozinha');
      r.igual(await trilha(p), ing(null).map(m => m.id), 'sem opção, a trilha de Inglês é a de antes (ING01 a ING13)');
      r.igual((await provasListadas(p)).sort(), P.map(x => x.id).sort(), 'sem opção, todas as provas aparecem, como antes');
      r.ok(await p.locator('[data-a="simini"][data-tipo="oficial"][disabled]').count() && /escolha a sua opção do edital/i.test(await texto(p)), 'sem opção, o simulado misto pede a escolha (antes ele misturava o inglês das duas opções)');
      await ctx.close();
    });

    // cada opção vê só o que é dela
    for (const [nv, pre] of Object.entries(NIVEIS)) {
      await r.etapa('opção ' + nv, async () => {
        const { ctx, p } = await nova();
        await clica(p, '[data-a="tab"][data-v="hoje"]');
        await clica(p, `[data-a="nivel"][data-n="${nv}"]`, 150);
        r.igual((await estado(p)).cfg.modalidade, nv, `${nv}: escolhida na tela Hoje`);
        r.ok(!/Qual é a sua opção no edital\?/.test(await texto(p)), `${nv}: a pergunta some depois da escolha`);
        r.igual(await trilha(p), ing(nv).map(m => m.id), `${nv}: a trilha de Inglês tem só as aulas ${pre}`);
        const minhas = P.filter(x => x.modalidade === nv).map(x => x.id);
        r.igual((await provasListadas(p)).sort(), minhas.slice().sort(), `${nv}: só as provas da opção (${minhas.join(', ')})`);
        const comp = await simulado(p, 'completo');
        r.ok(comp.filter(id => /^ING/.test(id)).length === 24 && comp.filter(id => /^ING/.test(id)).every(id => id.startsWith(pre)), `${nv}: simulado completo com o Inglês só das aulas ${pre}`);
        const of = await simulado(p, 'oficial');
        const prova = id => id.replace(/^P-/, '').replace(/-\d+$/, '');
        r.ok(of.length === 96 && of.every(id => minhas.includes(prova(id))), `${nv}: simulado misto com as 96 questões só das provas da opção`);
        const chave = id => edicao(prova(id)) + ':' + id.match(/-(\d+)$/)[1];
        r.igual(of.length, new Set(of.map(chave)).size, `${nv}: simulado misto sem a mesma questão duas vezes`);
        // cartões: abrir a teoria de uma aula libera só os cartões dela
        const m = ing(nv)[0];
        await trilha(p); await clica(p, `[data-id="${m.id}"]`); await clica(p, '[data-a="aba"][data-aba="teoria"]');
        await clica(p, '[data-a="tab"][data-v="treino"]');
        r.ok(new RegExp(`${m.fc.length} liberados de ${ativas(nv).reduce((a, x) => a + x.fc.length, 0)}`).test(await texto(p)), `${nv}: cartões contados só das aulas da opção`);
        await ctx.close();
      });
    }

    // trocar de opção não apaga nada, e cada opção guarda o próprio progresso
    await r.etapa('troca de opção', async () => {
      const { ctx, p } = await nova();
      await trocar(p, 'basico');
      const s = await estado(p);
      s.mod.INGB01 = { best: 0.9, last: 0.9, tent: 1, ok: '2026-10-20', lido: '2026-10-19' };
      s.mod.INGI02 = { best: 0.7, last: 0.7, tent: 1, lido: '2026-10-19' };
      await gravar(p, s);
      await trilha(p);
      r.ok(/Dominado · 90%/i.test(await p.locator('[data-id="INGB01"]').innerText()), 'básico: a nota de INGB01 aparece');
      await trocar(p, 'bct');
      await trilha(p);
      r.ok(/70% · refazer/i.test(await p.locator('[data-id="INGI02"]').innerText()), 'BCT: a nota de INGI02 aparece');
      r.ok(!(await p.locator('[data-id="INGB01"]').count()), 'BCT: a aula do básico não aparece');
      await trocar(p, 'basico');
      const depois = await estado(p);
      r.igual([depois.mod.INGB01, depois.mod.INGI02], [s.mod.INGB01, s.mod.INGI02], 'depois de trocar e voltar, o progresso das duas opções continua guardado');
      await ctx.close();
    });

    // caderno de erros: só os da opção aparecem; os outros ficam guardados
    await r.etapa('caderno de erros', async () => {
      const { ctx, p } = await nova();
      const s = await estado(p);
      const bct = P.find(x => x.modalidade === 'bct'), bas = P.find(x => x.modalidade === 'basico');
      const ingBct = bct.q.find(q => q.m === 'ing').n, ingBas = bas.q.find(q => q.m === 'ing').n;
      s.erros = { 'ING01-0': 1, 'INGB01-0': 1, 'INGI01-0': 2, ['P-' + bct.id + '-' + ingBct]: 1, ['P-' + bas.id + '-' + ingBas]: 1 };
      s.cfg.modalidade = 'bct';
      await gravar(p, s);
      await clica(p, '[data-a="tab"][data-v="treino"]');
      r.ok(/Inglês \(2\)/.test(await texto(p)), 'BCT: o caderno mostra só os 2 erros de Inglês da opção (aula INGI e prova BCT)');
      await trocar(p, 'basico');
      await clica(p, '[data-a="tab"][data-v="treino"]');
      r.ok(/Inglês \(2\)/.test(await texto(p)), 'básico: o caderno mostra só os 2 erros de Inglês do básico');
      r.igual(Object.keys((await estado(p)).erros).sort(), Object.keys(s.erros).sort(), 'os erros das outras opções e das aulas antigas continuam guardados');
      await ctx.close();
    });

    // progresso de antes da separação: abre igual e não se perde depois da escolha
    const pasta = path.join(__dirname, 'fixtures');
    for (const arq of fs.readdirSync(pasta).filter(f => f.endsWith('.json'))) {
      await r.etapa(arq, async () => {
        const fx = JSON.parse(fs.readFileSync(path.join(pasta, arq), 'utf8')).estado;
        // um aluno que já estudava Inglês antes da separação
        Object.assign(fx.mod, { ING01: { best: 0.9, last: 0.9, tent: 2, ok: '2026-09-10', lido: '2026-09-09' }, ING05: { best: 0.6, last: 0.6, tent: 1, lido: '2026-09-12' } });
        Object.assign(fx.fc, { 'ING01~0': [2, 20700], 'ING01~3': [0, 20710] });
        Object.assign(fx.erros, { 'ING05-2': 1, 'ING05-7': 2 });
        fx.aula = Object.assign(fx.aula || {}, { ING01: { v: '2026-09-09', e: '2026-09-09' } });
        const { ctx, p } = await nova(fx);
        await clica(p, '[data-a="tab"][data-v="hoje"]', 150);
        const dom = ing(null).filter(m => fx.mod[m.id] && fx.mod[m.id].best >= 0.8).length;
        r.ok(dom > 0 && new RegExp(`${dom}/13 dominados`).test(await texto(p)) && /Qual é a sua opção no edital\?/.test(await texto(p)), `${arq}: antes da escolha, o Inglês mostra o progresso de antes (${dom}/13) e pergunta a opção`);
        await clica(p, '[data-a="tab"][data-v="treino"]');
        r.ok(/Inglês \(2\)/.test(await texto(p)), `${arq}: antes da escolha, os erros de Inglês de antes aparecem no caderno`);
        await clica(p, '[data-a="tab"][data-v="hoje"]');
        await clica(p, '[data-a="nivel"][data-n="bct"]', 200);
        r.ok(new RegExp(`0/${ing('bct').length} dominados`).test(await texto(p)), `${arq}: depois da escolha, o Inglês mostra as aulas da opção (que começam do zero)`);
        // grava de novo (cartão de uma aula nova) e confere que nada de antes mudou
        await trilha(p); await clica(p, '[data-id="INGI01"]'); await clica(p, '[data-a="aba"][data-aba="cards"]'); await clica(p, '[data-a="fcmod"]', 120);
        await clica(p, '[data-a="fcvirar"]', 40); await clica(p, '[data-a="fcaval"][data-ok="1"]', 200);
        const d = await estado(p), perdidos = [];
        for (const k of ['mod', 'fc', 'erros', 'feito', 'act', 'aula', 'ap']) Object.entries(fx[k] || {}).forEach(([id, v]) => { if (JSON.stringify((d[k] || {})[id]) !== JSON.stringify(v)) perdidos.push(k + '.' + id); });
        ['sims', 'ult', 'diag'].forEach(k => { if (k in fx && JSON.stringify(d[k]) !== JSON.stringify(fx[k])) perdidos.push(k); });
        Object.keys(fx.cfg).forEach(k => { if (k !== 'tempoSim' && k !== 'cv' && JSON.stringify(d.cfg[k]) !== JSON.stringify(fx.cfg[k])) perdidos.push('cfg.' + k); });
        r.igual(perdidos, [], `${arq}: depois de escolher a opção e gravar, nada do progresso de antes se perdeu (notas, cartões, erros e vídeos de ING01 a ING13 incluídos)`);
        r.ok(d.cfg.modalidade === 'bct' && Object.keys(d.fc).some(k => k.startsWith('INGI01~')), `${arq}: a opção e o progresso novo ficam no mesmo progresso`);
        if (fx.ult) { await clica(p, '[data-a="tab"][data-v="simulados"]'); await clica(p, '[data-a="go"][data-v="res"]', 150); r.ok(/Correção completa/.test(await texto(p)), `${arq}: a correção do último simulado (de antes) continua abrindo`); }
        await ctx.close();
      });
    }

    // certificado diz o nível
    await r.etapa('certificado', async () => {
      const { ctx, p } = await nova();
      const s = await estado(p);
      s.cfg.modalidade = 'basico';
      ativas('basico').forEach(m => { s.mod[m.id] = { best: 0.9, last: 0.9, tent: 1, ok: '2026-10-21', lido: '2026-10-20' }; });
      await gravar(p, s);
      await clica(p, '[data-a="tab"][data-v="materias"]'); await clica(p, '[data-a="mat"][data-s="ing"]');
      await clica(p, '[data-a="cert"]', 200);
      const t = await texto(p);
      r.ok(/Língua Inglesa \(nível básico\)/.test(t), 'certificado de Inglês diz o nível básico');
      await trocar(p, 'bct');
      await clica(p, '[data-a="tab"][data-v="hoje"]');
      r.ok(!(await p.locator('[data-a="cert"][data-s="geral"]').count()), 'no BCT, o curso completo só libera com as aulas INGI');
      await ctx.close();
    });

    r.igual(erros, [], 'nenhum erro de JavaScript');
  } finally { await b.close(); srv.fechar(); }
  return r;
}

if (require.main === module) {
  testarIngles(path.resolve(process.argv[2] || RAIZ)).then(r => { r.imprimir(); process.exit(r.falhas() ? 1 : 0); });
}
module.exports = { testarIngles };
