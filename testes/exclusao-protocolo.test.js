/* IA04: produtor Firebase real anterior recusado antes de excluir; protocolo atual cria barreira atômica.
   Não substitui a reprodução negativa original a35-retorno-firebase-antigo.test.js. */
const fs = require('fs'), path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), antigo = process.env.EEAR_REPO_LEGADO;
(async () => {
  assert(antigo, 'Defina o checkout real 2f6cad6.');
  assert(fs.readFileSync(path.join(antigo, 'curso/app/09-contas.js'), 'utf8').includes('await fs.deleteDoc('));
  if (fixture.emular(alvo, path.join(__dirname, 'exclusao-protocolo.test.js'))) return;
  const f = await fixture.abrir(alvo), velha = await fixture.abrir(antigo), cs = [];
  const contexto = async origem => { const c = await origem.contexto(); cs.push(c); return c; };
  const req = async (url, op = {}) => { const r = await fetch(url, op); return { status: r.status, json: await r.json().catch(() => null) }; };
  const au = 'http://127.0.0.1:9299/identitytoolkit.googleapis.com/v1/accounts:', docs = 'http://127.0.0.1:8280/v1/projects/demo-eear-independent-a35/databases/(default)/documents';
  try {
    const cred = await f.conta('barreira-exclusao', { v: 1, t: Date.now(), cfg: { nome: 'Fictícia' }, feito: { 'T:privada': true }, act: {} });
    const login = () => req(au + 'signInWithPassword?key=demo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: cred.email, password: 'auditoria-f01-123', returnSecureToken: true }) });
    const token = (await login()).json.idToken, headers = { Authorization: 'Bearer ' + token, 'content-type': 'application/json' };
    const cn = await contexto(f), N = await f.pagina(cn); await f.entrar(N, cred.email);
    await N.waitForFunction(() => document.querySelector('#sync').dataset.nuvem === 'confirmado'); f.rede(cn, true);
    const V = await velha.pagina(await contexto(velha)); await velha.entrar(V, cred.email);
    let statusDelete; V.on('response', r => { if (r.request().method() === 'DELETE' && r.url().includes('/alunos/')) statusDelete = r.status(); });
    await velha.clicar(V, 'contaexcluir'); await V.fill('#conta-senha', 'auditoria-f01-123'); await V.fill('#conta-confirma', 'EXCLUIR'); await velha.clicar(V, 'contaexcluirok');
    assert(await f.ate(async () => /Não foi possível apagar/.test(await V.locator('body').innerText())));
    assert((await f.ler(cred.uid)).feito['T:privada']); assert.strictEqual((await login()).status, 200);
    assert.strictEqual((await req(`${docs}/contasExcluidas/${cred.uid}`, { headers: { Authorization: 'Bearer owner' } })).status, 404);
    const direto = await req(`${docs}/alunos/${cred.uid}`, { method: 'DELETE', headers }); assert.strictEqual(direto.status, 403);
    console.log('✓ Cliente Firebase 2f6cad6: exclusão recusada, Auth e documento preservados; DELETE direto 403.', statusDelete || 'SDK commit recusado');
    const X = await f.pagina(await contexto(f)); await f.entrar(X, cred.email);
    await X.waitForFunction(() => document.querySelector('#sync').dataset.nuvem === 'confirmado');
    await f.clicar(X, 'contaexcluir'); await X.fill('#conta-senha', 'auditoria-f01-123'); await X.fill('#conta-confirma', 'EXCLUIR'); await f.clicar(X, 'contaexcluirok');
    assert(await f.ate(async () => /foram excluídos/.test(await X.locator('body').innerText())));
    assert.strictEqual(await f.ler(cred.uid), null); assert.strictEqual((await login()).status, 400);
    assert.strictEqual((await req(`${docs}/contasExcluidas/${cred.uid}`, { headers: { Authorization: 'Bearer owner' } })).status, 200);
    const antigoDoc = await req(`${docs}/alunos/${cred.uid}`, { headers }); assert.strictEqual(antigoDoc.status, 403);
    const nome = `projects/demo-eear-independent-a35/databases/(default)/documents/alunos/${cred.uid}`;
    const recriar = await req(`${docs}:commit`, { method: 'POST', headers, body: JSON.stringify({ writes: [{ update: { name: nome, fields: { v: { integerValue: '2' }, dados: { stringValue: '{}' }, t: { integerValue: '1' } } }, updateTransforms: [{ fieldPath: 'atualizado', setToServerValue: 'REQUEST_TIME' }] }] }) });
    assert.strictEqual(recriar.status, 403);
    for (const method of ['PATCH', 'DELETE']) assert.strictEqual((await req(`${docs}/contasExcluidas/${cred.uid}`, { method, headers, body: method === 'PATCH' ? JSON.stringify({ fields: { v: { integerValue: '1' } } }) : undefined })).status, 403);
    await f.clicar(N, 'marcar', { k: 'T:apos-exclusao' }); f.rede(cn, false); await N.evaluate(() => window.dispatchEvent(new Event('online')));
    assert(await f.ate(async () => /recusou|parou/.test(await N.locator('#sync').innerText())));
    assert.strictEqual(await f.ler(cred.uid), null); assert((await f.estado(N)).feito['T:apos-exclusao']);
    console.log('✓ Exclusão atual completa, tombstone imutável, token antigo 403 em leitura/gravação, reconexão não recria; estudo offline preservado localmente.');
  } finally { for (const c of cs) await c.close(); await f.fechar(); await velha.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
