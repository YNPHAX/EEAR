/* Geração do app Android: configuração do Capacitor, conteúdo do app, projeto Android e, onde houver
   Android SDK (como no GitHub Actions), a compilação do APK. Tudo numa pasta temporária.
   Uso: node testes/apk.test.js [pasta_do_projeto]   (precisa de app/node_modules: cd app && npm ci) */
const fs = require('fs'), path = require('path');
const { execSync } = require('child_process');
const { RAIZ, relatorio, montar, pastaTemp } = require('./lib/base');

/* Identificador do app na loja e no aparelho: uma vez distribuído, nunca mais muda (ver app/ASSINATURA.md). */
const ID_DEFINITIVO = 'com.inphax.app';

function testarApk(fonte = RAIZ) {
  const r = relatorio('App Android');
  const cfg = JSON.parse(fs.readFileSync(path.join(fonte, 'app', 'capacitor.config.json'), 'utf8'));
  r.ok(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(cfg.appId), `identificador do app válido (${cfg.appId})`);
  r.ok(cfg.appName && cfg.webDir === 'www', `nome "${cfg.appName}" e conteúdo em www`);
  r.igual(cfg.appId, ID_DEFINITIVO, 'identificador definitivo do app');
  r.nota('o identificador não pode mudar depois de publicado: mudar instala um app novo, e o progresso do app antigo não passa sozinho');
  // o progresso fica no armazenamento do endereço interno do app (https://localhost): mudar o endereço o esconde
  const srv = cfg.server || {};
  r.ok(!srv.hostname && !srv.androidScheme && !srv.url, 'endereço interno do app no padrão do Capacitor (o progresso salvo continua visível depois de atualizar)');

  const nm = path.join(fonte, 'app', 'node_modules');
  if (!fs.existsSync(path.join(nm, '@capacitor', 'cli'))) { r.nota('app/node_modules não instalado: rode "cd app && npm ci" para testar o projeto Android'); return r; }
  const t = pastaTemp('inphax-android-');
  const app = montar(fonte, { app: true });
  fs.cpSync(app.destino, path.join(t, 'www'), { recursive: true });
  ['package.json', 'package-lock.json', 'capacitor.config.json'].forEach(f => fs.copyFileSync(path.join(fonte, 'app', f), path.join(t, f)));
  fs.cpSync(path.join(fonte, 'app', 'assets'), path.join(t, 'assets'), { recursive: true });
  fs.symlinkSync(nm, path.join(t, 'node_modules'));
  const sh = (cmd, cwd = t) => execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf8', timeout: 20 * 60 * 1000 });
  sh('npx cap add android');
  const gradle = fs.readFileSync(path.join(t, 'android', 'app', 'build.gradle'), 'utf8');
  r.ok(gradle.includes(`applicationId "${cfg.appId}"`), 'projeto Android gerado com o mesmo identificador');
  r.ok(fs.existsSync(path.join(t, 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html')), 'conteúdo do curso copiado para dentro do app');

  if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
    r.nota('sem Android SDK neste computador: a compilação do APK é testada no GitHub Actions');
    return r;
  }
  try { sh('npx capacitor-assets generate --android'); } catch (e) { r.nota('ícones do app não gerados (capacitor-assets): ' + String(e.message).split('\n')[0]); }
  sh('npx cap sync android');
  sh('./gradlew assembleDebug --no-daemon -q', path.join(t, 'android'));
  const apk = path.join(t, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  r.ok(fs.existsSync(apk) && fs.statSync(apk).size > 1e6, `APK compilado (${fs.existsSync(apk) ? (fs.statSync(apk).size / 1e6).toFixed(1) + ' MB' : 'não gerado'})`);
  r.nota('APK de teste (debug): assinado com uma chave criada na hora; o Android não instala um por cima do outro');

  // APK de distribuição, do mesmo jeito que o workflow App Android faz com a chave fixa (aqui, uma chave de teste)
  const jks = path.join(t, 'teste.jks'), senha = 'teste-' + Date.now();
  sh(`keytool -genkeypair -keystore "${jks}" -alias teste -keyalg RSA -keysize 2048 -validity 10000 -storepass ${senha} -keypass ${senha} -dname "CN=Teste INPHAX"`);
  const props = `-Pandroid.injected.signing.store.file="${jks}" -Pandroid.injected.signing.store.password=${senha} -Pandroid.injected.signing.key.alias=teste -Pandroid.injected.signing.key.password=${senha}`;
  sh(`./gradlew assembleRelease --no-daemon -q ${props}`, path.join(t, 'android'));
  const rel = path.join(t, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  if (!r.ok(fs.existsSync(rel), 'APK de distribuição (release) compilado com a chave fixa')) return r;
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  const bt = path.join(sdk, 'build-tools', fs.readdirSync(path.join(sdk, 'build-tools')).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).pop());
  const noApk = (sh(`"${path.join(bt, 'apksigner')}" verify --print-certs "${rel}"`).match(/SHA-256 digest: ([0-9a-f]+)/) || [])[1];
  const naChave = ((sh(`keytool -list -v -keystore "${jks}" -storepass ${senha}`).match(/SHA256: ([0-9A-F:]+)/) || [])[1] || '').replace(/:/g, '').toLowerCase();
  r.ok(noApk && noApk === naChave, 'APK assinado com a chave fixa (é o que deixa instalar a versão nova por cima, sem perder o progresso)');
  if (fs.existsSync(path.join(bt, 'aapt2'))) {
    const pacote = (sh(`"${path.join(bt, 'aapt2')}" dump badging "${rel}"`).match(/package: name='([^']+)'/) || [])[1];
    r.igual(pacote, cfg.appId, 'APK de distribuição com o identificador definitivo');
  }
  return r;
}

if (require.main === module) {
  const r = testarApk(path.resolve(process.argv[2] || RAIZ));
  r.imprimir(); process.exit(r.falhas() ? 1 : 0);
}
module.exports = { testarApk };
