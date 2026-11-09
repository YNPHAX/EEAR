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
  let recuperar = null, gravouLocal = true;
  try {
    const t = localStorage.getItem(LS);
    if (t) {
      let lido = false;
      try { const o = JSON.parse(t); if (o && o.v === 1) { S = mesclar(o); lido = true; } } catch (e) { /* ilegível */ }
      if (!lido) try { localStorage.setItem(LS_REC, t); } catch (e) { /* sem espaço para a cópia */ }
    }
    recuperar = localStorage.getItem(LS_REC);
  } catch (e) { /* sem armazenamento local */ }

  const nuvem = { ref: null, on: false, busy: false, again: false, fb: false, futura: false };
  let tSave = null;
  function salvar() {
    S.t = Date.now();
    fixarAncoras();
    try { localStorage.setItem(LS, JSON.stringify(S)); gravouLocal = true; } catch (e) { gravouLocal = false; } // o aviso aparece no próximo render()
    clearTimeout(tSave);
    tSave = setTimeout(gravar, 1500);
  }
  async function gravar() {
    if (!nuvem.ref) return;
    if (nuvem.busy) { nuvem.again = true; return; }
    nuvem.busy = true;
    try { await conciliar(nuvem.ref); }
    catch (e) {
      if (e && e.code === 'unavailable') setTimeout(gravar, 2500 + Math.random() * 2500);
      else { nuvem.ref = null; nuvem.on = false; }
    }
    nuvem.busy = false;
    syncInfo();
    if (nuvem.again) { nuvem.again = false; gravar(); }
  }
  /* Aparelho sem estudo nenhum ainda (só a configuração): o progresso da nuvem tem preferência. */
  const semEstudo = o => !Object.keys(o.mod).length && !o.sims.length && !Object.keys(o.fc).length && !Object.keys(o.ap).length && !o.diag && !Object.keys(o.aula || {}).length;
  /* Lê a nuvem, une com este aparelho (veja "união do progresso entre aparelhos") e grava nos dois lados o que mudou.
     A união é calculada logo depois da leitura, sem pausa: o que o aluno fizer enquanto a gravação viaja dispara outra
     união em seguida. Nuvem com progresso de uma versão futura do app (v diferente de 1): nada é lido nem gravado. */
  async function conciliar(ref) {
    const snap = await ref.get(), o = snap.exists ? snap.data() : null;
    if (o && (typeof o !== 'object' || o.v !== 1)) { nuvem.ref = null; nuvem.on = false; nuvem.futura = true; return; }
    const local = mesclar(JSON.parse(JSON.stringify(S)));
    let u = local, perdido = null, c = null;
    if (o) {
      c = mesclar(JSON.parse(JSON.stringify(o)));
      /* A base só vale se for anterior aos dois lados: um progresso colado ou restaurado mais antigo que ela não descende dela. */
      const b = lerBase(), base = b && (b.t || 0) <= (local.t || 0) && (b.t || 0) <= (c.t || 0) ? b : null;
      /* Aparelho que nunca sincronizou e não tem estudo: fica com a nuvem. Um aparelho zerado depois dela passa pela união. */
      if (!b && semEstudo(S) && !((Number(S.cfg.certsZ) || 0) > (Number(c.cfg.certsZ) || 0))) { u = c; juntarCerts(u.cfg, S.cfg, u); registrarCerts(u); } else ({ st: u, perdido } = unirProgresso(base, local, c));
      if (!u.cfg.nome && S.cfg.nome) u.cfg.nome = S.cfg.nome;
    } else if (!S.t) return; // aparelho e nuvem sem progresso: nada a gravar
    if (perdido) { recuperar = JSON.stringify(perdido); try { localStorage.setItem(LS_REC, recuperar); } catch (e) { /* sem espaço */ } }
    if (!uIgual(u, S)) {
      S = u;
      try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { /* ignora */ }
      if (V.v === 'inicio') V = { v: 'hoje' };
      render();
    }
    if (!c || !uIgual(u, c)) await ref.set(JSON.parse(JSON.stringify(u)));
    nuvem.on = true;
    gravarBase(u);
  }
  async function sincronizar(ref) {
    nuvem.ref = ref; nuvem.futura = false;
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
      await sincronizar(db.doc('progresso/' + id));
    } catch (e) { nuvem.ref = null; nuvem.on = false; syncInfo(); }
  }

  /* ---------- conta do aluno no site: login e progresso na nuvem (Firebase, quando configurado) ---------- */
  const FB = window.EEAR_FIREBASE || null, FB_VERSAO = '12.19.0';
  const conta = { pronto: !FB, user: null, api: null, msg: '', email: '' };
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
    if (!FB) return;
    try {
      const base = 'https://www.gstatic.com/firebasejs/' + FB_VERSAO + '/';
      const mods = await Promise.all(['firebase-app', 'firebase-auth', 'firebase-firestore'].map(n => import(base + n + '.js')));
      const app0 = mods[0].initializeApp(FB), au = mods[1], fs = mods[2];
      const auth = au.getAuth(app0);
      auth.languageCode = 'pt';
      conta.api = { au, fs, auth, db: fs.getFirestore(app0) };
      au.getRedirectResult(auth).catch(e => { conta.msg = erroConta(e); render(); });
      au.onAuthStateChanged(auth, u => {
        conta.user = u; conta.pronto = true;
        if (u) ligarNuvem(u);
        else if (nuvem.fb) { nuvem.ref = null; nuvem.on = false; nuvem.fb = false; }
        if (V.v === 'plano' || V.v === 'inicio') render(); else syncInfo();
      });
    } catch (e) { conta.pronto = true; conta.msg = 'Não foi possível carregar o login agora. Verifique a internet.'; if (V.v === 'plano' || V.v === 'inicio') render(); }
  }
  function ligarNuvem(u) {
    const fs = conta.api.fs, doc = fs.doc(conta.api.db, 'alunos', u.uid);
    /* O progresso vai como texto: o Firestore não guarda listas dentro de listas. */
    const ref = {
      get: async () => { const s = await fs.getDoc(doc), x = s.exists() ? s.data() : null; return { exists: !!(x && x.dados), data: () => JSON.parse(x.dados) }; },
      set: o => fs.setDoc(doc, { dados: JSON.stringify(o), t: o.t || 0, nome: (o.cfg && o.cfg.nome) || u.displayName || '', email: u.email || '', atualizado: fs.serverTimestamp() })
    };
    if (!S.cfg.nome && u.displayName) S.cfg.nome = u.displayName;
    nuvem.fb = true;
    sincronizar(ref);
  }
  function cartaoConta() {
    if (!FB) return '';
    if (!conta.pronto) return '<section class="card"><h2 class="h2">Sua conta</h2><p class="small muted" style="margin:0">Carregando o login…</p></section>';
    if (conta.user) {
      const u = conta.user;
      return `<section class="card"><h2 class="h2">Sua conta</h2><p style="margin:0">Conectado como <b>${esc(u.displayName || u.email || 'aluno')}</b>${u.displayName && u.email ? ` (${esc(u.email)})` : ''}. Seu progresso fica salvo na nuvem e continua em qualquer aparelho em que você entrar.</p><div class="row"><button class="btn" data-a="fbsair">Sair desta conta</button></div></section>`;
    }
    return `<section class="card" id="conta"><h2 class="h2">Entrar ou criar conta</h2><p class="small" style="margin:0">Com uma conta grátis, seu progresso fica salvo na nuvem e você continua no celular, no computador ou no app.</p>
      ${window.EEAR_SITE === 'site' ? '<div class="row"><button class="btn pri" data-a="fbgoogle">Entrar com Google</button></div>' : ''}
      <form class="form" onsubmit="return false"><div class="field"><label for="fb-email">E-mail</label><input type="email" id="fb-email" autocomplete="email" value="${esc(conta.email)}"></div><div class="field"><label for="fb-senha">Senha</label><input type="password" id="fb-senha" autocomplete="current-password"></div></form>
      <div class="row"><button class="btn" data-a="fbentrar">Entrar</button><button class="btn" data-a="fbcriar">Criar conta</button><button class="btn ghost" data-a="fbsenha">Esqueci a senha</button></div>
      <p class="small muted" style="margin:0">Ao criar uma conta, você concorda com os <a href="termos.html" target="_blank" rel="noopener">Termos de uso</a> e a <a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a>.</p>
      ${conta.msg ? `<p class="small" role="status" style="margin:0">${esc(conta.msg)}</p>` : ''}</section>`;
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
    if (el) el.textContent = nuvem.futura ? 'A sua conta tem progresso de uma versão mais nova do app: atualize o app. Nada foi gravado na conta.' : nuvem.on ? 'Progresso salvo na sua conta.' : gravouLocal ? 'Progresso salvo neste aparelho.' : 'O progresso não está sendo salvo neste aparelho.';
  }

