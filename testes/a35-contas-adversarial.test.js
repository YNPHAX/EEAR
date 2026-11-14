/* Cenários novos, Firebase somente em projeto demo e portas próprias (fixture auditável).
   Não modifica nem instrumenta o app. Controla somente respostas HTTP reais/SDK público. */
const path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const hj = new Date().toISOString().slice(0, 10);
const seed = (nome, k) => ({ v: 1, t: Date.now() - 20000, cfg: { nome, certs: [] }, feito: { [k]: true }, act: { [hj]: 2 }, mod: {}, fc: {}, sims: [] });
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'a35-contas-adversarial.test.js'))) return;
  const f = await fixture.abrir(alvo); let falhas = 0;
  const ok = (p, nome, dados) => { console.log(`${p ? '✓' : '✗'} ${nome}: ${JSON.stringify(dados)}`); if (!p) falhas++; };
  const confirmado = p => p.waitForFunction(() => document.querySelector('#sync') && document.querySelector('#sync').dataset.local === 'confirmado' && document.querySelector('#sync').dataset.nuvem === 'confirmado');
  try {
    { // Duas origens de atividade com IDs disjuntos, incluindo a cópia sem conta do próprio runtime v2.
      const c = await f.contexto();
      try {
        const baseRemota = seed('Conta Fictícia', 'T:remota'); baseRemota.act[hj] = 0;
        const cred = await f.conta('levar-identificadas', baseRemota), dispositivo = await f.contexto();
        try { const R = await f.pagina(dispositivo); await f.entrar(R, cred.email); await confirmado(R); await f.clicar(R, 'marcar', { k: 'T:R1' }); await f.clicar(R, 'marcar', { k: 'T:R2' }); await confirmado(R); assert.strictEqual((await f.estado(R)).act[hj], 2); } finally { await dispositivo.close(); }
        const A = await f.pagina(c); await f.importar(A, { v: 1, cfg: { nome: 'Anônimo Fictício' } });
        await f.clicar(A, 'marcar', { k: 'T:anon1' }); await f.clicar(A, 'marcar', { k: 'T:anon2' });
        await f.clicar(A, 'mod', { id: 'POR01' }); await f.clicar(A, 'aba', { aba: 'teoria' });
        await f.clicar(A, 'tab', { v: 'plano' }); await A.waitForFunction(() => document.querySelector('#sync') && document.querySelector('#sync').dataset.local === 'confirmado');
        const anon = await f.estado(A); assert(anon.mod.POR01 && anon.mod.POR01.lido); assert(anon.cfg._ops && anon.cfg._ops.v === 2);
        await f.entrar(A, cred.email); await confirmado(A); const antes = await f.estado(A); assert.strictEqual(antes.act[hj], 2);
        const chaveAct = JSON.stringify(['act', hj]), positivos = st => Object.keys(st.cfg._ops.c[chaveAct].a).filter(id => st.cfg._ops.c[chaveAct].a[id] > 0);
        const idsAnon = positivos(anon), idsConta = positivos(antes); assert.strictEqual(idsAnon.length, 2); assert.strictEqual(idsConta.length, 2); assert(!idsAnon.some(id => idsConta.includes(id)), 'Contribuições precisam ser causalmente distintas.');
        assert(await A.locator('[data-a="contalevar"]').count(), 'A ação pública precisa estar disponível.');
        await A.locator('[data-a="contalevar"]').first().click();
        await confirmado(A); const depois = await f.estado(A), remoto = await f.ler(cred.uid), esperado = anon.act[hj] + antes.act[hj];
        ok(depois.act[hj] === esperado && remoto.act[hj] === esperado && depois.feito['T:anon1'] && depois.feito['T:anon2'], 'levar-operacoes-identificadas', { anon: anon.act[hj], contaAntes: antes.act[hj], esperado, local: depois.act[hj], remoto: remoto.act[hj], tarefas: depois.feito, opsAnon: idsAnon, opsContaAntes: idsConta });
        // Controle positivo pelo importador público, com os MESMOS IDs: prova que não há ambiguidade legada.
        await f.importar(A, anon); await confirmado(A);
        const unido = await f.estado(A); assert.strictEqual(unido.act[hj], esperado); assert.strictEqual((await f.ler(cred.uid)).act[hj], esperado);
        await f.importar(A, anon); await confirmado(A); await A.reload(); await confirmado(A);
        const repetido = await f.estado(A); assert.strictEqual(repetido.act[hj], esperado);
        ok(true, 'controle-importacao-ids-preservados', { esperado, local: unido.act[hj], remoto: (await f.ler(cred.uid)).act[hj], depoisRepetirReabrir: repetido.act[hj] });
      } finally { await c.close(); }
    }
    { // A exclusão de A já foi aceita no servidor; a confirmação HTTP é retida, e o usuário entra em B.
      const c = await f.contexto(); let liberar;
      try {
        const ca = await f.conta('exclusao-antiga-A', seed('Conta A Fictícia', 'T:A'));
        const cb = await f.conta('exclusao-antiga-B', seed('Conta B Fictícia', 'T:B'));
        const A = await f.pagina(c); await f.entrar(A, cb.email); await confirmado(A);
        const trocar = email => A.evaluate(async email => { const app = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'), au = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'); await au.signInWithEmailAndPassword(au.getAuth(app.getApp()), email, 'auditoria-f01-123'); }, email);
        await trocar(ca.email); await A.waitForFunction(uid => localStorage.getItem('missao-eear-conta') === 'firebase:' + uid, ca.uid); await confirmado(A);
        let iniciou, reter = true; const iniciado = new Promise(r => { iniciou = r; }), espera = new Promise(r => { liberar = r; });
        await c.route(/127\.0\.0\.1:8280\/.*:commit(?:\?|$)/, async r => {
          if (!reter || !(r.request().postData() || '').includes('contasExcluidas')) return r.fallback();
          reter = false; const res = await r.fetch(); iniciou(res.status()); await espera; await r.fulfill({ response: res }).catch(() => null);
        });
        await f.clicar(A, 'contaexcluir'); await A.fill('#conta-senha', 'auditoria-f01-123'); await A.fill('#conta-confirma', 'EXCLUIR'); await f.clicar(A, 'contaexcluirok');
        const http = await Promise.race([iniciado, new Promise((_, rej) => setTimeout(() => rej(new Error('Não reteve commit de exclusão')), 15000))]); assert.strictEqual(http, 200); assert.strictEqual(await f.ler(ca.uid), null);
        await A.evaluate(async email => { const app = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'), au = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'); await au.signInWithEmailAndPassword(au.getAuth(app.getApp()), email, 'auditoria-f01-123'); }, cb.email);
        await A.waitForFunction(uid => localStorage.getItem('missao-eear-conta') === 'firebase:' + uid, cb.uid);
        // A confirmação antiga retida serializa a fila Firestore deste cliente. Exigimos o checkpoint
        // B já confirmado anteriormente, sem presumir que a transação nova atravesse essa fila.
        assert(await f.ate(async () => (await f.estado(A)).feito['T:B'] && (await A.locator('#sync').getAttribute('data-local')) === 'confirmado'));
        const antesResposta = await f.estado(A); assert(antesResposta.feito['T:B']); liberar();
        await f.ate(async () => (await A.locator('body').innerText()).includes('foram excluídos'), 10000);
        const authAtual = await A.evaluate(async () => { const app = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'), au = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'); const u = au.getAuth(app.getApp()).currentUser; return { uid: u && u.uid, local: localStorage.getItem('missao-eear-conta') }; });
        const depois = await f.estado(A); await f.clicar(A, 'marcar', { k: 'T:depois-troca' });
        await f.ate(async () => { const x = await f.ler(cb.uid); return x && x.feito['T:depois-troca']; }, 5000);
        const remotoB = await f.ler(cb.uid);
        ok(authAtual.uid === cb.uid && authAtual.local === 'firebase:' + cb.uid && depois.feito['T:B'] && remotoB.feito['T:depois-troca'], 'exclusao-resposta-de-sessao-antiga', { http, uidA: ca.uid, uidB: cb.uid, authAtual, antesResposta: antesResposta.feito, depois: depois.feito, remotoB: remotoB.feito, aviso: await A.locator('#sync').innerText() });
      } finally { if (liberar) liberar(); await c.close(); }
    }
  } finally { await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error('FALHA DE PREPARAÇÃO:', e); process.exitCode = 1; });
