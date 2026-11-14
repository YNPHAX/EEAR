/* Exclusão por cliente Firebase real anterior (2f6cad6), não transporte Claude desativado.
   O protocolo/rules do candidato são os únicos publicados NOS EMULADORES. Nunca há Firebase real. */
const fs = require('fs'), path = require('path'), assert = require('assert'), { execFileSync } = require('child_process');
const fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const antigo = process.env.EEAR_REPO_LEGADO;
(async () => {
  if (!antigo) throw new Error('Defina EEAR_REPO_LEGADO para o produtor real 2f6cad6.');
  const shaAntigo = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: antigo, encoding: 'utf8' }).trim(); assert(shaAntigo.startsWith('2f6cad6'));
  const original = fs.readFileSync(path.join(antigo, 'curso/app/09-contas.js'), 'utf8'); assert(original.includes('await fs.deleteDoc(') && !original.includes('contasExcluidas'));
  if (fixture.emular(alvo, path.join(__dirname, 'a35-retorno-firebase-antigo.test.js'))) return;
  const f = await fixture.abrir(alvo), velha = await fixture.abrir(antigo), ctx = await f.contexto(), ctxVelha = await velha.contexto();
  try {
    const hj = new Date().toISOString().slice(0, 10), cred = await f.conta('exclusao-cliente-v1', { v: 1, t: Date.now() - 20000, cfg: { nome: 'Pessoa Fictícia Excluída', certs: [] }, feito: { 'T:privada': true }, act: { [hj]: 2 } });
    const N = await f.pagina(ctx); await f.entrar(N, cred.email);
    await N.waitForFunction(() => document.querySelector('#sync') && document.querySelector('#sync').dataset.nuvem === 'confirmado');
    const antes = await f.estado(N); assert(antes.cfg._ops && antes.cfg._ops.v === 2); f.rede(ctx, true);
    const V = await velha.pagina(ctxVelha); await velha.entrar(V, cred.email);
    // O app antigo pode recusar ler progresso v2; seu botão de excluir conta continua disponível.
    await velha.clicar(V, 'contaexcluir'); await V.fill('#conta-senha', 'auditoria-f01-123'); await V.fill('#conta-confirma', 'EXCLUIR'); await velha.clicar(V, 'contaexcluirok');
    await V.waitForSelector('#fb-email');
    const desapareceu = await f.ate(async () => (await f.ler(cred.uid)) === null); assert(desapareceu, 'A exclusão antiga precisa ter apagado o documento v2.');
    const req = async (url, op = {}) => { const r = await fetch(url, op); return { status: r.status, json: await r.json().catch(() => null) }; };
    const tomb = await req(`http://127.0.0.1:8280/v1/projects/demo-eear-independent-a35/databases/(default)/documents/contasExcluidas/${cred.uid}`, { headers: { Authorization: 'Bearer owner' } });
    const login = await req('http://127.0.0.1:9299/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: cred.email, password: 'auditoria-f01-123', returnSecureToken: true }) });
    assert.strictEqual(login.status, 400, 'A conta Auth antiga precisa ter sido realmente excluída.');
    await f.clicar(N, 'marcar', { k: 'T:apos-exclusao-legitima' }); f.rede(ctx, false); await N.evaluate(() => window.dispatchEvent(new Event('online')));
    const recriou = await f.ate(async () => !!(await f.ler(cred.uid)), 10000), final = await f.ler(cred.uid);
    const passou = !recriou;
    console.log(`${passou ? '✓' : '✗'} exclusao-firebase-anterior: ${JSON.stringify({ candidato: 'a35ea9a', produtorAntigo: shaAntigo, docV2Apagado: desapareceu, authExcluidaHTTP: login.status, marcadorHTTP: tomb.status, recriou, nomeRestaurado: final && final.cfg.nome, feitoRestaurado: final && final.feito, avisoAtual: await N.locator('#sync').innerText() })}`);
    process.exitCode = passou ? 0 : 1;
  } finally { await ctx.close(); await ctxVelha.close(); await f.fechar(); await velha.fechar(); }
})().catch(e => { console.error('FALHA DE PREPARAÇÃO:', e); process.exitCode = 1; });
