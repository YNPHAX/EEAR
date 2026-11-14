  /* ---------- conta do aluno no site: login e progresso na nuvem (Firebase, quando configurado) ---------- */
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
      'auth/unauthorized-domain': 'Este endereço ainda não está autorizado no Firebase.',
      'auth/password-does-not-meet-requirements': 'A senha não atende aos requisitos: use pelo menos 8 caracteres, com letras e números.',
      'auth/operation-not-allowed': 'Esta forma de entrar não está ativada no Firebase.',
      'auth/user-disabled': 'Esta conta foi desativada.',
      'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita janelas para este site e tente de novo.'
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
     auditoria/contas-e-sincronizacao.md). O documento guarda o progresso, a versão e as datas; o progresso inclui
     cfg.nome quando informado para o certificado. Senha e tokens do login não são copiados para o documento. */
  function ligarNuvem(u) {
    const id = 'firebase:' + u.uid;
    usarIdentidade(id);
    if (!S.cfg.nome && u.displayName) S.cfg.nome = u.displayName;
    nuvem.fb = true;
    if (FB.sincronizar !== true) { nuvem.bloqueada = true; syncInfo(); return; }
    const fs = conta.api.fs, db = conta.api.db, doc = fs.doc(db, 'alunos', u.uid);
    const paraDoc = o => ({ v: 2, dados: JSON.stringify(o), t: o.t || 0, atualizado: fs.serverTimestamp() });
    /* Envelope Firebase v2 impede escritores antigos de remover identidades; uma versão futura (v > 2): devolve só a versão, para a união recusar e nada ser gravado por cima. */
    const deDoc = x => (!x ? null : Number(x.v) > 2 ? { v: Number(x.v) } : JSON.parse(x.dados));
    const ref = {
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
    return `<section class="card" id="conta"><h2 class="h2">Entrar ou criar conta</h2><p class="small" style="margin:0">A conta Firebase do curso sincroniza seu progresso entre celular, computador e app. O login do ambiente antigo não substitui esta conta.</p>
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
