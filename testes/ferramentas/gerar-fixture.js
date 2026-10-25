/* Gera uma fixture de progresso usando uma versão do curso como um aluno usaria:
   nome, plano ajustado, quizzes, flashcards, simulado entregue e caderno de erros.
   Uso: node testes/ferramentas/gerar-fixture.js <pasta_do_projeto_da_versao> <saida.json> [descricao] */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { montar, servir } = require('../lib/base');

(async () => {
  const [fonte, saida, descricao] = [path.resolve(process.argv[2]), path.resolve(process.argv[3]), process.argv[4] || ''];
  const site = montar(fonte), srv = await servir(site.destino);
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 860 } })).newPage();
  const clica = async (s, w = 80) => { await p.click(s); await p.waitForTimeout(w); };
  await p.goto(srv.url); await p.waitForTimeout(300);
  await p.fill('#ini-nome', 'Joana Ribeiro'); await clica('[data-a="comecar"]', 200);
  // plano: 2 horas por dia, sem domingo
  await clica('[data-a="tab"][data-v="plano"]', 150);
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('missao-eear-v1')); s.cfg.horas = 2; s.cfg.dias = [1, 2, 3, 4, 5, 6]; s.t = Date.now(); localStorage.setItem('missao-eear-v1', JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(300);
  // quizzes de duas aulas (as respostas vão para a nota e o caderno de erros)
  for (const [s, id] of [['por', 'POR01'], ['mat', 'MAT03']]) {
    await clica('[data-a="tab"][data-v="materias"]'); await clica(`[data-a="mat"][data-s="${s}"]`); await clica(`[data-id="${id}"]`, 120);
    await clica('[data-a="aba"][data-aba="quiz"]'); await clica('[data-a="quizmod"]', 120);
    for (let i = 0; i < 20 && await p.locator('[data-a="qresp"]').count(); i++) { await clica(`[data-a="qresp"][data-p="${i % 4}"]`, 40); await clica('[data-a="qprox"]', 40); }
  }
  // uma aula dominada (80% ou mais), como quem já estudou
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('missao-eear-v1')); s.mod.POR02 = { best: 0.9, last: 0.9, tent: 1, ok: '2026-10-24', lido: '2026-10-23' }; s.t = Date.now(); localStorage.setItem('missao-eear-v1', JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(300);
  // flashcards de uma aula
  await clica('[data-a="tab"][data-v="materias"]'); await clica('[data-a="mat"][data-s="por"]'); await clica('[data-id="POR01"]', 120);
  await clica('[data-a="aba"][data-aba="cards"]'); await clica('[data-a="fcmod"]', 120);
  for (let n = 0; n < 30 && await p.locator('[data-a="fcvirar"]').count(); n++) { await clica('[data-a="fcvirar"]', 20); await clica(`[data-a="fcaval"][data-ok="${n % 3 ? 1 : 0}"]`, 20); }
  // simulado de Português entregue
  await clica('[data-a="tab"][data-v="simulados"]'); await clica('[data-a="simini"][data-tipo="materia"][data-s="por"]', 200);
  for (let i = 0; i < 24; i++) { await p.click(`[data-a="simresp"][data-p="${i % 4}"]`); if (i < 23) await p.click('[data-a="simnav"][data-d="1"]'); }
  await clica('[data-a="entregar"]'); await clica('[data-a="entregarok"]', 250);
  const estado = await p.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1')));
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, JSON.stringify({ descricao, gerado: new Date().toISOString().slice(0, 10), estado }, null, 1) + '\n');
  console.log('fixture:', saida, '| aulas com nota:', Object.keys(estado.mod).length, '| cartões:', Object.keys(estado.fc).length, '| simulados:', estado.sims.length, '| erros:', Object.keys(estado.erros).length);
  await b.close(); srv.fechar();
})();
