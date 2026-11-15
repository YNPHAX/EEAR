/* Funções extraídas byte a byte do bundle publicado. Normalizador mínimo explícito: somente álgebra;
   toda falha candidata também precisa de confirmação na UI/emulador. Não altera o runtime. */
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert'), nodeCrypto = require('crypto'), { TextEncoder: Encoder } = require('util');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const hashEsperado = process.env.EEAR_RUNTIME_SHA256 || nodeCrypto.createHash('sha256').update(fs.readFileSync(path.join(alvo, 'curso/app.js'))).digest('hex');
const copia = x => JSON.parse(JSON.stringify(x));
const ordenar = x => Array.isArray(x) ? x.map(ordenar) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, ordenar(x[k])])) : x;
const igual = (a, b) => assert.deepStrictEqual(ordenar(copia(a)), ordenar(copia(b)));
const base = () => ({ v: 1, t: 0, cfg: { certs: [] }, mod: {}, aula: {}, fc: {}, ap: {}, erros: {}, act: {}, feito: {}, sims: [] });
function carregar() {
  const bundle = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8');
  assert.strictEqual(nodeCrypto.createHash('sha256').update(bundle).digest('hex'), hashEsperado);
  const partes = ['14-abas.js','12-identidades-importacao.js'].map(n => { const m = fs.readFileSync(path.join(alvo, 'curso/app', n), 'utf8'), i = bundle.indexOf(m); assert(i >= 0, n); return bundle.slice(i, i + m.length); });
  let clock = 0;
  const c = { window: {}, navigator: {}, loc: {}, TextEncoder: Encoder, Date: class extends Date { static now() { return 1900000000000 + clock++; } }, novoEstado: base,
    mesclar: x => Object.assign(base(), x, { cfg: Object.assign({ certs: [] }, x.cfg || {}) }), certValido: x => !!x && typeof x.c === 'string', certChave: x => [x.s, x.mod || '', x.ids.join()].join('|') };
  vm.createContext(c); vm.runInContext(partes.join('\n') + ';this.api={opVazio,opSemente,opUnir,opEstado,opMeta,opDelta,opTransferencia,opValida,identidadeImportacao,operacoesLegadas};', c);
  return c.api;
}
function rng(seed) { let x = seed >>> 0 || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; }; }
function permutar(o, r) {
  if (Array.isArray(o)) return o.map(x => permutar(x, r));
  if (!o || typeof o !== 'object') return o;
  const ks = Object.keys(o); for (let i = ks.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ks[i],ks[j]] = [ks[j],ks[i]]; }
  return Object.fromEntries(ks.map(k => [k, permutar(o[k], r)]));
}
function reduzir(ops, falha) { let r = ops.slice(), mudou = true; while (mudou) { mudou = false; for (let i = 0; i < r.length; i++) { const t = r.slice(0, i).concat(r.slice(i + 1)); if (falha(t)) { r = t; mudou = true; break; } } } return r; }
module.exports = { alvo, hashEsperado, carregar, base, copia, ordenar, igual, rng, permutar, reduzir };
