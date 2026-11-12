  /* ---------- eventos ---------- */
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-a]');
    if (!el || el.disabled) return;
    const d = el.dataset;
    switch (d.a) {
      case 'tab':
        try { localStorage.setItem(LS_ABA, d.v); } catch (e) { /* ignora */ }
        go(d.v); break;
      case 'go': go(d.v); break;
      case 'mat': go('materias', { s: d.s }); break;
      case 'mod': if (!MOD[d.id] || !moduloAtivo(MOD[d.id])) break; if (S.ultAula !== d.id) { S.ultAula = d.id; salvar(); } go('modulo', { id: d.id, aba: 'aula' }); break;
      case 'aba':
        if (d.aba === 'teoria') marcarLido(V.id);
        if (d.aba === 'ex' && MOD[V.id]) { const a = S.aula[V.id] = S.aula[V.id] || {}; if (!a.e) { a.e = hoje(); salvar(); } }
        V.aba = d.aba; render(); window.scrollTo(0, 0); break;
      case 'play': case 'vsel': {
        /* toca o vídeo no player da aula; trocar de vídeo não redesenha a tela */
        const m = MOD[V.id], v = m && (VA[m.id] || []).find(x => x.id === d.vid);
        const pl = document.getElementById('player');
        if (!v || !pl) break;
        pl.innerHTML = iframeVideo(v);
        const cr = document.getElementById('cred'); if (cr) cr.innerHTML = creditoVideo(v);
        document.querySelectorAll('.vrow[data-vid]').forEach(b => { const on = b.dataset.vid === v.id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
        if (!el.closest('#player')) pl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        marcarAssistido(m.id);
        break;
      }
      case 'vext': if (MOD[d.id]) marcarAssistido(d.id); break;
      case 'apligar': S.cfg.apostila = true; salvar(); render(); break;
      case 'comecar': { const n = document.getElementById('ini-nome'); S.cfg.nome = ((n && n.value) || '').trim().slice(0, 80); salvar(); go('hoje'); break; }
      case 'cert': V.editNome = false; go('cert', { s: d.s, i: d.i != null && d.i !== '' ? Number(d.i) : null }); break;
      case 'certnome': { const n = document.getElementById('cert-nome'); const v = ((n && n.value) || '').trim().slice(0, 80); if (!v) { if (n) n.focus(); break; } S.cfg.nome = v; V.editNome = false; registrarCerts(S); salvar(); render(); break; }
      case 'certnomeedit': V.editNome = true; render(); break;
      case 'imprimir': try { window.print(); } catch (e) { /* sem impressão neste aparelho */ } break;
      case 'compartilhar': {
        const url = location.origin + location.pathname, txt = 'Curso grátis para o CFS da EEAR: aulas com vídeo, quizzes, simulados e provas oficiais.';
        const fim = ok => { msgDados = ok ? 'Link copiado. É só colar na conversa.' : 'Copie o endereço do site na barra do navegador.'; render(); };
        if (navigator.share) navigator.share({ title: 'Missão EEAR', text: txt, url }).catch(() => {});
        else try { navigator.clipboard.writeText(url).then(() => fim(true), () => fim(false)); } catch (e) { fim(false); }
        break;
      }
      case 'oficiaismod': { const m = MOD[d.id], ids = shuffle((OFI[m.id] || []).slice()).slice(0, 20); if (ids.length) iniciarQuiz(ids, 'Provas anteriores: ' + m.t, { tipo: 'oficial', id: m.id }); break; }
      case 'quizmod': { const m = MOD[d.id]; iniciarQuiz(m.q.map((_, i) => m.id + '-' + i), m.t, { tipo: 'mod', id: m.id, rev: d.rev || null }); break; }
      case 'qresp': {
        const z = QZ, id = z.ids[z.i], pos = Number(d.p);
        if (z.resp[id] !== undefined) return;
        z.resp[id] = pos;
        const ok = acertou(id, z.perms[id], pos);
        if (!ok) S.erros[id] = (S.erros[id] || 0) + 1;
        else if (z.origem.tipo === 'erros') delete S.erros[id];
        salvar(); render(); break;
      }
      case 'qprox': if (QZ.i + 1 < QZ.ids.length) QZ.i++; else fecharQuiz(); render(); window.scrollTo(0, 0); break;
      case 'sairquiz': { const o = QZ && QZ.origem; QZ = null; if (o && (o.tipo === 'mod' || o.tipo === 'oficial')) go('modulo', { id: o.id, aba: o.tipo === 'mod' ? 'quiz' : 'prov' }); else go('treino'); break; }
      case 'marcar': if (S.feito[d.k]) delete S.feito[d.k]; else { S.feito[d.k] = true; marcarAtividade(); } salvar(); render(); break;
      case 'fcini': { const ids = devidos(d.s || null).map(c => c.id); if (ids.length) iniciarFC(ids, d.s ? MATS[d.s].curto : 'revisão do dia'); break; }
      case 'fcmod': { const m = MOD[d.id]; marcarLido(m.id); iniciarFC(m.fc.map((_, i) => m.id + '~' + i), m.id); break; }
      case 'fcvirar': FC.virado = true; render(); mostrarVerso(); break;
      case 'fcaval': {
        const id = FC.fila[FC.i], ok = d.ok === '1';
        avaliar(id, ok);
        if (ok) FC.ok++; else { FC.err++; if (!FC.rep[id]) { FC.rep[id] = 1; FC.fila.push(id); } }
        FC.i++; FC.virado = false; salvar(); render(); window.scrollTo(0, 0); break;
      }
      case 'errosini': {
        let ids = Object.keys(S.erros).filter(id => Q[id] && (!d.s || Q[id].m === d.s));
        ids = shuffle(ids).slice(0, 20);
        if (ids.length) iniciarQuiz(ids, 'Caderno de erros', { tipo: 'erros' });
        break;
      }
      case 'simini': if (!S.ativo) iniciarSim(d.tipo, d.s); else go('sim'); break;
      case 'simresp': { const a = S.ativo, id = a.ids[a.i]; a.resp[id] = Number(d.p); salvar(); render(); break; }
      case 'simnav': { const a = S.ativo; a.i = Math.max(0, Math.min(a.ids.length - 1, a.i + Number(d.d))); pedindo = null; salvar(); render(); window.scrollTo(0, 0); break; }
      case 'simir': S.ativo.i = Number(d.i); mapa = false; salvar(); render(); window.scrollTo(0, 0); break;
      case 'simmarc': { const a = S.ativo, id = a.ids[a.i]; if (a.marc[id]) delete a.marc[id]; else a.marc[id] = 1; salvar(); render(); break; }
      case 'simmapa': mapa = !mapa; render(); break;
      case 'entregar': pedindo = 'entregar'; render(); window.scrollTo(0, 0); break;
      case 'entregarok': pedindo = null; entregar(); break;
      case 'descartar': pedindo = 'descartar'; render(); break;
      case 'descartarok': S.ativo = null; pedindo = null; salvar(); go('simulados'); break;
      case 'cancelar': pedindo = null; render(); break;
      case 'replanejar': {
        S.cfg.inicio = hoje();
        S.cfg.excl = modulosAtivos().filter(m => ((S.mod[m.id] || {}).best || 0) >= META).map(m => m.id);
        salvar(); go('plano'); break;
      }
      case 'aplivro': V.l = d.l; render(); break;
      case 'apmat': V.s = d.s; render(); break;
      case 'apset': {
        const st = APS[d.id];
        if (!st) break;
        const de = d.de || (V.v === 'hoje' || V.v === 'plano' ? 'hoje' : V.v === 'simulados' ? 'sim' : V.v === 'treino' ? 'treino' : 'ap');
        go('apset', { id: d.id, de, mod: de === 'mod' ? V.id : null, l: st.l, s: st.m });
        break;
      }
      case 'apvolta': {
        if (V.v === 'appags' && V.volta) { const b = V.volta; go(b.v, b); break; }
        if (V.v === 'apset' && V.de === 'mod' && MOD[V.mod]) { go('modulo', { id: V.mod, aba: 'ap' }); break; }
        if (V.v === 'apset' && V.de === 'hoje') { go('hoje'); break; }
        if (V.v === 'apset' && V.de === 'sim') { go('simulados'); break; }
        if (V.v === 'apset' && V.de === 'treino') { go('treino'); break; }
        go('apostila', { l: V.l, s: V.s });
        break;
      }
      case 'apm': {
        const st = APS[V.id];
        if (!st) break;
        const r = apRegistro(st.id);
        if (r.ok[d.k] !== undefined) break;
        if (r.r[d.k] === d.l) delete r.r[d.k]; else r.r[d.k] = d.l;
        V.qk = d.k;
        if (d.bar && r.r[d.k]) {
          /* Na barra, marcar já leva para a próxima questão ainda aberta. */
          const its = apItens(st), at = its.findIndex(x => x.k === d.k);
          const nx = its.slice(at + 1).find(x => r.ok[x.k] === undefined);
          if (nx) V.qk = nx.k;
        }
        salvar(); render(); break;
      }
      case 'apqi': {
        const st = APS[V.id], its = apItens(st), at = its.findIndex(x => x.k === V.qk);
        const nx = its[Math.max(0, Math.min(its.length - 1, at + Number(d.d)))];
        if (nx) V.qk = nx.k;
        render(); break;
      }
      case 'apfolha': { const f = document.getElementById('folha'); if (f) f.scrollIntoView({ block: 'start' }); break; }
      case 'apcorr': {
        const st = APS[V.id];
        if (!st) break;
        const r = apRegistro(st.id), antes = apEst(st.id).fim;
        st.itens.forEach(x => { if (x.g === '*' || !r.r[x.k] || r.ok[x.k] !== undefined) return; r.ok[x.k] = (x.g === 'X' || r.r[x.k] === x.g) ? 1 : 0; });
        const e = apEst(st.id);
        if (e.fim && !antes) { r.tent = (r.tent || 0) + 1; r.ult = e.nota; if (r.prim == null) r.prim = e.nota; r.best = Math.max(r.best || 0, e.nota); }
        r.quando = hoje();
        marcarAtividade(); salvar(); render();
        const f = document.getElementById('folha'); if (f) f.scrollIntoView({ block: 'start' });
        break;
      }
      case 'aperr': {
        const st = APS[V.id], r = apRegistro(st.id);
        let pri = null;
        apItens(st).forEach(x => { if (r.ok[x.k] === 0) { delete r.ok[x.k]; delete r.r[x.k]; if (!pri) pri = x.k; } });
        V.qk = pri; salvar(); render(); break;
      }
      case 'aplimpar': pedindo = 'aplimpar'; render(); break;
      case 'aplimparok': { const r = apRegistro(V.id); r.r = {}; r.ok = {}; V.qk = null; pedindo = null; salvar(); render(); break; }
      case 'apmais': V.mais = (V.mais || 0) + 1; render(); break;
      case 'appags': go('appags', { part: d.part, p: Number(d.p) || 1, volta: V.v === 'appags' ? V.volta : Object.assign({}, V) }); break;
      case 'appnav': V.p = Math.max(1, Number(d.p)); render(); window.scrollTo(0, 0); break;
      case 'qzoom': el.classList.toggle('zoom'); break;
      case 'pgzoom': { const b = el.closest('.pgbox'); if (b) b.classList.toggle('zoom'); break; }
      case 'fbgoogle': case 'fbentrar': case 'fbcriar': case 'fbsenha': case 'fbsair': acaoConta(d.a); break;
      case 'zerar': pedindo = 'zerar'; render(); break;
      case 'expcopiar': {
        const txt = JSON.stringify(S);
        const ok = () => { msgDados = 'Código copiado. Cole no outro aparelho em Plano › Dados › Colar progresso.'; pedindo = null; render(); };
        const falha = () => { msgDados = ''; pedindo = 'exp'; render(); const t = document.getElementById('exp-txt'); if (t) { t.focus(); t.select(); } };
        try { navigator.clipboard.writeText(txt).then(ok, falha); } catch (e) { falha(); }
        break;
      }
      case 'reccopiar': {
        const ok = () => { msgRec = 'Cópia copiada.'; pedindo = null; render(); };
        const falha = () => { pedindo = 'rec'; render(); const t = document.getElementById('rec-txt'); if (t) { t.focus(); t.select(); } };
        try { navigator.clipboard.writeText(recuperar).then(ok, falha); } catch (e) { falha(); }
        break;
      }
      case 'recdescartar': descartarRecuperacao(); break;
      case 'impabrir': msgDados = ''; pedindo = 'imp'; render(); { const t = document.getElementById('imp-txt'); if (t) t.focus(); } break;
      case 'impok': {
        const t = document.getElementById('imp-txt');
        let o = null;
        try { o = JSON.parse((t && t.value || '').trim()); } catch (e) { o = null; }
        if (!o || o.v !== 1) { msgDados = 'Esse código não é um progresso do Missão EEAR. Copie de novo no outro aparelho.'; render(); break; }
        // Importar acrescenta estudo; ausência no código antigo não é uma ordem de apagar progresso novo.
        const local = opCopiar(S), colado = mesclar(o);
        if (colado.cfg._ops && !opValida(colado.cfg._ops)) { quarentenar(JSON.stringify(o), identidade, 'importacao'); msgDados = 'O código usa operações incompatíveis ou ilegíveis. A cópia foi preservada para recuperação; nenhum progresso foi substituído.'; render(); break; }
        const conhecida = opValida(colado.cfg._ops) && mesmoConteudo(opPlano(colado), opPlano(opEstado(colado.cfg._ops)));
        const importado = conhecida ? opMeta(colado) : opVazio();
        const combinado = conhecida ? opCombinarEstados(S, colado) : S;
        loc.meta = opMeta(combinado); loc.vista = opCopiar(combinado);
        const l = opSemMeta(combinado), c = opSemMeta(colado); delete l.cfg.certsZ; delete c.cfg.certsZ;
        S = unirProgresso(null, l, c).st;
        const certs = S.cfg.certs;
        S.cfg = Object.assign({}, colado.cfg, { certs });
        S.cfg.certsZ = Math.max(Number(local.cfg.certsZ) || 0, Number(colado.cfg.certsZ) || 0);
        juntarCerts(S.cfg, local.cfg, null); registrarCerts(S);
        pedindo = null; msgDados = 'Progresso importado sem apagar o estudo já guardado.'; salvar({ importado }); render();

        break;
      }
      case 'instalar': if (instalar) { const p = instalar; instalar = null; p.prompt(); p.userChoice.then(() => render(), () => render()); } break;
      case 'zerarok': { const cfg = S.cfg; S = novoEstado(); S.cfg = cfg; S.cfg.excl = []; S.cfg.certs = []; S.cfg.certsZ = Math.max(Date.now(), (Number(cfg.certsZ) || 0) + 1); delete S.cfg.fcv; delete S.cfg.fcAncora; pedindo = null; salvar(); go('hoje'); break; }
      default: break;
    }
  });
  function marcarLido(id) {
    const r = S.mod[id] = S.mod[id] || {};
    if (!r.lido) { r.lido = hoje(); salvar(); }
  }
  document.addEventListener('change', ev => {
    if (ev.target.id === 'ap-ir') { V.p = Number(ev.target.value) || 1; render(); window.scrollTo(0, 0); return; }
    const f = ev.target.closest('#cfg');
    if (!f) return;
    const c = S.cfg;
    const g = id => document.getElementById(id);
    c.modalidade = g('cfg-modalidade').value;
    c.alvo = g('cfg-alvo').value;
    const alvo = CAL.find(x => x.id === c.alvo);
    if (alvo) c.prova = alvo.d;
    else if (g('cfg-prova').value) c.prova = g('cfg-prova').value;
    if (g('cfg-inicio').value) c.inicio = g('cfg-inicio').value;
    c.horas = Number(g('cfg-horas').value) || 4;
    c.simDia = Number(g('cfg-sim').value);
    c.tempoSim = Number(g('cfg-tempo').value) || 260;
    c.dias = [0, 1, 2, 3, 4, 5, 6].filter(x => g('cfg-d' + x).checked);
    if (g('cfg-apostila')) c.apostila = g('cfg-apostila').checked;
    registrarCerts(S);  // a troca de modalidade pode liberar o certificado de Inglês da outra opção; nenhum registro sai
    salvar();
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
  });

  /* Mantém a tela atual (quiz, flashcards) quando uma nova versão da página é publicada. */
  const hot = window.claude && window.claude.hot;
  try { if (hot && typeof hot.snapshot === 'function') hot.snapshot(() => ({ V, QZ, FC, mapa })); } catch (e) { /* ignora */ }
  function iniciar(data) {
    if (data && data.V && data.V.v) { V = data.V; QZ = data.QZ || null; FC = data.FC || null; mapa = !!data.mapa; }
    render();
    conectar();
    contaIniciar();
  }
  if (hot && typeof hot.ready === 'function') hot.ready(iniciar); else iniciar((hot && hot.data) || {});
