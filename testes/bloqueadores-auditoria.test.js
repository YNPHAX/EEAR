/* Gate obrigatório dos quatro bloqueadores. Testes da auditoria preservados byte a byte.
   IA04 original só pode reproduzir a falha se o DELETE antigo for aceito: execução negativa no SHA reprovado
   é controle causal obrigatório; o contrato novo é exigido separadamente em exclusao-protocolo. */
const path = require('path'), fs = require('fs'), assert = require('assert'), { spawnSync, execFileSync } = require('child_process');
const base = process.env.EEAR_REPO_REPROVADO, legado = process.env.EEAR_REPO_LEGADO;
assert(base && legado, 'Defina checkouts imutáveis EEAR_REPO_REPROVADO=a35ea9a e EEAR_REPO_LEGADO=2f6cad6.');
assert.strictEqual(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: base, encoding: 'utf8' }).trim(), 'a35ea9a769c150e561dfbde3205525b96bbfbfe7');
assert.strictEqual(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: legado, encoding: 'utf8' }).trim(), '2f6cad6ebba53d0f86319dcada671fe9396f8111');
const negativos = [
  ['a35-importacao-exclusao', 4, /"restouReserva":false/],
  ['a35-contas-adversarial', 2, /"uid":null/],
  ['a35-levar-reimportacao', 2, /"depoisImportar":6/],
  ['a35-retorno-firebase-antigo', 1, /"authExcluidaHTTP":400,"marcadorHTTP":404,"recriou":true/]
];
let falhas = 0;
for (const [nome, n, prova] of negativos) {
  const r = spawnSync(process.execPath, [path.join(__dirname, nome + '.test.js')], { env: { ...process.env, EEAR_REPO_ALVO: base }, encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || ''); process.stdout.write(out);
  const ok = r.status === 1 && (out.match(/^✗ /gm) || []).length === n && prova.test(out) && !out.includes('FALHA DE PREPARAÇÃO');
  console.log(`CONTROLE NEGATIVO ${nome} em a35ea9a: ${ok ? 'REPRODUZIU' : 'FALHOU'}`); if (!ok) falhas++;
}
const positivos = ['a35-importacao-exclusao', 'a35-contas-adversarial', 'a35-levar-reimportacao', 'exclusao-protocolo', 'exclusao-auth-atrasada', 'transferencia-identidades', 'transferencia-crashes', 'diario-geracao-antiga'];
for (const nome of positivos) {
  assert(fs.existsSync(path.join(__dirname, nome + '.test.js')));
  const r = spawnSync(process.execPath, [path.join(__dirname, nome + '.test.js')], { env: process.env, stdio: 'inherit' });
  console.log(`GATE BLOQUEADOR ${nome}: ${r.status === 0 ? 'PASSOU' : 'FALHOU'}`); if (r.status !== 0) falhas++;
}
process.exitCode = falhas ? 1 : 0;
