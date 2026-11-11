/* Regressões independentes no emulador oficial: matriz de regras, sessão offline e certificados entre dispositivos.
   Chamado por firebase-emulador.test.js; todos os usuários/dados são fictícios em demo-eear. */
module.exports = async function ({ ok, req, AU, DOCS, PROJ, campos, gravarComo, aparelho, marcar, progresso, ate, url }) {
  console.log('\n== auditoria independente: tipos, sessão offline e certificados');
  const conta = (await req(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'regras-auditoria@exemplo.test', password: 'auditoria-senha-1', returnSecureToken: true })
  })).j;
  const nome = `projects/${PROJ}/databases/(default)/documents/alunos/${conta.localId}`;
  const commit = writes => req(`${DOCS}:commit`, { method: 'POST', headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + conta.idToken }, body: JSON.stringify({ writes }) });
  const valido = campos(1, { v: 1 });
  for (const [rotulo, alterado] of [
    ['v texto', { v: { stringValue: '1' } }], ['v zero', { v: { integerValue: '0' } }],
    ['v fracionária', { v: { doubleValue: 1.5 } }], ['dados mapa', { dados: { mapValue: { fields: {} } } }],
    ['t texto', { t: { stringValue: 'ontem' } }], ['campo extra', { admin: { booleanValue: true } }]
  ]) {
    const r = await gravarComo(conta.idToken, conta.localId, Object.assign({}, valido, alterado));
    ok(r.st === 403, `auditoria regras: recusa ${rotulo} na criação [${r.st}]`);
  }
  for (const campo of ['v', 'dados', 't']) {
    const incompleto = Object.assign({}, valido); delete incompleto[campo];
    const r = await gravarComo(conta.idToken, conta.localId, incompleto);
    ok(r.st === 403, `auditoria regras: recusa criação sem ${campo} [${r.st}]`);
  }
  const semHora = await commit([{ update: { name: nome, fields: valido } }]);
  const horaFalsa = await commit([{ update: { name: nome, fields: Object.assign({}, valido, { atualizado: { timestampValue: '2020-01-01T00:00:00Z' } }) } }]);
  ok(semHora.st === 403 && horaFalsa.st === 403, 'auditoria regras: atualizado é obrigatório e deve corresponder à hora do servidor');
  const criado = await gravarComo(conta.idToken, conta.localId, valido);
  const extraUpdate = await gravarComo(conta.idToken, conta.localId, Object.assign({}, valido, { admin: { booleanValue: true } }));
  const sub = await commit([{ update: { name: nome + '/privado/teste', fields: valido } }]);
  ok(criado.st === 200 && extraUpdate.st === 403 && sub.st === 403, 'auditoria regras: criação válida aceita; campo extra na atualização e subcoleção do próprio UID recusados');

  const A = await aparelho(), B = await aparelho();
  try {
    await A.conectar('sessao-auditoria@exemplo.test', 'auditoria-senha-2', true);
    const uid = await A.uid(), chave = 'missao-eear-v1@firebase:' + uid;
    await marcar(A, 'T:antes-offline');
    ok(await ate(async () => { const s = await progresso(uid); return s && s.feito['T:antes-offline']; }), 'auditoria sessão: progresso inicial confirmado no servidor');
    // A CDN já é substituída pelo SDK npm do CI. Só a comunicação com os emuladores fica offline.
    await A.ctx.setOffline(true);
    await marcar(A, 'T:offline-reaberto');
    const nova = await A.ctx.newPage(); await A.p.close();
    await A.ctx.setOffline(false); // a página local precisa ser servida; bloquear os emuladores simula reabertura offline
    let offline = true;
    await A.ctx.route(/http:\/\/127\.0\.0\.1:(8080|9099)\//, r => offline ? r.abort('internetdisconnected') : r.continue());
    await nova.goto(url);
    await nova.locator('[data-a="tab"][data-v="plano"]').click();
    await nova.waitForSelector('[data-a="contasair"]', { timeout: 15000 });
    const local = await nova.evaluate(k => JSON.parse(localStorage.getItem(k)), chave);
    ok(local.feito['T:offline-reaberto'] === true, 'auditoria sessão: fechar e reabrir com emuladores indisponíveis preserva o estudo pendente');
    offline = false; await nova.evaluate(() => window.dispatchEvent(new Event('online')));
    ok(await ate(async () => { const s = await progresso(uid); return s && s.feito['T:offline-reaberto']; }, 30000), 'auditoria sessão: reconexão envia o estudo da sessão persistida sem novo login');
    // Certificado válido de uma versão anterior: um aparelho com estudo e outro sem aquele registro.
    const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'AUDIT-CERT', o: 'curso', t: 1792195200000 };
    await nova.evaluate(([k, c]) => { const s = JSON.parse(localStorage.getItem(k)); s.cfg.certs = [c]; localStorage.setItem(k, JSON.stringify(s)); }, [chave, cert]);
    await nova.reload();
    ok(await ate(async () => { const s = await progresso(uid); return s && s.cfg.certs.some(c => c.c === 'AUDIT-CERT'); }), 'auditoria certificados: registro e código preservados ao enviar para o Firestore');
    await B.conectar('sessao-auditoria@exemplo.test', 'auditoria-senha-2', false);
    await marcar(B, 'T:outro-dispositivo');
    ok(await ate(async () => { const s = await B.ler(chave); return s && s.cfg.certs.some(c => c.c === 'AUDIT-CERT'); }), 'auditoria certificados: segundo dispositivo recebe o mesmo código, data e registro');
    const remoto = await progresso(uid);
    ok(remoto.cfg.certs.some(c => JSON.stringify(c) === JSON.stringify(cert)) && remoto.feito['T:offline-reaberto'], 'auditoria certificados: gravação do segundo dispositivo mantém certificado e progresso anterior');
  } finally { await A.ctx.close(); await B.ctx.close(); }

  // Sonda de F01 (perda entre abas offline): corrigida em curso/app/14-abas.js, agora roda sempre (EEAR_SONDA_ABAS=0 a
  // desliga só para depurar outra coisa). Sai com falha se houver perda.
  if (process.env.EEAR_SONDA_ABAS !== '0') {
    const O = await aparelho();
    try {
      await O.conectar('abas-auditoria@exemplo.test', 'auditoria-senha-3', true);
      const uid = await O.uid(), chave = 'missao-eear-v1@firebase:' + uid;
      await marcar(O, 'T:base-abas'); await ate(async () => { const s = await progresso(uid); return s && s.feito['T:base-abas']; });
      const aba2 = await O.ctx.newPage(); await aba2.goto(url);
      await aba2.locator('[data-a="tab"][data-v="plano"]').click();
      await aba2.waitForSelector('[data-a="contasair"]');
      await O.ctx.setOffline(true);
      await marcar(O, 'T:aba-1-offline');
      await aba2.evaluate(() => { const b = document.createElement('button'); b.dataset.a = 'marcar'; b.dataset.k = 'T:aba-2-offline'; document.body.appendChild(b); b.click(); b.remove(); });
      const cache = await aba2.evaluate(k => JSON.parse(localStorage.getItem(k)), chave);
      await O.p.close(); await O.ctx.setOffline(false);
      await aba2.evaluate(() => window.dispatchEvent(new Event('online')));
      await ate(async () => { const s = await progresso(uid); return s && s.feito['T:aba-2-offline']; }, 30000);
      const nuvem = await progresso(uid);
      ok(cache.feito['T:aba-1-offline'] && nuvem.feito['T:aba-1-offline'],
        `SONDA abas offline: preservar ambas as marcações após fechar a primeira [cache=${!!cache.feito['T:aba-1-offline']}, nuvem=${!!nuvem.feito['T:aba-1-offline']}]`);
    } finally { await O.ctx.close(); }
  }
};
