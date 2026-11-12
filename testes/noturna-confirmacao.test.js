/* Interrompe a resposta de um commit real do Firestore emulado depois de o servidor gravar, antes do cliente confirmar.
   Não falsifica a resposta nem o localStorage: só retém a resposta HTTP real, faz Page.crash e reabre offline.
   Mesmas variáveis da fixture F01. Nenhum projeto real ou credencial real. */
const path = require('path'), { execFileSync } = require('child_process'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
(async () => {
  console.log('Confirmação noturna: alvo ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'noturna-confirmacao.test.js'))) return;
  const f = await fixture.abrir(alvo), ctx = await f.contexto(), hj = new Date().toISOString().slice(0, 10);
  let liberar;
  try {
    const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'ACK-CERT', o: 'curso', t: 1792195200000 };
    const seed = { v: 1, t: Date.now() - 20000, cfg: { nome: 'Confirmação Fictícia', certs: [cert] }, mod: {}, fc: {}, sims: [], feito: { 'T:base': true }, act: { [hj]: 2 } };
    const conta = await f.conta('confirmacao-interrompida', seed), A = await f.pagina(ctx); await f.entrar(A, conta.email);
    if (!await f.ate(async () => (await A.locator('#sync').innerText()) === 'Progresso salvo na sua conta.')) throw new Error('Base não confirmada.');
    let retendo = true, iniciou;
    const iniciado = new Promise(r => { iniciou = r; }), espera = new Promise(r => { liberar = r; });
    await ctx.route(/127\.0\.0\.1:8180\/.*:commit(?:\?|$)/, async r => {
      if (!retendo || !(r.request().postData() || '').includes('T:ack-interrompido')) return r.fallback();
      retendo = false;
      const res = await r.fetch(); iniciou(res.status());
      await espera; await r.fulfill({ response: res }).catch(() => null);
    });
    await f.clicar(A, 'marcar', { k: 'T:ack-interrompido' });
    const status = await Promise.race([iniciado, new Promise((_, reject) => setTimeout(() => reject(new Error('O commit não atingiu o ponto HTTP esperado')), 15000))]);
    const servidorAntes = await f.ler(conta.uid);
    const baseAntes = await A.evaluate(uid => JSON.parse(localStorage.getItem('missao-eear-v1-base@firebase:' + uid)).st, conta.uid);
    const aceito = !!(await f.estado(A)).feito['T:ack-interrompido'];
    if (status !== 200 || !servidorAntes.feito['T:ack-interrompido'] || servidorAntes.act[hj] !== 3 || baseAntes.act[hj] !== 2 || !aceito) throw new Error('Não comprovou commit remoto e base local ainda antiga.');
    const cdp = await ctx.newCDPSession(A), caiu = A.waitForEvent('crash'); cdp.send('Page.crash').catch(() => null); await caiu; await A.close(); liberar();
    f.rede(ctx, true);
    const B = await f.pagina(ctx); await f.clicar(B, 'tab', { v: 'plano' }); await B.waitForSelector('[data-a="contasair"]'); let offline;
    const voltou = await f.ate(async () => { offline = await f.estado(B); return offline.feito['T:ack-interrompido'] && offline.act[hj] === 3 && offline.cfg.certs.some(c => c.c === cert.c); });
    const confirmarAntes = process.env.EEAR_ACK_CONFIRMAR_ANTES === '1';
    if (confirmarAntes) {
      f.rede(ctx, false); await B.evaluate(() => window.dispatchEvent(new Event('online')));
      const confirmou = await f.ate(async () => (await B.evaluate(uid => JSON.parse(localStorage.getItem('missao-eear-v1-base@firebase:' + uid)).st.act, conta.uid))[hj] === 3);
      if (!confirmou) throw new Error('O controle não confirmou a base antes do novo estudo.');
    }
    await f.clicar(B, 'marcar', { k: 'T:apos-reabrir' });
    f.rede(ctx, false); await B.evaluate(() => window.dispatchEvent(new Event('online')));
    const correto = s => s && s.feito['T:ack-interrompido'] && s.feito['T:apos-reabrir'] && s.act[hj] === 4 && s.cfg.certs.some(c => c.c === cert.c);
    const chegou = await f.ate(async () => correto(await f.ler(conta.uid)));
    await B.reload(); let final; const visivel = await f.ate(async () => { final = await f.estado(B); return correto(final); });
    const servidorFinal = await f.ler(conta.uid);
    const passou = voltou && chegou && visivel;
    console.log(`${passou ? '✓' : '✗'} commit-sem-confirmacao: ${JSON.stringify({ confirmarAntesNovoEstudo: confirmarAntes, commitHTTP: status, baseAntes: baseAntes.act[hj], servidorAntes: servidorAntes.act[hj], aceito, voltou, offlineAtividade: offline.act[hj], chegou, visivel, atividadeFinal: final.act[hj], servidorFinal: servidorFinal.act[hj], marcacoesFinais: final.feito, certificado: final.cfg.certs.some(c => c.c === cert.c) })}`);
    process.exitCode = passou ? 0 : 1;
  } catch (e) { console.log('✗ FALHA DE PREPARAÇÃO/EXECUÇÃO: ' + e.message); process.exitCode = 1; }
  finally { if (liberar) liberar(); await ctx.close(); await f.fechar(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
