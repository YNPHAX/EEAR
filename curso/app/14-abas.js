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
