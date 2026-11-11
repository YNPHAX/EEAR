  /* ---------- falhas da nuvem: tentar de novo sem perder nada, e dizer ao aluno quando a sincronização parou ----------
     O estudo é sempre gravado primeiro neste aparelho (salvar); a nuvem é uma cópia conciliada depois. Quando a nuvem
     falha:
     - erro passageiro (sem rede, servidor ocupado, cota estourada, transação disputada): tenta de novo sozinho, com
       espera crescente (2,5 a 5 s, depois 5 a 10 s, 10 a 20 s… até 60 s); a conexão voltando ou o app voltando para a tela tentam
       na hora, e o app indo para o fundo (trocar de app no celular) envia o que estava esperando;
     - erro que não passa sozinho (gravação recusada pelas regras, sessão inválida, documento grande demais): a
       sincronização para até o app abrir de novo, e o aviso diz isso, com o motivo. Nada é apagado: o estudo continua
       neste aparelho e vai para a conta quando a sincronização voltar a funcionar.
     O login do Firebase que não carregou (app aberto sem internet) também é tentado de novo quando a conexão volta.
     Funções declaradas: gravar() e syncInfo() (02-progresso-nuvem.js) as usam depois que o arquivo inteiro carregou. */
  function erroPassageiro(e) {
    const c = String((e && e.code) || '').replace(/^firestore\//, '');
    // Firestore usa hífen (resource-exhausted); a nuvem do Claude, sublinhado (resource_exhausted)
    return ['unavailable', 'deadline-exceeded', 'aborted', 'resource-exhausted', 'resource_exhausted', 'internal', 'cancelled'].indexOf(c) >= 0;
  }
  /* A primeira espera é a de antes desta mudança (2,5 a 5 s); depois dobra (5 a 10 s, 10 a 20 s…), até 60 s. */
  function esperaNuvem() {
    nuvem.falhas = (nuvem.falhas || 0) + 1;
    return Math.min(60000, 2500 * Math.pow(2, nuvem.falhas - 1) * (1 + Math.random()));
  }
  function motivoErroNuvem(c) {
    return ({
      'permission-denied': 'a nuvem recusou a gravação',
      invalid_argument: 'a nuvem do curso não permite gravar com o seu acesso',
      unauthenticated: 'a sessão expirou; saia e entre de novo na conta',
      'invalid-argument': 'a nuvem recusou o formato do progresso'
    })[c] || 'erro ' + c;
  }
  function avisoErroNuvem() {
    return 'A sincronização com a nuvem parou (' + motivoErroNuvem(nuvem.erro) + '). O seu progresso continua salvo neste aparelho e nada foi apagado; ele vai para a conta quando a sincronização voltar a funcionar (abra o app de novo para tentar).';
  }
  function retomarNuvem() {
    consolidar(); // diários de abas que fecharam enquanto esta estava no fundo (14-abas.js)
    if (FB && !conta.api && conta.pronto && !conta.iniciando) contaIniciar(); // o login não carregou (sem internet ao abrir)
    if (nuvem.ref && !nuvem.busy && (nuvem.semRede || nuvem.pendente)) { clearTimeout(nuvem.tRetry); nuvem.falhas = 0; gravar(); }
  }
  window.addEventListener('online', retomarNuvem);
  /* Só envia antes do intervalo quando a página vai para o fundo e continua viva (trocar de app no celular). Fechando ou
     trocando de página, o navegador dispara pagehide antes; aí nada começa: uma união terminada depois gravaria a cópia
     desta página por cima do que outra aba ou outra abertura já guardou neste aparelho. */
  let saindo = false;
  window.addEventListener('pagehide', () => { saindo = true; clearTimeout(tSave); clearTimeout(nuvem.tRetry); soltarLocal(false); }); // a cópia principal já foi gravada (14-abas.js)
  window.addEventListener('pageshow', ev => {
    saindo = false;
    if (ev.persisted) { S = carregar(); render(); } // outra abertura pode ter atualizado o cache enquanto esta ficou suspensa
    retomarNuvem();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { retomarNuvem(); return; }
    soltarLocal(false); // no fundo, a aba pode ser suspensa: não fica com a trava local (14-abas.js)
    if (!saindo && nuvem.ref && nuvem.pendente && !nuvem.busy) { clearTimeout(tSave); gravar(); } // indo para o fundo: envia já
  });
