/* Testes de segurança e integridade do progresso: progresso colado malicioso ou malformado, progresso ilegível,
   armazenamento que falha e simulado em andamento quando uma questão sai do curso. Só dados fictícios.
   Usado por testes/plataforma.test.js, que monta o site e abre o navegador. */
const LS = 'missao-eear-v1', LS_REC = 'missao-eear-v1-recuperar';
const P = '"><img src=x onerror="window.__xss=(window.__xss||0)+1"><svg onload="window.__xss=(window.__xss||0)+1">';

module.exports = async function testarRobustez({ b, srv, base, ok }) {
  const abrir = async (estado, opcoes) => {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 860 } }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message));
    if (opcoes && opcoes.semGravar) await p.addInitScript(() => { Object.defineProperty(window, 'indexedDB', { get: () => undefined }); window.Storage.prototype.setItem = function () { throw new window.DOMException('cheio', 'QuotaExceededError'); }; });
    if (estado != null) await p.addInitScript(([k, s]) => { if (!sessionStorage.getItem('fixture-robustez')) { localStorage.setItem(k, s); sessionStorage.setItem('fixture-robustez', '1'); } }, [LS, typeof estado === 'string' ? estado : JSON.stringify(estado)]);
    await p.goto(srv.url);
    await p.waitForTimeout(200);
    return { ctx, p, erros };
  };
  const clicar = (p, a, attrs) => p.evaluate(([a, attrs]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, attrs || {}); document.body.appendChild(x); x.click(); x.remove(); }, [a, attrs]);
  /* Percorre as telas principais e devolve as que ficaram vazias. */
  const percorrer = async p => {
    const vazias = [];
    const passos = [['tab', { v: 'hoje' }], ['tab', { v: 'plano' }], ['tab', { v: 'materias' }], ['tab', { v: 'treino' }], ['tab', { v: 'simulados' }],
      ['go', { v: 'sim' }], ['go', { v: 'res' }], ['mod', { id: 'POR01' }], ['cert', { s: 'por' }], ['cert', { s: 'geral' }], ['tab', { v: 'hoje' }]];
    for (const [a, attrs] of passos) {
      await clicar(p, a, attrs); await p.waitForTimeout(60);
      if ((await p.evaluate(() => document.getElementById('app').innerText.trim().length)) < 20) vazias.push(a + ':' + Object.values(attrs)[0]);
    }
    return vazias;
  };

  console.log('\n== segurança: progresso colado com HTML ou script');
  {
    const est = Object.assign(base({ nome: P, prova: P, inicio: P, alvo: 'outra', certs: [{ s: 'por', ids: ['POR01'], d: '2026-01-01', h: 1, t: 1, c: P, o: 'curso' }] }), {
      mod: { POR01: { best: 0.9, tent: P, lido: '2026-10-01', ok: '2026-10-01' } }, erros: { 'POR01-0': P, 'MAT03-2': 1 } });
    const { ctx, p, erros } = await abrir(base({}));
    await p.click('[data-a="tab"][data-v="plano"]'); await clicar(p, 'impabrir'); await p.waitForTimeout(80);
    await p.fill('#imp-txt', JSON.stringify(est)); await clicar(p, 'impok'); await p.waitForTimeout(150);
    const vazias = await percorrer(p);
    await p.reload(); await p.waitForTimeout(200);
    vazias.push(...await percorrer(p));
    const xss = await p.evaluate(() => window.__xss || 0);
    ok(xss === 0 && !erros.length && !vazias.length, `nenhum script do progresso colado executa (nome, datas do plano, tentativas, caderno de erros, código do certificado)${xss ? ` — executou ${xss} vez(es)` : ''}${erros.length ? ' — ' + erros[0] : ''}${vazias.length ? ' — vazias: ' + vazias.join(', ') : ''}`);
    await clicar(p, 'cert', { s: 'por' }); await p.waitForTimeout(80);
    ok((await p.locator('.cert-nome').innerText()).includes('<img src=x'), 'o nome com sinais de HTML aparece como texto no certificado');
    await ctx.close();
  }

  console.log('\n== integridade: progresso malformado não trava o app');
  {
    const casos = {
      'tipos trocados': { v: 1, t: 1, cfg: null, mod: [], fc: 'x', erros: 5, sims: 'x', diag: 'x', feito: null, act: [], ativo: 'x', ult: 7, ap: 'x', aula: 3, ultAula: {} },
      'valores nulos': { v: 1, t: 1, cfg: { nome: 'A' }, mod: { POR01: null, MAT01: 'x' }, fc: { 'POR01~0': null, 'POR01~1': [null, null] }, erros: { 'MAT03-2': null }, sims: [null, 5, { r: null }, { tipo: 'prova', prova: 'nao-existe', r: {} }, { d: '2026-10-01', tipo: 'materia', mat: 'por', r: { por: null, mat: [3, 0] } }], act: { x: null }, aula: { POR01: null }, ap: { x: null } },
      'simulado em andamento corrompido': { v: 1, t: 1, cfg: { nome: 'A' }, mod: {}, fc: {}, sims: [], ativo: { tipo: 'completo', ids: ['NAO-EXISTE', null], resp: 'x', marc: null, i: 99, perms: null } },
      'último resultado corrompido': { v: 1, t: 1, cfg: { nome: 'A' }, mod: {}, fc: {}, sims: [], ult: { reg: { d: '2026-10-01', tipo: 'completo', r: { por: [1, 2] } }, ids: ['POR01-0', 'X'], perms: 'x', resp: null } }
    };
    for (const [nome, est] of Object.entries(casos)) {
      const { ctx, p, erros } = await abrir(est);
      const guardado = await p.evaluate(k => localStorage.getItem(k), LS);
      const vazias = await percorrer(p);
      await p.click('[data-a="tab"][data-v="plano"]'); await p.waitForTimeout(80);
      const dados = await p.locator('[data-a="impabrir"]').count() && await p.locator('[data-a="zerar"]').count();
      ok(!erros.length && !vazias.length && dados && guardado === JSON.stringify(est), `${nome}: as telas abrem sem erro, Plano › Dados continua acessível e abrir não regrava o progresso${erros.length ? ' — ' + erros[0] : ''}${vazias.length ? ' — vazias: ' + vazias.join(', ') : ''}`);
      await ctx.close();
    }
  }

  console.log('\n== integridade: simulado em andamento quando uma questão sai do curso');
  {
    const { ctx, p, erros } = await abrir(base({}));
    await p.click('[data-a="tab"][data-v="simulados"]'); await clicar(p, 'simini', { tipo: 'materia', s: 'por' }); await p.waitForTimeout(150);
    await p.locator('[data-a="simresp"]').first().click(); await p.waitForTimeout(60);
    await clicar(p, 'simnav', { d: '1' }); await p.locator('[data-a="simresp"]').nth(1).click(); await p.waitForTimeout(60);
    const st = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), LS), a = st.ativo, respondidas = Object.keys(a.resp);
    /* Simula uma atualização que tirou a 2ª questão do curso: o id passa a não existir. */
    const sumiu = a.ids[1]; a.ids[1] = 'POR99-999'; a.resp['POR99-999'] = a.resp[sumiu]; delete a.resp[sumiu];
    await clicar(p, 'tab', { v: 'plano' }); await clicar(p, 'impabrir'); await p.fill('#imp-txt', JSON.stringify(st)); await p.check('#imp-substituir'); await clicar(p, 'impok'); await p.reload(); await p.waitForTimeout(200);
    await clicar(p, 'go', { v: 'sim' }); await p.waitForTimeout(100);
    const tela = await p.locator('main').innerText();
    ok(!erros.length && /Questão \d+ de 23/.test(tela) && respondidas.length === 2, `o simulado continua com as 23 questões que ainda existem e a resposta da 1ª questão é mantida${erros.length ? ' — ' + erros[0] : ''}`);
    await clicar(p, 'entregar'); await clicar(p, 'entregarok'); await p.waitForTimeout(150);
    const fim = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), LS);
    ok(!erros.length && fim.ativo === null && fim.sims.length === 2 && fim.sims[1].r.por[1] === 23 && fim.ult.resp[a.ids[0]] === a.resp[a.ids[0]], 'a entrega registra o simulado com 23 questões e guarda a resposta dada');
    await ctx.close();
  }

  console.log('\n== integridade: progresso ilegível não é apagado');
  for (const [nome, texto] of [['JSON corrompido', '{"v":1,"t":17,"mod":{"POR01":{"best":0.9'], ['formato de uma versão futura', JSON.stringify({ v: 2, t: 1, dados: { qualquer: 'coisa' } })]]) {
    const { ctx, p, erros } = await abrir(texto);
    const rec = await p.evaluate(k => localStorage.getItem(k), LS_REC);
    if (await p.locator('#ini-nome').count()) { await p.fill('#ini-nome', 'Aluno'); await p.click('[data-a="comecar"]'); } // 1º salvar(): grava o progresso novo por cima do ilegível
    else await clicar(p, 'marcar', { k: 'teste' });
    await p.waitForTimeout(100);
    const gravou = await p.evaluate(k => localStorage.getItem(k), LS) !== texto;
    const aviso = await p.locator('[data-a="reccopiar"]').count(); // na tela Hoje, depois da tela inicial
    await p.reload(); await p.waitForTimeout(200);
    const rec2 = await p.evaluate(k => localStorage.getItem(k), LS_REC);
    ok(!erros.length && rec === texto && gravou && rec2 === texto && aviso === 1, `${nome}: uma cópia exata fica guardada antes de qualquer gravação, e a tela Hoje oferece copiá-la${erros.length ? ' — ' + erros[0] : ''}`);
    await clicar(p, 'recdescartar'); await p.waitForTimeout(80);
    ok(await p.evaluate(k => localStorage.getItem(k), LS_REC) === null && !(await p.locator('[data-a="reccopiar"]').count()), `${nome}: "Descartar" apaga só a cópia`);
    await ctx.close();
  }
  {
    const { ctx, p } = await abrir(base({}));
    ok(await p.evaluate(k => localStorage.getItem(k), LS_REC) === null && !(await p.locator('[data-a="reccopiar"]').count()), 'progresso válido: nenhuma cópia e nenhum aviso');
    await ctx.close();
  }

  console.log('\n== integridade: armazenamento que não grava');
  {
    const { ctx, p, erros } = await abrir(null, { semGravar: true });
    await p.fill('#ini-nome', 'Aluno'); await p.click('[data-a="comecar"]'); await p.waitForTimeout(150);
    const aviso = await p.locator('.banner[role="alert"]').innerText().catch(() => '');
    await p.click('[data-a="tab"][data-v="plano"]'); await p.waitForTimeout(80);
    const sync = await p.locator('#sync').innerText();
    ok(!erros.length && /não está sendo salvo/.test(aviso) && /não está sendo salvo/.test(sync), 'o aluno é avisado de que o progresso não está sendo salvo, em Hoje e em Plano › Dados');
    await ctx.close();
  }
  {
    const { ctx, p } = await abrir(base({}));
    await p.click('[data-a="tab"][data-v="plano"]'); await p.waitForTimeout(80);
    ok(!(await p.locator('.banner[role="alert"]').count()) && /salvo neste aparelho/.test(await p.locator('#sync').innerText()), 'armazenamento normal: sem aviso, "Progresso salvo neste aparelho"');
    await ctx.close();
  }
};
