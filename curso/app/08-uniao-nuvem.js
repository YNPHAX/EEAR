  /* ---------- união do progresso entre aparelhos ----------
     A nuvem guardava o progresso inteiro do último aparelho que gravou: quem estudava offline em dois aparelhos perdia o
     que fez num deles. Agora cada sincronização une os dois lados em três vias. A base é a última versão que este
     aparelho e a nuvem tinham em comum; fica numa chave própria (missao-eear-v1-base), então o formato do progresso não
     muda e as versões antigas do app a ignoram. Para cada item: igual nos dois lados, fica; mudou só de um lado, vale a
     mudança; mudou dos dois lados, vale a regra do tipo de dado. Regra geral: a sincronização nunca apaga estudo.
       - aulas (mod), passos da aula (aula), simulados (sims) e atividade (act) só crescem: notas pela maior, tentativas e
         atividade somando o que cada lado fez desde a base, datas de conclusão pela mais antiga, simulados unidos;
       - flashcards (fc): se os dois lados revisaram o mesmo cartão, vale a revisão do lado gravado por último, e a versão
         vista (cfg.fcv) acompanha o cartão escolhido; um cartão nunca some por ausência do outro lado;
       - caderno de erros, tarefas marcadas e folhas da apostila aceitam apagamento (erro corrigido, tarefa desmarcada,
         folha limpa) só quando o outro lado não mexeu no item; erro corrigido de um lado e errado de novo do outro fica;
       - simulado em andamento: o deste aparelho; demais campos e configuração: o lado gravado por último;
       - certificados: juntarCerts, como antes; "Zerar progresso" (cfg.certsZ) vale para o que existia antes dele.
     Sem base (primeira sincronização deste aparelho), nada é tratado como apagado. Se for impossível separar o que veio
     antes e depois de um "Zerar" feito em outro aparelho, o progresso deste aparelho vira uma cópia de recuperação. */
  /* A base pertence a uma conta (nuvem.conta): se outra conta entrar neste aparelho, a base é ignorada (união sem base). */
  function lerBase() { try { const t = localStorage.getItem(chave(BASE_K)); const o = t && JSON.parse(t); return o && o.conta === nuvem.conta && o.st && o.st.v === 1 ? mesclar(o.st) : null; } catch (e) { return null; } }
  function gravarBase(st) { try { localStorage.setItem(chave(BASE_K), JSON.stringify({ conta: nuvem.conta, st })); } catch (e) { /* sem espaço: a próxima união é sem base, sem apagar nada */ } }
  function uIgual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  /* Valor de um item em três vias: SEM BASE (tb = false), qualquer diferença é conflito. */
  function uTres(tb, b, l, c, conflito) {
    if (uIgual(l, c)) return l;
    if (tb && uIgual(l, b)) return c;
    if (tb && uIgual(c, b)) return l;
    return conflito(l, c, b);
  }
  function uMapa(bm, lm, cm, conflito, apaga) {
    const tb = !!bm, out = {};
    [...new Set(Object.keys(lm || {}).concat(Object.keys(cm || {})))].sort().forEach(k => { // ordem fixa: os dois aparelhos chegam ao mesmo texto
      const b = tb ? bm[k] : undefined, l = (lm || {})[k], c = (cm || {})[k];
      /* Sem apagamento: um item que sumiu de um lado sem estar na base continua (a ausência não apaga estudo). */
      let v = uTres(tb, b, l, c, conflito);
      if (v === undefined && !apaga) v = l !== undefined ? l : c;
      if (v !== undefined) out[k] = v;
    });
    return out;
  }
  function uMin(a, b) { return dataValida(a) && dataValida(b) ? (a < b ? a : b) : dataValida(a) ? a : b; }
  function uNum(x) { return typeof x === 'number' && isFinite(x) ? x : 0; }
  /* Contagem que cada lado aumentou desde a base: base + (local − base) + (nuvem − base); sem base, a maior. */
  function uSoma(b, l, c, tb) { return tb ? Math.max(uNum(l), uNum(c), uNum(l) + uNum(c) - uNum(b)) : Math.max(uNum(l), uNum(c)); }
  function uAula(b, l, c, tb, novoL) { // registro de aula (mod) ou passos da aula (aula): só cresce
    if (!l || !c) return l || c;
    const r = Object.assign({}, novoL ? c : l, novoL ? l : c), bb = (tb && b) || {};
    if ('best' in l || 'best' in c) r.best = Math.max(uNum(l.best), uNum(c.best));
    if ('tent' in l || 'tent' in c) r.tent = uSoma(bb.tent, l.tent, c.tent, tb && !!b);
    ['lido', 'ok', 'v', 'e'].forEach(k => { const m = uMin(l[k], c[k]); if (dataValida(m)) r[k] = m; });
    return r;
  }
  function uSims(bs, ls, cs) { // simulados: une sem duplicar; o mesmo resultado nos dois lados conta uma vez (sem base, a maior contagem)
    const conta = a => a.reduce((m, x) => { const k = JSON.stringify(x); m[k] = (m[k] || 0) + 1; return m; }, {});
    const B = conta(bs || []), L = conta(ls), C = conta(cs), out = ls.slice();
    Object.keys(C).forEach(k => { const extra = (bs ? Math.max(L[k] || 0, (L[k] || 0) + C[k] - (B[k] || 0)) : Math.max(L[k] || 0, C[k])) - (L[k] || 0); for (let i = 0; i < extra; i++) out.push(JSON.parse(k)); });
    return out.map(x => [x, JSON.stringify(x)]).sort((a, b) => String(a[0].d).localeCompare(String(b[0].d)) || (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0)).map(x => x[0]);
  }
  function uApostila(b, l, c, tb, novoL) {
    if (!l || !c) return l || c;
    const r = Object.assign({}, novoL ? c : l, novoL ? l : c), bb = (tb && b) || {}, nv = (x, y) => (novoL ? x : y);
    ['r', 'ok'].forEach(k => { r[k] = uMapa(tb ? bb[k] || {} : null, l[k], c[k], (x, y) => (x === undefined ? y : y === undefined ? x : nv(x, y)), true); });
    r.tent = uSoma(bb.tent, l.tent, c.tent, tb && !!b);
    if ('best' in l || 'best' in c) r.best = Math.max(uNum(l.best), uNum(c.best));
    return r;
  }
  /* Une dois progressos já lidos por mesclar(). base: a última versão comum, ou null. Devolve { st, perdido }: perdido
     é o progresso que não pôde ser unido (só no caso do "Zerar" sem base), para virar cópia de recuperação. */
  function unirProgresso(base, l, c) {
    const zl = uNum(l.cfg.certsZ), zc = uNum(c.cfg.certsZ), zb = base ? uNum(base.cfg.certsZ) : 0;
    /* "Zerar progresso" que este aparelho ainda não conhecia (ou o inverso): sem base, só dá para separar pelo horário. */
    if (!base && zc > zl && (l.t || 0) > zc) return { st: c, perdido: l };
    if (!base && zc > zl) return { st: c, perdido: null };
    if (!base && zl > zc && (c.t || 0) > zl) return { st: l, perdido: c };
    if (!base && zl > zc) return { st: l, perdido: null };
    /* Com base, o lado que zerou depois dela apaga só o que já existia na base; o que o outro lado estudou depois fica. */
    if (base && (zl > zb || zc > zb)) {
      const zerou = zc > zb ? c : l, outro = zerou === c ? l : c;
      const novo = (bm, om) => { const o = {}; Object.keys(om || {}).forEach(k => { if (!uIgual((bm || {})[k], om[k])) o[k] = om[k]; }); return o; };
      const so = JSON.parse(JSON.stringify(outro));
      ['mod', 'fc', 'erros', 'feito', 'act', 'ap', 'aula'].forEach(k => { so[k] = novo(base[k], outro[k]); });
      so.sims = uSims(base.sims, outro.sims, []).filter(x => !base.sims.some(y => uIgual(x, y)));
      so.cfg = Object.assign({}, zerou.cfg);
      return unirProgresso(zerou, zerou, so);
    }
    const tb = !!base, B = base || {}, novoL = (l.t || 0) >= (c.t || 0), nv = (x, y) => (novoL ? x : y);
    const u = JSON.parse(JSON.stringify(novoL ? l : c));
    u.t = Math.max(l.t || 0, c.t || 0);
    u.mod = uMapa(tb ? B.mod : null, l.mod, c.mod, (x, y, b) => uAula(b, x, y, tb, novoL));
    u.aula = uMapa(tb ? B.aula : null, l.aula, c.aula, (x, y, b) => uAula(b, x, y, tb, novoL));
    u.act = uMapa(tb ? B.act : null, l.act, c.act, (x, y, b) => uSoma(b, x, y, tb));
    u.sims = uSims(tb ? B.sims : null, l.sims, c.sims);
    /* Flashcards: a revisão gravada por último vence; a versão vista acompanha o cartão escolhido. */
    const lado = {};
    u.fc = uMapa(tb ? B.fc : null, l.fc, c.fc, (x, y) => (x === undefined ? y : y === undefined ? x : nv(x, y)));
    Object.keys(u.fc).forEach(id => { lado[id] = uIgual(u.fc[id], l.fc[id]) ? l : c; });
    u.erros = uMapa(tb ? B.erros : null, l.erros, c.erros, (x, y, b) => (x === undefined ? y : y === undefined ? x : uSoma(b, x, y, tb)), true);
    u.feito = uMapa(tb ? B.feito : null, l.feito, c.feito, (x, y) => (x !== undefined ? x : y), true);
    u.ap = uMapa(tb ? B.ap : null, l.ap, c.ap, (x, y, b) => uApostila(b, x, y, tb, novoL));
    ['diag', 'ult', 'ultAula'].forEach(k => { u[k] = uTres(tb, B[k], l[k], c[k], (x, y) => (nv(x, y) != null ? nv(x, y) : nv(y, x))); });
    u.ativo = uTres(tb, B.ativo, l.ativo, c.ativo, (x, y) => (x != null ? x : y));
    /* Configuração: campo a campo; certificados, versões vistas e âncoras têm regra própria. */
    const ESP = ['certs', 'certsZ', 'fcv', 'fcAncora'], bc = (tb && B.cfg) || {};
    u.cfg = {};
    new Set(Object.keys(l.cfg).concat(Object.keys(c.cfg))).forEach(k => {
      if (ESP.includes(k)) return;
      const v = uTres(tb, bc[k], l.cfg[k], c.cfg[k], (x, y) => (nv(x, y) !== undefined ? nv(x, y) : nv(y, x)));
      if (v !== undefined) u.cfg[k] = v;
    });
    const fcv = {};
    Object.keys(u.fc).forEach(id => { const g = (lado[id].cfg.fcv || {})[id] || (l.cfg.fcv || {})[id] || (c.cfg.fcv || {})[id]; if (g) fcv[id] = g; });
    if (Object.keys(fcv).length) u.cfg.fcv = fcv;
    const anc = uMapa(tb ? bc.fcAncora || {} : null, l.cfg.fcAncora, c.cfg.fcAncora, (x, y) => uMin(x, y));
    if (Object.keys(anc).length) u.cfg.fcAncora = anc;
    u.cfg.certs = (l.cfg.certs || []).slice();
    if (l.cfg.certsZ) u.cfg.certsZ = l.cfg.certsZ;
    juntarCerts(u.cfg, c.cfg, u);
    return { st: mesclar(u), perdido: null };
  }
