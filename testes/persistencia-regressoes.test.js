/* Gate dos achados independentes. Sempre emuladores/dados fictícios, sequencial para evitar conflito de portas.
   Os emuladores de cada teste precisam encerrar antes do seguinte; todos os resultados ficam visíveis. */
const path = require('path'), { spawnSync } = require('child_process');
const casos = [
  ['f01-abas', {}], ['noturna-integridade', {}], ['noturna-falhas', {}], ['noturna-seguranca', {}],
  ['noturna-confirmacao', {}], ['duravel-candidato', {}], ['operacoes-interrupcao', {}],
  ['operacoes-suspensas', { EEAR_ORFAOS_CENARIOS: 'segunda-escrita-8s', EEAR_ORFAOS_SEQUENCIAS: '9' }], ['operacoes-falhas', {}], ['operacoes-recuperacao', {}],
  ['operacoes-exclusao-concorrente', {}], ['operacoes-cache-exclusao', {}]
];
let falhas = 0;
for (const [nome, variaveis] of casos) {
  const r = spawnSync(process.execPath, [path.join(__dirname, nome + '.test.js')], { env: { ...process.env, ...variaveis }, stdio: 'inherit' });
  console.log(`GATE ${nome}: ${r.status === 0 ? 'PASSOU' : 'FALHOU'}${r.error ? ' — ' + r.error.message : ''}`);
  if (r.status !== 0) falhas++;
}
process.exitCode = falhas ? 1 : 0;
