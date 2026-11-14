/* Mesmo backup legado, dois dispositivos independentes, offline e reconexão ordenada.
   Não há mocks de transação, nem breakpoint; usa SDK/servidor emulados reais e a UI pública. */
const path = require('path'), assert = require('assert'), nodeCrypto = require('crypto'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), hj = new Date().toISOString().slice(0, 10);
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'a636-importacao-dispositivos.test.js'))) return;
  const f = await fixture.abrir(alvo), cs = []; let falhas = 0;
  const ctx = async () => { const c = await f.contexto(); cs.push(c); return c; };
  const confirmado = p => p.waitForFunction(() => document.querySelector('#sync')?.dataset.nuvem === 'confirmado' && document.querySelector('#sync')?.dataset.local === 'confirmado');
  try {
    const cred = await f.conta('mesmo-backup-offline', { v: 1, t: Date.now(), cfg: { nome: 'Fictícia' }, act: { [hj]: 2 }, feito: { 'T:base': true } });
    const backup = { v: 1, cfg: { nome: 'Backup Fictício' }, act: { [hj]: 5 }, feito: { 'T:importada': true } };
    const hash = nodeCrypto.createHash('sha256').update(JSON.stringify(backup)).digest('hex'), paginas = [];
    for (let i = 0; i < 2; i++) { const c = await ctx(), p = await f.pagina(c); await f.entrar(p, cred.email); await confirmado(p); assert.strictEqual((await f.estado(p)).act[hj], 2); f.rede(c, true); paginas.push(p); }
    for (const p of paginas) { await f.importar(p, backup); assert.strictEqual((await f.estado(p)).act[hj], 5); await p.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado'); }
    for (let i = 0; i < 2; i++) { f.rede(cs[i], false); await paginas[i].evaluate(() => window.dispatchEvent(new Event('online'))); await confirmado(paginas[i]); }
    const remoto = await f.ler(cred.uid), D = await f.pagina(await ctx()); await f.entrar(D, cred.email); await confirmado(D); const novo = await f.estado(D);
    const passou = remoto.act[hj] === 5 && novo.act[hj] === 5;
    console.log(`${passou ? '✓' : '✗'} mesmo-backup-dois-dispositivos: ${JSON.stringify({ arquivoSha256: hash, base: 2, atividadeNoArquivo: 5, esperado: 5, remoto: remoto.act[hj], novoDispositivo: novo.act[hj], aviso: await D.locator('#sync').innerText() })}`); if (!passou) falhas++;
  } finally { for (const c of cs) await c.close(); await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error('PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
