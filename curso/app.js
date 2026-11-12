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
    b.cfg = Object.assign(novoEstado().cfg, Object.fromEntries(Object.entries((o && o.cfg && typeof o.cfg === 'object') ? o.cfg : {}).filter(([k]) => !['__proto__', 'prototype', 'constructor'].includes(k))));
    const padrao = novoEstado().cfg;
    Object.keys(padrao).forEach(k => {
      if (Array.isArray(padrao[k])) {
        if (!Array.isArray(b.cfg[k])) b.cfg[k] = padrao[k];
      } else if (typeof b.cfg[k] !== typeof padrao[k] || (typeof b.cfg[k] === 'number' && !isFinite(b.cfg[k]))) b.cfg[k] = padrao[k];
    });
    if (b.cfg.nome != null && typeof b.cfg.nome !== 'string') b.cfg.nome = '';
    b.cfg.dias = b.cfg.dias.filter(n => Number.isInteger(n) && n >= 0 && n <= 6);
    b.cfg.excl = b.cfg.excl.filter(n => typeof n === 'string');

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
  /* Contas (veja "contas neste aparelho"): cada identidade tem as próprias chaves (chave@identidade). Sem conta, valem as
     chaves de sempre, onde já está o progresso de quem nunca entrou numa conta. LS_CONTA lembra a conta em uso. */
  const LS_CONTA = 'missao-eear-conta', BASE_K = 'missao-eear-v1-base';
  /* Operações e checkpoint (14–16): reserva imutável por operação; IDB confirma por oncomplete.
     Chaves legadas continuam reconhecidas na migração e na exclusão. */
  const DIARIO_K = 'missao-eear-v1-diario', ABAS_K = 'missao-eear-v1-abas', QUER_K = 'missao-eear-v1-quer', VIDA_K = 'missao-eear-v1-vida', APAGOU_K = 'missao-eear-v1-local-apagado';
  const loc = { meta: null, vista: null, gen: null, ops: [], pendente: 0, carregado: false, confirmando: false }, lider = { ativa: false, soltar: null, conta: null, espera: null };
  const contaUI = { msg: '', adiado: false, ocupado: false }; // estado da tela da conta (veja "contas neste aparelho")
  let identidade = '', recuperar = null, gravouLocal = true;
  const chave = (k, id) => { const i = id === undefined ? identidade : id; return i ? k + '@' + i : k; };
  /* Lê o progresso da identidade em uso; se for ilegível, guarda uma cópia antes que alguma gravação o cubra. */
  function carregar() {
    let st = novoEstado(), t = null;
    try {
      t = localStorage.getItem(chave(LS));
      if (t) {
        let lido = false;
        try { const o = JSON.parse(t); if (o && o.v === 1) { st = mesclar(o); lido = true; } } catch (e) { /* ilegível */ }
        if (!lido) { try { localStorage.setItem(chave(LS_REC), t); } catch (e) { /* sem espaço para a cópia */ } t = null; }
      }
      recuperar = localStorage.getItem(chave(LS_REC));
      localStorage.removeItem(chave(ABAS_K));
    } catch (e) { /* sem armazenamento local */ }
    try { st = opEstado(metaMigrada(st, lerDiariosDe(identidade))); } catch (e) { /* cópia original permanece exportável */ }
    loc.carregado = false; loc.semIDB = false; loc.pendente = 0; partirDe(t, st); abrirAbas(); // 14-abas.js: diários de abas que fecharam são absorvidos logo depois
    return st;
  }
  try {
    /* A conta lembrada só vale onde ela pode ser confirmada (Firebase configurado, ou o link do curso no Claude). */
    const c = localStorage.getItem(LS_CONTA) || '';
    if ((c.indexOf('firebase:') === 0 && window.EEAR_FIREBASE) || (c.indexOf('claude:') === 0 && window.claude)) identidade = c;
  } catch (e) { /* sem armazenamento local */ }
  S = carregar();

  /* pendente: há estudo deste aparelho que a nuvem ainda não confirmou; semRede: a última tentativa falhou por falta de rede.
     O aviso nunca diz "salvo na sua conta" enquanto houver algo pendente. */
  const nuvem = { ref: null, on: false, busy: false, again: false, fb: false, futura: false, conta: null, pendente: false, semRede: false, apagado: '', reapareceu: false, refPausada: null, reenviar: false, lida: false, erro: '', falhas: 0, tRetry: null }; // lida: a nuvem desta conta já foi lida nesta abertura; erro, falhas, tRetry: veja 13-falhas-nuvem.js
  let tSave = null;
  function salvar(importado) {
    S.t = Date.now();
    fixarAncoras();
    try { persistir(importado); } catch (e) { gravouLocal = false; } // operação reservada; a confirmação durável é assíncrona e aparece no aviso
    consolidar(); // checkpoint transacional, independente de Web Locks
    clearTimeout(tSave);
    tSave = setTimeout(gravar, 1500);
    if (nuvem.ref) { nuvem.pendente = true; syncInfo(); }
  }
  async function gravar(aoFundo) {
    if (loc.incompativel || saindo || !nuvem.ref || (!lider.ativa && !(aoFundo && document.visibilityState === 'hidden'))) return;
    if (nuvem.busy) { nuvem.again = true; return; }
    const ref = nuvem.ref, conta0 = nuvem.conta;
    const atual = () => !saindo && nuvem.ref === ref && nuvem.conta === conta0;
    nuvem.busy = true; clearTimeout(nuvem.tRetry);
    try { await (loc.carga || Promise.resolve()); await (loc.fila || Promise.resolve()); if (!atual()) { nuvem.busy = false; return; } await conciliar(ref); if (atual()) { nuvem.falhas = 0; nuvem.erro = ''; } }
    catch (e) { // veja 13-falhas-nuvem.js
      if (!atual()) { /* resposta de uma sessão anterior: não altera a nova */ }
      else if (e && e.code === 'unavailable' && e.espera !== undefined) nuvem.tRetry = setTimeout(gravar, Math.max(0, e.espera) + 200 + Math.random() * 1000); // nuvem travada por outro aparelho
      else if (erroPassageiro(e)) { nuvem.semRede = true; nuvem.tRetry = setTimeout(gravar, esperaNuvem()); } // sem rede, servidor ocupado ou cota: tenta de novo
      else { nuvem.ref = null; nuvem.on = false; nuvem.erro = String((e && e.code) || 'desconhecido'); } // recusada: para, e o aviso diz; o estudo fica aqui
    }
    nuvem.busy = false;
    syncInfo();
    if (nuvem.again) { nuvem.again = false; return gravar(document.visibilityState === 'hidden'); }
  }
  /* Aparelho sem estudo nenhum ainda (só a configuração): o progresso da nuvem tem preferência. Tarefas marcadas, caderno
     de erros e atividade também contam como estudo (antes não contavam, e um aparelho que só tinha marcado tarefas perdia as marcações). */
  const semEstudo = o => !Object.keys(o.mod).length && !o.sims.length && !Object.keys(o.fc).length && !Object.keys(o.ap).length && !o.diag && !Object.keys(o.aula || {}).length && !Object.keys(o.feito || {}).length && !Object.keys(o.erros || {}).length && !Object.keys(o.act || {}).length;
  /* Calcula a união deste aparelho com o progresso da nuvem (o), sem efeito nenhum: dentro de uma transação, pode rodar
     de novo com uma leitura mais nova. Devolve o que gravar na nuvem (ou null) e o que aplicar aqui depois. */
  function planejarUniao(o) {
    const ex = exclusaoNaNuvem(o); // marca de exclusão (11-exclusao-nuvem.js): nada é unido nem gravado
    if (ex && !ex.ignorar) return ex;
    if (ex) o = null; // o aluno pediu para enviar de novo: a marca é substituída pelo progresso deste aparelho
    if (o && (typeof o !== 'object' || o.v !== 1)) return { futura: true };
    const local = mesclar(JSON.parse(JSON.stringify(S)));
    let u = local, perdido = null, c = null, operacional = false, assinado = true, ep = '', lin = [];
    if (o) {
      assinado = assinaturaOk(o); // sem assinatura válida: gravado (ou alterado) por uma versão antiga do app
      ep = assinado && typeof o.ep === 'string' ? o.ep : ''; // época da nuvem (08-uniao-nuvem.js)
      lin = assinado ? linhagem(o) : []; // gravações de que a nuvem descende (08-uniao-nuvem.js)
      c = mesclar(semAssinatura(JSON.parse(JSON.stringify(o))));
      operacional = opValida(c.cfg._ops) && mesmoConteudo(opPlano(c), opPlano(opEstado(c.cfg._ops)));
      /* A base só vale se for anterior aos dois lados (um progresso colado ou restaurado mais antigo que ela não descende
         dela), se a nuvem foi gravada por esta versão (uma versão antiga grava o progresso inteiro dela por cima, sem
         trava, e o que ela não tinha pareceria apagado do outro lado) e se é da mesma época da nuvem (um aparelho novo
         pode ter unido e assinado por cima de uma gravação antiga, e o documento não descende mais desta base) e se a
         gravação que a base representa está na linhagem da nuvem (uma gravação atrasada de outro aparelho pode ter coberto
         a que esta base confirmou). */
      const b = lerBase(), base = assinado && ep && epocaBase() === ep && lin.includes(idBase()) && b && (b.t || 0) <= (local.t || 0) && (b.t || 0) <= (c.t || 0) ? b : null;
      /* Aparelho que nunca sincronizou e não tem estudo: fica com a nuvem. Um aparelho zerado depois dela passa pela união. */
      if (operacional) u = opCombinarEstados(local, c);
      else if (!b && semEstudo(S) && !((Number(S.cfg.certsZ) || 0) > (Number(c.cfg.certsZ) || 0))) { u = c; juntarCerts(u.cfg, S.cfg, u); registrarCerts(u); } else ({ st: u, perdido } = unirProgresso(base, local, c));
      if (!u.cfg.nome && S.cfg.nome) u.cfg.nome = S.cfg.nome;
    } else if (!S.t) return { nada: true }; // aparelho e nuvem sem progresso: nada a gravar
    // Estados desta arquitetura unem contribuições identificadas, não diferenças de contadores agregados.
    if (c && operacional) u = opCombinarEstados(local, c);
    else if (c && !lerBase() && semEstudo(local)) u = opEstado(opUnir(opMeta(local), opMeta(c)));
    else if (c) {
      const m = opMeta(local), delta = opDelta(m, local, u, 'legado-nuvem:' + resumoDoc(opSemMeta(c)));
      u = opEstado(opUnir(m, delta));
    } else u = opEstado(opMeta(local));
    /* Documento sem assinatura ou sem época (ou nuvem vazia): a união começa uma época nova e é gravada assinada. */
    return { local, u, perdido, ep: ep || novaEpoca(), lin, id: lin[lin.length - 1] || '', gravar: !c || !ep || !lin.length || !uIgual(u, c) };
  }
  /* Lê a nuvem, une e grava. Com transação (Firebase), a leitura e a gravação são atômicas: se outro aparelho gravar no
     meio, a união é refeita sobre o que ele gravou. Sem transação (link do curso no Claude), veja lerUnirGravar
     (10-nuvem-claude.js): com a trava da nuvem, a gravação é conferida; sem ela, a união segue sem base.
     O resultado só é aplicado aqui depois que a nuvem confirmou, e só se a conta continuar a mesma. */
  async function conciliar(ref) {
    const conta0 = nuvem.conta;
    const atual = () => !saindo && nuvem.ref === ref && nuvem.conta === conta0;
    let p = null, modo = 'ok';
    const planejar = o => {
      if (!atual()) return null; // inclusive callbacks repetidos pelo Firestore após troca de conta
      p = planejarUniao(o);
      if (!p.gravar) return null;
      p.id = novoIdGravacao(); // esta gravação entra na linhagem; a base, se confirmada, a representa
      return assinar(Object.assign(JSON.parse(JSON.stringify(p.u)), { ep: p.ep, lin: p.lin.concat(p.id).slice(-LIN_MAX) }));
    };
    if (ref.transacao) await ref.transacao(planejar);
    else modo = await lerUnirGravar(ref, planejar);
    if (!atual()) return; // não sobrescreve o cache de outra sessão/abertura nem confirma a leitura dela
    nuvem.lida = true; // mesmo sem nada a gravar (nuvem e aparelho vazios): a migração do caminho antigo pode seguir
    if (nuvem.conta !== conta0 || !p || p.nada) return;
    if (p.apagado || p.reapareceu) { pausarPorExclusao(ref, p); render(); return; }
    nuvem.reenviar = false; // "Enviar de novo" atendido: a nuvem tem o progresso deste aparelho
    if (p.futura) { nuvem.ref = null; nuvem.on = false; nuvem.futura = true; return; }
    if (p.perdido) { recuperar = JSON.stringify(p.perdido); try { localStorage.setItem(chave(LS_REC), recuperar); } catch (e) { /* sem espaço */ } }
    /* O que o aluno fez enquanto a gravação viajava também fica: união da cópia usada no cálculo com o estado atual. */
    const u = uIgual(S, p.local) ? p.u : opValida(p.u.cfg._ops) ? opCombinarEstados(S, p.u) : unirProgresso(p.local, mesclar(JSON.parse(JSON.stringify(S))), p.u).st;
    if (!uIgual(u, S)) {
      S = u;
      try { persistir(true); } catch (e) { gravouLocal = false; }
      consolidar();
      if (V.v === 'inicio') V = { v: 'hoje' };
      render();
    }
    nuvem.on = true; nuvem.semRede = false; nuvem.pendente = modo === 'conferir' || !uIgual(S, p.u);
    depoisDeGravar(modo, p);
    if (!uIgual(u, p.u)) gravar(); // a união com o que veio depois ainda não está na nuvem
  }
  async function sincronizar(ref, conta) {
    nuvem.ref = ref; nuvem.futura = false; nuvem.semTrava = false; nuvem.semRede = false; nuvem.apagado = ''; nuvem.reapareceu = false; nuvem.lida = false; nuvem.erro = ''; nuvem.falhas = 0; nuvem.conta = String(conta || '');
    await liderar(); // trava de líder (14-abas.js): livre, esta aba sincroniza já; senão, quando a líder fechar
    if (lider.ativa) await gravar();
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
      usarIdentidade('claude:' + id); // o progresso local passa a ser o desta conta
      await sincronizar(db.doc(caminhoNuvem(id)), 'claude:' + id); // progresso2/<id> (12-caminho-novo.js)
      migrarCaminhoAntigo(db.doc(caminhoAntigo(id)), 'claude:' + id); // une o progresso/<id> das versões antigas, sem apagar
    } catch (e) { nuvem.ref = null; nuvem.on = false; syncInfo(); }
  }

  /* ---------- conta do aluno no site: login e progresso na nuvem (Firebase, quando configurado) ---------- */
  const FB = window.EEAR_FIREBASE || null, FB_VERSAO = '12.19.0';
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
      get: async () => { const s = await fs.getDoc(doc), x = s.exists() ? s.data() : null; return { exists: !!x, data: () => deDoc(x) }; },
      set: o => fs.setDoc(doc, paraDoc(o)),
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
    return `<section class="card" id="conta"><h2 class="h2">Entrar ou criar conta</h2><p class="small" style="margin:0">Com uma conta grátis, seu progresso fica salvo na nuvem e você continua no celular, no computador ou no app.</p>
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

  /* ---------- navegação ---------- */
  let V = { v: 'hoje' };
  /* A aba Apostila só volta aberta se existir nesta versão (a versão pública não tem a apostila). */
  try { const a = localStorage.getItem(LS_ABA); if (a && ['hoje', 'plano', 'materias', 'apostila', 'treino', 'simulados'].indexOf(a) >= 0 && (a !== 'apostila' || apVisivel())) V = { v: a }; } catch (e) { /* ignora */ }
  if (S.ativo) V = { v: 'sim' };
  else if (mostrarInicio()) V = { v: 'inicio' };
  let QZ = null, FC = null, timer = null, pedindo = null, mapa = false;
  const ABA_DE = { hoje: 'hoje', plano: 'plano', materias: 'materias', modulo: 'materias', quiz: null, fc: 'treino', treino: 'treino', simulados: 'simulados', sim: 'simulados', res: 'simulados', apostila: 'apostila', apset: 'apostila', appags: 'apostila', cert: 'materias', inicio: null };
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
      case 'quiz': sub = `${sig(m.m)} ${m.id} · ${plural(m.q.length, 'questão', 'questões')}`; bt = `<button class="btn sm" data-a="quizmod" data-id="${m.id}">Fazer</button>`; break;
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
    const primeiro = (S.cfg.nome || '').trim().split(/\s+/)[0];
    h += `<div class="stack"><div class="eyebrow">Briefing · ${flonga(hj)}</div><h1 class="h1">${hj >= prova ? (hj === prova ? 'Dia de prova' : 'Prova realizada') : (primeiro ? 'Missão de hoje, ' + esc(primeiro) : 'Missão de hoje')}</h1></div>`;
    h += cartaoContinuar(d);
    if (novato) {
      h += `<section class="card"><h2 class="h2">Comece aqui</h2>
        <ol class="stack" style="margin:0;padding-left:1.2em">
          <li><b>Confira a data da prova e suas horas por dia</b> na aba Plano. O cronograma se ajusta sozinho.</li>
          <li><b>Faça o diagnóstico</b>: 40 questões, sem cronômetro. O plano dá mais tempo às matérias em que você for pior.</li>
          <li><b>Siga o briefing do dia</b>: teoria, depois o quiz do módulo. O módulo só conta como dominado com 80% de acerto no quiz (8 em 10 na maioria das aulas).</li>
          <li><b>Revise os flashcards todo dia</b> e faça o simulado semanal em condições de prova.</li>
        </ol>
        <div class="row"><button class="btn pri" data-a="simini" data-tipo="diag">Fazer o diagnóstico</button><button class="btn" data-a="tab" data-v="plano">Ajustar o plano</button></div></section>`;
    }
    if (S.ativo) h += `<div class="banner acc"><p>Você tem um simulado em andamento.</p><button class="btn sm pri" data-a="go" data-v="sim">Continuar</button></div>`;
    h += avisoContas();
    if (!gravouLocal) h += `<div class="banner warn" role="alert"><p><b>Seu progresso não está sendo salvo neste aparelho</b> (armazenamento cheio ou bloqueado, como na navegação anônima). Para não perder o que estudou, copie o progresso em Plano › Dados.</p><button class="btn sm" data-a="tab" data-v="plano">Abrir o Plano</button></div>`;
    if (recuperar) {
      h += `<div class="banner warn"><p>Um progresso salvo antes neste aparelho não pôde ser aberto por esta versão do app. Guardamos uma cópia: copie e guarde antes de descartar.${msgRec ? ' ' + msgRec : ''}</p><button class="btn sm" data-a="reccopiar">Copiar</button><button class="btn sm" data-a="recdescartar">Descartar</button></div>`;
      if (pedindo === 'rec') h += `<div class="field"><label for="rec-txt">Selecione e copie a cópia do progresso</label><textarea id="rec-txt" class="codigo" readonly rows="4">${esc(recuperar)}</textarea></div>`;
    }
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
    const abaixo = modulosAtivos().filter(m => { const r = S.mod[m.id]; return r && r.best != null && r.best < META; });
    h += `<section class="grid2">
      <div class="card"><div class="eyebrow">Flashcards</div><div class="row between"><span class="score num">${dv}</span><button class="btn sm" data-a="fcini" ${dv ? '' : 'disabled'}>Revisar</button></div><span class="small muted">${dv ? 'cartões para revisar hoje' : (liberados().length ? 'Nada pendente hoje.' : 'Abra a teoria de um módulo para liberar os cartões dele.')}</span></div>
      <div class="card"><div class="eyebrow">Caderno de erros</div><div class="row between"><span class="score num">${ne}</span><button class="btn sm" data-a="tab" data-v="treino" ${ne ? '' : 'disabled'}>Refazer</button></div><span class="small muted">${abaixo.length ? plural(abaixo.length, 'módulo abaixo de 80%', 'módulos abaixo de 80%') : 'questões para refazer'}</span></div>
    </section>`;
    h += `<section class="card"><div class="row between"><h2 class="h2">Progresso</h2><span class="small muted">meta: 80% em cada aula</span></div><div class="stack">${blocoMaterias()}</div>${ultimoSimResumo()}<div class="sync" id="sync"></div></section>`;
    if (ORD.some(s => certOk(aulasDe(s))) || S.cfg.certs.length) h += cartaoCertificado('geral');
    return h;
  }
  /* Página de entrada do site: aparece para quem chega pela primeira vez. */
  function mostrarInicio() { return window.EEAR_SITE === 'site' && !S.t && !S.cfg.nome; }
  function vInicio() {
    const nQ = modulosAtivos().reduce((a, m) => a + m.q.length, 0), nV = Object.values(VA).reduce((a, v) => a + v.filter(x => x.k !== 'y').length, 0);
    const nOf = PROVAS.reduce((a, p) => a + p.ids.length, 0);
    let h = `<section class="hero"><div class="eyebrow">Missão EEAR · curso preparatório gratuito</div>
      <h1 class="hero-t">Sua aprovação no CFS da EEAR começa aqui</h1>
      <p class="hero-p">Aulas com vídeo, teoria resumida, questões comentadas, flashcards, simulados e as provas oficiais da EEAR com gabarito, num plano de estudos que vai até o dia da prova.</p>
      <form class="hero-f" onsubmit="return false"><div class="field"><label for="ini-nome">Como você quer ser chamado?</label><input id="ini-nome" maxlength="80" autocomplete="name" placeholder="Seu nome"></div><button class="btn pri" data-a="comecar">Começar o curso</button></form>
      <p class="small muted" style="margin:0">Grátis. Funciona no celular e no computador, e dá para instalar como app.</p></section>`;
    h += `<section class="nums">${[[modulosAtivos().length, 'aulas'], [nV, 'videoaulas'], [nQ, 'questões comentadas'], [nOf, 'questões de provas oficiais']].map(x => `<div><b class="num">${x[0]}</b><span>${x[1]}</span></div>`).join('')}</section>`;
    h += `<section class="card"><h2 class="h2">As quatro matérias da prova</h2><div class="stack">${ORD.map(s => `<div class="subj b-${s}">${sig(s)}<span>${MATS[s].nome}</span><span class="small muted num">${aulasDe(s).length} aulas</span></div>`).join('')}</div></section>`;
    h += `<section class="grid2">
      <div class="card"><div class="eyebrow">Como funciona</div><p style="margin:0">Cada aula tem videoaula, resumo, exemplos resolvidos e um quiz de questões comentadas no estilo da EEAR. A aula só conta como concluída com 80% de acerto.</p></div>
      <div class="card"><div class="eyebrow">Plano até a prova</div><p style="margin:0">Você diz a prova alvo e quantas horas tem por dia. O cronograma se monta sozinho, com revisões e simulados semanais.</p></div>
      <div class="card"><div class="eyebrow">Provas oficiais</div><p style="margin:0">Provas anteriores da EEAR na ordem original, com o gabarito oficial e cronômetro de prova.</p></div>
      <div class="card"><div class="eyebrow">Certificado</div><p style="margin:0">Ao concluir todas as aulas de uma matéria, você recebe o certificado de conclusão dela.</p></div>
    </section>`;
    h += cartaoConta();
    h += `<p class="small muted" style="margin:0">Missão EEAR é um curso da INPHAX. Curso livre de estudo, sem vínculo com a EEAR ou com a Força Aérea Brasileira. As videoaulas são vídeos gratuitos do YouTube, com o crédito de cada canal.<br>Contato: ${linkContato} · ${linksLegais}</p>`;
    return h;
  }
  /* Continuar de onde parei: a última aula aberta, ou a próxima do plano de hoje, ou a primeira ainda não concluída. */
  function cartaoContinuar(d) {
    let m = MOD[S.ultAula], de = 'Continuar de onde parei';
    if (m && !moduloAtivo(m)) m = null;
    if (!m || dominado(m)) {
      const t = d && d.tar.find(x => x.mod && MOD[x.mod] && moduloAtivo(MOD[x.mod]) && !dominado(MOD[x.mod]));
      m = t ? MOD[t.mod] : modulosAtivos().find(x => !dominado(x));
      de = S.ultAula ? 'Próxima aula' : 'Sua primeira aula';
    }
    if (!m) return '';
    const ps = passos(m), f = ps.filter(p => p.ok).length, prox = ps.find(p => !p.ok);
    return `<section class="card cont b-${m.m}"><div class="eyebrow">${de}</div>
      <div class="row between"><div class="tt"><b>${MATS[m.m].curto} · Aula ${nAula(m)}: ${esc(m.t)}</b><div class="small muted">${prox ? 'Próximo passo: ' + prox.txt.charAt(0).toLowerCase() + prox.txt.slice(1) : 'Todos os passos feitos'}</div></div><button class="btn pri" data-a="mod" data-id="${m.id}">${f ? 'Continuar' : 'Começar'}</button></div>
      <div class="meter"><i style="width:${f / ps.length * 100}%"></i></div></section>`;
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
        <div class="field"><label for="cfg-modalidade">Modalidade</label><select id="cfg-modalidade"><option value="normal" ${c.modalidade !== 'bct' ? 'selected' : ''}>CFS normal · Inglês básico</option><option value="bct" ${c.modalidade === 'bct' ? 'selected' : ''}>CFS BCT · Inglês intermediário</option></select></div>
        <div class="field"><label for="cfg-prova">Data da prova</label><input type="date" id="cfg-prova" value="${esc(c.prova)}" ${c.alvo === 'outra' ? '' : 'disabled'}></div>
        <div class="field"><label for="cfg-inicio">Início do plano</label><input type="date" id="cfg-inicio" value="${esc(c.inicio)}"></div>
        <div class="field"><label for="cfg-horas">Horas por dia</label><select id="cfg-horas">${[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10].map(x => `<option value="${x}" ${Number(c.horas) === x ? 'selected' : ''}>${fh(x)}</option>`).join('')}</select></div>
        <div class="field"><label for="cfg-sim">Simulado semanal</label><select id="cfg-sim">${[0, 1, 2, 3, 4, 5, 6].map(x => `<option value="${x}" ${Number(c.simDia) === x ? 'selected' : ''}>${DIAS_L[x]}</option>`).join('')}</select></div>
        <div class="field"><label for="cfg-tempo">Tempo do simulado completo</label><select id="cfg-tempo">${[180, 210, 240, 260].map(x => `<option value="${x}" ${Number(c.tempoSim) === x ? 'selected' : ''}>${fh(x / 60)}</option>`).join('')}</select></div>
        <div class="field" style="grid-column:1/-1"><span class="lab">Dias de estudo</span><div class="wk">${[1, 2, 3, 4, 5, 6, 0].map(x => `<label><input type="checkbox" id="cfg-d${x}" ${c.dias.indexOf(x) >= 0 ? 'checked' : ''}><span>${DIAS[x]}</span></label>`).join('')}</div></div>
        ${AP.sets.length ? `<label class="chk" style="grid-column:1/-1"><input type="checkbox" id="cfg-apostila" ${apVisivel() ? 'checked' : ''}><span>Uso as apostilas do curso: mostra a aba Apostila e põe os exercícios delas no plano</span></label>` : ''}
      </form>
      <div class="row"><button class="btn" data-a="replanejar">Replanejar a partir de hoje</button><span class="small muted">Recomeça o cronograma hoje e tira os módulos já dominados.</span></div>
    </section>`;
    p.av.forEach(a => { h += `<div class="banner warn"><p>${a}</p></div>`; });
    if (p.res) {
      const r = p.res;
      h += `<section class="card"><div class="grid2">
        <div><div class="eyebrow">Até a prova</div><div class="score num">${Math.max(0, r.prova - hj)}<small> dias</small></div><div class="small muted">prova em ${flonga(r.prova)}</div></div>
        <div><div class="eyebrow">Conteúdo</div><div class="score num">${modulosAtivos().filter(m => !(c.excl || []).includes(m.id)).length}<small> módulos</small></div><div class="small muted">${r.fimC ? 'teoria termina em ' + fdata(r.fimC) : 'tudo já coberto'} · ${plural(r.est, 'dia de estudo', 'dias de estudo')}</div></div>
      </div>
      <div class="tasks small">
        <div class="task"><span class="sigla">C1</span><div class="tt"><b>Ciclo 1: teoria completa</b><div class="muted">todos os módulos, com quiz, revisão de 7 dias${apVisivel() ? ' e os exercícios de aula da apostila (em sala, units e o Português)' : ''}</div></div><span class="num">${r.fimCiclo[0] ? 'até ' + fdata(r.fimCiclo[0]) : '—'}</span></div>
        <div class="task"><span class="sigla">C2</span><div class="tt"><b>Ciclo 2: revisão ativa</b><div class="muted">todos os módulos de novo, do que mais cai para o que menos cai${apVisivel() ? ', com os exercícios para casa e as provas reais da apostila' : ''}</div></div><span class="num">${r.fimCiclo[1] ? 'até ' + fdata(r.fimCiclo[1]) : r.fimCiclo[0] ? 'parcial' : 'sem tempo'}</span></div>
        <div class="task"><span class="sigla">C3</span><div class="tt"><b>Ciclo 3: o que mais cai</b><div class="muted">módulos de incidência média e alta</div></div><span class="num">${r.fimCiclo[2] ? 'até ' + fdata(r.fimCiclo[2]) : r.fimCiclo[1] ? 'parcial' : 'sem tempo'}</span></div>
      </div></section>`;
    }
    h += `<section class="card"><h2 class="h2">Como a prova funciona</h2>
      <ul class="stack small" style="margin:0;padding-left:1.2em">
        <li><b>96 questões objetivas</b>, 24 de cada matéria (Português, Inglês, Matemática e Física), com 4 alternativas.</li>
        <li><b>Eliminação</b>: nota abaixo de 5,0 em qualquer matéria ou média final abaixo de 5,0 (nota de 0 a 10). A classificação é pela média, então a meta do curso é 8,0: cerca de 19 acertos em 24 por matéria.</li>
        <li><b>Questões oficiais</b>: as provas anteriores da EEAR, com gabarito oficial, ficam na aba Simulados e na aba Provas de cada módulo.</li>
        <li style="overflow-wrap:break-word"><b>Datas</b>: confirme sempre no edital oficial, em ingresso.eear.fab.mil.br.</li>
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
    h += cartaoConta();
    h += `<section class="card"><h2 class="h2">Dados</h2><p class="small muted" style="margin:0">Zerar apaga notas, flashcards, simulados, o caderno de erros e os certificados conquistados. A configuração do plano é mantida.</p>
      ${pedindo === 'zerar' ? `<div class="confirm"><p>Apagar todo o progresso? Isso não pode ser desfeito.</p><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="zerarok">Apagar</button></div>` : `<div class="row"><button class="btn" data-a="zerar">Zerar progresso</button></div>`}
      <div class="aphead">Levar o progresso para outro aparelho</div>
      <p class="small muted" style="margin:0">Copie o código do progresso aqui e cole no outro aparelho, em Plano › Dados › Colar progresso. Vale entre o site, o app e o link do curso.</p>
      <div class="row"><button class="btn" data-a="expcopiar">Copiar meu progresso</button><button class="btn" data-a="impabrir">Colar progresso</button></div>
      ${pedindo === 'exp' ? `<div class="field"><label for="exp-txt">Selecione e copie o código</label><textarea id="exp-txt" class="codigo" readonly rows="4">${esc(JSON.stringify(S))}</textarea></div>` : ''}
      ${pedindo === 'imp' ? `<div class="field"><label for="imp-txt">Cole aqui o código do outro aparelho</label><textarea id="imp-txt" class="codigo" rows="4"></textarea></div><div class="confirm"><p>O estudo do código será unido ao deste aparelho. As preferências do código serão carregadas.</p><label><input type="checkbox" id="imp-substituir"> Substituir o estudo deste aparelho pelo código, mantendo os certificados conquistados</label><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="impok">Carregar progresso</button></div>` : ''}
      ${blocoDados()}
      ${msgDados ? `<p class="small" role="status" style="margin:0">${msgDados}</p>` : ''}
      <div class="sync" id="sync"></div></section>`;
    h += cartaoInstalar();
    h += cartaoSobre();
    return h;
  }
  /* Instalação como app: só no site (no app de Android e no link do curso ela não se aplica). */
  let instalar = null, msgDados = '', msgRec = '';
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
    h += '<div class="row"><button class="btn" data-a="compartilhar">Indicar o curso para alguém</button></div>';
    return h + '</section>';
  }

  function vMaterias() {
    const s = V.s && MATS[V.s] ? V.s : (V.s = ORD[0]);
    let h = `<div class="stack"><div class="eyebrow">Conteúdo programático</div><h1 class="h1">Matérias</h1></div>`;
    h += `<div class="seg" role="group" aria-label="Matéria">${ORD.map(x => `<button data-a="mat" data-s="${x}" aria-pressed="${x === s}">${MATS[x].curto}</button>`).join('')}</div>`;
    const p = progMat(s), ms = aulasDe(s), atual = ms.find(m => !dominado(m));
    const comecou = ms.some(m => S.mod[m.id] || S.aula[m.id]);
    h += `<section class="card b-${s}"><div class="row between"><h2 class="h2">${MATS[s].nome}</h2><span class="small muted num">${p.dom} de ${p.tot} aulas concluídas</span></div><div class="meter"><i style="width:${(p.dom / p.tot) * 100}%"></i></div>
      ${atual ? `<div class="row"><button class="btn pri" data-a="mod" data-id="${atual.id}">${comecou ? 'Continuar' : 'Começar'}: Aula ${nAula(atual)} · ${esc(atual.t)}</button></div>` : ''}
      <ol class="trilha">${ms.map((m, i) => {
        const st = estMod(m.id), ps = passos(m), f = ps.filter(x => x.ok).length, ok = dominado(m);
        return `<li><button class="trow ${ok ? 'ok' : m === atual ? 'cur' : ''}" data-a="mod" data-id="${m.id}"><span class="tn" aria-hidden="true">${ok ? ICON_OK : i + 1}</span><span class="tb"><span class="mt">${m.t}</span><span class="peso" title="Incidência estimada">Aula ${i + 1} · ${bolinhas(m.peso)} · ${fh(m.h)}${(VA[m.id] || []).length ? ' · videoaula' : ''}</span><span class="tprog" title="${f} de ${ps.length} passos"><i style="width:${f / ps.length * 100}%"></i></span></span><span class="chip ${st.k}">${st.txt}</span></button></li>`;
      }).join('')}</ol>
      <p class="small muted" style="margin:0">● incidência estimada na prova (●●● = cai muito). A barrinha mostra os passos feitos: vídeo, teoria, exemplos, quiz e flashcards.</p></section>`;
    h += cartaoCertificado(s);
    h += `<section class="card"><h2 class="h2">Mais vídeos de ${MATS[s].curto}</h2><p class="small muted" style="margin:0">Canais gratuitos para complementar as aulas. Os links abrem a busca do YouTube em outra aba.</p>
      <div class="stack">${CANAIS[s].map(cn => `<a class="vlink" href="${yt(cn)}" target="_blank" rel="noopener">${cn}</a>`).join('')}<a class="vlink" href="${yt('EEAR ' + MATS[s].curto + ' questões resolvidas')}" target="_blank" rel="noopener">Questões de ${MATS[s].curto} da EEAR resolvidas</a></div></section>`;
    return h;
  }

  /* ---------- certificado de conclusão (por matéria e do curso completo) ---------- */
  const certOk = ms => ms.every(m => dominado(m));
  function codigoCert(txt) {
    const fnv = semente => { let x = semente >>> 0; for (let i = 0; i < txt.length; i++) { x ^= txt.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x; };
    const parte = x => (x % 1679616).toString(36).toUpperCase().padStart(4, '0');
    return parte(fnv(2166136261)) + '-' + parte(fnv(3735928559));
  }
  /* Certificados registrados de uma matéria (com a posição em S.cfg.certs), do mais recente para o mais antigo. */
  const certsDe = s => S.cfg.certs.map((r, i) => Object.assign({ i }, r)).filter(r => r.s === s).sort((a, b) => b.d.localeCompare(a.d) || b.ids.length - a.ids.length);
  const MODAL_NOME = { normal: 'CFS normal', bct: 'CFS BCT' };
  /* O registro do certificado que as aulas atuais liberam, se elas estiverem todas concluídas. */
  function certAtual(s) {
    const ms = s === 'geral' ? modulosAtivos() : aulasDe(s);
    if (!ms.length || !certOk(ms)) return null;
    const k = certChave({ s, mod: certModal(s) ? (S.cfg.modalidade || 'normal') : null, ids: ms.map(m => m.id) });
    if (!S.cfg.certs.some(r => certChave(r) === k)) registrarCerts(S);  // só na memória; vai para o disco no próximo estudo
    const i = S.cfg.certs.findIndex(r => certChave(r) === k);
    return i < 0 ? null : Object.assign({ i }, S.cfg.certs[i]);
  }
  function cartaoCertificado(s) {
    const ms = s === 'geral' ? modulosAtivos() : aulasDe(s), ok = certOk(ms), feitas = ms.filter(dominado).length;
    const nome = s === 'geral' ? 'do curso completo' : 'de ' + MATS[s].curto, atual = ok ? certAtual(s) : null;
    const regs = certsDe(s), outros = regs.filter(r => !atual || r.i !== atual.i);
    let h = `<section class="card cert-cta"><div class="row between"><h2 class="h2">Certificado ${nome}</h2><span class="chip ${ok || regs.length ? 'ok' : ''}">${ok ? 'liberado' : regs.length ? 'conquistado' : feitas + '/' + ms.length}</span></div>
      <p class="small" style="margin:0">${ok ? `Você concluiu ${s === 'geral' ? 'todas as aulas das quatro matérias' : 'todas as aulas desta matéria'} com 80% ou mais no quiz.` : `${regs.length ? 'O certificado que você já conquistou continua valendo e pode ser aberto e impresso abaixo. Para o certificado com as aulas atuais, conclua' : 'Conclua'} as ${ms.length} aulas ${s === 'geral' ? 'das quatro matérias ' : ''}com 80% ou mais no quiz${regs.length ? '' : ' para liberar o certificado'}. Faltam ${ms.length - feitas}.`}</p>
      ${ok ? `<div class="row"><button class="btn pri" data-a="cert" data-s="${s}">Ver o certificado</button></div>` : ''}`;
    if (outros.length) h += `<div class="stack">${outros.map(r => `<button class="btn" data-a="cert" data-s="${s}" data-i="${r.i}">Certificado de ${dataLonga(r.d)} · ${plural(r.ids.length, 'aula', 'aulas')}${r.mod ? ' · ' + MODAL_NOME[r.mod] : ''}</button>`).join('')}</div>`;
    return h + '</section>';
  }
  /* X da INPHAX, em vetor */
  const MARCA_X = '<svg viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" rx="40" fill="#0C0C0C"/><g fill="#EFEAE0"><path d="M88 82H168L424 430H344Z"/><path d="M344 82H424L338 200H258Z"/><path d="M190 291H270L168 430H88Z"/></g></svg>';
  const MARCA = '<span class="marca" role="img" aria-label="INPHAX"></span>';
  /* contato e páginas legais (privacidade.html e termos.html saem de web/legal/) */
  const CONTATO = 'suporteinphax@gmail.com';
  const linkContato = `<a href="mailto:${CONTATO}">${CONTATO}</a>`;
  const linksLegais = '<a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a> · <a href="termos.html" target="_blank" rel="noopener">Termos de uso</a>';
  function cartaoSobre() {
    return `<section class="card"><h2 class="h2">Sobre e contato</h2><p style="margin:0">Missão EEAR é um curso da INPHAX. Dúvidas, erros em alguma questão ou sugestões: ${linkContato}.</p><p class="small muted" style="margin:0">${linksLegais}. Curso livre de estudo, sem vínculo com a EEAR ou com a Força Aérea Brasileira.</p></section>`;
  }
  function vCert() {
    const s = V.s, geral = s === 'geral';
    let h = `<button class="btn ghost back no-print" ${geral ? 'data-a="tab" data-v="hoje"' : `data-a="mat" data-s="${s}"`}>← Voltar</button>`;
    /* Mostra um certificado registrado: o escolhido na lista (V.i), o das aulas atuais ou o mais recente conquistado. */
    let r = null;
    if (CERTS.includes(s)) {
      const x = V.i != null ? S.cfg.certs[V.i] : null;
      r = x && x.s === s ? x : certAtual(s) || certsDe(s)[0] || null;
    }
    if (!r) return h + '<p class="empty">Este certificado é liberado quando todas as aulas tiverem 80% ou mais no quiz.</p>';
    if (!S.cfg.nome || V.editNome) {
      return h + `<section class="card no-print"><h2 class="h2">Seu nome no certificado</h2><div class="field"><label for="cert-nome">Nome completo</label><input id="cert-nome" maxlength="80" value="${esc(S.cfg.nome || '')}" autocomplete="name"></div><div class="row"><button class="btn pri" data-a="certnome">Gerar o certificado</button></div></section>`;
    }
    const ms = r.ids, horas = r.h, data = r.d;
    const cod = r.c || codigoCert([S.cfg.nome, s, data].join('|'));
    h += `<article class="cert" id="cert"><div class="cert-in">
      <div class="cert-marca">${MARCA_X}${MARCA}</div>
      <div class="cert-por">Missão EEAR</div>
      <div class="eyebrow">Certificado de conclusão</div>
      <p class="cert-cert">Certificamos que</p>
      <h1 class="cert-nome">${esc(S.cfg.nome)}</h1>
      <p class="cert-txt">concluiu ${geral ? 'o <b>curso preparatório completo para o CFS da EEAR</b>, nas quatro matérias da prova (Língua Portuguesa, Língua Inglesa, Matemática e Física)' : `a matéria <b>${MATS[s].nome}</b> do curso preparatório para o CFS da EEAR`}, com ${ms.length} aulas e nota de pelo menos 80% no quiz de cada uma.</p>
      <div class="cert-dados"><div><span class="lab">Carga horária</span><b>${horas} horas</b></div><div><span class="lab">Concluído em</span><b>${dataLonga(data)}</b></div><div><span class="lab">Código</span><b class="num">${esc(cod)}</b></div></div>
      <div class="cert-ass"><span class="marca" role="img" aria-label="INPHAX"></span><span>emitido pela INPHAX</span></div>
      <p class="cert-nota">Curso livre de estudo, sem vínculo com a EEAR ou com a Força Aérea Brasileira. Não tem validade acadêmica.</p>
    </div></article>
    <div class="row no-print"><button class="btn pri" data-a="imprimir">Imprimir ou salvar em PDF</button><button class="btn" data-a="certnomeedit">Corrigir o nome</button></div>`;
    return h;
  }

  /* ---------- aula: videoaula, roteiro e navegação ---------- */
  const dominado = m => ((S.mod[m.id] || {}).best || 0) >= META;
  function passos(m) {
    const r = S.mod[m.id] || {}, a = S.aula[m.id] || {}, vs = VA[m.id] || [];
    return [
      { k: 'v', txt: 'Assistir à videoaula', ok: !!a.v || !vs.length, sub: vs.length ? (EMBED ? 'marca sozinho quando você dá o play' : 'marca sozinho quando você abre o vídeo') : '' },
      { k: 't', txt: 'Ler o resumo da teoria', ok: !!r.lido },
      { k: 'e', txt: 'Ver os exemplos resolvidos', ok: !!a.e || !(m.ex || []).length },
      { k: 'q', txt: 'Fazer o quiz e tirar 80% ou mais', ok: dominado(m), sub: r.best != null ? 'melhor nota: ' + pct(r.best) : (m.q.length + ' questões no estilo da EEAR') },
      { k: 'f', txt: 'Revisar os flashcards', ok: (m.fc || []).some((_, i) => S.fc[m.id + '~' + i]) || !(m.fc || []).length }
    ];
  }
  const capaVideo = v => `<button class="pl-capa" data-a="play" data-vid="${v.id}" aria-label="Assistir: ${esc(v.t)}"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="pl-btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg></span></button>`;
  const iframeVideo = v => `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1" title="${esc(v.t)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  const creditoVideo = v => `${v.c ? 'Vídeo de ' + esc(v.c) + ' no YouTube' : 'Vídeo do YouTube'} · <a href="${ytUrl(v.id)}" target="_blank" rel="noopener">abrir no YouTube</a>`;
  function linhaVideo(m, v, cur) {
    const tipo = { a: 'Aula', q: 'Questões', y: 'Provas da EEAR' }[v.k] || 'Aula';
    const fora = v.k === 'y' || !EMBED;
    const corpo = `<span class="vt">${tipo}</span><span class="vb"><b>${esc(v.t)}</b><span class="small muted">${esc(v.c || 'YouTube')}${fora ? ' · abre no YouTube' : ''}</span></span>`;
    return fora
      ? `<a class="vrow" href="${ytUrl(v.id)}" target="_blank" rel="noopener" data-a="vext" data-id="${m.id}">${corpo}<span class="vext" aria-hidden="true">↗</span></a>`
      : `<button class="vrow ${cur && cur.id === v.id ? 'on' : ''}" data-a="vsel" data-vid="${v.id}" aria-pressed="${!!(cur && cur.id === v.id)}">${corpo}<span class="vext" aria-hidden="true">▶</span></button>`;
  }
  function blocoVideo(m) {
    const vs = VA[m.id] || [];
    if (!vs.length) return `<section class="card"><h2 class="h2">Videoaula</h2><p class="small muted" style="margin:0">Este tópico ainda não tem videoaula escolhida. Use a busca abaixo da teoria.</p></section>`;
    const cur = EMBED ? vs.find(v => v.k !== 'y') : null;
    let h = '<section class="card video">';
    if (cur) h += `<div class="player" id="player">${capaVideo(cur)}</div><p class="small muted cred" id="cred">${creditoVideo(cur)}</p>`;
    else h += `<h2 class="h2">Videoaulas</h2><p class="small muted" style="margin:0">Os vídeos abrem no YouTube, em outra aba.</p>`;
    h += `<div class="vlist">${vs.map(v => linhaVideo(m, v, cur)).join('')}</div></section>`;
    return h;
  }
  function blocoRoteiro(m) {
    const ps = passos(m), feitos = ps.filter(p => p.ok).length, vs = VA[m.id] || [];
    const v0 = vs.find(v => v.k !== 'y') || vs[0];
    const acao = {
      v: v0 ? (EMBED && v0.k !== 'y' ? `<button class="btn sm" data-a="play" data-vid="${v0.id}">Assistir</button>` : `<a class="btn sm" href="${ytUrl(v0.id)}" target="_blank" rel="noopener" data-a="vext" data-id="${m.id}">Assistir</a>`) : '',
      t: '<button class="btn sm" data-a="aba" data-aba="teoria">Ler</button>',
      e: '<button class="btn sm" data-a="aba" data-aba="ex">Ver</button>',
      q: `<button class="btn sm ${dominado(m) ? '' : 'pri'}" data-a="quizmod" data-id="${m.id}">${(S.mod[m.id] || {}).tent ? 'Refazer' : 'Fazer'}</button>`,
      f: `<button class="btn sm" data-a="fcmod" data-id="${m.id}">Revisar</button>`
    };
    return `<section class="card"><div class="row between"><h2 class="h2">Roteiro da aula</h2><span class="small muted num" id="passos-n">${feitos} de ${ps.length}</span></div>
      <div class="meter"><i id="passos-m" style="width:${feitos / ps.length * 100}%"></i></div>
      <div class="tasks">${ps.map(p => `<div class="task ${p.ok ? 'done' : ''}" id="passo-${p.k}"><span class="check auto ${p.ok ? 'on' : ''}" role="img" aria-label="${p.ok ? 'Feito' : 'Pendente'}">${ICON_OK}</span><div class="tt"><b>${p.txt}</b>${p.sub ? `<div class="small muted">${p.sub}</div>` : ''}</div>${p.ok && p.k !== 'q' && p.k !== 'f' ? '<span></span>' : acao[p.k]}</div>`).join('')}</div>
      <p class="small muted" style="margin:0">A aula conta como concluída quando você tira 80% ou mais no quiz.</p></section>`;
  }
  function navAulas(m) {
    const ms = aulasDe(m.m), i = ms.indexOf(m), ant = ms[i - 1], prox = ms[i + 1];
    return `<div class="navaula">${ant ? `<button class="btn" data-a="mod" data-id="${ant.id}">← Aula ${i}</button>` : '<span></span>'}${prox ? `<button class="btn ${dominado(m) ? 'pri' : ''}" data-a="mod" data-id="${prox.id}">Próxima aula: ${esc(prox.t)} →</button>` : `<button class="btn" data-a="mat" data-s="${m.m}">Voltar à trilha de ${MATS[m.m].curto}</button>`}</div>`;
  }
  /* Marca "assistiu" sem redesenhar a tela (o vídeo continua tocando). */
  function marcarAssistido(id) {
    const a = S.aula[id] = S.aula[id] || {};
    if (a.v) return;
    a.v = hoje(); marcarAtividade(); salvar();
    const el = document.getElementById('passo-v');
    if (el) { el.classList.add('done'); const c = el.querySelector('.check'); if (c) c.classList.add('on'); const b = el.lastElementChild; if (b && b.matches('.btn')) b.replaceWith(document.createElement('span')); }
    const m = MOD[id], ps = m && passos(m);
    if (ps) { const f = ps.filter(p => p.ok).length, n = document.getElementById('passos-n'), mt = document.getElementById('passos-m'); if (n) n.textContent = f + ' de ' + ps.length; if (mt) mt.style.width = (f / ps.length * 100) + '%'; }
  }

  function vModulo() {
    const m = MOD[V.id];
    if (!m || !moduloAtivo(m)) return vMaterias();
    const aba = V.aba || 'aula';
    const r = S.mod[m.id] || {}, st = estMod(m.id);
    let h = `<button class="btn ghost back" data-a="mat" data-s="${m.m}">← Trilha de ${MATS[m.m].curto}</button>`;
    h += `<div class="stack"><div class="eyebrow">${sig(m.m)} Aula ${nAula(m)} de ${aulasDe(m.m).length} · ${m.id} · incidência ${bolinhas(m.peso)} · ${fh(m.h)}</div><h1 class="h1">${m.t}</h1><div class="row"><span class="chip ${st.k}">${st.txt}</span>${r.tent ? `<span class="small muted">${esc(plural(r.tent, 'tentativa', 'tentativas'))} no quiz</span>` : ''}</div></div>`;
    const ofi = OFI[m.id] || [];
    const aps = APMOD[m.id] || [];
    const abas = [['aula', 'Aula'], ['teoria', 'Teoria'], ['ex', 'Exemplos'], ['quiz', 'Quiz']].concat(apVisivel() ? [['ap', 'Apostila']] : [], [['prov', 'Provas'], ['cards', 'Cartões']]);
    h += `<div class="seg" role="group" aria-label="Partes da aula">${abas.map(a => `<button data-a="aba" data-aba="${a[0]}" aria-pressed="${a[0] === aba}">${a[1]}</button>`).join('')}</div>`;
    if (aba === 'aula') {
      h += blocoVideo(m) + blocoRoteiro(m);
    } else if (aba === 'teoria') {
      h += `<article class="card teoria b-${m.m}">${m.teoria}</article>`;
      const busca = VID[m.id] || m.t;
      h += `<section class="card"><h2 class="h2">Mais vídeos no YouTube</h2><p class="small muted" style="margin:0">${(VA[m.id] || []).length ? 'A videoaula escolhida está na aba Aula. ' : ''}Estes links abrem a busca do YouTube em outra aba.</p>
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
    h += navAulas(m);
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
    if (!apVisivel()) return h + '<section class="card"><p style="margin:0">A aba Apostila é para quem estuda pelas apostilas do curso: ela traz a folha de respostas de cada conjunto de exercícios, corrigida pelo gabarito do livro.</p><div class="row"><button class="btn pri" data-a="apligar">Uso as apostilas: mostrar</button></div></section>';
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
      registrarCerts(S);
    }
    marcarAtividade();
    z.fim = true;
    salvar();
  }
  function vQuizFim() {
    const z = QZ, mid = z.origem.tipo === 'mod' ? z.origem.id : null, m = mid && MOD[mid];
    const passou = z.sc >= META;
    const ativos = modulosAtivos(), iAtivo = m ? ativos.indexOf(m) : -1, proxM = iAtivo >= 0 ? ativos[iAtivo + 1] : null;
    const erradas = z.ids.filter(id => !acertou(id, z.perms[id], z.resp[id]));
    let h = `<div class="stack"><div class="eyebrow">Debriefing · ${z.titulo}</div><h1 class="h1">${m ? (passou ? 'Módulo dominado' : 'Ainda não chegou aos 80%') : (z.ac === z.ids.length ? 'Tudo certo' : 'Rodada concluída')}</h1></div>`;
    h += `<section class="card"><div class="row between"><span class="score num">${z.ac}<small> de ${z.ids.length}</small></span><span class="chip ${passou ? 'ok' : 'warn'}">${pct(z.sc)}</span></div>
      <p style="margin:0">${m ? (passou ? 'Você bateu a meta. O módulo entra nas revisões espaçadas pelos flashcards.' : `A meta é ${Math.ceil(z.ids.length * META)} acertos. Releia a teoria nos pontos das questões abaixo e refaça o quiz.`) : (z.origem.tipo === 'erros' ? 'As questões que você acertou saíram do caderno de erros.' : z.origem.tipo === 'oficial' ? 'Questões oficiais da EEAR, corrigidas pelo gabarito oficial. As erradas foram para o caderno de erros.' : '')}</p>
      <div class="row">${m ? `<button class="btn ${passou ? '' : 'pri'}" data-a="quizmod" data-id="${mid}">Refazer o quiz</button><button class="btn" data-a="mod" data-id="${mid}">Voltar à teoria</button>` : z.origem.tipo === 'oficial' ? `<button class="btn pri" data-a="mod" data-id="${z.origem.id}">Voltar ao módulo</button>` : `<button class="btn pri" data-a="tab" data-v="treino">Voltar ao treino</button>`}
      ${m && passou && proxM ? `<button class="btn pri" data-a="mod" data-id="${proxM.id}">Próximo módulo</button>` : ''}</div></section>`;
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
      ? `<div class="row fc-acoes"><button class="btn" data-a="fcaval" data-ok="0">Errei</button><button class="btn pri" data-a="fcaval" data-ok="1">Acertei</button></div>`
      : `<div class="row fc-acoes"><button class="btn pri" data-a="fcvirar">Mostrar resposta</button></div>`;
    return h;
  }

  // Depois de revelar: se o começo da resposta ficou atrás dos botões fixos (cartão longo em tela pequena), rola só o necessário para mostrá-lo.
  function mostrarVerso() {
    const v = document.querySelector('.fc .verso'), bar = document.querySelector('.fc-acoes');
    if (!v || !bar) return;
    const falta = v.getBoundingClientRect().top + 72 - bar.getBoundingClientRect().top;
    if (falta > 0) window.scrollBy(0, falta);
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
        return `<details class="rev"><summary>${MATS[s].curto} · ${ids.length}</summary>${ids.map(id => { const q = Q[id]; return `<details class="rev"><summary>${rotulo(q)} · ${resumo(q.e)} <span class="chip bad">${esc(S.erros[id])}x</span></summary><div class="q-enun">${enun(q)}</div><p><b>Resposta:</b> ${q.of ? LETRAS[q.c] + ') ' : ''}${q.o[q.c]}</p><div class="expl">${q.r}</div></details>`; }).join('')}</details>`;
      }).join('');
    }
    h += `</section>`;
    const comErro = AP.sets.filter(s => { const r = S.ap[s.id]; return r && r.ok && Object.keys(r.ok).some(k => r.ok[k] === 0); });
    if (apVisivel()) h += `<section class="card"><div class="row between"><h2 class="h2">Erros da apostila</h2><span class="small muted">${plural(nErrosAp(), 'questão', 'questões')}</span></div>${comErro.length ? `<p style="margin:0">Conjuntos com questões erradas. Abra e use "Refazer as erradas" depois de rever a teoria.</p><div class="mods">${comErro.map(s => apLinha(s)).join('')}</div>` : '<p class="small muted" style="margin:0">Nenhum erro pendente nas folhas de respostas da apostila.</p>'}</section>`;
    const abaixo = modulosAtivos().filter(m => { const r = S.mod[m.id]; return r && r.best != null && r.best < META; });
    h += `<section class="card"><h2 class="h2">Módulos abaixo de 80%</h2>${abaixo.length ? `<div class="mods">${abaixo.map(m => `<button class="modrow" data-a="mod" data-id="${m.id}"><span class="sigla c-${m.m}">${m.id}</span><span class="mt">${m.t}</span><span class="chip warn">${pct(S.mod[m.id].best)}</span></button>`).join('')}</div>` : '<p class="small muted" style="margin:0">Nenhum. Todo quiz feito está na meta.</p>'}</section>`;
    return h;
  }

  /* ---------- simulados ---------- */
  function iniciarSim(tipo, s) {
    let ids = [], lim = 0;
    if (tipo === 'completo') { ORD.forEach(x => { ids = ids.concat(shuffle(amostraPeso(QS[x], 24))); }); lim = Number(S.cfg.tempoSim) || 260; }
    else if (tipo === 'materia') { ids = shuffle(amostraPeso(QS[s], 24)); lim = 60; }
    else if (tipo === 'prova') { const p = PROVA[s]; if (!p) return; ids = p.ids.slice(); lim = p.min || 240; }
    else if (tipo === 'oficial') { ORD.forEach(x => { ids = ids.concat(shuffle(QO[x].slice()).slice(0, 24)); }); lim = Number(S.cfg.tempoSim) || 260; }
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
    const mt = MATS[x.mat || x.materia], nm = mt ? mt.curto : 'matéria';  // histórico colado de outra versão pode trazer matéria desconhecida
    return curto ? nm : 'Simulado de ' + nm;
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
    reg.id = opId();
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
      <div class="tbl tbl-res" tabindex="0" role="region" aria-label="Notas por matéria"><table><thead><tr><th>Matéria</th><th class="num">Acertos</th><th class="num">Nota</th><th>Situação</th></tr></thead><tbody>${ks.map(s => { const x = reg.r[s][0] / reg.r[s][1]; return `<tr><td>${sig(s)} ${MATS[s].curto}</td><td class="num">${reg.r[s][0]}/${reg.r[s][1]}</td><td class="num">${nota(x)}</td><td>${x >= META ? '<span class="chip ok">meta</span>' : x >= 0.5 ? '<span class="chip warn">abaixo da meta</span>' : '<span class="chip bad">abaixo de 5</span>'}</td></tr>`; }).join('')}</tbody></table></div>
      <p class="small muted" style="margin:0">${reg.tipo === 'diag' ? 'O plano agora dá mais tempo às matérias com nota menor. ' : ''}Meta do curso: nota 8,0 em cada matéria. Mínimo do edital: 5,0 em cada matéria e média 5,0.${reg.min ? ' Tempo usado: ' + fh(reg.min / 60) + '.' : ''}</p></section>`;
    const porMod = {};
    u.ids.forEach(id => { if (Q[id].mod && MOD[Q[id].mod] && moduloAtivo(MOD[Q[id].mod]) && !acertou(id, u.perms[id], u.resp[id])) porMod[Q[id].mod] = (porMod[Q[id].mod] || 0) + 1; });
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
      <div class="card"><div class="eyebrow">Como no dia da prova</div><h2 class="h2">Simulado completo</h2><p class="small" style="margin:0">96 questões, 24 por matéria, em ${fh((Number(S.cfg.tempoSim) || 260) / 60)}. Use folha de rascunho e nada de consulta.</p><button class="btn pri" data-a="simini" data-tipo="completo" ${S.ativo ? 'disabled' : ''}>Começar</button></div>
    </section>`;
    const okOf = ORD.every(x => QO[x].length >= 24);
    h += `<section class="card"><div class="eyebrow">100% fiel à prova</div><h2 class="h2">Provas anteriores oficiais</h2>${PROVAS.length
      ? `<p class="small" style="margin:0">Provas reais da EEAR, na ordem original e com o gabarito oficial. Faça como no dia: tempo de prova, rascunho e nada de consulta. Toque numa questão para ampliar.</p><div class="tasks">${PROVAS.map(p => { const feitas = S.sims.filter(x => x.prova === p.id); const ult = feitas[feitas.length - 1]; return `<div class="task"><span class="sigla">${(p.data || '').slice(0, 4)}</span><div class="tt"><b>${p.nome}</b><div class="small muted">${p.ids.length} questões · ${fh((p.min || 240) / 60)}${ult ? ' · última média ' + nota(media(ult)) : ''}</div></div><button class="btn sm pri" data-a="simini" data-tipo="prova" data-s="${p.id}" ${S.ativo ? 'disabled' : ''}>${ult ? 'Refazer' : 'Fazer'}</button></div>`; }).join('')}</div>
        <div class="row"><button class="btn" data-a="simini" data-tipo="oficial" ${S.ativo || !okOf ? 'disabled' : ''}>Simulado misto com questões oficiais (96)</button></div>`
      : `<p class="small" style="margin:0">As provas completas das quatro matérias entram aqui, na ordem original e com o gabarito oficial, assim que os PDFs da EEAR forem carregados. Até lá, use os simulados do curso abaixo.</p>`}</section>`;
    const reais = !apVisivel() ? [] : AP.sets.filter(x => x.tipo === 'test' && /prova/i.test(x.t));
    if (reais.length) h += `<section class="card"><div class="eyebrow">Provas reais da apostila</div><h2 class="h2">Inglês das provas da EEAR</h2><p class="small" style="margin:0">A parte de Inglês de ${plural(reais.length, 'prova real', 'provas reais')} da EEAR, com ${AP_PAG ? 'as páginas do livro' : 'a página do PDF da apostila'} e a folha de respostas corrigida pelo gabarito. Faça cada uma em 1 hora, como no dia.</p><div class="mods">${reais.map(x => apLinha(x)).join('')}</div></section>`;
    h += `<section class="card"><div class="eyebrow">Treino focado</div><h2 class="h2">Simulado por matéria</h2><p class="small" style="margin:0">24 questões em 1 hora.</p><div class="row">${ORD.map(s => `<button class="btn" data-a="simini" data-tipo="materia" data-s="${s}" ${S.ativo ? 'disabled' : ''}>${MATS[s].curto}</button>`).join('')}</div></section>`;
    const hist = S.sims.slice().reverse();
    h += `<section class="card"><div class="row between"><h2 class="h2">Histórico</h2>${S.ult ? '<button class="btn sm" data-a="go" data-v="res">Correção do último</button>' : ''}</div>${grafico()}`;
    h += hist.length ? `<div class="tbl tbl-res" tabindex="0" role="region" aria-label="Histórico de simulados"><table><thead><tr><th>Data</th><th>Tipo</th>${ORD.map(s => `<th class="num">${MATS[s].sigla}</th>`).join('')}<th class="num">Média</th></tr></thead><tbody>${hist.map(r => `<tr><td class="num">${fdata(dnum(r.d))}</td><td>${nomeSim(r, true)}</td>${ORD.map(s => `<td class="num">${r.r[s] ? nota(r.r[s][0] / r.r[s][1]) : '–'}</td>`).join('')}<td class="num"><b>${nota(media(r))}</b></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">Nenhum simulado feito ainda.</p>';
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
      case 'cert': h = vCert(); break;
      case 'inicio': h = vInicio(); break;
      default: h = vHoje();
    }
    document.body.classList.toggle('sem-nav', V.v === 'inicio');
    document.body.classList.toggle('sem-apostila', !apVisivel());
    if (!gravouLocal && V.v !== 'hoje') h = '<div class="banner warn" role="alert">O progresso não está sendo salvo neste aparelho. Mantenha esta aba aberta e copie o progresso em Plano › Dados.</div>' + h;
    if (!loc.carregado) h = '<div role="status" class="banner">Preparando seus dados. Aguarde para estudar.</div>' + h;
    if (loc.semIDB && gravouLocal) h = '<div class="banner warn" role="alert">Este navegador usa uma cópia de reserva sem proteção contra queda. Exporte o progresso em Plano › Dados antes de fechar.</div>' + h;
    app.innerHTML = h;
    if (!loc.carregado) app.querySelectorAll('button[data-a], input:not([readonly]), select').forEach(el => { if (!['tab', 'go', 'expcopiar', 'dadosver', 'dadosbaixar', 'cancelar'].includes(el.dataset.a)) el.disabled = true; });
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
        const t = document.getElementById('imp-txt'), substituir = !!(document.getElementById('imp-substituir') || {}).checked;
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
        S = substituir ? mesclar(c) : unirProgresso(null, l, c).st;
        const certs = S.cfg.certs;
        S.cfg = Object.assign({}, colado.cfg, { certs });
        S.cfg.certsZ = Math.max(Number(local.cfg.certsZ) || 0, Number(colado.cfg.certsZ) || 0);
        juntarCerts(S.cfg, local.cfg, null); registrarCerts(S);
        pedindo = null; msgDados = substituir ? 'Progresso substituído conforme solicitado; certificados mantidos.' : 'Progresso importado sem apagar o estudo já guardado.'; salvar({ importado }); render();

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
  function uIgual(a, b) { return JSON.stringify(canonico(a)) === JSON.stringify(canonico(b)); }
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
    soltarLocal(false); // a fila anterior continua ligada à identidade que a originou
    nuvem.ref = null; nuvem.on = false; nuvem.again = false; nuvem.futura = false; nuvem.bloqueada = false; nuvem.pendente = false; nuvem.semRede = false; nuvem.apagado = ''; nuvem.reapareceu = false; nuvem.refPausada = null; nuvem.conta = id;
    identidade = id;
    try { if (id) localStorage.setItem(LS_CONTA, id); else localStorage.removeItem(LS_CONTA); } catch (e) { /* sem armazenamento */ }
    S = carregar(); QZ = null; FC = null; pedindo = null; msgRec = ''; contaUI.adiado = false;
    V = V.v === 'plano' ? V : mostrarInicio() ? { v: 'inicio' } : { v: 'hoje' }; // a tela inicial depende do progresso da conta que entrou; quem entrou pela aba Plano continua nela
    render();
    return true;
  }
  /* Apaga deste aparelho o progresso de uma identidade (e as cópias dela). Só é chamado depois de confirmação explícita. */
  async function apagarLocal(id, definitivo) {
    const bases = [DIARIO_K].map(k => chave(k, id));
    // O corte é anterior à transação. Uma reserva imutável criada depois dele pertence a uma nova ação.
    const existentes = Object.keys(localStorage).filter(k => bases.some(b => k === b || k.indexOf(b + '#') === 0)).map(k => [k, localStorage.getItem(k)]);
    const r = await apagarDuravel(id, definitivo);
    existentes.forEach(([k, txt]) => { if (localStorage.getItem(k) === txt) localStorage.removeItem(k); });
    if (id === identidade) { nuvem.ref = null; nuvem.on = false; loc.ops = []; loc.gen = r.gen; loc.pendente = 0; loc.confirmando = false; loc.incompativel = false; gravouLocal = true; S = novoEstado(); recuperar = null; partirDe(null, S); }
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
      if (localStorage.getItem(chave(LS_REC, id)) || temPendentes(id)) return false; // diário de outra aba ainda fora da cópia
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
  function sincronizado() { const b = lerBase(); return !!b && uIgual(b, mesclar(copiar(S))) && !temPendentes(identidade); } // e nenhuma aba com estudo fora da cópia (F10)
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
  async function baixarDados() {
    const id = identidade;
    const dados = { app: 'Missão EEAR', geradoEm: new Date().toISOString(), conta: identidade ? { tipo: identidade.split(':')[0], email: (conta.user && conta.user.email) || null } : null, progresso: opCopiar(S), copiaDeRecuperacao: recuperar };
    try { dados.quarentena = await copiasQuarentena(id, false); } catch (e) { dados.quarentena = []; }
    if (id !== identidade) return;
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
      if (apagar) await apagarLocal(id);
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
      await fs.runTransaction(api.db, async tx => {
        const marca = fs.doc(api.db, 'contasExcluidas', u.uid), antiga = await tx.get(marca);
        if (!antiga.exists()) tx.set(marca, { v: 1, excluida: fs.serverTimestamp() });
        tx.delete(fs.doc(api.db, 'alunos', u.uid));
      });
      passo = 'conta';
      await au.deleteUser(u);
      usarIdentidade(''); await apagarLocal(id, true);
      contaUI.msg = 'Sua conta, o progresso dela na nuvem e a cópia dela neste aparelho foram excluídos.';
      pedindo = null;
    } catch (e) {
      contaUI.msg = passo === 'confirmar' ? 'Não foi possível confirmar sua identidade (senha incorreta ou janela fechada). Nada foi excluído.'
        : passo === 'nuvem' ? 'Não foi possível apagar o progresso na nuvem agora. Nada foi excluído.'
          : 'O progresso na nuvem foi apagado, mas a conta não pôde ser excluída agora. A cópia deste aparelho continua aqui. Tente de novo.';
    }
    contaUI.ocupado = false; render();
  }
  document.addEventListener('click', async ev => {
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
      case 'dadosapagarok': comTravaLocal(async () => { if (temPendentes(identidade) || (identidade && !sincronizado())) { pedindo = null; msgDados = 'Nada foi apagado: outra aba ou este aparelho tem estudo que ainda não está na nuvem.'; render(); return; } await apagarLocal(identidade); pedindo = null; msgDados = 'Os dados deste aparelho foram apagados.'; render(); }); break; // com a trava: depois de qualquer gravação em andamento (F10)
      case 'dadosapagartudo': { // só as contas cuja nuvem já tem tudo: o estudo não enviado de outra conta não é apagado
        if (identidade) break;
        const ficam = contasGuardadas().filter(id => !sincronizadoDe(id));
        await Promise.all(contasGuardadas().filter(id => !ficam.includes(id)).map(id => apagarLocal(id))); await apagarLocal(''); pedindo = null;
        msgDados = ficam.length ? `Os dados deste aparelho foram apagados, menos ${ficam.length === 1 ? 'a cópia de uma conta' : 'as cópias de ' + ficam.length + ' contas'} com progresso que a nuvem ainda não confirmou. Entre nessa conta para enviá-lo.` : 'Os dados deste aparelho foram apagados, de todas as contas.';
        render(); break;
      }
      default: break;
    }
  });
  /* ---------- gravação no link do curso no Claude (nuvem sem transação) ----------
     A nuvem do Claude grava o documento inteiro, por último quem grava, sem transação. Dois aparelhos que liam juntos
     e gravavam em seguida perdiam o que o outro gravou (4 de 8 marcações simultâneas no teste), e pior: a base deste
     aparelho passava a ter o que a nuvem perdeu, e a próxima união tratava isso como apagado no outro aparelho.
     - Com a trava da nuvem (doc.acquire, cooperativa e de curta duração): ler, unir e gravar só com a trava; depois,
       ler de novo para conferir. A base só é registrada se a nuvem tem exatamente o que foi gravado e a trava ainda
       valia; senão, a união é refeita em seguida, com a base anterior (que não tem nada que a nuvem possa ter perdido).
     - Sem a trava (versão antiga da API, ou recusada): grava, mas apaga a base. A união sem base nunca trata ausência
       como apagamento, então nada se perde; o preço é que desmarcar algo pode voltar, e o aluno é avisado. Depois de
       gravar, confere a nuvem de novo pouco depois.
     Funções declaradas: conectar() só chega aqui depois de esperar a nuvem, com o arquivo inteiro já carregado. */
  /* A trava não pode ser liberada, só vence. Um nome novo a cada uso (em vez de renovar a mesma) e uma trava curta fazem
     os aparelhos se alternarem: quem grava sempre não deixa o outro esperando para sempre. */
  const TRAVA_MS = 5000;
  function holderNovo() { return 'aba-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36); }
  /* A trava pode criar o documento vazio, ou com campos dela: sem v e sem nenhum campo do progresso, é como se não existisse. */
  function lerDocClaude(snap) {
    const o = snap && snap.exists ? snap.data() : null;
    if (!o || typeof o !== 'object') return o || null;
    return !('v' in o) && !['t', 'cfg', 'mod', 'fc', 'sims'].some(k => k in o) ? null : o;
  }
  /* Comparação sem depender da ordem das chaves (a nuvem pode devolver o documento em outra ordem). */
  function canonico(x) { return Array.isArray(x) ? x.map(canonico) : x && typeof x === 'object' ? Object.keys(x).sort().reduce((o, k) => { o[k] = canonico(x[k]); return o; }, {}) : x; }
  function mesmoDoc(a, b) { return JSON.stringify(canonico(a)) === JSON.stringify(canonico(b)); }
  function ocupada(espera) { const e = new Error('nuvem ocupada por outro aparelho'); e.code = 'unavailable'; e.espera = espera; return e; }
  /* Devolve 'ok' (pode registrar a base), 'conferir' (gravou, mas outro gravou junto: refazer a união) ou 'semtrava'.
     Só quem tem a trava grava; se ela vencer no meio, é renovada com o mesmo nome antes de gravar (concedida só se
     ninguém a pegou nesse intervalo, e então ninguém gravou). A base só vale se a conferência terminou com a trava. */
  async function lerUnirGravar(ref, planejar) {
    const nome = holderNovo();
    const travar = async () => {
      const t = await ref.acquire({ holder: nome, ttlMs: TRAVA_MS });
      if (!t || !t.acquired) throw ocupada((Date.parse(t && t.expiresAt) || Date.now()) - Date.now());
      return Math.min(Date.parse(t.expiresAt) || Infinity, Date.now() + TRAVA_MS) - 1000; // margem para a resposta chegar
    };
    let fim = 0;
    if (typeof ref.acquire === 'function' && !nuvem.semTrava) {
      try { fim = await travar(); }
      catch (e) { if (e && e.code === 'unavailable') throw e; nuvem.semTrava = true; } // trava recusada: segue sem ela
    } else nuvem.semTrava = true;
    if (!fim) { const novo = planejar(lerDocClaude(await ref.get())); if (novo) await ref.set(novo); return novo ? 'semtrava' : 'semtrava-igual'; }
    const novo = planejar(lerDocClaude(await ref.get()));
    if (!novo) return 'ok';
    if (Date.now() > fim) fim = await travar();
    await ref.set(novo);
    const visto = lerDocClaude(await ref.get());
    return mesmoDoc(visto, novo) && Date.now() <= fim ? 'ok' : 'conferir';
  }
  /* Depois de uma união aplicada: registra a base só quando é seguro, e agenda a conferência quando não é. */
  function depoisDeGravar(modo, p) {
    if (modo === 'ok') { gravarBase(p.u, p.ep, p.id); return; }
    if (modo === 'conferir') { setTimeout(gravar, 2000 + Math.random() * 2000); return; }
    try { localStorage.removeItem(chave(BASE_K)); } catch (e) { /* sem armazenamento */ } // sem trava: união sem base
    if (modo === 'semtrava') setTimeout(gravar, 5000 + Math.random() * 2000);
  }
  /* ---------- apagar o progresso da nuvem do curso no Claude, a pedido do próprio aluno ----------
     A API do curso no Claude grava o documento inteiro e não tem gravação condicional; as regras do curso só deixam
     cada aluno gravar progresso2/<o próprio id> (o caminho antigo, progresso/<id>, fica só para leitura; 12-caminho-novo.js). Por isso:
     - a exclusão grava uma marca (v: 2, apagado: data, sem nenhum progresso) com a trava e confere a gravação. A marca
       tem v: 2 para que nenhuma versão a adote como progresso: a versão do PR #22 a trata como "versão mais nova" e não
       grava por cima; a versão antiga (sem união) não a lê como progresso e não apaga a cópia local dela;
     - outro aparelho com esta versão, ao encontrar a marca, para de sincronizar e mantém a cópia local; só volta a
       enviar se o aluno pedir ("Enviar de novo para a nuvem");
     - este aparelho guarda que apagou (missao-eear-v1-apagado@conta). Se depois encontrar progresso na nuvem, foi uma
       versão antiga, aberta em outro aparelho, que regravou às cegas: avisa e oferece apagar de novo, sem unir;
     - limite documentado: uma aba antiga já aberta no momento da exclusão regrava a cada estudo, e a API não tem como
       impedir. Este aparelho detecta e avisa; não há garantia contra isso enquanto houver abas antigas abertas. */
  function chaveApagado() { return chave('missao-eear-v1-apagado'); }
  function apagadoAqui() { try { return !!localStorage.getItem(chaveApagado()); } catch (e) { return false; } }
  function podeApagarNuvem() { return identidade.indexOf('claude:') === 0 && !!(nuvem.ref || nuvem.refPausada); }
  /* BLOQUEADA (verificação final, 2026-11-09): com o build real da versão publicada, uma aba antiga aberta antes da
     exclusão recolocou o progresso na nuvem. Fica desligada até o caminho novo com o antigo trancado nas regras
     (auditoria/verificacao-final.md, seção 5) ser implementado e validado no serviço real. Só os testes a ligam.
     O reconhecimento da marca de exclusão continua ativo. */
  function exclusaoLiberada() { return window.EEAR_EXCLUSAO_NUVEM === true; }
  /* A nuvem tem a marca de exclusão, ou regravaram depois de este aparelho apagar: nada é unido nem gravado. */
  function exclusaoNaNuvem(o) {
    if (o && typeof o === 'object' && o.apagado) return nuvem.reenviar ? { ignorar: true } : { apagado: String(o.apagado) };
    if (o && apagadoAqui() && !nuvem.reenviar) return { reapareceu: true };
    return null;
  }
  function pausarPorExclusao(ref, p) {
    nuvem.ref = null; nuvem.on = false; nuvem.refPausada = ref;
    nuvem.apagado = p.apagado || ''; nuvem.reapareceu = !!p.reapareceu;
  }
  async function apagarNuvem() {
    const ref = nuvem.ref || nuvem.refPausada, id = identidade;
    if (!exclusaoLiberada()) return;
    if (!ref || contaUI.ocupado || id.indexOf('claude:') !== 0) return;
    contaUI.ocupado = true; clearTimeout(tSave); nuvem.ref = null; // nada mais desta conta é enviado daqui
    for (let i = 0; nuvem.busy && i < 40; i++) await new Promise(r => setTimeout(r, 250)); // espera a gravação em curso
    const marca = { v: 2, apagado: new Date().toISOString(), t: Number.MAX_SAFE_INTEGER };
    let passo = 'gravar';
    try {
      if (typeof ref.acquire === 'function') { // trava ocupada (outro aparelho, ou este mesmo ao abrir): espera ela vencer
        for (let i = 0; ; i++) {
          let tr = null;
          try { tr = await ref.acquire({ holder: holderNovo(), ttlMs: TRAVA_MS }); } catch (e) { if (e && e.code === 'unavailable') throw e; }
          if (!tr || tr.acquired) break;
          if (i === 2) throw ocupada(0);
          await new Promise(r => setTimeout(r, Math.max(0, (Date.parse(tr.expiresAt) || Date.now()) - Date.now()) + 300));
        }
      }
      await ref.set(marca);
      passo = 'conferir';
      const snap = await ref.get(), o = snap && snap.exists ? snap.data() : null;
      if (!o || o.apagado !== marca.apagado) throw new Error('outra gravação depois da exclusão');
      if (identidade === id) {
        try { localStorage.setItem(chaveApagado(), JSON.stringify({ quando: marca.apagado })); localStorage.removeItem(chave(BASE_K)); } catch (e) { /* sem armazenamento */ }
        pausarPorExclusao(ref, { apagado: marca.apagado });
        msgDados = 'O progresso desta conta foi apagado da nuvem do curso. Este aparelho ainda tem uma cópia; para apagá-la também, use "Apagar os dados deste aparelho".';
        pedindo = null;
      }
    } catch (e) {
      if (passo === 'gravar') { nuvem.ref = ref; msgDados = 'Não foi possível apagar agora (sem conexão, ou outro aparelho gravando). Nada foi apagado da nuvem.'; }
      else { nuvem.refPausada = ref; msgDados = 'O pedido foi enviado, mas não deu para confirmar que a nuvem foi apagada (outro aparelho pode ter gravado ao mesmo tempo). Tente de novo.'; }
    }
    contaUI.ocupado = false; render();
  }
  /* Volta a enviar este aparelho para a nuvem, a pedido do aluno (desfaz a exclusão com o que este aparelho tem). */
  async function reenviarNuvem() {
    const ref = nuvem.refPausada;
    if (!ref || contaUI.ocupado) return;
    try { localStorage.removeItem(chaveApagado()); } catch (e) { /* sem armazenamento */ }
    nuvem.reenviar = true; nuvem.apagado = ''; nuvem.reapareceu = false; msgDados = '';
    await sincronizar(ref, nuvem.conta); // o pedido vale até uma gravação dar certo (conciliar o desliga), mesmo com a trava ocupada
    render();
  }
  function blocoNuvemClaude() {
    if (!podeApagarNuvem()) return '';
    const data = q => { const d = new Date(q); return isNaN(d) ? '' : ' em ' + d.toLocaleDateString('pt-BR'); };
    if (pedindo === 'nuvemapagar' && exclusaoLiberada()) {
      return `<div class="confirm"><p><b>Apagar meu progresso da nuvem do curso</b> apaga a cópia guardada na sua conta. Este aparelho mantém a cópia dele. Feche o curso nos outros aparelhos antes: uma versão antiga aberta pode gravar de novo.</p>
        <div class="field"><label for="nuvem-confirma">Digite APAGAR para confirmar</label><input id="nuvem-confirma" autocomplete="off"></div>
        <button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="nuvemapagarok">Apagar da nuvem</button></div>`;
    }
    if (nuvem.apagado || nuvem.reapareceu) {
      return `<div class="confirm"><p>${nuvem.apagado ? `O progresso desta conta foi apagado da nuvem do curso${data(nuvem.apagado)}. O que você estudar aqui fica só neste aparelho.` : 'Depois que você apagou o progresso da nuvem, uma versão antiga do curso, aberta em outro aparelho, gravou de novo. Feche ou recarregue o curso nos outros aparelhos e apague de novo.'}</p>${nuvem.reapareceu && exclusaoLiberada() ? '<button class="btn sm" data-a="nuvemapagar">Apagar de novo da nuvem</button>' : ''}<button class="btn sm" data-a="nuvemreenviar">Enviar de novo para a nuvem</button></div>`;
    }
    return exclusaoLiberada() ? '<div class="row"><button class="btn ghost" data-a="nuvemapagar">Apagar meu progresso da nuvem do curso</button></div>' : '';
  }
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-a]');
    if (!b) return;
    switch (b.dataset.a) {
      case 'nuvemapagar': if (!exclusaoLiberada()) break; msgDados = ''; pedindo = 'nuvemapagar'; render(); break;
      case 'nuvemapagarok': {
        const t = ((document.getElementById('nuvem-confirma') || {}).value || '').trim();
        if (t !== 'APAGAR') { msgDados = 'Digite APAGAR para confirmar. Nada foi apagado.'; render(); break; }
        apagarNuvem(); break;
      }
      case 'nuvemreenviar': reenviarNuvem(); break;
      default: break;
    }
  });
  /* ---------- caminho novo da nuvem do Claude (progresso2) e migração do caminho antigo ----------
     Versões antigas do app (a publicada no Claude) gravam o progresso inteiro por cima de progresso/<id>, às cegas, a
     cada estudo. O que existia só na nuvem podia ser coberto por elas, e nenhum aparelho novo tinha como recuperar.
     Barreira: esta versão sincroniza só em progresso2/<id>, que as versões antigas não conhecem, e as regras do curso,
     publicadas junto com ela, deixam progresso/<id> só para leitura dos alunos (auditoria/integracao-segura.md, seção 4):
     uma aba antiga aberta tem a gravação recusada e para de sincronizar, com o estudo guardado no aparelho dela.
     Migração: depois de sincronizar o caminho novo, o documento antigo é lido e unido ao progresso deste aparelho SEM
     base (nada se apaga). O resumo do documento antigo fica em cfg.migV1 (vai para a nuvem com o resto): se ele não
     mudar, não é unido de novo (desmarcações feitas depois não voltam); se mudar (gravação de uma aba antiga antes de
     as regras valerem, ou um período de reversão com a versão antiga no ar), é unido mais uma vez. O caminho antigo
     nunca é gravado por esta versão. Funções declaradas: conectar() as chama depois que o arquivo inteiro carregou. */
  function caminhoNuvem(id) { return 'progresso2/' + id; }
  function caminhoAntigo(id) { return 'progresso/' + id; }
  async function migrarCaminhoAntigo(refAntigo, conta) {
    /* Espera a primeira leitura do caminho novo (para conhecer o cfg.migV1 da nuvem), até 60 s. */
    for (let i = 0; i < 120 && !nuvem.lida && nuvem.ref && nuvem.conta === conta; i++) await new Promise(r => setTimeout(r, 500));
    if (!nuvem.lida) return; // sem conseguir ler o caminho novo, não migra agora (tenta ao abrir de novo)
    if (!refAntigo || nuvem.conta !== conta || !nuvem.ref || nuvem.apagado || nuvem.reapareceu || nuvem.futura) return;
    let o = null;
    try { const s = await refAntigo.get(); o = s && s.exists ? s.data() : null; } catch (e) { return; } // tenta de novo ao abrir de novo
    if (!o || typeof o !== 'object' || o.v !== 1 || nuvem.conta !== conta) return; // nada a migrar (ou uma marca de exclusão)
    const h = resumoDoc(o);
    if (S.cfg.migV1 && S.cfg.migV1.h === h) return; // já unido
    const r = unirProgresso(null, mesclar(JSON.parse(JSON.stringify(S))), mesclar(semAssinatura(JSON.parse(JSON.stringify(o)))));
    if (r.perdido) { recuperar = JSON.stringify(r.perdido); try { localStorage.setItem(chave(LS_REC), recuperar); } catch (e) { /* sem espaço */ } }
    if (nuvem.conta !== conta) return;
    S = r.st; S.cfg.migV1 = { h, em: Date.now() };
    salvar(); // a próxima gravação leva a união para progresso2
    render();
  }
  /* ---------- falhas da nuvem: tentar de novo sem perder nada, e dizer ao aluno quando a sincronização parou ----------
     O estudo é sempre gravado primeiro neste aparelho (salvar); a nuvem é uma cópia conciliada depois. Quando a nuvem
     falha:
     - erro passageiro (sem rede, servidor ocupado, cota estourada, transação disputada): tenta de novo sozinho, com
       espera crescente (2,5 a 5 s, depois 5 a 10 s, 10 a 20 s… até 60 s); a conexão voltando ou o app voltando para a tela tentam
       na hora, e o app indo para o fundo (trocar de app no celular) envia o que estava esperando;
     - erro que não passa sozinho (gravação recusada pelas regras, sessão inválida, documento grande demais): a
       sincronização para até o app abrir de novo, e o aviso diz isso, com o motivo. Nada é apagado: o estudo continua
       neste aparelho e vai para a conta quando a sincronização voltar a funcionar.
     O login do Firebase que não carregou (app aberto sem internet) também é tentado de novo quando a conexão volta.
     Funções declaradas: gravar() e syncInfo() (02-progresso-nuvem.js) as usam depois que o arquivo inteiro carregou. */
  function erroPassageiro(e) {
    const c = String((e && e.code) || '').replace(/^firestore\//, '');
    // Firestore usa hífen (resource-exhausted); a nuvem do Claude, sublinhado (resource_exhausted)
    return ['unavailable', 'deadline-exceeded', 'aborted', 'resource-exhausted', 'resource_exhausted', 'internal', 'cancelled'].indexOf(c) >= 0;
  }
  /* A primeira espera é a de antes desta mudança (2,5 a 5 s); depois dobra (5 a 10 s, 10 a 20 s…), até 60 s. */
  function esperaNuvem() {
    nuvem.falhas = (nuvem.falhas || 0) + 1;
    return Math.min(60000, 2500 * Math.pow(2, nuvem.falhas - 1) * (1 + Math.random()));
  }
  function motivoErroNuvem(c) {
    return ({
      'permission-denied': 'a nuvem recusou a gravação',
      invalid_argument: 'a nuvem do curso não permite gravar com o seu acesso',
      unauthenticated: 'a sessão expirou; saia e entre de novo na conta',
      'invalid-argument': 'a nuvem recusou o formato do progresso'
    })[c] || 'erro ' + c;
  }
  function avisoErroNuvem() {
    return 'A sincronização com a nuvem parou (' + motivoErroNuvem(nuvem.erro) + '). O seu progresso continua salvo neste aparelho e nada foi apagado; ele vai para a conta quando a sincronização voltar a funcionar (abra o app de novo para tentar).';
  }
  function retomarNuvem() {
    if (nuvem.ref && !lider.ativa) liderar().then(() => gravar());
    consolidar(); // diários de abas que fecharam enquanto esta estava no fundo (14-abas.js)
    if (FB && !conta.api && conta.pronto && !conta.iniciando) contaIniciar(); // o login não carregou (sem internet ao abrir)
    if (nuvem.ref && !nuvem.busy && (nuvem.semRede || nuvem.pendente)) { clearTimeout(nuvem.tRetry); nuvem.falhas = 0; gravar(); }
  }
  window.addEventListener('online', retomarNuvem);
  /* Só envia antes do intervalo quando a página vai para o fundo e continua viva (trocar de app no celular). Fechando ou
     trocando de página, o navegador dispara pagehide antes; aí nada começa: uma união terminada depois gravaria a cópia
     desta página por cima do que outra aba ou outra abertura já guardou neste aparelho. */
  let saindo = false;
  window.addEventListener('pagehide', () => { saindo = true; clearTimeout(tSave); clearTimeout(nuvem.tRetry); soltarLocal(false); }); // a reserva não é confirmação: a UI distingue operações pendentes do checkpoint confirmado
  window.addEventListener('pageshow', ev => {
    saindo = false;
    if (ev.persisted) { S = carregar(); render(); } // outra abertura pode ter atualizado o cache enquanto esta ficou suspensa
    retomarNuvem();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { retomarNuvem(); return; }
    soltarLocal(false); // no fundo, a aba pode ser suspensa: não fica com a trava local (14-abas.js)
    if (!saindo && nuvem.ref && nuvem.pendente) { clearTimeout(tSave); gravar(true); } // flush pontual após ceder liderança; transação remota continua serializando
  });
  /* Operações identificadas: registradores LWW por campo e contribuições de contadores por operação.
     União associativa, comutativa e idempotente. Um reset remove apenas contribuições que observou;
     incrementos concorrentes/pós-reset continuam. Nada depende de um histórico limitado de snapshots.
     cfg._ops preserva identidades na nuvem e em versões antigas que copiam cfg. Não é uma assinatura de segurança. */
  function opCopiar(x) { return JSON.parse(JSON.stringify(x)); }
  function opId() { return 'o' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)); }
  function opVazio() { return { v: 2, n: 0, r: {}, c: {}, s: {} }; }
  function opCaminho(k) {
    try { const p = JSON.parse(k); return Array.isArray(p) && p.length > 0 && p.length < 15 && ['v', 't', 'cfg', 'mod', 'fc', 'erros', 'sims', 'diag', 'feito', 'act', 'ativo', 'ult', 'ap', 'aula', 'ultAula'].includes(p[0]) && p.every(x => typeof x === 'string' && !['__proto__', 'prototype', 'constructor', '_ops'].includes(x)) ? p : null; } catch (e) { return null; }
  }
  function opMigrar(m) {
    if (!m || m.v !== 1) return m;
    try {
      const u = opCopiar(m); u.v = 2; u.s = {};
      if (!opValida(u)) return null;
      Object.keys(u.r).forEach(k => {
        const p = opCaminho(k), r = u.r[k];
        if (r.length !== 3 || (!opMaximo(p) && !opCertificado(p))) return;
        const id = '@v1:' + JSON.stringify(r.slice(0, 2));
        if (opMaximo(p) && typeof r[2] === 'number' && r[2] >= 0) u.c[k] = { a: { [id]: r[2] }, x: {} };
        else if (opCertificado(p) && certValido(r[2])) u.s[k] = { a: { [id]: r[2] }, x: {} };
        else return;
        delete u.r[k];
      }); return u;
    } catch (e) { return null; }
  }
  function opValida(m) {
    if (m && m.v === 1) m = opMigrar(m);
    const obj = o => !!o && typeof o === 'object' && !Array.isArray(o);
    const conjunto = o => obj(o) && Object.keys(o).every(id => !['__proto__', 'constructor', 'prototype'].includes(id) && o[id] === true);
    const conjuntos = o => obj(o) && Object.keys(o).every(id => !['__proto__', 'constructor', 'prototype'].includes(id) && conjunto(o[id]));
    if (!obj(m) || m.v !== 2 || !Number.isSafeInteger(m.n) || m.n < 0 || !obj(m.r) || !obj(m.c) || !obj(m.s)) return false;
    return Object.keys(m.r).every(k => { const a = m.r[k]; return opCaminho(k) && Array.isArray(a) && [2, 3].includes(a.length) && Number.isSafeInteger(a[0]) && a[0] >= 0 && a[0] <= m.n && typeof a[1] === 'string'; })
      && Object.keys(m.s).every(k => { const a = m.s[k]; return opCaminho(k) && opCertificado(opCaminho(k)) && obj(a) && obj(a.a) && obj(a.x) && Object.keys(a.a).every(id => !['__proto__', 'constructor', 'prototype'].includes(id) && certValido(a.a[id])) && Object.keys(a.x).every(id => !['__proto__', 'constructor', 'prototype'].includes(id) && a.x[id] === true); })
      && Object.keys(m.c).every(k => { const a = m.c[k]; return opCaminho(k) && obj(a) && obj(a.a) && obj(a.x) && (!a.l || conjuntos(a.l)) && (!a.o || conjuntos(a.o)) && Object.keys(a.a).every(id => !['__proto__', 'constructor', 'prototype'].includes(id) && Number.isFinite(a.a[id]) && a.a[id] >= 0 && (opMaximo(opCaminho(k)) || Number.isSafeInteger(a.a[id]))) && Object.keys(a.x).every(id => !['__proto__', 'constructor', 'prototype'].includes(id) && a.x[id] === true); });
  }
  function opMaximo(p) { return ['mod', 'aula'].includes(p[0]) && p[p.length - 1] === 'best'; }
  function opCertificado(p) { return p[0] === 'cfg' && p[1] === 'certs' && p.length === 3; }
  function opContador(p) { return opMaximo(p) || p[0] === 'act' || p[0] === 'erros' || (['mod', 'aula'].includes(p[0]) && p[p.length - 1] === 'tent'); }
  function opPlano(st) {
    const s = opCopiar(st), out = {};
    if (s.cfg) delete s.cfg._ops;
    const lista = (a, certs) => { const r = {}; (a || []).forEach((x, i) => { const id = certs ? certChave(x) : typeof x.id === 'string' ? x.id : JSON.stringify(x) + '#' + i; r[id] = x; }); return r; };
    s.sims = lista(s.sims, false); s.cfg.certs = lista(s.cfg.certs, true);
    const andar = (v, p) => {
      if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length && !(p[0] === 'sims' && p.length === 2) && !(p[0] === 'cfg' && p[1] === 'certs' && p.length === 3)) Object.keys(v).sort().forEach(k => { if (!['__proto__', 'prototype', 'constructor', '_ops'].includes(k)) andar(v[k], p.concat(k)); });
      else out[JSON.stringify(p)] = v;
    };
    Object.keys(s).sort().forEach(k => { if (k !== '_abas' && !['sinc', 'ep', 'lin'].includes(k)) andar(s[k], [k]); }); return out;
  }
  function opSemMeta(s) { const x = opCopiar(s); if (x.cfg) delete x.cfg._ops; return x; }
  function opSemente(st) {
    const m = opVazio(), f = opPlano(st);
    Object.keys(f).forEach(k => { const p = opCaminho(k); if (!p) return; const v = f[k]; if (opCertificado(p) && certValido(v)) m.s[k] = { a: { legado: v }, x: {} }; else if (opContador(p) && typeof v === 'number' && v >= 0) m.c[k] = { a: { legado: v }, x: {} }; else m.r[k] = [0, 'legado', v]; }); return m;
  }
  function opMeta(st) { const m = st && st.cfg && st.cfg._ops; return opValida(m) ? opCopiar(opMigrar(m)) : opSemente(st); }
  function opUnir(a, b) {
    a = opMigrar(a); b = opMigrar(b);
    const r = opCopiar(a); r.n = Math.max(a.n, b.n);
    Object.keys(b.r).forEach(k => { const x = r.r[k], y = b.r[k]; if (!x || y[0] > x[0] || (y[0] === x[0] && (y[1] > x[1] || (y[1] === x[1] && JSON.stringify(y) > JSON.stringify(x))))) r.r[k] = opCopiar(y); });
    Object.keys(b.s).forEach(k => {
      const y = b.s[k], x = r.s[k] || { a: {}, x: {} };
      Object.keys(y.a).forEach(id => { const a = x.a[id], v = y.a[id]; if (!a || v.d < a.d || (v.d === a.d && JSON.stringify(v) > JSON.stringify(a))) x.a[id] = opCopiar(v); });
      Object.keys(y.x).forEach(id => { x.x[id] = true; }); r.s[k] = x;
    });
    Object.keys(b.c).forEach(k => { const y = b.c[k], x = r.c[k] || { a: {}, x: {} }; Object.keys(y.a).forEach(id => { x.a[id] = Math.max(x.a[id] || 0, y.a[id]); }); Object.keys(y.x).forEach(id => { x.x[id] = true; }); ['l', 'o'].forEach(tipo => { if (!y[tipo]) return; x[tipo] = x[tipo] || {}; Object.keys(y[tipo]).forEach(id => { x[tipo][id] = Object.assign({}, x[tipo][id] || {}, y[tipo][id]); }); }); r.c[k] = x; });
    // Tombstones LWW do protótipo v1 continuam cobrindo os valores antigos convertidos.
    [r.c, r.s].forEach(mapa => Object.keys(mapa).forEach(k => {
      const barreira = r.r[k]; if (!barreira || barreira.length !== 2) return;
      Object.keys(mapa[k].a).filter(id => id.indexOf('@v1:') === 0).forEach(id => { let a; try { a = JSON.parse(id.slice(4)); } catch (e) { return; } if (a[0] < barreira[0] || (a[0] === barreira[0] && a[1] <= barreira[1])) mapa[k].x[id] = true; });
    })); return r;
  }
  function opEstado(m) {
    m = opMigrar(m);
    const out = {}, campos = {};
    Object.keys(m.r).forEach(k => { if (m.r[k].length === 3) campos[k] = m.r[k][2]; });
    Object.keys(m.s).forEach(k => { const c = m.s[k], vals = Object.keys(c.a).filter(id => !c.x[id]).map(id => c.a[id]).sort((a, b) => a.d.localeCompare(b.d) || (Number(!a.c) - Number(!b.c)) || JSON.stringify(a).localeCompare(JSON.stringify(b))); if (vals.length) campos[k] = vals[0]; });
    Object.keys(m.c).forEach(k => { const c = m.c[k], vivos = Object.keys(c.a).filter(id => !c.x[id]), retirados = new Set();
      Object.keys(c.l || {}).forEach(l => { const viu = c.l[l], concorrente = vivos.some(id => !viu[id] && !((c.o || {})[id] || {})[l]); if (!concorrente) Object.keys(viu).forEach(id => retirados.add(id)); });
      const ids = vivos.filter(id => !retirados.has(id)); if (ids.length) campos[k] = opMaximo(opCaminho(k)) ? ids.reduce((n, id) => Math.max(n, c.a[id]), 0) : ids.reduce((n, id) => n + c.a[id], 0); });
    Object.keys(m.c).forEach(k => { if (campos[k] !== undefined && (!Number.isFinite(campos[k]) || (!opMaximo(opCaminho(k)) && !Number.isSafeInteger(campos[k])))) throw new Error('Contagem fora do limite seguro; nada foi substituído.'); });
    Object.keys(campos).sort((a, b) => JSON.parse(a).length - JSON.parse(b).length || a.localeCompare(b)).forEach(k => {
      const p = opCaminho(k); if (!p) return; let o = out;
      p.forEach((v, i) => { if (i === p.length - 1) o[v] = opCopiar(campos[k]); else { if (!o[v] || typeof o[v] !== 'object' || Array.isArray(o[v])) o[v] = {}; o = o[v]; } });
    });
    out.cfg = out.cfg || {}; out.cfg.certs = Object.values(out.cfg.certs || {}).filter(certValido).sort((a, b) => a.t - b.t || certChave(a).localeCompare(certChave(b)));
    out.sims = Object.values(out.sims || {}).sort((a, b) => String(a.d).localeCompare(String(b.d)) || JSON.stringify(a).localeCompare(JSON.stringify(b)));
    out.cfg._ops = m; return mesclar(out);
  }
  function opDelta(m, antes, depois, id) {
    m = opMigrar(m);
    const d = opVazio(); d.n = Math.max(m.n, Date.now()) + 1; const a = opPlano(antes), b = opPlano(depois);
    [...new Set(Object.keys(a).concat(Object.keys(b)))].forEach(k => {
      if (JSON.stringify(a[k]) === JSON.stringify(b[k])) return;
      const p = opCaminho(k); if (!p) return;
      if (opCertificado(p)) {
        const c = { a: {}, x: {} }, atual = m.s[k];
        if (atual) Object.keys(atual.a).forEach(i => { if (!atual.x[i]) c.x[i] = true; });
        if (b[k] !== undefined && certValido(b[k])) c.a[id] = b[k]; d.s[k] = c;
      } else if (opContador(p) && (typeof b[k] === 'number' || b[k] === undefined) && (typeof a[k] === 'number' || a[k] === undefined)) {
        const c = { a: {}, x: {} }, v = Math.max(0, Number(b[k]) || 0), ant = Math.max(0, Number(a[k]) || 0);
        const atual = m.c[k], lidas = Object.fromEntries(Object.keys((atual && atual.l) || {}).map(i => [i, true]));
        if (v > ant) { c.a[id] = opMaximo(p) ? v : v - ant; if (p[0] === 'erros') c.o = { [id]: lidas }; }
        else if (p[0] === 'erros' && !((depois.cfg.certsZ || 0) > (antes.cfg.certsZ || 0))) {
          const vistos = {}; if (atual) Object.keys(atual.a).forEach(i => { if (!atual.x[i]) vistos[i] = true; });
          c.l = { [id]: vistos }; if (v) { c.a[id] = v; c.o = { [id]: Object.assign({}, lidas, { [id]: true }) }; }
        } else { const atual = m.c[k]; if (atual) Object.keys(atual.a).forEach(i => { if (!atual.x[i]) c.x[i] = true; }); if (v) c.a[id] = v; }
        d.c[k] = c;
      } else d.r[k] = b[k] === undefined ? [d.n, id] : [d.n, id, b[k]];
    }); return d;
  }
  function opCombinarEstados(a, b) { return opEstado(opUnir(opMeta(a), opMeta(b))); }
  function temTravas() { return !!(navigator.locks && typeof navigator.locks.request === 'function'); }
  function nomeConta() { return identidade || 'sem-conta'; }
  function mesmoConteudo(a, b) { return JSON.stringify(canonico(a)) === JSON.stringify(canonico(b)); }
  function chaveDiario(tab) { return chave(DIARIO_K) + '#' + tab; }
  function partirDe(txt, st) { loc.vista = opCopiar(st || novoEstado()); loc.meta = opMeta(loc.vista); }
  function estadoDe(txt) { try { const o = JSON.parse(txt); return o && o.v === 1 ? mesclar(o) : null; } catch (e) { return null; } }
  /* Fila da aba; checkpoint IDB serializa todas as abas. Cache e notificações não são confirmação durável. */
  function operacaoPermitida(r, o) {
    return !r.encerrado && typeof o.id === 'string' && !['__proto__', 'constructor', 'prototype'].includes(o.id) && !(r.ignoradas || {})[o.id]
      && (!o.gen || o.gen === r.gen || o.local === true);
  }
  function aplicarReservas(r, ops) {
    const u = Object.assign({}, r, { recibos: Object.assign({}, r.recibos || {}) });
    ops.forEach(o => { if (operacaoPermitida(r, o) && !u.recibos[o.id]) { u.meta = opUnir(u.meta, o.delta); u.recibos[o.id] = true; u.apagado = false; } });
    return u;
  }
  function depoisDeMudarS() {
    if (V.v === 'inicio' && !semEstudo(S)) V = { v: 'hoje' };
    render();
    if (nuvem.ref && !saindo) { nuvem.pendente = true; clearTimeout(tSave); tSave = setTimeout(gravar, 1500); syncInfo(); }
  }
  function receberDuravel(r, id) {
    if (id !== identidade || !r || !opValida(r.meta)) return;
    if (r.apagado && loc.gen && loc.gen !== r.gen) { nuvem.ref = null; nuvem.on = false; }
    let m = r.meta;
    const ops = (loc.ops || []).filter(o => o.conta === id && operacaoPermitida(r, o));
    ops.forEach(o => { m = opUnir(m, o.delta); });
    const antes = JSON.stringify(opSemMeta(S)); loc.gen = r.gen; loc.meta = m;
    S = opEstado(m); loc.vista = opCopiar(S);
    if (JSON.stringify(opSemMeta(S)) !== antes) depoisDeMudarS(); else syncInfo();
  }
  function cachear(r, id) {
    if (r.apagado) return;
    // Cache opcional sob a mesma transação que serializa exclusões. Uma conferência fora dela não basta.
    transacaoConta(id, atual => {
      if (!atual || atual.apagado || atual.gen !== r.gen) return;
      try {
        const texto = localStorage.getItem(chave(LS, id)), hash = resumoDoc(atual.meta);
        if (loc.cacheId === id && loc.cacheHash === hash && loc.cacheTexto === texto) return;
        const anterior = estadoDe(texto), novo = opEstado(atual.meta);
        if (anterior && mesmoConteudo(opPlano(anterior), opPlano(novo))) { loc.cacheId = id; loc.cacheHash = hash; loc.cacheTexto = texto; return; }
        const bruto = JSON.stringify(novo); localStorage.setItem(chave(LS, id), bruto); loc.cacheId = id; loc.cacheHash = hash; loc.cacheTexto = bruto;
      } catch (e) { /* IDB já confirmou; o cache é opcional */ }
    }).catch(() => null);
  }
  function abrirAbas() {
    document.documentElement.dataset.armazenamento = 'carregando'; loc.incompativel = false;
    loc.quarentinas = new Map();
    clearInterval(loc.timer); loc.ops = []; loc.gen = null; loc.fila = Promise.resolve(); loc.pendente = 0;
    const id = identidade, st = opCopiar(loc.vista || novoEstado()), diarios = lerDiariosDe(id);
    try { const raw = JSON.parse(localStorage.getItem(chave(LS)) || 'null'); if (raw && raw._abas) st._abas = raw._abas; } catch (e) { /* cache ilegível preservado por carregar */ }
    loc.carga = legadosDuraveis(id).then(antigos => transacaoConta(id, r => {
      if (!r) return { gen: opId(), meta: metaMigrada(st, diarios.concat(antigos)), legados: Object.fromEntries(diarios.concat(antigos).filter(x => !x.d.delta).map(x => [x.k, x.d.seq])) };
      return aplicarReservas(r, diarios.filter(x => x.d.delta && opValida(x.d.delta)).map(x => x.d));
    })).then(r => {
      if (id !== identidade) return;
      if (mesmoConteudo(opPlano(st), opPlano(r.st))) { loc.cacheId = id; loc.cacheHash = resumoDoc(r.meta); try { loc.cacheTexto = localStorage.getItem(chave(LS, id)); } catch (e) { /* cache opcional */ } }
      receberDuravel(r, id); cachear(r, id); gravouLocal = true; loc.carregado = true; document.documentElement.dataset.armazenamento = 'pronto'; render(); consolidar();
    }).catch(e => { if (id !== identidade) return; loc.carregado = true; document.documentElement.dataset.armazenamento = 'reserva'; loc.incompativel = e.code === 'checkpoint-corrompido'; loc.semIDB = e.code !== 'checkpoint-corrompido'; gravouLocal = false; loc.erro = e.message; consolidar(); render(); syncInfo(); });
    loc.timer = setInterval(() => consolidar(), 1500);
  }
  function persistir(remoto) {
    const id = identidade, antes = loc.vista || novoEstado(), meta = loc.meta || opMeta(antes), oid = opId();
    let delta = remoto === true && S.cfg && opValida(S.cfg._ops) ? opMeta(S) : opDelta(meta, antes, S, oid);
    if (remoto && typeof remoto === 'object' && opValida(remoto.importado)) delta = opUnir(delta, remoto.importado);
    loc.meta = opUnir(meta, delta); S.cfg._ops = loc.meta; loc.vista = opCopiar(S);
    const o = { v: 2, id: oid, conta: id, gen: loc.gen, local: !remoto, delta, st: opCopiar(S) };
    loc.ops = (loc.ops || []).concat([o]); loc.pendente = loc.ops.length; loc.confirmando = true;
    // Reserva imutável. Falhar aqui não impede a transação IDB; nenhuma mensagem de confirmação antecipada.
    try { localStorage.setItem(chaveDiario(oid), JSON.stringify(o)); } catch (e) { loc.reservaFalhou = true; }
    enfileirar(o); return true;
  }
  function enfileirar(o) {
    const carga = loc.carga || Promise.resolve();
    loc.fila = (loc.fila || Promise.resolve()).catch(() => null).then(() => carga).then(async () => {
      const r = await transacaoConta(o.conta, ant => {
        return aplicarReservas(ant || { gen: o.gen || opId(), meta: opSemente(novoEstado()) }, [o]);
      });
      // A transação já terminou. Só agora se pode remover esta operação da reserva.
      try { localStorage.removeItem(chave(DIARIO_K, o.conta) + '#' + o.id); } catch (e) { /* reaplicação é idempotente */ }
      if (o.conta !== identidade) return;
      loc.ops = (loc.ops || []).filter(x => x.id !== o.id); loc.pendente = loc.ops.length; loc.confirmando = !!loc.pendente;
      loc.erro = ''; gravouLocal = true; cachear(r, o.conta); receberDuravel(r, o.conta);
    }).catch(e => {
      if (o.conta !== identidade) return;
      loc.erro = e.message; gravouLocal = false; loc.confirmando = false;
      if (loc.semIDB) consolidarReserva();
      render(); syncInfo();
    });
  }
  function consolidarReserva() {
    let m = loc.meta || opMeta(S);
    const bruto = (() => { try { return localStorage.getItem(chave(LS)); } catch (e) { return null; } })();
    if (bruto) { const st = estadoDe(bruto); if (st) m = opUnir(m, opMeta(st)); }
    lerDiarios().forEach(({ d }) => { if (d.delta && opValida(d.delta)) m = opUnir(m, d.delta); });
    try { localStorage.setItem(chave(LS), JSON.stringify(opEstado(m))); S = opEstado(m); loc.meta = m; loc.vista = opCopiar(S); loc.pendente = 0; gravouLocal = true; } catch (e) { gravouLocal = false; }
  }
  function consolidar() {
    if (!loc.carregado || loc.lendo) return;
    if (loc.semIDB) {
      consolidarReserva();
      if (!loc.tentando) {
        loc.tentando = true; const id = identidade, atual = opCopiar(S);
        transacaoConta(id, r => {
          if (r && r.apagado && loc.gen !== r.gen) throw new Error('Cópia apagada em outra aba; exporte o estudo antes de continuar.');
          return Object.assign({}, r || {}, { gen: r ? r.gen : opId(), meta: opUnir(r ? r.meta : opVazio(), opMeta(atual)) });
        }).then(r => { if (id !== identidade) return; loc.semIDB = false; loc.incompativel = false; loc.ops = []; loc.pendente = 0; loc.confirmando = false; gravouLocal = true; receberDuravel(r, id); cachear(r, id); render(); }).catch(() => null).finally(() => { loc.tentando = false; });
      }
      return;
    }
    const id = identidade; loc.lendo = true;
    const todos = lerDiariosDe(id), ds = todos.filter(x => x.d.v === 2 && opValida(x.d.delta));
    transacaoConta(id, r => {
      if (!r) return { gen: opId(), meta: opMeta(S) };
      todos.filter(x => !x.d.delta && !((r.legados || {})[x.k] >= x.d.seq)).forEach(x => quarentenar(x.txt, id, x.k, JSON.stringify(x.d.st)));
      return aplicarReservas(r, ds.map(x => x.d));
    }).then(r => {
      if (id !== identidade) return;
      const confirmadas = ds.filter(x => (r.recibos || {})[x.d.id] || !operacaoPermitida(r, x.d));
      confirmadas.forEach(x => { try { if (localStorage.getItem(x.k) === x.txt) localStorage.removeItem(x.k); } catch (e) { /* idempotente */ } });
      loc.ops = (loc.ops || []).filter(o => !confirmadas.some(x => x.d.id === o.id)); loc.pendente = loc.ops.length; loc.confirmando = !!loc.pendente;
      gravouLocal = true; receberDuravel(r, id); cachear(r, id);
    }).catch(e => { if (id === identidade) { gravouLocal = false; loc.erro = e.message; syncInfo(); } }).finally(() => { loc.lendo = false; });
  }
  function temPendentes(id) {
    if (id === identidade && loc.pendente) return true;
    let m = id === identidade ? loc.meta : null;
    if (!m) { try { const st = estadoDe(localStorage.getItem(chave(LS, id))); if (st) m = opMeta(st); } catch (e) { return true; } }
    return lerDiariosDe(id).some(x => x.d.delta && opValida(x.d.delta) && (!m || !mesmoConteudo(opUnir(m, x.d.delta), m)));
  }
  function comTravaLocal(fn) { (loc.fila || Promise.resolve()).then(fn).catch(e => { contaUI.msg = e.message; msgDados = e.message; pedindo = null; render(); }); }
  function soltarLocal() { if (lider.soltar && (saindo || document.visibilityState === 'hidden')) { lider.soltar(); lider.soltar = null; lider.ativa = false; lider.conta = null; lider.espera = null; } }
  async function liderar() {
    if (lider.ativa && lider.soltar && lider.conta === identidade) return; // já é a líder desta conta: continua (soltar e pedir de novo perderia a vez)
    if (lider.espera === identidade) return; // já está na fila desta conta
    if (lider.soltar) lider.soltar();
    lider.soltar = null; lider.ativa = !temTravas();
    if (lider.ativa) return;
    const conta = identidade, nome = 'eear-nuvem@' + nomeConta();
    const segurar = () => new Promise(r => { lider.soltar = r; lider.ativa = true; lider.conta = conta; lider.espera = null; });
    let agora = false;
    try {
      await new Promise((pronto, falha) => {
        navigator.locks.request(nome, { ifAvailable: true }, trava => {
          if (!trava || identidade !== conta) { pronto(); return undefined; }
          agora = true; const p = segurar(); pronto(); return p;
        }).catch(falha);
      });
    } catch (e) { lider.ativa = true; return; } // sem a trava (erro do navegador): sincroniza como antes
    if (agora) return;
    lider.espera = conta;
    navigator.locks.request(nome, () => { if (lider.espera === conta) lider.espera = null; if (identidade !== conta) return undefined; const p = segurar(); gravar(); return p; }).catch(() => { if (lider.espera === conta) lider.espera = null; });
  }
  window.addEventListener('storage', ev => {
    if (ev.storageArea !== localStorage || !ev.key) return;
    if (ev.key === chave(BASE_K)) syncInfo();
    if (ev.key === chave(LS) || ev.key.indexOf(chave(DIARIO_K) + '#') === 0) consolidar();
  });
  // Não aceitar mutações sobre uma cópia inicial ainda não reconciliada com o checkpoint desta identidade.
  function aguardandoDados(ev) {
    if (loc.carregado && !loc.incompativel) return;
    const el = ev.target.closest('[data-a]');
    if (ev.type === 'click' && (!el || ['tab', 'go', 'expcopiar', 'dadosver', 'dadosbaixar', 'cancelar'].includes(el.dataset.a))) return;
    if (loc.incompativel && ev.type === 'click' && el && ['dadosapagar', 'dadosapagarok', 'reccopiar', 'recdescartar'].includes(el.dataset.a)) return;
    ev.preventDefault(); ev.stopImmediatePropagation(); contaUI.msg = loc.incompativel ? 'O armazenamento está ilegível. Exporte seus dados antes de apagar a cópia para recomeçar.' : 'Preparando seus dados. Aguarde para estudar.'; render();
  }
  document.addEventListener('click', aguardandoDados, true);
  document.addEventListener('change', aguardandoDados, true);
  /* Checkpoint transacional por identidade. Nunca se coleta uma operação com base no cache localStorage.
     A transação readwrite serializa escritores mesmo sem Web Locks. Só oncomplete confirma durabilidade.
     Operações de reserva são imutáveis e só saem após esse checkpoint confirmado. */
  function abrirDuravel() {
    if (loc.idb) return loc.idb;
    loc.idb = new Promise((resolve, reject) => {
      try {
        if (!window.indexedDB) { reject(new Error('IndexedDB indisponível')); return; }
        const o = window.indexedDB.open('eear-operacoes', 1);
        o.onupgradeneeded = () => { const db = o.result; if (!db.objectStoreNames.contains('contas')) db.createObjectStore('contas'); if (!db.objectStoreNames.contains('quarentena')) db.createObjectStore('quarentena', { autoIncrement: true }); };
        o.onsuccess = () => { const db = o.result; db.onversionchange = () => { db.close(); loc.idb = null; }; resolve(db); };
        o.onerror = () => { loc.idb = null; reject(o.error); };
        o.onblocked = () => { loc.idb = null; reject(new Error('Armazenamento bloqueado por outra versão')); };
      } catch (e) { loc.idb = null; reject(e); }
    });
    const atual = loc.idb; atual.catch(() => { if (loc.idb === atual) loc.idb = null; });
    return atual;
  }
  async function transacaoConta(id, editar, permitirCorrompido) {
    const db = await abrirDuravel();
    return new Promise((resolve, reject) => {
      let t, resultado;
      try {
        t = db.transaction(['contas', 'quarentena'], 'readwrite', { durability: 'strict' });
        const s = t.objectStore('contas'), q = s.get(id);
        q.onsuccess = () => {
          if (!permitirCorrompido && q.result && !opValida(q.result.meta)) {
            const texto = JSON.stringify(q.result); t.objectStore('quarentena').add({ conta: id, origem: 'checkpoint', texto });
            resultado = new Error('O progresso durável está ilegível. Nada foi substituído; exporte a cópia de recuperação.'); resultado.code = 'checkpoint-corrompido';
            if (id === identidade) { recuperar = texto; try { localStorage.setItem(chave(LS_REC), texto); } catch (e) { /* a transação preserva a quarentena */ } } return;
          }
          if (q.result && opValida(q.result.meta)) q.result.meta = opMigrar(q.result.meta);
          try {
            resultado = editar(q.result || null, t);
            if (resultado !== undefined) { if (resultado.meta) { if (!opValida(resultado.meta)) throw new Error('Operação incompatível; checkpoint anterior preservado.'); resultado.st = opEstado(resultado.meta); } s.put(resultado, id); }
          }
          catch (e) { resultado = e; t.abort(); }
        };
        t.oncomplete = () => resultado instanceof Error ? reject(resultado) : resolve(resultado);
        t.onabort = t.onerror = () => reject(resultado instanceof Error ? resultado : t.error || new Error('Transação não confirmada'));
      } catch (e) { reject(e); }
    });
  }
  function quarentenar(texto, id, origem, progresso) {
    if (typeof texto !== 'string' || !texto) return;
    loc.quarentinas = loc.quarentinas || new Map(); const ref = id + ':' + origem; if (loc.quarentinas.get(ref) === texto) return; loc.quarentinas.set(ref, texto);
    const copia = progresso || texto;
    try { const k = chave(LS_REC, id); if (!localStorage.getItem(k)) localStorage.setItem(k, copia); } catch (e) { /* a cópia IDB é tentada também */ }
    abrirDuravel().then(db => {
      const t = db.transaction('quarentena', 'readwrite', { durability: 'strict' }); t.objectStore('quarentena').add({ conta: id, origem, texto });
      t.onerror = t.onabort = () => { gravouLocal = false; };
    }).catch(() => { gravouLocal = false; });
    if (id === identidade) { recuperar = copia; setTimeout(() => { if (id === identidade) render(); }, 0); }
  }
  function lerDiariosDe(id) {
    const pre = chave(DIARIO_K, id) + '#', out = [];
    try { Object.keys(localStorage).filter(k => k.indexOf(pre) === 0).forEach(k => {
      const txt = localStorage.getItem(k); let d = null; try { d = JSON.parse(txt); } catch (e) { /* preservado abaixo */ }
      if (!d || (!d.delta && (!d.st || d.st.v !== 1))) { quarentenar(txt, id, k); return; }
      out.push({ k, txt, d, tab: k.slice(pre.length) });
    }); } catch (e) { /* sem localStorage: IDB continua */ }
    return out;
  }
  function lerDiarios() { return lerDiariosDe(identidade); }
  async function legadosDuraveis(id) {
    if (!window.indexedDB) return [];
    return new Promise(resolve => {
      const o = window.indexedDB.open('eear-diarios', 1); let novo = false;
      o.onupgradeneeded = () => { novo = true; if (!o.result.objectStoreNames.contains('d')) o.result.createObjectStore('d'); };
      o.onerror = o.onblocked = () => resolve([]);
      o.onsuccess = () => {
        const db = o.result;
        if (novo || !db.objectStoreNames.contains('d')) { db.close(); resolve([]); return; }
        const t = db.transaction('d', 'readonly'), r = t.objectStore('d').openCursor(), out = [], pre = chave(DIARIO_K, id) + '#';
        r.onsuccess = () => { const c = r.result; if (c) { if (String(c.key).indexOf(pre) === 0) { try { out.push({ k: c.key, txt: c.value, d: JSON.parse(c.value) }); } catch (e) { quarentenar(c.value, id, String(c.key)); } } c.continue(); } };
        t.oncomplete = () => { db.close(); resolve(out); }; t.onerror = () => { db.close(); resolve([]); };
      };
    });
  }
  function metaMigrada(st, diarios) {
    let m = opMeta(st); const vistos = {};
    diarios.forEach(({ k, d }) => { if (!vistos[k] || (d.seq || 0) > (vistos[k].seq || 0)) vistos[k] = d; });
    Object.keys(vistos).forEach(k => {
      const d = vistos[k];
      if (d.delta && opValida(d.delta)) { m = opUnir(m, d.delta); return; }
      if (!d.st || d.st.v !== 1) return;
      const tab = k.slice(k.lastIndexOf('#') + 1), inc = st._abas && st._abas.inc && st._abas.inc[tab];
      if (inc !== undefined && inc >= d.seq) return;
      const base = d.base ? mesclar(d.base) : novoEstado();
      m = opUnir(m, d.base ? opDelta(opMeta(base), base, mesclar(d.st), 'migracao:' + JSON.stringify([k, d.seq])) : opMeta(mesclar(d.st)));
    }); return m;
  }
  async function apagarDuravel(id, definitivo) {
    const r = await transacaoConta(id, (ant, t) => {
      if (!definitivo && ant && opValida(ant.meta) && lerDiariosDe(id).some(x => x.d.delta && operacaoPermitida(ant, x.d) && !mesmoConteudo(opUnir(ant.meta, x.d.delta), ant.meta))) throw new Error('Nada foi apagado: outra aba tem operações pendentes.');
      if (!definitivo && id && ant && !ant.apagado) {
        let base = null; try { base = JSON.parse(localStorage.getItem(chave(BASE_K, id)) || 'null'); } catch (e) { /* sem confirmação */ }
        if (!base || !base.st || !uIgual(opEstado(ant.meta), mesclar(base.st))) throw new Error('Nada foi apagado: há progresso ainda não confirmado na nuvem.');
        if (lerDiariosDe(id).some(x => x.d.delta && !mesmoConteudo(opUnir(ant.meta, x.d.delta), ant.meta))) throw new Error('Nada foi apagado: outra aba tem operações pendentes.');
      }
      const q = t.objectStore('quarentena').openCursor(); q.onsuccess = () => { const c = q.result; if (c) { if (c.value.conta === id) c.delete(); c.continue(); } };
      // Nenhum escritor de cache pode atravessar este corte: usa o mesmo object store readwrite.
      const bases = [LS, LS_REC, BASE_K, ABAS_K, QUER_K, VIDA_K, APAGOU_K].map(k => chave(k, id));
      Object.keys(localStorage).filter(k => bases.some(b => k === b || k.indexOf(b + '#') === 0)).forEach(k => localStorage.removeItem(k));
      const ignoradas = Object.assign({}, ant && ant.ignoradas || {}, ant && ant.recibos || {});
      lerDiariosDe(id).forEach(x => { if (x.d.delta && typeof x.d.id === 'string' && !['__proto__', 'constructor', 'prototype'].includes(x.d.id)) ignoradas[x.d.id] = true; });
      return { gen: opId(), apagado: true, encerrado: !!definitivo || !!(ant && ant.encerrado), ignoradas, meta: opSemente(novoEstado()) };
    }, true);
    // Banco legado: só depois da transação nova; nenhum progresso pessoal deve ficar no espelho antigo.
    if (window.indexedDB) await new Promise((resolve, reject) => {
      const o = window.indexedDB.open('eear-diarios', 1); o.onupgradeneeded = () => { if (!o.result.objectStoreNames.contains('d')) o.result.createObjectStore('d'); }; o.onerror = () => reject(o.error); o.onblocked = () => reject(new Error('Espelho antigo bloqueado'));
      o.onsuccess = () => { const db = o.result; if (!db.objectStoreNames.contains('d')) { db.close(); resolve(); return; }
        const t = db.transaction('d', 'readwrite', { durability: 'strict' }), q = t.objectStore('d').openCursor(), pre = chave(DIARIO_K, id) + '#';
        q.onsuccess = () => { const c = q.result; if (c) { if (String(c.key).indexOf(pre) === 0) c.delete(); c.continue(); } };
        t.oncomplete = () => { db.close(); resolve(); }; t.onerror = t.onabort = () => { db.close(); reject(t.error); };
      };
    });
    return r;
  }
  async function copiasQuarentena(id, apagar) {
    const db = await abrirDuravel();
    return new Promise((resolve, reject) => {
      const t = db.transaction('quarentena', apagar ? 'readwrite' : 'readonly', { durability: 'strict' }), q = t.objectStore('quarentena').openCursor(), out = [];
      q.onsuccess = () => { const c = q.result; if (c) { if (c.value.conta === id) { out.push(c.value); if (apagar) c.delete(); } c.continue(); } };
      t.oncomplete = () => resolve(out); t.onabort = t.onerror = () => reject(t.error);
    });
  }
  async function descartarRecuperacao() {
    const id = identidade;
    try { await copiasQuarentena(id, true); } catch (e) { if (window.indexedDB) { msgDados = 'Não foi possível confirmar a exclusão da cópia. Tente novamente.'; render(); return; } }
    try { localStorage.removeItem(chave(LS_REC, id)); } catch (e) { return; }
    if (id === identidade) { recuperar = null; msgRec = ''; pedindo = null; render(); }
  }
  /* Confirmação de gravação é distinta de reserva e de disponibilidade da nuvem. */
  function syncInfo() {
    const el = document.getElementById('sync');
    if (el) el.textContent = loc.confirmando ? 'Aguardando confirmação do armazenamento neste aparelho. Mantenha a aba aberta.' : !gravouLocal ? 'O progresso não está sendo salvo neste aparelho. Mantenha esta aba aberta e exporte em Plano › Dados.' : loc.semIDB ? 'Este navegador usa uma cópia de reserva sem proteção contra queda. Exporte em Plano › Dados antes de fechar.' : recuperar ? 'Há dados preservados para recuperação. Veja a tela Hoje ou baixe seus dados antes de continuar.' : nuvem.apagado ? 'O progresso desta conta foi apagado da nuvem do curso. O que você estudar aqui fica só neste aparelho.' : nuvem.reapareceu ? 'Uma versão antiga do curso gravou de novo na nuvem depois que você apagou. Veja Plano › Dados.' : nuvem.bloqueada ? 'Progresso salvo neste aparelho, só para esta conta (sincronização com a nuvem ainda não liberada).' : nuvem.futura ? 'A sua conta tem progresso de uma versão mais nova do app: atualize o app. Nada foi gravado na conta.' : nuvem.erro ? avisoErroNuvem() : nuvem.ref && !lider.ativa ? (sincronizado() ? 'Progresso salvo na sua conta.' : 'Progresso salvo neste aparelho. Outra aba do curso, aberta nesta conta, envia o progresso para a nuvem.') : nuvem.on && nuvem.pendente ? (nuvem.semRede ? 'Progresso salvo neste aparelho. Sem conexão com a nuvem agora: o que falta vai para a sua conta quando a conexão voltar.' : 'Progresso salvo neste aparelho; enviando para a sua conta…') : nuvem.on ? (nuvem.semTrava ? 'Progresso salvo na sua conta. Com o curso aberto em dois aparelhos ao mesmo tempo, a sincronização não é garantida: algo desmarcado pode voltar e algumas contagens podem não somar.' : 'Progresso salvo na sua conta.') : gravouLocal ? 'Progresso salvo neste aparelho.' : 'O progresso não está sendo salvo neste aparelho.';
  }
})();
