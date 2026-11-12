  /* Fila da aba; checkpoint IDB serializa todas as abas. Cache e notificações não são confirmação durável. */
  function depoisDeMudarS() {
    if (V.v === 'inicio' && !semEstudo(S)) V = { v: 'hoje' };
    render();
    if (nuvem.ref && !saindo) { nuvem.pendente = true; clearTimeout(tSave); tSave = setTimeout(gravar, 1500); syncInfo(); }
  }
  function receberDuravel(r, id) {
    if (id !== identidade || !r || !opValida(r.meta)) return;
    if (r.apagado && loc.gen && loc.gen !== r.gen) { nuvem.ref = null; nuvem.on = false; }
    let m = r.meta;
    const ops = (loc.ops || []).filter(o => o.conta === id && (!o.gen || o.gen === r.gen));
    ops.forEach(o => { m = opUnir(m, o.delta); });
    const antes = JSON.stringify(opSemMeta(S)); loc.gen = r.gen; loc.meta = m;
    S = opEstado(m); loc.vista = opCopiar(S);
    if (JSON.stringify(opSemMeta(S)) !== antes) depoisDeMudarS(); else syncInfo();
  }
  function cachear(r, id) {
    if (r.apagado) return;
    try {
      const texto = localStorage.getItem(chave(LS, id)), hash = resumoDoc(r.meta);
      if (loc.cacheId === id && loc.cacheHash === hash && loc.cacheTexto === texto) return;
      const atual = estadoDe(texto), novo = opEstado(r.meta);
      if (atual && mesmoConteudo(opPlano(atual), opPlano(novo))) { loc.cacheId = id; loc.cacheHash = hash; loc.cacheTexto = texto; return; }
      const bruto = JSON.stringify(novo); localStorage.setItem(chave(LS, id), bruto); loc.cacheId = id; loc.cacheHash = hash; loc.cacheTexto = bruto;
    } catch (e) { /* IDB já confirmou; o cache é opcional */ }
  }
  function abrirAbas() {
    document.documentElement.dataset.armazenamento = 'carregando'; loc.incompativel = false;
    loc.quarentinas = new Map();
    clearInterval(loc.timer); loc.ops = []; loc.gen = null; loc.fila = Promise.resolve(); loc.pendente = 0;
    const id = identidade, st = opCopiar(loc.vista || novoEstado()), diarios = lerDiariosDe(id);
    try { const raw = JSON.parse(localStorage.getItem(chave(LS)) || 'null'); if (raw && raw._abas) st._abas = raw._abas; } catch (e) { /* cache ilegível preservado por carregar */ }
    loc.carga = legadosDuraveis(id).then(antigos => transacaoConta(id, r => {
      if (!r) return { gen: opId(), meta: metaMigrada(st, diarios.concat(antigos)), legados: Object.fromEntries(diarios.concat(antigos).filter(x => !x.d.delta).map(x => [x.k, x.d.seq])) };
      let m = r.meta; diarios.forEach(({ d }) => { if (d.delta && opValida(d.delta) && (d.gen === r.gen || (!d.gen && !r.apagado))) m = opUnir(m, d.delta); });
      return Object.assign({}, r, { meta: m });
    })).then(r => {
      if (id !== identidade) return;
      if (mesmoConteudo(opPlano(st), opPlano(r.st))) { loc.cacheId = id; loc.cacheHash = resumoDoc(r.meta); try { loc.cacheTexto = localStorage.getItem(chave(LS, id)); } catch (e) { /* cache opcional */ } }
      receberDuravel(r, id); cachear(r, id); gravouLocal = true; loc.carregado = true; document.documentElement.dataset.armazenamento = 'pronto'; render(); consolidar();
    }).catch(e => { if (id !== identidade) return; loc.carregado = true; document.documentElement.dataset.armazenamento = 'reserva'; loc.incompativel = e.code === 'checkpoint-corrompido'; loc.semIDB = e.code !== 'checkpoint-corrompido'; gravouLocal = false; loc.erro = e.message; consolidar(); render(); syncInfo(); });
    loc.timer = setInterval(() => consolidar(), 1500);
  }
  function persistir(remoto) {
    const id = identidade, antes = loc.vista || novoEstado(), meta = loc.meta || opMeta(antes), oid = opId();
    let delta = remoto === true && S.cfg && opValida(S.cfg._ops) ? opMeta(S) : opDelta(meta, antes, S, oid);
    if (remoto && typeof remoto === 'object' && opValida(remoto.importado)) delta = opUnir(delta, remoto.importado);
    loc.meta = opUnir(meta, delta); S.cfg._ops = loc.meta; loc.vista = opCopiar(S);
    const o = { v: 2, id: oid, conta: id, gen: loc.gen, delta, st: opCopiar(S) };
    loc.ops = (loc.ops || []).concat([o]); loc.pendente = loc.ops.length; loc.confirmando = true;
    // Reserva imutável. Falhar aqui não impede a transação IDB; nenhuma mensagem de confirmação antecipada.
    try { localStorage.setItem(chaveDiario(oid), JSON.stringify(o)); } catch (e) { loc.reservaFalhou = true; }
    enfileirar(o); return true;
  }
  function enfileirar(o) {
    const carga = loc.carga || Promise.resolve();
    loc.fila = (loc.fila || Promise.resolve()).catch(() => null).then(() => carga).then(async () => {
      const r = await transacaoConta(o.conta, ant => {
        if (ant && ((o.gen && o.gen !== ant.gen) || (ant.apagado && o.gen !== ant.gen))) throw new Error('A cópia desta conta foi apagada em outra aba; operação antiga preservada para exportação.');
        const m = ant ? ant.meta : opSemente(novoEstado());
        return Object.assign({}, ant || {}, { gen: ant ? ant.gen : o.gen || opId(), apagado: false, meta: opUnir(m, o.delta) });
      });
      // A transação já terminou. Só agora se pode remover esta operação da reserva.
      try { localStorage.removeItem(chave(DIARIO_K, o.conta) + '#' + o.id); } catch (e) { /* reaplicação é idempotente */ }
      if (o.conta !== identidade) return;
      loc.ops = (loc.ops || []).filter(x => x.id !== o.id); loc.pendente = loc.ops.length; loc.confirmando = !!loc.pendente;
      loc.erro = ''; gravouLocal = true; cachear(r, o.conta); receberDuravel(r, o.conta);
    }).catch(e => {
      if (o.conta !== identidade) return;
      loc.erro = e.message; gravouLocal = false; loc.confirmando = false;
      if (loc.semIDB) consolidarReserva();
      render(); syncInfo();
    });
  }
  function consolidarReserva() {
    let m = loc.meta || opMeta(S);
    const bruto = (() => { try { return localStorage.getItem(chave(LS)); } catch (e) { return null; } })();
    if (bruto) { const st = estadoDe(bruto); if (st) m = opUnir(m, opMeta(st)); }
    lerDiarios().forEach(({ d }) => { if (d.delta && opValida(d.delta)) m = opUnir(m, d.delta); });
    try { localStorage.setItem(chave(LS), JSON.stringify(opEstado(m))); S = opEstado(m); loc.meta = m; loc.vista = opCopiar(S); loc.pendente = 0; gravouLocal = true; } catch (e) { gravouLocal = false; }
  }
  function consolidar() {
    if (!loc.carregado || loc.lendo) return;
    if (loc.semIDB) {
      consolidarReserva();
      if (!loc.tentando) {
        loc.tentando = true; const id = identidade, atual = opCopiar(S);
        transacaoConta(id, r => {
          if (r && r.apagado && loc.gen !== r.gen) throw new Error('Cópia apagada em outra aba; exporte o estudo antes de continuar.');
          return Object.assign({}, r || {}, { gen: r ? r.gen : opId(), meta: opUnir(r ? r.meta : opVazio(), opMeta(atual)) });
        }).then(r => { if (id !== identidade) return; loc.semIDB = false; loc.incompativel = false; loc.ops = []; loc.pendente = 0; loc.confirmando = false; gravouLocal = true; receberDuravel(r, id); cachear(r, id); render(); }).catch(() => null).finally(() => { loc.tentando = false; });
      }
      return;
    }
    const id = identidade; loc.lendo = true;
    const todos = lerDiariosDe(id), ds = todos.filter(x => x.d.v === 2 && opValida(x.d.delta));
    transacaoConta(id, r => {
      if (!r) return { gen: opId(), meta: opMeta(S) };
      todos.filter(x => !x.d.delta && !((r.legados || {})[x.k] >= x.d.seq)).forEach(x => quarentenar(x.txt, id, x.k, JSON.stringify(x.d.st)));
      let m = r.meta;
      ds.forEach(({ d }) => { if (!d.gen || d.gen === r.gen) m = opUnir(m, d.delta); });
      return Object.assign({}, r, { meta: m });
    }).then(r => {
      if (id !== identidade) return;
      const confirmadas = ds.filter(x => (!x.d.gen || x.d.gen === r.gen) && mesmoConteudo(opUnir(r.meta, x.d.delta), r.meta));
      confirmadas.forEach(x => { try { if (localStorage.getItem(x.k) === x.txt) localStorage.removeItem(x.k); } catch (e) { /* idempotente */ } });
      loc.ops = (loc.ops || []).filter(o => !confirmadas.some(x => x.d.id === o.id)); loc.pendente = loc.ops.length; loc.confirmando = !!loc.pendente;
      gravouLocal = true; receberDuravel(r, id); cachear(r, id);
    }).catch(e => { if (id === identidade) { gravouLocal = false; loc.erro = e.message; syncInfo(); } }).finally(() => { loc.lendo = false; });
  }
  function temPendentes(id) {
    if (id === identidade && loc.pendente) return true;
    let m = id === identidade ? loc.meta : null;
    if (!m) { try { const st = estadoDe(localStorage.getItem(chave(LS, id))); if (st) m = opMeta(st); } catch (e) { return true; } }
    return lerDiariosDe(id).some(x => x.d.delta && opValida(x.d.delta) && (!m || !mesmoConteudo(opUnir(m, x.d.delta), m)));
  }
  function comTravaLocal(fn) { (loc.fila || Promise.resolve()).then(fn).catch(e => { contaUI.msg = e.message; msgDados = e.message; pedindo = null; render(); }); }
  function soltarLocal() { if (lider.soltar && (saindo || document.visibilityState === 'hidden')) { lider.soltar(); lider.soltar = null; lider.ativa = false; lider.conta = null; lider.espera = null; } }
  async function liderar() {
    if (lider.ativa && lider.soltar && lider.conta === identidade) return; // já é a líder desta conta: continua (soltar e pedir de novo perderia a vez)
    if (lider.espera === identidade) return; // já está na fila desta conta
    if (lider.soltar) lider.soltar();
    lider.soltar = null; lider.ativa = !temTravas();
    if (lider.ativa) return;
    const conta = identidade, nome = 'eear-nuvem@' + nomeConta();
    const segurar = () => new Promise(r => { lider.soltar = r; lider.ativa = true; lider.conta = conta; lider.espera = null; });
    let agora = false;
    try {
      await new Promise((pronto, falha) => {
        navigator.locks.request(nome, { ifAvailable: true }, trava => {
          if (!trava || identidade !== conta) { pronto(); return undefined; }
          agora = true; const p = segurar(); pronto(); return p;
        }).catch(falha);
      });
    } catch (e) { lider.ativa = true; return; } // sem a trava (erro do navegador): sincroniza como antes
    if (agora) return;
    lider.espera = conta;
    navigator.locks.request(nome, () => { if (lider.espera === conta) lider.espera = null; if (identidade !== conta) return undefined; const p = segurar(); gravar(); return p; }).catch(() => { if (lider.espera === conta) lider.espera = null; });
  }
  window.addEventListener('storage', ev => {
    if (ev.storageArea !== localStorage || !ev.key) return;
    if (ev.key === chave(BASE_K)) syncInfo();
    if (ev.key === chave(LS) || ev.key.indexOf(chave(DIARIO_K) + '#') === 0) consolidar();
  });
  // Não aceitar mutações sobre uma cópia inicial ainda não reconciliada com o checkpoint desta identidade.
  function aguardandoDados(ev) {
    if (loc.carregado && !loc.incompativel) return;
    const el = ev.target.closest('[data-a]');
    if (ev.type === 'click' && (!el || ['tab', 'go', 'expcopiar', 'dadosver', 'dadosbaixar', 'cancelar'].includes(el.dataset.a))) return;
    if (loc.incompativel && ev.type === 'click' && el && ['dadosapagar', 'dadosapagarok', 'reccopiar', 'recdescartar'].includes(el.dataset.a)) return;
    ev.preventDefault(); ev.stopImmediatePropagation(); contaUI.msg = loc.incompativel ? 'O armazenamento está ilegível. Exporte seus dados antes de apagar a cópia para recomeçar.' : 'Preparando seus dados. Aguarde para estudar.'; render();
  }
  document.addEventListener('click', aguardandoDados, true);
  document.addEventListener('change', aguardandoDados, true);
