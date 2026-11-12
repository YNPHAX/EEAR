  /* ---------- várias abas da mesma conta neste aparelho (F01, F09 e exclusão: auditoria/firebase-codex*.md) ----------
     Cada aba tem a sua cópia do progresso na memória (S), mas todas usam a mesma chave local (a cópia principal). Ler,
     unir e gravar a chave não é uma transação entre abas: uma aba podia gravar por cima do que outra acabara de gravar
     e fechar antes de qualquer reparação. Agora:
     1. Diário durável por aba: toda alteração aceita é gravada na hora (em salvar, sem esperar nada) numa chave só desta
        aba (DIARIO_K@conta#aba): { seq, bid, base, st }, com o estado da aba (st) e a versão principal de que ele parte
        (base, bid). Nenhuma outra aba grava ali; se a aba fechar, a alteração continua no aparelho.
     2. Serialização: só quem tem a trava do navegador (Web Locks, exclusiva por conta) lê, une e grava a cópia
        principal. A união é a de três vias da nuvem (unirProgresso), com a base exata: a versão principal de que o diário
        parte. Como todos os escritores passam pela trava, a cópia principal forma uma cadeia; contagens não somem nem
        dobram (F09). A cadeia é conferida pela linhagem gravada junto (_abas.lin); uma gravação de versão antiga do app
        quebra a cadeia, e a união com ela é sem base (nada se apaga).
     3. Uma vez só: a cópia principal guarda, na mesma gravação atômica, quais diários já absorveu (_abas.inc[aba] = seq).
        Um diário nunca é aplicado duas vezes, nem se a aba morrer entre gravar a cópia principal e apagar o diário.
     4. Diário de aba que fechou (órfão): qualquer aba viva o absorve, com a trava. Cada aba segura uma trava de "vida"
        enquanto está aberta; a outra aba espera essa trava ser solta (a aba fechou) e então absorve o diário. A abertura
        de uma aba também absorve os órfãos.
     5. Cópia principal apagada (Apagar os dados deste aparelho) com um diário que partia dela: só o que esse diário
        estudou depois da base entra, sobre um progresso vazio; o que foi apagado não volta (também numa aba que não
        recebeu o aviso).
     6. Nuvem: só uma aba por conta sincroniza (trava de líder); as outras gravam aqui e a líder envia. Duas abas
        aplicando a mesma mudança da nuvem como se fosse delas dobrariam contagens.
     Navegador sem Web Locks: cada aba consolida só o próprio diário, sem trava (como antes desta mudança), e todas
     sincronizam. Funções declaradas: carregar(), salvar(), conciliar() e usarIdentidade() as usam. */
  /* Declarações de função (e não const): carregar() as usa já na abertura, antes de este trecho rodar. */
  function temTravas() { return !!(navigator.locks && typeof navigator.locks.request === 'function'); }
  function nomeConta() { return identidade || 'sem-conta'; }
  const SOMAR = { somar: true }; // entre abas a base é exata: contagens iguais são incrementos independentes (F09)
  function resumoTexto(t) { let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36) + '.' + t.length.toString(36); }
  function estadoDe(txt) { try { const o = JSON.parse(txt); return o && o.v === 1 ? mesclar(o) : null; } catch (e) { return null; } }
  function metaDe(txt) { try { const m = JSON.parse(txt)._abas; return m && typeof m.id === 'string' && Array.isArray(m.lin) && m.inc && typeof m.inc === 'object' ? m : null; } catch (e) { return null; } }
  /* Identidade de uma versão da cópia principal: a gravada por esta versão, ou o resumo do texto (versão antiga). */
  function idVersao(txt) { const m = txt != null && metaDe(txt); return m ? m.id : txt != null ? 'h' + resumoTexto(txt) : ''; }
  /* Igualdade sem depender da ordem das chaves (a união pode reordenar sem mudar nada); canonico() está em 10-nuvem-claude.js. */
  function mesmoConteudo(a, b) { return JSON.stringify(canonico(a)) === JSON.stringify(canonico(b)); }
  function chaveDiario(tab) { return chave(DIARIO_K) + '#' + tab; }
  function lerDiarios() {
    const pre = chave(DIARIO_K) + '#', out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.indexOf(pre) !== 0) continue;
        let d = null; try { d = JSON.parse(localStorage.getItem(k)); } catch (e) { /* ilegível: ignorado */ }
        out.push({ tab: k.slice(pre.length), k, d: d && d.st && typeof d.seq === 'number' ? d : null });
      }
    } catch (e) { /* sem armazenamento */ }
    return out;
  }
  /* A aba passa a partir da versão principal txt (lida ou gravada por ela). */
  /* Cópia própria: a base não pode ser o mesmo objeto que S (carregar devolve o estado que vira S), senão mudar S mudava
     a base, e a união via a marcação nova na base e ausente na cópia principal, ou seja, apagada. */
  function partirDe(txt, st) {
    const m = txt != null && metaDe(txt); loc.base = txt == null || !st ? null : JSON.parse(JSON.stringify(st)); loc.bid = idVersao(txt); loc.lin = m ? m.lin.slice() : []; loc.baseSeq = (m && m.inc[loc.tab]) || 0;
  }
  /* Base da união com a versão txt: o estado da versão de que a aba partiu, se ela está na cadeia de txt; senão, nenhuma. */
  function baseNaCadeia(txt, m, bid, base) {
    const id = idVersao(txt), naCadeia = !!bid && (bid === id || (!!m && m.lin.indexOf(bid) >= 0));
    return naCadeia && base ? mesclar(JSON.parse(JSON.stringify(base))) : null;
  }
  /* Versão que esta aba já conhece ou que é anterior a ela (aviso atrasado ou fora de ordem): não muda nada. */
  function versaoConhecida(txt) { const id = idVersao(txt); return id === loc.bid || (loc.lin || []).indexOf(id) >= 0; }
  /* Grava o diário desta aba (síncrono: é o que torna a alteração durável). Sem espaço, lança. */
  function persistir() {
    loc.seq++;
    localStorage.setItem(chaveDiario(loc.tab), JSON.stringify({ seq: loc.seq, bid: loc.bid, base: loc.base, st: S }));
    loc.escritora = true;
    loc.pendente = loc.seq;
    loc.jhist = (loc.jhist || []).concat([{ seq: loc.seq, st: JSON.parse(JSON.stringify(S)) }]).slice(-6); // 15-diarios-pendentes.js
  }
  function guardarPerdido(p) { if (!p || loc.semEfeito) return; recuperar = JSON.stringify(p); try { localStorage.setItem(chave(LS_REC), recuperar); } catch (e) { /* sem espaço */ } }
  /* Cópia principal apagada: do estado st, só o que veio depois da base (sem os certificados que a base já tinha). */
  function soDepois(base, st) {
    const so = novidades(base, st), tinha = (base.cfg.certs || []).map(certChave);
    so.cfg = Object.assign({}, st.cfg, { certs: (st.cfg.certs || []).filter(c => tinha.indexOf(certChave(c)) < 0) });
    return mesclar(so);
  }
  /* Cópia principal fora da cadeia de que a aba partiu (gravada por uma versão antiga do app, sem linhagem, ou por outra
     cópia): da aba entra só o que ela mudou desde a própria base (contagens como diferença, somadas), e o que ela não mudou
     não volta (o que a outra gravação apagou continua apagado). Desmarcações da aba não passam; marcações não se perdem. */
  function unirSemCadeia(base, st, atual) {
    if (mesmoConteudo(base, st)) return atual; // nada novo nesta aba
    const so = novidades(base, st);
    const r = unirProgresso(mesclar({ v: 1, t: 0, cfg: atual.cfg }), so, atual, SOMAR); guardarPerdido(r.perdido); return r.st;
  }
  /* Aplica um diário sobre a cópia principal lida no início da consolidação (txt0, m0) já com os diários anteriores (atual). */
  function aplicarDiario(d, txt0, m0, atual) {
    const base = d.base ? mesclar(d.base) : null, st = mesclar(d.st);
    if (txt0 == null) { // sem cópia principal: apagada (o diário partia de uma) ou ainda não criada
      const meu = base ? soDepois(base, st) : st;
      if (!atual) return meu;
      const r = unirProgresso(mesclar({ v: 1, t: 0, cfg: meu.cfg }), meu, atual, SOMAR); guardarPerdido(r.perdido); return r.st;
    }
    const b0 = baseNaCadeia(txt0, m0, d.bid, base);
    if (b0 && atual && mesmoConteudo(b0, atual)) return st; // nada mudou desde a base: o diário é o estado novo, como está
    if (!b0 && base && atual) return unirSemCadeia(base, st, atual);
    const r = unirProgresso(b0, st, atual, SOMAR); guardarPerdido(r.perdido); return r.st;
  }
  /* Consolidação (com a trava): absorve o diário desta aba e os órfãos na cópia principal. vivos: abas abertas (ou null). */
  function consolidarAgora(vivos, mortas) { // mortas (aba com a trava, sem nova consulta): só esses órfãos; os demais, depois
    const k = chave(LS);
    let txt0 = null; try { txt0 = localStorage.getItem(k); } catch (e) { return; }
    let atual = txt0 != null ? estadoDe(txt0) : null;
    if (txt0 != null && !atual) { recuperar = txt0; try { localStorage.setItem(chave(LS_REC), txt0); } catch (e) { /* sem espaço */ } txt0 = null; } // ilegível
    const m0 = txt0 != null ? metaDe(txt0) : null, inc = {}, usados = [];
    let mudou = false, proprio = null;
    lerDiarios().forEach(({ tab, k: kd, d }) => {
      const meu = tab === loc.tab, antigo = m0 ? m0.inc[tab] : undefined;
      if (antigo !== undefined) inc[tab] = antigo;
      if (!meu && (mortas ? !mortas.has(tab) : !vivos || vivos.has(tab))) return; // aba aberta cuida do próprio diário
      if (!d || (antigo !== undefined && antigo >= d.seq)) { if (!meu) usados.push(kd); return; } // ilegível ou já absorvido
      const depois = aplicarDiario(d, txt0, m0, atual);
      if (atual && mesmoConteudo(depois, atual)) { if (meu) proprio = d; else usados.push(kd); return; } // nada novo: não regrava a cópia principal
      atual = depois; inc[tab] = d.seq; mudou = true;
      if (meu) proprio = d; // órfão aplicado: apagado numa consolidação seguinte, quando a cópia principal confirmar (inc)
    });
    let txt = txt0;
    if (mudou) {
      const id = 'v' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36), ant = txt0 != null ? idVersao(txt0) : '';
      const lin = ((m0 && m0.lin) || []).concat(ant ? [ant] : []).slice(-30);
      const novo = JSON.stringify(Object.assign({}, atual, { _abas: { id, lin, inc } }));
      try { localStorage.setItem(k, novo); } catch (e) { gravouLocal = false; return; } // sem espaço: o diário continua
      gravouLocal = true; txt = novo;
    }
    usados.forEach(kd => { try { localStorage.removeItem(kd); } catch (e) { /* ignora */ } });
    const antes = JSON.stringify(S);
    if (proprio) { // o que esta aba fez depois do diário absorvido continua (união com o diário como base)
      const cur = estadoDe(txt), agora = mesclar(JSON.parse(JSON.stringify(S)));
      S = mesmoConteudo(agora, mesclar(proprio.st)) ? (mesmoConteudo(agora, cur) ? agora : cur) : unirProgresso(mesclar(proprio.st), agora, cur, SOMAR).st; // conteúdo igual: mantém a ordem das chaves desta aba // sem nada novo aqui: exatamente a cópia principal
      partirDe(txt, estadoDe(txt));
      /* O diário fica (é o recibo): se uma leitura atrasada de outra aba cobrir esta versão, a marca de absorvido (inc)
         some junto, e o diário é aplicado de novo, sobre uma base que continua na cadeia. Órfão já absorvido é apagado. */
      if (loc.pendente === proprio.seq) loc.pendente = 0;
      if (!mesmoConteudo(S, cur)) { try { persistir(); } catch (e) { gravouLocal = false; } consolidar(); }
    } else if (txt != null && !versaoConhecida(txt)) receberPrincipal(txt);
    if (JSON.stringify(S) !== antes) depoisDeMudarS();
  }
  function depoisDeMudarS() { if (V.v === 'inicio' && !semEstudo(S)) V = { v: 'hoje' }; render(); if (nuvem.ref && !saindo) { nuvem.pendente = true; clearTimeout(tSave); tSave = setTimeout(gravar, 1500); syncInfo(); } }
  /* Outra aba gravou a cópia principal (txt): esta une o que tem com ela e passa a partir dela. */
  function receberPrincipal(txt) {
    const novo = estadoDe(txt), m = metaDe(txt);
    if (!novo) return;
    /* Outra aba já pôs na cópia um diário desta aba posterior à base dela (sem Web Locks, esta aba parecia fechada): a base
       é o estado daquele diário, para não contar duas vezes o que ele trouxe. */
    const k = m && m.inc[loc.tab], dj = k > (loc.baseSeq || 0) ? (loc.jhist || []).find(h => h.seq === k) : null;
    const b0 = dj ? mesclar(JSON.parse(JSON.stringify(dj.st))) : baseNaCadeia(txt, m, loc.bid, loc.base), cadeia = !!b0, eu = mesclar(JSON.parse(JSON.stringify(S)));
    let u;
    if (!cadeia && loc.base) u = unirSemCadeia(mesclar(JSON.parse(JSON.stringify(loc.base))), eu, novo);
    else { const r = unirProgresso(b0, eu, novo, SOMAR); guardarPerdido(r.perdido); u = r.st; }
    if (!mesmoConteudo(u, eu)) S = u; // conteúdo igual: mantém a ordem das chaves desta aba
    partirDe(txt, novo);
    /* Diário pendente: passa a partir da nova versão. Versão fora da cadeia (gravada por quem leu a chave atrasada, ou por
       uma versão antiga do app) sem algo que esta aba tem: grava de novo, para não depender de esta aba continuar aberta. */
    if (loc.pendente || (!cadeia && !mesmoConteudo(S, novo))) { try { persistir(); } catch (e) { gravouLocal = false; } consolidar(); }
  }
  function vivosDe(q) {
    if (!q || !Array.isArray(q.held)) return null;
    const pre = 'eear-vida#', suf = '@' + nomeConta(), s = new Set();
    /* Só a própria aba segura a trava de vida em modo exclusivo; quem vigia pede em modo compartilhado e não conta como viva. */
    q.held.forEach(l => { const n = l && l.name; if (l.mode === 'exclusive' && typeof n === 'string' && n.indexOf(pre) === 0 && n.slice(-suf.length) === suf) s.add(n.slice(pre.length, -suf.length)); });
    return s;
  }
  /* Sem a trava e sem cópia principal (conta nova neste aparelho, ou cópia apagada): cria já, de forma síncrona, para que
     uma reabertura logo depois encontre o estudo. Não há versão a sobrescrever; se outra aba criar ao mesmo tempo, o diário
     dela continua e entra na consolidação dela (a marca inc dela não está aqui). */
  function criarSeAusente() {
    if (loc.segura || !loc.pendente || loc.bid !== '') return;
    let txt = null; try { txt = localStorage.getItem(chave(LS)); } catch (e) { return; }
    if (txt != null) return;
    const novo = JSON.stringify(Object.assign({}, S, { _abas: { id: 'v' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36), lin: [], inc: { [loc.tab]: loc.pendente } } }));
    try { localStorage.setItem(chave(LS), novo); } catch (e) { return; }
    partirDe(novo, S); loc.pendente = 0;
  }
  /* Trava local (eear-local@<conta>): quem a tem é a única aba que grava a cópia principal. A aba que estudou fica com ela
     enquanto nenhuma outra precisa, e então grava a cópia principal na hora, de forma síncrona (cada clique já fica na
     cópia que outras abas e uma reabertura leem). Outra aba que precisa grava um pedido (QUER_K; o aviso storage chega à
     dona) e entra na fila; a dona solta e volta para a fila sem pedir (sem pingue-pongue). A dona também confere a fila a
     cada 250 ms, caso o aviso se perca, e solta a trava ao ir para o fundo (uma aba suspensa não prende as outras). vivos: abas abertas da última consulta; uma lista atrasada não perde nada (aba
     viva tratada como fechada: o diário dela entra uma vez só, por inc; aba fechada tratada como viva: entra depois). */
  function consolidar(passiva) {
    if (loc.segura) { consolidarAgora(null, loc.mortas); return; }
    criarSeAusente();
    if (!passiva && temTravas()) { try { localStorage.setItem(chave(QUER_K), loc.tab + '.' + Date.now()); } catch (e) { /* sem espaço: a fila é conferida pela dona */ } }
    if (loc.agendado) { loc.denovo = true; return; } // já há um pedido na fila: roda de novo quando a vez chegar
    loc.agendado = true; loc.denovo = false;
    const conta = identidade;
    if (!temTravas()) { setTimeout(() => { loc.agendado = false; if (identidade === conta) consolidarAgora(null, mortasSemTrava()); if (loc.denovo) { loc.denovo = false; consolidar(); } }, 0); return; }
    navigator.locks.request('eear-local@' + nomeConta(), async () => {
      let q = null; try { q = await navigator.locks.query(); } catch (e) { /* sem consulta: só o próprio diário */ }
      loc.agendado = false;
      if (identidade !== conta) return undefined;
      loc.vivos = vivosDe(q); loc.denovo = false;
      consolidarAgora(loc.vivos); // também na saída: é união com a trava, não resposta atrasada (F02)
      loc.mortas = mortasDe(loc.vivos);
      /* Fica com a trava quem estudou, ou a aba aberta sozinha (então até o primeiro clique grava na hora). */
      const sozinha = !!loc.vivos && Array.from(loc.vivos).every(t => t === loc.tab);
      if ((!loc.escritora && !sozinha) || saindo || identidade !== conta || document.visibilityState === 'hidden') return undefined;
      loc.segura = true;
      return new Promise(r => {
        const t = setInterval(conferirFila, 250);
        loc.soltarSeg = () => { clearInterval(t); loc.segura = false; loc.soltarSeg = null; r(); };
      });
    }).catch(() => { loc.agendado = false; });
  }
  /* Abas com diário que estavam fechadas na consulta (uma aba aberta depois não entra: o diário dela é só dela). */
  function mortasDe(vivos) { const m = new Set(); if (vivos) lerDiarios().forEach(x => { if (x.tab !== loc.tab && !vivos.has(x.tab)) m.add(x.tab); }); return m; }
  /* Com a trava: consulta de novo quem está aberto e consolida (uma aba fechou); se a trava foi solta no meio, pede a vez. */
  function consolidarConsultando() {
    if (!loc.segura) { consolidar(); return; }
    const vez = loc.soltarSeg;
    navigator.locks.query().then(q => {
      if (!loc.segura || loc.soltarSeg !== vez) { consolidar(); return; }
      loc.vivos = vivosDe(q); consolidarAgora(loc.vivos); loc.mortas = mortasDe(loc.vivos);
    }).catch(() => consolidar());
  }
  /* Solta a trava local; de volta, sem pedir, se esta aba continua estudando aqui (outra aba só consolida e solta). */
  function soltarLocal(voltar) {
    if (!loc.soltarSeg) return;
    loc.soltarSeg();
    if (voltar && !saindo) consolidar(true);
  }
  function conferirFila() {
    if (!loc.segura) return;
    const nome = 'eear-local@' + nomeConta();
    navigator.locks.query().then(q => { if (loc.segura && (q.pending || []).some(l => l && l.name === nome)) soltarLocal(true); }).catch(() => { /* sem consulta */ });
  }
  /* Espera a aba dona de um diário fechar (a trava de vida dela é solta) e então absorve o órfão. */
  function vigiar(tab) {
    if (!temTravas() || tab === loc.tab || loc.vigiadas.has(tab)) return;
    loc.vigiadas.add(tab);
    const conta = identidade;
    navigator.locks.request('eear-vida#' + tab + '@' + nomeConta(), { mode: 'shared' }, () => { loc.vigiadas.delete(tab); if (identidade === conta) consolidarConsultando(); }).catch(() => loc.vigiadas.delete(tab));
  }
  /* Abertura da conta nesta aba: trava de vida (enquanto esta conta estiver aberta aqui), órfãos e vigia dos diários. */
  function abrirAbas() {
    if (loc.soltarVida) loc.soltarVida();
    loc.soltarVida = null; loc.vigiadas = new Set();
    if (temTravas()) navigator.locks.request('eear-vida#' + loc.tab + '@' + nomeConta(), () => new Promise(r => { loc.soltarVida = r; })).catch(() => { /* sem trava de vida */ });
    iniciarVigia(); // 15-diarios-pendentes.js
    setTimeout(() => { consolidar(); lerDiarios().forEach(x => vigiar(x.tab)); }, 0);
  }
  /* Liderança da nuvem: só a aba que tem a trava da conta sincroniza. Trava livre: esta aba a pega já (com uma aba só,
     tudo acontece como antes); outra aba lidera: esta entra na fila, sem esperar, e passa a sincronizar quando ela fechar. */
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
    if (ev.key === chave(QUER_K)) { soltarLocal(true); return; } // outra aba precisa gravar: a vez é dela
    if (ev.key.indexOf(chave(DIARIO_K) + '#') === 0) { vigiar(ev.key.slice(chave(DIARIO_K).length + 1)); return; }
    if (ev.key === chave(BASE_K)) { syncInfo(); return; } // a aba líder confirmou uma gravação na nuvem (seguidora: o aviso diz se o progresso daqui já está nela)
    if (ev.key !== chave(LS)) return;
    /* O valor do aviso pode estar atrasado ou fora de ordem: vale o que está na chave agora. */
    let atual = null; try { atual = localStorage.getItem(chave(LS)); } catch (e) { return; }
    const antes = JSON.stringify(S);
    if (atual == null && loc.bid !== '') { // cópia principal apagada em outra aba: fica só o que esta aba fez depois dela
      S = loc.pendente && loc.base ? soDepois(mesclar(loc.base), mesclar(JSON.parse(JSON.stringify(S)))) : loc.pendente ? S : novoEstado();
      partirDe(null, null);
      if (loc.pendente) { try { persistir(); } catch (e) { gravouLocal = false; } consolidar(); }
    } else if (atual != null && !versaoConhecida(atual)) receberPrincipal(atual);
    if (JSON.stringify(S) !== antes) depoisDeMudarS();
  });
