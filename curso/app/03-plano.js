  /* ---------- status ---------- */
  function estMod(id) {
    const r = S.mod[id];
    if (r && r.best != null) {
      if (r.best >= META) return { k: 'ok', txt: 'Dominado · ' + pct(r.best) };
      return { k: 'warn', txt: pct(r.best) + ' · refazer' };
    }
    if (r && r.lido) return { k: 'acc', txt: 'Em estudo' };
    return { k: '', txt: 'Novo' };
  }
  function progMat(s) {
    const ms = aulasDe(s);
    const dom = ms.filter(m => ((S.mod[m.id] || {}).best || 0) >= META).length;
    return { dom, tot: ms.length };
  }
  const nErros = s => Object.keys(S.erros).filter(id => Q[id] && (!Q[id].mod || moduloAtivo(MOD[Q[id].mod])) && (!s || Q[id].m === s)).length;
  function liberados() { return Object.values(CARDS).filter(c => moduloAtivo(MOD[c.mod]) && S.mod[c.mod] && (S.mod[c.mod].lido || S.mod[c.mod].tent)); }
  /* ---------- versão dos flashcards ----------
     Cada cartão é identificado pela aula e pela posição (POR02~1) e o progresso guarda [caixa, próxima data]. Quando o
     texto de um cartão muda de forma substancial, ele ganha uma versão (3º campo nos dados). O registro de qual versão o
     aluno já revisou fica em cfg.fcv[id] = [versão, data marcada]: dentro de cfg porque as versões antigas do app guardam
     os campos de cfg que não conhecem. As versões antigas regravam S.fc[id] = [caixa, data] ao revisar o texto antigo,
     sem saber da versão; por isso a data marcada é conferida: se S.fc[id][1] não é mais a data que esta versão gravou,
     outro app mexeu no cartão e a versão nova ainda não foi vista.
     Um cartão desatualizado volta à revisão sem apagar o histórico: vence na data original ou no dia âncora + 0 a 6 dias,
     o que vier antes. O dia âncora (cfg.fcAncora['AULA:versão']) é o primeiro dia em que o aluno estudou com a versão
     nova; até ele estudar, vale hoje e nada é gravado. */
  function fcDesvio(id) { let x = 2166136261; for (let i = 0; i < id.length; i++) { x ^= id.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x % 7; }
  function fcDesatualizado(id) {
    const c = CARDS[id], r = S.fc[id];
    if (!c || c.ver < 2 || !Array.isArray(r)) return false;
    const g = (S.cfg.fcv || {})[id];
    return !(Array.isArray(g) && g[0] >= c.ver && g[1] === r[1]);
  }
  const fcChave = c => c.mod + ':' + c.ver;
  function fcVence(id) {
    const r = S.fc[id];
    if (!fcDesatualizado(id)) return r[1];
    const a = (S.cfg.fcAncora || {})[fcChave(CARDS[id])];
    return Math.min(r[1], (dataValida(a) ? dnum(a) : HJ()) + fcDesvio(id));
  }
  /* Grava o dia âncora das versões novas ainda não revisadas: só quando o aluno estuda (chamado por salvar). */
  function fixarAncoras() {
    let ancora = S.cfg.fcAncora;
    Object.keys(S.fc).forEach(id => {
      if (!fcDesatualizado(id)) return;
      const k = fcChave(CARDS[id]);
      if (!ancora || !dataValida(ancora[k])) { ancora = S.cfg.fcAncora = Object.assign({}, ancora); ancora[k] = hoje(); }
    });
  }
  function devidos(s) { const hj = HJ(); return liberados().filter(c => (!s || c.m === s) && (!S.fc[c.id] || fcVence(c.id) <= hj)); }
  function avaliar(id, ok) {
    const hj = HJ(), st = S.fc[id] || [0, hj], c = CARDS[id];
    /* Versão nova de um cartão já estudado: recomeça perto do início (no máximo a caixa 2, ou seja, volta em até 7 dias). */
    const base = fcDesatualizado(id) ? Math.min(st[0], 2) : st[0];
    const b = ok ? Math.min(base + 1, INT.length - 1) : 0;
    S.fc[id] = [b, hj + (ok ? INT[b] : 1)];
    if (c && c.ver > 1) S.cfg.fcv = Object.assign({}, S.cfg.fcv, { [id]: [c.ver, S.fc[id][1]] });
  }
  function marcarAtividade() { const d = hoje(); S.act[d] = (S.act[d] || 0) + 1; }

  /* ---------- apostila: status e páginas ---------- */
  const MIN_Q = 2.5; /* minutos por questão da apostila no plano */
  function aulaTxt(a) {
    const p = String(a).split('-');
    if (p.length < 2) return 'Aula ' + a;
    return 'Aulas ' + p[0] + (Number(p[1]) - Number(p[0]) === 1 ? ' e ' : ' a ') + p[1];
  }
  function apSigla(s) {
    if (s.tipo === 'unit') return 'U' + s.aula;
    if (s.tipo === 'test') return 'T' + s.aula;
    if (s.tipo === 'exercises') return 'EX';
    if (s.tipo === 'adicionais') return 'AD';
    return 'A' + s.aula;
  }
  function apTitulo(s) {
    if (s.tipo === 'unit') return 'Unit ' + s.aula + (s.tema ? ': ' + s.tema : '');
    if (s.tipo === 'sala' || s.tipo === 'casa') return aulaTxt(s.aula) + ' · ' + s.t;
    return s.t;
  }
  const apTipo = s => s.tipo === 'sala' ? 'Exercícios em sala' : s.tipo === 'casa' ? 'Exercícios para casa' : s.tipo === 'adicionais' ? 'Exercícios adicionais' : s.tipo === 'unit' ? 'Unit completa' : s.tipo === 'test' ? (/prova/i.test(s.t) ? 'Prova real da EEAR' : 'Test') : 'Exercícios extras';
  function apEst(id) {
    const s = APS[id], r = S.ap[id], ok = (r && r.ok) || {};
    let feitas = 0, certas = 0;
    s.itens.forEach(x => { if (x.g === '*' || ok[x.k] === undefined) return; feitas++; if (ok[x.k] === 1) certas++; });
    return { feitas, certas, total: s.nmc, fim: s.nmc > 0 && feitas === s.nmc, nota: s.nmc ? certas / s.nmc : 0 };
  }
  function apChip(id) {
    const e = apEst(id), r = S.ap[id];
    if (e.fim) return `<span class="chip ${e.nota >= META ? 'ok' : 'warn'}">${pct(e.nota)}</span>`;
    if (e.feitas) return `<span class="chip acc">${e.feitas}/${e.total}</span>`;
    if (r && r.r && Object.keys(r.r).length) return '<span class="chip">em andamento</span>';
    return `<span class="chip">${e.total} questões</span>`;
  }
  /* Ciclo do plano: exercícios em sala e units no ciclo 1; para casa e provas reais no ciclo 2.
     Matéria sem exercícios em sala no livro (Português): os para casa vão para o ciclo 1. */
  const COM_SALA = new Set(AP.sets.filter(s => s.tipo === 'sala').map(s => s.l + s.m));
  const apCiclo = s => (s.tipo === 'sala' || s.tipo === 'unit' || ((s.tipo === 'casa' || s.tipo === 'adicionais') && !COM_SALA.has(s.l + s.m))) ? 0 : 1;
  const apHoras = s => Math.max(0.25, Math.round(s.nmc * MIN_Q / 60 * 4) / 4);
  const nErrosAp = () => AP.sets.reduce((a, s) => { const r = S.ap[s.id]; return a + (r && r.ok ? Object.keys(r.ok).filter(k => r.ok[k] === 0).length : 0); }, 0);
  /* A aba Apostila é para quem tem as apostilas do curso: no site ela começa escondida para quem ainda não usou. */
  const apVisivel = () => AP.sets.length > 0 && (S.cfg.apostila != null ? !!S.cfg.apostila : (!window.EEAR_SITE || Object.keys(S.ap).length > 0));
  const PG_TIRA = AP.porTira || 4;
  /* Na versão pública (site e app) as páginas das apostilas não vão junto: a folha de respostas indica a página do PDF. */
  const AP_PAG = AP.paginas !== false;
  const apPdf = part => { const x = AP.partes[part] || {}; return LIVRO[x.livro] ? `${LIVRO[x.livro].nome} · ${MATS[x.m].curto}${x.parte ? ' · parte ' + x.parte : ''}` : ''; };
  const apCarregadas = new Set();
  function pgHtml(part, p) {
    const n = (AP.partes[part] || {}).n || 0;
    if (p < 1 || p > n) return '';
    const c = Math.floor((p - 1) / PG_TIRA), i = (p - 1) % PG_TIRA, cnt = Math.min(PG_TIRA, n - c * PG_TIRA);
    const url = (AP.dir || 'ap/') + part + '_' + pad(c) + '.webp', pos = cnt > 1 ? (i / (cnt - 1)) * 100 : 0;
    const bg = apCarregadas.has(url) ? `background-image:url(${url});` : '';
    return `<figure class="pgbox"><div class="pg" data-a="pgzoom" ${bg ? '' : `data-bg="${url}"`} style="${bg}background-size:100% ${cnt * 100}%;background-position:0 ${pos}%" role="img" aria-label="Página ${p} da apostila"></div><figcaption class="small muted num">pág. ${p} do PDF</figcaption></figure>`;
  }
  let io = null;
  function lazyPaginas() {
    if (io) { io.disconnect(); io = null; }
    const els = app.querySelectorAll('.pg[data-bg]');
    if (!els.length) return;
    const carregar = el => { const u = el.dataset.bg; el.style.backgroundImage = `url(${u})`; apCarregadas.add(u); el.removeAttribute('data-bg'); };
    if (!('IntersectionObserver' in window)) { els.forEach(carregar); return; }
    io = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) { carregar(en.target); io.unobserve(en.target); } }), { rootMargin: '900px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------- gerador do plano ---------- */
  let PL = null, PLK = '';
  function plano() { const k = JSON.stringify([S.cfg, S.diag, apVisivel()]); if (k !== PLK) { PL = gerarPlano(); PLK = k; } return PL; }
  function pesos() {
    const w = {};
    ORD.forEach(s => {
      let x = 1;
      if (S.diag && typeof S.diag[s] === 'number') x = Math.max(0.6, Math.min(1.6, 1 + (0.75 - S.diag[s]) * 1.2));
      w[s] = x;
    });
    return w;
  }
  function gerarPlano() {
    const c = S.cfg, av = [];
    const ini = dnum(c.inicio), prova = dnum(c.prova), fim = prova - 1;
    if (isNaN(ini) || isNaN(prova)) return { dias: [], av: ['Preencha a data da prova e a data de início.'], res: null };
    if (fim < ini) return { dias: [], av: ['A data da prova precisa ser depois do início do plano.'], res: null };
    const est = [];
    for (let n = ini; n <= fim; n++) if (c.dias.indexOf(wday(n)) >= 0) est.push(n);
    /* Provas reais antes da prova alvo entram no plano como dia de prova. */
    const marcos = {};
    CAL.forEach(p => { const n = dnum(p.d); if (n > ini && n < prova) { marcos[n] = p; if (est.indexOf(n) < 0) est.push(n); } });
    est.sort((a, b) => a - b);
    if (!est.length) return { dias: [], av: ['Marque pelo menos um dia da semana para estudar.'], res: null };
    const H = Math.max(1, Number(c.horas) || 1), q4 = x => Math.round(x * 4) / 4;
    const tipo = {};
    let i = est.length - 1;
    if (est[i] === fim && est.length > 3) { tipo[est[i]] = 'vespera'; i--; }
    const nR = est.length >= 8 ? Math.max(2, Math.min(21, Math.round(est.length * 0.12))) : (est.length >= 4 ? 1 : 0);
    for (let k = 0; k < nR && i > 0; i--) { if (marcos[est[i]]) continue; tipo[est[i]] = 'revisao'; k++; }
    est.forEach((n, j) => {
      if (tipo[n]) return;
      if (marcos[n]) tipo[n] = 'marco';
      else tipo[n] = (j > 0 && wday(n) === Number(c.simDia)) ? 'simulado' : 'estudo';
    });
    const cap = Math.max(0.75, H - 0.5);
    const diag = !S.diag;
    const dEst = est.filter(n => tipo[n] === 'estudo');
    const capTot = dEst.reduce((a, n, j) => a + (j === 0 && diag ? Math.max(0, cap - 1.5) : cap), 0);
    const excl = new Set(c.excl || []);
    const ativos = modulosAtivos();
    const pend = ativos.filter(m => !excl.has(m.id));
    /* Exercícios da apostila: os em sala e as units entram no ciclo 1; os para casa e as provas reais, no ciclo 2. */
    const apOn = apVisivel();
    const apDo = (id, k) => apOn ? (APPLAN[id] || []).filter(sid => apCiclo(APS[sid]) === k) : [];
    const need = pend.reduce((a, m) => a + m.h + apDo(m.id, 0).reduce((b, sid) => b + apHoras(APS[sid]), 0), 0);
    const f = need ? Math.min(1, capTot / need) : 1;
    const retaFinal = f < 0.5;
    const porPeso = (a, b) => (b.peso - a.peso) || (a.n - b.n);
    /* Ciclo 1: teoria completa. Se sobrar tempo, ciclo 2 (revisão ativa de tudo) e ciclo 3 (o que mais cai). */
    const ciclos = [
      { pref: 'T', txt: '', mods: pend, fator: f, min: 0.5 },
      { pref: 'T2', txt: 'Ciclo 2 · revisão ativa: ', mods: ativos.slice().sort(porPeso), fator: 0.5, min: 0.75 },
      { pref: 'T3', txt: 'Ciclo 3 · o que mais cai: ', mods: ativos.filter(m => m.peso >= 2).sort(porPeso), fator: 0.3, min: 0.5 }
    ];
    const fila = {}, tot = {}, rest = {}, fimCiclo = [];
    let ci = -1;
    function carregar() {
      ci++;
      const cc = ciclos[ci];
      ORD.forEach(s => {
        let lista = cc.mods.filter(m => m.m === s);
        if (ci === 0 && retaFinal) lista = lista.slice().sort(porPeso);
        fila[s] = [];
        lista.forEach(m => {
          fila[s].push({ id: m.id, r: Math.max(cc.min, q4(m.h * cc.fator)), p: 0 });
          if (ci < 2) apDo(m.id, ci).forEach(sid => { const r = Math.max(0.25, q4(apHoras(APS[sid]) * (ci === 0 ? f : 1))); fila[s].push({ id: m.id, ap: sid, r, t0: r, p: 0 }); });
        });
        tot[s] = fila[s].reduce((a, x) => a + x.r, 0) || 1;
        rest[s] = tot[s];
      });
    }
    carregar();
    const w = pesos(), maxS = H >= 5 ? 3 : 2, revs = {};
    const sobra = () => ORD.some(s => fila[s].length);
    const avancar = () => { if (!sobra() && ci < ciclos.length - 1) carregar(); return sobra(); };
    function alocar(dia, left, mudarCiclo) {
      const usados = [];
      for (let g = 0; g < 30 && left >= 0.5; g++) {
        if (!sobra() && !(mudarCiclo && avancar())) break;
        const cc = ciclos[ci];
        const cand = ORD.filter(s => fila[s].length && (usados.indexOf(s) >= 0 || usados.length < maxS));
        if (!cand.length) break;
        const novos = cand.filter(s => usados.indexOf(s) < 0);
        const pool = (novos.length ? novos : cand).sort((a, b) => (rest[b] / tot[b]) * w[b] - (rest[a] / tot[a]) * w[a]);
        const s = pool[0], it = fila[s][0];
        const a = q4(Math.min(it.r, left));
        if (a < it.r && a < 0.5) break;
        if (it.ap) {
          const st = APS[it.ap], resto = q4(it.r - a);
          dia.tar.push({ k: 'A:' + it.ap + ':' + it.p, tipo: 'apost', set: it.ap, mod: it.id, h: a, ate: resto > 0 ? Math.round((1 - resto / it.t0) * 100) / 100 : 1, txt: 'Apostila ' + LIVRO[st.l].curto + ': ' + apTitulo(st) + (it.p ? ' (continuação)' : '') });
        } else dia.tar.push({ k: cc.pref + ':' + it.id + ':' + it.p, tipo: 'teoria', mod: it.id, h: a, txt: cc.txt + MOD[it.id].t + (it.p ? ' (continuação)' : '') });
        it.r = q4(it.r - a); rest[s] = q4(rest[s] - a); left = q4(left - a); it.p++;
        if (usados.indexOf(s) < 0) usados.push(s);
        if (it.r <= 0 && it.ap) {
          fila[s].shift();
          if (!sobra()) fimCiclo[ci] = dia.n;
        } else if (it.r <= 0) {
          fila[s].shift();
          if (ci === 0) {
            dia.tar.push({ k: 'Q:' + it.id, tipo: 'quiz', mod: it.id, txt: 'Quiz ' + it.id + ': ' + metaQuiz(MOD[it.id]) });
            (revs[dia.n + 7] = revs[dia.n + 7] || []).push(it.id);
          } else {
            dia.tar.push({ k: 'Q' + (ci + 1) + ':' + it.id, tipo: 'quiz2', mod: it.id, d: dia.d, txt: 'Refazer o quiz ' + it.id + ' e as questões de provas do tópico' });
          }
          if (!sobra()) fimCiclo[ci] = dia.n;
        }
      }
    }
    const dias = [];
    let nRev = 0;
    est.forEach((n, j) => {
      const t = tipo[n], dia = { n, d: dstr(n), tipo: t, tar: [] };
      if (t === 'estudo') {
        let left = cap;
        if (j === 0 && diag) { dia.tar.push({ k: 'D', tipo: 'diag', txt: 'Diagnóstico: 40 questões, 10 por matéria', h: 1.5 }); left = Math.max(0, cap - 1.5); }
        const antes = dia.tar.length;
        alocar(dia, left, true);
        if (dia.tar.length === antes && antes === 0) dia.tar.push({ k: 'R:' + dia.d, tipo: 'reforco', txt: 'Treino: caderno de erros, quizzes abaixo de 80% e questões de provas anteriores da matéria mais fraca', h: cap });
      } else if (t === 'simulado') {
        if (H >= 4) dia.tar.push({ k: 'S:' + dia.d, tipo: 'sim', txt: 'Simulado completo: 96 questões em ' + fh(c.tempoSim / 60), h: c.tempoSim / 60 });
        else dia.tar.push({ k: 'S:' + dia.d, tipo: 'simmat', txt: 'Simulado de uma matéria: 24 questões (comece pela mais fraca)', h: 1 });
        dia.tar.push({ k: 'C:' + dia.d, tipo: 'erros', txt: 'Correção: revisar cada erro no caderno de erros', h: 1 });
      } else if (t === 'marco') {
        const p = marcos[n];
        dia.tar.push({ k: 'M:' + p.id, tipo: 'marco', d: dia.d, txt: p.nome + ': se você estiver inscrito, faça a prova real. Se não, faça um simulado completo no mesmo horário, como teste de prova.' });
      } else if (t === 'revisao') {
        if (ci === 0 && sobra()) { av.push('Parte do conteúdo foi para os dias de revisão final. Aumente as horas por dia para recuperar essa folga.'); alocar(dia, cap, false); }
        else {
          if (nRev % 2 === 0 && H >= 3) dia.tar.push({ k: 'S:' + dia.d, tipo: 'sim', txt: 'Simulado completo de revisão (ou uma prova anterior oficial): 96 questões', h: c.tempoSim / 60 });
          else dia.tar.push({ k: 'S:' + dia.d, tipo: 'simmat', txt: 'Simulado da matéria mais fraca: 24 questões', h: 1 });
          dia.tar.push({ k: 'E:' + dia.d, tipo: 'erros', txt: 'Caderno de erros e quizzes abaixo de 80%', h: 1.5 });
          nRev++;
        }
      } else if (t === 'vespera') {
        dia.tar.push({ k: 'V', tipo: 'vespera', txt: 'Véspera: só 30 min de flashcards. Separe os documentos, confira o local da prova e durma cedo.' });
      }
      dias.push(dia);
    });
    Object.keys(revs).map(Number).sort((a, b) => a - b).forEach(n => {
      const dia = dias.find(d => d.n >= n && (d.tipo === 'estudo' || d.tipo === 'revisao'));
      if (!dia) return;
      revs[n].forEach(id => dia.tar.push({ k: 'RV:' + id, tipo: 'rev', mod: id, txt: 'Revisão de 7 dias: ' + MOD[id].t }));
    });
    if (f < 0.999) {
      const hd = Math.ceil(((need + (diag ? 1.5 : 0)) / Math.max(1, dEst.length) + 0.5) * 2) / 2;
      av.unshift(`Ritmo acelerado: com ${fh(H)} por dia, cada módulo recebe cerca de ${pct(f)} do tempo ideal. Para o ritmo ideal até ${fdata(prova)} seriam necessárias cerca de ${fh(hd)} por dia de estudo.`);
    }
    if (retaFinal) av.push('Modo reta final: com pouco tempo até a prova, os módulos de maior incidência vêm primeiro em cada matéria.');
    if (ci === 0 && sobra()) av.push('Alguns módulos não couberam até a prova. Aumente as horas por dia ou marque mais dias de estudo.');
    if (c.dias.indexOf(Number(c.simDia)) < 0) av.push('O dia do simulado semanal não é um dia de estudo marcado, então o plano ficou sem simulados semanais.');
    return { dias, av: Array.from(new Set(av)), res: { est: est.length, dEst: dEst.length, prova, ini, f, need, capTot, fimC: fimCiclo[0] || null, fimCiclo, marcos } };
  }
  function feita(t) {
    if (S.feito[t.k]) return true;
    if (t.tipo === 'quiz') return ((S.mod[t.mod] || {}).best || 0) >= META;
    if (t.tipo === 'quiz2') return ((S.mod[t.mod] || {}).quando || '') >= t.d;
    if (t.tipo === 'diag') return !!S.diag;
    if (t.tipo === 'sim' || t.tipo === 'simmat') { const d = t.k.slice(2); return S.sims.some(x => x.d === d && x.tipo !== 'diag'); }
    if (t.tipo === 'marco') return S.sims.some(x => x.d === t.d && (x.tipo === 'completo' || x.tipo === 'prova' || x.tipo === 'oficial'));
    if (t.tipo === 'apost') { const e = APS[t.set] ? apEst(t.set) : null; return !e || !e.total || e.feitas / e.total >= (t.ate || 1) - 0.001; }
    return false;
  }
  const AUTO = { quiz: 1, diag: 1, sim: 1, simmat: 1, apost: 1 };

