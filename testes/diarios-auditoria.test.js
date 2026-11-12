/* Auditoria independente de diários/Web Locks. Não importa testes do autor nem modifica o alvo.
   Mesmas variáveis de f01-abas.test.js; EEAR_DIARIOS_CENARIOS seleciona casos separados por vírgula.
   Bloqueios de depurador são interrupções reais depois do setItem do diário, não leituras/escritas falsificadas. */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));

(async () => {
  console.log('Diários: alvo ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'diarios-auditoria.test.js'))) return;
  const f = await fixture.abrir(alvo), hj = new Date().toISOString().slice(0, 10);
  const cenarios = (process.env.EEAR_DIARIOS_CENARIOS || 'apos-diario,apos-diario-crash,sem-web-locks,sem-web-locks-crash,exclusao-com-diario-pendente,concorrencia-intensa,sem-notificacoes,lider-suspensa').split(',');
  const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'DIARIO-CERT', o: 'curso', t: 1792195200000 };
  let falhas = 0;
  const abrirParado = async (ctx, p, aposSalvar = false) => {
    const linhas = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n');
    const numero = aposSalvar ? linhas.findIndex(l => l === '    const k = chave(LS);') : linhas.findIndex(l => l === '    loc.escritora = true;');
    if (numero < 0) throw new Error('Revisar ponto posterior ao setItem do diário para este snapshot.');
    const cdp = await ctx.newCDPSession(p); await cdp.send('Debugger.enable');
    const condition = aposSalvar ? '!!S.feito["T:aceita"] && !JSON.parse(localStorage.getItem(chave(LS))).feito["T:aceita"]' : undefined;
    const bp = await cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', p.url()).href, lineNumber: numero, columnNumber: 0, ...(condition ? { condition } : {}) });
    const parada = new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('O diário não atingiu o breakpoint')), 10000);
      cdp.once('Debugger.paused', r => { clearTimeout(t); resolve(r); });
    });
    return { cdp, bp, parada };
  };
  try {
    for (const nome of cenarios) {
      const ctx = await f.contexto();
      try {
        if (nome.startsWith('sem-web-locks')) await ctx.addInitScript(() => Object.defineProperty(navigator, 'locks', { get: () => undefined, configurable: true }));
        if (nome === 'sem-notificacoes') await ctx.addInitScript(() => window.addEventListener('storage', e => e.stopImmediatePropagation(), true));
        const seed = { v: 1, t: Date.now() - 20000, cfg: { nome: 'Auditoria diários', certs: [cert] }, mod: {}, fc: {}, sims: [], feito: { 'T:base': true }, act: { [hj]: 2 } };
        const conta = await f.conta('diarios-' + nome, seed), A = await f.pagina(ctx); await f.entrar(A, conta.email);
        const B = await f.pagina(ctx); await f.clicar(B, 'tab', { v: 'plano' }); await B.waitForSelector('[data-a="contasair"]');
        if (!(await f.ate(async () => {
          await f.estado(A); await f.estado(B);
          return (await A.locator('#sync').innerText()) === 'Progresso salvo na sua conta.' && (await B.locator('#sync').innerText()) === 'Progresso salvo na sua conta.';
        }))) throw new Error('Preparação: base não confirmada nas duas páginas.');
        const chave = 'missao-eear-v1@firebase:' + conta.uid;
        const pre = 'missao-eear-v1-diario@firebase:' + conta.uid + '#';
        const marcar = (p, k) => f.clicar(p, 'marcar', { k });
        const cache = p => p.evaluate(k => JSON.parse(localStorage.getItem(k)), chave);
        const diariosCom = (p, k) => p.evaluate(([pre, k]) => Object.keys(localStorage).filter(n => n.startsWith(pre)).map(n => JSON.parse(localStorage.getItem(n))).filter(d => d.st.feito[k]).length, [pre, k]);
        let passou = false, resultado;
        if (nome.startsWith('apos-diario') || nome.startsWith('sem-web-locks')) {
          f.rede(ctx, true);
          const semTrava = nome.startsWith('sem-web-locks');
          const trava = await abrirParado(ctx, A, semTrava), gravando = marcar(A, 'T:aceita').catch(() => null);
          const parada = await trava.parada;
          const raw = await trava.cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: parada.callFrames[0].callFrameId,
            expression: 'localStorage.getItem(chaveDiario(loc.tab))', returnByValue: true });
          const diario = JSON.parse(raw.result.value), duravel = !!diario.st.feito['T:aceita'];
          const principal = await trava.cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: parada.callFrames[0].callFrameId,
            expression: 'JSON.parse(localStorage.getItem(chave(LS)))', returnByValue: true });
          const principalJaContinha = !!principal.result.value.feito['T:aceita'];
          const ui = await trava.cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: parada.callFrames[0].callFrameId,
            expression: '!!(document.getElementById("exp-txt") && JSON.parse(document.getElementById("exp-txt").value).feito["T:aceita"])', returnByValue: true });
          const aceitaNaExportacao = ui.result.value === true;
          const vistoEmOutraAba = await diariosCom(B, 'T:aceita');
          if (nome.endsWith('-crash')) {
            const caiu = A.waitForEvent('crash', { timeout: 10000 });
            trava.cdp.send('Page.crash').catch(() => null); await caiu;
          }
          await A.close(); await gravando;
          await B.reload(); let s;
          const recuperado = await f.ate(async () => { s = await f.estado(B); return s.feito['T:aceita'] && (await cache(B)).feito['T:aceita']; });
          const restantes = await diariosCom(B, 'T:aceita');
          f.rede(ctx, false); await B.evaluate(() => window.dispatchEvent(new Event('online')));
          const chegou = await f.ate(async () => { const n = await f.ler(conta.uid); return n && n.feito['T:aceita']; }, recuperado ? 20000 : 3000);
          const aviso = await B.locator('#sync').innerText();
          let ofereceuExcluir = false, diarioDepois = restantes;
          if (!recuperado) {
            await f.clicar(B, 'dadosapagar'); ofereceuExcluir = await B.locator('[data-a="dadosapagarok"]').isVisible().catch(() => false);
            if (ofereceuExcluir) { await B.click('[data-a="dadosapagarok"]'); diarioDepois = await diariosCom(B, 'T:aceita'); }
          }
          passou = duravel && (!semTrava || (aceitaNaExportacao && !principalJaContinha)) && recuperado && chegou;
          resultado = { webLocks: await B.evaluate(() => !!navigator.locks), interrupcao: nome.endsWith('-crash') ? 'Page.crash' : 'fechamento', duravel, vistoEmOutraAba, aceitaNaExportacao, principalJaContinha, ponto: parada.callFrames[0].location, aposHandlerDeSalvar: semTrava, recuperado, chegou, exportado: s.feito, diariosAntesExcluir: restantes, ofereceuExcluir, diarioDepois, aviso };
        } else if (nome === 'exclusao-com-diario-pendente') {
          f.rede(ctx, true);
          const trava = await abrirParado(ctx, B, true), gravando = marcar(B, 'T:aceita').catch(() => null);
          const pausa = await trava.parada;
          const ui = await trava.cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: pausa.callFrames[0].callFrameId,
            expression: '!!(document.getElementById("exp-txt") && JSON.parse(document.getElementById("exp-txt").value).feito["T:aceita"])', returnByValue: true });
          const principal = await trava.cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: pausa.callFrames[0].callFrameId,
            expression: 'JSON.parse(localStorage.getItem(chave(LS)))', returnByValue: true });
          const principalJaContinha = !!principal.result.value.feito['T:aceita'];
          const duraveisAntes = await diariosCom(A, 'T:aceita');
          const avisoAntes = await A.locator('#sync').innerText();
          await f.clicar(A, 'dadosapagar');
          const ofereceuExcluir = await A.locator('[data-a="dadosapagarok"]').isVisible().catch(() => false);
          if (ofereceuExcluir) await A.click('[data-a="dadosapagarok"]');
          const duraveisDepois = await diariosCom(A, 'T:aceita');
          const caiu = B.waitForEvent('crash', { timeout: 10000 }); trava.cdp.send('Page.crash').catch(() => null); await caiu;
          await B.close(); await gravando;
          const C = await f.pagina(ctx); let s;
          const recuperado = await f.ate(async () => { s = await f.estado(C); return s.feito['T:aceita']; }, 10000);
          f.rede(ctx, false); await C.evaluate(() => window.dispatchEvent(new Event('online')));
          const chegou = await f.ate(async () => { const n = await f.ler(conta.uid); return n && n.feito['T:aceita']; }, recuperado ? 20000 : 3000);
          const servidor = await f.ler(conta.uid);
          passou = ui.result.value === true && !principalJaContinha && duraveisAntes > 0 && (!ofereceuExcluir || duraveisDepois > 0) && recuperado && chegou;
          resultado = { webLocks: await A.evaluate(() => !!navigator.locks), aceitaNaExportacao: ui.result.value, principalJaContinha, duraveisAntes, avisoAntes, ofereceuExcluir, duraveisDepois, recuperado, chegou, exportado: s.feito, servidor: servidor.feito };
        } else if (nome === 'concorrencia-intensa') {
          const paginas = [A, B];
          for (let i = 0; i < 2; i++) { const p = await f.pagina(ctx); await f.clicar(p, 'tab', { v: 'plano' }); await p.waitForSelector('[data-a="contasair"]'); paginas.push(p); }
          f.rede(ctx, true); const n = 50, esperadas = paginas.length * n, total = 2 + esperadas;
          for (let i = 0; i < n; i++) await Promise.all(paginas.map((p, j) => marcar(p, `T:${j}-${i}`)));
          const completa = s => s && s.act[hj] === total && s.cfg.certs.some(c => c.c === cert.c) && Array.from({ length: n }, (_, i) => i).every(i => paginas.every((_, j) => s.feito[`T:${j}-${i}`]));
          const convergiu = await f.ate(async () => { const estados = await Promise.all(paginas.map(p => f.estado(p))); return estados.every(completa) && completa(await cache(B)); }, 30000);
          await Promise.all(paginas.map(p => p.close()));
          const C = await f.pagina(ctx); let s;
          const recuperado = await f.ate(async () => { s = await f.estado(C); return completa(s) && completa(await cache(C)); }, 30000);
          f.rede(ctx, false); await C.evaluate(() => window.dispatchEvent(new Event('online')));
          const chegou = await f.ate(async () => completa(await f.ler(conta.uid)), 30000);
          passou = convergiu && recuperado && chegou;
          resultado = { paginas: paginas.length, alteracoes: esperadas, totalEsperado: total, atividade: s.act[hj], marcacoes: Object.keys(s.feito).length, convergiu, recuperado, chegou };
        } else if (nome === 'sem-notificacoes') {
          f.rede(ctx, true); await marcar(A, 'T:ativa'); await f.ate(async () => (await cache(A)).feito['T:ativa']);
          const trava = await abrirParado(ctx, B), gravando = marcar(B, 'T:orfao').catch(() => null); await trava.parada;
          await B.close(); await gravando;
          let s; const recuperouViva = await f.ate(async () => { s = await f.estado(A); return s.feito['T:orfao']; }, 6000);
          const diarios = await diariosCom(A, 'T:orfao');
          const C = await f.pagina(ctx);
          const recuperouFria = await f.ate(async () => { s = await f.estado(C); return s.feito['T:orfao'] && (await cache(C)).feito['T:orfao']; });
          passou = recuperouViva && recuperouFria;
          resultado = { recuperouViva, diarios, recuperouFria, estado: s.feito };
        } else if (nome === 'lider-suspensa') {
          await marcar(B, 'T:identificar-lider');
          const papelB = await B.locator('#sync').innerText();
          const lider = /Outra aba/.test(papelB) ? A : B, seguidora = lider === A ? B : A;
          if (!(await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.feito['T:identificar-lider']; }))) throw new Error('Probe de liderança não chegou ao servidor.');
          const cdp = await ctx.newCDPSession(lider);
          await lider.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
          await cdp.send('Page.setWebLifecycleState', { state: 'frozen' });
          await marcar(seguidora, 'T:com-lider-congelada');
          const aviso = await seguidora.locator('#sync').innerText();
          if (!/Outra aba/.test(aviso)) throw new Error('A página ativa não confirmou papel de seguidora: ' + aviso);
          const local = await f.ate(async () => (await cache(seguidora)).feito['T:com-lider-congelada']);
          const enviouCongelada = await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.feito['T:com-lider-congelada']; }, 6000);
          await cdp.send('Page.setWebLifecycleState', { state: 'active' });
          await lider.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
          const enviouDepois = await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.feito['T:com-lider-congelada']; });
          passou = local && enviouCongelada && enviouDepois; resultado = { lider: lider === A ? 'A' : 'B', papelB, local, enviouCongelada, enviouDepois, aviso };
        } else throw new Error('Cenário desconhecido: ' + nome);
        console.log(`${passou ? '✓' : '✗'} ${nome}: ${JSON.stringify(resultado)}`); if (!passou) falhas++;
      } catch (e) { console.log(`✗ ${nome}: FALHA DE PREPARAÇÃO/EXECUÇÃO: ${e.message}`); falhas++; }
      finally { await ctx.close(); }
    }
  } finally { await f.fechar(); }
  console.log(`Diários: ${falhas} falha(s) em ${cenarios.length} cenários.`); process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
