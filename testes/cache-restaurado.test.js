/* A projeção do cache pode estar antiga enquanto _ops/checkpoint já contêm estudo novo (recuperação real).
   Normalizar/absorver diários em memória não é prova de que os bytes originais do cache foram atualizados. */
const path = require('path'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  const f = await fixture.abrir(alvo), ctx = await f.contexto(), hj = new Date().toISOString().slice(0, 10);
  try {
    await ctx.route(/http:\/\/127\.0\.0\.1:(8180|9199)\//, r => r.abort());
    let A = await f.pagina(ctx); await f.importar(A, { v: 1, cfg: { nome: 'Cache Fictício' }, feito: { 'T:base': true }, act: { [hj]: 2 } });
    await f.clicar(A, 'marcar', { k: 'T:confirmada' });
    if (!await f.ate(async () => (await f.estado(A)).act[hj] === 3 && (await A.locator('#sync').getAttribute('data-local')) === 'confirmado')) throw new Error('Operação não confirmada.');
    const url = A.url(); await A.close(); A = await ctx.newPage(); await A.goto(new URL('__perfil-sem-app', url).href);
    // Preparação isolada, sem escritor vivo: o IDB não é modificado nem se falsificam getItem/setItem.
    const preparado = await A.evaluate(hj => new Promise(resolve => {
      const o = window.indexedDB.open('eear-operacoes', 1); o.onsuccess = () => { const db = o.result, t = db.transaction('contas', 'readonly'), q = t.objectStore('contas').get(''); t.oncomplete = () => {
        db.close(); const st = JSON.parse(JSON.stringify(q.result.st)); delete st.feito['T:confirmada']; st.act[hj] = 2;
        localStorage.setItem('missao-eear-v1', JSON.stringify(st)); resolve({ idb: q.result.st.act[hj], cache: st.act[hj], metaPreservada: !!st.cfg._ops });
      }; };
    }), hj);
    await A.goto(url); let cache;
    const atualizou = await f.ate(async () => { cache = await A.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1'))); return cache.feito['T:confirmada'] && cache.act[hj] === 3; }, 7000);
    const exportado = await f.estado(A);
    console.log('DIAGNÓSTICO cache-restaurado: ' + JSON.stringify({ preparado, atualizou, atividadeCache: cache.act[hj], atividadeExportada: exportado.act[hj], marcaCache: !!cache.feito['T:confirmada'], marcaExportada: !!exportado.feito['T:confirmada'] }));
    if (!atualizou || !exportado.feito['T:confirmada'] || exportado.act[hj] !== 3) throw new Error('Cache antigo foi considerado atualizado sem conferir os bytes de sua projeção.');
    console.log('✓ recuperação regrava o cache antigo sem alterar o checkpoint confirmado.');
  } finally { await ctx.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
