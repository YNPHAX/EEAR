/* Preparação de perfil anterior à migração. A página do app é descarregada antes da alteração;
   apaga somente o checkpoint da identidade semeada e mantém as demais contas. Nunca usado pelo runtime. */
module.exports = async function semearLegado(p, url, chave, estado) {
  await p.goto(new URL('__perfil-legado-sem-app', url).href);
  await p.evaluate(async ([chave, estado]) => {
    await new Promise(resolve => {
      const o = window.indexedDB.open('eear-operacoes', 1); o.onupgradeneeded = () => o.transaction.abort(); o.onerror = () => resolve();
      o.onsuccess = () => { const db = o.result; if (!db.objectStoreNames.contains('contas')) { db.close(); resolve(); return; }
        const t = db.transaction('contas', 'readwrite'); t.objectStore('contas').delete(chave.includes('@') ? chave.slice(chave.indexOf('@') + 1) : '');
        t.oncomplete = () => { db.close(); resolve(); };
      };
    });
    localStorage.setItem(chave, typeof estado === 'string' ? estado : JSON.stringify(estado));
  }, [chave, estado]);
  await p.goto(url);
};
