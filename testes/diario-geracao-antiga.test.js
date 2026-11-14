/* Compatibilidade IA01: diário com o esquema anterior local:false, sem origem, e geração apagada.
   Não infere que seja importação: conserva a reserva e oferece cópia, sem confirmação falsa.
   O descarte exige ação explícita e recibo durável de descarte, não mera recusa de aplicação. */
const path = require('path'), assert = require('assert'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  const f = await fixture.abrir(alvo), c = await f.contexto();
  try {
    await c.route(/http:\/\/127\.0\.0\.1:(8180|9199)\//, r => r.abort());
    const p = await f.pagina(c); await f.importar(p, { v: 1, cfg: { nome: 'Fictícia' }, feito: { 'T:importada-antiga': true } });
    const st = await f.estado(p); await p.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado');
    await f.clicar(p, 'dadosapagar'); await f.clicar(p, 'dadosapagarok');
    const reserva = { v: 2, id: 'importacao-esquema-anterior', conta: '', gen: 'geracao-anterior', local: false, st, delta: st.cfg._ops };
    const chave = 'missao-eear-v1-diario#' + reserva.id;
    await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [chave, reserva]); await p.reload(); await f.clicar(p, 'tab', { v: 'plano' });
    assert(await f.ate(async () => await p.locator('#sync').getAttribute('data-local') === 'falhou'));
    assert(!(await f.estado(p)).feito['T:importada-antiga']); assert.strictEqual(await p.evaluate(k => localStorage.getItem(k), chave), JSON.stringify(reserva));
    await f.clicar(p, 'tab', { v: 'hoje' }); await f.clicar(p, 'reccopiar');
    assert((await p.locator('body').innerText()).includes('importada-antiga') || await p.locator('textarea').count());
    await p.reload(); await f.clicar(p, 'tab', { v: 'plano' }); assert(await f.ate(async () => await p.locator('#sync').getAttribute('data-local') === 'falhou'));
    await f.clicar(p, 'recdescartar'); assert(await f.ate(() => p.evaluate(k => localStorage.getItem(k) === null, chave)));
    await p.reload(); const depois = await f.estado(p); assert(!depois.feito['T:importada-antiga']);
    assert.strictEqual(await p.evaluate(k => localStorage.getItem(k), chave), null);
    console.log('✓ Diário ambíguo antigo preservado após reabertura, recuperável, sem confirmação falsa; descarte explícito não ressuscita.');
  } finally { await c.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
