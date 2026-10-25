/* Missão EEAR — app do curso (sem dependências). */
(function () {
  'use strict';

  const E = window.EEAR;
  const ORD = E.ordem, MATS = E.materias;
  const MODS = E.modulos.slice().sort((a, b) => ORD.indexOf(a.m) - ORD.indexOf(b.m) || a.n - b.n);
  const MOD = {};
  MODS.forEach(m => { MOD[m.id] = m; });
  const Q = {}, QS = { por: [], ing: [], mat: [], fis: [] };
  MODS.forEach(m => (m.q || []).forEach((q, i) => {
    const id = m.id + '-' + i;
    Q[id] = { id, mod: m.id, m: m.m, e: q[0], o: q[1], c: q[2], r: q[3] };
    QS[m.m].push(id);
  }));
  const CARDS = {};
  MODS.forEach(m => (m.fc || []).forEach((c, i) => {
    const id = m.id + '~' + i;
    CARDS[id] = { id, mod: m.id, m: m.m, f: c[0], v: c[1] };
  }));
  /* Provas anteriores oficiais: mantêm a ordem original das alternativas e o gabarito oficial. */
  const PROVAS = (E.provas || []).slice().sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  const PROVA = {}, QO = { por: [], ing: [], mat: [], fis: [] }, OFI = {};
  /* Questões em imagem: recorte fiel da prova original; o texto extraído fica oculto para busca e leitores de tela. */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const figura = (p, x) => `<img class="qimg" data-a="qzoom" title="Toque para ampliar" src="${p.dir || ''}${x.img}" width="${x.w}" height="${x.h}" alt="" loading="lazy" decoding="async"><span class="sr">${esc(x.alt || '')}</span>`;
  function textoProva(p, k) {
    const t = (p.textos || {})[k];
    if (!t) return '';
    return Array.isArray(t) ? `<div class="txt txtimg">${t.map(x => figura(p, x)).join('')}</div>` : t;
  }
  PROVAS.forEach(p => {
    PROVA[p.id] = p;
    p.ids = [];
    (p.q || []).forEach(q => {
      const id = 'P-' + p.id + '-' + q.n;
      const mod = q.mod && MOD[q.mod] ? q.mod : null;
      Q[id] = { id, mod, m: q.m, e: q.e || (q.img ? figura(p, q) : ''), o: q.o || ['', '', '', ''], img: !!q.img && !q.o, c: q.c, r: q.r || 'Gabarito oficial da EEAR.', src: p.nome + ' · questão ' + q.n, tx: q.t ? textoProva(p, q.t) : '', of: 1, anulada: !!q.anulada };
      p.ids.push(id);
      if (QO[q.m]) QO[q.m].push(id);
      if (mod) (OFI[mod] = OFI[mod] || []).push(id);
    });
  });
  const CAL = E.calendario || [];
  const VID = E.videos || {};
  /* Apostila: exercícios das apostilas do curso, corrigidos pelo gabarito impresso do livro. */
  const AP = E.apostila || { livros: [], partes: {}, sets: [] };
  const APS = {}, APMOD = {}, APPLAN = {};
  AP.sets.forEach(s => {
    APS[s.id] = s;
    s.itens = [];
    s.sec.forEach((sec, si) => { if (sec.g) sec.g.split('').forEach((g, i) => s.itens.push({ k: si + ':' + i, si, n: i + 1, g })); });
    s.nmc = s.itens.filter(x => x.g !== '*').length;
    s.mods = (s.mods || []).filter(id => MOD[id]);
    s.mods.forEach(id => (APMOD[id] = APMOD[id] || []).push(s.id));
    if (s.mods.length && s.nmc) (APPLAN[s.mods[0]] = APPLAN[s.mods[0]] || []).push(s.id);
  });
  const LIVRO = {};
  AP.livros.forEach(l => { LIVRO[l.id] = l; });

  const app = document.getElementById('app');
  const LETRAS = ['A', 'B', 'C', 'D'];
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const DIAS_L = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const META = 0.8;
  const INT = [0, 1, 3, 7, 14, 30, 60];

  /* ---------- datas ---------- */
  const pad = n => String(n).padStart(2, '0');
  function hoje() { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dnum(s) {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return NaN;
    const p = s.split('-').map(Number);
    return Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5);
  }
  function dstr(n) { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function wday(n) { return new Date(n * 864e5).getUTCDay(); }
  function fdata(n) { const d = new Date(n * 864e5); return pad(d.getUTCDate()) + '/' + pad(d.getUTCMonth() + 1); }
  function flonga(n) { const d = new Date(n * 864e5); return DIAS_L[d.getUTCDay()] + ', ' + d.getUTCDate() + ' de ' + MESES[d.getUTCMonth()]; }
  const HJ = () => dnum(hoje());

  /* ---------- utilidades ---------- */
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  const pct = x => Math.round(x * 100) + '%';
  const fh = h => { const t = Math.round(h * 60), H = Math.floor(t / 60), M = t % 60; return H ? H + 'h' + (M ? pad(M) : '') : M + ' min'; };
  const nota = x => (Math.round(x * 100) / 10).toFixed(1).replace('.', ',');
  const sig = s => `<span class="sigla c-${s}">${MATS[s].sigla}</span>`;
  const bolinhas = p => '●'.repeat(p) + '○'.repeat(3 - p);
  const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b);
  function amostraPeso(ids, n) {
    return ids.map(id => ({ id, k: Math.pow(Math.random(), 1 / (MOD[Q[id].mod].peso || 1)) }))
      .sort((a, b) => b.k - a.k).slice(0, n).map(x => x.id);
  }
  function amostraDiag(s, n) {
    const mods = MODS.filter(m => m.m === s && m.q && m.q.length)
      .map(m => ({ m, k: Math.pow(Math.random(), 1 / (m.peso || 1)) })).sort((a, b) => b.k - a.k).slice(0, n);
    return mods.map(x => x.m.id + '-' + Math.floor(Math.random() * x.m.q.length));
  }
  const permutar = ids => { const p = {}; ids.forEach(id => { p[id] = Q[id].of ? [0, 1, 2, 3] : shuffle([0, 1, 2, 3]); }); return p; };
  /* Questão anulada vale ponto para todos, mesmo sem resposta marcada. */
  const acertou = (id, perm, pos) => !!Q[id].anulada || (pos !== undefined && pos !== null && perm[pos] === Q[id].c);
  const rotulo = q => q.src || q.mod;
  const enun = q => (q.src ? `<div class="src">${q.src}</div>` : '') + (q.tx || '') + q.e;
  const yt = s => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(s);
  const CANAIS = {
    por: ['Professor Noslen', 'Português com Letícia'],
    ing: ['English in Brazil Carina Fragozo', 'Mairo Vergara inglês'],
    mat: ['Matemática Rio Rafael Procopio', 'Professor Ferretto matemática'],
    fis: ['Professor Boaro física', 'Professor Ferretto física']
  };

  /* ---------- estado e persistência ---------- */
  const LS = 'missao-eear-v1', LS_ABA = 'missao-eear-aba';
  function novoEstado() {
    return {
      v: 1, t: 0,
      cfg: { alvo: 'cfs1-2028', prova: '2027-05-30', inicio: hoje(), horas: 3, dias: [0, 1, 2, 3, 4, 5, 6], simDia: 0, tempoSim: 240, excl: [] },
      mod: {}, fc: {}, erros: {}, sims: [], diag: null, feito: {}, act: {}, ativo: null, ult: null, ap: {}
    };
  }
  function mesclar(o) {
    const b = novoEstado();
    Object.keys(b).forEach(k => { if (o && Object.prototype.hasOwnProperty.call(o, k)) b[k] = o[k]; });
    b.cfg = Object.assign(novoEstado().cfg, (o && o.cfg) || {});
    if (o && o.cfg && !o.cfg.alvo) {
      /* Estado da 1ª versão: a data padrão antiga vira a nova meta de 2027. */
      if (o.cfg.prova === '2026-11-22') { b.cfg.alvo = 'cfs1-2028'; b.cfg.prova = '2027-05-30'; }
      else { const p = CAL.find(x => x.d === o.cfg.prova); b.cfg.alvo = p ? p.id : 'outra'; }
    }
    ['mod', 'fc', 'erros', 'feito', 'act', 'ap'].forEach(k => { if (!b[k] || typeof b[k] !== 'object') b[k] = {}; });
    if (!Array.isArray(b.sims)) b.sims = [];
    return b;
  }
  let S = novoEstado();
  try { const t = localStorage.getItem(LS); if (t) { const o = JSON.parse(t); if (o && o.v === 1) S = mesclar(o); } } catch (e) { /* sem armazenamento local */ }

  const nuvem = { ref: null, on: false, busy: false, again: false };
  let tSave = null;
  function salvar() {
    S.t = Date.now();
    try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { /* ignora */ }
    clearTimeout(tSave);
    tSave = setTimeout(gravar, 1500);
  }
  async function gravar() {
    if (!nuvem.ref) return;
    if (nuvem.busy) { nuvem.again = true; return; }
    nuvem.busy = true;
    try { await nuvem.ref.set(JSON.parse(JSON.stringify(S))); nuvem.on = true; }
    catch (e) {
      if (e && e.code === 'unavailable') setTimeout(gravar, 2500 + Math.random() * 2500);
      else { nuvem.ref = null; nuvem.on = false; }
    }
    nuvem.busy = false;
    syncInfo();
    if (nuvem.again) { nuvem.again = false; gravar(); }
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
      const ref = db.doc('progresso/' + id);
      const snap = await ref.get();
      nuvem.ref = ref; nuvem.on = true;
      if (snap.exists) {
        const o = snap.data();
        if (o && o.v === 1 && (o.t || 0) > (S.t || 0)) {
          S = mesclar(JSON.parse(JSON.stringify(o)));
          try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { /* ignora */ }
          render();
        } else if (((o && o.t) || 0) < (S.t || 0)) gravar();
      } else if (S.t) gravar();
      syncInfo();
    } catch (e) { nuvem.ref = null; nuvem.on = false; syncInfo(); }
  }
  function syncInfo() {
    const el = document.getElementById('sync');
    if (el) el.textContent = nuvem.on ? 'Progresso salvo na sua conta.' : 'Progresso salvo neste aparelho.';
  }

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
    const ms = MODS.filter(m => m.m === s);
    const dom = ms.filter(m => ((S.mod[m.id] || {}).best || 0) >= META).length;
    return { dom, tot: ms.length };
  }
  const nErros = s => Object.keys(S.erros).filter(id => Q[id] && (!s || Q[id].m === s)).length;
  function liberados() { return Object.values(CARDS).filter(c => S.mod[c.mod] && (S.mod[c.mod].lido || S.mod[c.mod].tent)); }
  function devidos(s) { const hj = HJ(); return liberados().filter(c => (!s || c.m === s) && (!S.fc[c.id] || S.fc[c.id][1] <= hj)); }
  function avaliar(id, ok) {
    const hj = HJ(), st = S.fc[id] || [0, hj];
    const b = ok ? Math.min(st[0] + 1, INT.length - 1) : 0;
    S.fc[id] = [b, hj + (ok ? INT[b] : 1)];
  }
  function marcarAtividade() { const d = hoje(); S.act[d] = (S.act[d] || 0) + 1; }

  /* ---------- apostila: status e páginas ---------- */
  const TIPO_AP = { sala: 'Em sala', casa: 'Para casa', adicionais: 'Adicionais', unit: 'Unit', test: 'Test', exercises: 'Exercises' };
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
  function plano() { const k = JSON.stringify([S.cfg, S.diag]); if (k !== PLK) { PL = gerarPlano(); PLK = k; } return PL; }
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
    const pend = MODS.filter(m => !excl.has(m.id));
    /* Exercícios da apostila: os em sala e as units entram no ciclo 1; os para casa e as provas reais, no ciclo 2. */
    const apDo = (id, k) => (APPLAN[id] || []).filter(sid => apCiclo(APS[sid]) === k);
    const need = pend.reduce((a, m) => a + m.h + apDo(m.id, 0).reduce((b, sid) => b + apHoras(APS[sid]), 0), 0);
    const f = need ? Math.min(1, capTot / need) : 1;
    const retaFinal = f < 0.5;
    const porPeso = (a, b) => (b.peso - a.peso) || (a.n - b.n);
    /* Ciclo 1: teoria completa. Se sobrar tempo, ciclo 2 (revisão ativa de tudo) e ciclo 3 (o que mais cai). */
    const ciclos = [
      { pref: 'T', txt: '', mods: pend, fator: f, min: 0.5 },
      { pref: 'T2', txt: 'Ciclo 2 · revisão ativa: ', mods: MODS.slice().sort(porPeso), fator: 0.5, min: 0.75 },
      { pref: 'T3', txt: 'Ciclo 3 · o que mais cai: ', mods: MODS.filter(m => m.peso >= 2).sort(porPeso), fator: 0.3, min: 0.5 }
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
            dia.tar.push({ k: 'Q:' + it.id, tipo: 'quiz', mod: it.id, txt: 'Quiz ' + it.id + ': meta de 8 acertos em 10' });
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

  /* ---------- navegação ---------- */
  let V = { v: 'hoje' };
  try { const a = localStorage.getItem(LS_ABA); if (a && ['hoje', 'plano', 'materias', 'apostila', 'treino', 'simulados'].indexOf(a) >= 0) V = { v: a }; } catch (e) { /* ignora */ }
  if (S.ativo) V = { v: 'sim' };
  let QZ = null, FC = null, timer = null, pedindo = null, mapa = false;
  const ABA_DE = { hoje: 'hoje', plano: 'plano', materias: 'materias', modulo: 'materias', quiz: null, fc: 'treino', treino: 'treino', simulados: 'simulados', sim: 'simulados', res: 'simulados', apostila: 'apostila', apset: 'apostila', appags: 'apostila' };
  function go(v, extra) { V = Object.assign({ v }, extra || {}); pedindo = null; render(); window.scrollTo(0, 0); }

  /* ---------- componentes ---------- */
  const ICON_OK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function linhaTarefa(t) {
    const ok = feita(t), auto = AUTO[t.tipo];
    const chk = auto
      ? `<span class="check auto ${ok ? 'on' : ''}" title="Marca sozinha quando você termina" role="img" aria-label="${ok ? 'Concluída' : 'Pendente'}">${ICON_OK}</span>`
      : `<button class="check ${ok ? 'on' : ''}" data-a="marcar" data-k="${t.k}" aria-pressed="${ok}" aria-label="Marcar como concluída">${ICON_OK}</button>`;
    const m = t.mod && MOD[t.mod];
    let sub = '', bt = '';
    switch (t.tipo) {
      case 'teoria': sub = `${sig(m.m)} ${m.id} · ${fh(t.h)}`; bt = `<button class="btn sm" data-a="mod" data-id="${m.id}">Estudar</button>`; break;
      case 'quiz': sub = `${sig(m.m)} ${m.id} · 10 questões`; bt = `<button class="btn sm" data-a="quizmod" data-id="${m.id}">Fazer</button>`; break;
      case 'rev': sub = `${sig(m.m)} ${m.id} · flashcards + quiz`; bt = `<button class="btn sm" data-a="quizmod" data-id="${m.id}" data-rev="${t.k}">Revisar</button>`; break;
      case 'quiz2': sub = `${sig(m.m)} ${m.id} · marca sozinha ao fazer o quiz`; bt = `<button class="btn sm" data-a="quizmod" data-id="${m.id}">Fazer</button>`; break;
      case 'marco': sub = 'Prova real ou simulado completo no mesmo horário'; bt = `<button class="btn sm pri" data-a="tab" data-v="simulados">Simulados</button>`; break;
      case 'diag': sub = 'Sem cronômetro · mostra suas matérias mais fracas'; bt = `<button class="btn sm pri" data-a="simini" data-tipo="diag">Começar</button>`; break;
      case 'sim': sub = 'Condições de prova, com cronômetro'; bt = `<button class="btn sm pri" data-a="simini" data-tipo="completo">Começar</button>`; break;
      case 'simmat': sub = '24 questões · 1h'; bt = `<button class="btn sm" data-a="tab" data-v="simulados">Escolher</button>`; break;
      case 'erros': case 'reforco': sub = plural(nErros(), 'questão', 'questões') + ' no caderno de erros'; bt = `<button class="btn sm" data-a="tab" data-v="treino">Abrir</button>`; break;
      case 'apost': { const st = APS[t.set], e = apEst(t.set); sub = `${sig(st.m)} ${apTipo(st)} · ${e.feitas}/${e.total} corrigidas · ${fh(t.h)}`; bt = `<button class="btn sm" data-a="apset" data-id="${st.id}">Abrir</button>`; break; }
      default: sub = '';
    }
    return `<div class="task ${ok ? 'done' : ''}">${chk}<div class="tt"><b>${t.txt}</b>${sub ? `<div class="small muted">${sub}</div>` : ''}</div>${bt || '<span></span>'}</div>`;
  }
  function blocoMaterias() {
    return ORD.map(s => {
      const p = progMat(s);
      return `<div class="subj b-${s}">${sig(s)}<span>${MATS[s].curto}</span><span class="small muted num">${p.dom}/${p.tot} dominados</span><div class="meter"><i style="width:${(p.dom / p.tot) * 100}%"></i></div></div>`;
    }).join('');
  }

  /* ---------- telas ---------- */
  function vHoje() {
    const p = plano(), hj = HJ(), prova = dnum(S.cfg.prova), d = p.dias.find(x => x.n === hj);
    let h = '';
    const novato = !S.diag && !Object.keys(S.mod).length && !S.sims.length;
    h += `<div class="stack"><div class="eyebrow">Briefing · ${flonga(hj)}</div><h1 class="h1">${hj >= prova ? (hj === prova ? 'Dia de prova' : 'Prova realizada') : 'Missão de hoje'}</h1></div>`;
    if (novato) {
      h += `<section class="card"><h2 class="h2">Comece aqui</h2>
        <ol class="stack" style="margin:0;padding-left:1.2em">
          <li><b>Confira a data da prova e suas horas por dia</b> na aba Plano. O cronograma se ajusta sozinho.</li>
          <li><b>Faça o diagnóstico</b>: 40 questões, sem cronômetro. O plano dá mais tempo às matérias em que você for pior.</li>
          <li><b>Siga o briefing do dia</b>: teoria, depois o quiz do módulo. O módulo só conta como dominado com 8 acertos em 10 (80%).</li>
          <li><b>Revise os flashcards todo dia</b> e faça o simulado semanal em condições de prova.</li>
        </ol>
        <div class="row"><button class="btn pri" data-a="simini" data-tipo="diag">Fazer o diagnóstico</button><button class="btn" data-a="tab" data-v="plano">Ajustar o plano</button></div></section>`;
    }
    if (S.ativo) h += `<div class="banner acc"><p>Você tem um simulado em andamento.</p><button class="btn sm pri" data-a="go" data-v="sim">Continuar</button></div>`;
    const prox = CAL.map(x => ({ x, n: dnum(x.d) })).filter(o => o.n >= hj && o.n < prova).sort((a, b) => a.n - b.n)[0];
    if (prox) h += `<div class="banner acc"><p><b>${prox.x.nome}</b> em ${plural(prox.n - hj, 'dia', 'dias')} (${fdata(prox.n)}), antes da sua prova alvo. Se estiver inscrito, use como experiência real de prova.</p></div>`;
    const atr =p.dias.filter(x => x.n < hj).reduce((a, x) => a.concat(x.tar), []).filter(t => (t.tipo === 'teoria' || t.tipo === 'quiz' || t.tipo === 'diag') && !feita(t));
    if (atr.length && hj < prova) h += `<div class="banner warn"><p><b>${plural(atr.length, 'tarefa atrasada', 'tarefas atrasadas')}</b> de dias anteriores. Replaneje para redistribuir o que falta até a prova.</p><button class="btn sm" data-a="replanejar">Replanejar a partir de hoje</button></div>`;
    if (hj === prova) h += `<section class="card"><p style="margin:0">Hoje não estude conteúdo novo. Coma bem, chegue cedo, leia cada enunciado até o fim e marque o gabarito com calma. Boa prova.</p></section>`;
    else if (hj > prova) h += `<section class="card"><p style="margin:0">A data da prova configurada já passou. Ajuste a nova data na aba Plano para gerar outro cronograma.</p><div class="row"><button class="btn" data-a="tab" data-v="plano">Ajustar o plano</button></div></section>`;
    else if (d) {
      const total = d.tar.reduce((a, t) => a + (t.h || 0), 0);
      const tipoTxt = { estudo: 'Dia de estudo', simulado: 'Dia de simulado', revisao: 'Revisão final', vespera: 'Véspera da prova', marco: 'Dia de prova real' }[d.tipo];
      h += `<section class="card"><div class="row between"><h2 class="h2">${tipoTxt}</h2>${total ? `<span class="chip">${fh(total)} planejadas</span>` : ''}</div><div class="tasks">${d.tar.map(linhaTarefa).join('')}</div></section>`;
    } else if (hj < dnum(S.cfg.inicio)) h += `<section class="card"><p style="margin:0">Seu plano começa em ${fdata(dnum(S.cfg.inicio))}. Enquanto isso, faça o diagnóstico ou adiante um módulo.</p></section>`;
    else h += `<section class="card"><p style="margin:0">Hoje é folga no seu plano. Se quiser render mais, revise os flashcards pendentes.</p></section>`;
    const dv = devidos().length, ne = nErros();
    const abaixo = MODS.filter(m => { const r = S.mod[m.id]; return r && r.best != null && r.best < META; });
    h += `<section class="grid2">
      <div class="card"><div class="eyebrow">Flashcards</div><div class="row between"><span class="score num">${dv}</span><button class="btn sm" data-a="fcini" ${dv ? '' : 'disabled'}>Revisar</button></div><span class="small muted">${dv ? 'cartões para revisar hoje' : (liberados().length ? 'Nada pendente hoje.' : 'Abra a teoria de um módulo para liberar os cartões dele.')}</span></div>
      <div class="card"><div class="eyebrow">Caderno de erros</div><div class="row between"><span class="score num">${ne}</span><button class="btn sm" data-a="tab" data-v="treino" ${ne ? '' : 'disabled'}>Refazer</button></div><span class="small muted">${abaixo.length ? plural(abaixo.length, 'módulo abaixo de 80%', 'módulos abaixo de 80%') : 'questões para refazer'}</span></div>
    </section>`;
    h += `<section class="card"><div class="row between"><h2 class="h2">Progresso</h2><span class="small muted">meta: 80% em cada módulo</span></div><div class="stack">${blocoMaterias()}</div>${ultimoSimResumo()}<div class="sync" id="sync"></div></section>`;
    return h;
  }
  function ultimoSimResumo() {
    const ss = S.sims.filter(x => x.tipo === 'completo');
    if (!ss.length) return '';
    const u = ss[ss.length - 1], med = media(u);
    return `<div class="row between small"><span class="muted">Último simulado completo (${fdata(dnum(u.d))})</span><b class="num">média ${nota(med)}</b></div>`;
  }
  function media(reg) { const ks = Object.keys(reg.r); return ks.reduce((a, s) => a + reg.r[s][0] / reg.r[s][1], 0) / ks.length; }

  function vPlano() {
    const p = plano(), c = S.cfg, hj = HJ();
    let h = `<div class="stack"><div class="eyebrow">Plano de voo</div><h1 class="h1">Cronograma até a prova</h1></div>`;
    h += `<section class="card"><h2 class="h2">Meta: aprovação até 2027</h2>
      <p class="small" style="margin:0">Até o fim de 2027 há três provas do CFS. Escolha a prova alvo; as anteriores entram no plano como dia de prova real.</p>
      <div class="tasks">${CAL.map(x => { const n = dnum(x.d), alvo = c.alvo === x.id, passou = n < hj; return `<div class="task"><span class="sigla">${x.d.slice(0, 4)}</span><div class="tt"><b>${x.nome} · ${fdata(n)}/${x.d.slice(0, 4)}</b><div class="small muted">${x.st}</div></div><span class="chip ${alvo ? 'acc' : passou ? '' : 'ok'}">${alvo ? 'alvo' : passou ? 'já passou' : n < dnum(c.prova) ? 'no caminho' : 'segunda chance'}</span></div>`; }).join('')}</div>
      <p class="small muted" style="margin:0">Datas de 2027 são estimativas feitas a partir dos editais anteriores. Quando sair o edital, ajuste em "Outra data".</p></section>`;
    h += `<section class="card"><h2 class="h2">Configuração</h2>
      <form class="form" id="cfg" onsubmit="return false">
        <div class="field"><label for="cfg-alvo">Prova alvo</label><select id="cfg-alvo">${CAL.map(x => `<option value="${x.id}" ${c.alvo === x.id ? 'selected' : ''}>${x.nome} (${fdata(dnum(x.d))}/${x.d.slice(0, 4)})</option>`).join('')}<option value="outra" ${c.alvo === 'outra' ? 'selected' : ''}>Outra data</option></select></div>
        <div class="field"><label for="cfg-prova">Data da prova</label><input type="date" id="cfg-prova" value="${c.prova}" ${c.alvo === 'outra' ? '' : 'disabled'}></div>
        <div class="field"><label for="cfg-inicio">Início do plano</label><input type="date" id="cfg-inicio" value="${c.inicio}"></div>
        <div class="field"><label for="cfg-horas">Horas por dia</label><select id="cfg-horas">${[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10].map(x => `<option value="${x}" ${Number(c.horas) === x ? 'selected' : ''}>${fh(x)}</option>`).join('')}</select></div>
        <div class="field"><label for="cfg-sim">Simulado semanal</label><select id="cfg-sim">${[0, 1, 2, 3, 4, 5, 6].map(x => `<option value="${x}" ${Number(c.simDia) === x ? 'selected' : ''}>${DIAS_L[x]}</option>`).join('')}</select></div>
        <div class="field"><label for="cfg-tempo">Tempo do simulado completo</label><select id="cfg-tempo">${[180, 210, 240, 260].map(x => `<option value="${x}" ${Number(c.tempoSim) === x ? 'selected' : ''}>${fh(x / 60)}</option>`).join('')}</select></div>
        <div class="field" style="grid-column:1/-1"><span class="lab">Dias de estudo</span><div class="wk">${[1, 2, 3, 4, 5, 6, 0].map(x => `<label><input type="checkbox" id="cfg-d${x}" ${c.dias.indexOf(x) >= 0 ? 'checked' : ''}><span>${DIAS[x]}</span></label>`).join('')}</div></div>
      </form>
      <div class="row"><button class="btn" data-a="replanejar">Replanejar a partir de hoje</button><span class="small muted">Recomeça o cronograma hoje e tira os módulos já dominados.</span></div>
    </section>`;
    p.av.forEach(a => { h += `<div class="banner warn"><p>${a}</p></div>`; });
    if (p.res) {
      const r = p.res;
      h += `<section class="card"><div class="grid2">
        <div><div class="eyebrow">Até a prova</div><div class="score num">${Math.max(0, r.prova - hj)}<small> dias</small></div><div class="small muted">prova em ${flonga(r.prova)}</div></div>
        <div><div class="eyebrow">Conteúdo</div><div class="score num">${MODS.length - (c.excl || []).length}<small> módulos</small></div><div class="small muted">${r.fimC ? 'teoria termina em ' + fdata(r.fimC) : 'tudo já coberto'} · ${plural(r.est, 'dia de estudo', 'dias de estudo')}</div></div>
      </div>
      <div class="tasks small">
        <div class="task"><span class="sigla">C1</span><div class="tt"><b>Ciclo 1: teoria completa</b><div class="muted">todos os módulos, com quiz, revisão de 7 dias${AP.sets.length ? ' e os exercícios de aula da apostila (em sala, units e o Português)' : ''}</div></div><span class="num">${r.fimCiclo[0] ? 'até ' + fdata(r.fimCiclo[0]) : '—'}</span></div>
        <div class="task"><span class="sigla">C2</span><div class="tt"><b>Ciclo 2: revisão ativa</b><div class="muted">todos os módulos de novo, do que mais cai para o que menos cai${AP.sets.length ? ', com os exercícios para casa e as provas reais da apostila' : ''}</div></div><span class="num">${r.fimCiclo[1] ? 'até ' + fdata(r.fimCiclo[1]) : r.fimCiclo[0] ? 'parcial' : 'sem tempo'}</span></div>
        <div class="task"><span class="sigla">C3</span><div class="tt"><b>Ciclo 3: o que mais cai</b><div class="muted">módulos de incidência média e alta</div></div><span class="num">${r.fimCiclo[2] ? 'até ' + fdata(r.fimCiclo[2]) : r.fimCiclo[1] ? 'parcial' : 'sem tempo'}</span></div>
      </div></section>`;
    }
    h += `<section class="card"><h2 class="h2">Como a prova funciona</h2>
      <ul class="stack small" style="margin:0;padding-left:1.2em">
        <li><b>96 questões objetivas</b>, 24 de cada matéria (Português, Inglês, Matemática e Física), com 4 alternativas.</li>
        <li><b>Eliminação</b>: nota abaixo de 5,0 em qualquer matéria ou média final abaixo de 5,0 (nota de 0 a 10). A classificação é pela média, então a meta do curso é 8,0: cerca de 19 acertos em 24 por matéria.</li>
        <li><b>Questões oficiais</b>: as provas anteriores da EEAR, com gabarito oficial, ficam na aba Simulados e na aba Provas de cada módulo.</li>
        <li><b>Datas</b>: confirme sempre no edital oficial, em ingresso.eear.fab.mil.br.</li>
        <li><b>Controle de Tráfego Aéreo (BCT)</b>: o inglês costuma ser cobrado em nível intermediário. Se for sua opção, dê peso extra a Inglês.</li>
      </ul></section>`;
    if (p.dias.length) {
      h += `<div class="days">`;
      let semana = -1, ns = 0;
      p.dias.forEach(d => {
        const ws = d.n - ((wday(d.n) + 6) % 7);
        if (ws !== semana) { semana = ws; ns++; h += `<div class="week">Semana ${ns} · ${fdata(ws)} a ${fdata(ws + 6)}</div>`; }
        const tipoTxt = { estudo: 'estudo', simulado: 'simulado', revisao: 'revisão', vespera: 'véspera', marco: 'prova' }[d.tipo];
        h += `<div class="day ${d.n === hj ? 'today' : ''} ${d.n < hj ? 'past' : ''}" ${d.n === hj ? 'id="dia-hoje"' : ''}><div class="dd"><b>${fdata(d.n)}</b>${DIAS[wday(d.n)]}<br>${tipoTxt}</div><ul>${d.tar.map(t => `<li class="${feita(t) ? 'done' : ''}">${t.mod ? sig(MOD[t.mod].m) + ' ' : ''}${t.txt}${t.h && (t.tipo === 'teoria' || t.tipo === 'apost') ? ` <span class="muted small">(${fh(t.h)})</span>` : ''}</li>`).join('')}</ul></div>`;
      });
      h += `</div>`;
    }
    h += `<section class="card"><h2 class="h2">Dados</h2><p class="small muted" style="margin:0">Zerar apaga notas, flashcards, simulados e o caderno de erros. A configuração do plano é mantida.</p>
      ${pedindo === 'zerar' ? `<div class="confirm"><p>Apagar todo o progresso? Isso não pode ser desfeito.</p><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="zerarok">Apagar</button></div>` : `<div class="row"><button class="btn" data-a="zerar">Zerar progresso</button></div>`}
      <div class="aphead">Levar o progresso para outro aparelho</div>
      <p class="small muted" style="margin:0">Copie o código do progresso aqui e cole no outro aparelho, em Plano › Dados › Colar progresso. Vale entre o site, o app e o link do curso.</p>
      <div class="row"><button class="btn" data-a="expcopiar">Copiar meu progresso</button><button class="btn" data-a="impabrir">Colar progresso</button></div>
      ${pedindo === 'exp' ? `<div class="field"><label for="exp-txt">Selecione e copie o código</label><textarea id="exp-txt" class="codigo" readonly rows="4">${esc(JSON.stringify(S))}</textarea></div>` : ''}
      ${pedindo === 'imp' ? `<div class="field"><label for="imp-txt">Cole aqui o código do outro aparelho</label><textarea id="imp-txt" class="codigo" rows="4"></textarea></div><div class="confirm"><p>Isso substitui o progresso deste aparelho.</p><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="impok">Carregar progresso</button></div>` : ''}
      ${msgDados ? `<p class="small" role="status" style="margin:0">${msgDados}</p>` : ''}
      <div class="sync" id="sync"></div></section>`;
    h += cartaoInstalar();
    return h;
  }
  /* Instalação como app: só no site (no app de Android e no link do curso ela não se aplica). */
  let instalar = null, msgDados = '';
  window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); instalar = ev; if (V.v === 'plano') render(); });
  function cartaoInstalar() {
    if (window.EEAR_SITE !== 'site') return '';
    const sozinho = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let h = '<section class="card"><h2 class="h2">Instalar no celular</h2>';
    if (sozinho) h += '<p style="margin:0">O app está instalado neste aparelho e funciona sem internet.</p>';
    else if (instalar) h += '<p style="margin:0">Instale o curso como app: ele ganha ícone na tela inicial e funciona sem internet.</p><div class="row"><button class="btn pri" data-a="instalar">Instalar o app</button></div>';
    else if (ios) h += '<p style="margin:0">No iPhone ou iPad, abra este site no Safari, toque em Compartilhar e depois em <b>Adicionar à Tela de Início</b>. O curso ganha ícone e funciona sem internet.</p>';
    else h += '<p style="margin:0">No Android, abra o menu do Chrome (⋮) e toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>. O curso ganha ícone e funciona sem internet.</p>';
    if (!sozinho && !ios && window.EEAR_APK) h += `<p class="small muted" style="margin:0">Prefere o app de Android? <a href="${window.EEAR_APK}">Baixar o APK</a> e abrir o arquivo no celular.</p>`;
    return h + '</section>';
  }

  function vMaterias() {
    const s = V.s && MATS[V.s] ? V.s : (V.s = ORD[0]);
    let h = `<div class="stack"><div class="eyebrow">Conteúdo programático</div><h1 class="h1">Matérias</h1></div>`;
    h += `<div class="seg" role="group" aria-label="Matéria">${ORD.map(x => `<button data-a="mat" data-s="${x}" aria-pressed="${x === s}">${MATS[x].curto}</button>`).join('')}</div>`;
    const p = progMat(s), ms = MODS.filter(m => m.m === s);
    h += `<section class="card b-${s}"><div class="row between"><h2 class="h2">${MATS[s].nome}</h2><span class="small muted num">${p.dom} de ${p.tot} dominados</span></div><div class="meter"><i style="width:${(p.dom / p.tot) * 100}%"></i></div>
      <div class="mods">${ms.map(m => { const st = estMod(m.id); return `<button class="modrow" data-a="mod" data-id="${m.id}"><span class="sigla c-${s}">${m.id}</span><span><span class="mt">${m.t}</span><br><span class="peso" title="Incidência estimada">${bolinhas(m.peso)} · ${fh(m.h)}</span></span><span class="chip ${st.k}">${st.txt}</span></button>`; }).join('')}</div>
      <p class="small muted" style="margin:0">● incidência estimada na prova (●●● = cai muito). Horas = tempo ideal de estudo do módulo.</p></section>`;
    h += `<section class="card"><h2 class="h2">Videoaulas de ${MATS[s].curto}</h2><p class="small muted" style="margin:0">Canais gratuitos para complementar a teoria. Os links abrem a busca do YouTube em outra aba; cada módulo também tem os vídeos do seu tópico.</p>
      <div class="stack">${CANAIS[s].map(cn => `<a class="vlink" href="${yt(cn)}" target="_blank" rel="noopener">${cn}</a>`).join('')}<a class="vlink" href="${yt('EEAR ' + MATS[s].curto + ' questões resolvidas')}" target="_blank" rel="noopener">Questões de ${MATS[s].curto} da EEAR resolvidas</a></div></section>`;
    return h;
  }

  function vModulo() {
    const m = MOD[V.id];
    if (!m) return vMaterias();
    const aba = V.aba || 'teoria';
    const r = S.mod[m.id] || {}, st = estMod(m.id);
    const nx = MODS[MODS.indexOf(m) + 1];
    let h = `<button class="btn ghost back" data-a="mat" data-s="${m.m}">← ${MATS[m.m].curto}</button>`;
    h += `<div class="stack"><div class="eyebrow">${sig(m.m)} ${m.id} · incidência ${bolinhas(m.peso)} · ${fh(m.h)} ideais</div><h1 class="h1">${m.t}</h1><div class="row"><span class="chip ${st.k}">${st.txt}</span>${r.tent ? `<span class="small muted">${plural(r.tent, 'tentativa', 'tentativas')} no quiz</span>` : ''}</div></div>`;
    const ofi = OFI[m.id] || [];
    const aps = APMOD[m.id] || [];
    const abas = [['teoria', 'Teoria'], ['ex', 'Exemplos'], ['quiz', 'Quiz'], ['ap', 'Apostila'], ['prov', 'Provas'], ['cards', 'Cartões']];
    h += `<div class="seg" role="group" aria-label="Partes do módulo">${abas.map(a => `<button data-a="aba" data-aba="${a[0]}" aria-pressed="${a[0] === aba}">${a[1]}</button>`).join('')}</div>`;
    if (aba === 'teoria') {
      h += `<article class="card teoria b-${m.m}">${m.teoria}</article>`;
      const busca = VID[m.id] || m.t;
      h += `<section class="card"><h2 class="h2">Videoaulas do tópico</h2><p class="small muted" style="margin:0">Assista depois de ler a teoria. Os links abrem a busca do YouTube em outra aba.</p>
        <div class="stack"><a class="vlink" href="${yt(busca + ' aula')}" target="_blank" rel="noopener">Aula: ${busca}</a><a class="vlink" href="${yt('EEAR ' + busca + ' questão resolvida')}" target="_blank" rel="noopener">Questões da EEAR resolvidas sobre o tema</a></div>
        <div class="row small">${CANAIS[m.m].map(cn => `<a href="${yt(cn + ' ' + busca)}" target="_blank" rel="noopener">${cn}</a>`).join('<span class="muted">·</span>')}</div></section>`;
      h += `<div class="row"><button class="btn pri" data-a="quizmod" data-id="${m.id}">Fazer o quiz (meta 80%)</button><button class="btn" data-a="aba" data-aba="ex">Ver exemplos resolvidos</button></div>`;
    } else if (aba === 'ex') {
      h += (m.ex || []).map((x, i) => `<section class="card"><div class="eyebrow">Exemplo ${i + 1}</div><div class="q-enun">${x[0]}</div><details class="rev"><summary>Ver resolução</summary><div class="teoria">${x[1]}</div></details></section>`).join('') || '<p class="empty">Sem exemplos neste módulo.</p>';
      h += `<div class="row"><button class="btn pri" data-a="quizmod" data-id="${m.id}">Fazer o quiz (meta 80%)</button></div>`;
    } else if (aba === 'quiz') {
      h += `<section class="card"><h2 class="h2">Quiz do módulo</h2><p style="margin:0">São ${m.q.length} questões no estilo da EEAR, com correção comentada logo após cada resposta. O módulo fica dominado com ${Math.ceil(m.q.length * META)} acertos ou mais.</p>
        ${r.best != null ? `<div class="row"><span class="chip ${r.best >= META ? 'ok' : 'warn'}">Melhor nota: ${pct(r.best)}</span><span class="chip">Última: ${pct(r.last)}</span></div>` : ''}
        <div class="row"><button class="btn pri" data-a="quizmod" data-id="${m.id}">${r.tent ? 'Refazer o quiz' : 'Começar o quiz'}</button></div></section>`;
    } else if (aba === 'ap') {
      h += `<section class="card"><h2 class="h2">Exercícios da apostila</h2>${aps.length
        ? `<p style="margin:0">${plural(aps.length, 'conjunto', 'conjuntos')} das suas apostilas sobre este tópico, com ${AP_PAG ? 'as páginas originais' : 'a página do PDF'} e correção pelo gabarito do livro. Meta: 80% em cada um.</p><div class="mods">${aps.map(id => apLinha(APS[id], 'mod')).join('')}</div>`
        : '<p style="margin:0">As apostilas não têm um conjunto de exercícios específico deste tópico. Veja a aba Apostila para folhear o material.</p>'}</section>`;
    } else if (aba === 'prov') {
      h += `<section class="card"><h2 class="h2">Questões de provas anteriores</h2>${ofi.length
        ? `<p style="margin:0">${plural(ofi.length, 'questão oficial', 'questões oficiais')} da EEAR sobre este tópico, com a ordem original das alternativas e o gabarito oficial.</p><div class="row"><button class="btn pri" data-a="oficiaismod" data-id="${m.id}">Resolver ${ofi.length > 20 ? '20 sorteadas' : 'todas'}</button></div>`
        : `<p style="margin:0">Ainda não há questões oficiais deste tópico no curso. Elas entram aqui, com o gabarito oficial, quando as provas anteriores da EEAR forem carregadas.</p>`}</section>`;
    } else {
      h += `<section class="card"><h2 class="h2">Flashcards do módulo</h2><p style="margin:0">Estes cartões entram na sua revisão diária com repetição espaçada: quem você acerta volta depois de 1, 3, 7, 14, 30 e 60 dias; quem você erra volta amanhã.</p>
        <div class="row"><button class="btn pri" data-a="fcmod" data-id="${m.id}">Estudar os ${(m.fc || []).length} cartões</button></div></section>`;
      h += `<section class="card"><div class="tbl"><table><tbody>${(m.fc || []).map(c => `<tr><td>${c[0]}</td><td>${c[1]}</td></tr>`).join('')}</tbody></table></div></section>`;
    }
    if (nx && nx.m === m.m) h += `<div class="row between"><span class="small muted">Próximo: ${nx.id} · ${nx.t}</span><button class="btn sm" data-a="mod" data-id="${nx.id}">Abrir</button></div>`;
    return h;
  }

  /* ---------- apostila ---------- */
  const grupoAp = s => s.tipo === 'sala' ? 'exercícios em sala' : (s.tipo === 'casa' || s.tipo === 'adicionais') ? 'exercícios para casa' : s.tipo === 'unit' ? 'units' : 'tests e provas reais';
  function apLinha(s, de) {
    return `<button class="modrow" data-a="apset" data-id="${s.id}" ${de ? `data-de="${de}"` : ''}><span class="sigla c-${s.m}">${apSigla(s)}</span><span><span class="mt">${apTitulo(s)}</span><br><span class="peso">${apTipo(s)} · ${s.nmc} questões${s.inc ? ' · gabarito pouco nítido' : ''}</span></span>${apChip(s.id)}</button>`;
  }
  function vApostila() {
    let h = `<div class="stack"><div class="eyebrow">Material do curso</div><h1 class="h1">Apostila</h1></div>`;
    if (!AP.sets.length) return h + '<p class="empty">A apostila ainda não foi carregada.</p>';
    const l = V.l && LIVRO[V.l] ? V.l : (V.l = AP.livros[0].id);
    const s = V.s && MATS[V.s] ? V.s : (V.s = ORD[0]);
    h += AP_PAG ? `<p class="small" style="margin:0">As páginas originais das suas apostilas, com folha de respostas corrigida pelo gabarito impresso do livro. A meta é 80% em cada conjunto.</p>`
      : `<p class="small" style="margin:0">Folhas de respostas das suas apostilas, corrigidas pelo gabarito impresso do livro. Abra o PDF da apostila na página indicada em cada conjunto e marque as respostas aqui. A meta é 80% em cada conjunto.</p>`;
    h += `<div class="seg" role="group" aria-label="Livro">${AP.livros.map(x => `<button data-a="aplivro" data-l="${x.id}" aria-pressed="${x.id === l}">${x.curto}</button>`).join('')}</div>`;
    h += `<div class="seg" role="group" aria-label="Matéria">${ORD.map(x => `<button data-a="apmat" data-s="${x}" aria-pressed="${x === s}">${MATS[x].curto}</button>`).join('')}</div>`;
    const sets = AP.sets.filter(x => x.l === l && x.m === s);
    let tot = 0, fe = 0, ce = 0;
    sets.forEach(x => { const e = apEst(x.id); tot += e.total; fe += e.feitas; ce += e.certas; });
    h += `<section class="card b-${s}"><div class="row between"><h2 class="h2">${LIVRO[l].nome} · ${MATS[s].curto}</h2><span class="small muted num">${fe} de ${tot} corrigidas</span></div><div class="meter"><i style="width:${tot ? (fe / tot) * 100 : 0}%"></i></div>${fe ? `<span class="small muted">${pct(ce / fe)} de acerto nas questões corrigidas</span>` : ''}`;
    const grupos = [];
    sets.forEach(x => { const k = x.fr + ' · ' + grupoAp(x); let g = grupos.find(y => y.k === k); if (!g) grupos.push(g = { k, sets: [] }); g.sets.push(x); });
    h += grupos.length ? grupos.map(g => `<div class="aphead">${g.k.replace(/^(Matemática|Física) · /, '')}</div><div class="mods">${g.sets.map(x => apLinha(x)).join('')}</div>`).join('') : '<p class="empty">Este livro não tem exercícios desta matéria.</p>';
    h += `</section>`;
    const partes = LIVRO[l].partes.filter(p => AP.partes[p] && AP.partes[p].m === s);
    if (partes.length && AP_PAG) h += `<section class="card"><h2 class="h2">Folhear a apostila</h2><p class="small muted" style="margin:0">Teoria, exercícios comentados e exercícios na ordem do livro.</p><div class="row">${partes.map((p, i) => `<button class="btn" data-a="appags" data-part="${p}" data-p="1">${MATS[s].curto}${partes.length > 1 ? ' · parte ' + (i + 1) : ''} · ${AP.partes[p].n} págs.</button>`).join('')}</div></section>`;
    return h;
  }
  function fq(s, r, si, i, g) {
    const k = si + ':' + i, n = pad(i + 1);
    if (g === '*') return `<div class="fq open"><span class="n">${n}</span><span class="small muted">aberta</span></div>`;
    const marc = r.r[k], ok = r.ok[k], corr = ok !== undefined, cur = V.qk === k;
    return `<div class="fq ${corr ? (ok ? 'right' : 'wrong') : ''} ${cur ? 'cur' : ''}"><span class="n">${n}</span>${LETRAS.map(L => `<button class="${marc === L ? 'on' : ''} ${corr && L === g ? 'gab' : ''}" data-a="apm" data-k="${k}" data-l="${L}" ${corr ? 'disabled' : ''} aria-pressed="${marc === L}" aria-label="Questão ${i + 1}, ${L}">${L}</button>`).join('')}</div>`;
  }
  function folha(s, r) {
    const e = apEst(s.id), marc = Object.keys(r.r).length;
    const pend = s.itens.filter(x => x.g !== '*' && r.r[x.k] && r.ok[x.k] === undefined).length;
    const err = Object.keys(r.ok).filter(k => r.ok[k] === 0).length;
    let h = `<section class="card" id="folha"><div class="row between"><h2 class="h2">Folha de respostas</h2><span class="small muted num">${marc} de ${s.nmc} marcadas</span></div>`;
    if (e.feitas) {
      const tx = e.certas / e.feitas;
      h += `<div class="row between"><span class="score num">${e.certas}<small> de ${e.feitas} corrigidas</small></span><span class="chip ${tx >= META ? 'ok' : 'warn'}">${pct(tx)}</span></div>`;
      if (e.fim) h += `<p class="small" style="margin:0">${e.nota >= META ? 'Meta de 80% batida neste conjunto.' : 'Abaixo da meta de 80%. Releia a teoria da aula e refaça as erradas.'}${r.prim != null && r.tent > 1 ? ` Na primeira vez você fez ${pct(r.prim)}.` : ''}</p>`;
    }
    s.sec.forEach((sec, si) => {
      if (sec.g) {
        if (s.sec.length > 1 || sec.n !== s.t) h += `<div class="aphead">${sec.n}</div>`;
        h += `<div class="folha">${sec.g.split('').map((g, i) => fq(s, r, si, i, g)).join('')}</div>`;
      } else h += `<details class="rev"><summary>${sec.n}: respostas</summary><ol class="small">${sec.txt.map(t => `<li>${t}</li>`).join('')}</ol></details>`;
    });
    if (s.abertas) h += `<details class="rev"><summary>Respostas das questões abertas</summary><ul class="small">${s.abertas.map(t => `<li>${t}</li>`).join('')}</ul></details>`;
    h += `<div class="row"><button class="btn pri" data-a="apcorr" ${pend ? '' : 'disabled'}>Corrigir${pend ? ' ' + pend : ''}</button>${err ? `<button class="btn" data-a="aperr">Refazer as ${err} erradas</button>` : ''}${marc ? '<button class="btn ghost" data-a="aplimpar">Recomeçar</button>' : ''}</div>`;
    if (pedindo === 'aplimpar') h += '<div class="confirm"><p>Apagar as respostas deste conjunto e começar de novo?</p><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="aplimparok">Apagar</button></div>';
    h += `<p class="small muted" style="margin:0">Correção pelo gabarito impresso do livro. Dá para corrigir aos poucos: só as questões marcadas são corrigidas, e as erradas ficam guardadas para refazer.${s.gp ? (AP_PAG ? ` <button class="lnk" data-a="appags" data-part="${s.gp[0]}" data-p="${s.gp[1]}">Ver a página do gabarito</button>` : ` O gabarito impresso está na página ${s.gp[1]} do PDF ${apPdf(s.gp[0])}.`) : ''}</p></section>`;
    return h;
  }
  function apItens(s) { return s.itens.filter(x => x.g !== '*'); }
  /* Questão atual da barra de marcação: a escolhida ou a primeira ainda sem resposta. */
  function apAtual(s, r) {
    const its = apItens(s);
    let it = its.find(x => x.k === V.qk);
    if (!it) it = its.find(x => r.ok[x.k] === undefined && !r.r[x.k]) || its[0];
    V.qk = it ? it.k : null;
    return it;
  }
  function apBarra(s, r) {
    const it = apAtual(s, r);
    if (!it) return '';
    const marc = r.r[it.k], corr = r.ok[it.k] !== undefined;
    const sec = s.sec.length > 1 ? s.sec[it.si].n.split(' ')[0] + ' ' : '';
    return `<div class="apbar"><div class="apbar-in"><button class="btn sm ghost" data-a="apqi" data-d="-1" aria-label="Questão anterior">‹</button><span class="apq num">${sec}${pad(it.n)}</span><button class="btn sm ghost" data-a="apqi" data-d="1" aria-label="Próxima questão">›</button><span class="aplet">${LETRAS.map(L => `<button class="${marc === L ? 'on' : ''} ${corr && L === it.g ? 'gab' : ''}" data-a="apm" data-k="${it.k}" data-l="${L}" data-bar="1" ${corr ? 'disabled' : ''} aria-label="Marcar ${L}">${L}</button>`).join('')}</span><button class="btn sm fol" data-a="apfolha">Folha</button></div></div>`;
  }
  function apRegistro(id) {
    const r = S.ap[id] = S.ap[id] || {};
    if (!r.r || typeof r.r !== 'object') r.r = {};
    if (!r.ok || typeof r.ok !== 'object') r.ok = {};
    return r;
  }
  function vApSet() {
    const s = APS[V.id];
    if (!s) return vApostila();
    const r = S.ap[s.id] ? apRegistro(s.id) : { r: {}, ok: {} };
    const m0 = s.mods[0] && MOD[s.mods[0]];
    apAtual(s, r);
    let h = `<button class="btn ghost back" data-a="apvolta">← ${V.de === 'mod' && MOD[V.mod] ? MOD[V.mod].id : ({ hoje: 'Hoje', sim: 'Simulados', treino: 'Treino' })[V.de] || 'Apostila'}</button>`;
    h += `<div class="stack"><div class="eyebrow">${sig(s.m)} ${LIVRO[s.l].nome} · ${s.fr}</div><h1 class="h1">${apTitulo(s)}</h1><div class="row"><span class="chip">${apTipo(s)}</span>${apChip(s.id)}${s.mods.map(id => `<button class="chip lnkchip" data-a="mod" data-id="${id}" title="${MOD[id].t}">${id}</button>`).join('')}</div></div>`;
    if (s.inc) h += `<div class="banner warn"><p>A página do gabarito deste conjunto está pouco nítida no livro, e B e D podem se confundir. Se uma correção parecer errada, confira o gabarito impresso${s.gp && !AP_PAG ? ` (página ${s.gp[1]} do PDF)` : ''}.</p>${s.gp && AP_PAG ? `<button class="btn sm" data-a="appags" data-part="${s.gp[0]}" data-p="${s.gp[1]}">Ver gabarito impresso</button>` : ''}</div>`;
    h += '<div class="apgrid"><div class="appages">';
    if (s.pg && AP.partes[s.pg[0]] && !AP_PAG) {
      const part = s.pg[0], a = s.pg[1], b = s.pg[2];
      h += `<section class="card pdfref"><div class="eyebrow">Abra o PDF</div><h2 class="h2">${apPdf(part)}</h2><p style="margin:0">${a === b ? `Exercícios na página <b class="num">${a}</b>` : `Exercícios nas páginas <b class="num">${a}</b> a <b class="num">${b}</b>`} do PDF.${s.ini ? ` Teoria da aula: página <b class="num">${s.ini[1]}</b>${s.ini[0] !== part ? ' do PDF ' + apPdf(s.ini[0]) : ''}.` : ''}</p>${m0 ? `<p class="small muted" style="margin:0">Teoria resumida no módulo <button class="lnk" data-a="mod" data-id="${m0.id}">${m0.id} · ${m0.t}</button>.</p>` : ''}</section>`;
    } else if (s.pg && AP.partes[s.pg[0]]) {
      const part = s.pg[0], a = s.pg[1], n = AP.partes[part].n, fim = Math.min(n, s.pg[2] + (V.mais || 0));
      h += `<p class="small muted" style="margin:0">Toque numa página para ampliar.${m0 ? ` Teoria resumida no módulo ${m0.id}${s.ini ? ' e a do livro em "Ver a teoria da aula"' : ''}.` : ''}</p><div class="pgs">`;
      for (let p = a; p <= fim; p++) h += pgHtml(part, p);
      h += `</div><div class="row">${fim < n ? '<button class="btn sm" data-a="apmais">Mostrar a página seguinte</button>' : ''}<button class="btn sm" data-a="appags" data-part="${s.ini ? s.ini[0] : part}" data-p="${s.ini ? s.ini[1] : a}">${s.ini ? 'Ver a teoria da aula' : 'Folhear a partir daqui'}</button></div>`;
    } else h += '<p class="small muted">As páginas deste conjunto não foram localizadas automaticamente. Use "Folhear a apostila" na aba Apostila.</p>';
    h += `</div><aside class="apside">${folha(s, r)}</aside></div>`;
    h += apBarra(s, r);
    return h;
  }
  function vApPags() {
    const info = AP.partes[V.part];
    if (!info || !AP_PAG) return vApostila();
    const n = info.n, a = Math.max(1, Math.min(n, V.p || 1)), b = Math.min(n, a + 3);
    let h = '<button class="btn ghost back" data-a="apvolta">← Voltar</button>';
    h += `<div class="stack"><div class="eyebrow">${sig(info.m)} ${LIVRO[info.livro].nome}</div><h1 class="h1">${MATS[info.m].curto}${info.parte ? ' · parte ' + info.parte : ''}</h1></div>`;
    const idx = (info.idx || []);
    const nav = `<div class="row between"><button class="btn sm" data-a="appnav" data-p="${a - 4}" ${a > 1 ? '' : 'disabled'}>‹ Anteriores</button><span class="small muted num">${a === b ? a : a + '–' + b} de ${n}</span><button class="btn sm" data-a="appnav" data-p="${a + 4}" ${b < n ? '' : 'disabled'}>Próximas ›</button></div>`;
    if (idx.length) h += `<div class="field"><label for="ap-ir">Ir para</label><select id="ap-ir">${idx.map(x => `<option value="${x[0]}" ${x[0] <= a && a < x[0] + 4 ? 'selected' : ''}>${x[1]}</option>`).join('')}</select></div>`;
    h += nav + '<div class="pgs">';
    for (let p = a; p <= b; p++) h += pgHtml(V.part, p);
    h += '</div>' + nav;
    return h;
  }

  function opcoes(q, perm, resp, revelar, acao) {
    const cp = perm.indexOf(q.c);
    return `<div class="opts ${q.img ? 'letras' : ''}">${perm.map((oi, pos) => {
      let cls = '';
      if (revelar) { if (pos === cp) cls = 'right'; else if (pos === resp) cls = 'wrong'; }
      else if (pos === resp) cls = 'sel';
      return `<button class="opt ${cls}" ${acao ? `data-a="${acao}" data-p="${pos}"` : ''} ${revelar ? 'disabled' : ''} ${q.img ? `aria-label="Alternativa ${LETRAS[pos]}"` : ''}><span class="l">${LETRAS[pos]}</span>${q.img ? '' : `<span>${q.o[oi]}</span>`}</button>`;
    }).join('')}</div>`;
  }

  function iniciarQuiz(ids, titulo, origem) {
    const lista = shuffle(ids.slice());
    QZ = { ids: lista, perms: permutar(lista), i: 0, resp: {}, titulo, origem, fim: false };
    go('quiz');
  }
  function vQuiz() {
    const z = QZ;
    if (!z) return vHoje();
    if (z.fim) return vQuizFim();
    const id = z.ids[z.i], q = Q[id], perm = z.perms[id], r = z.resp[id], resp = r !== undefined;
    const cp = perm.indexOf(q.c), certo = resp && acertou(id, perm, r);
    let h = `<div class="row between"><button class="btn ghost back" data-a="sairquiz">← Sair</button><span class="small muted num">Questão ${z.i + 1} de ${z.ids.length}</span></div>`;
    h += `<div class="stack"><div class="eyebrow">${sig(q.m)} ${q.src ? 'Prova oficial' : q.mod} · ${z.titulo}</div><div class="meter b-${q.m}"><i style="width:${(z.i / z.ids.length) * 100}%"></i></div></div>`;
    h += `<section class="card"><div class="q-enun">${enun(q)}</div>${opcoes(q, perm, r, resp, resp ? '' : 'qresp')}`;
    if (resp) {
      h += `<div class="expl"><b class="${certo ? 'ok' : 'bad'}">${q.anulada ? 'Questão anulada: vale ponto para todos.' : certo ? 'Correta.' : 'Incorreta. A resposta é a ' + LETRAS[cp] + '.'}</b> ${q.r}</div>`;
      h += `<div class="row"><button class="btn pri" data-a="qprox">${z.i + 1 < z.ids.length ? 'Próxima questão' : 'Ver resultado'}</button></div>`;
    }
    h += `</section>`;
    return h;
  }
  function fecharQuiz() {
    const z = QZ;
    const ac = z.ids.filter(id => acertou(id, z.perms[id], z.resp[id])).length;
    const sc = ac / z.ids.length;
    z.ac = ac; z.sc = sc;
    if (z.origem.tipo === 'mod') {
      const r = S.mod[z.origem.id] = S.mod[z.origem.id] || {};
      r.tent = (r.tent || 0) + 1; r.last = sc;
      if (r.best == null || sc > r.best) r.best = sc;
      if (sc >= META && !r.ok) r.ok = hoje();
      if (!r.lido) r.lido = hoje();
      r.quando = hoje();
      if (z.origem.rev) S.feito[z.origem.rev] = true;
    }
    marcarAtividade();
    z.fim = true;
    salvar();
  }
  function vQuizFim() {
    const z = QZ, mid = z.origem.tipo === 'mod' ? z.origem.id : null, m = mid && MOD[mid];
    const passou = z.sc >= META;
    const erradas = z.ids.filter(id => !acertou(id, z.perms[id], z.resp[id]));
    let h = `<div class="stack"><div class="eyebrow">Debriefing · ${z.titulo}</div><h1 class="h1">${m ? (passou ? 'Módulo dominado' : 'Ainda não chegou aos 80%') : (z.ac === z.ids.length ? 'Tudo certo' : 'Rodada concluída')}</h1></div>`;
    h += `<section class="card"><div class="row between"><span class="score num">${z.ac}<small> de ${z.ids.length}</small></span><span class="chip ${passou ? 'ok' : 'warn'}">${pct(z.sc)}</span></div>
      <p style="margin:0">${m ? (passou ? 'Você bateu a meta. O módulo entra nas revisões espaçadas pelos flashcards.' : `A meta é ${Math.ceil(z.ids.length * META)} acertos. Releia a teoria nos pontos das questões abaixo e refaça o quiz.`) : (z.origem.tipo === 'erros' ? 'As questões que você acertou saíram do caderno de erros.' : z.origem.tipo === 'oficial' ? 'Questões oficiais da EEAR, corrigidas pelo gabarito oficial. As erradas foram para o caderno de erros.' : '')}</p>
      <div class="row">${m ? `<button class="btn ${passou ? '' : 'pri'}" data-a="quizmod" data-id="${mid}">Refazer o quiz</button><button class="btn" data-a="mod" data-id="${mid}">Voltar à teoria</button>` : z.origem.tipo === 'oficial' ? `<button class="btn pri" data-a="mod" data-id="${z.origem.id}">Voltar ao módulo</button>` : `<button class="btn pri" data-a="tab" data-v="treino">Voltar ao treino</button>`}
      ${m && passou && MODS[MODS.indexOf(m) + 1] ? `<button class="btn pri" data-a="mod" data-id="${MODS[MODS.indexOf(m) + 1].id}">Próximo módulo</button>` : ''}</div></section>`;
    if (erradas.length) h += `<section class="card"><h2 class="h2">Revise os erros</h2>${erradas.map(id => { const q = Q[id]; return `<details class="rev"><summary>${rotulo(q)} · ${resumo(q.e)}</summary><div class="q-enun">${enun(q)}</div><p><b>Resposta:</b> ${q.of ? LETRAS[q.c] + ') ' : ''}${q.o[q.c]}</p><div class="expl">${q.r}</div></details>`; }).join('')}</section>`;
    return h;
  }
  function resumo(html) {
    const t = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return t.length > 90 ? t.slice(0, 88) + '…' : t;
  }

  function iniciarFC(ids, titulo) {
    FC = { fila: shuffle(ids.slice()), i: 0, virado: false, ok: 0, err: 0, titulo, rep: {} };
    go('fc');
  }
  function vFC() {
    const f = FC;
    if (!f) return vTreino();
    let h = `<div class="row between"><button class="btn ghost back" data-a="tab" data-v="treino">← Treino</button><span class="small muted num">${Math.min(f.i + 1, f.fila.length)} de ${f.fila.length}</span></div>`;
    if (f.i >= f.fila.length) {
      h += `<div class="stack"><div class="eyebrow">Flashcards · ${f.titulo}</div><h1 class="h1">Revisão concluída</h1></div><section class="card"><p style="margin:0"><b>${f.ok}</b> ${f.ok === 1 ? 'acerto' : 'acertos'} e <b>${f.err}</b> ${f.err === 1 ? 'erro' : 'erros'}. Os cartões que você errou voltam amanhã.</p><div class="row"><button class="btn pri" data-a="tab" data-v="treino">Voltar ao treino</button></div></section>`;
      return h;
    }
    const c = CARDS[f.fila[f.i]], m = MOD[c.mod];
    h += `<div class="stack"><div class="eyebrow">Flashcards · ${f.titulo}</div><div class="meter b-${c.m}"><i style="width:${(f.i / f.fila.length) * 100}%"></i></div></div>`;
    h += `<div class="fc"><span class="chip tag">${sig(c.m)} ${m.id}</span><div>${c.f}</div>${f.virado ? `<div class="verso">${c.v}</div>` : ''}</div>`;
    h += f.virado
      ? `<div class="row" style="justify-content:center"><button class="btn" data-a="fcaval" data-ok="0">Errei</button><button class="btn pri" data-a="fcaval" data-ok="1">Acertei</button></div>`
      : `<div class="row" style="justify-content:center"><button class="btn pri" data-a="fcvirar">Mostrar resposta</button></div>`;
    return h;
  }

  function vTreino() {
    let h = `<div class="stack"><div class="eyebrow">Treino diário</div><h1 class="h1">Flashcards e erros</h1></div>`;
    const dv = devidos(), lib = liberados();
    h += `<section class="card"><div class="row between"><h2 class="h2">Flashcards</h2><span class="small muted">${lib.length} liberados de ${Object.keys(CARDS).length}</span></div>
      <p style="margin:0">${dv.length ? `<b>${dv.length}</b> para revisar hoje.` : (lib.length ? 'Nada pendente hoje. Volte amanhã.' : 'Os cartões de um módulo são liberados quando você abre a teoria dele.')}</p>
      <div class="row">${dv.length ? `<button class="btn pri" data-a="fcini">Revisar todos (${dv.length})</button>` : ''}${ORD.map(s => { const n = devidos(s).length; return n ? `<button class="btn sm" data-a="fcini" data-s="${s}">${MATS[s].curto} (${n})</button>` : ''; }).join('')}</div></section>`;
    const ne = nErros();
    h += `<section class="card"><div class="row between"><h2 class="h2">Caderno de erros</h2><span class="small muted">${plural(ne, 'questão', 'questões')}</span></div>
      <p style="margin:0">Toda questão que você erra em quiz ou simulado vem para cá. Ela sai quando você acerta de novo.</p>
      <div class="row">${ne ? `<button class="btn pri" data-a="errosini">Refazer erros (${Math.min(ne, 20)})</button>` : ''}${ORD.map(s => { const n = nErros(s); return n ? `<button class="btn sm" data-a="errosini" data-s="${s}">${MATS[s].curto} (${n})</button>` : ''; }).join('')}</div>`;
    if (ne) {
      h += ORD.map(s => {
        const ids = Object.keys(S.erros).filter(id => Q[id] && Q[id].m === s);
        if (!ids.length) return '';
        return `<details class="rev"><summary>${MATS[s].curto} · ${ids.length}</summary>${ids.map(id => { const q = Q[id]; return `<details class="rev"><summary>${rotulo(q)} · ${resumo(q.e)} <span class="chip bad">${S.erros[id]}x</span></summary><div class="q-enun">${enun(q)}</div><p><b>Resposta:</b> ${q.of ? LETRAS[q.c] + ') ' : ''}${q.o[q.c]}</p><div class="expl">${q.r}</div></details>`; }).join('')}</details>`;
      }).join('');
    }
    h += `</section>`;
    const comErro = AP.sets.filter(s => { const r = S.ap[s.id]; return r && r.ok && Object.keys(r.ok).some(k => r.ok[k] === 0); });
    if (AP.sets.length) h += `<section class="card"><div class="row between"><h2 class="h2">Erros da apostila</h2><span class="small muted">${plural(nErrosAp(), 'questão', 'questões')}</span></div>${comErro.length ? `<p style="margin:0">Conjuntos com questões erradas. Abra e use "Refazer as erradas" depois de rever a teoria.</p><div class="mods">${comErro.map(s => apLinha(s)).join('')}</div>` : '<p class="small muted" style="margin:0">Nenhum erro pendente nas folhas de respostas da apostila.</p>'}</section>`;
    const abaixo = MODS.filter(m => { const r = S.mod[m.id]; return r && r.best != null && r.best < META; });
    h += `<section class="card"><h2 class="h2">Módulos abaixo de 80%</h2>${abaixo.length ? `<div class="mods">${abaixo.map(m => `<button class="modrow" data-a="mod" data-id="${m.id}"><span class="sigla c-${m.m}">${m.id}</span><span class="mt">${m.t}</span><span class="chip warn">${pct(S.mod[m.id].best)}</span></button>`).join('')}</div>` : '<p class="small muted" style="margin:0">Nenhum. Todo quiz feito está na meta.</p>'}</section>`;
    return h;
  }

  /* ---------- simulados ---------- */
  function iniciarSim(tipo, s) {
    let ids = [], lim = 0;
    if (tipo === 'completo') { ORD.forEach(x => { ids = ids.concat(shuffle(amostraPeso(QS[x], 24))); }); lim = Number(S.cfg.tempoSim) || 240; }
    else if (tipo === 'materia') { ids = shuffle(amostraPeso(QS[s], 24)); lim = 60; }
    else if (tipo === 'prova') { const p = PROVA[s]; if (!p) return; ids = p.ids.slice(); lim = p.min || 240; }
    else if (tipo === 'oficial') { ORD.forEach(x => { ids = ids.concat(shuffle(QO[x].slice()).slice(0, 24)); }); lim = Number(S.cfg.tempoSim) || 240; }
    else { ORD.forEach(x => { ids = ids.concat(amostraDiag(x, 10)); }); lim = 0; }
    S.ativo = { tipo, materia: tipo === 'materia' ? s : null, prova: tipo === 'prova' ? s : null, ids, perms: permutar(ids), resp: {}, marc: {}, ini: Date.now(), lim, i: 0 };
    salvar();
    mapa = false;
    go('sim');
  }
  function restante() { const a = S.ativo; return a && a.lim ? Math.max(0, a.lim * 60 - Math.floor((Date.now() - a.ini) / 1000)) : null; }
  function ftempo(s) { const H = Math.floor(s / 3600), M = Math.floor((s % 3600) / 60), Se = s % 60; return (H ? H + ':' + pad(M) : M) + ':' + pad(Se); }
  function nomeSim(x, curto) {
    if (x.tipo === 'diag') return curto ? 'diagnóstico' : 'Diagnóstico';
    if (x.tipo === 'completo') return curto ? 'completo' : 'Simulado completo';
    if (x.tipo === 'prova') return (PROVA[x.prova] && PROVA[x.prova].nome) || 'Prova oficial';
    if (x.tipo === 'oficial') return curto ? 'oficial misto' : 'Simulado com questões oficiais';
    return curto ? MATS[x.mat || x.materia].curto : 'Simulado de ' + MATS[x.mat || x.materia].curto;
  }
  function vSim() {
    const a = S.ativo;
    if (!a) return vSimulados();
    const id = a.ids[a.i], q = Q[id], r = a.resp[id];
    const nResp = Object.keys(a.resp).length, rem = restante();
    const nome = nomeSim(a);
    let h = `<div class="simbar">${rem != null ? `<span class="timer num ${rem < 600 ? 'low' : ''}" id="timer">${ftempo(rem)}</span>` : '<span class="small muted">sem cronômetro</span>'}<span class="small muted num">${nResp}/${a.ids.length} respondidas</span><span style="flex:1"></span><button class="btn sm" data-a="simmapa">${mapa ? 'Fechar mapa' : 'Mapa'}</button><button class="btn sm pri" data-a="entregar">Entregar</button></div>`;
    if (pedindo === 'entregar') h += `<div class="confirm"><p>${nResp < a.ids.length ? `Faltam ${a.ids.length - nResp} questões. ` : ''}Entregar agora e ver a correção?</p><button class="btn sm" data-a="cancelar">Continuar respondendo</button><button class="btn sm pri" data-a="entregarok">Entregar</button></div>`;
    if (mapa) h += `<section class="card"><div class="qmap">${a.ids.map((x, k) => `<button data-a="simir" data-i="${k}" class="${a.resp[x] !== undefined ? 'ans' : ''} ${a.marc[x] ? 'mk' : ''} ${k === a.i ? 'cur' : ''}" aria-label="Questão ${k + 1}">${k + 1}</button>`).join('')}</div><span class="small muted">Contorno laranja embaixo = marcada para revisar.</span></section>`;
    h += `<div class="stack"><div class="eyebrow">${nome} · ${sig(q.m)} ${MATS[q.m].curto}</div><div class="row between"><b class="num">Questão ${a.i + 1} de ${a.ids.length}</b>${a.marc[id] ? '<span class="chip warn">marcada</span>' : ''}</div></div>`;
    h += `<section class="card"><div class="q-enun">${enun(q)}</div>${opcoes(q, a.perms[id], r, false, 'simresp')}</section>`;
    h += `<div class="row between"><button class="btn" data-a="simnav" data-d="-1" ${a.i === 0 ? 'disabled' : ''}>← Anterior</button><button class="btn sm" data-a="simmarc">${a.marc[id] ? 'Desmarcar' : 'Marcar para revisar'}</button><button class="btn ${r !== undefined ? 'pri' : ''}" data-a="simnav" data-d="1" ${a.i === a.ids.length - 1 ? 'disabled' : ''}>Próxima →</button></div>`;
    if (pedindo === 'descartar') h += `<div class="confirm"><p>Descartar este simulado? As respostas serão perdidas.</p><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="descartarok">Descartar</button></div>`;
    else h += `<div class="row"><button class="btn ghost" data-a="descartar">Descartar simulado</button></div>`;
    return h;
  }
  function entregar() {
    const a = S.ativo;
    if (!a) return;
    const r = {};
    a.ids.forEach(id => {
      const q = Q[id], pos = a.resp[id], ok = acertou(id, a.perms[id], pos);
      r[q.m] = r[q.m] || [0, 0];
      r[q.m][1]++;
      if (ok) r[q.m][0]++; else S.erros[id] = (S.erros[id] || 0) + 1;
    });
    const reg = { d: hoje(), tipo: a.tipo, mat: a.materia, prova: a.prova || null, r, min: Math.round((Date.now() - a.ini) / 60000) };
    S.sims.push(reg);
    if (a.tipo === 'diag') { S.diag = {}; ORD.forEach(s => { S.diag[s] = r[s] ? r[s][0] / r[s][1] : 0.5; }); }
    S.ult = { reg, ids: a.ids, perms: a.perms, resp: a.resp };
    S.ativo = null;
    marcarAtividade();
    salvar();
    go('res');
  }
  function vRes() {
    const u = S.ult;
    if (!u) return vSimulados();
    const reg = u.reg, ks = ORD.filter(s => reg.r[s]);
    const med = media(reg);
    const elimina = ks.some(s => reg.r[s][0] / reg.r[s][1] < 0.5) || med < 0.5;
    const nome = nomeSim(reg);
    let h = `<div class="stack"><div class="eyebrow">Debriefing · ${nome} · ${fdata(dnum(reg.d))}</div><h1 class="h1">${reg.tipo === 'diag' ? 'Seu ponto de partida' : (med >= META && !ks.some(s => reg.r[s][0] / reg.r[s][1] < META) ? 'Meta de 80% batida' : 'Resultado do simulado')}</h1></div>`;
    h += `<section class="card"><div class="row between"><div><div class="eyebrow">Média</div><span class="score num">${nota(med)}</span></div>${reg.tipo === 'completo' || reg.tipo === 'prova' || reg.tipo === 'oficial' ? `<span class="chip ${elimina ? 'bad' : (med >= META ? 'ok' : 'warn')}">${elimina ? 'Abaixo do mínimo do edital' : (med >= META ? 'Na meta do curso' : 'Acima do mínimo, abaixo da meta')}</span>` : ''}</div>
      <div class="tbl tbl-res"><table><thead><tr><th>Matéria</th><th class="num">Acertos</th><th class="num">Nota</th><th>Situação</th></tr></thead><tbody>${ks.map(s => { const x = reg.r[s][0] / reg.r[s][1]; return `<tr><td>${sig(s)} ${MATS[s].curto}</td><td class="num">${reg.r[s][0]}/${reg.r[s][1]}</td><td class="num">${nota(x)}</td><td>${x >= META ? '<span class="chip ok">meta</span>' : x >= 0.5 ? '<span class="chip warn">abaixo da meta</span>' : '<span class="chip bad">abaixo de 5</span>'}</td></tr>`; }).join('')}</tbody></table></div>
      <p class="small muted" style="margin:0">${reg.tipo === 'diag' ? 'O plano agora dá mais tempo às matérias com nota menor. ' : ''}Meta do curso: nota 8,0 em cada matéria. Mínimo do edital: 5,0 em cada matéria e média 5,0.${reg.min ? ' Tempo usado: ' + fh(reg.min / 60) + '.' : ''}</p></section>`;
    const porMod = {};
    u.ids.forEach(id => { if (Q[id].mod && !acertou(id, u.perms[id], u.resp[id])) porMod[Q[id].mod] = (porMod[Q[id].mod] || 0) + 1; });
    const top = Object.keys(porMod).sort((a, b) => porMod[b] - porMod[a]).slice(0, 6);
    if (top.length) h += `<section class="card"><h2 class="h2">Onde você mais errou</h2><div class="mods">${top.map(id => `<button class="modrow" data-a="mod" data-id="${id}"><span class="sigla c-${MOD[id].m}">${id}</span><span class="mt">${MOD[id].t}</span><span class="chip bad">${plural(porMod[id], 'erro', 'erros')}</span></button>`).join('')}</div></section>`;
    h += `<section class="card"><h2 class="h2">Correção completa</h2>${u.ids.map((id, k) => {
      const q = Q[id], pos = u.resp[id], perm = u.perms[id], ok = acertou(id, perm, pos);
      return `<details class="rev"><summary>${q.src ? q.src.replace(/^.*· /, '') : k + 1}. ${sig(q.m)} ${q.anulada ? '<span class="chip">anulada</span>' : ok ? '<span class="chip ok">certa</span>' : pos === undefined ? '<span class="chip">em branco</span>' : '<span class="chip bad">errada</span>'} ${resumo(q.e)}</summary><div class="q-enun">${enun(q)}</div>${opcoes(q, perm, pos, true, '')}<div class="expl">${q.r}</div></details>`;
    }).join('')}</section>`;
    h += `<div class="row"><button class="btn pri" data-a="tab" data-v="treino">Ir para o caderno de erros</button><button class="btn" data-a="tab" data-v="simulados">Voltar aos simulados</button></div>`;
    return h;
  }
  function grafico() {
    const ss = S.sims.filter(x => x.tipo === 'completo' || x.tipo === 'prova' || x.tipo === 'oficial').slice(-12);
    if (ss.length < 1) return '';
    const W = 640, H = 220, L = 34, R = 12, T = 14, B = 30;
    const x = i => L + (ss.length === 1 ? (W - L - R) / 2 : i * (W - L - R) / (ss.length - 1));
    const y = v => T + (1 - v / 10) * (H - T - B);
    let g = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Médias dos simulados completos">`;
    [0, 5, 8, 10].forEach(v => { g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1" ${v === 5 || v === 8 ? 'stroke-dasharray="4 4"' : ''}/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="12" fill="var(--muted)" font-family="IBM Plex Mono, monospace">${v}</text>`; });
    g += `<text x="${W - R}" y="${y(8) - 6}" text-anchor="end" font-size="11" fill="var(--ok)">meta 8,0</text><text x="${W - R}" y="${y(5) - 6}" text-anchor="end" font-size="11" fill="var(--bad)">mínimo 5,0</text>`;
    const pts = ss.map((s, i) => [x(i), y(media(s) * 10)]);
    if (pts.length > 1) g += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>`;
    pts.forEach((p, i) => { g += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 5 : 3.5}" fill="var(--accent)"/><text x="${p[0]}" y="${H - 10}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono, monospace">${fdata(dnum(ss[i].d))}</text>`; });
    return `<div class="chart">${g}</svg></div>`;
  }
  function vSimulados() {
    let h = `<div class="stack"><div class="eyebrow">Condições de prova</div><h1 class="h1">Simulados</h1></div>`;
    if (S.ativo) h += `<div class="banner acc"><p>Simulado em andamento: ${Object.keys(S.ativo.resp).length} de ${S.ativo.ids.length} respondidas.</p><button class="btn sm pri" data-a="go" data-v="sim">Continuar</button></div>`;
    h += `<section class="grid2">
      <div class="card"><div class="eyebrow">Ponto de partida</div><h2 class="h2">Diagnóstico</h2><p class="small" style="margin:0">40 questões, 10 por matéria, sem cronômetro. Ajusta o peso de cada matéria no plano.</p><button class="btn ${S.diag ? '' : 'pri'}" data-a="simini" data-tipo="diag" ${S.ativo ? 'disabled' : ''}>${S.diag ? 'Refazer diagnóstico' : 'Começar'}</button></div>
      <div class="card"><div class="eyebrow">Como no dia da prova</div><h2 class="h2">Simulado completo</h2><p class="small" style="margin:0">96 questões, 24 por matéria, em ${fh((Number(S.cfg.tempoSim) || 240) / 60)}. Use folha de rascunho e nada de consulta.</p><button class="btn pri" data-a="simini" data-tipo="completo" ${S.ativo ? 'disabled' : ''}>Começar</button></div>
    </section>`;
    const okOf = ORD.every(x => QO[x].length >= 24);
    h += `<section class="card"><div class="eyebrow">100% fiel à prova</div><h2 class="h2">Provas anteriores oficiais</h2>${PROVAS.length
      ? `<p class="small" style="margin:0">Provas reais da EEAR, na ordem original e com o gabarito oficial. Faça como no dia: tempo de prova, rascunho e nada de consulta. Toque numa questão para ampliar.</p><div class="tasks">${PROVAS.map(p => { const feitas = S.sims.filter(x => x.prova === p.id); const ult = feitas[feitas.length - 1]; return `<div class="task"><span class="sigla">${(p.data || '').slice(0, 4)}</span><div class="tt"><b>${p.nome}</b><div class="small muted">${p.ids.length} questões · ${fh((p.min || 240) / 60)}${ult ? ' · última média ' + nota(media(ult)) : ''}</div></div><button class="btn sm pri" data-a="simini" data-tipo="prova" data-s="${p.id}" ${S.ativo ? 'disabled' : ''}>${ult ? 'Refazer' : 'Fazer'}</button></div>`; }).join('')}</div>
        <div class="row"><button class="btn" data-a="simini" data-tipo="oficial" ${S.ativo || !okOf ? 'disabled' : ''}>Simulado misto com questões oficiais (96)</button></div>`
      : `<p class="small" style="margin:0">As provas completas das quatro matérias entram aqui, na ordem original e com o gabarito oficial, assim que os PDFs da EEAR forem carregados. Até lá, use os simulados do curso abaixo.</p>`}</section>`;
    const reais = AP.sets.filter(x => x.tipo === 'test' && /prova/i.test(x.t));
    if (reais.length) h += `<section class="card"><div class="eyebrow">Provas reais da apostila</div><h2 class="h2">Inglês das provas da EEAR</h2><p class="small" style="margin:0">A parte de Inglês de ${plural(reais.length, 'prova real', 'provas reais')} da EEAR, com ${AP_PAG ? 'as páginas do livro' : 'a página do PDF da apostila'} e a folha de respostas corrigida pelo gabarito. Faça cada uma em 1 hora, como no dia.</p><div class="mods">${reais.map(x => apLinha(x)).join('')}</div></section>`;
    h += `<section class="card"><div class="eyebrow">Treino focado</div><h2 class="h2">Simulado por matéria</h2><p class="small" style="margin:0">24 questões em 1 hora.</p><div class="row">${ORD.map(s => `<button class="btn" data-a="simini" data-tipo="materia" data-s="${s}" ${S.ativo ? 'disabled' : ''}>${MATS[s].curto}</button>`).join('')}</div></section>`;
    const hist = S.sims.slice().reverse();
    h += `<section class="card"><div class="row between"><h2 class="h2">Histórico</h2>${S.ult ? '<button class="btn sm" data-a="go" data-v="res">Correção do último</button>' : ''}</div>${grafico()}`;
    h += hist.length ? `<div class="tbl tbl-res"><table><thead><tr><th>Data</th><th>Tipo</th>${ORD.map(s => `<th class="num">${MATS[s].sigla}</th>`).join('')}<th class="num">Média</th></tr></thead><tbody>${hist.map(r => `<tr><td class="num">${fdata(dnum(r.d))}</td><td>${nomeSim(r, true)}</td>${ORD.map(s => `<td class="num">${r.r[s] ? nota(r.r[s][0] / r.r[s][1]) : '–'}</td>`).join('')}<td class="num"><b>${nota(media(r))}</b></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">Nenhum simulado feito ainda.</p>';
    h += `</section>`;
    return h;
  }

  /* ---------- render ---------- */
  function pararTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function iniciarTimer() {
    if (!S.ativo || !S.ativo.lim) return;
    timer = setInterval(() => {
      const rem = restante(), el = document.getElementById('timer');
      if (rem === null) return pararTimer();
      if (el) { el.textContent = ftempo(rem); el.classList.toggle('low', rem < 600); }
      if (rem <= 0) { pararTimer(); entregar(); }
    }, 1000);
  }
  function topo() {
    const el = document.getElementById('tminus');
    const n = dnum(S.cfg.prova) - HJ();
    if (!el) return;
    el.innerHTML = isNaN(n) ? '' : n > 0 ? `<b>T−${n} ${n === 1 ? 'DIA' : 'DIAS'}</b>prova ${fdata(dnum(S.cfg.prova))}` : n === 0 ? '<b>HOJE</b>dia da prova' : `<b>—</b>prova ${fdata(dnum(S.cfg.prova))}`;
  }
  function render() {
    pararTimer();
    let h = '';
    switch (V.v) {
      case 'plano': h = vPlano(); break;
      case 'materias': h = vMaterias(); break;
      case 'modulo': h = vModulo(); break;
      case 'quiz': h = vQuiz(); break;
      case 'fc': h = vFC(); break;
      case 'treino': h = vTreino(); break;
      case 'simulados': h = vSimulados(); break;
      case 'sim': h = vSim(); break;
      case 'res': h = vRes(); break;
      case 'apostila': h = vApostila(); break;
      case 'apset': h = vApSet(); break;
      case 'appags': h = vApPags(); break;
      default: h = vHoje();
    }
    app.innerHTML = h;
    app.classList.toggle('largo', V.v === 'apset');
    app.classList.toggle('combarra', V.v === 'apset' && !!app.querySelector('.apbar'));
    lazyPaginas();
    let aba = ABA_DE[V.v];
    if (V.v === 'quiz' && QZ) aba = QZ.origem.tipo === 'mod' ? 'materias' : 'treino';
    document.querySelectorAll('.tab').forEach(b => { if (b.dataset.v === aba) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    topo();
    syncInfo();
    if (V.v === 'sim') iniciarTimer();
  }

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
      case 'mod': marcarLido(d.id); go('modulo', { id: d.id, aba: 'teoria' }); break;
      case 'aba': if (d.aba === 'teoria') marcarLido(V.id); V.aba = d.aba; render(); break;
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
      case 'fcvirar': FC.virado = true; render(); break;
      case 'fcaval': {
        const id = FC.fila[FC.i], ok = d.ok === '1';
        avaliar(id, ok);
        if (ok) FC.ok++; else { FC.err++; if (!FC.rep[id]) { FC.rep[id] = 1; FC.fila.push(id); } }
        FC.i++; FC.virado = false; salvar(); render(); break;
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
        S.cfg.excl = MODS.filter(m => ((S.mod[m.id] || {}).best || 0) >= META).map(m => m.id);
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
      case 'zerar': pedindo = 'zerar'; render(); break;
      case 'expcopiar': {
        const txt = JSON.stringify(S);
        const ok = () => { msgDados = 'Código copiado. Cole no outro aparelho em Plano › Dados › Colar progresso.'; pedindo = null; render(); };
        const falha = () => { msgDados = ''; pedindo = 'exp'; render(); const t = document.getElementById('exp-txt'); if (t) { t.focus(); t.select(); } };
        try { navigator.clipboard.writeText(txt).then(ok, falha); } catch (e) { falha(); }
        break;
      }
      case 'impabrir': msgDados = ''; pedindo = 'imp'; render(); { const t = document.getElementById('imp-txt'); if (t) t.focus(); } break;
      case 'impok': {
        const t = document.getElementById('imp-txt');
        let o = null;
        try { o = JSON.parse((t && t.value || '').trim()); } catch (e) { o = null; }
        if (!o || o.v !== 1) { msgDados = 'Esse código não é um progresso do Missão EEAR. Copie de novo no outro aparelho.'; render(); break; }
        S = mesclar(o); pedindo = null; msgDados = 'Progresso carregado.'; salvar(); render();
        break;
      }
      case 'instalar': if (instalar) { const p = instalar; instalar = null; p.prompt(); p.userChoice.then(() => render(), () => render()); } break;
      case 'zerarok': { const cfg = S.cfg; S = novoEstado(); S.cfg = cfg; S.cfg.excl = []; pedindo = null; salvar(); go('hoje'); break; }
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
    c.alvo = g('cfg-alvo').value;
    const alvo = CAL.find(x => x.id === c.alvo);
    if (alvo) c.prova = alvo.d;
    else if (g('cfg-prova').value) c.prova = g('cfg-prova').value;
    if (g('cfg-inicio').value) c.inicio = g('cfg-inicio').value;
    c.horas = Number(g('cfg-horas').value) || 4;
    c.simDia = Number(g('cfg-sim').value);
    c.tempoSim = Number(g('cfg-tempo').value) || 240;
    c.dias = [0, 1, 2, 3, 4, 5, 6].filter(x => g('cfg-d' + x).checked);
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
  }
  if (hot && typeof hot.ready === 'function') hot.ready(iniciar); else iniciar((hot && hot.data) || {});
})();
