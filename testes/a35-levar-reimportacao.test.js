/* Identidades novas dos dois lados; compara os caminhos públicos Levar -> Importar e só Importar.
   Nenhum contador legado positivo, nenhuma alteração do runtime e somente emuladores próprios. */
const path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'a35-levar-reimportacao.test.js'))) return;
  const f = await fixture.abrir(alvo), hj = new Date().toISOString().slice(0, 10), cs = []; let falhas = 0;
  const ctx = async () => { const c = await f.contexto(); cs.push(c); return c; };
  const confirmado = p => p.waitForFunction(() => document.querySelector('#sync') && document.querySelector('#sync').dataset.local === 'confirmado' && document.querySelector('#sync').dataset.nuvem === 'confirmado');
  const ok = (p, nome, dados) => { console.log(`${p ? '✓' : '✗'} ${nome}: ${JSON.stringify(dados)}`); if (!p) falhas++; };
  try {
    const contas = [];
    for (const nome of ['levar-antes-importar', 'importar-direto']) {
      const cred = await f.conta(nome, { v: 1, t: Date.now() - 20000, cfg: { nome: 'Conta Fictícia' }, act: { [hj]: 0 }, feito: {} }); contas.push(cred);
      const R = await f.pagina(await ctx()); await f.entrar(R, cred.email); await confirmado(R);
      await f.clicar(R, 'marcar', { k: 'T:remota1' }); await f.clicar(R, 'marcar', { k: 'T:remota2' }); await confirmado(R); assert.strictEqual((await f.estado(R)).act[hj], 2);
    }
    const A = await f.pagina(await ctx()); await f.importar(A, { v: 1, cfg: { nome: 'Anônimo Fictício' } });
    for (let i = 1; i <= 3; i++) await f.clicar(A, 'marcar', { k: 'T:anon' + i });
    await f.clicar(A, 'mod', { id: 'POR01' }); await f.clicar(A, 'aba', { aba: 'teoria' });
    const anon = await f.estado(A); assert.strictEqual(anon.act[hj], 3); assert(anon.cfg._ops.v === 2);
    await f.entrar(A, contas[0].email); await confirmado(A); const base = await f.estado(A);
    const chave = JSON.stringify(['act', hj]), ids = s => Object.keys(s.cfg._ops.c[chave].a).filter(i => s.cfg._ops.c[chave].a[i] > 0);
    assert.strictEqual(ids(anon).length, 3); assert.strictEqual(ids(base).length, 2); assert(!ids(anon).some(i => ids(base).includes(i)));
    await A.locator('[data-a="contalevar"]').first().click(); await confirmado(A);
    const levado = await f.estado(A), servidorLevar = await f.ler(contas[0].uid);
    ok(levado.act[hj] === 5 && servidorLevar.act[hj] === 5, 'levar-3-mais-2', { esperado: 5, local: levado.act[hj], servidor: servidorLevar.act[hj], idsAnon: ids(anon), idsBase: ids(base) });
    await f.importar(A, anon); await confirmado(A); const aposImportar = await f.estado(A);
    await f.importar(A, anon); await confirmado(A); await A.reload(); await confirmado(A); const aposReabrir = await f.estado(A), remoto = await f.ler(contas[0].uid);
    ok(aposImportar.act[hj] === 5 && aposReabrir.act[hj] === 5 && remoto.act[hj] === 5, 'reimportar-apos-levar', { esperado: 5, depoisImportar: aposImportar.act[hj], depoisRepetirReabrir: aposReabrir.act[hj], servidor: remoto.act[hj], aviso: await A.locator('#sync').innerText() });
    const B = await f.pagina(await ctx()); await f.entrar(B, contas[1].email); await confirmado(B); await f.importar(B, anon); await confirmado(B);
    const direto = await f.estado(B), remotoDireto = await f.ler(contas[1].uid);
    ok(direto.act[hj] === 5 && remotoDireto.act[hj] === 5, 'controle-importar-diretamente-5-de-5', { esperado: 5, local: direto.act[hj], servidor: remotoDireto.act[hj] });
  } finally { for (const c of cs) await c.close(); await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error('FALHA DE PREPARAÇÃO:', e); process.exitCode = 1; });
