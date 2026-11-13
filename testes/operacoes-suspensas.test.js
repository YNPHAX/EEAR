/* Retorno de aba suspensa com operações identificadas. Sem Web Locks nem eventos storage.
   Pausa nativa antes da segunda operação; primeira aceita é adotada pela outra aba antes da retomada.
   Mantém todas as marcações, certificado e contagem exata em UI/cache/servidor/reabertura, incluindo 9+ sequências. */
const fs = require('fs'), path = require('path'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'operacoes-suspensas.test.js'))) return;
  const f = await fixture.abrir(alvo), nomes = (process.env.EEAR_ORFAOS_CENARIOS || 'retorno-8s,segunda-escrita-8s,segunda-escrita-30min').split(','), hj = new Date().toISOString().slice(0, 10); let falhas = 0;
  try {
    for (const nome of nomes) {
      const ctx = await f.contexto();
      try {
        await ctx.addInitScript(() => { Object.defineProperty(navigator, 'locks', { get: () => undefined, configurable: true }); window.addEventListener('storage', e => e.stopImmediatePropagation(), true); });
        const n = nome === 'retorno-8s' ? 1 : Number(process.env.EEAR_ORFAOS_SEQUENCIAS || 2), marcas = Array.from({ length: n }, (_, i) => i === 0 ? 'T:primeiro' : i === 1 ? 'T:segundo' : 'T:seq-' + (i + 1));
        const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'ORFAO-CERT', o: 'curso', t: 1792195200000 };
        const conta = await f.conta('op-suspensa-' + nome, { v: 1, t: Date.now() - 20000, cfg: { nome: 'Suspensão Fictícia', certs: [cert] }, feito: { 'T:base': true }, act: { [hj]: 2 } });
        const A = await f.pagina(ctx); await f.entrar(A, conta.email); const B = await f.pagina(ctx);
        for (const p of [A, B]) if (!await f.ate(async () => (await f.estado(p)).act[hj] === 2 && (await p.locator('#sync').innerText()) === 'Progresso salvo na sua conta.')) throw new Error('Base não confirmada.');
        f.rede(ctx, true);
        const linhas = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n');
        const lineNumber = linhas.findIndex(l => n > 1 ? l.includes('const id = identidade, antes = loc.vista') : l.trim() === "case 'tab':");
        if (lineNumber < 0) throw new Error('Revisar o ponto nativo de persistência.');
        const cdp = await ctx.newCDPSession(B); await cdp.send('Debugger.enable');
        await cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', B.url()).href, lineNumber, condition: n > 1 ? '!!S.feito["T:segundo"] && !loc.vista.feito["T:segundo"]' : '!!S.feito["T:primeiro"]' });
        const pausa = new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Breakpoint não atingido')), 10000); cdp.once('Debugger.paused', p => { clearTimeout(t); resolve(p); }); });
        // Uma operação: suspende no próximo evento de navegação, no mesmo turno JS, após aceite/render e antes
        // de criar transações assíncronas. Pausar enfileirar() podia segurar outra transação e impedir a pré-condição.
        const acao = B.evaluate(ms => { for (const k of ms) { const e = document.createElement('button'); e.dataset.a = 'marcar'; e.dataset.k = k; document.body.appendChild(e); e.click(); e.remove(); } if (ms.length === 1) { const e = document.createElement('button'); e.dataset.a = 'tab'; e.dataset.v = 'plano'; document.body.appendChild(e); e.click(); e.remove(); } }, marcas).catch(() => null);
        const frame = (await pausa).callFrames[0].callFrameId;
        const r = await cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: frame, returnByValue: true, expression: 'JSON.parse(document.getElementById("exp-txt").value).feito' });
        if (!r.result.value['T:primeiro']) throw new Error('Primeira alteração não foi aceita pela UI antes da pausa.');
        const adotou = await f.ate(async () => { const s = await f.estado(A); return s.feito['T:primeiro'] && s.act[hj] === 3; });
        if (!adotou) throw new Error('Não adotou exatamente uma vez a operação já aceita.');
        await A.waitForTimeout(8500);
        if (nome.endsWith('30min')) await cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: frame, expression: 'Date.now = () => ' + (Date.now() + 1800001) });
        await cdp.send('Debugger.disable'); await acao;
        const esperado = s => s && marcas.every(k => s.feito[k]) && s.act[hj] === 2 + n && s.cfg.certs.some(c => c.c === cert.c);
        const local = await f.ate(async () => esperado(await f.estado(A)) && esperado(await f.estado(B)));
        f.rede(ctx, false); await A.evaluate(() => window.dispatchEvent(new Event('online')));
        const servidor = await f.ate(async () => esperado(await f.ler(conta.uid)));
        await A.close(); await B.close(); const C = await f.pagina(ctx); let s;
        const reabriu = await f.ate(async () => { s = await f.estado(C); return esperado(s); });
        const passou = local && servidor && reabriu; if (!passou) falhas++;
        console.log(`${passou ? '✓' : '✗'} ${nome}: ${JSON.stringify({ quantidade: n, webLocks: false, eventosStorage: false, adotou, esperado: 2 + n, observado: s.act[hj], local, servidor, reabriu })}`);
      } catch (e) { console.log('✗ ' + nome + ': FALHA DE PREPARAÇÃO/EXECUÇÃO: ' + e.message); falhas++; }
      finally { await ctx.close(); }
    }
  } finally { await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
