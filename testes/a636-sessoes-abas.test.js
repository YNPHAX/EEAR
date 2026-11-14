/* IA03 adicional: troca real de Auth em outra aba durante commit A já aceito e com resposta retida.
   B confirma estudo remotamente pela própria conexão; callback de A não pode apagar/encerrar B em nenhuma aba. */
const path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'a636-sessoes-abas.test.js'))) return;
  const f = await fixture.abrir(alvo), c = await f.contexto(); let liberar;
  const uid = p => p.evaluate(async () => { const au = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'); return au.getAuth().currentUser?.uid || null; });
  const login = (p, email) => p.evaluate(async email => { const au = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'); await au.signInWithEmailAndPassword(au.getAuth(), email, 'auditoria-f01-123'); }, email);
  const confirmado = p => p.waitForFunction(() => document.querySelector('#sync')?.textContent === 'Progresso salvo na sua conta.' && document.querySelector('#sync')?.dataset.local === 'confirmado');
  try {
    const seed = k => ({ v: 1, t: Date.now(), cfg: { nome: 'Fictícia' }, feito: { [k]: true } });
    const a = await f.conta('duas-abas-A', seed('T:A')), b = await f.conta('duas-abas-B', seed('T:B'));
    const A = await f.pagina(c); await f.entrar(A, a.email); await confirmado(A); const B = await f.pagina(c); await f.clicar(B, 'tab', { v: 'plano' }); await confirmado(B);
    let iniciou, segurar = true; const sinal = new Promise(r => { iniciou = r; }), espera = new Promise(r => { liberar = r; });
    await c.route(/127\.0\.0\.1:8280\/.*:commit(?:\?|$)/, async r => {
      if (!segurar || !(r.request().postData() || '').includes('/contasExcluidas/' + a.uid)) return r.fallback();
      segurar = false; const res = await r.fetch(); iniciou(res.status()); await espera; await r.fulfill({ response: res }).catch(() => null);
    });
    await f.clicar(A, 'contaexcluir'); await A.fill('#conta-senha', 'auditoria-f01-123'); await A.fill('#conta-confirma', 'EXCLUIR'); await f.clicar(A, 'contaexcluirok');
    assert.strictEqual(await Promise.race([sinal, new Promise((_, j) => setTimeout(() => j(new Error('Não reteve commit A')), 15000))]), 200);
    await login(B, b.email); assert(await f.ate(async () => await uid(A) === b.uid && await uid(B) === b.uid));
    await f.clicar(B, 'tab', { v: 'plano' }); await confirmado(B); await f.clicar(B, 'marcar', { k: 'T:B-antes-resposta-A' });
    assert(await f.ate(async () => (await f.ler(b.uid)).feito['T:B-antes-resposta-A']));
    liberar();
    assert(await f.ate(() => B.evaluate(id => localStorage.getItem('missao-eear-v1@firebase:' + id) === null, a.uid)), 'Exige conclusão efetiva da exclusão A antes de conferir B.');
    const uids = [await uid(A), await uid(B)]; assert.deepStrictEqual(uids, [b.uid, b.uid]);
    await f.clicar(A, 'marcar', { k: 'T:B-depois-resposta-A' });
    assert(await f.ate(async () => (await f.ler(b.uid)).feito['T:B-depois-resposta-A']));
    assert.strictEqual(await f.ler(a.uid), null); assert((await f.estado(B)).feito['T:B']);
    console.log('✓ A excluída; duas abas permanecem em B; estudo de B confirmado antes/depois da resposta A; nenhum dado B apagado.');
  } finally { if (liberar) liberar(); await c.close(); await f.fechar(); }
})().catch(e => { console.error('PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
