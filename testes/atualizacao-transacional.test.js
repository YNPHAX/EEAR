/* Atualização/reversão entre versões que já usam checkpoint transacional.
   Uso: node testes/atualizacao-transacional.test.js <build anterior> <build candidato>.
   A semente é anterior ao primeiro script do app: sobrescrever somente o cache após criar IDB vazio
   não prepara um progresso válido. Não modifica o teste histórico de reversão/quarentena. */
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert');
const [A, B] = process.argv.slice(2).map(x => path.resolve(x));
if (!A || !B) throw new Error('Informe os dois builds.');
const hj = new Date().toISOString().slice(0, 10), cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'ATUALIZACAO-CERT', o: 'curso', t: 1792195200000 };
const seed = { v: 1, t: Date.now() - 60000, cfg: { nome: 'Migração Fictícia', certs: [cert] }, mod: { POR01: { best: .9, tent: 2 } },
  fc: { 'POR01~0': [2, 20400] }, erros: { 'MAT01-2': 1 }, sims: [], feito: { 'T:base': true }, act: { [hj]: 2 }, ap: {}, aula: {} };
const srv = http.createServer((q, r) => {
  const u = new URL(q.url, 'http://local').pathname, raiz = u.startsWith('/a/') ? A : u.startsWith('/b/') ? B : null;
  if (!raiz) { r.writeHead(404); r.end(); return; }
  const f = path.resolve(raiz, '.' + u.slice(2) + (u.endsWith('/') ? 'index.html' : ''));
  if (!f.startsWith(raiz + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; }
  r.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : f.endsWith('.css') ? 'text/css' : 'application/octet-stream'); r.end(fs.readFileSync(f));
});
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const url = `http://127.0.0.1:${srv.address().port}`, b = await chromium.launch();
  try {
    const c = await b.newContext({ serviceWorkers: 'block' });
    await c.route('**/*', r => new URL(r.request().url()).origin === url ? r.continue() : r.abort());
    await c.addInitScript(seed => {
      if (!sessionStorage.getItem('fixture-pre-app')) { localStorage.setItem('missao-eear-v1', JSON.stringify(seed)); sessionStorage.setItem('fixture-pre-app', '1'); }
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Exportação visível'); } } });
    }, seed);
    const p = await c.newPage(), erros = []; p.on('pageerror', e => erros.push(e.message));
    const clicar = (a, d = {}) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d); document.body.appendChild(x); x.click(); x.remove(); }, [a, d]);
    const confirmado = () => p.waitForFunction(() => document.querySelector('#sync') && document.querySelector('#sync').dataset.local === 'confirmado');
    const estado = async () => { await clicar('tab', { v: 'plano' }); await clicar('expcopiar'); return JSON.parse(await p.locator('#exp-txt').inputValue()); };
    for (let i = 0; i < 4; i++) {
      const versao = i % 2 ? 'b' : 'a'; await p.goto(url + '/' + versao + '/'); await confirmado();
      const antes = await estado(); assert(antes.feito['T:base'], 'A semente anterior ao app precisa chegar ao checkpoint.');
      await clicar('marcar', { k: 'T:etapa-' + i }); await confirmado();
      const s = await estado();
      for (let k = 0; k <= i; k++) assert(s.feito['T:etapa-' + k]);
      assert.strictEqual(s.act[hj], 3 + i);
      for (const campo of ['mod', 'fc', 'erros', 'sims']) assert.deepStrictEqual(s[campo], antes[campo]);
      assert(s.cfg.certs.some(x => x.c === cert.c)); assert.deepStrictEqual(erros, []);
      console.log(`✓ troca ${i + 1}, versão ${versao}: tarefas, contagem ${3 + i}/${3 + i}, aulas, cartões, erros e certificado preservados.`);
    }
    await clicar('zerar'); await clicar('zerarok'); await clicar('marcar', { k: 'T:posterior-reset' }); await confirmado();
    for (const versao of ['a', 'b']) {
      await p.goto(url + '/' + versao + '/'); await confirmado(); const s = await estado();
      assert.deepStrictEqual(s.feito, { 'T:posterior-reset': true }); assert.strictEqual(s.act[hj], 1); assert.strictEqual(s.cfg.certs.length, 0);
      console.log(`✓ Zerar + estudo na versão ${versao}: exatamente 1/1, sem restaurar certificados ou tarefas anteriores.`);
    }
    assert.deepStrictEqual(erros, []);
  } finally { await b.close(); await new Promise(r => srv.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
