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
    const atual = loc.idb; atual.catch(() => { if (loc.idb === atual) loc.idb = null; });
    return atual;
  }
  async function transacaoConta(id, editar, permitirCorrompido) {
    const db = await abrirDuravel();
    return new Promise((resolve, reject) => {
      let t, resultado;
      try {
        t = db.transaction(['contas', 'quarentena'], 'readwrite', { durability: 'strict' });
        const s = t.objectStore('contas'), q = s.get(id);
        q.onsuccess = () => {
          if (!permitirCorrompido && q.result && !opValida(q.result.meta)) {
            const texto = JSON.stringify(q.result); t.objectStore('quarentena').add({ conta: id, origem: 'checkpoint', texto });
            resultado = new Error('O progresso durável está ilegível. Nada foi substituído; exporte a cópia de recuperação.'); resultado.code = 'checkpoint-corrompido';
            if (id === identidade) { recuperar = texto; try { localStorage.setItem(chave(LS_REC), texto); } catch (e) { /* a transação preserva a quarentena */ } } return;
          }
          if (q.result && opValida(q.result.meta)) q.result.meta = opMigrar(q.result.meta);
          try {
            resultado = editar(q.result || null, t);
            if (resultado !== undefined) { if (resultado.meta) { if (!opValida(resultado.meta)) throw new Error('Operação incompatível; checkpoint anterior preservado.'); resultado.st = opEstado(resultado.meta); } s.put(resultado, id); }
          }
          catch (e) { resultado = e; t.abort(); }
        };
        t.oncomplete = () => resultado instanceof Error ? reject(resultado) : resolve(resultado);
        t.onabort = t.onerror = () => reject(resultado instanceof Error ? resultado : t.error || new Error('Transação não confirmada'));
      } catch (e) { reject(e); }
    });
  }
  function quarentenar(texto, id, origem, progresso) {
    if (typeof texto !== 'string' || !texto) return;
    loc.quarentinas = loc.quarentinas || new Map(); const ref = id + ':' + origem; if (loc.quarentinas.get(ref) === texto) return; loc.quarentinas.set(ref, texto);
    const copia = progresso || texto;
    try { const k = chave(LS_REC, id); if (!localStorage.getItem(k)) localStorage.setItem(k, copia); } catch (e) { /* a cópia IDB é tentada também */ }
    const geracao = id === identidade ? loc.gen : null;
    transacaoConta(id, (r, t) => {
      if (r && (r.encerrado || (geracao && r.gen !== geracao) || (!geracao && r.apagado))) return;
      t.objectStore('quarentena').add({ conta: id, origem, texto });
    }, true).catch(() => { if (id === identidade) { gravouLocal = false; syncInfo(); } });
    if (id === identidade) { recuperar = copia; setTimeout(() => { if (id === identidade) render(); }, 0); }
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
      o.onupgradeneeded = () => { novo = true; if (!o.result.objectStoreNames.contains('d')) o.result.createObjectStore('d'); };
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
      m = opUnir(m, d.base ? opDelta(opMeta(base), base, mesclar(d.st), 'migracao:' + JSON.stringify([k, d.seq])) : opMeta(mesclar(d.st)));
    }); return m;
  }
  async function apagarDuravel(id, definitivo) {
    const r = await transacaoConta(id, (ant, t) => {
      if (!definitivo && id.indexOf('claude:') === 0 && ant && !ant.apagado) throw new Error('Nada foi apagado: a nuvem legada permite sobrescrever confirmações. Exporte e preserve a cópia deste aparelho.');
      if (!definitivo && ant && opValida(ant.meta) && lerDiariosDe(id).some(x => x.d.delta && operacaoPermitida(ant, x.d) && !mesmoConteudo(opUnir(ant.meta, x.d.delta), ant.meta))) throw new Error('Nada foi apagado: outra aba tem operações pendentes.');
      if (!definitivo && id && ant && !ant.apagado) {
        let base = null; try { base = JSON.parse(localStorage.getItem(chave(BASE_K, id)) || 'null'); } catch (e) { /* sem confirmação */ }
        if (!base || !base.st || !uIgual(opEstado(ant.meta), mesclar(base.st))) throw new Error('Nada foi apagado: há progresso ainda não confirmado na nuvem.');
        if (lerDiariosDe(id).some(x => x.d.delta && !mesmoConteudo(opUnir(ant.meta, x.d.delta), ant.meta))) throw new Error('Nada foi apagado: outra aba tem operações pendentes.');
      }
      const q = t.objectStore('quarentena').openCursor(); q.onsuccess = () => { const c = q.result; if (c) { if (c.value.conta === id) c.delete(); c.continue(); } };
      // Nenhum escritor de cache pode atravessar este corte: usa o mesmo object store readwrite.
      const bases = [LS, LS_REC, BASE_K, ABAS_K, QUER_K, VIDA_K, APAGOU_K].map(k => chave(k, id));
      Object.keys(localStorage).filter(k => bases.some(b => k === b || k.indexOf(b + '#') === 0)).forEach(k => localStorage.removeItem(k));
      const ignoradas = Object.assign({}, ant && ant.ignoradas || {}, ant && ant.recibos || {});
      lerDiariosDe(id).forEach(x => { if (x.d.delta && typeof x.d.id === 'string' && !['__proto__', 'constructor', 'prototype'].includes(x.d.id)) ignoradas[x.d.id] = true; });
      return { gen: opId(), apagado: true, encerrado: !!definitivo || !!(ant && ant.encerrado), ignoradas, meta: opSemente(novoEstado()) };
    }, true);
    // Banco legado: só depois da transação nova; nenhum progresso pessoal deve ficar no espelho antigo.
    if (window.indexedDB) await new Promise((resolve, reject) => {
      const o = window.indexedDB.open('eear-diarios', 1); o.onupgradeneeded = () => { if (!o.result.objectStoreNames.contains('d')) o.result.createObjectStore('d'); }; o.onerror = () => reject(o.error); o.onblocked = () => reject(new Error('Espelho antigo bloqueado'));
      o.onsuccess = () => { const db = o.result; if (!db.objectStoreNames.contains('d')) { db.close(); resolve(); return; }
        const t = db.transaction('d', 'readwrite', { durability: 'strict' }), q = t.objectStore('d').openCursor(), pre = chave(DIARIO_K, id) + '#';
        q.onsuccess = () => { const c = q.result; if (c) { if (String(c.key).indexOf(pre) === 0) c.delete(); c.continue(); } };
        t.oncomplete = () => { db.close(); resolve(); }; t.onerror = t.onabort = () => { db.close(); reject(t.error); };
      };
    });
    return r;
  }
  async function copiasQuarentena(id, apagar) {
    const db = await abrirDuravel();
    return new Promise((resolve, reject) => {
      const t = db.transaction('quarentena', apagar ? 'readwrite' : 'readonly', { durability: 'strict' }), q = t.objectStore('quarentena').openCursor(), out = [];
      q.onsuccess = () => { const c = q.result; if (c) { if (c.value.conta === id) { out.push(c.value); if (apagar) c.delete(); } c.continue(); } };
      t.oncomplete = () => resolve(out); t.onabort = t.onerror = () => reject(t.error);
    });
  }
  async function descartarRecuperacao() {
    const id = identidade;
    try { await copiasQuarentena(id, true); } catch (e) { if (window.indexedDB) { msgDados = 'Não foi possível confirmar a exclusão da cópia. Tente novamente.'; render(); return; } }
    try { localStorage.removeItem(chave(LS_REC, id)); } catch (e) { return; }
    if (id === identidade) { recuperar = null; msgRec = ''; pedindo = null; render(); }
  }
