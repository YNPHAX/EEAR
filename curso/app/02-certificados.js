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
