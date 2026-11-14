  /* Progresso que este app não consegue ler (corrompido, ou gravado por uma versão futura com outro formato): antes que o
     primeiro salvar() grave por cima, uma cópia fica em LS_REC, e a tela Hoje oferece copiá-la. */
  const LS_REC = 'missao-eear-v1-recuperar';
  /* Contas (veja "contas neste aparelho"): cada identidade tem as próprias chaves (chave@identidade). Sem conta, valem as
     chaves de sempre, onde já está o progresso de quem nunca entrou numa conta. LS_CONTA lembra a conta em uso. */
  const LS_CONTA = 'missao-eear-conta', BASE_K = 'missao-eear-v1-base';
  /* Operações e checkpoint (14–16): reserva imutável por operação; IDB confirma por oncomplete.
     Chaves legadas continuam reconhecidas na migração e na exclusão. */
  const DIARIO_K = 'missao-eear-v1-diario', ABAS_K = 'missao-eear-v1-abas', QUER_K = 'missao-eear-v1-quer', VIDA_K = 'missao-eear-v1-vida', APAGOU_K = 'missao-eear-v1-local-apagado';
  const loc = { meta: null, vista: null, gen: null, ops: [], pendente: 0, carregado: false, confirmando: false }, lider = { ativa: false, soltar: null, conta: null, espera: null };
  const contaUI = { msg: '', adiado: false, ocupado: false }; // estado da tela da conta (veja "contas neste aparelho")
  let identidade = '', recuperar = null, gravouLocal = true;
  const chave = (k, id) => { const i = id === undefined ? identidade : id; return i ? k + '@' + i : k; };
  /* Lê o progresso da identidade em uso; se for ilegível, guarda uma cópia antes que alguma gravação o cubra. */
  function carregar() {
    let st = novoEstado(), t = null;
    try {
      t = localStorage.getItem(chave(LS));
      if (t) {
        let lido = false;
        try { const o = JSON.parse(t); if (o && o.v === 1) { st = mesclar(o); lido = true; } } catch (e) { /* ilegível */ }
        if (!lido) { try { localStorage.setItem(chave(LS_REC), t); } catch (e) { /* sem espaço para a cópia */ } t = null; }
      }
      recuperar = localStorage.getItem(chave(LS_REC));
      localStorage.removeItem(chave(ABAS_K));
    } catch (e) { /* sem armazenamento local */ }
    loc.origem = { texto: t, st: opCopiar(st) }; // projeção normalizada ANTES de incorporar _ops/diários
    try { st = opEstado(metaMigrada(st, lerDiariosDe(identidade))); } catch (e) { /* cópia original permanece exportável */ }
    loc.carregado = false; loc.semIDB = false; loc.pendente = 0; partirDe(t, st); abrirAbas(); // 14-abas.js: diários de abas que fecharam são absorvidos logo depois
    return st;
  }
  try {
    /* Com Firebase configurado, só sua sessão pode selecionar a identidade; dados legados continuam preservados. */
    const c = localStorage.getItem(LS_CONTA) || '';
    if ((c.indexOf('firebase:') === 0 && FB) || (c.indexOf('claude:') === 0 && !FB && window.claude)) identidade = c;
  } catch (e) { /* sem armazenamento local */ }
  S = carregar();
