/* F13 na arquitetura transacional: três abas, sem Web Locks, transação interrompida e reconexão real emulada. */
const fs = require('fs'), path = require('path'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'operacoes-interrupcao.test.js'))) return;
  const f = await fixture.abrir(alvo), ctx = await f.contexto(), hj = new Date().toISOString().slice(0, 10);
  try {
    await ctx.addInitScript(() => Object.defineProperty(navigator, 'locks', { get: () => undefined, configurable: true }));
    const conta = await f.conta('f13-transacao', { v: 1, t: Date.now() - 20000, cfg: { nome: 'Interrupção Fictícia', certs: [] }, feito: { 'T:base': true }, act: { [hj]: 2 } });
    const A = await f.pagina(ctx); await f.entrar(A, conta.email); const B = await f.pagina(ctx), C = await f.pagina(ctx);
    for (const p of [A, B, C]) if (!await f.ate(async () => (await f.estado(p)).act[hj] === 2 && (await p.locator('#sync').innerText()) === 'Progresso salvo na sua conta.')) throw new Error('Base não confirmada.');
    f.rede(ctx, true);
    const r = await require('./operacoes-interrupcao.js')({ ctx, paginas: [A, B, C], clicar: f.clicar, estado: f.estado, fonte: fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8'), abrir: () => f.pagina(ctx) });
    f.rede(ctx, false); await r.D.evaluate(() => window.dispatchEvent(new Event('online')));
    const chegou = await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.feito['T:A-race'] && s.feito['T:B-race'] && s.act[hj] === 4; });
    console.log(`${r.passou && chegou ? '✓' : '✗'} F13-transacao: ${JSON.stringify({ Baceita: r.Baceita, reservaAntes: r.reservaAntes, reservaDepois2500ms: r.reservaDepois2500ms, feito: r.estado.feito, atividade: r.estado.act[hj], chegou })}`);
    process.exitCode = r.passou && chegou ? 0 : 1;
  } finally { await ctx.close(); await f.fechar(); }
})().catch(e => { console.error('FALHA DE PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
