/* Versão de transporte: clientes v2/v3 reais leem v4 como futuro, preserva estudo local e não sobrescreve a conta. */
const fs = require('fs'), path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), antigo = process.env.EEAR_REPO_REPROVADO_IA05, anteriorV3 = process.env.EEAR_REPO_CLIENTE_V3;
(async () => {
  assert(antigo, 'Defina o checkout a6366a8 em EEAR_REPO_REPROVADO_IA05.');
  if (fixture.emular(alvo, path.join(__dirname, 'importacoes-cliente-anterior.test.js'))) return;
  assert(anteriorV3, 'Defina o checkout af32954 em EEAR_REPO_CLIENTE_V3.');
  const f = await fixture.abrir(alvo), c = await f.contexto();
  const docs = 'http://127.0.0.1:8280/v1/projects/demo-eear-independent-a35/databases/(default)/documents';
  try {
    const cred = await f.conta('versao-politica-importacao', { v: 1, t: Date.now(), cfg: { nome: 'Fictícia' }, feito: { 'T:confirmada': true }, act: {} });
    const N = await f.pagina(c); await f.entrar(N, cred.email); await N.waitForFunction(() => document.querySelector('#sync')?.dataset.nuvem === 'confirmado');
    const envelope = async () => { const r = await fetch(`${docs}/alunos/${cred.uid}`, { headers: { Authorization: 'Bearer owner' } }); return r.json(); };
    const antes = await envelope(); assert.strictEqual(antes.fields.v.integerValue, '4');
    for (const [versao, repo] of [[2, antigo], [3, anteriorV3]]) {
    const velha = await fixture.abrir(repo), cv = await velha.contexto();
    try {
    assert(fs.readFileSync(path.join(repo, 'curso/app/02-z-firebase.js'), 'utf8').includes('Number(x.v) > ' + versao));
    const V = await velha.pagina(cv); await velha.entrar(V, cred.email);
    assert(await f.ate(async () => /versão mais nova/.test(await V.locator('#sync').innerText())));
    await velha.clicar(V, 'marcar', { k: 'T:cliente-v' + versao + '-local' }); assert((await velha.estado(V)).feito['T:cliente-v' + versao + '-local']);
    const token = await V.evaluate(async () => { const au = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'); return au.getAuth().currentUser.getIdToken(); });
    const nome = `projects/demo-eear-independent-a35/databases/(default)/documents/alunos/${cred.uid}`;
    const r = await fetch(`${docs}:commit`, { method: 'POST', headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ writes: [{ update: { name: nome, fields: { v: { integerValue: String(versao) }, dados: { stringValue: '{}' }, t: { integerValue: '1' } } }, updateTransforms: [{ fieldPath: 'atualizado', setToServerValue: 'REQUEST_TIME' }] }] }) });
    assert.strictEqual(r.status, 403); const depois = await envelope(); assert.strictEqual(depois.fields.v.integerValue, '4'); assert.strictEqual(depois.fields.dados.stringValue, antes.fields.dados.stringValue);
    assert(!(await f.ler(cred.uid)).feito['T:cliente-v' + versao + '-local']); await V.reload(); assert((await velha.estado(V)).feito['T:cliente-v' + versao + '-local']);
    console.log('✓ Envelope v4 confirmado; cliente v' + versao + ' real avisa versão futura, mantém estudo local e recebe 403 sem alteração remota.');
    } finally { await cv.close(); await velha.fechar(); }
    }
  } finally { await c.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
