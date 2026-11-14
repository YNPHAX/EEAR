/* Quota real + abort real durante importação, repetição ainda pendente e recuperação dos mesmos IDs. */
const path = require('path'), assert = require('assert'), fixture = require('./a35-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), hj = new Date().toISOString().slice(0, 10);
(async () => {
  const f = await fixture.abrir(alvo), c = await f.contexto();
  const ler = p => p.evaluate(() => new Promise(resolve => { const o = window.indexedDB.open('eear-operacoes', 1); o.onsuccess = () => { const db = o.result, t = db.transaction('contas'), q = t.objectStore('contas').get(''); t.oncomplete = () => { db.close(); resolve(q.result); }; }; }));
  try {
    await c.route(/http:\/\/127\.0\.0\.1:(8280|9299)\//, r => r.abort());
    const A = await f.pagina(c); await f.importar(A, { v: 1, cfg: {}, act: { [hj]: 2 } }); await A.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado');
    await A.evaluate(() => {
      let n = 0; for (const tamanho of [65536,1024,1]) try { for (;;) localStorage.setItem('quota-import-' + n++, 'x'.repeat(tamanho)); } catch (e) { if (e.name !== 'QuotaExceededError') throw e; }
      const put = window.IDBObjectStore.prototype.put; window.__falharImport = true;
      window.IDBObjectStore.prototype.put = function (v, ...args) { if (window.__falharImport && this.name === 'contas' && v.st?.feito['T:importacao-pendente']) { window.__abortImport = true; this.transaction.abort(); } return put.call(this, v, ...args); };
    });
    const arquivo = { v: 1, cfg: {}, feito: { 'T:importacao-pendente': true }, act: { [hj]: 5 } };
    await f.importar(A, arquivo); assert(await f.ate(() => A.evaluate(() => window.__abortImport === true)));
    const primeiro = await f.estado(A); assert.strictEqual(primeiro.act[hj], 5); const ids = Object.keys(primeiro.cfg._ops.c[JSON.stringify(['act', hj])].a);
    await f.importar(A, arquivo); assert((await A.locator('body').innerText()).includes('já está na fila')); assert.notStrictEqual(await A.locator('#sync').getAttribute('data-local'), 'confirmado');
    assert.strictEqual((await ler(A)).st.act[hj], 2); // nem reserva nem recibo otimista equivalem a commit
    await A.evaluate(() => { window.__falharImport = false; Object.keys(localStorage).filter(k => k.startsWith('quota-import-')).forEach(k => localStorage.removeItem(k)); });
    assert(await f.ate(async () => (await ler(A)).st.act[hj] === 5)); const cp = await ler(A); assert.deepStrictEqual(Object.keys(cp.meta.c[JSON.stringify(['act', hj])].a).sort(), ids.sort());
    await A.reload(); await f.importar(A, arquivo); const final = await f.estado(A); assert.strictEqual(final.act[hj], 5); assert(final.feito['T:importacao-pendente']);
    console.log('✓ Importação sob quota/abort: repetição pendente não confirma falsamente; recupera mesmos IDs e 5/5 após reabrir.');
  } finally { await c.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
