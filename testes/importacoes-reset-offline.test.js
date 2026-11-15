/* Mesma origem vista e zerada em A; primeira importação em B offline não pode reaplicar marcações. */
const assert = require('assert'), path = require('path');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), fixture = require('./a35-fixture.js'), hj = new Date().toISOString().slice(0, 10);
(async () => {
 if (fixture.emular(alvo, path.join(__dirname, 'importacoes-reset-offline.test.js'))) return;
 const f = await fixture.abrir(alvo), cs = [];
 const abrir = async email => { const c = await f.contexto(); cs.push(c); const p = await f.pagina(c); await f.entrar(p, email); return p; };
 const confirmado = p => p.waitForFunction(() => document.querySelector('#sync')?.dataset.local === 'confirmado' && document.querySelector('#sync')?.dataset.nuvem === 'confirmado');
 try {
  const cred = await f.conta('reset-origem-offline', { v: 1, t: Date.now(), cfg: { nome: 'Fictícia' }, act: { [hj]: 2 }, feito: {} });
  const A = await abrir(cred.email); await confirmado(A); const B = await abrir(cred.email); await confirmado(B); f.rede(cs[1], true);
  const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'RESET-ORIGEM-FICTICIO', o: 'curso', t: 1792195200000 };
  await f.importar(A, { v: 1, cfg: { nome: 'Certificado anterior', certs: [cert] }, act: { [hj]: 2 } }); await confirmado(A);
  const backup = { v: 1, cfg: { nome: 'Arquivo Fictício', certs: [cert], fcv: { 'POR01~0': 2 }, fcAncora: { por: 1 } }, fc: { 'POR01~0': [2, 20400] }, act: { [hj]: 5 }, feito: { 'T:legada': true } };
  await f.importar(A, backup); await confirmado(A); assert.strictEqual((await f.ler(cred.uid)).act[hj], 5);
  await f.clicar(A, 'zerar'); await f.clicar(A, 'zerarok'); await confirmado(A); const zerado = await f.ler(cred.uid); assert.deepStrictEqual(zerado.feito, {}); assert.deepStrictEqual(zerado.act, {});
  await f.importar(B, backup); assert.strictEqual((await f.estado(B)).act[hj], 5);
  f.rede(cs[1], false); await B.evaluate(() => window.dispatchEvent(new Event('online'))); await confirmado(B);
  const remoto = await f.ler(cred.uid); await B.reload(); await confirmado(B); const reaberto = await f.estado(B);
  console.log('PROVA RESET/ORIGEM: ' + JSON.stringify({ zerado: { feito: zerado.feito, act: zerado.act, certs: zerado.cfg.certs }, remoto: { feito: remoto.feito, act: remoto.act, certs: remoto.cfg.certs }, reaberto: { feito: reaberto.feito, act: reaberto.act, certs: reaberto.cfg.certs }, mensagem: await B.locator('#sync').innerText() }));
  assert.deepStrictEqual(remoto.feito, {}, 'A mesma origem já observada e zerada não restaura marcações após importação atrasada offline.');
  assert.deepStrictEqual(remoto.act, {}); assert.deepStrictEqual(reaberto.feito, {}); assert.deepStrictEqual(reaberto.act, {});
  assert.deepStrictEqual(remoto.cfg.certs, []); assert.deepStrictEqual(reaberto.cfg.certs, []);
  assert.deepStrictEqual(remoto.fc, {}); assert.strictEqual(remoto.cfg.fcv, undefined); assert.strictEqual(remoto.cfg.fcAncora, undefined); assert.strictEqual(remoto.cfg.certsZ, zerado.cfg.certsZ);
 } finally { for (const c of cs) await c.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
