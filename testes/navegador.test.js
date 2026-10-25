/* O curso no navegador, como o aluno usa: navegação, aulas, quiz, flashcards, simulados, provas
   com gabarito, certificado, progresso no aparelho, modo offline e telas de vários tamanhos.
   Uso: node testes/navegador.test.js [pasta_do_projeto]   (monta o site numa pasta temporária) */
const path = require('path');
const { chromium } = require('playwright');
const { RAIZ, relatorio, montar, carregarDados, servir } = require('./lib/base');

const EXTERNOS = /youtube|ytimg|gstatic|googleapis|fonts\./;
const ABAS = ['hoje', 'plano', 'materias', 'treino', 'simulados'];

async function testarNavegador(fonte = RAIZ, { larguras = [320, 360, 390, 768, 1024, 1280, 1440] } = {}) {
  const r = relatorio('Curso no navegador');
  const { EEAR } = carregarDados(fonte);
  const M = EEAR.modulos, P = EEAR.provas || [];
  const site = montar(fonte);
  const srv = await servir(site.destino);
  const b = await chromium.launch();
  const erros = [];
  const nova = async (opc = {}) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 860 }, ...opc });
    const p = await ctx.newPage();
    p.on('pageerror', e => erros.push('JS: ' + e.message));
    p.on('requestfailed', q => { if (!EXTERNOS.test(q.url())) erros.push('rede: ' + q.url()); });
    return { ctx, p };
  };
  const clica = async (p, s, espera = 60) => { await p.click(s); await p.waitForTimeout(espera); };
  const texto = async p => (await p.locator('main').innerText()).replace(/\s*\n+\s*/g, ' | ');
  const comecar = async p => { await p.goto(srv.url); await p.waitForTimeout(300); if (await p.locator('#ini-nome').count()) { await p.fill('#ini-nome', 'Aluna Teste'); await clica(p, '[data-a="comecar"]', 200); } };
  const estado = p => p.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1') || 'null'));
  const gravar = (p, s) => p.evaluate(s => localStorage.setItem('missao-eear-v1', JSON.stringify(s)), s);

  try {
    // navegação
    await r.etapa('navegação', async () => {
      const { ctx, p } = await nova();
      await p.goto(srv.url); await p.waitForTimeout(300);
      r.ok(await p.locator('#ini-nome').count(), 'primeira visita abre a página de entrada');
      await comecar(p);
      r.ok(/Missão de hoje, Aluna/.test(await texto(p)), 'depois do nome, abre a tela Hoje com o nome');
      for (const a of ABAS) { await clica(p, `[data-a="tab"][data-v="${a}"]`, 120); r.ok((await texto(p)).length > 50, `aba ${a} abre`); }
      await clica(p, '[data-a="tab"][data-v="materias"]');
      for (const s of ['por', 'ing', 'mat', 'fis']) { await clica(p, `[data-a="mat"][data-s="${s}"]`); r.igual(await p.locator('.trow').count(), M.filter(m => m.m === s).length, `trilha de ${s} com todas as aulas`); }
      await ctx.close();
    });

    // aulas: todas as aulas abrem, com teoria, exemplos, quiz, cartões e vídeo
    await r.etapa('aulas', async () => {
      const { ctx, p } = await nova();
      await comecar(p);
      const semTeoria = [], semVideo = [];
      for (const m of M) {
        await clica(p, '[data-a="tab"][data-v="materias"]', 30); await clica(p, `[data-a="mat"][data-s="${m.m}"]`, 30); await clica(p, `[data-id="${m.id}"]`, 60);
        if (!(await p.locator('#player').count())) semVideo.push(m.id);
        await clica(p, '[data-a="aba"][data-aba="teoria"]', 30);
        if ((await texto(p)).length < 400) semTeoria.push(m.id);
      }
      r.igual(semTeoria, [], `as ${M.length} aulas abrem com teoria`);
      r.igual(semVideo, [], 'toda aula mostra o player de vídeo');
      await clica(p, '[data-a="aba"][data-aba="ex"]'); r.ok((await texto(p)).length > 300, 'aba Exemplos abre');
      await ctx.close();
    });

    // quiz: a nota final bate com as respostas corretas mostradas
    await r.etapa('quiz', async () => {
      const { ctx, p } = await nova();
      await comecar(p);
      const m = M[0];
      await clica(p, '[data-a="tab"][data-v="materias"]'); await clica(p, `[data-a="mat"][data-s="${m.m}"]`); await clica(p, `[data-id="${m.id}"]`);
      await clica(p, '[data-a="aba"][data-aba="quiz"]'); await clica(p, '[data-a="quizmod"]', 120);
      let certas = 0, n = 0;
      while (await p.locator('[data-a="qresp"]').count() && n < 20) {
        await clica(p, `[data-a="qresp"] >> nth=${n % 4}`, 40);
        if (/Correta\./.test(await texto(p))) certas++;
        n++; await clica(p, '[data-a="qprox"]', 40);
      }
      r.igual(n, m.q.length, `quiz de ${m.id} tem ${m.q.length} questões`);
      r.ok((await texto(p)).includes(`${certas} de ${m.q.length}`), `resultado do quiz confere com as respostas (${certas} de ${m.q.length})`);
      const s = await estado(p);
      r.ok(s.mod[m.id] && Math.abs(s.mod[m.id].best - certas / m.q.length) < 1e-9, 'nota do quiz gravada no progresso');
      r.igual(Object.keys(s.erros).length, m.q.length - certas, 'questões erradas foram para o caderno de erros');
      await ctx.close();
    });

    // flashcards
    await r.etapa('flashcards', async () => {
      const { ctx, p } = await nova();
      await comecar(p);
      const m = M[0];
      await clica(p, '[data-a="tab"][data-v="materias"]'); await clica(p, `[data-a="mat"][data-s="${m.m}"]`); await clica(p, `[data-id="${m.id}"]`);
      await clica(p, '[data-a="aba"][data-aba="cards"]'); await clica(p, '[data-a="fcmod"]', 100);
      let n = 0; while (await p.locator('[data-a="fcvirar"]').count() && n < 60) { await clica(p, '[data-a="fcvirar"]', 20); await clica(p, `[data-a="fcaval"][data-ok="${n === 0 ? 0 : 1}"]`, 20); n++; }
      r.igual(n, m.fc.length + 1, `revisão passa por todos os ${m.fc.length} cartões e repete o errado`);
      r.ok(/Revisão concluída/.test(await texto(p)), 'revisão termina com o resumo');
      const s = await estado(p);
      r.igual(Object.keys(s.fc).filter(k => k.startsWith(m.id + '~')).length, m.fc.length, 'cada cartão ganhou data de próxima revisão');
      await ctx.close();
    });

    // simulados: tamanhos, tempos, retomada e descarte
    await r.etapa('simulados', async () => {
      const { ctx, p } = await nova();
      await comecar(p);
      const casos = [['diag', null, 40, null], ['completo', null, 96, '4:00:00'], ['materia', 'mat', 24, '1:00:00']];
      for (const [tipo, s, n, tempo] of casos) {
        await clica(p, '[data-a="tab"][data-v="simulados"]', 100);
        await clica(p, `[data-a="simini"][data-tipo="${tipo}"]${s ? `[data-s="${s}"]` : ''}`, 250);
        r.ok((await p.locator('.simbar').innerText()).includes(`/${n}`), `simulado ${tipo}${s ? ' de ' + s : ''} com ${n} questões`);
        r.igual(await p.locator('#timer').count() ? await p.locator('#timer').innerText() : null, tempo, `simulado ${tipo}: tempo ${tempo || 'sem cronômetro'}`);
        if (tipo === 'completo') {
          for (let i = 0; i < 3; i++) { await clica(p, '[data-a="simresp"] >> nth=0', 30); await clica(p, '[data-a="simnav"][data-d="1"]', 30); }
          await p.reload(); await p.waitForTimeout(300);
          await clica(p, '[data-a="tab"][data-v="hoje"]', 120);
          r.ok(/simulado em andamento/.test(await texto(p)), 'simulado interrompido aparece como em andamento depois de recarregar');
          await clica(p, '[data-a="go"][data-v="sim"]', 150);
          r.ok((await p.locator('.simbar').innerText()).includes('3/96'), 'retoma com as 3 respostas dadas');
        }
        await clica(p, '[data-a="descartar"]'); await clica(p, '[data-a="descartarok"]', 150);
      }
      r.ok(!(await estado(p)).ativo, 'descartar encerra o simulado');
      await ctx.close();
    });

    // provas oficiais: respondidas pelo gabarito dão 10,0; as anuladas valem ponto mesmo erradas
    await r.etapa('provas e gabaritos', async () => {
      const { ctx, p } = await nova();
      await comecar(p);
      for (const pr of P) {
        await clica(p, '[data-a="tab"][data-v="simulados"]', 100);
        await clica(p, `[data-a="simini"][data-tipo="prova"][data-s="${pr.id}"]`, 300);
        const tempo = await p.locator('#timer').innerText();
        for (let i = 0; i < pr.q.length; i++) {
          const q = pr.q[i];
          await p.click(`[data-a="simresp"][data-p="${q.anulada ? (q.c + 1) % 4 : q.c}"]`);
          if (i < pr.q.length - 1) await p.click('[data-a="simnav"][data-d="1"]');
        }
        await clica(p, '[data-a="entregar"]'); await clica(p, '[data-a="entregarok"]', 300);
        const t = await texto(p);
        r.ok(/MÉDIA \| 10,0/.test(t) && (t.match(/24\/24/g) || []).length === 4, `${pr.nome}: gabarito oficial dá 10,0 (anuladas marcadas erradas contam ponto); tempo ${tempo}`);
        r.igual(tempo, `${Math.floor(pr.min / 60)}:${String(pr.min % 60).padStart(2, '0')}:00`, `${pr.nome}: tempo igual ao cadastrado na prova (${pr.min} min)`);
      }
      await clica(p, '[data-a="tab"][data-v="simulados"]', 150);
      r.igual((await estado(p)).sims.length, P.length, 'cada prova entregue entrou no histórico');
      await ctx.close();
    });

    // certificados
    await r.etapa('certificados', async () => {
      const { ctx, p } = await nova();
      await comecar(p);
      const s = await estado(p);
      M.filter(m => m.m === 'por').forEach(m => { s.mod[m.id] = { best: 0.9, last: 0.9, tent: 1, ok: '2026-10-20', lido: '2026-10-19' }; });
      s.t = Date.now(); await gravar(p, s); await p.reload(); await p.waitForTimeout(300);
      await clica(p, '[data-a="tab"][data-v="materias"]'); await clica(p, '[data-a="mat"][data-s="por"]');
      r.ok(await p.locator('[data-a="cert"]').count(), 'Português concluído libera o certificado');
      await clica(p, '[data-a="cert"] >> nth=0', 200);
      const t = await texto(p);
      r.ok(/CERTIFICADO DE CONCLUSÃO/.test(t) && /Aluna Teste/.test(t) && /Língua Portuguesa/.test(t), 'certificado com nome e matéria');
      r.ok(/[A-Z0-9]{4}-[A-Z0-9]{4}/.test(t), 'certificado com código');
      const s2 = await estado(p);
      M.forEach(m => { s2.mod[m.id] = { best: 0.9, last: 0.9, tent: 1, ok: '2026-10-21', lido: '2026-10-20' }; });
      s2.t = Date.now(); await gravar(p, s2); await p.reload(); await p.waitForTimeout(300);
      await clica(p, '[data-a="tab"][data-v="hoje"]', 150);
      r.ok(await p.locator('[data-a="cert"]').count(), 'curso completo libera o certificado geral na tela Hoje');
      await ctx.close();
    });

    // progresso no aparelho: persiste ao recarregar e passa de um aparelho para outro pelo código
    await r.etapa('progresso local', async () => {
      const { ctx, p } = await nova({ permissions: ['clipboard-read', 'clipboard-write'] });
      await comecar(p);
      await clica(p, '[data-a="tab"][data-v="simulados"]'); await clica(p, '[data-a="simini"][data-tipo="materia"][data-s="por"]', 200);
      for (let i = 0; i < 24; i++) { await p.click('[data-a="simresp"] >> nth=0'); if (i < 23) await p.click('[data-a="simnav"][data-d="1"]'); }
      await clica(p, '[data-a="entregar"]'); await clica(p, '[data-a="entregarok"]', 200);
      const antes = await estado(p);
      await p.reload(); await p.waitForTimeout(300);
      r.igual(await estado(p), antes, 'progresso continua igual depois de recarregar');
      await clica(p, '[data-a="tab"][data-v="plano"]', 150);
      await clica(p, '[data-a="expcopiar"]', 200);
      // o botão copia para a área de transferência; se o navegador não deixar, mostra o código numa caixa
      const codigo = await p.locator('#exp-txt').count() ? await p.locator('#exp-txt').inputValue() : await p.evaluate(() => navigator.clipboard.readText());
      r.ok(codigo && JSON.parse(codigo).v === 1, '"Copiar meu progresso" gera o código');
      const outro = await nova();
      await comecar(outro.p);
      await clica(outro.p, '[data-a="tab"][data-v="plano"]', 150); await clica(outro.p, '[data-a="impabrir"]', 100);
      await outro.p.fill('#imp-txt', codigo || ''); await clica(outro.p, '[data-a="impok"]', 200);
      const novo = await estado(outro.p);
      r.igual([novo.sims.length, novo.cfg.nome], [antes.sims.length, antes.cfg.nome], '"Colar progresso" leva o histórico e o nome para outro aparelho');
      await outro.ctx.close(); await ctx.close();
    });

    // modo offline
    await r.etapa('offline', async () => {
      const { ctx, p } = await nova();
      await comecar(p);
      await p.evaluate(() => navigator.serviceWorker.ready); await p.waitForTimeout(1500);
      await ctx.setOffline(true);
      await p.reload(); await p.waitForTimeout(500);
      r.ok((await texto(p)).length > 50 && await p.evaluate(() => !!navigator.serviceWorker.controller), 'abre sem internet depois da primeira visita');
      await clica(p, '[data-a="tab"][data-v="materias"]'); await clica(p, '[data-a="mat"][data-s="fis"]'); await clica(p, `[data-id="${M.find(m => m.m === 'fis').id}"]`);
      await clica(p, '[data-a="aba"][data-aba="teoria"]');
      r.ok((await texto(p)).length > 400, 'aulas abrem sem internet');
      const resp = await p.goto(srv.url + 'termos.html').catch(() => null);
      r.ok(resp && /Termos de Uso/.test(await p.title()), 'Termos de Uso abrem sem internet');
      await ctx.setOffline(false); await ctx.close();
    });

    // telas de vários tamanhos, claro e escuro
    await r.etapa('responsividade', async () => {
      const ruins = [];
      for (const tema of ['light', 'dark']) for (const w of larguras) {
        const { ctx, p } = await nova({ viewport: { width: w, height: 800 }, colorScheme: tema });
        await comecar(p);
        for (const a of ABAS) { await clica(p, `[data-a="tab"][data-v="${a}"]`, 60); const o = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (o > 0) ruins.push(`${tema} ${w}px ${a} (+${o}px)`); }
        if (tema === 'dark' && w === 390) r.ok(await p.evaluate(() => getComputedStyle(document.body).backgroundColor) === 'rgb(12, 12, 12)', 'tema escuro aplica o fundo escuro');
        await ctx.close();
      }
      r.igual(ruins, [], `sem rolagem lateral em ${larguras.length} larguras × claro/escuro × ${ABAS.length} abas`);
    });

    r.igual(erros, [], 'nenhum erro de JavaScript nem de arquivo faltando');
  } finally { await b.close(); srv.fechar(); }
  return r;
}

if (require.main === module) {
  testarNavegador(path.resolve(process.argv[2] || RAIZ)).then(r => { r.imprimir(); process.exit(r.falhas() ? 1 : 0); });
}
module.exports = { testarNavegador };
