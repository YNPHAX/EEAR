  /* Leitura defensiva das marcas de exclusão antigas. Não existe operação de gravação/exclusão no serviço legado.
     Uma marca em backup/progresso remoto incompatível pausa a união; nunca é substituída automaticamente. */
  function chaveApagado() { return chave('missao-eear-v1-apagado'); }
  function apagadoAqui() { try { return !!localStorage.getItem(chaveApagado()); } catch (e) { return false; } }
  function exclusaoNaNuvem(o) {
    if (o && typeof o === 'object' && o.apagado) return { apagado: String(o.apagado) };
    if (o && apagadoAqui()) return { reapareceu: true };
    return null;
  }
  function pausarPorExclusao(ref, p) {
    nuvem.ref = null; nuvem.on = false;
    nuvem.apagado = p.apagado || ''; nuvem.reapareceu = !!p.reapareceu;
  }
