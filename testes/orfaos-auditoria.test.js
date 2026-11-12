/* Auditoria independente de retorno de abas vivas consideradas órfãs por tempo.
   EEAR_ORFAOS_CENARIOS: retorno-8s,segunda-escrita-8s,segunda-escrita-30min,crash-processo.
   EEAR_ORFAOS_SEQUENCIAS amplia os casos segunda-escrita (padrão 2, até 30), exigindo todas as marcas e a contagem exata.
   Mesma fixture/emuladores de F01; nenhuma leitura/gravação de localStorage é falsificada.
   O caso 30min controla somente Date.now do observador e do retorno: não espera 30 minutos reais. */
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const hj = new Date().toISOString().slice(0, 10);
const seed = () => ({ v: 1, t: Date.now() - 20000, cfg: { nome: 'Auditoria órfãos', certs: [{ s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'ORFAO-CERT', o: 'curso', t: 1792195200000 }] }, mod: {}, fc: {}, sims: [], feito: { 'T:base': true }, act: { [hj]: 2 } });
const delay = ms => new Promise(r => setTimeout(r, ms));

async function breakpoint(ctx, p, segunda) {
  const linhas = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n');
  const n = linhas.findIndex(l => segunda ? l.startsWith('    localStorage.setItem(chaveDiario(loc.tab), JSON.stringify(') : l === '    const k = chave(LS);');
  if (n < 0) throw new Error('Revisar breakpoint nativo para este snapshot.');
  const cdp = await ctx.newCDPSession(p); await cdp.send('Debugger.enable');
  const condition = segunda ? '!!S.feito["T:segundo"]' : '!!S.feito["T:primeiro"] && !JSON.parse(localStorage.getItem(chave(LS))).feito["T:primeiro"]';
  const bp = await cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', p.url()).href, lineNumber: n, columnNumber: 0, condition });
  const parada = new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Breakpoint não atingido')), 10000); cdp.once('Debugger.paused', r => { clearTimeout(t); resolve(r); }); });
  return { cdp, bp, parada };
}

async function semTravas(ctx) {
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'locks', { get: () => undefined, configurable: true });
    window.addEventListener('storage', e => e.stopImmediatePropagation(), true);
  });
}

async function retorno(f, nome) {
  const ctx = await f.contexto();
  try {
    await semTravas(ctx);
    const conta = await f.conta('orfaos-' + nome, seed()), A = await f.pagina(ctx); await f.entrar(A, conta.email);
    const B = await f.pagina(ctx); await f.clicar(B, 'tab', { v: 'plano' }); await B.waitForSelector('[data-a="contasair"]');
    if (!await f.ate(async () => { await f.estado(A); await f.estado(B); return (await A.locator('#sync').innerText()) === 'Progresso salvo na sua conta.' && (await B.locator('#sync').innerText()) === 'Progresso salvo na sua conta.'; })) throw new Error('Base ainda não confirmada.');
    const k = 'missao-eear-v1@firebase:' + conta.uid, cache = () => A.evaluate(k => JSON.parse(localStorage.getItem(k)), k);
    f.rede(ctx, true);
    const segunda = nome !== 'retorno-8s', oculta = nome.endsWith('30min');
    if (oculta) await B.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const trava = await breakpoint(ctx, B, segunda);
    const quantidade = segunda ? Number(process.env.EEAR_ORFAOS_SEQUENCIAS || 2) : 1;
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 30) throw new Error('Quantidade de sequências fora do limite de teste.');
    const marcas = Array.from({ length: quantidade }, (_, i) => i === 0 ? 'T:primeiro' : i === 1 ? 'T:segundo' : 'T:seq-' + (i + 1));
    const acao = B.evaluate(marcas => {
      for (const k of marcas) {
        const b = document.createElement('button'); b.dataset.a = 'marcar'; b.dataset.k = k; document.body.appendChild(b); b.click(); b.remove();
      }
    }, marcas).catch(() => null);
    const pausa = await trava.parada, frame = pausa.callFrames[0].callFrameId;
    const captura = await trava.cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: frame, returnByValue: true,
      expression: '({diario:JSON.parse(localStorage.getItem(chaveDiario(loc.tab))), vida:JSON.parse(localStorage.getItem(chaveVida(loc.tab))), tab:loc.tab, seq:loc.seq, exportado:JSON.parse(document.getElementById("exp-txt").value).feito})' });
    const c = captura.result.value;
    if (!c || !c.diario.st.feito['T:primeiro'] || !c.exportado['T:primeiro'] || (await cache()).feito['T:primeiro']) throw new Error('Não comprovou primeiro estudo aceito/diário durável fora da cópia.');
    if (oculta && !c.vida.oculta) throw new Error('Não registrou estado de segundo plano.');
    const inicio = Date.now(); let antesDoPrazo = true;
    if (oculta) { await A.evaluate(t => { Date.now = () => t; }, c.vida.t + 1799999); await delay(3500); antesDoPrazo = !(await cache()).feito['T:primeiro']; await A.evaluate(t => { Date.now = () => t; }, c.vida.t + 1800001); }
    const adotou = await f.ate(async () => (await cache()).feito['T:primeiro'], 15000);
    const adotado = await cache(), inc = adotado._abas && adotado._abas.inc[c.tab];
    if (!adotou || inc !== c.diario.seq || adotado.act[hj] !== 3) throw new Error('Adoção do primeiro diário não confirmada exatamente uma vez: ' + JSON.stringify(adotado));
    await delay(3300); const antesRetornar = await cache();
    if (oculta) await trava.cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: frame, expression: 'Date.now = () => ' + (c.vida.t + 1800001) });
    let historico = null, pausaFinal;
    if (quantidade > 2) {
      const linhas = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n'), lineNumber = linhas.findIndex(l => l === '    const k = chave(LS);');
      if (lineNumber < 0) throw new Error('Revisar o ponto nativo de consolidação.');
      pausaFinal = new Promise((r, reject) => { const t = setTimeout(() => reject(new Error('Não atingiu a consolidação após todas as sequências')), 10000); trava.cdp.once('Debugger.paused', p => { clearTimeout(t); r(p); }); });
      await trava.cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', B.url()).href, lineNumber, condition: '!!S.feito[' + JSON.stringify(marcas[marcas.length - 1]) + ']' });
    }
    await trava.cdp.send('Debugger.removeBreakpoint', { breakpointId: trava.bp.breakpointId }); await trava.cdp.send('Debugger.resume');
    if (pausaFinal) {
      const p = await pausaFinal;
      const r = await trava.cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: p.callFrames[0].callFrameId, returnByValue: true,
        expression: '({diario:JSON.parse(localStorage.getItem(chaveDiario(loc.tab))),inc:JSON.parse(localStorage.getItem(chave(LS)))._abas.inc[loc.tab]})' });
      historico = { seq: r.result.value.diario.seq, inc: r.result.value.inc, ant: (r.result.value.diario.ant || []).map(x => x.seq) };
      await trava.cdp.send('Debugger.disable');
    }
    await acao;
    const esperado = 2 + quantidade, temMarcas = s => !!s && marcas.every(k => s.feito[k]); let st;
    const correto = await f.ate(async () => { st = await f.estado(B); const a = await cache(); return st.act[hj] === esperado && a.act[hj] === esperado && temMarcas(st) && temMarcas(a); }, 6000);
    const final = await cache();
    f.rede(ctx, false); await B.evaluate(() => window.dispatchEvent(new Event('online')));
    const nuvemCorreta = await f.ate(async () => { const s = await f.ler(conta.uid); return temMarcas(s) && s.act[hj] === esperado; }, 10000);
    const servidor = await f.ler(conta.uid);
    await A.close(); await B.close(); const C = await f.pagina(ctx); const reaberto = await f.estado(C);
    const passou = antesDoPrazo && correto && nuvemCorreta && antesRetornar.act[hj] === 3 && temMarcas(reaberto) && reaberto.act[hj] === esperado && reaberto.cfg.certs.some(c => c.c === 'ORFAO-CERT');
    return { passou, resultado: { webLocks: false, eventosStorage: false, oculta, relogioControlado: oculta, quantidade, historico, primeiroAceito: true, diarioSeq: c.diario.seq, novaSeq: c.seq, antesDoPrazo, adotou, esperaRealMs: Date.now() - inicio, antesRetornar: antesRetornar.act[hj], esperado, UI: st.act[hj], cache: final.act[hj], feito: final.feito, servidor: servidor.act[hj], reaberto: reaberto.act[hj], correto, nuvemCorreta } };
  } finally { await ctx.close(); }
}

async function crashProcesso(f) {
  const ancora = await f.contexto(), p0 = await f.pagina(ancora), origem = new URL(p0.url()).origin;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-crash-browser-'));
  let ctx, offline = false;
  const abrir = async () => {
    const ctx = await chromium.launchPersistentContext(dir, { serviceWorkers: 'block' }); await semTravas(ctx);
    await ctx.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('exportação visível'); } }, configurable: true }));
    await ctx.route('**/*', r => {
      const u = new URL(r.request().url());
      if (u.origin === 'https://www.gstatic.com' && u.pathname.startsWith('/firebasejs/12.19.0/')) return r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.EEAR_FIREBASE_SDK, path.basename(u.pathname))) });
      if (u.hostname === '127.0.0.1' && ['8180', '9199'].includes(u.port)) return offline ? r.abort('internetdisconnected') : r.continue();
      return u.origin === origem ? r.continue() : r.abort();
    });
    return ctx;
  };
  try {
    const conta = await f.conta('orfaos-crash-processo', seed()); ctx = await abrir();
    const A = await f.pagina(ctx); await f.entrar(A, conta.email);
    if (!await f.ate(async () => (await A.locator('#sync').innerText()) === 'Progresso salvo na sua conta.')) throw new Error('Base não sincronizada.');
    await f.estado(A);
    console.log('  crash-processo: sessão/base confirmadas antes da interrupção.');
    offline = true; const trava = await breakpoint(ctx, A, false);
    f.clicar(A, 'marcar', { k: 'T:primeiro' }).catch(() => null); const pausa = await trava.parada;
    const raw = await trava.cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: pausa.callFrames[0].callFrameId, returnByValue: true,
      expression: '({diario:JSON.parse(localStorage.getItem(chaveDiario(loc.tab))),principal:JSON.parse(localStorage.getItem(chave(LS))),aceita:JSON.parse(document.getElementById("exp-txt").value).feito["T:primeiro"]})' });
    if (!raw.result.value.aceita || !raw.result.value.diario.st.feito['T:primeiro'] || raw.result.value.principal.feito['T:primeiro']) throw new Error('Precondições de aceitação/durabilidade não comprovadas.');
    const Q = await f.pagina(ctx); await f.clicar(Q, 'tab', { v: 'plano' }); await Q.waitForSelector('[data-a="contasair"]');
    await f.clicar(Q, 'dadosapagar');
    const ofereceuExcluir = await Q.locator('[data-a="dadosapagarok"]').isVisible().catch(() => false);
    const diarioLegivel = await Q.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('missao-eear-v1-diario@') && JSON.parse(localStorage.getItem(k)).st.feito['T:primeiro']));
    await Q.close();
    const esperaAntesCrash = Number(process.env.EEAR_CRASH_ESPERA_MS || 1200);
    await delay(esperaAntesCrash); // controle diagnóstico de flush; o critério de recuperação permanece o mesmo
    const caiu = ctx.waitForEvent('close', { timeout: 10000 }); trava.cdp.send('Browser.crash').catch(() => null); await caiu;
    console.log('  crash-processo: Browser.crash fechou o contexto; reabrindo o mesmo perfil.');
    ctx = await abrir();
    const probe = await ctx.newPage(); await probe.goto(origem + '/sonda-auditoria-sem-app'); // 404 da fixture: mesma origem, nenhum app executado
    const preApp = await probe.evaluate(uid => ({ principal: localStorage.getItem('missao-eear-v1@firebase:' + uid), diarios: Object.keys(localStorage).filter(k => k.startsWith('missao-eear-v1-diario@firebase:' + uid + '#')).map(k => JSON.parse(localStorage.getItem(k))) }), conta.uid);
    await probe.close();
    const B = await f.pagina(ctx); await f.clicar(B, 'tab', { v: 'plano' }); await B.waitForSelector('[data-a="contasair"]'); let s;
    const recuperou = await f.ate(async () => { s = await f.estado(B); return s.feito['T:primeiro'] && s.act[hj] === 3; });
    offline = false; await B.evaluate(() => window.dispatchEvent(new Event('online')));
    const chegou = await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.feito['T:primeiro'] && s.act[hj] === 3; });
    return { passou: !ofereceuExcluir && diarioLegivel && recuperou && chegou, resultado: { interrupcao: 'Browser.crash', perfilPersistente: true, esperaAntesCrash, aceitaNaUI: true, diarioLegivel, ofereceuExcluir, principalAntes: raw.result.value.principal.feito, preApp: { principalPresente: preApp.principal !== null, diarios: preApp.diarios.length, diarioContinhaMarcacao: preApp.diarios.some(d => d.st.feito['T:primeiro']) }, recuperou, chegou, estado: s.feito, atividade: s.act[hj] } };
  } finally { if (ctx) await ctx.close().catch(() => null); await ancora.close(); fs.rmSync(dir, { recursive: true, force: true }); }
}

(async () => {
  console.log('Órfãos: alvo ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'orfaos-auditoria.test.js'))) return;
  const f = await fixture.abrir(alvo), cenarios = (process.env.EEAR_ORFAOS_CENARIOS || 'retorno-8s,segunda-escrita-8s,segunda-escrita-30min,crash-processo').split(','); let falhas = 0;
  try {
    for (const nome of cenarios) {
      try { const r = nome === 'crash-processo' ? await crashProcesso(f) : await retorno(f, nome); console.log(`${r.passou ? '✓' : '✗'} ${nome}: ${JSON.stringify(r.resultado)}`); if (!r.passou) falhas++; }
      catch (e) { console.log(`✗ ${nome}: FALHA DE PREPARAÇÃO/EXECUÇÃO: ${e.message}`); falhas++; }
    }
  } finally { await f.fechar(); }
  console.log(`Órfãos: ${falhas} falha(s) em ${cenarios.length} cenários.`); process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
