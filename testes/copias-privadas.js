/* Observa resíduos por UID sem confundir tombstone vazio com progresso pessoal. Só dados fictícios dos testes. */
module.exports = async function copiasPrivadas(p, uid, preparar) {
  return p.evaluate(async ([uid, preparar]) => {
    const id = 'firebase:' + uid, ref = 'missao-eear-v1-diario@' + id + '#copia-privada-ficticia';
    const valores = [];
    for (const nome of ['eear-operacoes', 'eear-diarios']) {
      if (!(await window.indexedDB.databases()).some(d => d.name === nome)) continue;
      await new Promise((resolve, reject) => {
        const o = window.indexedDB.open(nome, 1); o.onerror = () => reject(o.error);
        o.onsuccess = () => {
          const db = o.result, t = db.transaction([...db.objectStoreNames], preparar ? 'readwrite' : 'readonly');
          if (preparar) {
            if (nome === 'eear-operacoes') t.objectStore('quarentena').add({ conta: id, origem: 'fixture-privacidade', texto: 'Pessoa Fictícia — cópia privada' });
            else if (db.objectStoreNames.contains('d')) t.objectStore('d').put('Pessoa Fictícia — espelho privado', ref);
          } else for (const store of db.objectStoreNames) {
            const q = t.objectStore(store).openCursor();
            q.onsuccess = () => { const c = q.result; if (!c) return;
              if ((store === 'contas' && c.key === id && !c.value.apagado) || (store === 'quarentena' && c.value.conta === id) || (store === 'd' && String(c.key).startsWith('missao-eear-v1-diario@' + id + '#'))) valores.push({ banco: nome, store });
              c.continue();
            };
          }
          t.oncomplete = () => { db.close(); resolve(); }; t.onabort = t.onerror = () => { db.close(); reject(t.error); };
        };
      });
    }
    return valores;
  }, [uid, preparar]);
};
