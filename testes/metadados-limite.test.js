/* Importa estado válido gerado pelo núcleo publicado e prova recusa explícita, preservação e reabertura.
   Só Auth/Firestore Emulator demo; o arquivo de entrada contém exclusivamente operações fictícias.
   EEAR_CARGA_ESTADO aponta a saída de carga-nucleo.test.js; não fabrica confirmação de gravação. */
const fs = require('fs'), path = require('path'), fixture = require('./f01-fixture.js'), NodeBuffer = require('buffer').Buffer;
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  const arq = process.env.EEAR_CARGA_ESTADO; if (!arq) throw new Error('Defina EEAR_CARGA_ESTADO.');
  const texto = fs.readFileSync(arq, 'utf8'), estado = JSON.parse(texto), hj = new Date().toISOString().slice(0, 10), total = estado.act[hj];
  if (texto.length < 900000 || !total) throw new Error('Entrada não cruza o limite esperado.');
  if (fixture.emular(alvo, path.join(__dirname, 'metadados-limite.test.js'))) return;
  const f = await fixture.abrir(alvo), ctx = await f.contexto(); let falhou = false;
  try {
    const conta = await f.conta('metadados-limite', { v: 1, t: Date.now() - 20000, cfg: { nome: 'Limite Fictício', certs: [] }, feito: {}, act: { [hj]: 2 } });
    const A = await f.pagina(ctx); await f.entrar(A, conta.email);
    if (!await f.ate(async () => (await A.locator('#sync').innerText()) === 'Progresso salvo na sua conta.')) throw new Error('Base não confirmou.');
    await f.importar(A, estado);
    const recusou = await f.ate(async () => /sincronização.*parou|recusou/i.test(await A.locator('#sync').innerText()), 30000);
    const aviso = await A.locator('#sync').innerText(), local = await f.estado(A), servidor = await f.ler(conta.uid);
    const checkpoint = await A.evaluate(uid => new Promise(resolve => { const o = window.indexedDB.open('eear-operacoes', 1); o.onsuccess = () => { const db = o.result, t = db.transaction('contas', 'readonly'), q = t.objectStore('contas').get('firebase:' + uid); t.oncomplete = () => { db.close(); resolve(q.result.st); }; }; }), conta.uid);
    f.rede(ctx, true); await A.reload(); let reaberto;
    const preservou = await f.ate(async () => { reaberto = await f.estado(A); return reaberto.act[hj] === total && Object.keys(reaberto.feito).length === Object.keys(estado.feito).length; });
    falhou = !recusou || local.act[hj] !== total || checkpoint.act[hj] !== total || servidor.act[hj] !== 2 || !preservou || /salvo na sua conta\.$/.test(aviso);
    console.log(`${falhou ? '✗' : '✓'} limite-de-metadados: ${JSON.stringify({ bytesEntrada: NodeBuffer.byteLength(texto), esperado: total, atividadeLocal: local.act[hj], atividadeCheckpoint: checkpoint.act[hj], atividadeServidor: servidor.act[hj], atividadeReaberta: reaberto.act[hj], recusou, preservou, aviso })}`);
  } finally { await ctx.close(); await f.fechar(); }
  process.exitCode = falhou ? 1 : 0;
})().catch(e => { console.error('FALHA DE EXECUÇÃO:', e); process.exitCode = 1; });
