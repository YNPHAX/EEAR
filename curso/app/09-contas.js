  /* ---------- contas neste aparelho ----------
     Cada conta tem o próprio progresso local (missao-eear-v1@firebase:uid ou @claude:id); sem conta, vale o de sempre.
     Ao entrar, o aparelho passa a mostrar só o progresso daquela conta. O progresso feito sem conta fica guardado à parte
     e só vai para a conta se o aluno pedir ("Levar para a conta"). Ao sair, o aluno escolhe manter ou apagar deste
     aparelho o progresso da conta; apagar só é possível depois que a nuvem confirmou tudo (nada some antes de estar
     salvo em outro lugar). Toda exclusão pede confirmação e diz exatamente o que foi apagado. */
  function copiar(x) { return JSON.parse(JSON.stringify(x)); }
  function usarIdentidade(id) {
    id = id || '';
    if (id === identidade) return false;
    clearTimeout(tSave);
    clearTimeout(nuvem.tRetry); nuvem.erro = ''; nuvem.falhas = 0;
    if (lider.soltar) lider.soltar(); lider.soltar = null; lider.ativa = false; lider.conta = null; lider.espera = null; // a liderança da nuvem era da conta anterior
    soltarLocal(false); loc.escritora = false; loc.vivos = null; // a trava local também (14-abas.js)
    nuvem.ref = null; nuvem.on = false; nuvem.again = false; nuvem.futura = false; nuvem.bloqueada = false; nuvem.pendente = false; nuvem.semRede = false; nuvem.apagado = ''; nuvem.reapareceu = false; nuvem.refPausada = null; nuvem.conta = id;
    identidade = id;
    try { if (id) localStorage.setItem(LS_CONTA, id); else localStorage.removeItem(LS_CONTA); } catch (e) { /* sem armazenamento */ }
    S = carregar(); QZ = null; FC = null; pedindo = null; msgRec = ''; contaUI.adiado = false;
    V = mostrarInicio() ? { v: 'inicio' } : V.v === 'plano' ? V : { v: 'hoje' }; // a tela inicial depende do progresso da conta que entrou
    render();
    return true;
  }
  /* Apaga deste aparelho o progresso de uma identidade (e as cópias dela). Só é chamado depois de confirmação explícita. */
  function apagarLocal(id) {
    [LS, LS_REC, BASE_K, ABAS_K, QUER_K].forEach(k => { try { localStorage.removeItem(chave(k, id)); } catch (e) { /* ignora */ } });
    try { const pre = chave(DIARIO_K, id) + '#'; Object.keys(localStorage).filter(k => k.indexOf(pre) === 0).forEach(k => localStorage.removeItem(k)); } catch (e) { /* ignora */ } // diários das abas desta conta
    if (id === identidade) { S = novoEstado(); recuperar = null; loc.pendente = 0; partirDe(null, null); }
  }
  function contasGuardadas() {
    const ids = new Set();
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) || ''; const m = k.match(/^missao-eear-v1(?:-base|-recuperar)?@(.+)$/); if (m && m[1] !== identidade) ids.add(m[1]); } } catch (e) { /* ignora */ }
    return [...ids];
  }
  /* A cópia desta conta neste aparelho já está na nuvem dela? Só quando é igual à última versão que a nuvem confirmou
     (a base), ou quando não tem estudo. Cópia de recuperação ou ilegível: não está (é o que pode ser perdido). */
  function sincronizadoDe(id) {
    try {
      if (localStorage.getItem(chave(LS_REC, id))) return false;
      const t = localStorage.getItem(chave(LS, id)); if (!t) return true;
      const st = mesclar(JSON.parse(t)); if (semEstudo(st)) return true;
      const b = JSON.parse(localStorage.getItem(chave(BASE_K, id)) || 'null');
      return !!(b && b.conta === id && b.st && b.st.v === 1 && uIgual(mesclar(b.st), st));
    } catch (e) { return false; }
  }
  function progressoSemConta() { try { const t = localStorage.getItem(LS); const o = t && JSON.parse(t); return o && o.v === 1 ? mesclar(o) : null; } catch (e) { return null; } }
  /* O progresso desta conta unido ao feito sem conta. Os "Zerar" de cada lado não se cruzam e a configuração da conta fica. */
  function unirImportacao(a) {
    const l = copiar(S), c = copiar(a); delete l.cfg.certsZ; delete c.cfg.certsZ;
    const u = unirProgresso(null, mesclar(l), mesclar(c)).st;
    Object.keys(S.cfg).forEach(k => { if (!['certs', 'fcv', 'fcAncora'].includes(k)) u.cfg[k] = copiar(S.cfg[k]); });
    return mesclar(u);
  }
  /* Há estudo sem conta neste aparelho que a conta em uso ainda não tem? */
  function novidadeSemConta() {
    if (!identidade) return null;
    const a = progressoSemConta();
    if (!a || semEstudo(a)) return null;
    const u = unirImportacao(a);
    return ['mod', 'fc', 'sims', 'erros', 'ap', 'aula'].some(k => !uIgual(u[k], S[k])) ? a : null;
  }
  /* A nuvem já tem tudo o que está neste aparelho (a última sincronização gravou exatamente o progresso atual)? */
  function sincronizado() { const b = lerBase(); return !!b && uIgual(b, mesclar(copiar(S))); }
  function resumoProg(st) { return `${plural(Object.keys(st.mod).length, 'aula estudada', 'aulas estudadas')}, ${plural(Object.keys(st.fc).length, 'flashcard visto', 'flashcards vistos')} e ${plural(st.sims.length, 'simulado', 'simulados')}`; }

  /* Aviso na tela Hoje: progresso sem conta que a conta ainda não tem. */
  function avisoContas() {
    if (contaUI.adiado || !identidade) return '';
    const a = novidadeSemConta();
    return a ? `<div class="banner acc"><p>Este aparelho tem progresso feito sem conta (${resumoProg(a)}) que ainda não está nesta conta. Ele só vai para a conta se você pedir.</p><button class="btn sm pri" data-a="contalevar">Levar para a conta</button><button class="btn sm" data-a="contaadiar">Agora não</button></div>` : '';
  }
  /* Cartão da conta conectada (Firebase): sair com escolha, excluir a conta. */
  function cartaoContaLogada(u) {
    let h = `<section class="card"><h2 class="h2">Sua conta</h2><p style="margin:0">Conectado como <b>${esc(u.displayName || u.email || 'aluno')}</b>${u.displayName && u.email ? ` (${esc(u.email)})` : ''}. Este aparelho mostra só o progresso desta conta.${nuvem.bloqueada ? ' A sincronização com a nuvem ainda não está liberada: por enquanto, o progresso desta conta fica só neste aparelho.' : ''}</p>`;
    const a = novidadeSemConta();
    if (a) h += `<p class="small" style="margin:0">Progresso feito sem conta neste aparelho: ${resumoProg(a)}. <button class="btn sm" data-a="contalevar">Levar para a conta</button></p>`;
    if (pedindo === 'sair') {
      const ok = sincronizado();
      h += `<div class="confirm"><p>Sair da conta. O que fazer com o progresso desta conta neste aparelho?${ok ? ' Ele está salvo na nuvem.' : ' Atenção: parte dele ainda não está salva na nuvem, então só dá para sair mantendo os dados aqui.'}</p><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="contasairmanter">Sair e manter aqui</button>${ok ? '<button class="btn sm" data-a="contasairapagar">Sair e apagar deste aparelho</button>' : ''}</div>`;
    } else if (pedindo === 'excluirconta') {
      const senha = (u.providerData || []).some(p => p && p.providerId === 'password');
      h += `<div class="confirm"><p><b>Excluir a conta</b> apaga para sempre a conta, o progresso dela na nuvem e a cópia dela neste aparelho. Baixe seus dados antes, se quiser guardar. Isso não pode ser desfeito.</p>
        ${senha ? '<div class="field"><label for="conta-senha">Sua senha</label><input type="password" id="conta-senha" autocomplete="current-password"></div>' : '<p class="small" style="margin:0">Você vai confirmar com o Google.</p>'}
        <div class="field"><label for="conta-confirma">Digite EXCLUIR para confirmar</label><input id="conta-confirma" autocomplete="off"></div>
        <button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="contaexcluirok">Excluir a conta</button></div>`;
    } else h += `<div class="row"><button class="btn" data-a="contasair">Sair desta conta</button><button class="btn ghost" data-a="contaexcluir">Excluir minha conta</button></div>`;
    if (contaUI.msg) h += `<p class="small" role="status" style="margin:0">${esc(contaUI.msg)}</p>`;
    return h + '</section>';
  }
  /* Bloco "Seus dados" em Plano › Dados: baixar, consultar e apagar o que este aparelho guarda. */
  function blocoDados() {
    const outras = contasGuardadas().length, pendentes = contasGuardadas().filter(id => !sincronizadoDe(id)).length;
    let h = `<div class="aphead">Seus dados</div><div class="row"><button class="btn" data-a="dadosbaixar">Baixar meus dados</button><button class="btn" data-a="dadosver">O que está guardado</button><button class="btn ghost" data-a="dadosapagar">Apagar os dados deste aparelho</button></div>`;
    if (pedindo === 'dadosver') {
      h += `<ul class="small" style="margin:0"><li>Neste aparelho, ${identidade ? 'nesta conta' : 'sem conta'}: ${resumoProg(S)}${S.cfg.nome ? ', o nome do certificado' : ''} e a configuração do plano.</li>${recuperar ? '<li>Uma cópia de recuperação de um progresso que não pôde ser aberto.</li>' : ''}${lerBase() ? '<li>Uma cópia da última sincronização com a nuvem (para unir o estudo feito em outros aparelhos).</li>' : ''}${outras ? `<li>Progresso de ${plural(outras, 'outra conta', 'outras contas')} que já entraram neste aparelho (não aparece aqui).</li>` : ''}${identidade && !identidade.indexOf('firebase:') ? '<li>Na nuvem (Firebase): o seu login (e-mail) e um documento só com o progresso e a data da última gravação.</li>' : ''}</ul>`;
    } else if (pedindo === 'dadosapagar') {
      const bloq = identidade && !sincronizado() && !nuvem.apagado; // nuvem apagada a pedido: a cópia daqui é a última
      h += `<div class="confirm"><p>${nuvem.apagado && !bloq ? 'Esta é a última cópia do progresso desta conta (a da nuvem foi apagada). ' : ''}${bloq ? (nuvem.semTrava ? 'Não dá para apagar agora: neste ambiente a nuvem não tem a trava que garante que ela guardou tudo, então a cópia deste aparelho é necessária. Baixe seus dados, se precisar.' : 'Não dá para apagar agora: parte do progresso desta conta ainda não está salva na nuvem e seria perdida. Conecte-se à internet e tente de novo, ou baixe seus dados antes.') : `Apagar deste aparelho ${identidade ? 'o progresso desta conta (a nuvem continua com ele)' : 'todo o progresso feito sem conta, incluindo o nome e a configuração do plano'}? Isso não pode ser desfeito.`}</p><button class="btn sm" data-a="cancelar">Cancelar</button>${bloq ? '' : '<button class="btn sm pri" data-a="dadosapagarok">Apagar deste aparelho</button>'}${!identidade && outras ? `<button class="btn sm" data-a="dadosapagartudo">Apagar também ${plural(outras, 'a outra conta guardada', 'as outras contas guardadas')} aqui</button>${pendentes ? `<p class="small" style="margin:0;flex-basis:100%">${plural(pendentes, 'conta tem', 'contas têm')} progresso que a nuvem ainda não confirmou e não ${pendentes === 1 ? 'será apagada' : 'serão apagadas'}: entre nela para enviá-lo.</p>` : ''}` : ''}</div>`;
    }
    return h + blocoNuvemClaude();
  }
  function baixarDados() {
    const dados = { app: 'Missão EEAR', geradoEm: new Date().toISOString(), conta: identidade ? { tipo: identidade.split(':')[0], email: (conta.user && conta.user.email) || null } : null, progresso: S, copiaDeRecuperacao: recuperar };
    if (window.EEAR_APK) { pedindo = 'exp'; render(); return; } // no app Android não há download de arquivo: mostra o código para copiar
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }));
    a.download = 'missao-eear-meus-dados-' + hoje() + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  async function sairConta(apagar) {
    if (!conta.api || contaUI.ocupado) return;
    const id = identidade;
    if (apagar && !sincronizado()) { contaUI.msg = 'Parte do progresso ainda não está na nuvem: nada foi apagado.'; pedindo = null; render(); return; }
    contaUI.ocupado = true;
    try {
      await conta.api.au.signOut(conta.api.auth);
      usarIdentidade('');
      if (apagar) apagarLocal(id);
      contaUI.msg = apagar ? 'Você saiu. O progresso da conta foi apagado deste aparelho e continua na nuvem.' : 'Você saiu. O progresso da conta continua neste aparelho, guardado à parte, e na nuvem.';
    } catch (e) { contaUI.msg = 'Não foi possível sair agora. Nada foi apagado.'; }
    contaUI.ocupado = false; pedindo = null; render();
  }
  async function excluirConta() {
    const api = conta.api, u = api && api.auth.currentUser, val = id => ((document.getElementById(id) || {}).value || '').trim();
    if (!u || contaUI.ocupado) return;
    if (val('conta-confirma') !== 'EXCLUIR') { contaUI.msg = 'Digite EXCLUIR para confirmar. Nada foi excluído.'; render(); return; }
    contaUI.ocupado = true;
    const id = identidade, { au, fs } = api;
    let passo = 'confirmar';
    try {
      if ((u.providerData || []).some(p => p && p.providerId === 'password')) await au.reauthenticateWithCredential(u, au.EmailAuthProvider.credential(u.email, (document.getElementById('conta-senha') || {}).value || ''));
      else await au.reauthenticateWithPopup(u, new au.GoogleAuthProvider());
      passo = 'nuvem'; nuvem.ref = null; clearTimeout(tSave);
      await fs.deleteDoc(fs.doc(api.db, 'alunos', u.uid));
      passo = 'conta';
      await au.deleteUser(u);
      usarIdentidade(''); apagarLocal(id);
      contaUI.msg = 'Sua conta, o progresso dela na nuvem e a cópia dela neste aparelho foram excluídos.';
      pedindo = null;
    } catch (e) {
      contaUI.msg = passo === 'confirmar' ? 'Não foi possível confirmar sua identidade (senha incorreta ou janela fechada). Nada foi excluído.'
        : passo === 'nuvem' ? 'Não foi possível apagar o progresso na nuvem agora. Nada foi excluído.'
          : 'O progresso na nuvem foi apagado, mas a conta não pôde ser excluída agora. A cópia deste aparelho continua aqui. Tente de novo.';
    }
    contaUI.ocupado = false; render();
  }
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-a]');
    if (!b) return;
    switch (b.dataset.a) {
      case 'contalevar': { const a = novidadeSemConta(); if (a) { S = unirImportacao(a); salvar(); contaUI.msg = 'O progresso feito sem conta foi levado para esta conta. Ele continua guardado também sem conta neste aparelho.'; } render(); break; }
      case 'contaadiar': contaUI.adiado = true; render(); break;
      case 'contasair': contaUI.msg = ''; pedindo = 'sair'; render(); break;
      case 'contasairmanter': sairConta(false); break;
      case 'contasairapagar': sairConta(true); break;
      case 'contaexcluir': contaUI.msg = ''; pedindo = 'excluirconta'; render(); break;
      case 'contaexcluirok': excluirConta(); break;
      case 'dadosbaixar': baixarDados(); break;
      case 'dadosver': pedindo = pedindo === 'dadosver' ? null : 'dadosver'; render(); break;
      case 'dadosapagar': pedindo = 'dadosapagar'; render(); break;
      case 'dadosapagarok': if (identidade && !sincronizado()) break; apagarLocal(identidade); pedindo = null; msgDados = 'Os dados deste aparelho foram apagados.'; render(); break;
      case 'dadosapagartudo': { // só as contas cuja nuvem já tem tudo: o estudo não enviado de outra conta não é apagado
        if (identidade) break;
        const ficam = contasGuardadas().filter(id => !sincronizadoDe(id));
        contasGuardadas().filter(id => !ficam.includes(id)).forEach(apagarLocal); apagarLocal(''); pedindo = null;
        msgDados = ficam.length ? `Os dados deste aparelho foram apagados, menos ${ficam.length === 1 ? 'a cópia de uma conta' : 'as cópias de ' + ficam.length + ' contas'} com progresso que a nuvem ainda não confirmou. Entre nessa conta para enviá-lo.` : 'Os dados deste aparelho foram apagados, de todas as contas.';
        render(); break;
      }
      default: break;
    }
  });
