/* Roda todos os testes contra uma versão do projeto e mostra o resumo.
   Uso: node testes/rodar.js [pasta_do_projeto] [--rapido]
   --rapido: só 2 larguras de tela (390 e 1280) no teste de navegador. */
const path = require('path');
const { RAIZ } = require('./lib/base');
const { testarDados } = require('./dados.test');
const { testarMontagem } = require('./montagem.test');
const { testarNavegador } = require('./navegador.test');
const { testarProgresso } = require('./progresso.test');
const { testarApk } = require('./apk.test');

(async () => {
  const args = process.argv.slice(2), rapido = args.includes('--rapido');
  const fonte = path.resolve(args.find(a => !a.startsWith('--')) || RAIZ);
  console.log('Testando', fonte);
  const rs = [];
  for (const [nome, fn] of [
    ['dados', () => testarDados(fonte)],
    ['montagem', () => testarMontagem(fonte)],
    ['navegador', () => testarNavegador(fonte, rapido ? { larguras: [390, 1280] } : {})],
    ['progresso', () => testarProgresso(fonte)],
    ['apk', () => testarApk(fonte)]
  ]) {
    try { const r = await fn(); r.imprimir(); rs.push([nome, r.falhas()]); }
    catch (e) { console.log(`\n== ${nome}\n  ✗ não rodou: ${String(e.message).split('\n')[0]}`); rs.push([nome, 1]); }
  }
  console.log('\nResumo: ' + rs.map(([n, f]) => `${n} ${f ? '✗ ' + f : '✓'}`).join(' · '));
  process.exit(rs.some(([, f]) => f) ? 1 : 0);
})();
