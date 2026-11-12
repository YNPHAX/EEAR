  /* ---------- diário durável: cópia dos diários em IndexedDB (queda do navegador inteiro) ----------
     No Chromium, uma gravação recente no localStorage pode se perder quando o processo do navegador inteiro cai: medido
     neste projeto (Browser.crash 50 ms, 300 ms e 1,2 s depois da gravação: o localStorage perdeu o dado nas 18 rodadas;
     o IndexedDB, com a transação concluída, o manteve em todas). O localStorage continua sendo a cópia de trabalho (a
     abertura é síncrona e versões antigas do app a leem); cada diário também vai para o IndexedDB, e na abertura o app
     devolve ao localStorage o diário que só sobreviveu lá. Com a conexão aberta (desde a abertura do app), o pedido de
     gravação vai ao navegador na hora (commit síncrono); a confirmação em disco é do navegador, e uma queda nos primeiros
     milissegundos depois do clique ainda pode perder aquele clique (não medido abaixo de 50 ms).
     A marca APAGOU_K diz que a cópia principal sumiu por "Apagar os dados deste aparelho" (e não por uma queda): só então
     um diário sem cópia principal entra apenas com o que veio depois da base (soDepois). Sem a marca, entra inteiro.
     Funções declaradas: 09-contas.js, 14-abas.js e 15-diarios-pendentes.js as usam depois que o arquivo carregou. */
  function abrirDuravel() {
    if (loc.idb) return loc.idb;
    loc.idb = new Promise(res => {
      try {
        if (!window.indexedDB) { res(null); return; }
        const o = window.indexedDB.open('eear-diarios', 1);
        o.onupgradeneeded = () => { try { o.result.createObjectStore('d'); } catch (e) { /* já existe */ } };
        o.onsuccess = () => { loc.idbAberto = o.result; res(o.result); };
        o.onerror = () => res(null);
        o.onblocked = () => res(null);
      } catch (e) { res(null); }
    });
    return loc.idb;
  }
  /* Grava (txt) ou apaga (null) a cópia durável do diário k, na ordem em que foi pedida. Falha: o localStorage continua.
     Com a conexão já aberta, a transação é criada e confirmada (commit) na hora, de forma síncrona: o pedido de gravação
     chega ao navegador mesmo que a página fique ocupada ou parada logo depois do clique. */
  function espelhar(k, txt) {
    const db = loc.idbAberto;
    if (db && !loc.filaPendente) {
      try {
        const t = db.transaction('d', 'readwrite', { durability: 'strict' }), s = t.objectStore('d');
        if (txt == null) s.delete(k); else s.put(txt, k);
        if (typeof t.commit === 'function') t.commit();
        return Promise.resolve();
      } catch (e) { /* conexão fechada: vai pela fila */ }
    }
    loc.filaPendente = (loc.filaPendente || 0) + 1;
    loc.fila = (loc.fila || Promise.resolve()).then(() => abrirDuravel()).then(db => new Promise(res => {
      if (!db) { res(); return; }
      try {
        const t = db.transaction('d', 'readwrite', { durability: 'strict' }), s = t.objectStore('d');
        if (txt == null) s.delete(k); else s.put(txt, k);
        t.oncomplete = t.onerror = t.onabort = () => res();
      } catch (e) { res(); }
    })).catch(() => { /* sem IndexedDB */ }).then(() => { loc.filaPendente--; }); // na ordem: o caminho síncrono só depois da fila vazia
    return loc.fila;
  }
  /* Na abertura: diário que está no IndexedDB e não está no localStorage (ou está com sequência menor) volta para ele. */
  function restaurarDuraveis() {
    const conta = identidade, pre = chave(DIARIO_K) + '#';
    abrirDuravel().then(db => {
      if (!db) return;
      try {
        const t = db.transaction('d', 'readonly'), r = t.objectStore('d').openCursor(window.IDBKeyRange.bound(pre, pre + '\uffff'));
        const achados = [];
        r.onsuccess = () => { const c = r.result; if (c) { achados.push([c.key, c.value]); c.continue(); } };
        t.oncomplete = () => {
          if (identidade !== conta) return;
          let voltou = false;
          achados.forEach(([k, v]) => {
            if (k === chaveDiario(loc.tab) || typeof v !== 'string') return;
            let d = null, l = null; try { d = JSON.parse(v); l = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return; }
            if (!d || typeof d.seq !== 'number' || (l && typeof l.seq === 'number' && l.seq >= d.seq)) return;
            try { localStorage.setItem(k, v); voltou = true; } catch (e) { /* sem espaço */ }
          });
          if (voltou) consolidar();
        };
      } catch (e) { /* sem IndexedDB */ }
    });
  }
  function apagadaAqui(id) { try { return !!localStorage.getItem(chave(APAGOU_K, id)); } catch (e) { return false; } }
  function marcarApagada(id) { try { localStorage.setItem(chave(APAGOU_K, id), String(Date.now())); } catch (e) { /* sem espaço */ } }
  function limparApagada(id) { try { if (localStorage.getItem(chave(APAGOU_K, id))) localStorage.removeItem(chave(APAGOU_K, id)); } catch (e) { /* ignora */ } }
