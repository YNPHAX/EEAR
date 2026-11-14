/* IA05/IA06 obrigatórios. Reproduções originais ficam intactas, inclusive controles de SHA histórico.
   No candidato, a sonda equivalente de regras confere o hash corrente em vez do SHA-256 fixo de a6366a8. */
const path = require('path'), assert = require('assert'), { spawnSync, execFileSync } = require('child_process');
const base = process.env.EEAR_REPO_REPROVADO_IA05;
assert(base, 'Defina EEAR_REPO_REPROVADO_IA05 para o checkout a6366a8.');
assert.strictEqual(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: base, encoding: 'utf8' }).trim(), 'a6366a849871db3de3554f28fa1400f10aff0f0c');
let falhas = 0;
const controle = spawnSync(process.execPath, [path.join(__dirname, 'a636-matriz-auditoria.js')], { env: { ...process.env, EEAR_REPO_ALVO: base }, encoding: 'utf8' });
const texto = (controle.stdout || '') + (controle.stderr || ''); process.stdout.write(texto);
const reproduziu = controle.status === 1 && (texto.match(/^AUDITORIA .*: exit 1$/gm) || []).length === 3 && /"atividadeFinal":8/.test(texto) && /"atividadeFinal":11/.test(texto) && /"local":3,"remoto":3/.test(texto) && /"remoto":8,"novoDispositivo":8/.test(texto) && !texto.includes('PREPARAÇÃO/EXECUÇÃO:');
console.log('CONTROLE IA05/IA06 a6366a8: ' + (reproduziu ? 'REPRODUZIU' : 'FALHOU')); if (!reproduziu) falhas++;
for (const nome of ['a636-importacoes-concorrentes','a636-importacao-dispositivos','a636-transferencia-erros','a636-sessoes-abas','a636-abort-exclusao','importacoes-regras-dependencia','importacoes-ciclo','importacoes-offline','importacoes-crash','importacoes-falhas','importacoes-cliente-anterior','importacoes-propriedades']) {
  const r = spawnSync(process.execPath, [path.join(__dirname, nome + '.test.js')], { env: process.env, stdio: 'inherit' });
  console.log('GATE IA05/IA06 ' + nome + ': ' + (r.status === 0 ? 'PASSOU' : 'FALHOU')); if (r.status !== 0) falhas++;
}
process.exitCode = falhas ? 1 : 0;
