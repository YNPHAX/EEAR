  /* ---------- diários pendentes: exclusão local segura (F10) e navegador sem Web Locks (F11, F12) ----------
     1. Pendente é o diário de uma aba (de qualquer aba desta conta, viva ou não) que ainda acrescentaria algo à cópia
        principal: a marca inc não o cobre e aplicá-lo mudaria a cópia. Com um diário pendente, o progresso não está todo
        na nuvem: "Apagar deste aparelho" fica bloqueado (sincronizado() e sincronizadoDe() consultam temPendentes), e
        apagarLocal() nunca apaga um diário pendente (ele é a única cópia daquele estudo). A exclusão pedida na tela roda
        com a trava local, depois de qualquer consolidação em andamento, e confere tudo de novo antes de apagar.
     2. Sem Web Locks: cada aba registra que está viva (VIDA_K, a cada 2 s; ao fechar, apaga o registro). Diário de uma aba
        sem registro recente (8 s; 30 min se ela está em segundo plano, onde o navegador espaça os temporizadores) é órfão e
        entra na consolidação de qualquer aba, uma vez só (inc). Se a aba "órfã" estava viva (suspensa), ela reconhece que
        o próprio diário entrou e não conta duas vezes (receberPrincipal, com o histórico do diário em loc.jhist).
     3. A cada 3 s (com ou sem Web Locks) a aba procura diários de abas que ela não vigia ainda: um aviso storage perdido
        não deixa um órfão esperando a próxima abertura do app.
     Funções declaradas: 09-contas.js, 13-falhas-nuvem.js e 14-abas.js as usam depois que o arquivo inteiro carregou. */
  function chaveVida(tab, id) { return chave(VIDA_K, id) + '#' + tab; }
  function lerDiariosDe(id) {
    const pre = chave(DIARIO_K, id) + '#', out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.indexOf(pre) !== 0) continue;
        let d = null; try { d = JSON.parse(localStorage.getItem(k)); } catch (e) { /* ilegível */ }
        out.push({ tab: k.slice(pre.length), k, txt: localStorage.getItem(k), d: d && d.st && typeof d.seq === 'number' ? d : null });
      }
    } catch (e) { /* sem armazenamento */ }
    return out;
  }
  /* O diário d ainda acrescentaria algo à cópia principal txt (de meta m e estado st0)? Ilegível conta como pendente. */
  function diarioPendente(d, txt, m, st0, tab, id) {
    if (!d) return true;
    if (m && m.inc[tab] !== undefined && m.inc[tab] >= d.seq) return false;
    loc.semEfeito = true; // a conferência não grava cópia de recuperação
    try {
      if (txt == null || !st0) { const base = d.base ? mesclar(d.base) : null, meu = base && apagadaAqui(id) ? soDepois(base, mesclar(d.st)) : mesclar(d.st); return !semEstudo(meu); }
      return !mesmoConteudo(aplicarDiario(d, txt, m, st0, tab), st0);
    } catch (e) { return true; } finally { loc.semEfeito = false; }
  }
  function pendentesDe(id) {
    let txt = null; try { txt = localStorage.getItem(chave(LS, id)); } catch (e) { return [{ k: '', txt: null }]; }
    const m = txt != null ? metaDe(txt) : null, st0 = txt != null ? estadoDe(txt) : null;
    return lerDiariosDe(id).filter(x => diarioPendente(x.d, txt, m, st0, x.tab, id));
  }
  function temPendentes(id) { return pendentesDe(id).length > 0; }
  /* Apaga os diários da conta que não estão pendentes; o pendente fica (e entra na cópia, só com o que veio depois da base). */
  function apagarDiarios(id) {
    const ficam = new Set(pendentesDe(id).map(x => x.k).filter(Boolean));
    lerDiariosDe(id).forEach(x => {
      if (ficam.has(x.k)) return;
      try { if (localStorage.getItem(x.k) === x.txt) { localStorage.removeItem(x.k); espelhar(x.k, null); } } catch (e) { /* ignora */ } // mudou desde a leitura: fica
    });
    try { const pre = chave(VIDA_K, id) + '#'; Object.keys(localStorage).filter(k => k.indexOf(pre) === 0 && k !== chaveVida(loc.tab, id)).forEach(k => localStorage.removeItem(k)); } catch (e) { /* ignora */ }
    return ficam.size; // diários pendentes que ficaram
  }
  /* Roda fn com a trava local (depois de qualquer consolidação de outra aba em andamento); sem Web Locks, na hora. */
  function comTravaLocal(fn) {
    if (!temTravas() || loc.segura) { fn(); return; }
    const conta = identidade;
    try { localStorage.setItem(chave(QUER_K), loc.tab + '.' + Date.now()); } catch (e) { /* a dona confere a fila */ }
    navigator.locks.request('eear-local@' + nomeConta(), () => { if (identidade === conta) fn(); }).catch(() => { /* aba fechando */ });
  }
  /* Sem Web Locks: abas sem registro de vida recente, com diário. */
  function mortasSemTrava() {
    const m = new Set(), agora = Date.now();
    lerDiarios().forEach(x => {
      if (x.tab === loc.tab) return;
      let v = null; try { v = JSON.parse(localStorage.getItem(chaveVida(x.tab)) || 'null'); } catch (e) { /* ilegível: sem registro */ }
      if (!v || typeof v.t !== 'number' || agora - v.t > (v.oculta ? 1800000 : 8000)) m.add(x.tab);
    });
    return m;
  }
  function registrarVida() {
    if (temTravas() || saindo) return;
    try { localStorage.setItem(chaveVida(loc.tab), JSON.stringify({ t: Date.now(), oculta: document.visibilityState === 'hidden' })); } catch (e) { /* sem espaço */ }
  }
  /* A cada 3 s: vigia diários novos (com Web Locks) ou consolida órfãos (sem). */
  function procurarOrfaos() {
    if (saindo) return;
    if (temTravas()) { lerDiarios().forEach(x => vigiar(x.tab)); return; }
    registrarVida();
    if (mortasSemTrava().size) consolidar();
  }
  function iniciarVigia() { // carregar() a chama na abertura, antes de este trecho rodar: os temporizadores ficam em loc
    clearInterval(loc.tVida); clearInterval(loc.tOrfaos);
    if (!temTravas()) { setTimeout(registrarVida, 0); loc.tVida = setInterval(registrarVida, 2000); } // depois da carga (saindo é de 13-falhas-nuvem.js)
    loc.tOrfaos = setInterval(procurarOrfaos, 3000);
  }
  window.addEventListener('pagehide', () => { if (!temTravas()) { try { localStorage.removeItem(chaveVida(loc.tab)); } catch (e) { /* ignora */ } } });
  window.addEventListener('pageshow', () => registrarVida());
  document.addEventListener('visibilitychange', () => registrarVida());
