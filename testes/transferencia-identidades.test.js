/* IA02: mesma álgebra do runtime, sem cópia da implementação. Transfere apenas contribuições vivas.
   O teste de navegador a35-levar-reimportacao exige a integração pública e o servidor. */
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const base = () => ({ v: 1, t: 0, cfg: { nome: 'Destino', certs: [] }, feito: {}, act: {}, erros: {}, sims: [], mod: {}, aula: {} });
const c = { window: {}, navigator: {}, loc: {}, novoEstado: base, mesclar: x => x, certValido: x => !!x.c, certChave: x => x.c };
vm.createContext(c); vm.runInContext(fs.readFileSync('curso/app/14-abas.js', 'utf8') + ';this.api={opSemente,opDelta,opUnir,opEstado,opTransferencia};', c);
const { opSemente, opDelta, opUnir, opEstado, opTransferencia } = c.api, copia = x => JSON.parse(JSON.stringify(x));
const alterar = (m, id, fn) => { const a = opEstado(m), b = copia(a); fn(b); return opUnir(m, opDelta(m, a, b, id)); };
const marca = (m, id) => alterar(m, id, s => { s.feito[id] = true; s.act.dia = (s.act.dia || 0) + 1; });
let origem = marca(marca(opSemente(base()), 'A1'), 'A2'), destino = marca(marca(marca(opSemente(base()), 'B1'), 'B2'), 'B3');
origem = alterar(origem, 'CERT', s => { s.cfg.nome = 'Origem'; s.cfg.certs = [{ c: 'CERT', d: '2026-10-01', t: 1 }]; });
const levar = (d, o) => opUnir(d, opTransferencia(opEstado(o)));
const unido = levar(destino, origem); assert.strictEqual(opEstado(unido).act.dia, 5); assert.strictEqual(opEstado(unido).cfg.nome, 'Destino');
assert.strictEqual(opEstado(levar(unido, origem)).act.dia, 5); assert.strictEqual(opEstado(unido).cfg.certs.length, 1);
assert.deepStrictEqual(Object.keys(unido.c['["act","dia"]'].a).sort(), ['A1', 'A2', 'B1', 'B2', 'B3']);
const zerar = m => alterar(m, 'Z' + m.n, s => { s.act = {}; s.feito = {}; s.cfg.certs = []; s.cfg.certsZ = Date.now(); });
const zerouOrigem = zerar(origem); assert.strictEqual(opEstado(levar(unido, zerouOrigem)).act.dia, 5); assert.strictEqual(opEstado(levar(unido, zerouOrigem)).cfg.certs.length, 1);
const novoOrigem = marca(zerouOrigem, 'A3'); assert.strictEqual(opEstado(levar(unido, novoOrigem)).act.dia, 6);
const zerouDestino = zerar(unido), repetido = levar(zerouDestino, origem); assert.strictEqual(opEstado(repetido).act.dia, undefined); assert.strictEqual(opEstado(repetido).cfg.certs.length, 0);
assert.strictEqual(opEstado(levar(repetido, novoOrigem)).act.dia, 1);
// Correções de erros retiram apenas contribuições observadas; não transportar IDs logicamente retirados.
let erro = alterar(origem, 'ERRO', s => { s.erros.q = 2; }); erro = alterar(erro, 'CORRIGIU', s => { delete s.erros.q; });
assert.strictEqual(opEstado(levar(destino, erro)).erros.q, undefined);
console.log('✓ Transferência: 5 IDs exatos, repetição, configuração, certificados, Zerar de cada origem, novo estudo e erros retirados.');
