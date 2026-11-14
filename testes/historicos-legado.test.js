/* Critérios históricos intactos. NÃO é um gate de sincronização Firebase.
   A falha/saída não zero é preservada: o transporte inseguro está desativado.
   Sem argumentos executa a matriz antiga; argumentos selecionam grupos originais, p.ex. epoca. */
const path = require('path'), { spawnSync } = require('child_process');
const grupos = process.argv.slice(2);
const env = { ...process.env, EEAR_HISTORICO_LEGADO: '1' };
if (grupos.length) env.EEAR_GRUPOS = grupos.join(',');
console.log('HISTÓRICO LEGADO — não confundir incompatibilidade conhecida com aprovação Firebase.');
const r = spawnSync(process.execPath, [path.join(__dirname, 'plataforma.test.js')], { env, stdio: 'inherit' });
if (r.error) console.error(r.error);
process.exitCode = r.status === null ? 1 : r.status;
