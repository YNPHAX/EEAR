/* Isolamento entre duas contas no Firestore, pela API REST e com o token de cada conta (ferramenta de homologação, fora
   do CI). Confere, com as regras publicadas no projeto, que a conta B não lê nem grava o documento da conta A, que
   ninguém lista a coleção alunos, que sem login nada passa e que outros caminhos (por exemplo, assinaturas/{uid})
   são recusados. Só lê documentos de aluno; as tentativas de gravação usam a condição "o documento não existe", então,
   se uma regra deixasse passar por engano, nada que já exista seria sobrescrito (no máximo, um documento de teste novo).
   Uso, no projeto de homologação (só eear-teste; as duas contas fictícias já criadas pelo app):
     EEAR_FIREBASE_CONFIG=<arquivo da configuração do app web> EEAR_CONTA_A=<e-mail> EEAR_SENHA_A=<senha> \
     EEAR_CONTA_B=<e-mail> EEAR_SENHA_B=<senha> node testes/isolamento-firebase.js
   Nos emuladores (FIREBASE_AUTH_EMULATOR_HOST e FIRESTORE_EMULATOR_HOST definidos, projeto demo-*), as contas são
   criadas se não existirem. Senhas e tokens não são impressos. Sai com 1 se alguma verificação falhar, 2 se não rodar. */
const fs = require('fs');
const sair = (c, m) => { console.error(m); process.exit(c); };
const cfgArq = process.env.EEAR_FIREBASE_CONFIG;
if (!cfgArq || !fs.existsSync(cfgArq)) sair(2, 'Defina EEAR_FIREBASE_CONFIG com o arquivo da configuração do app web (fora do repositório).');
const cfg = JSON.parse(fs.readFileSync(cfgArq, 'utf8'));
const AU_EMU = process.env.FIREBASE_AUTH_EMULATOR_HOST, FS_EMU = process.env.FIRESTORE_EMULATOR_HOST, emulador = !!(AU_EMU && FS_EMU);
const PROJ = cfg.projectId;
if (emulador ? !/^demo-/.test(PROJ) : PROJ !== 'eear-teste') sair(2, emulador ? 'Nos emuladores, use um projeto demo-*.' : `Só o projeto de homologação eear-teste é aceito (veio ${PROJ}).`);
const contas = [['A', process.env.EEAR_CONTA_A, process.env.EEAR_SENHA_A], ['B', process.env.EEAR_CONTA_B, process.env.EEAR_SENHA_B]];
if (contas.some(c => !c[1] || !c[2])) sair(2, 'Defina EEAR_CONTA_A, EEAR_SENHA_A, EEAR_CONTA_B e EEAR_SENHA_B (contas fictícias de teste).');
if (contas[0][1] === contas[1][1]) sair(2, 'As contas A e B têm de ser diferentes.');
const AUTH = emulador ? `http://${AU_EMU}/identitytoolkit.googleapis.com/v1` : 'https://identitytoolkit.googleapis.com/v1';
const DOCS = `${emulador ? `http://${FS_EMU}` : 'https://firestore.googleapis.com'}/v1/projects/${PROJ}/databases/(default)/documents`;
/* A chave de API pode estar restrita por referenciador (recomendado): manda o do domínio do login. */
const REFERER = `https://${cfg.authDomain}/`;
let falhas = 0;
const ok = (c, m) => { console.log(`${c ? '  ✓' : '  ✗'} ${m}`); if (!c) falhas++; };
async function req(url, op = {}) {
  const r = await fetch(url, Object.assign({}, op, { headers: Object.assign({ Referer: REFERER, 'content-type': 'application/json' }, op.headers || {}) }));
  const t = await r.text(); let j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { /* resposta sem JSON */ }
  return { st: r.status, j };
}
const auth = t => (t ? { Authorization: 'Bearer ' + t } : {});
async function entrar(email, senha) {
  let r = await req(`${AUTH}/accounts:signInWithPassword?key=${cfg.apiKey}`, { method: 'POST', body: JSON.stringify({ email, password: senha, returnSecureToken: true }) });
  if (r.st !== 200 && emulador) r = await req(`${AUTH}/accounts:signUp?key=${cfg.apiKey}`, { method: 'POST', body: JSON.stringify({ email, password: senha, returnSecureToken: true }) });
  if (r.st !== 200) sair(2, `Não foi possível entrar com ${email.replace(/^(.).*@/, '$1…@')}: ${(r.j && r.j.error && r.j.error.message) || r.st}`);
  return { uid: r.j.localId, token: r.j.idToken };
}
/* Gravação que só cria (condição: o documento não existe): nunca sobrescreve o que já existe. */
const criarSo = (token, caminho, campos) => req(`${DOCS}:commit`, { method: 'POST', headers: auth(token), body: JSON.stringify({ writes: [{
  update: { name: `projects/${PROJ}/databases/(default)/documents/${caminho}`, fields: campos }, currentDocument: { exists: false },
  updateTransforms: campos.atualizado ? [] : [{ fieldPath: 'atualizado', setToServerValue: 'REQUEST_TIME' }] }] }) });
const minimo = () => ({ v: { integerValue: '1' }, dados: { stringValue: '{"v":1,"teste":"isolamento"}' }, t: { integerValue: String(Date.now()) } });
const recusado = st => st === 403 || st === 401;

(async () => {
  console.log(`== isolamento entre contas no Firestore (${emulador ? 'emuladores' : 'projeto ' + PROJ})`);
  const A = await entrar(contas[0][1], contas[0][2]), B = await entrar(contas[1][1], contas[1][2]);
  ok(A.uid !== B.uid, 'as duas contas têm uid diferentes');
  const aLe = await req(`${DOCS}/alunos/${A.uid}`, { headers: auth(A.token) });
  ok(aLe.st === 200 || aLe.st === 404, `a conta A lê o próprio documento (${aLe.st === 200 ? 'existe' : 'ainda não existe: abra o app com a conta A e estude algo para criá-lo'})`);
  const bLeA = await req(`${DOCS}/alunos/${A.uid}`, { headers: auth(B.token) });
  ok(recusado(bLeA.st), `a conta B NÃO lê o documento da conta A [${bLeA.st}]`);
  const bGravaA = await criarSo(B.token, `alunos/${A.uid}`, minimo());
  ok(recusado(bGravaA.st), `a conta B NÃO grava o documento da conta A [${bGravaA.st}]`);
  const bApagaA = await req(`${DOCS}/alunos/${A.uid}?currentDocument.exists=false`, { method: 'DELETE', headers: auth(B.token) });
  ok(recusado(bApagaA.st), `a conta B NÃO apaga o documento da conta A [${bApagaA.st}]`);
  const lista = await req(`${DOCS}/alunos`, { headers: auth(A.token) });
  ok(recusado(lista.st), `ninguém lista a coleção alunos, nem a própria conta [${lista.st}]`);
  const semLogin = await req(`${DOCS}/alunos/${A.uid}`);
  ok(recusado(semLogin.st), `sem login, o documento não é lido [${semLogin.st}]`);
  const assinatura = await criarSo(A.token, `assinaturas/${A.uid}`, { ativa: { booleanValue: true }, atualizado: { timestampValue: new Date().toISOString() } });
  ok(recusado(assinatura.st), `a conta A NÃO grava assinaturas/{uid} (só o servidor poderá) [${assinatura.st}]`);
  const extra = await criarSo(B.token, `alunos/${B.uid}`, Object.assign(minimo(), { email: { stringValue: 'nao-deve-entrar@exemplo.test' } }));
  ok(recusado(extra.st), `documento com campo a mais (e-mail) é recusado [${extra.st}]`);
  console.log(falhas ? `\n${falhas} falha(s): NÃO aprove a homologação` : '\ntudo certo: o isolamento entre as duas contas vale com as regras publicadas');
  process.exit(falhas ? 1 : 0);
})().catch(e => sair(2, 'Erro: ' + e.message));
