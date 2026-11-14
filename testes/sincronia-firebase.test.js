/* Transporte oficial, bundle exato servido e SDK real nos emuladores demo-*.
   Substitui a dependência da plataforma em nuvem legada; não altera os critérios históricos.
   UI pública, sem expor funções do app ou falsificar Storage/transações. */
const path = require('path'), fs = require('fs'), assert = require('assert'), { createHash } = require('crypto');
const fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const hj = new Date().toISOString().slice(0, 10);
const seed = () => ({ v: 1, t: Date.now() - 20000, cfg: { nome: 'Pessoa Fictícia', certs: [] }, mod: {}, fc: {}, sims: [], feito: { 'T:base': true }, act: { [hj]: 2 } });
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'sincronia-firebase.test.js'))) return;
  const f = await fixture.abrir(alvo), contextos = [];
  const contexto = async () => { const c = await f.contexto(); contextos.push(c); return c; };
  const exigir = async (predicado, msg) => assert(await f.ate(predicado), msg);
  const confirmado = p => exigir(async () => await p.locator('#sync').getAttribute('data-nuvem') === 'confirmado', 'Servidor ainda não confirmou.');
  try {
    const calls = [], c = await contexto();
    await c.exposeFunction('__legadoAcessado', op => { calls.push(op); throw new Error('Firebase não depende do provedor legado: ' + op); });
    await c.addInitScript(() => {
      window.claude = { use: k => window.__legadoAcessado('use:' + k), hot: { ready: () => window.__legadoAcessado('hot.ready'), snapshot: () => window.__legadoAcessado('hot.snapshot') } };
      localStorage.setItem('missao-eear-conta', 'claude:outra-pessoa');
      localStorage.setItem('missao-eear-v1@claude:outra-pessoa', JSON.stringify({ v: 1, cfg: { nome: 'Não migrar automaticamente' }, feito: { 'T:privada-legada': true } }));
    });
    const cred = await f.conta('oficial-provedor', seed()), A = await f.pagina(c), erros = [];
    A.on('pageerror', e => erros.push(e.message));
    assert(!(await f.estado(A)).feito['T:privada-legada'], 'Conta antiga não pode selecionar o destino Firebase.');
    await f.entrar(A, cred.email); await confirmado(A);
    await f.clicar(A, 'marcar', { k: 'T:oficial' });
    await exigir(async () => (await f.ler(cred.uid)).feito['T:oficial'], 'Firebase deve receber estudo mesmo com SDK antigo travado.');
    await confirmado(A); assert.deepStrictEqual(calls, []); assert.deepStrictEqual(erros, []);
    assert((await A.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1@claude:outra-pessoa')))).feito['T:privada-legada'], 'A migração não apaga a origem.');
    console.log('✓ Firebase tem prioridade: zero user/db/hot legados, checkpoint e confirmação remota efetiva.');

    const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'MIGRACAO-FB-CERT', o: 'curso', t: 1792195200000 };
    const antigo = seed(); antigo.feito = { 'T:importada': true }; antigo.act[hj] = 7;
    antigo.cfg.certs = [cert]; antigo.fc = { 'POR02~0': [2, 20400] }; antigo.cfg.fcv = { 'POR02~0': [2, 20400] }; antigo.cfg.fcAncora = { 'POR02:2': hj };
    const arquivo = { app: 'Missão EEAR', geradoEm: new Date().toISOString(), conta: { tipo: 'claude', email: 'origem-ficticia@exemplo.test' }, progresso: antigo };
    await f.importar(A, arquivo);
    await exigir(async () => { const s = await f.ler(cred.uid); return s.feito['T:importada'] && s.cfg.certs.some(x => x.c === cert.c); }, 'Backup antigo deve entrar na conta de destino escolhida.');
    await confirmado(A); const primeira = await f.estado(A);
    assert(primeira.feito['T:oficial'], 'Importação mantém o estudo da conta de destino.');
    await f.importar(A, arquivo); await confirmado(A);
    const repetida = await f.estado(A);
    assert.deepStrictEqual(repetida.act, primeira.act, 'Reimportar o mesmo backup não duplica contagens.');
    assert.strictEqual(repetida.cfg.certs.filter(x => x.c === cert.c).length, 1);
    const c2 = await contexto(), B = await f.pagina(c2); await f.entrar(B, cred.email); await confirmado(B);
    const recebida = await f.estado(B);
    for (const x of ['fc', 'act']) assert.deepStrictEqual(recebida[x], primeira[x]);
    for (const x of ['fcv', 'fcAncora', 'certs']) assert.deepStrictEqual(recebida.cfg[x], primeira.cfg[x]);
    assert(recebida.feito['T:oficial'] && recebida.feito['T:importada']);
    assert.strictEqual(await A.evaluate(() => localStorage.getItem('missao-eear-conta')), 'firebase:' + cred.uid);
    console.log('✓ Backup antigo explícito, identidade ignorada, união preservada, repetição idempotente, cartões/versões/âncoras/certificados em outro dispositivo.');

    await f.clicar(B, 'marcar', { k: 'T:importada' });
    await exigir(async () => !(await f.ler(cred.uid)).feito['T:importada'], 'Desmarcação remota não pode ser ignorada.');
    await A.reload(); await confirmado(A); assert(!(await f.estado(A)).feito['T:importada']);
    await f.clicar(A, 'zerar'); await f.clicar(A, 'zerarok'); await f.clicar(A, 'marcar', { k: 'T:posterior-reset' });
    const resetCorreto = s => s && s.feito['T:posterior-reset'] && !s.feito['T:base'] && !s.feito['T:oficial'] && s.act[hj] === 1 && s.cfg.certs.length === 0;
    await exigir(async () => resetCorreto(await f.ler(cred.uid)), 'Zerar e estudo posterior precisam chegar juntos.');
    await B.reload(); await confirmado(B); assert(resetCorreto(await f.estado(B)));
    console.log('✓ Desmarcação, Zerar, remoção de certificados e estudo posterior 1/1 sobrevivem ao servidor e à recuperação em outro dispositivo.');

    // Três dispositivos separados, fora de ordem e sem Web Locks; não são três páginas compartilhando um checkpoint.
    const trio = await f.conta('oficial-trio', seed()), paginas = [], ctxs = [];
    for (let i = 0; i < 3; i++) {
      const ctx = await contexto(); ctxs.push(ctx); await ctx.addInitScript(() => Object.defineProperty(navigator, 'locks', { value: undefined }));
      const p = await f.pagina(ctx); await f.entrar(p, trio.email); await confirmado(p); paginas.push(p); f.rede(ctx, true);
    }
    await Promise.all(paginas.map((p, i) => f.clicar(p, 'marcar', { k: 'T:dispositivo-' + i })));
    for (const i of [2, 0, 1]) { f.rede(ctxs[i], false); await paginas[i].evaluate(() => window.dispatchEvent(new Event('online'))); await confirmado(paginas[i]); }
    const tudo = s => s && s.act[hj] === 5 && [0, 1, 2].every(i => s.feito['T:dispositivo-' + i]);
    await exigir(async () => tudo(await f.ler(trio.uid)), 'Três operações devem produzir exatamente 5/5.');
    for (const p of paginas) { await p.reload(); await confirmado(p); assert(tudo(await f.estado(p))); }
    console.log('✓ Três dispositivos sem Web Locks, operações offline e reconexão fora de ordem: exatamente 5/5 no servidor e em cada checkpoint recuperado.');
    console.log('Runtime SHA256: ' + createHash('sha256').update(fs.readFileSync(path.join(alvo, 'curso/app.js'))).digest('hex'));
  } finally { for (const c of contextos) await c.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
