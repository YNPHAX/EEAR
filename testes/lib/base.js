/* Utilidades dos testes: registro de resultados, montagem do site e servidor local.
   Nada aqui grava dentro do repositório: tudo é montado em pastas temporárias. */
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'), vm = require('vm');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..', '..');

/* Registro simples: cada verificação vira uma linha do relatório. */
function relatorio(nome) {
  const linhas = [];
  const r = {
    nome,
    ok(cond, msg) { linhas.push({ ok: !!cond, msg }); return !!cond; },
    igual(a, b, msg) { const ok = JSON.stringify(a) === JSON.stringify(b); linhas.push({ ok, msg: ok ? msg : `${msg} (esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)})` }); return ok; },
    nota(msg) { linhas.push({ ok: null, msg }); },
    async etapa(titulo, fn) {
      try { await fn(); } catch (e) { linhas.push({ ok: false, msg: `${titulo}: falhou (${String(e.message || e).split('\n')[0]})` }); }
    },
    falhas: () => linhas.filter(l => l.ok === false).length,
    imprimir() {
      console.log(`\n== ${nome}`);
      linhas.forEach(l => console.log(`${l.ok === null ? '  ·' : l.ok ? '  ✓' : '  ✗'} ${l.msg}`));
      const f = r.falhas();
      console.log(f ? `  ${f} falha(s)` : '  tudo certo');
    }
  };
  return r;
}

function pastaTemp(prefixo) { return fs.mkdtempSync(path.join(os.tmpdir(), prefixo)); }

/* Monta o site (ou o conteúdo do app, com app = true) a partir de uma cópia do projeto. */
function montar(fonte, { app = false } = {}) {
  const destino = pastaTemp(app ? 'inphax-app-' : 'inphax-site-');
  const saida = execFileSync('python3', ['web/build.py', destino].concat(app ? ['--app'] : []), { cwd: fonte, encoding: 'utf8' });
  return { destino, saida: saida.trim() };
}

/* Carrega os dados do curso (os mesmos arquivos que a página carrega) fora do navegador. */
function carregarDados(fonte) {
  const html = fs.readFileSync(path.join(fonte, 'curso', 'index.html'), 'utf8');
  const arquivos = [...html.matchAll(/src="dados\/([^"]+)"/g)].map(m => m[1]);
  const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
  arquivos.forEach(f => vm.runInContext(fs.readFileSync(path.join(fonte, 'curso', 'dados', f), 'utf8'), ctx, { filename: f }));
  return { EEAR: ctx.EEAR, arquivos };
}

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain' };

/* Servidor estático que imita o GitHub Pages: o site fica em /EEAR/. */
function servir(pasta, prefixo = '/EEAR/') {
  return new Promise(ok => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (!p.startsWith(prefixo)) { res.writeHead(404); return res.end(); }
      p = path.join(pasta, p.slice(prefixo.length));
      if (!p.startsWith(pasta)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
      if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${srv.address().port}${prefixo}`, fechar: () => srv.close() }));
  });
}

module.exports = { RAIZ, relatorio, pastaTemp, montar, carregarDados, servir };
