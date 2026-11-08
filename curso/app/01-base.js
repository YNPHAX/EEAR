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
    /* ver: versão do conteúdo do cartão. Sem o 3º campo é 1; um número 2 ou maior marca uma reformulação substancial. */
    CARDS[id] = { id, mod: m.id, m: m.m, f: c[0], v: c[1], ver: Number.isInteger(c[2]) && c[2] > 1 ? c[2] : 1 };
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
  /* Videoaulas do YouTube: no site e no app tocam dentro da aula; no link do curso abrem no YouTube. */
  const VA = E.videoaulas || {};
  const EMBED = !!window.EEAR_SITE;
  const ytUrl = id => 'https://www.youtube.com/watch?v=' + id;
  const aulasDe = s => modulosAtivos().filter(m => m.m === s);
  const nAula = m => aulasDe(m.m).indexOf(m) + 1;
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
  const MESES_L = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const dataLonga = s => { const p = String(s).split('-').map(Number); return p[2] + ' de ' + MESES_L[p[1] - 1] + ' de ' + p[0]; };
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
  /* Acertos para dominar a aula: o menor número que chega a 80% das questões do quiz dela (nem toda aula tem 10). */
  function metaQuiz(m) { const n = m && m.q ? m.q.length : 10; let k = 0; while (k < n && k / n < META) k++; return `meta de ${k} acertos em ${n}`; }
  function amostraPeso(ids, n) {
    return ids.filter(id => Q[id] && Q[id].mod && moduloAtivo(MOD[Q[id].mod]))
      .map(id => ({ id, k: Math.pow(Math.random(), 1 / (MOD[Q[id].mod].peso || 1)) }))
      .sort((a, b) => b.k - a.k).slice(0, n).map(x => x.id);
  }
  function amostraDiag(s, n) {
    const mods = modulosAtivos().filter(m => m.m === s && m.q && m.q.length)
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
      cfg: { modalidade: 'normal', alvo: 'cfs2-2027', prova: '2026-11-22', inicio: hoje(), horas: 3, dias: [0, 1, 2, 3, 4, 5, 6], simDia: 0, tempoSim: 260, excl: [], cv: 2, certs: [] },
      mod: {}, fc: {}, erros: {}, sims: [], diag: null, feito: {}, act: {}, ativo: null, ult: null, ap: {}, aula: {}, ultAula: null
    };
  }
  function mesclar(o) {
    const b = novoEstado();
    Object.keys(b).forEach(k => { if (o && Object.prototype.hasOwnProperty.call(o, k)) b[k] = o[k]; });
    b.cfg = Object.assign(novoEstado().cfg, (o && o.cfg) || {});
    if (o && o.cfg && !o.cfg.alvo) {
      /* Estado da 1ª versão: a data padrão antiga vira a nova meta de 2027. */
      if (o.cfg.prova === '2026-11-22') { b.cfg.alvo = 'cfs2-2027'; b.cfg.prova = '2026-11-22'; }
      else { const p = CAL.find(x => x.d === o.cfg.prova); b.cfg.alvo = p ? p.id : 'outra'; }
    }
    /* O edital fixa a prova escrita em 4h20. Quem ainda tem o padrão antigo de 4h passa para 4h20; quem escolher 4h depois disso continua com 4h. */
    if (o && o.cfg && !(o.cfg.cv >= 2) && Number(o.cfg.tempoSim) === 240) b.cfg.tempoSim = 260;
    ['mod', 'fc', 'erros', 'feito', 'act', 'ap', 'aula'].forEach(k => { if (!b[k] || typeof b[k] !== 'object') b[k] = {}; });
    if (!Array.isArray(b.sims)) b.sims = [];
    /* Entradas que nenhuma versão grava (progresso colado malformado) ou questões que saíram do curso numa atualização
       travariam as telas Hoje, Plano e Simulados sem volta: ficam de fora só na memória, como o resto desta função. */
    const obj = x => !!x && typeof x === 'object' && !Array.isArray(x);
    /* Placar de um simulado: matéria → [acertos, total], sempre com total ≥ 1 (como entregar() grava). */
    const placar = r => { const o = {}; if (obj(r)) Object.keys(r).forEach(k => { const v = r[k]; if (Array.isArray(v) && typeof v[0] === 'number' && typeof v[1] === 'number' && v[1] >= 1) o[k] = v; }); return o; };
    b.sims = b.sims.filter(obj).map(x => Object.assign({}, x, { r: placar(x.r) })).filter(x => Object.keys(x.r).length);
    const questoes = a => { // simulado em andamento ou o último entregue: só questões que ainda existem no curso
      ['resp', 'marc', 'perms'].forEach(k => { if (!obj(a[k])) a[k] = {}; });
      a.ids = a.ids.filter(id => typeof id === 'string' && Q[id]);
      a.ids.forEach(id => { if (!Array.isArray(a.perms[id])) a.perms[id] = [0, 1, 2, 3]; });
      return a.ids.length > 0;
    };
    if (b.ativo != null && !(obj(b.ativo) && Array.isArray(b.ativo.ids) && questoes(b.ativo))) b.ativo = null;
    if (b.ativo) b.ativo.i = Math.min(Math.max(0, Math.floor(Number(b.ativo.i)) || 0), b.ativo.ids.length - 1);
    if (b.ult != null && !(obj(b.ult) && obj(b.ult.reg) && Array.isArray(b.ult.ids) && questoes(b.ult))) b.ult = null;
    if (b.ult) { b.ult.reg = Object.assign({}, b.ult.reg, { r: placar(b.ult.reg.r) }); if (!Object.keys(b.ult.reg.r).length) b.ult = null; }
    /* Certificados (veja "certificados conquistados"): um progresso sem cfg.certs veio de uma versão sem o registro e é
       conferido uma única vez. Tudo aqui fica só na memória: nada é gravado até o aluno estudar. */
    const temCerts = !!(o && o.cfg && Object.prototype.hasOwnProperty.call(o.cfg, 'certs'));
    b.cfg.certs = Array.isArray(b.cfg.certs) ? b.cfg.certs.filter(certValido).map(r => Object.assign({}, r, { ids: r.ids.slice() })) : [];
    if (b.cfg.certsZ != null && !(Number(b.cfg.certsZ) > 0)) delete b.cfg.certsZ;
    if (o && !temCerts) b.cfg.certs = migrarCerts(b);
    registrarCerts(b);
    return b;
  }
  let S = novoEstado();

  function moduloAtivo(m) {
    const modalidades = m && m.modalidades;
    return !modalidades || modalidades.includes((S.cfg && S.cfg.modalidade) || 'normal');
  }
  const modulosAtivos = () => MODS.filter(moduloAtivo);

