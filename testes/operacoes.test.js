/* Propriedades das operações reais: comutatividade/idempotência, reset observado, repetição e ordem arbitrária.
   Sem navegador, serviço ou cópia da implementação: executa curso/app/14-abas.js em contexto isolado. */
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const base = () => ({ v: 1, t: 0, cfg: { certs: [] }, feito: {}, act: { dia: 2 }, erros: {}, sims: [], mod: {}, aula: {} });
const c = { window: {}, navigator: {}, loc: {}, novoEstado: base, mesclar: x => x, certValido: x => !!x.c, certChave: x => x.c };
vm.createContext(c);
vm.runInContext(fs.readFileSync('curso/app/14-abas.js', 'utf8') + ';this.api={opSemente,opDelta,opUnir,opEstado,opValida};', c);
const { opSemente, opDelta, opUnir, opEstado, opValida } = c.api;
const copia = x => JSON.parse(JSON.stringify(x)), seed = opSemente(base());
const marca = (m, id, chave) => { const a = opEstado(m), b = copia(a); b.feito[chave] = true; b.act.dia = (b.act.dia || 0) + 1; return opDelta(m, a, b, id); };
const A = marca(seed, 'A', 'A'), B = marca(seed, 'B', 'B');
const AB = opUnir(opUnir(seed, A), B), BA = opUnir(opUnir(seed, B), A);
assert.deepStrictEqual(copia(opEstado(AB)).act, { dia: 4 });
assert.deepStrictEqual(copia(opEstado(AB)).feito, copia(opEstado(BA)).feito);
assert.deepStrictEqual(copia(opEstado(opUnir(AB, A))).act, { dia: 4 }); // confirmação perdida/repetição
const depoisA = opUnir(seed, A), antesZ = opEstado(depoisA), z = copia(antesZ); z.act = {}; z.feito = {};
const Z = opDelta(depoisA, antesZ, z, 'Z');
const comZ = opUnir(opUnir(AB, Z), Z), stZ = opEstado(comZ);
assert.strictEqual(stZ.act.dia, 1); assert.strictEqual(stZ.feito.A, undefined); assert.strictEqual(stZ.feito.B, true);
const nova = marca(opUnir(depoisA, Z), 'NOVA', 'NOVA');
assert.strictEqual(opEstado(opUnir(comZ, nova)).act.dia, 2);
// Dois resets que viram a mesma base não subtraem a base duas vezes; ambos os estudos posteriores ficam.
const zero = base(); zero.act = {}; const R1 = opDelta(seed, base(), zero, 'R1'), R2 = opDelta(seed, base(), zero, 'R2');
const p1 = marca(opUnir(seed, R1), 'P1', 'P1'), p2 = marca(opUnir(seed, R2), 'P2', 'P2');
let m = seed; [R1, R2, p1, p2, R1, p2].forEach(d => { m = opUnir(m, d); }); assert.strictEqual(opEstado(m).act.dia, 2);
// 120 operações independentes em quatro produtores, com 360 entregas fora de ordem e duplicadas.
const ds = []; for (let n = 0; n < 4; n++) { let local = seed; for (let i = 0; i < 30; i++) { const d = marca(local, n + ':' + i, n + ':' + i); ds.push(d); local = opUnir(local, d); } }
for (let rodada = 0; rodada < 5; rodada++) {
  let r = seed; const ordem = ds.slice(rodada * 11).concat(ds.slice(0, rodada * 11)).reverse();
  ordem.concat(ordem, ordem.slice().reverse()).forEach(d => { r = opUnir(r, d); });
  const s = opEstado(r); assert.strictEqual(s.act.dia, 122); assert.strictEqual(Object.keys(s.feito).length, 120);
}
assert.strictEqual(opValida({ v: 1, n: 1, r: { '["cfg","__proto__","x"]': [1, 'x', true] }, c: {} }), false);
console.log('Operações: propriedades de união, repetição, dois resets, 4 produtores/120 alterações e caminhos maliciosos passaram.');
