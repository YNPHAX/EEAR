/* Auditoria adversarial: quota real do navegador, seis abas, líder pausada, IndexedDB indisponível.
   Não modifica o snapshot e não conecta a serviços reais. Mesmas variáveis da fixture F01.
   EEAR_NOTURNA_FALHAS seleciona casos separados por vírgula. */
const path = require('path'), { execFileSync } = require('child_process'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const hj = new Date().toISOString().slice(0, 10), cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'NOTURNA-CERT', o: 'curso', t: 1792195200000 };
const seed = () => ({ v: 1, t: Date.now() - 20000, cfg: { nome: 'Quota Fictícia', certs: [cert] }, mod: {}, fc: {}, sims: [], feito: { 'T:base': true }, act: { [hj]: 2 } });

(async () => {
  console.log('Falhas noturnas: alvo ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'noturna-falhas.test.js'))) return;
  const f = await fixture.abrir(alvo), cenarios = (process.env.EEAR_NOTURNA_FALHAS || 'quota-real,seis-abas,lider-pausada,indexeddb-indisponivel').split(','); let falhas = 0;
  try {
    for (const nome of cenarios) {
      const ctx = await f.contexto();
      try {
        if (nome === 'indexeddb-indisponivel') await ctx.addInitScript(() => Object.defineProperty(window, 'indexedDB', { get: () => { throw new window.DOMException('Capacidade indisponível no teste', 'SecurityError'); } }));
        const conta = await f.conta('falhas-' + nome, seed()), A = await f.pagina(ctx); await f.entrar(A, conta.email);
        const baseConfirmada = await f.ate(async () => {
          const aviso = await A.locator('#sync').innerText();
          if (nome !== 'indexeddb-indisponivel') return aviso === 'Progresso salvo na sua conta.';
          const remoto = await f.ler(conta.uid), local = await f.estado(A);
          return /sem proteção contra queda/.test(aviso) && remoto && remoto.feito['T:base'] && local.feito['T:base'] && remoto.act[hj] === 2 && local.act[hj] === 2;
        });
        if (!baseConfirmada) throw new Error('Base inicial não confirmada.');
        const k = 'missao-eear-v1@firebase:' + conta.uid, pre = 'missao-eear-v1-diario@firebase:' + conta.uid + '#';
        const cache = p => p.evaluate(k => JSON.parse(localStorage.getItem(k)), k);
        let passou = false, resultado;
        if (nome === 'indexeddb-indisponivel') {
          f.rede(ctx, true); await f.clicar(A, 'marcar', { k: 'T:sem-idb' });
          await A.reload(); await f.clicar(A, 'tab', { v: 'plano' }); await A.waitForSelector('[data-a="contasair"]');
          const s = await f.estado(A); f.rede(ctx, false); await A.evaluate(() => window.dispatchEvent(new Event('online')));
          const chegou = await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.feito['T:sem-idb']; });
          passou = !!s.feito['T:sem-idb'] && chegou; resultado = { sessaoPersistiuSemIndexedDB: true, progresso: s.feito, chegou };
        } else {
          const B = await f.pagina(ctx); await f.clicar(B, 'tab', { v: 'plano' }); await B.waitForSelector('[data-a="contasair"]');
          if (!await f.ate(async () => (await B.locator('#sync').innerText()) === 'Progresso salvo na sua conta.')) throw new Error('Base de B não confirmada.');
          if (nome === 'quota-real') {
            f.rede(ctx, true);
            const quota = await B.evaluate(() => {
              const k = 'auditoria-quota-real-ficticia'; let lo = 0, hi = 6500000, negou = false;
              while (lo < hi) { const n = Math.ceil((lo + hi) / 2); try { localStorage.setItem(k, 'q'.repeat(n)); lo = n; } catch (e) { if (e.name !== 'QuotaExceededError') throw e; negou = true; hi = n - 1; } }
              return { caracteres: lo, negou };
            });
            const marca = 'T:quota-' + 'p'.repeat(300); await f.clicar(B, 'marcar', { k: marca });
            const s = await f.estado(B), principal = await cache(B);
            const diario = await B.evaluate(([pre, marca]) => Object.keys(localStorage).filter(k => k.startsWith(pre)).some(k => JSON.parse(localStorage.getItem(k)).st.feito[marca]), [pre, marca]);
            const aviso = await B.locator('#sync').innerText(), alertas = await B.locator('[role="alert"]').allTextContents();
            await B.close(); await A.evaluate(() => localStorage.removeItem('auditoria-quota-real-ficticia'));
            await A.reload(); const reaberto = await f.estado(A);
            const avisou = alertas.some(x => /não.*salv|cheio|bloqueado/i.test(x)) || /não.*salv|cheio|bloqueado/i.test(aviso);
            passou = quota.negou && s.feito[marca] && (reaberto.feito[marca] || avisou);
            resultado = { quota, aceitaNaUI: !!s.feito[marca], principal: !!principal.feito[marca], diario, aviso, alertas, avisou, recuperou: !!reaberto.feito[marca] };
          } else if (nome === 'seis-abas') {
            const ps = [A, B];
            for (let i = 2; i < 6; i++) { const p = await f.pagina(ctx); await f.clicar(p, 'tab', { v: 'plano' }); await p.waitForSelector('[data-a="contasair"]'); ps.push(p); }
            f.rede(ctx, true); const n = 25, total = 2 + n * ps.length, inicio = Date.now();
            for (let i = 0; i < n; i++) await Promise.all(ps.map((p, j) => f.clicar(p, 'marcar', { k: `T:${j}:${i}` })));
            await f.clicar(A, 'marcar', { k: 'T:base' }); // desmarcação concorrente com os outros diários
            const correto = s => s && s.act[hj] === total && !s.feito['T:base'] && s.cfg.certs.some(c => c.c === cert.c) && Array.from({ length: n }, (_, i) => i).every(i => ps.every((_, j) => s.feito[`T:${j}:${i}`]));
            const convergiu = await f.ate(async () => { const ss = await Promise.all(ps.map(p => f.estado(p))); return ss.every(correto); }, 30000);
            await Promise.all(ps.map(p => p.close())); const C = await f.pagina(ctx); let s;
            const reabriu = await f.ate(async () => { s = await f.estado(C); return correto(s) && correto(await cache(C)); });
            f.rede(ctx, false); await C.evaluate(() => window.dispatchEvent(new Event('online')));
            const chegou = await f.ate(async () => correto(await f.ler(conta.uid)));
            passou = convergiu && reabriu && chegou; resultado = { abas: ps.length, alteracoes: n * ps.length, esperado: total, atividade: s.act[hj], marcacoes: Object.keys(s.feito).length, convergiu, reabriu, chegou, duracaoMs: Date.now() - inicio };
          } else if (nome === 'lider-pausada') {
            await f.clicar(B, 'marcar', { k: 'T:probe' });
            const lider = await require('./papel-nuvem.js')(A, conta.uid) ? A : await require('./papel-nuvem.js')(B, conta.uid) ? B : null;
            if (!lider) throw new Error('Não comprovou liderança por clientId do Web Locks.');
            const seguidora = lider === A ? B : A;
            if (!await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.feito['T:probe']; })) throw new Error('Probe não confirmou na nuvem.');
            const cdp = await ctx.newCDPSession(lider); await cdp.send('Debugger.enable');
            await lider.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
            const pausa = new Promise(r => cdp.once('Debugger.paused', r)); await cdp.send('Debugger.pause'); await pausa;
            await f.clicar(seguidora, 'marcar', { k: 'T:lider-parada' });
            const principal = await f.ate(async () => (await cache(seguidora)).feito['T:lider-parada'], 2000);
            const diario = await seguidora.evaluate(pre => Object.keys(localStorage).filter(k => k.startsWith(pre)).some(k => JSON.parse(localStorage.getItem(k)).st.feito['T:lider-parada']), pre);
            const local = principal || diario;
            const enviouPausada = await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.feito['T:lider-parada']; }, 7000);
            const aviso = await seguidora.locator('#sync').innerText();
            await cdp.send('Debugger.resume');
            const enviouRetorno = await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.feito['T:lider-parada']; });
            passou = local && enviouPausada && enviouRetorno; resultado = { local, principal, diario, enviouPausada, enviouRetorno, aviso, lider: lider === A ? 'A' : 'B' };
          } else throw new Error('Cenário desconhecido: ' + nome);
        }
        console.log(`${passou ? '✓' : '✗'} ${nome}: ${JSON.stringify(resultado)}`); if (!passou) falhas++;
      } catch (e) { console.log(`✗ ${nome}: FALHA DE PREPARAÇÃO/EXECUÇÃO: ${e.message}`); falhas++; }
      finally { await ctx.close(); }
    }
  } finally { await f.fechar(); }
  console.log(`Falhas noturnas: ${falhas} falha(s) em ${cenarios.length} cenários.`); process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
