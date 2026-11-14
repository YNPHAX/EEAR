  /* pendente não é confirmação remota. O transporte legado não tem rejeição de escritores antigos no servidor:
     suas confirmações anteriores não autorizam descartar a cópia local (10-nuvem-claude.js). */
  const nuvem = { ref: null, on: false, busy: false, again: false, fb: false, futura: false, conta: null, pendente: false, semRede: false, apagado: '', reapareceu: false, refPausada: null, reenviar: false, lida: false, erro: '', falhas: 0, tRetry: null, legado: identidade.indexOf('claude:') === 0 }; // lida: a nuvem desta conta já foi lida nesta abertura; erro, falhas, tRetry: veja 13-falhas-nuvem.js
  let tSave = null;
  function salvar(importado) {
    S.t = Date.now();
    fixarAncoras();
    try { persistir(importado); } catch (e) { gravouLocal = false; } // operação reservada; a confirmação durável é assíncrona e aparece no aviso
    consolidar(); // checkpoint transacional, independente de Web Locks
    clearTimeout(tSave);
    tSave = setTimeout(gravar, 1500);
    if (nuvem.ref) { nuvem.pendente = true; syncInfo(); }
  }
  async function gravar(aoFundo) {
    if (nuvem.legado || loc.incompativel || saindo || !nuvem.ref || (!lider.ativa && !(aoFundo && document.visibilityState === 'hidden'))) return;
    if (nuvem.busy) { nuvem.again = true; return; }
    const ref = nuvem.ref, conta0 = nuvem.conta;
    const atual = () => !saindo && nuvem.ref === ref && nuvem.conta === conta0;
    nuvem.busy = true; clearTimeout(nuvem.tRetry);
    try { await (loc.carga || Promise.resolve()); await (loc.fila || Promise.resolve()); if (!atual()) { nuvem.busy = false; return; } await conciliar(ref); if (atual()) { nuvem.falhas = 0; nuvem.erro = ''; } }
    catch (e) { // veja 13-falhas-nuvem.js
      if (!atual()) { /* resposta de uma sessão anterior: não altera a nova */ }
      else if (e && e.code === 'unavailable' && e.espera !== undefined) nuvem.tRetry = setTimeout(gravar, Math.max(0, e.espera) + 200 + Math.random() * 1000); // nuvem travada por outro aparelho
      else if (erroPassageiro(e)) { nuvem.semRede = true; nuvem.tRetry = setTimeout(gravar, esperaNuvem()); } // sem rede, servidor ocupado ou cota: tenta de novo
      else { nuvem.ref = null; nuvem.on = false; nuvem.erro = String((e && e.code) || 'desconhecido'); } // recusada: para, e o aviso diz; o estudo fica aqui
    }
    nuvem.busy = false;
    syncInfo();
    if (nuvem.again) { nuvem.again = false; return gravar(document.visibilityState === 'hidden'); }
  }
  /* Aparelho sem estudo nenhum ainda (só a configuração): o progresso da nuvem tem preferência. Tarefas marcadas, caderno
     de erros e atividade também contam como estudo (antes não contavam, e um aparelho que só tinha marcado tarefas perdia as marcações). */
  const semEstudo = o => !Object.keys(o.mod).length && !o.sims.length && !Object.keys(o.fc).length && !Object.keys(o.ap).length && !o.diag && !Object.keys(o.aula || {}).length && !Object.keys(o.feito || {}).length && !Object.keys(o.erros || {}).length && !Object.keys(o.act || {}).length;
  /* Calcula a união deste aparelho com o progresso da nuvem (o), sem efeito nenhum: dentro de uma transação, pode rodar
     de novo com uma leitura mais nova. Devolve o que gravar na nuvem (ou null) e o que aplicar aqui depois. */
  function planejarUniao(o) {
    const ex = exclusaoNaNuvem(o); // formatos antigos de exclusão (11-formatos-legados.js): nada é unido nem gravado
    if (ex) return ex;
    if (o && (typeof o !== 'object' || o.v !== 1)) return { futura: true };
    const local = mesclar(JSON.parse(JSON.stringify(S)));
    let u = local, perdido = null, c = null, operacional = false, assinado = true, ep = '', lin = [];
    if (o) {
      assinado = assinaturaOk(o); // sem assinatura válida: gravado (ou alterado) por uma versão antiga do app
      ep = assinado && typeof o.ep === 'string' ? o.ep : ''; // época da nuvem (08-uniao-nuvem.js)
      lin = assinado ? linhagem(o) : []; // gravações de que a nuvem descende (08-uniao-nuvem.js)
      c = mesclar(semAssinatura(JSON.parse(JSON.stringify(o))));
      operacional = opValida(c.cfg._ops) && mesmoConteudo(opPlano(c), opPlano(opEstado(c.cfg._ops)));
      /* A base só vale se for anterior aos dois lados (um progresso colado ou restaurado mais antigo que ela não descende
         dela), se a nuvem foi gravada por esta versão (uma versão antiga grava o progresso inteiro dela por cima, sem
         trava, e o que ela não tinha pareceria apagado do outro lado) e se é da mesma época da nuvem (um aparelho novo
         pode ter unido e assinado por cima de uma gravação antiga, e o documento não descende mais desta base) e se a
         gravação que a base representa está na linhagem da nuvem (uma gravação atrasada de outro aparelho pode ter coberto
         a que esta base confirmou). */
      const b = lerBase(), base = assinado && ep && epocaBase() === ep && lin.includes(idBase()) && b && (b.t || 0) <= (local.t || 0) && (b.t || 0) <= (c.t || 0) ? b : null;
      /* Aparelho que nunca sincronizou e não tem estudo: fica com a nuvem. Um aparelho zerado depois dela passa pela união. */
      if (operacional) u = opCombinarEstados(local, c);
      else if (!b && semEstudo(S) && !((Number(S.cfg.certsZ) || 0) > (Number(c.cfg.certsZ) || 0))) { u = c; juntarCerts(u.cfg, S.cfg, u); registrarCerts(u); } else ({ st: u, perdido } = unirProgresso(base, local, c));
      if (!u.cfg.nome && S.cfg.nome) u.cfg.nome = S.cfg.nome;
    } else if (!S.t) return { nada: true }; // aparelho e nuvem sem progresso: nada a gravar
    // Estados desta arquitetura unem contribuições identificadas, não diferenças de contadores agregados.
    if (c && operacional) u = opCombinarEstados(local, c);
    else if (c && !lerBase() && semEstudo(local)) u = opEstado(opUnir(opMeta(local), opMeta(c)));
    else if (c) {
      const m = opMeta(local), delta = opDelta(m, local, u, 'legado-nuvem:' + resumoDoc(opSemMeta(c)));
      u = opEstado(opUnir(m, delta));
    } else u = opEstado(opMeta(local));
    /* Documento sem assinatura ou sem época (ou nuvem vazia): a união começa uma época nova e é gravada assinada. */
    return { local, u, perdido, ep: ep || novaEpoca(), lin, id: lin[lin.length - 1] || '', gravar: !c || !ep || !lin.length || !uIgual(u, c) };
  }
  /* Lê a nuvem, une e grava. Com transação (Firebase), a leitura e a gravação são atômicas: se outro aparelho gravar no
     meio, a união é refeita sobre o que ele gravou. Sem transação, o transporte é bloqueado (10-nuvem-claude.js).
     O resultado só é aplicado aqui depois que a nuvem confirmou, e só se a conta continuar a mesma. */
  async function conciliar(ref) {
    const conta0 = nuvem.conta;
    const atual = () => !saindo && nuvem.ref === ref && nuvem.conta === conta0;
    let p = null;
    const planejar = o => {
      if (!atual()) return null; // inclusive callbacks repetidos pelo Firestore após troca de conta
      p = planejarUniao(o);
      if (!p.gravar) return null;
      p.id = novoIdGravacao(); // esta gravação entra na linhagem; a base, se confirmada, a representa
      return assinar(Object.assign(JSON.parse(JSON.stringify(p.u)), { ep: p.ep, lin: p.lin.concat(p.id).slice(-LIN_MAX) }));
    };
    if (typeof ref.transacao !== 'function') throw new Error('Sincronização Firebase exige transação.');
    await ref.transacao(planejar);
    if (!atual()) return; // não sobrescreve o cache de outra sessão/abertura nem confirma a leitura dela
    nuvem.lida = true; // mesmo sem nada a gravar (nuvem e aparelho vazios): a migração do caminho antigo pode seguir
    if (nuvem.conta !== conta0 || !p || p.nada) return;
    if (p.apagado || p.reapareceu) { pausarPorExclusao(ref, p); render(); return; }
    if (p.futura) { nuvem.ref = null; nuvem.on = false; nuvem.futura = true; return; }
    if (p.perdido) { recuperar = JSON.stringify(p.perdido); try { localStorage.setItem(chave(LS_REC), recuperar); } catch (e) { /* sem espaço */ } }
    /* O que o aluno fez enquanto a gravação viajava também fica: união da cópia usada no cálculo com o estado atual. */
    const u = uIgual(S, p.local) ? p.u : opValida(p.u.cfg._ops) ? opCombinarEstados(S, p.u) : unirProgresso(p.local, mesclar(JSON.parse(JSON.stringify(S))), p.u).st;
    if (!uIgual(u, S)) {
      S = u;
      try { persistir(true); } catch (e) { gravouLocal = false; }
      consolidar();
      if (V.v === 'inicio') V = { v: 'hoje' };
      render();
    }
    nuvem.on = true; nuvem.semRede = false; nuvem.pendente = !uIgual(S, p.u);
    gravarBase(p.u, p.ep, p.id);
    if (!uIgual(u, p.u)) gravar(); // a união com o que veio depois ainda não está na nuvem
  }
  async function sincronizar(ref, conta) {
    nuvem.conta = String(conta || '');
    if (nuvem.conta.indexOf('firebase:') !== 0 || !ref || typeof ref.transacao !== 'function') { bloquearNuvemLegada(); return; }
    nuvem.legado = false;
    nuvem.ref = ref; nuvem.futura = false; nuvem.semTrava = false; nuvem.semRede = false; nuvem.apagado = ''; nuvem.reapareceu = false; nuvem.lida = false; nuvem.erro = ''; nuvem.falhas = 0; nuvem.conta = String(conta || '');
    await liderar(); // trava de líder (14-abas.js): livre, esta aba sincroniza já; senão, quando a líder fechar
    if (lider.ativa) await gravar();
  }
