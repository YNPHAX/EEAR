/* Regressões de integridade no bundle real, com dados fictícios e Firebase somente em loopback. */
const assert = require('assert'), fs = require('fs'), path = require('path'), fixture = require('./integridade-fixture.js');
const { local, remoto, cairPagina, responder } = require('./c186-acoes.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const pasta = process.env.EEAR_AUDITORIA_SAIDA || '/tmp/eear-propriedades-c186008';
const docs = 'http://127.0.0.1:8380/v1/projects/demo-eear-properties-c186/databases/(default)/documents';
const headers = { 'content-type': 'application/json', Authorization: 'Bearer owner' };
const ordenar = x => Array.isArray(x) ? x.map(ordenar) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, ordenar(x[k])])) : x;

async function simulados(f, r) {
  const cred = await f.conta('campos-json', { v: 1, t: Date.now(), cfg: {} });
  const ca = await f.contexto(), cb = await f.contexto();
  try {
    const A = await f.pagina(ca); let B = await f.pagina(cb);
    await f.entrar(A, cred.email); await remoto(A); await f.entrar(B, cred.email); await remoto(B);
    const sim = JSON.parse('{"d":"2026-11-15","tipo":"materia","mat":"por","r":{"por":[1,2,0],"__proto__":[1,2]},"__proto__":{"dado":1},"detalhes":[false,null]}');
    const id = '@sim:v1:' + JSON.stringify(ordenar(sim)) + '#0';
    const explicito = { ...sim, id }, legado = { ...sim, _sid: id };
    await f.importar(A, { v: 1, cfg: {}, sims: [explicito] }); await remoto(A);
    r.explicito = (await f.ler(cred.uid)).sims;
    await f.clicar(A, 'zerar'); await f.clicar(A, 'zerarok'); await remoto(A);
    await f.importar(B, { v: 1, cfg: {}, sims: [sim] }); await remoto(B);
    r.aposReset = (await f.ler(cred.uid)).sims;
    B = await cairPagina(B, cb, f); await remoto(B); r.reaberto = (await f.estado(B)).sims;
    assert.deepStrictEqual(r.explicito, [explicito]);
    assert.deepStrictEqual(r.aposReset, [legado], 'Tombstone de ID explícito não pode apagar a identidade legada com o mesmo texto.');
    assert.deepStrictEqual(r.reaberto, [legado]);
    await f.importar(B, { v: 1, cfg: {}, sims: [sim, explicito] }); await remoto(B);
    r.aposReimportar = (await f.ler(cred.uid)).sims;
    assert.deepStrictEqual(r.aposReimportar, [legado], 'O ID explícito removido não volta.');
  } finally { await ca.close(); await cb.close(); }
}

async function marcador(f, r, chave) {
  const cred = await f.conta(r.nome, { v: 1, t: Date.now(), cfg: {} });
  const c = await f.contexto();
  try {
    const p = await f.pagina(c); await f.entrar(p, cred.email); await remoto(p);
    await f.clicar(p, 'marcar', { k: 'T:preservada' }); await remoto(p);
    const original = await f.ler(cred.uid), url = `${docs}/alunos/${cred.uid}`;
    const estado = { ...original, cfg: { ...original.cfg, _ops: { ...original.cfg._ops, r: { ...original.cfg._ops.r, [chave]: [0, 'legado', 1e30] } } } };
    const bruto = JSON.stringify(estado, null, 2).replace('1e+30', '1e309');
    const resposta = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify({ fields: { v: { integerValue: '5' }, t: { integerValue: '1' }, dados: { stringValue: bruto } } }) });
    assert.strictEqual(resposta.status, 200);
    await p.reload(); await f.clicar(p, 'tab', { v: 'plano' });
    r.avisou = await f.ate(async () => /documento remoto contém progresso incompatível/.test(await p.locator('#sync').innerText()), 6000);
    const conta = 'firebase:' + cred.uid;
    const lerQuarentena = () => p.evaluate(conta => new Promise((resolve, reject) => {
      const o = window.indexedDB.open('eear-operacoes', 1); o.onerror = () => reject(o.error);
      o.onsuccess = () => {
        const db = o.result, t = db.transaction('quarentena'), q = t.objectStore('quarentena').getAll();
        t.oncomplete = () => { db.close(); resolve(q.result.filter(x => x.conta === conta && x.origem === 'nuvem')); };
      };
    }), conta);
    r.copiaIntegral = await f.ate(async () => (await lerQuarentena()).some(x => x.texto === bruto), 3000);
    r.preservouServidor = (await (await fetch(url, { headers })).json()).fields.dados.stringValue === bruto;
    r.preservouLocal = (await f.estado(p)).feito['T:preservada'] === true;
    assert(r.preservouServidor && r.preservouLocal && r.avisou && r.copiaIntegral, JSON.stringify(r));
  } finally { await c.close(); }
}

async function zerarErrosCorrigidos(f, r) {
  const cred = await f.conta('erros-corrigidos', { v: 1, t: Date.now(), cfg: {}, erros: { 'POR01-0': 2 } });
  const ca = await f.contexto(), cb = await f.contexto(), id = 'POR01-0';
  try {
    const A = await f.pagina(ca); let B = await f.pagina(cb);
    await f.entrar(A, cred.email); await remoto(A); await f.entrar(B, cred.email); await remoto(B);
    assert.strictEqual((await f.estado(B)).erros[id], 2);
    f.rede(cb, true);
    await f.clicar(A, 'errosini'); assert.deepStrictEqual(await responder(A, false), { id, errado: false });
    await f.clicar(A, 'sairquiz'); await remoto(A); r.corrigidos = (await f.ler(cred.uid)).erros;
    assert.deepStrictEqual(r.corrigidos, {});
    await f.clicar(A, 'zerar'); await f.clicar(A, 'zerarok'); await remoto(A);
    await f.clicar(B, 'errosini'); assert.deepStrictEqual(await responder(B, true), { id, errado: true });
    await f.clicar(B, 'sairquiz'); await local(B); r.offline = (await f.estado(B)).erros[id];
    assert.strictEqual(r.offline, 3);
    f.rede(cb, false); await B.evaluate(() => window.dispatchEvent(new Event('online'))); await remoto(B);
    r.nuvem = (await f.ler(cred.uid)).erros[id];
    B = await cairPagina(B, cb, f); await remoto(B); r.reaberto = (await f.estado(B)).erros[id];
    assert.strictEqual(r.nuvem, 1); assert.strictEqual(r.reaberto, 1);
  } finally { await ca.close(); await cb.close(); }
}

(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'integridade-dados.test.js'))) return;
  const f = await fixture.abrir(alvo), resultados = [];
  try {
    for (const [nome, executar] of [
      ['campos-e-ids-de-simulados', simulados],
      ['marcador-remoto', (f, r) => marcador(f, r, '["cfg","certsZ"]')],
      ['marcador-remoto-caminho-alternativo', (f, r) => marcador(f, r, '[ "cfg", "certsZ" ]')],
      ['zerar-erros-corrigidos', zerarErrosCorrigidos]
    ]) {
      const r = { nome }; resultados.push(r);
      try { await executar(f, r); r.passou = true; console.log('✓ ' + nome); }
      catch (e) { r.passou = false; r.erro = e.stack; console.error('✗ ' + nome, e); }
    }
  } finally { await f.fechar(); }
  fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(path.join(pasta, 'integridade-dados.json'), JSON.stringify(resultados, null, 2));
  process.exitCode = resultados.every(r => r.passou) ? 0 : 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
