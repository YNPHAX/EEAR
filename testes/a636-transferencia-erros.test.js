/* IA06: corrigir erro -> exportar -> estudar a MESMA questão -> Levar. Fluxos reais de quiz/importação.
   Lê somente o conteúdo público window.EEAR para escolher alternativas; não chama funções internas do app. */
const path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), id = 'POR01-0';
(async () => {
  if (fixture.emular(alvo, path.join(__dirname, 'a636-transferencia-erros.test.js'))) return;
  const f = await fixture.abrir(alvo), cs = []; let falhas = 0;
  const ctx = async () => { const c = await f.contexto(); cs.push(c); return c; };
  const confirmado = p => p.waitForFunction(() => document.querySelector('#sync')?.dataset.nuvem === 'confirmado' && document.querySelector('#sync')?.dataset.local === 'confirmado');
  const responder = (p, errar) => p.evaluate(errar => {
    const texto = html => { const e = document.createElement('div'); e.innerHTML = html; return e.textContent.replace(/\s+/g, ' ').trim(); };
    const enunciado = document.querySelector('.q-enun').textContent.replace(/\s+/g, ' ').trim();
    const m = window.EEAR.modulos.find(m => m.id === 'POR01'), i = m.q.findIndex(q => texto(q[0]) === enunciado);
    if (i < 0) throw new Error('Não identificou questão pelo conteúdo público.');
    const q = m.q[i], certo = texto(q[1][q[2]]), opcoes = [...document.querySelectorAll('[data-a="qresp"]')];
    const errado = errar && i === 0, b = opcoes.find(b => (texto(b.querySelector('span:last-child').innerHTML) === certo) !== errado);
    if (!b) throw new Error('Não encontrou alternativa visível.'); b.click(); return { id: 'POR01-' + i, errado };
  }, errar);
  try {
    const cred = await f.conta('causal-erros', { v: 1, t: Date.now(), cfg: { nome: 'Conta Fictícia' }, erros: { [id]: 2 }, act: {} });
    const A = await f.pagina(await ctx()); await f.entrar(A, cred.email); await confirmado(A);
    assert.strictEqual((await f.estado(A)).erros[id], 2);
    await f.clicar(A, 'errosini'); assert.deepStrictEqual(await responder(A, false), { id, errado: false });
    const corrigido = await f.estado(A); assert.strictEqual(corrigido.erros[id], undefined); await confirmado(A);
    const k = JSON.stringify(['erros', id]), lidas = Object.keys(corrigido.cfg._ops.c[k].l); assert(lidas.length > 0);
    const C = await f.pagina(await ctx()); await f.importar(C, corrigido); assert.strictEqual((await f.estado(C)).erros[id], undefined);
    await f.clicar(C, 'quizmod', { id: 'POR01' }); let resposta;
    for (let n = 0; n < 40; n++) { resposta = await responder(C, true); if (resposta.id === id) break; await f.clicar(C, 'qprox'); }
    assert.deepStrictEqual(resposta, { id, errado: true }); await f.clicar(C, 'sairquiz');
    const backup = await f.estado(C), cm = backup.cfg._ops.c[k]; assert.strictEqual(backup.erros[id], 1);
    assert(Object.values(cm.o || {}).some(o => lidas.every(l => o[l] === true)), 'O erro novo precisa comprovar que observou a correção do destino.');
    await f.entrar(C, cred.email); await confirmado(C); assert.strictEqual((await f.estado(C)).erros[id], undefined);
    await C.locator('[data-a="contalevar"]').first().click(); await confirmado(C);
    const local = await f.estado(C), remoto = await f.ler(cred.uid); await C.reload(); const reaberto = await f.estado(C);
    const passou = local.erros[id] === 1 && remoto.erros[id] === 1 && reaberto.erros[id] === 1;
    console.log(`${passou ? '✓' : '✗'} levar-erro-posterior-corrigido: ${JSON.stringify({ esperado: 1, fonte: backup.erros[id], local: local.erros[id], remoto: remoto.erros[id], reaberto: reaberto.erros[id], correcoesObservadas: lidas, causalidadeFonte: cm, causalidadeDestino: local.cfg._ops.c[k], aviso: await C.locator('#sync').innerText() })}`); if (!passou) falhas++;
    await f.importar(C, backup); await confirmado(C); const direto = await f.estado(C); assert.strictEqual(direto.erros[id], 1); assert.strictEqual((await f.ler(cred.uid)).erros[id], 1);
    console.log('✓ Controle: importar o MESMO backup preserva a causalidade e mantém exatamente um erro.');
  } finally { for (const c of cs) await c.close(); await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error('PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
