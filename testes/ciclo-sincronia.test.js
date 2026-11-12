/* Auditoria independente: respostas de uma sessão antiga não podem usar nem desativar a nova.
   Executa o app real no Chromium; só o transporte é controlado para reproduzir atrasos sem relógio/rede aleatórios.
   Uso: NODE_PATH=<dependências do CI> node testes/ciclo-sincronia.test.js [site já montado].
   Nenhum Firebase real. O gancho abaixo existe apenas na resposta HTTP deste teste. */
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http');
const { execFileSync } = require('child_process'), { chromium } = require('playwright');

(async () => {
  const temporario = !process.argv[2], raiz = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'eear-ciclo-'));
  if (temporario) execFileSync('python3', ['web/build.py', raiz], { cwd: path.resolve(__dirname, '..'), stdio: 'ignore' });
  const srv = http.createServer((q, r) => {
    const nome = new URL(q.url, 'http://localhost').pathname, arq = path.join(raiz, nome === '/' ? 'index.html' : nome);
    if (!arq.startsWith(raiz + path.sep) || !fs.existsSync(arq) || !fs.statSync(arq).isFile()) { r.writeHead(404); r.end(); return; }
    let texto = fs.readFileSync(arq);
    if (nome === '/app.js') texto = texto.toString().replace(/\}\)\(\);\s*$/, 'window.__audit = { usarIdentidade, sincronizar, salvar, nuvem, estado: () => S };\n})();');
    r.setHeader('Content-Type', nome.endsWith('.js') ? 'text/javascript' : nome === '/' ? 'text/html' : 'application/octet-stream'); r.end(texto);
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(); let falhas = 0;
  try {
    for (const modo of ['recusa', 'callback', 'saida']) {
      const ctx = await b.newContext({ serviceWorkers: 'block' }), p = await ctx.newPage();
      await ctx.route('**/*', r => new URL(r.request().url()).origin === `http://127.0.0.1:${srv.address().port}` ? r.continue() : r.abort());
      await p.goto(`http://127.0.0.1:${srv.address().port}/`);
      const resultado = await p.evaluate(async modo => {
        const a = window.__audit, idA = 'firebase:auditoria-A', idB = 'firebase:auditoria-B';
        let liberar, iniciou, enviadoA = null, enviadoB = null;
        const espera = new Promise(r => { liberar = r; });
        const iniciada = new Promise(r => { iniciou = r; });
        a.usarIdentidade(idA); a.estado().feito['T:A'] = true; a.salvar();
        const antiga = a.sincronizar({ transacao: async f => {
          iniciou(); // a operação antiga precisa ter entrado no transporte, inclusive com liderança assíncrona
          if (modo === 'saida') { const remoto = JSON.parse(JSON.stringify(a.estado())); remoto.feito['T:remota'] = true; enviadoA = f(remoto); }
          await espera;
          if (modo === 'recusa') { const e = new Error('recusa atrasada'); e.code = 'permission-denied'; throw e; }
          if (modo === 'callback') enviadoA = f(null);
        } }, idA);
        await iniciada;
        if (modo === 'saida') {
          window.dispatchEvent(new Event('pagehide'));
          const chave = 'missao-eear-v1@' + idA, atual = JSON.parse(localStorage.getItem(chave));
          atual.feito['T:nova-abertura'] = true; localStorage.setItem(chave, JSON.stringify(atual));
          liberar(); await antiga;
          return { preservou: JSON.parse(localStorage.getItem(chave)).feito['T:nova-abertura'] === true };
        }
        a.usarIdentidade(idB); a.estado().feito['T:B'] = true; a.salvar();
        await a.sincronizar({ transacao: async f => { enviadoB = f(null); } }, idB);
        liberar(); await antiga;
        // O reenvio de B é iniciado quando a operação antiga termina.
        await Promise.resolve(); await Promise.resolve();
        return { erro: a.nuvem.erro, ativa: !!a.nuvem.ref, enviadoA, enviadoB };
      }, modo);
      const passou = modo === 'saida' ? resultado.preservou : !resultado.erro && resultado.ativa &&
        resultado.enviadoB && resultado.enviadoB.feito['T:B'] && !resultado.enviadoB.feito['T:A'] && !resultado.enviadoA;
      const resumo = modo === 'saida' ? resultado : { erro: resultado.erro, ativa: resultado.ativa,
        enviadoA: resultado.enviadoA && resultado.enviadoA.feito, enviadoB: resultado.enviadoB && resultado.enviadoB.feito };
      console.log(`${passou ? '✓' : '✗'} ${modo}: ${JSON.stringify(resumo)}`);
      if (!passou) falhas++;
      await ctx.close();
    }
  } finally { await b.close(); await new Promise(r => srv.close(r)); if (temporario) fs.rmSync(raiz, { recursive: true, force: true }); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
