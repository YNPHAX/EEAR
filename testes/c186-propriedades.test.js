/* Sementes fixas/reproduzíveis. Oráculo de eventos independente para atividade/reset/transferência;
   merge e importação são as funções reais, não uma reimplementação do aplicativo. */
const assert = require('assert'), fs = require('fs'), path = require('path');
const { carregar, base, copia, ordenar, igual, rng, permutar, reduzir, hashEsperado } = require('./c186-propriedades-base.js');
const out = process.env.EEAR_AUDITORIA_SAIDA || '/tmp/eear-propriedades-c186008'; fs.mkdirSync(out, { recursive: true });
const a = carregar(), falhas = [], contagem = { sementes: 0, acoes: 0, algebra: 0, errosCausais: 0, canonicas: 0 };
function sequencia(seed) {
  const r = rng(seed), atores = Array.from({ length: 6 }, () => ({ m: a.opSemente(base()), add: new Set(), rem: new Set() })), ops = [], pontos = [];
  const merge = (d, s) => { d.m = a.opUnir(d.m, s.m); s.add.forEach(x => d.add.add(x)); s.rem.forEach(x => d.rem.add(x)); };
  const vis = s => [...s.add].filter(x => !s.rem.has(x));
  for (let k = 0; k < 60; k++) {
    const i = Math.floor(r() * 6), j = Math.floor(r() * 3) + (i < 3 ? 0 : 3), st = atores[i], tipo = Math.floor(r() * 5), antes = copia(a.opEstado(st.m)), depois = copia(antes), id = `e:${seed}:${k}`;
    if (tipo < 2) { depois.act.dia = (depois.act.dia || 0) + 1; depois.feito[id] = true; st.m = a.opUnir(st.m, a.opDelta(st.m, antes, depois, id)); st.add.add(id); ops.push({ tipo: 'estudar', i, id }); }
    else if (tipo === 2) { depois.act = {}; depois.feito = {}; depois.cfg.certsZ = k + 1; st.m = a.opUnir(st.m, a.opDelta(st.m, antes, depois, id)); vis(st).forEach(x => st.rem.add(x)); ops.push({ tipo: 'zerar', i }); }
    else if (tipo === 3) { merge(st, atores[j]); ops.push({ tipo: 'sincronizar-importar', i, j }); }
    else { const alvo = atores[(i + 3) % 6], positivos = vis(st), antesDestino = copia(alvo.m); alvo.m = a.opUnir(alvo.m, a.opTransferencia(a.opEstado(st.m))); positivos.forEach(x => alvo.add.add(x)); ops.push({ tipo: 'levar', i, para: (i + 3) % 6 }); assert(a.opValida(antesDestino)); }
    for (const x of atores) { assert.strictEqual(a.opEstado(x.m).act.dia || 0, vis(x).length); assert(a.opValida(x.m)); }
    if (k % 20 === 19) pontos.push(copia(atores[Math.floor(r() * 6)].m));
    contagem.acoes++;
  }
  for (const inicio of [0,3]) { for (let t = 0; t < 3; t++) for (let i = inicio; i < inicio + 3; i++) for (let j = inicio; j < inicio + 3; j++) merge(atores[i], atores[j]); igual(a.opEstado(atores[inicio].m), a.opEstado(atores[inicio + 2].m)); }
  const [x,y,z] = pontos; igual(a.opUnir(x,x), x); igual(a.opUnir(x,y), a.opUnir(y,x)); igual(a.opUnir(a.opUnir(x,y),z), a.opUnir(x,a.opUnir(y,z))); contagem.algebra += 3;
  return ops;
}
function causal(seed) {
  let m = a.opSemente(base()), st = copia(a.opEstado(m)); st.erros.q = 1 + seed % 5; m = a.opUnir(m, a.opDelta(m, a.opEstado(m), st, 'e:erro-' + seed));
  const corrigido = copia(a.opEstado(m)); corrigido.erros = {}; const limpo = a.opUnir(m, a.opDelta(m, a.opEstado(m), corrigido, 'e:corrigir-' + seed));
  const novo = copia(a.opEstado(limpo)); novo.erros.q = 1 + seed % 3; const origem = a.opUnir(limpo, a.opDelta(limpo, a.opEstado(limpo), novo, 'e:novo-' + seed));
  let d = limpo; for (let i = 0; i < 4; i++) { d = a.opUnir(d, a.opTransferencia(a.opEstado(origem))); assert.strictEqual(a.opEstado(d).erros.q, novo.erros.q); }
  const zero = copia(a.opEstado(d)); zero.erros = {}; d = a.opUnir(d, a.opDelta(d, a.opEstado(d), zero, 'e:recorrigir-' + seed)); d = a.opUnir(d, a.opTransferencia(a.opEstado(origem))); assert.strictEqual(a.opEstado(d).erros.q || 0, 0); contagem.errosCausais++;
}
function replay(ops) {
  const ms = [a.opSemente(base()),a.opSemente(base())]; let hash;
  for (const op of ops) {
    if (op.tipo === 'importar') { const h = a.identidadeImportacao(op.backup); hash = hash || h; assert.strictEqual(h, hash); ms[op.i] = a.opUnir(ms[op.i], a.operacoesLegadas(ms[op.i], op.backup, h, false)); }
    if (op.tipo === 'zerar') { const st = copia(a.opEstado(ms[op.i])); st.sims = []; st.act = {}; st.feito = {}; st.cfg.certsZ = 1; ms[op.i] = a.opUnir(ms[op.i], a.opDelta(ms[op.i], a.opEstado(ms[op.i]), st, 'e:reset')); }
    if (op.tipo === 'sincronizar') ms[op.i] = a.opUnir(ms[op.i], ms[op.j]);
  }
  return { hash, metadados: ms.map(copia), estados: ms.map(x => copia(a.opEstado(x))) };
}
for (let seed = 1; seed <= 512; seed++) {
  try { sequencia(seed); causal(seed); } catch (e) { falhas.push({ propriedade: 'eventos-causais', seed, erro: e.message }); }
  const original = base(); original.act.dia = seed % 3 + 1; original.sims = [{ d: '2026-11-15', tipo: 'materia', mat: 'por', prova: null, r: { por: [1,2] }, min: 5 }];
  const variacao = permutar(original, rng(seed));
  for (const reset of [false,true]) {
    const ops = [{ tipo: 'importar', i: 0, backup: original }, ...(reset ? [{ tipo: 'zerar', i: 0 }] : []), { tipo: 'importar', i: 1, backup: variacao }, { tipo: 'sincronizar', i: 0, j: 1 }];
    const viola = xs => { if ((reset && !xs.some(x => x.tipo === 'zerar')) || xs.filter(x => x.tipo === 'importar').length !== 2 || !xs.some(x => x.tipo === 'sincronizar')) return false; const t = replay(xs), apagou = xs.some(x => x.tipo === 'zerar'); return t.estados[0].sims.length !== (apagou ? 0 : 1); };
    contagem.canonicas++;
    if (viola(ops) && !falhas.some(x => x.propriedade === (reset ? 'reset-canonico' : 'idempotencia-canonica'))) { const min = reduzir(ops, viola); falhas.push({ propriedade: reset ? 'reset-canonico' : 'idempotencia-canonica', seed, sequencia: ops, minima: min, resultado: replay(min) }); }
  }
  contagem.sementes++;
}
// Número finito aceito pelo formato, mas que não avança ao somar 1. Controle normal é separado.
for (const marcador of [0, 1e30]) {
  const raw = base(); raw.cfg.certsZ = marcador; raw.erros.q = 2; const h = a.identidadeImportacao(raw), comum = a.opUnir(a.opSemente(base()), a.operacoesLegadas(a.opSemente(base()), raw, h, false));
  const zerou = copia(a.opEstado(comum)); zerou.erros = {}; zerou.cfg.certsZ = Math.max(1900000000000, (zerou.cfg.certsZ || 0) + 1);
  const A = a.opUnir(comum, a.opDelta(comum, a.opEstado(comum), zerou, 'e:ZERAR'));
  const errou = copia(a.opEstado(comum)); errou.erros.q++; const B = a.opUnir(comum, a.opDelta(comum, a.opEstado(comum), errou, 'e:erro-concorrente'));
  const resultado = copia(a.opEstado(a.opUnir(A,B)));
  if (marcador === 0) assert.strictEqual(resultado.erros.q, 1);
  else if (resultado.erros.q !== 1) falhas.push({ propriedade: 'reset-marcador-inseguro', seed: '0xC186008', minimo: ['importar erros=2, certsZ=1e30', 'A: Zerar', 'B: errar uma vez sem observar A', 'sincronizar'], antes: raw, A: copia(a.opEstado(A)), B: copia(a.opEstado(B)), resultado });
}
const relatorio = { sha: 'c186008012ba12709fc07c08e36532471a894a8c', hashEsperado, contagem, falhas };
fs.writeFileSync(path.join(out, 'propriedades-resultados.json'), JSON.stringify(ordenar(relatorio),null,2));
console.log(JSON.stringify({ contagem, falhas: falhas.map(x => ({ propriedade: x.propriedade, seed: x.seed, minimo: x.minima?.map(y => y.tipo) || x.minimo, estados: x.resultado?.estados?.map(y => ({ sims: y.sims.length, act: y.act })) || x.resultado?.erros })) }));
process.exitCode = falhas.length ? 1 : 0;
