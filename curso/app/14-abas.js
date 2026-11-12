  /* Operações identificadas: registradores LWW por campo e contribuições de contadores por operação.
     União associativa, comutativa e idempotente. Um reset remove apenas contribuições que observou;
     incrementos concorrentes/pós-reset continuam. Nada depende de um histórico limitado de snapshots.
     cfg._ops preserva identidades na nuvem e em versões antigas que copiam cfg. Não é uma assinatura de segurança. */
  function opCopiar(x) { return JSON.parse(JSON.stringify(x)); }
  function opId() { return 'o' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)); }
  function opVazio() { return { v: 1, n: 0, r: {}, c: {} }; }
  function opCaminho(k) {
    try { const p = JSON.parse(k); return Array.isArray(p) && p.length > 0 && p.length < 15 && ['v', 't', 'cfg', 'mod', 'fc', 'erros', 'sims', 'diag', 'feito', 'act', 'ativo', 'ult', 'ap', 'aula', 'ultAula'].includes(p[0]) && p.every(x => typeof x === 'string' && !['__proto__', 'prototype', 'constructor', '_ops'].includes(x)) ? p : null; } catch (e) { return null; }
  }
  function opValida(m) {
    const obj = o => !!o && typeof o === 'object' && !Array.isArray(o);
    if (!obj(m) || m.v !== 1 || !Number.isSafeInteger(m.n) || m.n < 0 || !obj(m.r) || !obj(m.c)) return false;
    return Object.keys(m.r).every(k => { const a = m.r[k]; return opCaminho(k) && Array.isArray(a) && [2, 3].includes(a.length) && Number.isSafeInteger(a[0]) && a[0] >= 0 && a[0] <= m.n && typeof a[1] === 'string'; })
      && Object.keys(m.c).every(k => { const a = m.c[k]; return opCaminho(k) && obj(a) && obj(a.a) && obj(a.x) && Object.keys(a.a).every(id => !['__proto__', 'constructor', 'prototype'].includes(id) && Number.isFinite(a.a[id]) && a.a[id] >= 0) && Object.keys(a.x).every(id => !['__proto__', 'constructor', 'prototype'].includes(id) && a.x[id] === true); });
  }
  function opContador(p) { return p[0] === 'act' || p[0] === 'erros' || (['mod', 'aula'].includes(p[0]) && p[p.length - 1] === 'tent'); }
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
    Object.keys(f).forEach(k => { const p = opCaminho(k); if (!p) return; const v = f[k]; if (opContador(p) && typeof v === 'number' && v >= 0) m.c[k] = { a: { legado: v }, x: {} }; else m.r[k] = [0, 'legado', v]; }); return m;
  }
  function opMeta(st) { const m = st && st.cfg && st.cfg._ops; return opValida(m) ? opCopiar(m) : opSemente(st); }
  function opUnir(a, b) {
    const r = opCopiar(a); r.n = Math.max(a.n, b.n);
    Object.keys(b.r).forEach(k => { const x = r.r[k], y = b.r[k]; if (!x || y[0] > x[0] || (y[0] === x[0] && (y[1] > x[1] || (y[1] === x[1] && JSON.stringify(y) > JSON.stringify(x))))) r.r[k] = opCopiar(y); });
    Object.keys(b.c).forEach(k => { const y = b.c[k], x = r.c[k] || { a: {}, x: {} }; Object.keys(y.a).forEach(id => { x.a[id] = Math.max(x.a[id] || 0, y.a[id]); }); Object.keys(y.x).forEach(id => { x.x[id] = true; }); r.c[k] = x; }); return r;
  }
  function opEstado(m) {
    const out = {}, campos = {};
    Object.keys(m.r).forEach(k => { if (m.r[k].length === 3) campos[k] = m.r[k][2]; });
    Object.keys(m.c).forEach(k => { const c = m.c[k], ids = Object.keys(c.a).filter(id => !c.x[id]); if (ids.length) campos[k] = ids.reduce((n, id) => n + c.a[id], 0); });
    Object.keys(campos).sort((a, b) => JSON.parse(a).length - JSON.parse(b).length || a.localeCompare(b)).forEach(k => {
      const p = opCaminho(k); if (!p) return; let o = out;
      p.forEach((v, i) => { if (i === p.length - 1) o[v] = opCopiar(campos[k]); else { if (!o[v] || typeof o[v] !== 'object' || Array.isArray(o[v])) o[v] = {}; o = o[v]; } });
    });
    out.cfg = out.cfg || {}; out.cfg.certs = Object.values(out.cfg.certs || {}).filter(certValido).sort((a, b) => a.t - b.t || certChave(a).localeCompare(certChave(b)));
    out.sims = Object.values(out.sims || {}).sort((a, b) => String(a.d).localeCompare(String(b.d)) || JSON.stringify(a).localeCompare(JSON.stringify(b)));
    out.cfg._ops = m; return mesclar(out);
  }
  function opDelta(m, antes, depois, id) {
    const d = opVazio(); d.n = m.n + 1; const a = opPlano(antes), b = opPlano(depois);
    [...new Set(Object.keys(a).concat(Object.keys(b)))].forEach(k => {
      if (JSON.stringify(a[k]) === JSON.stringify(b[k])) return;
      const p = opCaminho(k); if (!p) return;
      if (opContador(p) && (typeof b[k] === 'number' || b[k] === undefined) && (typeof a[k] === 'number' || a[k] === undefined)) {
        const c = { a: {}, x: {} }, v = Math.max(0, Number(b[k]) || 0), ant = Math.max(0, Number(a[k]) || 0);
        if (v > ant) c.a[id] = v - ant;
        else { const atual = m.c[k]; if (atual) Object.keys(atual.a).forEach(i => { if (!atual.x[i]) c.x[i] = true; }); if (v) c.a[id] = v; }
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
