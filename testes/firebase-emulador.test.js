/* Testes com os emuladores oficiais do Firebase (Auth e Firestore): nenhum serviço real, projeto "demo-eear".
   Confere login, saída e troca de conta, isolamento entre contas, gravações simultâneas com transação, documento de
   versão futura, exclusão de conta e as regras de web/firestore.rules.
   Uso (na raiz; requer Java, o firebase-tools e o SDK web do Firebase 12.19.0, instalados fora do repositório):
     EEAR_FIREBASE_SDK=<pasta node_modules/firebase> EEAR_FIREBASE_CLI=<caminho do firebase> node testes/firebase-emulador.test.js
   O teste sobe os emuladores (firebase emulators:exec) numa pasta temporária com uma cópia de web/firestore.rules e roda
   de novo dentro deles. O app carrega o SDK de www.gstatic.com; aqui essas requisições são servidas pelo pacote npm. */
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http');
const { execFileSync } = require('child_process');
const RAIZ = path.resolve(__dirname, '..'), SDK = process.env.EEAR_FIREBASE_SDK, PROJ = 'demo-eear';
const FS = 'http://127.0.0.1:8080', AU = 'http://127.0.0.1:9099', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
let falhas = 0;
const ok = (c, m) => { console.log(`${c ? '  ✓' : '  ✗'} ${m}`); if (!c) falhas++; };
const espera = ms => new Promise(r => setTimeout(r, ms));
const ate = async (f, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await f()) return true; await espera(200); } return false; };

/* REST dos emuladores */
const req = async (url, op = {}) => { const r = await fetch(url, op); const t = await r.text(); return { st: r.status, j: t ? JSON.parse(t) : null }; };
const limpar = async () => { await fetch(`${FS}/emulator/v1/projects/${PROJ}/databases/(default)/documents`, { method: 'DELETE' }); await fetch(`${AU}/emulator/v1/projects/${PROJ}/accounts`, { method: 'DELETE' }); };
const entrar = async (email, senha) => (await req(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: senha, returnSecureToken: true }) })).j;
const docAdmin = async uid => { const r = await req(`${DOCS}/alunos/${uid}`, { headers: { Authorization: 'Bearer owner' } }); return r.st === 200 ? r.j.fields : null; };
const progresso = async uid => { const f = await docAdmin(uid); return f && f.dados ? JSON.parse(f.dados.stringValue) : null; };
const gravarComo = (token, uid, campos) => req(`${DOCS}:commit`, { method: 'POST', headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + token },
  body: JSON.stringify({ writes: [{ update: { name: `projects/${PROJ}/databases/(default)/documents/alunos/${uid}`, fields: campos }, updateTransforms: [{ fieldPath: 'atualizado', setToServerValue: 'REQUEST_TIME' }] }] }) });
const campos = (v, dados, extra) => Object.assign({ v: { integerValue: String(v) }, dados: { stringValue: JSON.stringify(dados) }, t: { integerValue: String(Date.now()) } }, extra || {});

function servir(raiz) {
  const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
  const srv = http.createServer((q, r) => { let f = path.join(raiz, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith(path.sep)) f = path.join(f, 'index.html'); if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  return new Promise(res => srv.listen(0, '127.0.0.1', () => res({ url: `http://127.0.0.1:${srv.address().port}/`, fechar: () => srv.close() })));
}
/* Site montado com uma configuração de teste do Firebase (emuladores, sincronização liberada). semTransacao: variante
   só para comparação, sem runTransaction. Desde o PR #22, sem transação o app usa a gravação de reserva (sem trava e
   sem base, que não apaga nada por ausência); até o PR #21, lia e gravava em seguida e perdia de 5 a 6 de 12. */
function montar(semTransacao) {
  const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-fb-'));
  execFileSync('python3', ['web/build.py', saida], { cwd: RAIZ, stdio: 'ignore' });
  const cfg = { apiKey: 'demo', authDomain: `${PROJ}.firebaseapp.com`, projectId: PROJ, appId: 'demo', sincronizar: true, emuladores: { auth: AU, firestore: ['127.0.0.1', 8080] } };
  const ix = path.join(saida, 'index.html'); let h = fs.readFileSync(ix, 'utf8');
  if (!h.includes('window.EEAR_SITE = "site";')) throw new Error('marcador do site não encontrado');
  fs.writeFileSync(ix, h.replace('window.EEAR_SITE = "site";', `window.EEAR_SITE = "site"; window.EEAR_FIREBASE = ${JSON.stringify(cfg)};`));
  if (semTransacao) { const a = path.join(saida, 'app.js'), s = fs.readFileSync(a, 'utf8'), m = '      transacao: f =>'; if (!s.includes(m)) throw new Error('transacao não encontrada'); fs.writeFileSync(a, s.replace(m, '      _semTransacao: f =>')); }
  return saida;
}

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  /* Fora dos emuladores: prepara a pasta do projeto de teste e roda este arquivo dentro de "emulators:exec". */
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-emu-'));
  fs.copyFileSync(path.join(RAIZ, 'web', 'firestore.rules'), path.join(dir, 'firestore.rules'));
  fs.writeFileSync(path.join(dir, 'firebase.json'), JSON.stringify({ firestore: { rules: 'firestore.rules' }, emulators: { auth: { host: '127.0.0.1', port: 9099 }, firestore: { host: '127.0.0.1', port: 8080 }, ui: { enabled: false }, singleProjectMode: true } }));
  const cli = process.env.EEAR_FIREBASE_CLI || 'firebase';
  try { execFileSync(cli, ['emulators:exec', '--config', path.join(dir, 'firebase.json'), '--project', PROJ, '--only', 'auth,firestore', `node "${path.join(RAIZ, 'testes', 'firebase-emulador.test.js')}"`], { cwd: dir, stdio: 'inherit' }); process.exitCode = 0; } // cwd temporário: os logs do emulador ficam fora do repositório
  catch (e) { process.exitCode = 1; }
  fs.rmSync(dir, { recursive: true, force: true });
} else (async () => {
  if (!SDK || !fs.existsSync(path.join(SDK, 'firebase-firestore.js'))) { console.error('Defina EEAR_FIREBASE_SDK com a pasta node_modules/firebase (12.19.0).'); process.exit(2); }
  const { chromium } = require('playwright'); const b = await chromium.launch();
  const saida = montar(false), srv = await servir(saida);
  async function aparelho(url) {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 900 } }), erros = [];
    await ctx.route('https://www.gstatic.com/firebasejs/12.19.0/**', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(SDK, path.basename(new URL(r.request().url()).pathname))) }));
    const p = await ctx.newPage(); p.on('pageerror', e => erros.push(e.message));
    const clicar = (a, d) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d || {}); document.body.appendChild(x); x.click(); x.remove(); }, [a, d]);
    const ler = k => p.evaluate(k => JSON.parse(localStorage.getItem(k)), k);
    const plano = async () => { await clicar('tab', { v: 'plano' }); await p.waitForTimeout(150); };
    const conectar = async (email, senha, criar) => { await plano(); await p.waitForSelector('#fb-email', { timeout: 15000 }); await p.fill('#fb-email', email); await p.fill('#fb-senha', senha); await clicar(criar ? 'fbcriar' : 'fbentrar'); await p.waitForSelector('[data-a="contasair"]', { timeout: 15000 }); await p.waitForTimeout(800); };
    const uid = () => p.evaluate(() => (localStorage.getItem('missao-eear-conta') || '').replace('firebase:', ''));
    await p.goto(url || srv.url); await p.waitForTimeout(300);
    return { ctx, p, erros, clicar, ler, plano, conectar, uid };
  }
  const hj = new Date().toISOString().slice(0, 10);
  const marcar = (d, k) => d.clicar('marcar', { k });

  console.log('\n== contas, isolamento e documento mínimo');
  await limpar();
  const A = await aparelho();
  const anon = { v: 1, t: Date.now() - 9000, cfg: { nome: 'Sem Conta' }, mod: { POR01: { lido: hj, best: 0.9, tent: 1, ok: hj } }, fc: {}, sims: [] };
  await A.p.evaluate(s => localStorage.setItem('missao-eear-v1', JSON.stringify(s)), anon); await A.p.reload(); await A.p.waitForTimeout(300);
  await A.conectar('ana@exemplo.test', 'senha-ana-1', true); const uidA = await A.uid();
  await marcar(A, 'T:ana1'); await ate(async () => { const x = await progresso(uidA); return x && x.feito && x.feito['T:ana1']; });
  const docA = await docAdmin(uidA);
  ok(!!docA && Object.keys(docA).sort().join() === 'atualizado,dados,t,v' && !JSON.stringify(docA).includes('ana@exemplo.test') && !(await progresso(uidA)).mod.POR01, 'conta nova: o documento só tem v, dados, t e atualizado (sem e-mail), e o progresso sem conta não foi levado sozinho');
  ok(JSON.stringify(await A.ler('missao-eear-v1')) === JSON.stringify(anon) && (await A.p.locator('[data-a="contalevar"]').count()) > 0, 'o progresso sem conta continua intacto e o aluno pode levá-lo para a conta');

  // importação voluntária: só quando o aluno pede; o progresso sem conta continua guardado
  await A.plano(); await A.clicar('contalevar'); await ate(async () => { const x = await progresso(uidA); return x && x.mod.POR01; });
  ok(!!(await progresso(uidA)).mod.POR01 && JSON.stringify(await A.ler('missao-eear-v1')) === JSON.stringify(anon) && !(await A.p.locator('[data-a="contalevar"]').count()), 'levar para a conta (pedido pelo aluno): o progresso sem conta vai para a nuvem da conta e continua guardado sem conta');
  // sair mantendo; outra pessoa entra no mesmo aparelho
  await A.plano(); await A.clicar('contasair'); await A.p.waitForTimeout(100); await A.clicar('contasairmanter'); await A.p.waitForSelector('#fb-email', { timeout: 15000 });
  const cacheA = await A.ler('missao-eear-v1@firebase:' + uidA);
  ok(!!cacheA && cacheA.feito['T:ana1'] && /Sem/.test(await A.p.locator('main').innerText()), 'sair mantendo: a tela volta ao progresso sem conta e a cópia da conta fica guardada à parte');
  await A.conectar('bia@exemplo.test', 'senha-bia-1', true); const uidB = await A.uid();
  await marcar(A, 'T:bia1'); await ate(async () => { const x = await progresso(uidB); return x && x.feito && x.feito['T:bia1']; });
  const pB = await progresso(uidB), localB = await A.ler('missao-eear-v1@firebase:' + uidB);
  ok(!pB.feito['T:ana1'] && !pB.mod.POR01 && !localB.mod.POR01 && !localB.feito['T:ana1'] && !(await progresso(uidA)).feito['T:bia1'], 'conta B no mesmo aparelho: nada da conta A nem do progresso sem conta vai para B, e nada de B vai para A');

  // sessão reaproveitada: estudo pendente da conta B no momento da troca
  await marcar(A, 'T:bia-pendente'); await A.plano(); await A.clicar('contasair'); await A.p.waitForTimeout(50); await A.clicar('contasairmanter'); await A.p.waitForSelector('#fb-email', { timeout: 15000 });
  await A.conectar('ana@exemplo.test', 'senha-ana-1', false); await espera(3000);
  const pA2 = await progresso(uidA), cacheB2 = await A.ler('missao-eear-v1@firebase:' + uidB);
  ok(!pA2.feito['T:bia-pendente'] && !pA2.feito['T:bia1'] && cacheB2.feito['T:bia-pendente'] === true, 'troca de conta com gravação pendente: o estudo de B não vai para A e continua na cópia de B neste aparelho');

  // sair apagando: bloqueado sem rede; com tudo salvo, apaga só a cópia local
  await A.ctx.setOffline(true); await marcar(A, 'T:offline'); await A.plano(); await A.clicar('contasair'); await A.p.waitForTimeout(100);
  const semApagar = (await A.p.locator('[data-a="contasairapagar"]').count()) === 0;
  await A.clicar('cancelar'); await A.ctx.setOffline(false); await ate(async () => { const x = await progresso(uidA); return x && x.feito && x.feito['T:offline']; }, 30000);
  await A.plano(); await A.clicar('contasair'); await A.p.waitForTimeout(100);
  const podeApagar = (await A.p.locator('[data-a="contasairapagar"]').count()) === 1;
  await A.clicar('contasairapagar'); await A.p.waitForSelector('#fb-email', { timeout: 15000 });
  ok(semApagar && podeApagar && (await A.ler('missao-eear-v1@firebase:' + uidA)) === null && (await progresso(uidA)).feito['T:offline'] === true, 'sair apagando: bloqueado enquanto há estudo fora da nuvem; depois, apaga só a cópia deste aparelho e a nuvem continua com tudo');
  ok(!A.erros.length, 'sem erro de JavaScript nos fluxos de conta' + (A.erros.length ? ': ' + A.erros[0] : ''));
  await A.ctx.close();

  console.log('\n== gravações simultâneas na mesma conta (dois aparelhos)');
  async function concorrencia(url, rotulo) {
    const D1 = await aparelho(url), D2 = await aparelho(url), email = `par-${rotulo}@exemplo.test`;
    await D1.conectar(email, 'senha-par-1', true); await D2.conectar(email, 'senha-par-1', false);
    const uid = await D1.uid(), chaves = [];
    for (let i = 0; i < 6; i++) { chaves.push(`T:d1-${i}`, `T:d2-${i}`); await Promise.all([marcar(D1, `T:d1-${i}`), marcar(D2, `T:d2-${i}`)]); await espera(2400); }
    await ate(async () => { const x = await progresso(uid); return x && chaves.every(k => x.feito[k]); }, 20000);
    const x = await progresso(uid), faltam = chaves.filter(k => !(x && x.feito[k]));
    await D1.ctx.close(); await D2.ctx.close();
    return faltam;
  }
  const faltam = await concorrencia(srv.url, 'tx');
  ok(!faltam.length, `com transação: 12 marcações feitas ao mesmo tempo em dois aparelhos, nenhuma perdida na nuvem${faltam.length ? ' — faltam ' + faltam.join(', ') : ''}`);
  const saida0 = montar(true), srv0 = await servir(saida0);
  const faltam0 = await concorrencia(srv0.url, 'sem');
  console.log(`  (comparação, sem transação, com a gravação de reserva: ${faltam0.length} de 12 marcações perdidas${faltam0.length ? ' — ' + faltam0.join(', ') : ''})`);
  srv0.fechar(); fs.rmSync(saida0, { recursive: true, force: true });

  console.log('\n== versão futura, regras e exclusão de conta');
  { const C = await aparelho(); await C.conectar('caio@exemplo.test', 'senha-caio-1', true); const uidC = await C.uid(); await marcar(C, 'T:caio1');
    await ate(async () => { const x = await progresso(uidC); return x && x.feito['T:caio1']; });
    await req(`${DOCS}/alunos/${uidC}`, { method: 'PATCH', headers: { 'content-type': 'application/json', Authorization: 'Bearer owner' }, body: JSON.stringify({ fields: { v: { integerValue: '2' }, dados: { stringValue: '{"formato":"novo"}' }, t: { integerValue: '1' } } }) });
    await marcar(C, 'T:caio2'); await espera(3500);
    const f = await docAdmin(uidC); await C.plano();
    const futuraOk = f.v.integerValue === '2' && f.dados.stringValue === '{"formato":"novo"}' && /versão mais nova/.test(await C.p.locator('#sync').innerText()) && (await C.ler('missao-eear-v1@firebase:' + uidC)).feito['T:caio2'];
    ok(futuraOk, 'documento de uma versão futura: o app não grava por cima, avisa o aluno e o estudo fica no aparelho');
    // documento corrompido (dados ilegíveis): nada é gravado por cima e o app continua funcionando com o progresso local
    await req(`${DOCS}/alunos/${uidC}`, { method: 'PATCH', headers: { 'content-type': 'application/json', Authorization: 'Bearer owner' }, body: JSON.stringify({ fields: { v: { integerValue: '1' }, dados: { stringValue: '{{{ não é JSON' }, t: { integerValue: '1' } } }) });
    await C.p.reload(); await C.p.waitForTimeout(2500); await marcar(C, 'T:caio3'); await espera(3000);
    const g = await docAdmin(uidC);
    ok(g.dados.stringValue === '{{{ não é JSON' && (await C.ler('missao-eear-v1@firebase:' + uidC)).feito['T:caio3'] === true && !C.erros.length, 'documento corrompido na nuvem: o app não grava por cima, não trava e guarda o estudo no aparelho');
    await C.ctx.close(); }

  { const ana = await entrar('ana@exemplo.test', 'senha-ana-1'), bia = await entrar('bia@exemplo.test', 'senha-bia-1');
    const lerB = await req(`${DOCS}/alunos/${ana.localId}`, { headers: { Authorization: 'Bearer ' + bia.idToken } });
    const gravaB = await gravarComo(bia.idToken, ana.localId, campos(1, { v: 1 }));
    const extra = await gravarComo(ana.idToken, ana.localId, campos(1, { v: 1 }, { email: { stringValue: 'ana@exemplo.test' } }));
    const valido = await gravarComo(ana.idToken, ana.localId, campos(1, await progresso(ana.localId)));
    await req(`${DOCS}/alunos/${ana.localId}`, { method: 'PATCH', headers: { 'content-type': 'application/json', Authorization: 'Bearer owner' }, body: JSON.stringify({ fields: campos(3, { v: 3 }) }) });
    const rebaixa = await gravarComo(ana.idToken, ana.localId, campos(1, { v: 1 }));
    const apagaB = await req(`${DOCS}/alunos/${ana.localId}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + bia.idToken } });
    ok(lerB.st === 403 && gravaB.st === 403 && apagaB.st === 403, 'regras: uma conta não lê, não grava e não apaga o documento de outra');
    ok(extra.st === 403 && valido.st === 200, 'regras: campo a mais (e-mail) é recusado; o documento mínimo é aceito');
    ok(rebaixa.st === 403, 'regras: um app antigo (v 1) não grava por cima de um documento de versão mais nova (v 3)');
    const apagaA = await req(`${DOCS}/alunos/${ana.localId}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + ana.idToken } });
    ok(apagaA.st === 200 && !(await docAdmin(ana.localId)), 'regras: o próprio aluno pode apagar o documento dele'); }

  let E = null;
  try { E = await aparelho(); const anon2 = { v: 1, t: Date.now(), cfg: { nome: 'Sem Conta' }, mod: { MAT01: { lido: hj } }, fc: {}, sims: [] };
    await E.p.evaluate(s => localStorage.setItem('missao-eear-v1', JSON.stringify(s)), anon2); await E.p.reload(); await E.p.waitForTimeout(300);
    await E.conectar('davi@exemplo.test', 'senha-davi-1', true); const uidD = await E.uid(); await marcar(E, 'T:davi1');
    await ate(async () => { const x = await progresso(uidD); return x && x.feito['T:davi1']; });
    await E.plano(); await E.clicar('contaexcluir'); await E.p.waitForTimeout(100);
    await E.p.fill('#conta-senha', 'senha-errada'); await E.p.fill('#conta-confirma', 'EXCLUIR'); await E.clicar('contaexcluirok'); await E.p.waitForTimeout(2500);
    const naoExcluiu = !!(await docAdmin(uidD)) && /Nada foi excluído/.test(await E.p.locator('main').innerText());
    await E.p.fill('#conta-senha', 'senha-davi-1'); await E.p.fill('#conta-confirma', 'excluir'); await E.clicar('contaexcluirok'); await E.p.waitForTimeout(500);
    const naoConfirmou = !!(await docAdmin(uidD)) && /Digite EXCLUIR/.test(await E.p.locator('main').innerText());
    await E.p.fill('#conta-senha', 'senha-davi-1'); await E.p.fill('#conta-confirma', 'EXCLUIR'); await E.clicar('contaexcluirok'); await E.p.waitForSelector('#fb-email', { timeout: 15000 }); await E.p.waitForTimeout(500);
    const login = await entrar('davi@exemplo.test', 'senha-davi-1');
    ok(naoExcluiu && naoConfirmou, 'excluir a conta: senha errada ou confirmação diferente de EXCLUIR não excluem nada');
    const fimDoc = await docAdmin(uidD), fimLocal = await E.ler('missao-eear-v1@firebase:' + uidD), fimAnon = await E.ler('missao-eear-v1'), fimTela = await E.p.locator('main').innerText();
    ok(!fimDoc && login.error && (await E.ler('missao-eear-v1@firebase:' + uidD)) === null && JSON.stringify(await E.ler('missao-eear-v1')) === JSON.stringify(anon2) && /foram excluídos/.test(await E.p.locator('main').innerText()) && !E.erros.length, 'excluir a conta: apaga o documento, o login e a cópia local da conta; o progresso sem conta fica; a mensagem diz o que foi apagado' + (fimDoc || !login.error || fimLocal || !/foram excluídos/.test(fimTela) ? ` [doc ${!!fimDoc} login ${!login.error} local ${!!fimLocal} anon ${JSON.stringify(fimAnon) === JSON.stringify(anon2)} msg ${/foram excluídos/.test(fimTela)}]` : ''));
    await E.ctx.close(); } catch (e) { ok(false, 'excluir a conta: o fluxo não terminou — ' + e.message.split('\n')[0] + (E ? ' | conta: ' + (await E.p.evaluate(() => [...document.querySelectorAll('section.card')].filter(x => /conta/i.test((x.querySelector('h2') || {}).textContent || '')).map(x => x.innerText).join(' || ')).catch(() => '')).replace(/\s+/g, ' ').slice(0, 600) : '')); }

  console.log('\n== sessão, interrupções e recuperação');
  { // sessão encerrada em outra aba do mesmo aparelho: esta aba volta ao progresso sem conta e não grava nada na conta
    const F = await aparelho(); await F.conectar('eva@exemplo.test', 'senha-eva-1', true); const uidF = await F.uid();
    await marcar(F, 'T:eva1'); await ate(async () => { const x = await progresso(uidF); return x && x.feito['T:eva1']; });
    const P2 = await F.ctx.newPage(); await P2.goto(srv.url); await P2.waitForTimeout(1500);
    await P2.evaluate(() => { const c = (a, d) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d || {}); document.body.appendChild(x); x.click(); x.remove(); }; c('tab', { v: 'plano' }); c('contasair'); c('contasairmanter'); });
    await F.p.waitForTimeout(2500); await marcar(F, 'T:depois-da-saida'); await espera(3000);
    const nuvemF = await progresso(uidF), anonF = await F.ler('missao-eear-v1'), contaF = await F.ler('missao-eear-v1@firebase:' + uidF);
    ok(!nuvemF.feito['T:depois-da-saida'] && !!(anonF && anonF.feito && anonF.feito['T:depois-da-saida']) && !!(contaF && contaF.feito['T:eva1']) && !(contaF.feito || {})['T:depois-da-saida'], 'conta encerrada em outra aba: esta aba passa ao progresso sem conta; o que se estuda depois não vai para a conta, e a cópia da conta fica intacta');
    // gravação interrompida: a página fecha antes de gravar; ao abrir de novo, o estudo vai para a nuvem
    await P2.close(); await F.conectar('eva@exemplo.test', 'senha-eva-1', false);
    await marcar(F, 'T:interrompida'); await F.p.close();
    const F2 = await F.ctx.newPage(); await F2.goto(srv.url);
    const chegou = await ate(async () => { const x = await progresso(uidF); return x && x.feito['T:interrompida']; }, 20000);
    ok(chegou, 'página fechada antes de gravar na nuvem: o estudo ficou no aparelho e vai para a nuvem quando o app abre de novo');
    // sessão invalidada no servidor (conta desativada): ao abrir, o app sai da conta sem apagar a cópia dela
    await req(`${AU}/identitytoolkit.googleapis.com/v1/projects/${PROJ}/accounts:update`, { method: 'POST', headers: { 'content-type': 'application/json', Authorization: 'Bearer owner' }, body: JSON.stringify({ localId: uidF, disableUser: true }) });
    await F2.reload(); await F2.waitForTimeout(3000);
    const lembrada = await F2.evaluate(() => localStorage.getItem('missao-eear-conta') || '');
    const copia2 = await F2.evaluate(k => JSON.parse(localStorage.getItem(k)), 'missao-eear-v1@firebase:' + uidF);
    ok(!lembrada && !!(copia2 && copia2.feito['T:interrompida']) && (await progresso(uidF)).feito['T:interrompida'] === true, 'sessão invalidada no servidor: o app volta ao progresso sem conta, e a cópia da conta neste aparelho e a nuvem continuam com tudo');
    await F.ctx.close(); }

  { // conta trocada em outra aba com o formulário de exclusão aberto: o formulário fecha e nada é excluído
    const K = await aparelho(); await K.conectar('ivo@exemplo.test', 'senha-ivo-1', true); const uidK = await K.uid();
    await K.plano(); await K.clicar('contaexcluir'); await K.p.waitForSelector('#conta-confirma');
    const K2 = await K.ctx.newPage(); await K2.goto(srv.url); await K2.waitForTimeout(1500);
    await K2.evaluate(() => { const c = a => { const x = document.createElement('button'); x.dataset.a = a; document.body.appendChild(x); x.click(); x.remove(); }; c('contasair'); c('contasairmanter'); });
    await K2.waitForSelector('#fb-email'); await K2.fill('#fb-email', 'jai@exemplo.test'); await K2.fill('#fb-senha', 'senha-jai-1');
    await K2.evaluate(() => { const x = document.createElement('button'); x.dataset.a = 'fbcriar'; document.body.appendChild(x); x.click(); x.remove(); });
    await ate(async () => (await K.uid()) && (await K.uid()) !== uidK); await K.p.waitForTimeout(1500);
    const uidJ = await K.uid(), aberto = await K.p.locator('#conta-confirma').count();
    const vivos = await req(`${AU}/identitytoolkit.googleapis.com/v1/projects/${PROJ}/accounts:query`, { method: 'POST', headers: { 'content-type': 'application/json', Authorization: 'Bearer owner' }, body: '{}' });
    const ids = ((vivos.j && vivos.j.userInfo) || []).map(u => u.localId);
    ok(uidJ !== uidK && aberto === 0 && ids.includes(uidK) && ids.includes(uidJ), 'conta trocada em outra aba com o formulário de exclusão aberto: o formulário fecha, e nenhuma das duas contas é excluída');
    await K.ctx.close(); }

  { // exclusão parcial: o progresso na nuvem é apagado, mas apagar o login falha (rede); depois, a nova tentativa termina
    const G = await aparelho(); await G.conectar('gui@exemplo.test', 'senha-gui-1', true); const uidG = await G.uid();
    await marcar(G, 'T:gui1'); await ate(async () => { const x = await progresso(uidG); return x && x.feito['T:gui1']; });
    await G.ctx.route(/accounts:delete/, r => r.abort());
    await G.plano(); await G.clicar('contaexcluir'); await G.p.waitForTimeout(100);
    await G.p.fill('#conta-senha', 'senha-gui-1'); await G.p.fill('#conta-confirma', 'EXCLUIR'); await G.clicar('contaexcluirok'); await G.p.waitForTimeout(3000);
    const meio = await G.p.locator('main').innerText(), loginMeio = await entrar('gui@exemplo.test', 'senha-gui-1');
    ok(/apagado, mas a conta não/.test(meio) && !(await docAdmin(uidG)) && !!loginMeio.localId && !!(await G.ler('missao-eear-v1@firebase:' + uidG)), 'exclusão parcial: a mensagem diz que o progresso na nuvem foi apagado e a conta não; o login e a cópia deste aparelho continuam');
    await G.ctx.unroute(/accounts:delete/);
    await G.p.fill('#conta-senha', 'senha-gui-1'); await G.p.fill('#conta-confirma', 'EXCLUIR'); await G.clicar('contaexcluirok'); await G.p.waitForSelector('#fb-email', { timeout: 15000 }); await G.p.waitForTimeout(500);
    ok(!!(await entrar('gui@exemplo.test', 'senha-gui-1')).error && !(await docAdmin(uidG)) && (await G.ler('missao-eear-v1@firebase:' + uidG)) === null && !G.erros.length, 'exclusão parcial, nova tentativa: o login, a nuvem e a cópia deste aparelho são excluídos');
    await G.ctx.close(); }

  /* Login com o Google (janela do emulador no lugar do Google) e exclusão com reautenticação pelo Google. O SDK carrega
     apis.google.com/js/api.js para o fluxo de janela, também com o emulador: sem acesso a esse endereço, a janela não
     abre. Fora do CI, isso vira "NÃO TESTADO" com o motivo; no CI (CI=true), é falha. */
  const H = await aparelho(), semGoogle = [];
  H.ctx.on('requestfailed', r => { if (/apis\.google\.com/.test(r.url())) semGoogle.push(r.url()); });
  await H.plano(); await H.p.waitForSelector('[data-a="fbgoogle"]', { timeout: 15000 });
  const pop = await Promise.all([H.p.waitForEvent('popup', { timeout: 20000 }), H.p.click('[data-a="fbgoogle"]')]).then(r => r[0]).catch(() => null);
  if (!pop && semGoogle.length && !process.env.CI) console.log('  – NÃO TESTADO aqui: login e reautenticação com o Google (apis.google.com inacessível neste ambiente; roda no CI)');
  else if (!pop) ok(false, 'login com o Google (emulador): a janela do Google não abriu' + (semGoogle.length ? ' — apis.google.com inacessível' : ''));
  else {
    // a janela do emulador só reage ao clique depois de carregar o script dela (material-components-web, do unpkg)
    await pop.waitForLoadState('networkidle'); await pop.click('#add-account-button button'); await pop.waitForSelector('#email-input', { state: 'visible' });
    await pop.fill('#email-input', 'hugo@exemplo.test'); await pop.fill('#display-name-input', 'Hugo Teste'); await pop.click('#sign-in');
    await H.p.waitForSelector('[data-a="contasair"]', { timeout: 15000 }); const uidH = await H.uid();
    await marcar(H, 'T:hugo1'); await ate(async () => { const x = await progresso(uidH); return x && x.feito['T:hugo1']; });
    const docH = await docAdmin(uidH); await H.plano();
    ok(!!docH && !JSON.stringify(docH).includes('hugo@exemplo.test') && /Hugo Teste/.test(await H.p.locator('main').innerText()), 'login com o Google (emulador): entra, sincroniza, e o documento da nuvem não guarda o e-mail');
    await H.plano(); await H.clicar('contaexcluir'); await H.p.waitForTimeout(100);
    const semSenha = (await H.p.locator('#conta-senha').count()) === 0;
    await H.p.fill('#conta-confirma', 'EXCLUIR');
    const [pop2] = await Promise.all([H.p.waitForEvent('popup'), H.p.click('[data-a="contaexcluirok"]')]);
    await pop2.waitForLoadState('networkidle'); await pop2.locator('#accounts-list li', { hasText: 'hugo@exemplo.test' }).click();
    await H.p.waitForSelector('#fb-email', { timeout: 15000 });
    const contas = await req(`${AU}/identitytoolkit.googleapis.com/v1/projects/${PROJ}/accounts:query`, { method: 'POST', headers: { 'content-type': 'application/json', Authorization: 'Bearer owner' }, body: '{}' });
    ok(semSenha && !(await docAdmin(uidH)) && !((contas.j && contas.j.userInfo) || []).some(u => u.localId === uidH) && !H.erros.length, 'excluir conta do Google: sem campo de senha, reautentica pela janela do Google e apaga a conta e a nuvem');
  }
  await H.ctx.close();

  await b.close(); srv.fechar(); fs.rmSync(saida, { recursive: true, force: true });
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
