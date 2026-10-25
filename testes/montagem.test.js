/* Montagem do site e do conteúdo do app: o que vai para o ar, modo offline e páginas legais.
   Uso: node testes/montagem.test.js [pasta_do_projeto] */
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const { RAIZ, relatorio, montar, publicavel, marcasRestritas, comMarcas } = require('./lib/base');

function arquivos(pasta) {
  const out = [];
  (function ler(d) { fs.readdirSync(d, { withFileTypes: true }).forEach(e => e.isDirectory() ? ler(path.join(d, e.name)) : out.push(path.relative(pasta, path.join(d, e.name)))); })(pasta);
  return out;
}

function testarMontagem(fonte = RAIZ) {
  const r = relatorio('Montagem do site e do app');
  const site = montar(fonte), app = montar(fonte, { app: true });
  r.nota(site.saida); r.nota(app.saida);
  const lista = arquivos(site.destino);

  // JavaScript sem erro de sintaxe
  const js = lista.filter(f => f.endsWith('.js'));
  const erros = js.filter(f => { try { execFileSync('node', ['--check', path.join(site.destino, f)], { stdio: 'pipe' }); return false; } catch (e) { return true; } });
  r.igual(erros, [], `${js.length} arquivos JavaScript sem erro de sintaxe`);

  // página: todos os scripts e estilos citados existem
  const html = fs.readFileSync(path.join(site.destino, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="(?!https?:|#|mailto:)([^"]+)"/g)].map(m => m[1].split('?')[0]);
  r.igual(refs.filter(f => !fs.existsSync(path.join(site.destino, f))), [], `${refs.length} arquivos citados na página existem`);
  r.ok(/window\.EEAR_SITE = "site"/.test(html), 'site marcado como "site"');
  r.ok(/serviceWorker/.test(html), 'site registra o modo offline');

  // manifesto e ícones
  const man = JSON.parse(fs.readFileSync(path.join(site.destino, 'manifest.webmanifest'), 'utf8'));
  r.ok(man.name && man.start_url === './' && man.display === 'standalone', `manifesto do app instalável ("${man.name}")`);
  r.igual(man.icons.map(i => i.src).filter(s => !fs.existsSync(path.join(site.destino, s))), [], 'ícones do manifesto existem');

  // modo offline: lista do service worker só com arquivos que existem
  const sw = fs.readFileSync(path.join(site.destino, 'sw.js'), 'utf8');
  const pre = JSON.parse(sw.match(/const ARQUIVOS = (\[.*?\]);/s)[1]);
  r.igual(pre.filter(f => f !== './' && !fs.existsSync(path.join(site.destino, f))), [], `modo offline guarda ${pre.length} arquivos, todos existentes`);
  r.ok(!/__VERSAO/.test(sw), 'versão do modo offline preenchida');

  // material de terceiros fora do site público
  r.ok(!fs.existsSync(path.join(site.destino, 'dados', 'apostila.js')), 'site público sem apostila.js (índice e gabaritos das apostilas)');
  r.ok(!lista.some(f => f.startsWith('ap/')), 'site público sem páginas das apostilas');
  const marcas = marcasRestritas(fonte);
  for (const [nome, pasta, arqs] of [['site', site.destino, lista], ['app', app.destino, arquivos(app.destino)]]) {
    r.igual(arqs.filter(f => !publicavel(f)), [], `${nome}: só arquivos da lista do que pode ser publicado`);
    const textos = {};
    arqs.filter(f => /\.(html|js|css|json|webmanifest|txt)$/.test(f)).forEach(f => { textos[f] = fs.readFileSync(path.join(pasta, f), 'utf8'); });
    r.igual(comMarcas(textos, marcas), [], `${nome}: nenhum arquivo publicado com dados das apostilas (${marcas.length} marcas procuradas)`);
    const carregados = [...fs.readFileSync(path.join(pasta, 'index.html'), 'utf8').matchAll(/src="(dados\/[^"]+)"/g)].map(m => m[1]).sort();
    r.igual(arqs.filter(f => f.startsWith('dados/')).sort(), carregados, `${nome}: os dados publicados são só os que a página carrega`);
  }

  // páginas legais
  ['privacidade.html', 'termos.html'].forEach(f => r.ok(fs.existsSync(path.join(site.destino, f)) && /suporteinphax@gmail\.com/.test(fs.readFileSync(path.join(site.destino, f), 'utf8')), `${f} publicada, com o contato`));

  // conteúdo do app (Android)
  const htmlApp = fs.readFileSync(path.join(app.destino, 'index.html'), 'utf8');
  r.ok(/window\.EEAR_SITE = "app"/.test(htmlApp), 'conteúdo do app marcado como "app"');
  r.ok(!/serviceWorker\.register/.test(htmlApp) && !fs.existsSync(path.join(app.destino, 'sw.js')), 'app sem service worker (o Android já guarda os arquivos)');
  return r;
}

if (require.main === module) {
  const r = testarMontagem(path.resolve(process.argv[2] || RAIZ));
  r.imprimir(); process.exit(r.falhas() ? 1 : 0);
}
module.exports = { testarMontagem, arquivos };
