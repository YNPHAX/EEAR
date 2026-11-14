/* IA02 integração: Levar somente marcações, quota local preservada, duas quedas reais do navegador,
   reimportação dos mesmos IDs e recuperação em outro dispositivo Firebase. Runtime servido sem alteração. */
const fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'transferencia-crashes.test.js'))) return;
  const f = await fixture.abrir(alvo), ancora = await f.contexto(), inicial = await f.pagina(ancora), url = inicial.url(), origem = new URL(url).origin;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-transferencia-crash-')), hj = new Date().toISOString().slice(0, 10); let ctx;
  const abrir = async () => {
    const c = await chromium.launchPersistentContext(dir, { serviceWorkers: 'block' });
    await c.addInitScript(() => { Object.defineProperty(navigator, 'locks', { value: undefined }); Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Exportação pública'); } }, configurable: true }); });
    await c.route('**/*', r => {
      const u = new URL(r.request().url());
      if (u.origin === 'https://www.gstatic.com' && u.pathname.startsWith('/firebasejs/12.19.0/')) return r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.EEAR_FIREBASE_SDK, path.basename(u.pathname))) });
      if (u.origin === origem || u.hostname === '127.0.0.1' && ['8280', '9299'].includes(u.port)) return r.continue();
      return r.abort();
    }); return c;
  };
  const confirmado = p => p.waitForFunction(() => document.querySelector('#sync')?.dataset.local === 'confirmado' && document.querySelector('#sync')?.dataset.nuvem === 'confirmado');
  const cair = async p => { const d = await ctx.newCDPSession(p), caiu = ctx.waitForEvent('close'); d.send('Browser.crash').catch(() => null); await caiu; ctx = null; };
  try {
    const cred = await f.conta('transferencia-crash', { v: 1, t: Date.now(), cfg: { nome: 'Destino Fictício' }, feito: {}, act: { [hj]: 0 } });
    const R = await f.pagina(ancora); await f.entrar(R, cred.email); await confirmado(R);
    for (let i = 0; i < 2; i++) await f.clicar(R, 'marcar', { k: 'T:remota' + i }); await confirmado(R);
    ctx = await abrir(); let p = await ctx.newPage(); await p.goto(url);
    await f.importar(p, { v: 1, cfg: { nome: 'Origem Fictícia' } });
    for (let i = 0; i < 3; i++) await f.clicar(p, 'marcar', { k: 'T:origem' + i });
    await f.estado(p); await p.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado');
    const backup = await f.estado(p); assert.strictEqual(backup.act[hj], 3);
    await f.entrar(p, cred.email); await confirmado(p); assert.strictEqual((await f.estado(p)).act[hj], 2);
    assert(await p.locator('[data-a="contalevar"]').count(), 'Marcações/atividade sem aula também precisam disponibilizar Levar.');
    await f.clicar(p, 'contalevar');
    assert(await f.ate(() => p.evaluate(uid => new Promise(resolve => { const o = window.indexedDB.open('eear-operacoes', 1); o.onsuccess = () => { const db = o.result, t = db.transaction('contas'), q = t.objectStore('contas').get('firebase:' + uid); t.oncomplete = () => { db.close(); resolve(q.result?.st.act[new Date().toISOString().slice(0, 10)] === 5); }; }; }), cred.uid)));
    await cair(p); ctx = await abrir(); p = await ctx.newPage(); await p.goto(url); await f.clicar(p, 'tab', { v: 'plano' }); await confirmado(p);
    assert.strictEqual((await f.estado(p)).act[hj], 5); await cair(p);
    ctx = await abrir(); p = await ctx.newPage(); await p.goto(url); await f.clicar(p, 'tab', { v: 'plano' }); await confirmado(p);
    await f.importar(p, backup); await confirmado(p); assert.strictEqual((await f.estado(p)).act[hj], 5); assert.strictEqual((await f.ler(cred.uid)).act[hj], 5);
    const dispositivo = await f.contexto(); try { const B = await f.pagina(dispositivo); await f.entrar(B, cred.email); await confirmado(B); const s = await f.estado(B); assert.strictEqual(s.act[hj], 5); assert([0, 1, 2].every(i => s.feito['T:origem' + i])); } finally { await dispositivo.close(); }
    console.log('✓ Levar sem aula, 5/5 após Browser.crash, segunda queda, reimportação e outro dispositivo; sem Web Locks.');
  } finally { if (ctx) await ctx.close(); fs.rmSync(dir, { recursive: true, force: true }); await ancora.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
