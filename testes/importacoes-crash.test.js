/* Duas quedas reais do navegador; importação legada, recibo, tombstones e estudo posterior a Zerar. */
const fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert'), { chromium } = require('playwright'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), hj = new Date().toISOString().slice(0, 10);
(async () => {
  const f = await fixture.abrir(alvo), ancora = await f.contexto(), P = await f.pagina(ancora), url = P.url(), origem = new URL(url).origin;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-import-crash-')); let c;
  const abrir = async () => {
    const x = await chromium.launchPersistentContext(dir, { serviceWorkers: 'block' });
    await x.addInitScript(() => { Object.defineProperty(navigator, 'locks', { value: undefined }); Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Exportação visível'); } } }); });
    await x.route('**/*', r => { const u = new URL(r.request().url()); if (u.origin === 'https://www.gstatic.com' && u.pathname.startsWith('/firebasejs/12.19.0/')) return r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.EEAR_FIREBASE_SDK, path.basename(u.pathname))) }); return u.origin === origem ? r.continue() : r.abort(); });
    return x;
  };
  const contar = async (p, n) => { const s = await f.estado(p); await p.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado'); assert.strictEqual(s.act[hj], n); const cp = await p.evaluate(() => new Promise(resolve => { const o = window.indexedDB.open('eear-operacoes', 1); o.onsuccess = () => { const db = o.result, t = db.transaction('contas'), q = t.objectStore('contas').get(''); t.oncomplete = () => { db.close(); resolve(q.result.st); }; }; })); assert.strictEqual(cp.act[hj], n); return s; };
  const cair = async p => { const d = await c.newCDPSession(p), saiu = c.waitForEvent('close'); d.send('Browser.crash').catch(() => null); await saiu; c = null; };
  try {
    const backup = { v: 1, cfg: { nome: 'Fictícia' }, feito: { 'T:antiga': true }, act: { [hj]: 5 } };
    c = await abrir(); let p = await c.newPage(); await p.goto(url); await f.importar(p, backup); const identificado = await contar(p, 5); await cair(p);
    c = await abrir(); p = await c.newPage(); await p.goto(url); await contar(p, 5); await f.importar(p, backup); await contar(p, 5);
    await f.clicar(p, 'zerar'); await f.clicar(p, 'zerarok'); await f.clicar(p, 'marcar', { k: 'T:nova' }); await contar(p, 1); await cair(p);
    c = await abrir(); p = await c.newPage(); await p.goto(url); await contar(p, 1);
    for (const b of [backup, identificado]) { await f.importar(p, b); const s = await contar(p, 1); assert(s.feito['T:nova'] && !s.feito['T:antiga']); }
    console.log('✓ Dois Browser.crash sem Web Locks: recibo legado, Zerar, tombstones e atividade nova duráveis; reimportação bruta/identificada não duplica nem restaura.');
  } finally { if (c) await c.close(); fs.rmSync(dir, { recursive: true, force: true }); await ancora.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
