/* Contrafactual IA04: runtime a6366a8 INTACTO com regras anteriores SOMENTE no emulador.
   Reutiliza o teste original sem alterar qualquer critério. Exige a negativa exata para comprovar dependência.
   A correção com as regras candidatas é testada separadamente pelo gate exclusao-protocolo. */
const path = require('path'), os = require('os'), fs = require('fs'), assert = require('assert'), { execFileSync, spawnSync } = require('child_process');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-a636-regras-antigas-'));
try {
  assert(!process.env.FIRESTORE_EMULATOR_HOST && !process.env.FIREBASE_AUTH_EMULATOR_HOST, 'Requer emuladores próprios para não misturar regras.');
  const regras = execFileSync('git', ['show', 'a35ea9a:web/firestore.rules'], { cwd: alvo }); fs.writeFileSync(path.join(dir, 'firestore.rules'), regras);
  assert(!regras.toString().includes('getAfter('));
  fs.writeFileSync(path.join(dir, 'firebase.json'), JSON.stringify({ firestore: { rules: 'firestore.rules' }, emulators: {
    auth: { host: '127.0.0.1', port: 9299 }, firestore: { host: '127.0.0.1', port: 8280, websocketPort: 9250 }, hub: { host: '127.0.0.1', port: 4490 }, logging: { host: '127.0.0.1', port: 4491 }, ui: { enabled: false }, singleProjectMode: true
  } }));
  const r = spawnSync(process.env.EEAR_FIREBASE_CLI, ['emulators:exec', '--config', path.join(dir, 'firebase.json'), '--project', 'demo-eear-independent-a35', '--only', 'auth,firestore', `node "${path.join(__dirname, 'a35-retorno-firebase-antigo.test.js')}"`], { cwd: dir, encoding: 'utf8', env: process.env });
  const saida = (r.stdout || '') + (r.stderr || ''); process.stdout.write(saida);
  assert.strictEqual(r.status, 1); assert(saida.includes('Runtime publicado SHA256: ce6d1069f0cfc46bc2b447b6c2535a1d062a9bf59c7f1d221dcbbde96d15950f'));
  assert(/"docV2Apagado":true,"authExcluidaHTTP":400,"marcadorHTTP":404,"recriou":true/.test(saida));
  assert(!saida.includes('FALHA DE PREPARAÇÃO'));
  console.log('✓ Dependência IA04 comprovada: runtime novo sozinho continua vulnerável com regras antigas; controle negativo não é aprovação dessa configuração.');
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
