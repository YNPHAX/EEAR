/* Política explícita de repetição/reset, origens identificadas independentes e limite de migração. */
const path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), hj = new Date().toISOString().slice(0, 10);
(async () => {
  const f = await fixture.abrir(alvo), cs = [];
  const abrir = async () => { const c = await f.contexto(); cs.push(c); await c.route(/http:\/\/127\.0\.0\.1:(8280|9299)\//, r => r.abort()); return f.pagina(c); };
  const confirmado = p => p.waitForFunction(() => document.querySelector('#sync')?.dataset.local === 'confirmado');
  const contar = async (p, n) => { const s = await f.estado(p); await confirmado(p); assert.strictEqual(s.act[hj], n); return s; };
  const arquivo = { v: 1, cfg: { nome: 'Histórico Fictício' }, feito: { 'T:antiga': true }, act: { [hj]: 5 } };
  try {
    const A = await abrir(); await f.importar(A, { v: 1, cfg: {}, act: { [hj]: 2 } }); await contar(A, 2);
    await f.importar(A, arquivo); const backup = await contar(A, 5);
    await f.clicar(A, 'marcar', { k: 'T:nova' }); await contar(A, 6); await f.importar(A, arquivo); await contar(A, 6);
    await f.clicar(A, 'zerar'); await f.clicar(A, 'zerarok'); await f.clicar(A, 'marcar', { k: 'T:pos-reset' });
    await f.importar(A, arquivo); let s = await contar(A, 1); assert(s.feito['T:pos-reset'] && !s.feito['T:antiga']);
    await f.importar(A, backup); s = await contar(A, 1); assert(!s.feito['T:antiga']);
    const editado = JSON.parse(JSON.stringify(backup)); editado.cfg.nome = 'Preferência editada'; await f.importar(A, editado); s = await contar(A, 1); assert(!s.feito['T:antiga']);
    await A.reload(); await contar(A, 1);
    console.log('✓ Mesmo backup bruto/identificado/editado, atividade nova, Zerar posterior e reabertura: nenhum estudo apagado volta.');
    const B = await abrir(); await f.clicar(B, 'tab', { v: 'plano' }); await f.clicar(B, 'zerar'); await f.clicar(B, 'zerarok');
    await f.importar(B, arquivo); await contar(B, 5); await f.importar(B, arquivo); await contar(B, 5);
    console.log('✓ Zerar antes da primeira importação: a cópia inédita entra uma vez, com 5/5.');
    const fontes = [];
    for (const n of [3, 5]) { const O = await abrir(); await f.importar(O, { v: 1, cfg: { nome: 'Origem ' + n } }); for (let i = 0; i < n; i++) await f.clicar(O, 'marcar', { k: 'T:origem-' + n + '-' + i }); fontes.push({ p: O, st: await contar(O, n) }); }
    const D = await abrir(); for (const o of fontes) await f.importar(D, o.st); await contar(D, 8);
    for (const o of fontes.slice().reverse()) await f.importar(D, o.st); await contar(D, 8);
    await f.clicar(D, 'zerar'); await f.clicar(D, 'zerarok'); await f.clicar(D, 'marcar', { k: 'T:destino-nova' });
    await f.clicar(fontes[0].p, 'marcar', { k: 'T:origem-nova' }); fontes[0].st = await contar(fontes[0].p, 4);
    for (const o of fontes) await f.importar(D, o.st); await contar(D, 2);
    console.log('✓ Origens independentes 3+5=8; repetição inversa não duplica; após Zerar ficam só as duas atividades novas.');
    const atual = await f.estado(D); await f.importar(D, { v: 1, cfg: { nome: 'Não aceitar' }, act: { [hj]: 10001 } });
    assert((await D.locator('body').innerText()).includes('contagens grandes demais'));
    const final = await f.estado(D); assert.deepStrictEqual(final.act, atual.act); assert.strictEqual(final.cfg.nome, atual.cfg.nome);
    console.log('✓ Limite explícito de 10.000 unidades históricas: recusa antes da mutação, sem truncamento nem confirmação falsa.');
  } finally { for (const c of cs) await c.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
