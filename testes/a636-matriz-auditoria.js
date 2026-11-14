/* Auditoria independente: não transforma falhas do candidato em controles positivos.
   Requer checkout a6366a8 em EEAR_REPO_ALVO e produtor 2f6cad6 em EEAR_REPO_LEGADO. */
const path = require('path'), assert = require('assert'), { execFileSync, spawnSync } = require('child_process');
assert(process.env.EEAR_REPO_ALVO && process.env.EEAR_REPO_LEGADO, 'Defina os dois checkouts imutáveis.');
assert.strictEqual(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: process.env.EEAR_REPO_ALVO, encoding: 'utf8' }).trim(), 'a6366a849871db3de3554f28fa1400f10aff0f0c');
let falhas = 0;
for (const nome of ['a636-importacoes-concorrentes', 'a636-transferencia-erros', 'a636-importacao-dispositivos', 'a636-sessoes-abas', 'a636-abort-exclusao', 'a636-regras-dependencia']) {
  const r = spawnSync(process.execPath, [path.join(__dirname, nome + '.test.js')], { env: process.env, stdio: 'inherit' });
  console.log('AUDITORIA ' + nome + ': exit ' + r.status); if (r.status !== 0) falhas++;
}
console.log('Auditoria adicional: ' + falhas + ' executáveis com falhas; nenhum critério foi reduzido.');
process.exitCode = falhas ? 1 : 0;
