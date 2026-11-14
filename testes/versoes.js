/* Testes no navegador da versão dos flashcards (Lote 0) e dos cartões reformulados de Português, Inglês, Matemática e Física
   com progresso antigo. Usado por testes/plataforma.test.js, que monta o site e abre o navegador. */
const fs = require('fs'), os = require('os'), path = require('path');

module.exports = async function testarVersoes({ E, b, srv, saida, base, servir, ok, historico = false }) {
  console.log('\n== versão dos flashcards (cópia do site com os 7 cartões da POR02 na versão 2)');
  {
    /* Cópia isolada do site montado: os cartões da POR02 ganham a versão 2, como numa reformulação. Nada do curso muda. */
    const saida2 = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-site-v2-'));
    fs.cpSync(saida, saida2, { recursive: true });
    fs.appendFileSync(path.join(saida2, 'dados', 'por1.js'), "\nEEAR.modulos.find(m => m.id === 'POR02').fc.forEach(c => { c[2] = 2; });\n");
    /* Outra cópia sem nenhuma versão nos cartões, como o site antes da reformulação. */
    const saida0 = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-site-v1-'));
    fs.cpSync(saida, saida0, { recursive: true });
    for (const f of fs.readdirSync(path.join(saida0, 'dados')).filter(f => /^(por|mat|fis|ing)\d\.js$/.test(f))) fs.appendFileSync(path.join(saida0, 'dados', f), '\nEEAR.modulos.forEach(m => (m.fc || []).forEach(c => { c.length = 2; }));\n');
    const srv2 = await servir(saida2), srv0 = await servir(saida0), por02 = E.modulos.find(m => m.id === 'POR02').fc;
    const desvio = id => { let x = 2166136261; for (let i = 0; i < id.length; i++) { x ^= id.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x % 7; };
    const ids2 = por02.map((_, i) => 'POR02~' + i), DIA = 864e5;
    /* Dia local (como o app calcula) de um instante num fuso. */
    const diaLocal = (ms, tz) => { const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms)).split('-').map(Number); return Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / DIA); };
    const dstr = n => new Date(n * DIA).toISOString().slice(0, 10);
    async function abrirEm(url, estado, ms, tz) {
      const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 860 }, timezoneId: tz });
      const p = await ctx.newPage(), erros = []; p.on('pageerror', e => erros.push(e.message));
      await p.clock.setFixedTime(new Date(ms));
      if (estado) await p.addInitScript(s => { if (!sessionStorage.getItem('fixture-versoes')) { localStorage.setItem('missao-eear-v1', s); sessionStorage.setItem('fixture-versoes', '1'); } }, typeof estado === 'string' ? estado : JSON.stringify(estado)); await p.goto(url);
      await p.waitForTimeout(250);
      const guardado = () => p.evaluate(() => localStorage.getItem('missao-eear-v1'));
      const vencidos = async () => { await p.click('[data-a="tab"][data-v="hoje"]'); await p.waitForTimeout(100); return Number(await p.locator('.grid2 .card').first().locator('.score').innerText()); };
      const revisar = async acertos => { // revisa a fila do dia pela tela e devolve os cartões revisados
        const feitos = []; await p.click('[data-a="tab"][data-v="hoje"]'); await p.waitForTimeout(80);
        if (!(await p.locator('[data-a="fcini"]').first().isEnabled())) return feitos;
        await p.locator('[data-a="fcini"]').first().click(); await p.waitForTimeout(100);
        while (await p.locator('[data-a="fcvirar"]').count()) {
          const frente = (await p.locator('.fc > div').first().innerText()).trim(), i = por02.findIndex(c => c[0].replace(/<[^>]+>/g, '').trim() === frente);
          feitos.push('POR02~' + i); await p.click('[data-a="fcvirar"]'); await p.waitForTimeout(40);
          await p.click(`[data-a="fcaval"][data-ok="${acertos ? 1 : 0}"]`); await p.waitForTimeout(60);
        }
        return feitos;
      };
      return { ctx, p, erros, guardado, vencidos, revisar };
    }
    for (const tz of ['America/Sao_Paulo', 'Asia/Tokyo']) {
      const T0 = Date.UTC(2026, 11, 1, 1, 30), D = diaLocal(T0, tz);  // 01h30 UTC: dia 30/11 em São Paulo e 01/12 em Tóquio
      const fc = {}; ids2.forEach(id => { fc[id] = [6, D + 50]; });  // os 7 cartões estavam dominados (caixa de 60 dias)
      const st0 = Object.assign(base({}), { mod: { POR02: { lido: dstr(D - 20), tent: 1, best: 0.9, ok: dstr(D - 20) } }, fc, erros: {}, sims: [] });
      st0.cfg.prova = '2027-05-30';
      const antes = JSON.stringify(st0), ate = k => ids2.filter(id => desvio(id) <= k).length;
      // sem versões nos cartões (como antes da reformulação), nenhum desses cartões volta
      let r = await abrirEm(srv0.url, st0, T0, tz);
      ok(await r.vencidos() === 0, `${tz}: sem versão nos dados, nenhum cartão dominado volta antes da hora`);
      await r.ctx.close();
      // com a versão 2: abrir não grava nada e devolve só os cartões de desvio 0; a âncora flutua até o aluno estudar
      r = await abrirEm(srv2.url, st0, T0, tz);
      ok(await r.guardado() === antes, `${tz}: abrir com cartões em versão nova não altera o progresso gravado`);
      ok(await r.vencidos() === ate(0), `${tz}: no 1º dia voltam só os cartões de desvio 0 (${ate(0)} de 7)`);
      await r.ctx.close();
      r = await abrirEm(srv2.url, st0, T0 + 3 * DIA, tz);
      ok(await r.vencidos() === ate(0) && await r.guardado() === antes, `${tz}: sem estudar, 3 dias depois, ainda voltam ${ate(0)} (a âncora só fica quando o aluno estuda)`);
      await r.ctx.close();
      // o aluno estuda no dia D: a âncora fica gravada e os demais voltam aos poucos, até D + 6
      r = await abrirEm(srv2.url, st0, T0, tz);
      const vistos = await r.revisar(true);
      let st = JSON.parse(await r.guardado());
      ok(st.cfg.fcAncora && st.cfg.fcAncora['POR02:2'] === dstr(D) && vistos.length === ate(0), `${tz}: ao estudar, a âncora fica no dia local ${dstr(D)}`);
      ok(vistos.every(id => st.fc[id][0] === 3 && st.fc[id][1] === D + 7 && JSON.stringify((st.cfg.fcv || {})[id]) === JSON.stringify([2, D + 7])), `${tz}: acerto na versão nova vai para a caixa 3 (volta em 7 dias) e registra a versão vista`);
      ok(ids2.filter(id => !vistos.includes(id)).every(id => JSON.stringify(st.fc[id]) === JSON.stringify([6, D + 50])), `${tz}: os cartões ainda não revistos mantêm o histórico intacto`);
      const salvo = await r.guardado(); await r.ctx.close();
      const porDia = [];
      for (let k = 1; k <= 7; k++) { r = await abrirEm(srv2.url, salvo, T0 + k * DIA, tz); porDia.push(await r.vencidos()); await r.ctx.close(); }
      // os ainda não revistos voltam até o 6º dia; os revistos no dia D voltam, como agendado, em D + 7
      const esperado = [1, 2, 3, 4, 5, 6, 7].map(k => ids2.filter(id => !vistos.includes(id) && desvio(id) <= Math.min(k, 6)).length + (k >= 7 ? vistos.length : 0));
      ok(JSON.stringify(porDia) === JSON.stringify(esperado) && porDia[5] === 7 - vistos.length, `${tz}: os demais voltam distribuídos até o 6º dia (${porDia.join(', ')}; esperado ${esperado.join(', ')})`);
      // revisar tudo no dia D+6 e conferir que nada volta antes da data nova
      r = await abrirEm(srv2.url, salvo, T0 + 6 * DIA, tz); const resto = await r.revisar(true); st = JSON.parse(await r.guardado()); const tudo = await r.guardado(); await r.ctx.close();
      r = await abrirEm(srv2.url, tudo, T0 + 7 * DIA, tz);
      const agendados = ids2.filter(id => st.fc[id][1] <= D + 7).length;  // só os revistos no dia D (vencem em D + 7)
      ok(resto.length === 7 - vistos.length && agendados === vistos.length && await r.vencidos() === agendados, `${tz}: depois de revistos, no dia seguinte só vencem os cartões já agendados (${agendados}); nenhum se repete fora da data`);
      await r.ctx.close();
      // uma versão antiga do app revisa o texto antigo e regrava [caixa, data] sem a versão: o cartão volta
      const velho = JSON.parse(tudo), alvo = ids2[0]; velho.fc[alvo] = [5, D + 6 + 30];
      r = await abrirEm(srv2.url, velho, T0 + 13 * DIA, tz);
      ok(await r.vencidos() >= 1 && (await r.revisar(true)).includes(alvo), `${tz}: cartão regravado por uma versão antiga do app volta para a revisão da versão nova`);
      await r.ctx.close();
      // data original mais cedo que o espalhamento: vale a data original
      const cedo = JSON.parse(JSON.stringify(st0)); const longe = ids2.find(id => desvio(id) >= 3); cedo.fc[longe] = [2, D + 1];
      r = await abrirEm(srv2.url, cedo, T0 + DIA, tz);
      ok(await r.vencidos() === ate(0) + 1,`${tz}: um cartão que já venceria antes do espalhamento continua vencendo na data original`);
      await r.ctx.close();
    }
    { // exportar, colar, nuvem simulada e zerar
      const tz = 'America/Sao_Paulo', T0 = Date.UTC(2026, 11, 1, 15), D = diaLocal(T0, tz);
      const fc = {}; ids2.forEach(id => { fc[id] = [6, D + 50]; });
      const st0 = Object.assign(base({}), { mod: { POR02: { lido: dstr(D - 20), tent: 1 } }, fc, erros: {}, sims: [] });
      let r = await abrirEm(srv2.url, st0, T0, tz); await r.revisar(true);
      await r.p.click('[data-a="tab"][data-v="plano"]'); await r.p.click('[data-a="expcopiar"]').catch(() => {}); await r.p.waitForTimeout(100);
      const codigo = await r.p.locator('#exp-txt').inputValue().catch(() => r.guardado()), origem = JSON.parse(await r.guardado()); await r.ctx.close();
      r = await abrirEm(srv2.url, null, T0 + DIA, tz); await r.p.fill('#ini-nome', 'X'); await r.p.click('[data-a="comecar"]'); await r.p.waitForTimeout(80);
      await r.p.click('[data-a="tab"][data-v="plano"]'); await r.p.click('[data-a="impabrir"]'); await r.p.fill('#imp-txt', codigo); await r.p.click('[data-a="impok"]'); await r.p.waitForTimeout(120);
      const imp = JSON.parse(await r.guardado());
      ok(JSON.stringify([imp.fc, imp.cfg.fcv, imp.cfg.fcAncora]) === JSON.stringify([origem.fc, origem.cfg.fcv, origem.cfg.fcAncora]), 'colar progresso leva cartões, versões vistas e âncora');
      const vImp = await r.vencidos(); await r.ctx.close();
      r = await abrirEm(srv2.url, origem, T0 + DIA, tz);
      ok(await r.vencidos() === vImp, 'o aparelho que recebeu o progresso mostra os mesmos cartões vencidos que o original');
      await r.ctx.close();
      if (historico) {
      // nuvem simulada mais nova, com versões vistas: o aparelho fica com elas, sem misturar com as próprias
      const nuvem = JSON.parse(JSON.stringify(origem)); nuvem.t = Date.now() + 60000;
      const ctx = await b.newContext({ serviceWorkers: 'block', timezoneId: tz }), p = await ctx.newPage();
      await p.clock.setFixedTime(new Date(T0 + DIA));
      await ctx.addInitScript(d => { window.claude = { use: async k => k === 'user' ? { id: async () => 'aluno-1' } : { doc: c => /^progresso\//.test(c) ? { get: async () => ({ exists: false, data: () => null }), set: async () => { const e = new Error('regras'); e.code = 'invalid_argument'; throw e; }, acquire: async o => ({ acquired: true, holder: o.holder, expiresAt: new Date(Date.now() + 5000).toISOString() }) } : ({ get: async () => ({ exists: true, data: () => JSON.parse(JSON.stringify(d)) }), set: async () => {}, acquire: async o => ({ acquired: true, holder: o.holder, expiresAt: new Date(Date.now() + o.ttlMs).toISOString() }) }) } }; }, nuvem);
      await p.addInitScript(s => { if (!sessionStorage.getItem('fixture-versoes-conta')) { localStorage.setItem('missao-eear-v1@claude:aluno-1', JSON.stringify(s)); sessionStorage.setItem('fixture-versoes-conta', '1'); } }, st0); await p.goto(srv2.url); await p.waitForTimeout(500);
      const sinc = await p.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1@claude:aluno-1')));
      ok(JSON.stringify([sinc.fc, sinc.cfg.fcv, sinc.cfg.fcAncora]) === JSON.stringify([nuvem.fc, nuvem.cfg.fcv, nuvem.cfg.fcAncora]), 'sincronização simulada: cartões e versões vêm juntos da nuvem mais nova');
      await ctx.close();
      }
      r = await abrirEm(srv2.url, origem, T0 + DIA, tz);
      await r.p.click('[data-a="tab"][data-v="plano"]'); await r.p.click('[data-a="zerar"]'); await r.p.waitForTimeout(50); await r.p.click('[data-a="zerarok"]'); await r.p.waitForTimeout(100);
      const z = JSON.parse(await r.guardado());
      ok(!Object.keys(z.fc).length && !z.cfg.fcv && !z.cfg.fcAncora && !r.erros.length, 'zerar progresso apaga cartões, versões vistas e âncoras');
      await r.ctx.close();
    }
    { // dados reais: progresso antigo com todos os cartões de Português dominados, aberto no site com as reformulações
      const tz = 'America/Sao_Paulo', T0 = Date.UTC(2026, 11, 1, 15), D = diaLocal(T0, tz);
      const POR = E.modulos.filter(m => m.m === 'por'), todos = [], versao = {};
      POR.forEach(m => m.fc.forEach((c, i) => { const id = m.id + '~' + i; todos.push(id); versao[id] = Number.isInteger(c[2]) && c[2] > 1 ? c[2] : 1; }));
      const novos = todos.filter(id => versao[id] > 1), iguais = todos.filter(id => versao[id] === 1);
      const frentes = {}; POR.forEach(m => m.fc.forEach((c, i) => { frentes[c[0].replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()] = m.id + '~' + i; }));
      const fc = {}; todos.forEach(id => { fc[id] = [6, D + 50]; });
      const mod = {}; POR.forEach(m => { mod[m.id] = { lido: dstr(D - 30), tent: 1, best: 0.9, ok: dstr(D - 30) }; });
      const st0 = Object.assign(base({}), { mod, fc, erros: {}, sims: [] }); st0.cfg.prova = '2027-05-30';
      const antes = JSON.stringify(st0), ate = k => novos.filter(id => desvio(id) <= k).length;
      const revisarTudo = async p => { // revisa pela tela a fila do dia e devolve os ids revisados
        const feitos = []; await p.click('[data-a="tab"][data-v="hoje"]'); await p.waitForTimeout(80);
        if (!(await p.locator('[data-a="fcini"]').first().isEnabled())) return feitos;
        await p.locator('[data-a="fcini"]').first().click(); await p.waitForTimeout(100);
        while (await p.locator('[data-a="fcvirar"]').count()) {
          feitos.push(frentes[(await p.locator('.fc > div').first().innerText()).replace(/\s+/g, ' ').trim()]);
          await p.click('[data-a="fcvirar"]'); await p.waitForTimeout(30); await p.click('[data-a="fcaval"][data-ok="1"]'); await p.waitForTimeout(40);
        }
        return feitos;
      };
      ok(POR.reduce((s, m) => s + m.fc.length, 0) === 117 && novos.length === 100 && iguais.length === 17 && novos.every(id => versao[id] === 2), `Português: 117 cartões, 100 na versão 2 e 17 sem versão (${novos.length}/${iguais.length})`);
      let r = await abrirEm(srv.url, st0, T0, tz);
      ok(await r.guardado() === antes && await r.vencidos() === ate(0), `Português: abrir não altera o progresso antigo e devolve só os reformulados de desvio 0 (${ate(0)} de 100)`);
      const dia0 = await revisarTudo(r.p); let st = JSON.parse(await r.guardado()); const salvo = await r.guardado(); await r.ctx.close();
      ok(dia0.length === ate(0) && dia0.every(id => versao[id] === 2 && st.fc[id][0] === 3 && st.fc[id][1] === D + 7), 'Português: no 1º dia só voltam cartões reformulados, e o acerto os agenda para 7 dias');
      ok(iguais.every(id => JSON.stringify(st.fc[id]) === JSON.stringify([6, D + 50]) && !(st.cfg.fcv || {})[id]) && require('util').isDeepStrictEqual(st.mod, st0.mod), 'Português: os 17 cartões mantidos e o registro das aulas ficam intactos');
      const porDia = [], vistos = new Set(dia0);
      for (let k = 1; k <= 6; k++) { r = await abrirEm(srv.url, salvo, T0 + k * DIA, tz); porDia.push(await r.vencidos()); await r.ctx.close(); }
      const esperado = [1, 2, 3, 4, 5, 6].map(k => novos.filter(id => !vistos.has(id) && desvio(id) <= k).length);
      ok(JSON.stringify(porDia) === JSON.stringify(esperado) && porDia[5] === 100 - dia0.length, `Português: os outros reformulados voltam distribuídos até o 6º dia (${porDia.join(', ')})`);
      r = await abrirEm(srv.url, salvo, T0 + 6 * DIA, tz); const resto = await revisarTudo(r.p); const fim = await r.guardado(); st = JSON.parse(fim); await r.ctx.close();
      r = await abrirEm(srv.url, fim, T0 + 7 * DIA, tz); const v7 = await r.vencidos(); await r.ctx.close();
      ok(resto.length === 100 - dia0.length && resto.every(id => versao[id] === 2) && novos.every(id => JSON.stringify(st.cfg.fcv[id]) === JSON.stringify([2, st.fc[id][1]])) && v7 === dia0.length && !r.erros.length, `Português: cada reformulado volta uma única vez; no 7º dia só vencem os ${dia0.length} agendados`);
    }
    for (const modalidade of ['normal', 'bct']) { // dados reais de Inglês: progresso antigo com todos os cartões dominados, nas duas modalidades
      const tz = 'America/Sao_Paulo', T0 = Date.UTC(2026, 11, 1, 15), D = diaLocal(T0, tz);
      const ING = E.modulos.filter(m => m.m === 'ing'), ativo = m => !m.modalidades || m.modalidades.includes(modalidade);
      const versao = {}, aula = {}; ING.forEach(m => m.fc.forEach((c, i) => { const id = m.id + '~' + i; versao[id] = Number.isInteger(c[2]) && c[2] > 1 ? c[2] : 1; aula[id] = m; }));
      const todos = Object.keys(versao), novos = todos.filter(id => versao[id] > 1 && ativo(aula[id])), fora = todos.filter(id => !ativo(aula[id]));
      const fc = {}; todos.forEach(id => { fc[id] = [6, D + 50]; });
      const mod = {}; ING.forEach(m => { mod[m.id] = { lido: dstr(D - 30), tent: 1, best: 0.9, ok: dstr(D - 30) }; });
      const st0 = Object.assign(base({ modalidade }), { mod, fc, erros: {}, sims: [] }); st0.cfg.prova = '2027-05-30';
      const antes = JSON.stringify(st0), ate = k => novos.filter(id => desvio(id) <= k).length;
      if (modalidade === 'normal') ok(todos.length === 113 && todos.filter(id => versao[id] === 2).length === 87 && todos.filter(id => versao[id] === 1).length === 26, `Inglês: 113 cartões, 87 na versão 2 (86 do Lote 2 e ING14~5) e 26 sem versão`);
      let r = await abrirEm(srv.url, st0, T0, tz);
      ok(await r.guardado() === antes && await r.vencidos() === ate(0), `Inglês ${modalidade}: abrir não altera o progresso antigo e devolve só os reformulados da modalidade de desvio 0 (${ate(0)} de ${novos.length})`);
      await r.ctx.close();
      const porDia = [];
      for (let k = 1; k <= 6; k++) { r = await abrirEm(srv.url, st0, T0 + k * DIA, tz); porDia.push(await r.vencidos()); await r.ctx.close(); }
      // sem estudar, a âncora não fica gravada: o espalhamento continua contado a partir do dia em que o aluno abrir
      ok(porDia.every(n => n === ate(0)), `Inglês ${modalidade}: sem estudar, a fila não cresce sozinha (${porDia.join(', ')})`);
      r = await abrirEm(srv.url, st0, T0, tz);
      await r.p.click('[data-a="tab"][data-v="hoje"]'); await r.p.locator('[data-a="fcini"]').first().click(); await r.p.waitForTimeout(100);
      const vistos = [];
      while (await r.p.locator('[data-a="fcvirar"]').count()) {
        vistos.push((await r.p.locator('.fc .tag').innerText()).trim().split(/\s+/).pop());
        await r.p.click('[data-a="fcvirar"]'); await r.p.waitForTimeout(30); await r.p.click('[data-a="fcaval"][data-ok="1"]'); await r.p.waitForTimeout(40);
      }
      const salvo = await r.guardado(), st = JSON.parse(salvo); await r.ctx.close();
      ok(vistos.length === ate(0) && vistos.every(id => ativo(ING.find(m => m.id === id))), `Inglês ${modalidade}: no 1º dia só aparecem cartões de aulas da modalidade`);
      ok(fora.every(id => JSON.stringify(st.fc[id]) === JSON.stringify([6, D + 50]) && !(st.cfg.fcv || {})[id]) && todos.filter(id => versao[id] === 1).every(id => JSON.stringify(st.fc[id]) === JSON.stringify([6, D + 50])), `Inglês ${modalidade}: cartões da outra modalidade e os mantidos ficam intactos`);
      r = await abrirEm(srv.url, salvo, T0 + 6 * DIA, tz); const v6 = await r.vencidos(); await r.ctx.close();
      ok(v6 === novos.length - vistos.length && !r.erros.length, `Inglês ${modalidade}: até o 6º dia voltam todos os demais reformulados da modalidade (${v6})`);
    }
    for (const [mat, nome] of [['mat', 'Matemática'], ['fis', 'Física']]) { // dados reais: progresso antigo com todos os cartões da matéria dominados
      const tz = 'America/Sao_Paulo', T0 = Date.UTC(2026, 11, 1, 15), D = diaLocal(T0, tz);
      const MAT = E.modulos.filter(m => m.m === mat), versao = {};
      MAT.forEach(m => m.fc.forEach((c, i) => { versao[m.id + '~' + i] = Number.isInteger(c[2]) && c[2] > 1 ? c[2] : 1; }));
      const todos = Object.keys(versao), novos = todos.filter(id => versao[id] > 1), iguais = todos.filter(id => versao[id] === 1);
      const fc = {}; todos.forEach(id => { fc[id] = [6, D + 50]; });
      const mod = {}; MAT.forEach(m => { mod[m.id] = { lido: dstr(D - 30), tent: 1, best: 0.9, ok: dstr(D - 30) }; });
      const st0 = Object.assign(base({}), { mod, fc, erros: {}, sims: [] }); st0.cfg.prova = '2027-05-30';
      const antes = JSON.stringify(st0), ate = k => novos.filter(id => desvio(id) <= k).length;
      let r = await abrirEm(srv.url, st0, T0, tz);
      ok(await r.guardado() === antes && await r.vencidos() === ate(0), `${nome}: abrir não altera o progresso antigo e devolve só os reformulados de desvio 0 (${ate(0)} de ${novos.length})`);
      await r.p.click('[data-a="tab"][data-v="hoje"]'); await r.p.locator('[data-a="fcini"]').first().click(); await r.p.waitForTimeout(100);
      let n = 0; while (await r.p.locator('[data-a="fcvirar"]').count()) { n++; await r.p.click('[data-a="fcvirar"]'); await r.p.waitForTimeout(30); await r.p.click('[data-a="fcaval"][data-ok="1"]'); await r.p.waitForTimeout(40); }
      const salvo = await r.guardado(), st = JSON.parse(salvo); await r.ctx.close();
      ok(n === ate(0) && iguais.every(id => JSON.stringify(st.fc[id]) === JSON.stringify([6, D + 50]) && !(st.cfg.fcv || {})[id]), `${nome}: no 1º dia só voltam reformulados; os ${iguais.length} mantidos ficam intactos`);
      r = await abrirEm(srv.url, salvo, T0 + 6 * DIA, tz); const v6 = await r.vencidos(); await r.ctx.close();
      ok(v6 === novos.length - n && !r.erros.length, `${nome}: até o 6º dia voltam os demais reformulados (${v6})`);
    }
    srv2.fechar(); srv0.fechar(); fs.rmSync(saida2, { recursive: true, force: true }); fs.rmSync(saida0, { recursive: true, force: true });
  }
};
