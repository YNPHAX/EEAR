  /* ---------- certificados conquistados ----------
     O certificado de uma matéria sai quando todas as aulas dela têm 80% ou mais no quiz. Quando o curso ganha aulas,
     quem já tinha o certificado não pode perdê-lo, e quem ainda não tinha precisa fazer as aulas novas. Por isso cada
     certificado conquistado fica registrado em S.cfg.certs com o que valeu naquele momento. O registro fica dentro de
     cfg porque todas as versões do app, desde a primeira, guardam os campos de cfg que não conhecem (Object.assign em
     mesclar); um campo novo fora de cfg seria apagado por uma versão antiga (site em cache, APK) ao salvar.
     Registro: s (matéria ou 'geral'), mod (modalidade, só em 'ing' e 'geral'), ids (aulas que valeram), h (carga
     horária), d (data de conclusão, aaaa-mm-dd), c (código; null até o aluno informar o nome), o ('anterior': conquistado
     numa versão sem registro; 'curso': conquistado com registro), t (quando foi registrado, em ms).
     cfg.certsZ: quando o progresso foi zerado. Na nuvem, um registro anterior a isso só volta se o progresso o comprovar. */
  const CERTS = ORD.concat('geral'), MODALIDADES = ['normal', 'bct'];
  const certModal = s => s === 'ing' || s === 'geral';
  const dataValida = d => typeof d === 'string' && !isNaN(dnum(d));
  const certAulas = (s, mod) => MODS.filter(m => (s === 'geral' || m.m === s) && (!m.modalidades || m.modalidades.includes(mod)));
  const certChave = r => [r.s, r.mod || '', r.ids.join()].join('|');
  function certValido(r) {
    return !!r && typeof r === 'object' && CERTS.includes(r.s) && Array.isArray(r.ids) && r.ids.length > 0 && r.ids.every(x => typeof x === 'string')
      && dataValida(r.d) && typeof r.h === 'number' && typeof r.t === 'number' && (r.c == null || typeof r.c === 'string')
      && (r.mod == null || MODALIDADES.includes(r.mod)) && (r.o === 'anterior' || r.o === 'curso');
  }
  /* A data e o código saem como a versão antiga calculava: a data é a última em que uma das aulas chegou a 80%. */
  function certNovo(st, s, mod, ms, origem) {
    const d = ms.map(m => (st.mod[m.id] || {}).ok).filter(dataValida).sort().pop() || hoje();
    return { s, mod: certModal(s) ? mod : null, ids: ms.map(m => m.id), h: Math.round(ms.reduce((a, m) => a + m.h, 0)), d,
      c: st.cfg.nome ? codigoCert([st.cfg.nome, s, d].join('|')) : null, o: origem, t: Date.now() };
  }
  /* Registra os certificados que as aulas atuais liberam, sem repetir, e completa os códigos que ainda faltavam. */
  function registrarCerts(st) {
    const mod = st.cfg.modalidade || 'normal';
    CERTS.forEach(s => {
      const ms = certAulas(s, mod);
      if (!ms.length || !ms.every(m => ((st.mod[m.id] || {}).best || 0) >= META)) return;
      const r = certNovo(st, s, mod, ms, 'curso');
      if (!st.cfg.certs.some(x => certChave(x) === certChave(r))) st.cfg.certs.push(r);
    });
    if (st.cfg.nome) st.cfg.certs.forEach(r => { if (!r.c) r.c = codigoCert([st.cfg.nome, r.s, r.d].join('|')); });
  }
  /* Progresso de uma versão sem registro: registra uma única vez os certificados que aquela versão mostrava. Só vale o
     que o progresso comprova: cada aula que já existia (sem o campo desde) com 80% ou mais e com a data em que chegou a
     80% (todas as versões gravam essa data junto com a nota, e nunca no futuro). Se o progresso tem qualquer sinal de uma
     aula que entrou depois (campo desde), ele foi feito numa versão que já exigia essa aula, e o certificado antigo
     daquela matéria não vale. Notas sem data não bastam. */
  function rastroDe(st, id) {
    const re = new RegExp('(^|[^A-Za-z0-9])' + id + '(?![0-9])');
    const chaves = [].concat(Object.keys(st.mod), Object.keys(st.aula), Object.keys(st.fc), Object.keys(st.erros), Object.keys(st.feito),
      Array.isArray(st.cfg.excl) ? st.cfg.excl : [], [String(st.ultAula), JSON.stringify([st.diag, st.ativo, st.ult])]);
    return chaves.some(k => re.test(String(k)));
  }
  function migrarCerts(st) {
    const certs = [], hj = HJ();
    const comprovada = m => { const r = st.mod[m.id]; return !!r && (r.best || 0) >= META && dataValida(r.ok) && dnum(r.ok) <= hj; };
    const antigas = (s, mod) => certAulas(s, mod).filter(m => !m.desde);
    const vale = (s, mod) => { const ms = antigas(s, mod); return ms.length > 0 && ms.every(comprovada) && !certAulas(s, mod).some(m => m.desde && rastroDe(st, m.id)); };
    ORD.forEach(s => (certModal(s) ? MODALIDADES : ['normal']).forEach(mod => { if (vale(s, mod)) certs.push(certNovo(st, s, mod, antigas(s, mod), 'anterior')); }));
    MODALIDADES.forEach(mod => { if (ORD.every(s => vale(s, mod))) certs.push(certNovo(st, 'geral', mod, antigas('geral', mod), 'anterior')); });
    return certs;
  }
  /* Une os certificados de dois progressos do mesmo aluno, sem duplicar (o mesmo certificado fica com a data mais
     antiga e com o código, se só um tiver). Ao colar progresso (st = null), nada se apaga. Na nuvem (st = progresso que
     ficou), um registro feito antes do último "Zerar progresso" (certsZ) só fica se esse progresso ainda o comprovar.
     Devolve true se cfg mudou. */
  function juntarCerts(cfg, outro, st) {
    const antes = JSON.stringify([cfg.certs, cfg.certsZ || 0]);
    const z = Math.max(Number(cfg.certsZ) || 0, Number(outro && outro.certsZ) || 0);
    const provado = r => r.ids.every(id => { const x = st.mod[id]; return !!x && (x.best || 0) >= META && dataValida(x.ok) && x.ok <= r.d; });
    const fica = {};
    [].concat(cfg.certs || [], (outro && outro.certs) || []).filter(certValido).forEach(r => {
      if (st && r.t <= z && !provado(r)) return;
      const k = certChave(r), a = fica[k];
      if (!a || r.d < a.d || (r.d === a.d && !a.c && r.c)) fica[k] = Object.assign({}, r, { ids: r.ids.slice() });
    });
    cfg.certs = Object.keys(fica).map(k => fica[k]).sort((a, b) => a.t - b.t);
    if (z) cfg.certsZ = z; else delete cfg.certsZ;
    return JSON.stringify([cfg.certs, cfg.certsZ || 0]) !== antes;
  }

  /* Progresso que este app não consegue ler (corrompido, ou gravado por uma versão futura com outro formato): antes que o
     primeiro salvar() grave por cima, uma cópia fica em LS_REC, e a tela Hoje oferece copiá-la. */
  const LS_REC = 'missao-eear-v1-recuperar';
  /* Contas (veja "contas neste aparelho"): cada identidade tem as próprias chaves (chave@identidade). Sem conta, valem as
     chaves de sempre, onde já está o progresso de quem nunca entrou numa conta. LS_CONTA lembra a conta em uso. */
  const LS_CONTA = 'missao-eear-conta', BASE_K = 'missao-eear-v1-base';
  const contaUI = { msg: '', adiado: false, ocupado: false }; // estado da tela da conta (veja "contas neste aparelho")
  let identidade = '', recuperar = null, gravouLocal = true;
  const chave = (k, id) => { const i = id === undefined ? identidade : id; return i ? k + '@' + i : k; };
  /* Lê o progresso da identidade em uso; se for ilegível, guarda uma cópia antes que alguma gravação o cubra. */
  function carregar() {
    let st = novoEstado();
    try {
      const t = localStorage.getItem(chave(LS));
      if (t) {
        let lido = false;
        try { const o = JSON.parse(t); if (o && o.v === 1) { st = mesclar(o); lido = true; } } catch (e) { /* ilegível */ }
        if (!lido) try { localStorage.setItem(chave(LS_REC), t); } catch (e) { /* sem espaço para a cópia */ }
      }
      recuperar = localStorage.getItem(chave(LS_REC));
    } catch (e) { /* sem armazenamento local */ }
    return st;
  }
  try {
    /* A conta lembrada só vale onde ela pode ser confirmada (Firebase configurado, ou o link do curso no Claude). */
    const c = localStorage.getItem(LS_CONTA) || '';
    if ((c.indexOf('firebase:') === 0 && window.EEAR_FIREBASE) || (c.indexOf('claude:') === 0 && window.claude)) identidade = c;
  } catch (e) { /* sem armazenamento local */ }
  S = carregar();

  /* pendente: há estudo deste aparelho que a nuvem ainda não confirmou; semRede: a última tentativa falhou por falta de rede.
     O aviso nunca diz "salvo na sua conta" enquanto houver algo pendente. */
  const nuvem = { ref: null, on: false, busy: false, again: false, fb: false, futura: false, conta: null, pendente: false, semRede: false, apagado: '', reapareceu: false, refPausada: null, reenviar: false, lida: false, erro: '', falhas: 0, tRetry: null }; // lida: a nuvem desta conta já foi lida nesta abertura; erro, falhas, tRetry: veja 13-falhas-nuvem.js
  let tSave = null;
  function salvar() {
    S.t = Date.now();
    fixarAncoras();
    try { localStorage.setItem(chave(LS), JSON.stringify(S)); gravouLocal = true; } catch (e) { gravouLocal = false; } // o aviso aparece no próximo render()
    clearTimeout(tSave);
    tSave = setTimeout(gravar, 1500);
    if (nuvem.ref) { nuvem.pendente = true; syncInfo(); }
  }
  async function gravar() {
    if (!nuvem.ref) return;
    if (nuvem.busy) { nuvem.again = true; return; }
    nuvem.busy = true; clearTimeout(nuvem.tRetry);
    try { await conciliar(nuvem.ref); nuvem.falhas = 0; nuvem.erro = ''; }
    catch (e) { // veja 13-falhas-nuvem.js
      if (e && e.code === 'unavailable' && e.espera !== undefined) nuvem.tRetry = setTimeout(gravar, Math.max(0, e.espera) + 200 + Math.random() * 1000); // nuvem travada por outro aparelho
      else if (erroPassageiro(e)) { nuvem.semRede = true; nuvem.tRetry = setTimeout(gravar, esperaNuvem()); } // sem rede, servidor ocupado ou cota: tenta de novo
      else { nuvem.ref = null; nuvem.on = false; nuvem.erro = String((e && e.code) || 'desconhecido'); } // recusada: para, e o aviso diz; o estudo fica aqui
    }
    nuvem.busy = false;
    syncInfo();
    if (nuvem.again) { nuvem.again = false; gravar(); }
  }
  /* Aparelho sem estudo nenhum ainda (só a configuração): o progresso da nuvem tem preferência. Tarefas marcadas, caderno
     de erros e atividade também contam como estudo (antes não contavam, e um aparelho que só tinha marcado tarefas perdia as marcações). */
  const semEstudo = o => !Object.keys(o.mod).length && !o.sims.length && !Object.keys(o.fc).length && !Object.keys(o.ap).length && !o.diag && !Object.keys(o.aula || {}).length && !Object.keys(o.feito || {}).length && !Object.keys(o.erros || {}).length && !Object.keys(o.act || {}).length;
  /* Calcula a união deste aparelho com o progresso da nuvem (o), sem efeito nenhum: dentro de uma transação, pode rodar
     de novo com uma leitura mais nova. Devolve o que gravar na nuvem (ou null) e o que aplicar aqui depois. */
  function planejarUniao(o) {
    const ex = exclusaoNaNuvem(o); // marca de exclusão (11-exclusao-nuvem.js): nada é unido nem gravado
    if (ex && !ex.ignorar) return ex;
    if (ex) o = null; // o aluno pediu para enviar de novo: a marca é substituída pelo progresso deste aparelho
    if (o && (typeof o !== 'object' || o.v !== 1)) return { futura: true };
    const local = mesclar(JSON.parse(JSON.stringify(S)));
    let u = local, perdido = null, c = null, assinado = true, ep = '', lin = [];
    if (o) {
      assinado = assinaturaOk(o); // sem assinatura válida: gravado (ou alterado) por uma versão antiga do app
      ep = assinado && typeof o.ep === 'string' ? o.ep : ''; // época da nuvem (08-uniao-nuvem.js)
      lin = assinado ? linhagem(o) : []; // gravações de que a nuvem descende (08-uniao-nuvem.js)
      c = mesclar(semAssinatura(JSON.parse(JSON.stringify(o))));
      /* A base só vale se for anterior aos dois lados (um progresso colado ou restaurado mais antigo que ela não descende
         dela), se a nuvem foi gravada por esta versão (uma versão antiga grava o progresso inteiro dela por cima, sem
         trava, e o que ela não tinha pareceria apagado do outro lado) e se é da mesma época da nuvem (um aparelho novo
         pode ter unido e assinado por cima de uma gravação antiga, e o documento não descende mais desta base) e se a
         gravação que a base representa está na linhagem da nuvem (uma gravação atrasada de outro aparelho pode ter coberto
         a que esta base confirmou). */
      const b = lerBase(), base = assinado && ep && epocaBase() === ep && lin.includes(idBase()) && b && (b.t || 0) <= (local.t || 0) && (b.t || 0) <= (c.t || 0) ? b : null;
      /* Aparelho que nunca sincronizou e não tem estudo: fica com a nuvem. Um aparelho zerado depois dela passa pela união. */
      if (!b && semEstudo(S) && !((Number(S.cfg.certsZ) || 0) > (Number(c.cfg.certsZ) || 0))) { u = c; juntarCerts(u.cfg, S.cfg, u); registrarCerts(u); } else ({ st: u, perdido } = unirProgresso(base, local, c));
      if (!u.cfg.nome && S.cfg.nome) u.cfg.nome = S.cfg.nome;
    } else if (!S.t) return { nada: true }; // aparelho e nuvem sem progresso: nada a gravar
    /* Documento sem assinatura ou sem época (ou nuvem vazia): a união começa uma época nova e é gravada assinada. */
    return { local, u, perdido, ep: ep || novaEpoca(), lin, id: lin[lin.length - 1] || '', gravar: !c || !ep || !lin.length || !uIgual(u, c) };
  }
  /* Lê a nuvem, une e grava. Com transação (Firebase), a leitura e a gravação são atômicas: se outro aparelho gravar no
     meio, a união é refeita sobre o que ele gravou. Sem transação (link do curso no Claude), veja lerUnirGravar
     (10-nuvem-claude.js): com a trava da nuvem, a gravação é conferida; sem ela, a união segue sem base.
     O resultado só é aplicado aqui depois que a nuvem confirmou, e só se a conta continuar a mesma. */
  async function conciliar(ref) {
    const conta0 = nuvem.conta;
    let p = null, modo = 'ok';
    const planejar = o => {
      p = planejarUniao(o);
      if (!p.gravar) return null;
      p.id = novoIdGravacao(); // esta gravação entra na linhagem; a base, se confirmada, a representa
      return assinar(Object.assign(JSON.parse(JSON.stringify(p.u)), { ep: p.ep, lin: p.lin.concat(p.id).slice(-LIN_MAX) }));
    };
    if (ref.transacao) await ref.transacao(planejar);
    else modo = await lerUnirGravar(ref, planejar);
    nuvem.lida = true; // mesmo sem nada a gravar (nuvem e aparelho vazios): a migração do caminho antigo pode seguir
    if (nuvem.conta !== conta0 || !p || p.nada) return;
    if (p.apagado || p.reapareceu) { pausarPorExclusao(ref, p); render(); return; }
    nuvem.reenviar = false; // "Enviar de novo" atendido: a nuvem tem o progresso deste aparelho
    if (p.futura) { nuvem.ref = null; nuvem.on = false; nuvem.futura = true; return; }
    if (p.perdido) { recuperar = JSON.stringify(p.perdido); try { localStorage.setItem(chave(LS_REC), recuperar); } catch (e) { /* sem espaço */ } }
    /* O que o aluno fez enquanto a gravação viajava também fica: união da cópia usada no cálculo com o estado atual. */
    const u = uIgual(S, p.local) ? p.u : unirProgresso(p.local, mesclar(JSON.parse(JSON.stringify(S))), p.u).st;
    if (!uIgual(u, S)) {
      S = u;
      try { localStorage.setItem(chave(LS), JSON.stringify(S)); } catch (e) { /* ignora */ }
      if (V.v === 'inicio') V = { v: 'hoje' };
      render();
    }
    nuvem.on = true; nuvem.semRede = false; nuvem.pendente = modo === 'conferir' || !uIgual(S, p.u);
    depoisDeGravar(modo, p);
    if (!uIgual(u, p.u)) gravar(); // a união com o que veio depois ainda não está na nuvem
  }
  async function sincronizar(ref, conta) {
    nuvem.ref = ref; nuvem.futura = false; nuvem.semTrava = false; nuvem.semRede = false; nuvem.apagado = ''; nuvem.reapareceu = false; nuvem.lida = false; nuvem.erro = ''; nuvem.falhas = 0; nuvem.conta = String(conta || '');
    await gravar();
  }
  async function conectar() {
    const cl = window.claude;
    if (!cl || typeof cl.use !== 'function') return;
    try {
      const res = await Promise.all([cl.use('db'), cl.use('user')]);
      const db = res[0], user = res[1];
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      usarIdentidade('claude:' + id); // o progresso local passa a ser o desta conta
      await sincronizar(db.doc(caminhoNuvem(id)), 'claude:' + id); // progresso2/<id> (12-caminho-novo.js)
      migrarCaminhoAntigo(db.doc(caminhoAntigo(id)), 'claude:' + id); // une o progresso/<id> das versões antigas, sem apagar
    } catch (e) { nuvem.ref = null; nuvem.on = false; syncInfo(); }
  }

  /* ---------- conta do aluno no site: login e progresso na nuvem (Firebase, quando configurado) ---------- */
  const FB = window.EEAR_FIREBASE || null, FB_VERSAO = '12.19.0';
  const conta = { pronto: !FB, user: null, api: null, msg: '', email: '', iniciando: false };
  function erroConta(e) {
    const c = (e && e.code) || '';
    return ({
      'auth/invalid-email': 'E-mail inválido.',
      'auth/missing-password': 'Digite a senha.',
      'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
      'auth/email-already-in-use': 'Já existe uma conta com esse e-mail. Use Entrar.',
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/wrong-password': 'E-mail ou senha incorretos.',
      'auth/user-not-found': 'Não há conta com esse e-mail. Use Criar conta.',
      'auth/too-many-requests': 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
      'auth/network-request-failed': 'Sem internet. Tente de novo quando estiver conectado.',
      'auth/popup-closed-by-user': 'A janela do Google foi fechada antes de terminar.',
      'auth/unauthorized-domain': 'Este endereço ainda não está autorizado no Firebase.'
    })[c] || 'Não foi possível entrar agora. Tente de novo.';
  }
  async function contaIniciar() {
    if (!FB || conta.iniciando) return;
    conta.iniciando = true; conta.msg = '';
    try {
      const base = 'https://www.gstatic.com/firebasejs/' + FB_VERSAO + '/';
      const mods = await Promise.all(['firebase-app', 'firebase-auth', 'firebase-firestore'].map(n => import(base + n + '.js')));
      const opcoes = Object.assign({}, FB); delete opcoes.sincronizar; delete opcoes.emuladores; delete opcoes.homologacao;
      /* Nova tentativa (o login não carregou da primeira vez): reaproveita o app, se ele chegou a ser criado. */
      const app0 = mods[0].getApps().length ? mods[0].getApp() : mods[0].initializeApp(opcoes), au = mods[1], fs = mods[2];
      const auth = au.getAuth(app0), db = fs.getFirestore(app0);
      auth.languageCode = 'pt';
      /* Emuladores do Firebase (só para testes, e só quando o app roda em localhost). */
      if (FB.emuladores && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) { au.connectAuthEmulator(auth, FB.emuladores.auth, { disableWarnings: true }); fs.connectFirestoreEmulator(db, FB.emuladores.firestore[0], FB.emuladores.firestore[1]); }
      conta.api = { au, fs, auth, db };
      au.getRedirectResult(auth).catch(e => { conta.msg = erroConta(e); render(); });
      au.onAuthStateChanged(auth, u => {
        conta.user = u; conta.pronto = true;
        if (u) ligarNuvem(u);
        else { nuvem.fb = false; if (identidade.indexOf('firebase:') === 0) usarIdentidade(''); } // sessão encerrada: volta ao progresso sem conta, sem apagar nada
        if (V.v === 'plano' || V.v === 'inicio') render(); else syncInfo();
      });
    } catch (e) { conta.pronto = true; conta.msg = 'Não foi possível carregar o login agora. Verifique a internet: o app tenta de novo quando a conexão voltar. O seu progresso continua salvo neste aparelho.'; if (V.v === 'plano' || V.v === 'inicio') render(); }
    conta.iniciando = false;
  }
  /* Conta conectada: o aparelho passa a usar o progresso local desta conta. A nuvem só é usada com a configuração
     "sincronizar": true, a ser ligada depois de validar as regras e as transações no projeto real (veja
     auditoria/contas-e-sincronizacao.md). O documento guarda só o progresso, a versão e as datas: nada de nome ou e-mail. */
  function ligarNuvem(u) {
    const id = 'firebase:' + u.uid;
    usarIdentidade(id);
    if (!S.cfg.nome && u.displayName) S.cfg.nome = u.displayName;
    nuvem.fb = true;
    if (FB.sincronizar !== true) { nuvem.bloqueada = true; syncInfo(); return; }
    const fs = conta.api.fs, db = conta.api.db, doc = fs.doc(db, 'alunos', u.uid);
    const paraDoc = o => ({ v: 1, dados: JSON.stringify(o), t: o.t || 0, atualizado: fs.serverTimestamp() });
    /* Documento de uma versão futura (v > 1): devolve só a versão, para a união recusar e nada ser gravado por cima. */
    const deDoc = x => (!x ? null : Number(x.v) > 1 ? { v: Number(x.v) } : JSON.parse(x.dados));
    const ref = {
      get: async () => { const s = await fs.getDoc(doc), x = s.exists() ? s.data() : null; return { exists: !!x, data: () => deDoc(x) }; },
      set: o => fs.setDoc(doc, paraDoc(o)),
      transacao: f => fs.runTransaction(db, async tx => { const s = await tx.get(doc), novo = f(deDoc(s.exists() ? s.data() : null)); if (novo) tx.set(doc, paraDoc(novo)); })
    };
    sincronizar(ref, id);
  }
  /* Build de homologação (web/build.py): o cartão da conta avisa que é o projeto de teste. */
  function cartaoConta() {
    const h = cartaoContaBase();
    return FB && FB.homologacao ? h.replace('</h2>', '</h2><p class="small" role="note" style="margin:0"><b>Ambiente de homologação</b> (projeto de teste ' + esc(String(FB.projectId || '')) + '): use só contas e dados fictícios.</p>') : h;
  }
  function cartaoContaBase() {
    if (!FB) return '';
    if (!conta.pronto) return '<section class="card"><h2 class="h2">Sua conta</h2><p class="small muted" style="margin:0">Carregando o login…</p></section>';
    if (conta.user) return cartaoContaLogada(conta.user);
    return `<section class="card" id="conta"><h2 class="h2">Entrar ou criar conta</h2><p class="small" style="margin:0">Com uma conta grátis, seu progresso fica salvo na nuvem e você continua no celular, no computador ou no app.</p>
      ${window.EEAR_SITE === 'site' ? '<div class="row"><button class="btn pri" data-a="fbgoogle">Entrar com Google</button></div>' : ''}
      <form class="form" onsubmit="return false"><div class="field"><label for="fb-email">E-mail</label><input type="email" id="fb-email" autocomplete="email" value="${esc(conta.email)}"></div><div class="field"><label for="fb-senha">Senha</label><input type="password" id="fb-senha" autocomplete="current-password"></div></form>
      <div class="row"><button class="btn" data-a="fbentrar">Entrar</button><button class="btn" data-a="fbcriar">Criar conta</button><button class="btn ghost" data-a="fbsenha">Esqueci a senha</button></div>
      <p class="small muted" style="margin:0">Ao criar uma conta, você concorda com os <a href="termos.html" target="_blank" rel="noopener">Termos de uso</a> e a <a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a>.</p>
      ${conta.msg || contaUI.msg ? `<p class="small" role="status" style="margin:0">${esc(conta.msg || contaUI.msg)}</p>` : ''}</section>`; // contaUI.msg: o resultado de sair ou de excluir a conta
  }
  async function acaoConta(a) {
    if (!conta.api) return;
    const { au, auth } = conta.api, g = id => (document.getElementById(id) || {}).value || '';
    const email = g('fb-email').trim(), senha = g('fb-senha');
    conta.email = email; conta.msg = '';
    try {
      if (a === 'fbgoogle') {
        const prov = new au.GoogleAuthProvider();
        try { await au.signInWithPopup(auth, prov); } catch (e) {
          if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) await au.signInWithRedirect(auth, prov); else throw e;
        }
      } else if (a === 'fbentrar') await au.signInWithEmailAndPassword(auth, email, senha);
      else if (a === 'fbcriar') {
        const r = await au.createUserWithEmailAndPassword(auth, email, senha);
        if (S.cfg.nome) await au.updateProfile(r.user, { displayName: S.cfg.nome });
      } else if (a === 'fbsenha') {
        if (!email) { conta.msg = 'Digite seu e-mail acima e toque de novo em "Esqueci a senha".'; render(); return; }
        await au.sendPasswordResetEmail(auth, email);
        conta.msg = 'Enviamos um e-mail para você criar uma senha nova.';
      } else if (a === 'fbsair') await au.signOut(auth);
    } catch (e) { conta.msg = erroConta(e); }
    render();
  }
  function syncInfo() {
    const el = document.getElementById('sync');
    if (el) el.textContent = nuvem.apagado ? 'O progresso desta conta foi apagado da nuvem do curso. O que você estudar aqui fica só neste aparelho.' : nuvem.reapareceu ? 'Uma versão antiga do curso gravou de novo na nuvem depois que você apagou. Veja Plano › Dados.' : nuvem.bloqueada ? 'Progresso salvo neste aparelho, só para esta conta (sincronização com a nuvem ainda não liberada).' : nuvem.futura ? 'A sua conta tem progresso de uma versão mais nova do app: atualize o app. Nada foi gravado na conta.' : nuvem.erro ? avisoErroNuvem() : nuvem.on && nuvem.pendente ? (nuvem.semRede ? 'Progresso salvo neste aparelho. Sem conexão com a nuvem agora: o que falta vai para a sua conta quando a conexão voltar.' : 'Progresso salvo neste aparelho; enviando para a sua conta…') : nuvem.on ? (nuvem.semTrava ? 'Progresso salvo na sua conta. Com o curso aberto em dois aparelhos ao mesmo tempo, a sincronização não é garantida: algo desmarcado pode voltar e algumas contagens podem não somar.' : 'Progresso salvo na sua conta.') : gravouLocal ? 'Progresso salvo neste aparelho.' : 'O progresso não está sendo salvo neste aparelho.';
  }

