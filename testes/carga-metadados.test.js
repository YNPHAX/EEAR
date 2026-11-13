/* Carga do runtime publicado: ações reais, 4 abas, sem Web Locks/eventos storage, Firebase bloqueado.
   Mede bytes/tempo e verifica contagem, marcas, certificado, resets e reabertura. Não compacta metadados.
   EEAR_REPO_ALVO fixa o snapshot; EEAR_CARGA_RODADAS (padrão 500) produz 4*rodadas ações.
   Requer dependências da fixture F01, mas não inicia nem acessa emuladores/serviços Firebase. */
const fs = require('fs'), path = require('path'), nodeCrypto = require('crypto'), NodeBuffer = require('buffer').Buffer, fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const rodadas = Number(process.env.EEAR_CARGA_RODADAS || 500), abas = 4;
if (!Number.isSafeInteger(rodadas) || rodadas < 10 || rodadas > 2000) throw new Error('Rodadas deve estar entre 10 e 2000.');
const hj = new Date().toISOString().slice(0, 10);
const checkpoint = p => p.evaluate(() => new Promise((resolve, reject) => {
  const o = window.indexedDB.open('eear-operacoes', 1); o.onerror = () => reject(o.error);
  o.onupgradeneeded = () => { o.transaction.abort(); reject(new Error('Sonda não cria banco.')); };
  o.onsuccess = () => { const db = o.result, t = db.transaction('contas', 'readonly'), q = t.objectStore('contas').get(''); t.oncomplete = () => { db.close(); resolve(q.result); }; };
}));
(async () => {
  const f = await fixture.abrir(alvo), ctx = await f.contexto(), medidas = []; let falhas = 0;
  const fonte = fs.readFileSync(path.join(alvo, 'curso/app.js'));
  console.log(JSON.stringify({ alvo, appSha256: nodeCrypto.createHash('sha256').update(fonte).digest('hex'), rodadas, abas, firebase: 'bloqueado', webLocks: false, eventosStorage: false }));
  const inicio = Date.now(), ps = [];
  const medir = async (fase, esperado, ultima) => {
    let r;
    const confirmou = await f.ate(async () => { r = await checkpoint(ps[0]); return r && r.st.act[hj] === esperado && (!ultima || r.st.feito[ultima]); }, 60000);
    if (!confirmou) throw new Error('Contagem do checkpoint: esperado ' + esperado + ', obtido ' + (r && r.st.act[hj]));
    const json = JSON.stringify(r.st), meta = JSON.stringify(r.meta);
    const linha = { fase, atividade: esperado, marcas: Object.keys(r.st.feito).length, bytesEstado: NodeBuffer.byteLength(json), caracteresEstado: json.length, bytesMeta: NodeBuffer.byteLength(meta), bytesCheckpoint: NodeBuffer.byteLength(JSON.stringify(r)), recibos: Object.keys(r.recibos || {}).length, segundos: (Date.now() - inicio) / 1000 };
    medidas.push(linha); console.log('MEDIDA ' + JSON.stringify(linha)); return r;
  };
  try {
    await ctx.route(/http:\/\/127\.0\.0\.1:(8180|9199)\//, r => r.abort());
    await ctx.addInitScript(() => { Object.defineProperty(navigator, 'locks', { get: () => undefined, configurable: true }); window.addEventListener('storage', e => e.stopImmediatePropagation(), true); });
    ps.push(await f.pagina(ctx));
    const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'CARGA-FICTICIA', o: 'curso', t: 1792195200000 };
    await f.importar(ps[0], { v: 1, cfg: { nome: 'Pessoa Fictícia Carga', certs: [cert] }, feito: { 'T:base': true }, act: { [hj]: 2 } });
    for (let i = 1; i < abas; i++) ps.push(await f.pagina(ctx));
    await medir('base', 2);
    for (let i = 0; i < rodadas; i++) {
      await Promise.all(ps.map((p, j) => f.clicar(p, 'marcar', { k: `T:carga-${j}-${i}` })));
      if ((i + 1) % 50 === 0 || i + 1 === rodadas) {
        const r = await medir('rodada-' + (i + 1), 2 + abas * (i + 1));
        if (i + 1 === rodadas && process.env.EEAR_CARGA_ESTADO) fs.writeFileSync(process.env.EEAR_CARGA_ESTADO, JSON.stringify(r.st));
      }
    }
    const completa = s => s && s.act[hj] === 2 + abas * rodadas && s.cfg.certs.some(c => c.c === cert.c) && ps.every((_, j) => Array.from({ length: rodadas }, (_, i) => `T:carga-${j}-${i}`).every(k => s.feito[k]));
    const convergiu = await f.ate(async () => (await Promise.all(ps.map(p => f.estado(p)))).every(completa), 60000);
    if (!convergiu) falhas++; console.log(`${convergiu ? '✓' : '✗'} carga: ${abas * rodadas} marcas, atividade ${2 + abas * rodadas}, certificado e quatro abas`);
    for (let i = 0; i < 10; i++) {
      await f.clicar(ps[0], 'zerar'); await f.clicar(ps[0], 'zerarok');
      await f.clicar(ps[0], 'marcar', { k: `T:apos-reset-${i}` });
      const r = await medir('reset-' + (i + 1), 1, `T:apos-reset-${i}`);
      if (!r.st.feito[`T:apos-reset-${i}`] || Object.keys(r.st.feito).length !== 1 || r.st.cfg.certs.length !== 0) { falhas++; console.log('✗ reset-carga: estado não é somente a alteração posterior ao reset'); }
      if (!await f.ate(async () => (await Promise.all(ps.map(p => f.estado(p)))).every(s => s.act[hj] === 1 && Object.keys(s.feito).length === 1 && s.feito[`T:apos-reset-${i}`]), 60000)) { falhas++; console.log('✗ reset-carga: abas não convergiram'); }
    }
    await Promise.all(ps.map(p => p.close())); ps.length = 0; ps.push(await f.pagina(ctx));
    const reabriu = await f.ate(async () => { const s = await f.estado(ps[0]); return s.act[hj] === 1 && Object.keys(s.feito).length === 1 && s.feito['T:apos-reset-9'] && s.cfg.certs.length === 0; }, 60000);
    if (!reabriu) falhas++; console.log(`${reabriu ? '✓' : '✗'} reabertura após carga/reset: nenhum progresso antigo reaparece`);
    if (process.env.EEAR_CARGA_SAIDA) fs.writeFileSync(process.env.EEAR_CARGA_SAIDA, JSON.stringify({ alvo, rodadas, abas, medidas, falhas }, null, 2));
    console.log(`Carga: ${falhas} falha(s); ${((Date.now() - inicio) / 1000).toFixed(1)} s. Crescimento medido sem compactação.`);
  } finally { await ctx.close(); await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error('FALHA DE EXECUÇÃO:', e); process.exitCode = 1; });
