  /* Checkpoint transacional por identidade. Nunca se coleta uma operação com base no cache localStorage.
     A transação readwrite serializa escritores mesmo sem Web Locks. Só oncomplete confirma durabilidade.
     Operações de reserva são imutáveis e só saem após esse checkpoint confirmado. */
  function abrirDuravel() {
    if (loc.idb) return loc.idb;
    loc.idb = new Promise((resolve, reject) => {
      try {
        if (!window.indexedDB) { reject(new Error('IndexedDB indisponível')); return; }
        const o = window.indexedDB.open('eear-operacoes', 1);
        o.onupgradeneeded = () => { const db = o.result; if (!db.objectStoreNames.contains('contas')) db.createObjectStore('contas'); if (!db.objectStoreNames.contains('quarentena')) db.createObjectStore('quarentena', { autoIncrement: true }); };
        o.onsuccess = () => { const db = o.result; db.onversionchange = () => { db.close(); loc.idb = null; }; resolve(db); };
        o.onerror = () => { loc.idb = null; reject(o.error); };
        o.onblocked = () => { loc.idb = null; reject(new Error('Armazenamento bloqueado por outra versão')); };
      } catch (e) { loc.idb = null; reject(e); }
    });
    return loc.idb;
  }
  async function transacaoConta(id, editar) {
    const db = await abrirDuravel();
    return new Promise((resolve, reject) => {
      let t, resultado;
      try {
        t = db.transaction(['contas', 'quarentena'], 'readwrite', { durability: 'strict' });
        const s = t.objectStore('contas'), q = s.get(id);
        q.onsuccess = () => {
          if (q.result && !opValida(q.result.meta)) {
            const texto = JSON.stringify(q.result); t.objectStore('quarentena').add({ conta: id, origem: 'checkpoint', texto });
            resultado = new Error('O progresso durável está ilegível. Nada foi substituído; exporte a cópia de recuperação.'); resultado.code = 'checkpoint-corrompido';
            if (id === identidade) { recuperar = texto; try { localStorage.setItem(chave(LS_REC), texto); } catch (e) { /* a transação preserva a quarentena */ } } return;
          }
          try { resultado = editar(q.result || null, t); if (resultado !== undefined) { if (resultado.meta) resultado.st = opEstado(resultado.meta); s.put(resultado, id); } }
          catch (e) { resultado = e; t.abort(); }
        };
        t.oncomplete = () => resultado instanceof Error ? reject(resultado) : resolve(resultado);
        t.onabort = t.onerror = () => reject(resultado instanceof Error ? resultado : t.error || new Error('Transação não confirmada'));
      } catch (e) { reject(e); }
    });
  }
  function quarentenar(texto, id, origem) {
    if (typeof texto !== 'string' || !texto) return;
    try { const k = chave(LS_REC, id); if (!localStorage.getItem(k)) localStorage.setItem(k, texto); } catch (e) { /* a cópia IDB é tentada também */ }
    abrirDuravel().then(db => {
      const t = db.transaction('quarentena', 'readwrite', { durability: 'strict' }); t.objectStore('quarentena').add({ conta: id, origem, texto });
      t.onerror = t.onabort = () => { gravouLocal = false; };
    }).catch(() => { gravouLocal = false; });
    if (id === identidade) recuperar = texto;
  }
  function lerDiariosDe(id) {
    const pre = chave(DIARIO_K, id) + '#', out = [];
    try { Object.keys(localStorage).filter(k => k.indexOf(pre) === 0).forEach(k => {
      const txt = localStorage.getItem(k); let d = null; try { d = JSON.parse(txt); } catch (e) { /* preservado abaixo */ }
      if (!d || (!d.delta && (!d.st || d.st.v !== 1))) { quarentenar(txt, id, k); return; }
      out.push({ k, txt, d, tab: k.slice(pre.length) });
    }); } catch (e) { /* sem localStorage: IDB continua */ }
    return out;
  }
  function lerDiarios() { return lerDiariosDe(identidade); }
  async function legadosDuraveis(id) {
    if (!window.indexedDB) return [];
    return new Promise(resolve => {
      const o = window.indexedDB.open('eear-diarios', 1); let novo = false;
      o.onupgradeneeded = () => { novo = true; };
      o.onerror = o.onblocked = () => resolve([]);
      o.onsuccess = () => {
        const db = o.result;
        if (novo || !db.objectStoreNames.contains('d')) { db.close(); resolve([]); return; }
        const t = db.transaction('d', 'readonly'), r = t.objectStore('d').openCursor(), out = [], pre = chave(DIARIO_K, id) + '#';
        r.onsuccess = () => { const c = r.result; if (c) { if (String(c.key).indexOf(pre) === 0) { try { out.push({ k: c.key, txt: c.value, d: JSON.parse(c.value) }); } catch (e) { quarentenar(c.value, id, String(c.key)); } } c.continue(); } };
        t.oncomplete = () => { db.close(); resolve(out); }; t.onerror = () => { db.close(); resolve([]); };
      };
    });
  }
  function metaMigrada(st, diarios) {
    let m = opMeta(st); const vistos = {};
    diarios.forEach(({ k, d }) => { if (!vistos[k] || (d.seq || 0) > (vistos[k].seq || 0)) vistos[k] = d; });
    Object.keys(vistos).forEach(k => {
      const d = vistos[k];
      if (d.delta && opValida(d.delta)) { m = opUnir(m, d.delta); return; }
      if (!d.st || d.st.v !== 1) return;
      const tab = k.slice(k.lastIndexOf('#') + 1), inc = st._abas && st._abas.inc && st._abas.inc[tab];
      if (inc !== undefined && inc >= d.seq) return;
      const base = d.base ? mesclar(d.base) : novoEstado();
      m = opUnir(m, d.base ? opDelta(opMeta(base), base, mesclar(d.st), 'migracao:' + resumoDoc([k, d.seq])) : opMeta(mesclar(d.st)));
    }); return m;
  }
  async function apagarDuravel(id, definitivo) {
    const r = await transacaoConta(id, (ant, t) => {
      if (!definitivo && ant && lerDiariosDe(id).some(x => x.d.delta && (!x.d.gen || x.d.gen === ant.gen) && !mesmoConteudo(opUnir(ant.meta, x.d.delta), ant.meta))) throw new Error('Nada foi apagado: outra aba tem operações pendentes.');
      if (!definitivo && id && ant && !ant.apagado) {
        let base = null; try { base = JSON.parse(localStorage.getItem(chave(BASE_K, id)) || 'null'); } catch (e) { /* sem confirmação */ }
        if (!base || !base.st || !uIgual(opEstado(ant.meta), mesclar(base.st))) throw new Error('Nada foi apagado: há progresso ainda não confirmado na nuvem.');
        if (lerDiariosDe(id).some(x => x.d.delta && !mesmoConteudo(opUnir(ant.meta, x.d.delta), ant.meta))) throw new Error('Nada foi apagado: outra aba tem operações pendentes.');
      }
      const q = t.objectStore('quarentena').openCursor(); q.onsuccess = () => { const c = q.result; if (c) { if (c.value.conta === id) c.delete(); c.continue(); } };
      return { gen: opId(), apagado: true, meta: opSemente(novoEstado()) };
    });
    // Banco legado: só depois da transação nova; nenhum progresso pessoal deve ficar no espelho antigo.
    if (window.indexedDB) await new Promise((resolve, reject) => {
      const o = window.indexedDB.open('eear-diarios', 1); o.onerror = () => reject(o.error); o.onblocked = () => reject(new Error('Espelho antigo bloqueado'));
      o.onsuccess = () => { const db = o.result; if (!db.objectStoreNames.contains('d')) { db.close(); resolve(); return; }
        const t = db.transaction('d', 'readwrite', { durability: 'strict' }), q = t.objectStore('d').openCursor(), pre = chave(DIARIO_K, id) + '#';
        q.onsuccess = () => { const c = q.result; if (c) { if (String(c.key).indexOf(pre) === 0) c.delete(); c.continue(); } };
        t.oncomplete = () => { db.close(); resolve(); }; t.onerror = t.onabort = () => { db.close(); reject(t.error); };
      };
    });
    return r;
  }
