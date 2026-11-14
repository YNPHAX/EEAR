/* Infraestrutura independente de F01: app real de EEAR_REPO_ALVO, SDK npm e somente emuladores em loopback.
   Não importa testes nem relatório do autor da correção. Nunca lê configuração Firebase local do alvo. */
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http');
const { execFileSync } = require('child_process');
const PROJ = 'demo-eear-f01', AU = 'http://127.0.0.1:9199';
const DOCS = `http://127.0.0.1:8180/v1/projects/${PROJ}/databases/(default)/documents`;
const req = async (url, op = {}) => { const r = await fetch(url, op); return { status: r.status, json: await r.json().catch(() => null) }; };
const ate = async (f, ms = 20000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await f()) return true; await new Promise(r => setTimeout(r, 150)); } return false; };
const auth = { 'content-type': 'application/json', Authorization: 'Bearer owner' };
const ler = async uid => { const r = await req(`${DOCS}/alunos/${uid}`, { headers: auth }); return r.status === 200 ? JSON.parse(r.json.fields.dados.stringValue) : null; };

function emular(alvo, entrada) {
  if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8180' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9199') throw new Error('A sonda exige seus próprios emuladores locais, portas 8180/9199.');
    return false;
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-f01-emu-'));
  fs.copyFileSync(path.join(alvo, 'web/firestore.rules'), path.join(dir, 'firestore.rules'));
  fs.writeFileSync(path.join(dir, 'firebase.json'), JSON.stringify({ firestore: { rules: 'firestore.rules' }, emulators: {
    auth: { host: '127.0.0.1', port: 9199 }, firestore: { host: '127.0.0.1', port: 8180 }, ui: { enabled: false }, singleProjectMode: true
  } }));
  try { execFileSync(process.env.EEAR_FIREBASE_CLI || 'firebase', ['emulators:exec', '--config', path.join(dir, 'firebase.json'), '--project', PROJ, '--only', 'auth,firestore', `node "${entrada}"`], { cwd: dir, stdio: 'inherit' }); }
  catch (e) { process.exitCode = 1; }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
  return true;
}

async function abrir(alvo) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-f01-site-')), saida = path.join(dir, 'site');
  const cfg = path.join(dir, 'sem-firebase.json'); fs.writeFileSync(cfg, 'null');
  execFileSync('python3', ['web/build.py', saida], { cwd: alvo, stdio: 'ignore', env: Object.assign({}, process.env, { EEAR_FIREBASE_CONFIG: cfg }) });
  const bundle = fs.readFileSync(path.join(alvo, 'curso/app.js'));
  if (!bundle.equals(fs.readFileSync(path.join(saida, 'app.js')))) throw new Error('O build não serviu exatamente o bundle publicado.');
  console.log('Runtime publicado SHA256: ' + require('crypto').createHash('sha256').update(bundle).digest('hex'));
  const ix = path.join(saida, 'index.html'), original = fs.readFileSync(ix, 'utf8');
  if (original.includes('window.EEAR_FIREBASE') || !original.includes('window.EEAR_SITE = "site";')) throw new Error('Build da fixture não está isolado.');
  fs.writeFileSync(ix, original.replace('window.EEAR_SITE = "site";', `window.EEAR_SITE = "site"; window.EEAR_FIREBASE = ${JSON.stringify({
    apiKey: 'demo', authDomain: PROJ + '.firebaseapp.com', projectId: PROJ, appId: 'demo', sincronizar: true, homologacao: true,
    emuladores: { auth: AU, firestore: ['127.0.0.1', 8180] }
  })};`));
  const srv = http.createServer((q, r) => {
    const nome = new URL(q.url, 'http://localhost').pathname, arq = path.join(saida, nome === '/' ? 'index.html' : nome);
    if (!arq.startsWith(saida + path.sep) || !fs.existsSync(arq) || !fs.statSync(arq).isFile()) { r.writeHead(404); r.end(); return; }
    const tipos = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml' };
    r.setHeader('Content-Type', tipos[path.extname(arq)] || 'application/octet-stream'); r.end(fs.readFileSync(arq));
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const { chromium } = require('playwright'), b = await chromium.launch();
  const url = `http://127.0.0.1:${srv.address().port}/`, sdk = process.env.EEAR_FIREBASE_SDK;
  if (!sdk || !fs.existsSync(path.join(sdk, 'firebase-firestore.js'))) throw new Error('Defina EEAR_FIREBASE_SDK (pacote firebase 12.19.0).');
  const redes = new WeakMap();
  async function contexto() {
    const ctx = await b.newContext({ serviceWorkers: 'block' });
    redes.set(ctx, { offline: false });
    await ctx.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Usar exportação visível da fixture'); } }, configurable: true }));
    await ctx.route('**/*', r => {
      const u = new URL(r.request().url());
      if (u.origin === 'https://www.gstatic.com' && u.pathname.startsWith('/firebasejs/12.19.0/')) return r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(sdk, path.basename(u.pathname))) });
      if (u.hostname === '127.0.0.1' && ['8180', '9199'].includes(u.port) && redes.get(ctx).offline) return r.abort('internetdisconnected');
      if (u.hostname === '127.0.0.1' && [String(srv.address().port), '8180', '9199'].includes(u.port)) return r.continue();
      return r.abort(); // proíbe todo serviço real, inclusive um Firebase acidentalmente configurado no alvo
    });
    return ctx;
  }
  const pagina = async ctx => { const p = await ctx.newPage(); await p.goto(url); return p; };
  const clicar = async (p, a, d = {}) => { await p.waitForFunction(() => document.documentElement.dataset.armazenamento !== 'carregando'); return p.evaluate(([a, d]) => { const b = document.createElement('button'); b.dataset.a = a; Object.assign(b.dataset, d); document.body.appendChild(b); b.click(); b.remove(); }, [a, d]); };
  const plano = p => clicar(p, 'tab', { v: 'plano' });
  const estado = async p => { await plano(p); await clicar(p, 'expcopiar'); await p.waitForSelector('#exp-txt'); return JSON.parse(await p.locator('#exp-txt').inputValue()); };
  const importar = async (p, s) => { await plano(p); await clicar(p, 'impabrir'); await p.fill('#imp-txt', JSON.stringify(s)); await clicar(p, 'impok'); };
  const entrar = async (p, email) => {
    await plano(p); await p.waitForSelector('#fb-email');
    // A preparação usa a API pública do SDK para não competir com renderizações do formulário/getRedirectResult.
    // Login pela UI já é coberto por firebase-emulador.test.js; nenhuma função interna do app é exposta aqui.
    await p.evaluate(async email => {
      const app = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js');
      const au = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js');
      await au.signInWithEmailAndPassword(au.getAuth(app.getApp()), email, 'auditoria-f01-123');
    }, email);
    await p.waitForSelector('[data-a="contasair"]');
  };
  async function conta(nome, seed) {
    const email = `f01-${nome}@exemplo.test`;
    const r = await req(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, { method: 'POST', headers: auth, body: JSON.stringify({ email, password: 'auditoria-f01-123', returnSecureToken: true }) });
    if (r.status !== 200) throw new Error('Falha na conta fictícia: ' + r.status);
    const uid = r.json.localId;
    await req(`${DOCS}/alunos/${uid}`, { method: 'PATCH', headers: auth, body: JSON.stringify({ fields: {
      v: { integerValue: '1' }, dados: { stringValue: JSON.stringify(seed) }, t: { integerValue: String(seed.t) }
    } }) });
    return { uid, email };
  }
  return { contexto, pagina, clicar, estado, importar, entrar, conta, ate, ler, rede: (ctx, offline) => { redes.get(ctx).offline = offline; },
    fechar: async () => { await b.close(); await new Promise(r => srv.close(r)); fs.rmSync(dir, { recursive: true, force: true }); } };
}
module.exports = { emular, abrir, ate };
