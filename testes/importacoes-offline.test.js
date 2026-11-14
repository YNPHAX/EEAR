/* Ordens inversas, bases históricas diferentes e atividade legítima durante a migração offline. */
const path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), hj = new Date().toISOString().slice(0, 10);
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'importacoes-offline.test.js'))) return;
  const f = await fixture.abrir(alvo), cs = [];
  const ctx = async () => { const c = await f.contexto(); cs.push(c); return c; };
  const confirmado = p => p.waitForFunction(() => document.querySelector('#sync')?.dataset.local === 'confirmado' && document.querySelector('#sync')?.dataset.nuvem === 'confirmado');
  try {
    const cred = await f.conta('migracao-bases-diferentes', { v: 1, t: Date.now(), cfg: { nome: 'Fictícia' }, act: { [hj]: 2 }, feito: {} });
    const paginas = [], backup = { v: 1, cfg: { nome: 'Cópia Fictícia' }, act: { [hj]: 5 }, feito: { 'T:legada': true } };
    for (let i = 0; i < 2; i++) { const c = await ctx(), p = await f.pagina(c); await f.entrar(p, cred.email); await confirmado(p); f.rede(c, true); paginas.push(p); }
    await f.importar(paginas[1], Object.assign({}, backup, { act: { [hj]: 4 } })); assert.strictEqual((await f.estado(paginas[1])).act[hj], 4);
    for (const p of paginas) { await f.importar(p, backup); assert.strictEqual((await f.estado(p)).act[hj], 5); }
    await f.clicar(paginas[0], 'marcar', { k: 'T:nova-offline' }); assert.strictEqual((await f.estado(paginas[0])).act[hj], 6);
    for (const i of [1, 0]) { f.rede(cs[i], false); await paginas[i].evaluate(() => window.dispatchEvent(new Event('online'))); await confirmado(paginas[i]); }
    assert.strictEqual((await f.ler(cred.uid)).act[hj], 6);
    const D = await f.pagina(await ctx()); await f.entrar(D, cred.email); await confirmado(D); assert.strictEqual((await f.estado(D)).act[hj], 6);
    await f.importar(D, backup); await confirmado(D); assert.strictEqual((await f.ler(cred.uid)).act[hj], 6);
    console.log('✓ Bases 2/4 + mesmo backup 5 + estudo novo: 6/6 após reconexão inversa, repetição e terceiro dispositivo.');
    // Outra conta recebe um estado identificado, sem reutilizar o saldo ou as credenciais da origem.
    const b = await f.conta('migracao-outra-conta', { v: 1, t: Date.now(), cfg: { nome: 'B Fictícia' }, feito: {}, act: {} });
    const E = await f.pagina(await ctx()); await f.importar(E, { v: 1, cfg: { nome: 'Sem conta' }, act: { [hj]: 2 } }); await f.importar(E, backup);
    assert.strictEqual((await f.estado(E)).act[hj], 5); await f.entrar(E, b.email); await confirmado(E);
    await f.clicar(E, 'contalevar'); await confirmado(E); assert.strictEqual((await f.estado(E)).act[hj], 5);
    await f.clicar(E, 'zerar'); await f.clicar(E, 'zerarok'); await f.clicar(E, 'marcar', { k: 'T:B-nova' });
    await f.importar(E, backup); await confirmado(E); const s = await f.estado(E); assert.strictEqual(s.act[hj], 1); assert(!s.feito['T:legada']);
    assert.strictEqual((await f.ler(cred.uid)).act[hj], 6); assert.strictEqual((await f.ler(b.uid)).act[hj], 1);
    console.log('✓ Levar conserva cobertura/recibo; Zerar + reimportar mantém somente estudo novo; contas A/B isoladas.');
  } finally { for (const c of cs) await c.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
