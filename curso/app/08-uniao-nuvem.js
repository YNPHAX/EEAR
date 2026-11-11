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
  function lerBaseBruta() { try { const t = localStorage.getItem(chave(BASE_K)); const o = t && JSON.parse(t); return o && o.conta === nuvem.conta && o.st && o.st.v === 1 ? o : null; } catch (e) { return null; } }
  function lerBase() { const o = lerBaseBruta(); return o ? mesclar(o.st) : null; }
  /* Época da base: a da nuvem quando esta base foi confirmada (veja "época da sincronização" abaixo). */
  function epocaBase() { const o = lerBaseBruta(); return o && typeof o.ep === 'string' ? o.ep : ''; }
  /* Gravação que a base representa (veja "linhagem das gravações" abaixo). */
  function idBase() { const o = lerBaseBruta(); return o && typeof o.id === 'string' ? o.id : ''; }
  function gravarBase(st, ep, id) { try { localStorage.setItem(chave(BASE_K), JSON.stringify({ conta: nuvem.conta, st, ep: ep || '', id: id || '' })); } catch (e) { /* sem espaço: a próxima união é sem base, sem apagar nada */ } }
  function uIgual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  /* Assinatura do documento da nuvem (sinc): resumo FNV-1a do conteúdo sem ela, em ordem fixa de chaves. Só esta versão
     do app grava assinado. Documento sem assinatura, ou com assinatura que não bate (uma versão antiga gravou por cima,
     ou mudou algo e manteve o campo), não serve de referência para apagar: a união é feita sem base. Não é proteção
     contra quem quer forjar; é detecção de gravação de outra versão. */
  function resumoDoc(o) {
    const t = JSON.stringify(canonico(o)); let h = 0x811c9dc5;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(36) + '.' + t.length.toString(36);
  }
  function semAssinatura(o) { const x = Object.assign({}, o); delete x.sinc; return x; }
  function assinar(o) { o.sinc = resumoDoc(semAssinatura(o)); return o; }
  function assinaturaOk(o) { return !!o && typeof o === 'object' && typeof o.sinc === 'string' && o.sinc === resumoDoc(semAssinatura(o)); }
  /* Época da sincronização (ep, dentro da assinatura). A assinatura diz só quem gravou o documento ATUAL; não diz se o
     histórico dele passou por uma gravação de versão antiga. Exemplo do defeito que isto corrige: a versão antiga grava
     por cima sem as marcações do aparelho B; o aparelho A une esse documento (sem base, sem apagar nada) e grava o
     resultado assinado; B via o documento assinado como sucessor da base dele, e as marcações que só ele tinha pareciam
     apagadas do outro lado: B as apagava também. Agora toda união com um documento que não foi gravado por esta versão
     (sem assinatura, assinatura que não bate, sem época) começa uma época nova, e a base de um aparelho só vale com a
     mesma época do documento da nuvem. Dentro de uma época, cada documento assinado descende de todas as bases dela:
     ou é uma união em três vias com uma base da mesma época, ou uma união sem base (que não apaga nada) com um documento
     da mesma época. Então o que falta na nuvem em relação à base foi apagado por um aparelho desta versão. Com época
     diferente, a união é sem base: nada deste aparelho é apagado (o preço: uma desmarcação feita antes pode voltar). */
  function novaEpoca() { return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  /* Linhagem das gravações (lin, dentro da assinatura): os identificadores das últimas gravações de que o documento
     descende, o mais novo no fim. A época não basta quando uma gravação deste app chega atrasada: o aparelho B grava
     com a trava, a resposta demora, a trava vence, o aparelho A lê o documento anterior, grava e confirma (a base de A
     passa a ser a gravação dele); depois a gravação de B chega e cobre a de A. O documento de B é assinado e da mesma
     época, mas não descende da base de A: o que A gravou parecia apagado do outro lado, e A apagava. Agora a base só vale
     se a gravação que ela representa está na linhagem do documento da nuvem; senão, a união é sem base e nada deste
     aparelho é apagado. Com mais de LIN_MAX gravações desde a base, ela também deixa de valer (sem apagar nada). */
  const LIN_MAX = 40;
  function novoIdGravacao() { return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function linhagem(o) { return o && Array.isArray(o.lin) ? o.lin.filter(x => typeof x === 'string') : []; }
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
  /* O que "outro" tem de novo desde a base (usado no "Zerar" e na cópia local apagada): itens novos ou mudados; contagens
     (atividade, caderno de erros, tentativas) só com o que foi somado depois da base; simulados novos. */
  function novidades(base, outro) {
    const novo = (bm, om) => { const o = {}; Object.keys(om || {}).forEach(k => { if (!uIgual((bm || {})[k], om[k])) o[k] = om[k]; }); return o; };
    const so = JSON.parse(JSON.stringify(outro));
    ['mod', 'fc', 'erros', 'feito', 'act', 'ap', 'aula'].forEach(k => { so[k] = novo(base[k], outro[k]); });
    so.sims = uSims(base.sims, outro.sims, []).filter(x => !base.sims.some(y => uIgual(x, y)));
    const delta = (m, bm) => Object.keys(m).forEach(k => { const d = uNum(m[k]) - uNum((bm || {})[k]); if (d > 0) m[k] = d; else delete m[k]; });
    delta(so.act, base.act); delta(so.erros, base.erros);
    ['mod', 'aula'].forEach(t => Object.keys(so[t]).forEach(k => { const r = so[t][k], b0 = (base[t] || {})[k]; if (r && b0 && typeof r === 'object' && 'tent' in r) r.tent = Math.max(0, uNum(r.tent) - uNum(b0.tent)); }));
    return so;
  }
  /* Contagens somadas pelo que cada lado fez desde a base, também quando os dois lados chegaram ao mesmo valor. */
  function somarContagens(u, B, l, c) {
    const soma = (b, x, y) => Math.max(0, uNum(x) + uNum(y) - uNum(b));
    Object.keys(u.act).forEach(k => { u.act[k] = Math.max(u.act[k], soma(B.act[k], l.act[k], c.act[k])); });
    Object.keys(u.erros).forEach(k => { if (l.erros[k] !== undefined && c.erros[k] !== undefined) u.erros[k] = Math.max(u.erros[k], soma(B.erros[k], l.erros[k], c.erros[k])); });
    ['mod', 'aula'].forEach(t => Object.keys(u[t]).forEach(k => { const r = u[t][k], x = l[t][k], y = c[t][k], b = (B[t] || {})[k]; if (r && x && y && b && typeof r === 'object' && typeof x === 'object' && typeof y === 'object' && typeof b === 'object' && 'tent' in r) r.tent = Math.max(uNum(r.tent), soma(b.tent, x.tent, y.tent)); }));
  }
  /* Une dois progressos já lidos por mesclar(). base: a última versão comum, ou null. Devolve { st, perdido }: perdido
     é o progresso que não pôde ser unido (só no caso do "Zerar" sem base), para virar cópia de recuperação. */
  /* opc.somar (só entre abas deste aparelho, 14-abas.js, onde a base é exata: a versão principal de que cada lado parte):
     contagens iguais nos dois lados são incrementos independentes e somam (duas abas indo de 18 para 19 dão 20). Na
     nuvem, a base pode estar atrasada (gravação ainda não confirmada) e o mesmo incremento aparece dos dois lados: lá,
     valor igual continua sendo a mesma mudança (F09). */
  function unirProgresso(base, l, c, opc) {
    const zl = uNum(l.cfg.certsZ), zc = uNum(c.cfg.certsZ), zb = base ? uNum(base.cfg.certsZ) : 0;
    /* "Zerar progresso" que este aparelho ainda não conhecia (ou o inverso): sem base, só dá para separar pelo horário. */
    if (!base && zc > zl && (l.t || 0) > zc) return { st: c, perdido: l };
    if (!base && zc > zl) return { st: c, perdido: null };
    if (!base && zl > zc && (c.t || 0) > zl) return { st: l, perdido: c };
    if (!base && zl > zc) return { st: l, perdido: null };
    /* Com base, o lado que zerou depois dela apaga só o que já existia na base; o que o outro lado estudou depois fica. */
    if (base && (zl > zb || zc > zb)) {
      const zerou = zc > zb ? c : l, outro = zerou === c ? l : c;
      const so = novidades(base, outro);
      so.cfg = Object.assign({}, zerou.cfg);
      /* Base vazia com a configuração de quem zerou (F08): a base não pode ser o próprio estado zerado, senão o que foi
         estudado depois do "Zerar" (presente nele e ausente do delta do outro lado) parecia apagado e sumia. */
      return unirProgresso(mesclar({ v: 1, t: 0, cfg: zerou.cfg }), zerou, so, opc);
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
    if (opc && opc.somar && tb) somarContagens(u, B, l, c);
    u.cfg.certs = (l.cfg.certs || []).slice();
    if (l.cfg.certsZ) u.cfg.certsZ = l.cfg.certsZ;
    juntarCerts(u.cfg, c.cfg, u);
    return { st: mesclar(u), perdido: null };
  }
