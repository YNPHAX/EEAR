  /* Transporte legado permanentemente desativado nesta arquitetura: não solicita db, doc, get, set ou acquire.
     Somente a identidade fornecida pelo host pode abrir sua cópia LOCAL quando Firebase não está configurado.
     Firebase tem precedência: nem hot.ready nem resposta antiga do host podem trocar sua sessão. */
  function bloquearNuvemLegada() {
    clearTimeout(nuvem.tRetry); clearTimeout(tSave);
    nuvem.legado = true; nuvem.ref = null; nuvem.refPausada = null; nuvem.on = false;
    nuvem.pendente = false; nuvem.semRede = false; nuvem.lida = false;
    syncInfo();
  }
  async function conectarLegadoLocal() {
    if (FB) return;
    const cl = window.claude;
    if (!cl || typeof cl.use !== 'function') return;
    try {
      const user = await cl.use('user'), id = user && await user.id();
      if (!id || FB || conta.user) return;
      usarIdentidade('claude:' + id);
      bloquearNuvemLegada();
    } catch (e) { syncInfo(); } // falhar no host nunca confirma nem modifica a sincronização oficial
  }
