/* App publicado, sem ganchos na implementação. A API legada fictícia registra qualquer I/O:
   inclusive com acquire/transacao anunciados e flag antiga de exclusão, o cliente não pode escrever nem confirmar.
   Não simula o servidor futuro; esse contrato é testado separadamente em legado-contrato.test.js. */
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'), assert = require('assert');
const { execFileSync } = require('child_process'), { createHash } = require('crypto'), { chromium } = require('playwright');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const ate = async f => { const fim = Date.now() + 15000; while (Date.now() < fim) { if (await f()) return; await new Promise(r => setTimeout(r, 100)); } throw new Error('Pré-condição não alcançada.'); };
const hj = new Date().toISOString().slice(0, 10), LS = 'missao-eear-v1', BASE = 'missao-eear-v1-base';
const inicial = nome => ({ v: 1, t: Date.now() - 60000, cfg: { nome, alvo: 'cfs2-2027', prova: '2026-11-22', inicio: hj, horas: 3, dias: [0, 1, 2, 3, 4, 5, 6], excl: [] }, feito: { 'T:local-confirmada': true }, act: { [hj]: 2 }, mod: {}, fc: {}, erros: {}, sims: [], aula: {}, ap: {} });
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-legado-bloqueio-')), site = path.join(tmp, 'site'), cfg = path.join(tmp, 'firebase-null.json');
  fs.writeFileSync(cfg, 'null'); execFileSync('python3', ['web/build.py', site], { cwd: alvo, env: { ...process.env, EEAR_FIREBASE_CONFIG: cfg }, stdio: 'ignore' });
  const fonte = fs.readFileSync(path.join(alvo, 'curso/app.js')), servido = fs.readFileSync(path.join(site, 'app.js'));
  assert(fonte.equals(servido), 'O teste deve servir exatamente o bundle publicado, sem instrumentação.');
  console.log('Runtime SHA256: ' + createHash('sha256').update(servido).digest('hex'));
  const srv = http.createServer((q, r) => {
    const n = new URL(q.url, 'http://local').pathname, f = path.join(site, n === '/' ? 'index.html' : n);
    if (!f.startsWith(site + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; }
    r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream'); r.end(fs.readFileSync(f));
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const url = `http://127.0.0.1:${srv.address().port}/`, b = await chromium.launch();
  const chamadas = [], contextos = [];
  async function contexto(id, locks, existente) {
    const ctx = existente || await b.newContext({ serviceWorkers: 'block' }); contextos.push(ctx);
    await ctx.route('**/*', r => new URL(r.request().url()).origin === new URL(url).origin ? r.continue() : r.abort());
    await ctx.exposeFunction('__chamadaLegada', op => { chamadas.push(op); throw new Error('Transporte legado bloqueado não deve fazer I/O: ' + op); });
    await ctx.addInitScript(({ id, locks, st }) => {
      if (!locks) Object.defineProperty(navigator, 'locks', { value: undefined });
      if (!localStorage.getItem('semente')) {
        localStorage.setItem('missao-eear-conta', 'claude:' + id);
        localStorage.setItem('missao-eear-v1@claude:' + id, JSON.stringify(st));
        localStorage.setItem('missao-eear-v1-base@claude:' + id, JSON.stringify({ conta: 'claude:' + id, st }));
        localStorage.setItem('semente', '1');
      }
      window.EEAR_EXCLUSAO_NUVEM = true; // nem a flag antiga de teste pode contornar a política
      const chamada = op => () => window.__chamadaLegada(op);
      window.claude = { use: async k => k === 'user' ? { id: async () => id } : await window.__chamadaLegada('use:' + k) || { doc: () => ({ get: chamada('get'), set: chamada('set'), acquire: chamada('acquire'), transacao: chamada('transacao') }) } };
    }, { id, locks, st: inicial('Pessoa fictícia ' + id) });
    return ctx;
  }
  const pagina = async ctx => { const p = await ctx.newPage(); await p.goto(url); await ate(async () => (await p.locator('#sync').getAttribute('data-local')) === 'confirmado'); return p; };
  const clicar = (p, a, d = {}) => p.evaluate(([a, d]) => { const b = document.createElement('button'); b.dataset.a = a; Object.assign(b.dataset, d); document.body.appendChild(b); b.click(); b.remove(); }, [a, d]);
  const checkpoint = (p, id) => p.evaluate(id => new Promise((resolve, reject) => {
    const o = window.indexedDB.open('eear-operacoes', 1); o.onerror = () => reject(o.error); o.onsuccess = () => { const db = o.result, t = db.transaction('contas', 'readonly'), q = t.objectStore('contas').get('claude:' + id); t.oncomplete = () => { db.close(); resolve(q.result && q.result.st); }; };
  }), id);
  try {
    for (const locks of [true, false]) {
      const id = 'ficticio-' + locks, ctx = await contexto(id, locks), A = await pagina(ctx), B = await pagina(ctx), C = await pagina(ctx);
      assert.strictEqual(await A.locator('#sync').getAttribute('data-nuvem'), 'bloqueada-legado');
      assert.match(await A.locator('#sync').innerText(), /Checkpoint confirmado.*clientes antigos.*Não há confirmação remota segura/);
      await clicar(A, 'marcar', { k: 'T:A' }); await clicar(B, 'marcar', { k: 'T:B' }); await clicar(C, 'marcar', { k: 'T:C' });
      await ate(async () => { const s = await checkpoint(A, id); return s.act[hj] === 5 && ['T:A', 'T:B', 'T:C'].every(k => s.feito[k]); });
      await clicar(A, 'tab', { v: 'plano' }); await clicar(A, 'dadosapagar');
      assert.strictEqual(await A.locator('[data-a="dadosapagarok"]').count(), 0, 'BASE legada não habilita exclusão.');
      // Pedido sintético também atravessa as guardas reais, sem chamar funções internas.
      await clicar(A, 'dadosapagarok'); await clicar(A, 'nuvemapagarok');
      assert((await checkpoint(A, id)).feito['T:A']);
      await clicar(A, 'expcopiar'); const copia = JSON.parse(await A.locator('#exp-txt').inputValue()); assert(copia.feito['T:C']);
      await C.close(); await B.close(); await A.reload(); await ate(async () => (await A.locator('#sync').getAttribute('data-local')) === 'confirmado');
      assert.strictEqual((await checkpoint(A, id)).act[hj], 5);
      await clicar(A, 'tab', { v: 'plano' }); await clicar(A, 'zerar'); await clicar(A, 'zerarok');
      await clicar(A, 'marcar', { k: 'T:posterior-a-zerar' });
      await ate(async () => { const s = await checkpoint(A, id); return s.feito['T:posterior-a-zerar'] && !s.feito['T:A'] && s.act[hj] === 1; });
      await A.reload(); await ate(async () => { const s = await checkpoint(A, id); return s.feito['T:posterior-a-zerar'] && !s.feito['T:local-confirmada']; });
      // A base velha permanece apenas como evidência histórica; jamais vira confirmação nova.
      assert.strictEqual(await A.evaluate(k => JSON.parse(localStorage.getItem(k)).st.feito['T:A'], BASE + '@claude:' + id), undefined);
      assert.strictEqual(await A.evaluate(k => JSON.parse(localStorage.getItem(k)).feito['T:posterior-a-zerar'], LS + '@claude:' + id), true);
      assert.deepStrictEqual(chamadas, []);
      console.log(`✓ legado bloqueado, locks=${locks}: três abas, 5/5, BASE antiga recusada, exportação, Zerar+estudo 1/1, reabertura e zero I/O remoto.`);
      await ctx.close();
    }
    // Queda do navegador inteiro, não apenas reload/Page.crash; a confirmação é medida no IDB antes de cair.
    const perfil = path.join(tmp, 'perfil-crash'), id = 'crash-legado';
    let ctx = await contexto(id, false, await chromium.launchPersistentContext(perfil, { serviceWorkers: 'block' }));
    let A = await pagina(ctx); await clicar(A, 'marcar', { k: 'T:antes-do-crash' });
    await ate(async () => (await checkpoint(A, id)).feito['T:antes-do-crash']);
    const cdp = await ctx.newCDPSession(A), caiu = ctx.waitForEvent('close', { timeout: 10000 }); cdp.send('Browser.crash').catch(() => null); await caiu;
    await ctx.close().catch(() => null);
    ctx = await contexto(id, false, await chromium.launchPersistentContext(perfil, { serviceWorkers: 'block' })); A = await pagina(ctx);
    const s = await checkpoint(A, id); assert(s.feito['T:antes-do-crash']); assert.strictEqual(s.act[hj], 3);
    const d2 = await ctx.newCDPSession(A), caiu2 = ctx.waitForEvent('close', { timeout: 10000 }); d2.send('Browser.crash').catch(() => null); await caiu2;
    await ctx.close().catch(() => null);
    ctx = await contexto(id, false, await chromium.launchPersistentContext(perfil, { serviceWorkers: 'block' })); A = await pagina(ctx);
    assert.deepStrictEqual((await checkpoint(A, id)).feito, s.feito); assert.strictEqual((await checkpoint(A, id)).act[hj], 3);
    assert.strictEqual(await A.locator('#sync').getAttribute('data-nuvem'), 'bloqueada-legado'); assert.deepStrictEqual(chamadas, []);
    console.log('✓ legado bloqueado, dois Browser.crash reais: checkpoint confirmado sobrevive, 3/3, sem Web Locks e sem confirmação remota.');
  } finally { for (const ctx of contextos) await ctx.close().catch(() => null); await b.close(); await new Promise(r => srv.close(r)); fs.rmSync(tmp, { recursive: true, force: true }); }
})().catch(e => { console.error(e); process.exitCode = 1; });
