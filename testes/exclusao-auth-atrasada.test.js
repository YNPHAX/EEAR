/* IA03 adicional: retém a resposta real do Auth, depois da exclusão no servidor.
   Mesmo a troca A -> B -> A exige uma geração de sessão nova. Nenhuma API interna é exposta. */
const path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'exclusao-auth-atrasada.test.js'))) return;
  const f = await fixture.abrir(alvo), c = await f.contexto(); let liberar;
  try {
    const seed = k => ({ v: 1, t: Date.now(), cfg: { nome: 'Fictícia' }, feito: { [k]: true }, act: {} });
    const a = await f.conta('auth-atrasada-A', seed('T:A')), b = await f.conta('auth-atrasada-B', seed('T:B'));
    const p = await f.pagina(c); await f.entrar(p, b.email); await p.waitForFunction(() => document.querySelector('#sync').dataset.nuvem === 'confirmado');
    const trocar = email => p.evaluate(async email => { const au = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'); await au.signInWithEmailAndPassword(au.getAuth(), email, 'auditoria-f01-123'); }, email);
    await trocar(a.email); await p.waitForFunction(() => document.querySelector('#sync').dataset.nuvem === 'confirmado');
    let iniciou; const iniciouP = new Promise(r => { iniciou = r; }), espera = new Promise(r => { liberar = r; });
    await c.route(/127\.0\.0\.1:9299\/.*accounts:delete/, async r => { const res = await r.fetch(); iniciou(res.status()); await espera; await r.fulfill({ response: res }).catch(() => null); });
    await f.clicar(p, 'contaexcluir'); await p.fill('#conta-senha', 'auditoria-f01-123'); await p.fill('#conta-confirma', 'EXCLUIR'); await f.clicar(p, 'contaexcluirok');
    assert.strictEqual(await Promise.race([iniciouP, new Promise((_, rej) => setTimeout(() => rej(new Error('Não reteve resposta Auth')), 15000))]), 200);
    assert.strictEqual(await f.ler(a.uid), null); await trocar(b.email);
    await p.waitForFunction(uid => localStorage.getItem('missao-eear-conta') === 'firebase:' + uid, b.uid);
    liberar(); await p.waitForTimeout(1200);
    const uid = await p.evaluate(async () => { const au = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'); return au.getAuth().currentUser.uid; });
    assert.strictEqual(uid, b.uid); assert.strictEqual(await p.evaluate(() => localStorage.getItem('missao-eear-conta')), 'firebase:' + b.uid);
    assert((await f.estado(p)).feito['T:B']); await f.clicar(p, 'marcar', { k: 'T:B-posterior' });
    assert(await f.ate(async () => (await f.ler(b.uid)).feito['T:B-posterior']));
    assert.strictEqual(await p.evaluate(id => localStorage.getItem('missao-eear-v1@firebase:' + id), a.uid), null);
    console.log('✓ Resposta Auth deleteUser atrasada de A não encerra B, não altera seu perfil e não impede novo estudo remoto; cópia A removida.');
  } finally { if (liberar) liberar(); await c.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
