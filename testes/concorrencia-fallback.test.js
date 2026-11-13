/* Corrida independente: leitura antiga, gravação concorrente e limpeza de recibo por terceira aba, sem Web Locks.
   Nenhum getItem/setItem adulterado. Breakpoints reais e Page.crash; somente a fixture demo de F01.
   EEAR_F13_PONTO=ultima-conferencia pausa antes do setItem, após a nova conferência; o padrão mantém o ponto antigo.
   Variáveis: EEAR_REPO_ALVO, EEAR_FIREBASE_SDK, EEAR_FIREBASE_CLI, NODE_PATH, PLAYWRIGHT_BROWSERS_PATH. */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const fixture = require('./f01-fixture.js'), alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));

(async () => {
  if (fs.readFileSync(path.join(alvo, 'curso/app/16-diario-duravel.js'), 'utf8').includes("'eear-operacoes'")) { require('./operacoes-interrupcao.test.js'); return; }
  console.log('Concorrência fallback: alvo ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'concorrencia-fallback.test.js'))) return;
  const f = await fixture.abrir(alvo), ctx = await f.contexto(), hj = new Date().toISOString().slice(0, 10);
  let falha = true;
  try {
    await ctx.addInitScript(() => Object.defineProperty(navigator, 'locks', { get: () => undefined, configurable: true }));
    const seed = { v: 1, t: Date.now() - 20000, cfg: { nome: 'Corrida de limpeza', certs: [] }, mod: {}, fc: {}, sims: [], feito: { 'T:base': true }, act: { [hj]: 2 } };
    const conta = await f.conta('limpeza-concorrente', seed), A = await f.pagina(ctx); await f.entrar(A, conta.email);
    const B = await f.pagina(ctx), C = await f.pagina(ctx);
    for (const p of [B, C]) { await f.clicar(p, 'tab', { v: 'plano' }); await p.waitForSelector('[data-a="contasair"]'); }
    if (!await f.ate(async () => { for (const p of [A, B, C]) { await f.estado(p); if ((await p.locator('#sync').innerText()) !== 'Progresso salvo na sua conta.') return false; } return true; })) throw new Error('Base não confirmada nas três abas.');
    f.rede(ctx, true);
    const k = 'missao-eear-v1@firebase:' + conta.uid, pre = 'missao-eear-v1-diario@firebase:' + conta.uid + '#';
    const cache = p => p.evaluate(k => JSON.parse(localStorage.getItem(k)), k);
    const diariosB = p => p.evaluate(pre => Object.keys(localStorage).filter(k => k.startsWith(pre)).map(k => JSON.parse(localStorage.getItem(k))).filter(d => d.st.feito['T:B']).length, pre);
    const linhas = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n');
    const ultima = process.env.EEAR_F13_PONTO === 'ultima-conferencia';
    const leitura = linhas.findIndex(l => ultima ? l.startsWith('      try { localStorage.setItem(k, novo); } catch (e)') : l === '    let atual = txt0 != null ? estadoDe(txt0) : null;');
    const escrita = linhas.findIndex(l => l === '      gravouLocal = true; txt = novo;');
    if (leitura < 0 || escrita < 0) throw new Error('Revisar pontos de interrupção nativos.');
    const cdp = await ctx.newCDPSession(A); await cdp.send('Debugger.enable');
    const url = new URL('app.js', A.url()).href;
    const bp1 = await cdp.send('Debugger.setBreakpointByUrl', { url, lineNumber: leitura, condition: '!!S.feito["T:A"]' });
    const bp2 = await cdp.send('Debugger.setBreakpointByUrl', { url, lineNumber: escrita, condition: '!!S.feito["T:A"]' });
    if (!bp2.locations.length) throw new Error('O ponto posterior ao setItem não foi resolvido pelo Chromium.');
    const pausa = () => new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Breakpoint não atingido')), 10000); cdp.once('Debugger.paused', r => { clearTimeout(t); resolve(r); }); });
    let parou = pausa(); const gravando = f.clicar(A, 'marcar', { k: 'T:A' }).catch(() => null); await parou;
    await f.clicar(B, 'marcar', { k: 'T:B' });
    if (!await f.ate(async () => (await cache(B)).feito['T:B'])) throw new Error('B não consolidou.');
    const aceitoB = !!(await f.estado(B)).feito['T:B'], persistidoB = !!(await cache(B)).feito['T:B'], recibosAntes = await diariosB(B);
    const temIDB = fs.existsSync(path.join(alvo, 'curso/app/16-diario-duravel.js'));
    const espelhosB = p => p.evaluate(pre => new Promise((resolve, reject) => {
      const o = window.indexedDB.open('eear-diarios', 1); o.onerror = () => reject(o.error);
      o.onsuccess = () => { const db = o.result, t = db.transaction('d', 'readonly'), r = t.objectStore('d').openCursor(); let n = 0;
        r.onsuccess = () => { const c = r.result; if (c) { if (String(c.key).startsWith(pre) && JSON.parse(c.value).st.feito['T:B']) n++; c.continue(); } };
        t.oncomplete = () => { db.close(); resolve(n); }; t.onerror = () => reject(t.error);
      };
    }), pre);
    const espelhosAntes = temIDB ? await espelhosB(B) : null;
    const inicioLimpeza = Date.now();
    await B.close();
    const limpou = await f.ate(async () => await diariosB(C) === 0, 7000), aposLimpeza = await cache(C);
    if (!aceitoB || !persistidoB || !recibosAntes || !limpou || !aposLimpeza.feito['T:B']) throw new Error('Não comprovou B aceito/persistido e remoção do recibo, mantendo B na cópia principal.');
    const limpouIDB = !temIDB || await f.ate(async () => await espelhosB(C) === 0, 5000);
    const limpezaMs = Date.now() - inicioLimpeza;
    if (temIDB && (!espelhosAntes || !limpouIDB)) throw new Error('Não comprovou a cópia e sua remoção efetiva no IndexedDB.');
    await C.close();
    await cdp.send('Debugger.removeBreakpoint', { breakpointId: bp1.breakpointId }); parou = pausa(); await cdp.send('Debugger.resume');
    const frame = (await parou).callFrames[0].callFrameId;
    const raw = await cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: frame, expression: 'localStorage.getItem(k)', returnByValue: true });
    const principalA = JSON.parse(raw.result.value);
    const caiu = A.waitForEvent('crash', { timeout: 10000 }); cdp.send('Page.crash').catch(() => null); await caiu; await A.close(); await gravando;
    const D = await f.pagina(ctx); let s;
    const recuperou = await f.ate(async () => { s = await f.estado(D); return s.feito['T:A'] && s.feito['T:B'] && s.act[hj] === 4; });
    const recibosDepois = await diariosB(D), principalD = await cache(D);
    const espelhosDepois = temIDB ? await espelhosB(D) : null;
    f.rede(ctx, false); await D.evaluate(() => window.dispatchEvent(new Event('online')));
    const chegou = await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.feito['T:A'] && s.feito['T:B'] && s.act[hj] === 4; }, recuperou ? 20000 : 3000);
    const servidor = await f.ler(conta.uid), aviso = await D.locator('#sync').innerText();
    falha = !(recuperou && chegou);
    console.log(`${falha ? '✗' : '✓'} limpeza-concorrente: ${JSON.stringify({ ponto: ultima ? 'depois da última conferência, antes do setItem' : 'depois da primeira leitura', webLocks: false, aceitoB, persistidoB, recibosAntes, espelhosAntes, limpou, limpouIDB, limpezaMs, aposLimpeza: aposLimpeza.feito, principalA: principalA.feito, recuperou, recibosDepois, espelhosDepois, exportado: s.feito, principalD: principalD.feito, servidor: servidor.feito, atividade: s.act[hj], aviso })}`);
  } catch (e) { console.log('✗ FALHA DE PREPARAÇÃO/EXECUÇÃO: ' + e.message); }
  finally { await ctx.close(); await f.fechar(); }
  process.exitCode = falha ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
