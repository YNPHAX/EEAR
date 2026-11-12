/* Gate independente de F01 (fora do CI padrão enquanto o defeito estiver aberto).
   EEAR_REPO_ALVO=/cópia/do/commit EEAR_FIREBASE_SDK=... EEAR_FIREBASE_CLI=... node testes/f01-abas.test.js
   Faz controle positivo e cobre abas offline, desmarcar, Zerar, certificados e reconexão. Nenhum serviço real.
   O alvo deve estar congelado; a aprovação final depende também de F02–F07 e dos testes reais pendentes. */
const path = require('path'), { execFileSync } = require('child_process');
const fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));

(async () => {
  console.log('F01: alvo ' + alvo + ', commit ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'f01-abas.test.js'))) return;
  const f = await fixture.abrir(alvo); let falhas = 0;
  const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'F01-CERT', o: 'curso', t: 1792195200000 };
  const mesmoCert = c => Object.keys(cert).every(k => JSON.stringify(c[k]) === JSON.stringify(cert[k]));
  const base = () => ({ v: 1, t: Date.now() - 10000, cfg: { nome: 'Auditoria F01', certs: [] }, feito: { 'T:base': true, 'T:remover': true }, mod: {}, fc: {}, sims: [] });
  const padrao = ['dispositivos', 'fechar-A', 'fechar-B', 'desmarcar', 'zerar', 'certificado', 'reconectar', 'zerar-duplo'];
  const cenarios = process.env.EEAR_F01_CENARIOS ? process.env.EEAR_F01_CENARIOS.split(',') : padrao;
  try {
    for (const nome of cenarios) {
      if (!padrao.includes(nome)) throw new Error('Cenário desconhecido: ' + nome);
      const ctx = await f.contexto(), ctx2 = nome === 'dispositivos' ? await f.contexto() : ctx;
      try {
        const seed = base(); if (nome === 'zerar' || nome === 'zerar-duplo') seed.cfg.certs = [cert];
        const esperado = s => {
          if (!s) return false;
          if (nome === 'desmarcar') return !s.feito['T:remover'] && !!s.feito['T:B'];
          if (nome === 'zerar') return s.cfg.certsZ > 0 && !s.feito['T:base'] && !s.cfg.certs.length && !!s.feito['T:depois-zerar'];
          if (nome === 'certificado') return s.cfg.certs.some(mesmoCert) && !!s.feito['T:B'];
          if (nome === 'zerar-duplo') return s.cfg.certsZ > 0 && !s.feito['T:base'] && !s.cfg.certs.length && !!s.feito['T:A'] && !!s.feito['T:B'];
          return !!(s.feito['T:A'] && s.feito['T:B'] && s.feito['T:base']);
        };
        const conta = await f.conta(nome, seed), A = await f.pagina(ctx); await f.entrar(A, conta.email);
        const B = await f.pagina(ctx2); if (ctx2 !== ctx) await f.entrar(B, conta.email);
        else { await f.clicar(B, 'tab', { v: 'plano' }); await B.waitForSelector('[data-a="contasair"]'); }
        // Confirma a leitura real em ambas as abas antes da partição, sem presumir a duração da transação.
        if (!(await f.ate(async () => (await f.estado(A)).feito['T:base'] && (await f.estado(B)).feito['T:base'] &&
          /^Progresso salvo na sua conta\.$/.test(await A.locator('#sync').innerText()) && /^Progresso salvo na sua conta\.$/.test(await B.locator('#sync').innerText())))) throw new Error('Base não foi confirmada nas duas páginas.');
        // Bloqueia Auth/Firestore; HTML e SDK locais representam os assets já disponíveis offline, sem depender de SW.
        f.rede(ctx, true); if (ctx2 !== ctx) f.rede(ctx2, true);
        const marcar = (p, k) => f.clicar(p, 'marcar', { k });
        const zerar = async p => { await f.clicar(p, 'zerar'); await p.waitForSelector('[data-a="zerarok"]'); await p.click('[data-a="zerarok"]'); };
        let sobrevivente = B;
        if (nome === 'desmarcar') { await marcar(A, 'T:remover'); await marcar(B, 'T:B'); }
        else if (nome === 'zerar') { await zerar(A); await marcar(B, 'T:depois-zerar'); }
        else if (nome === 'zerar-duplo') { await zerar(A); await zerar(B); await marcar(A, 'T:A'); await marcar(B, 'T:B'); }
        else if (nome === 'certificado') {
          const s = await f.estado(A); s.cfg.certs = [cert]; await f.importar(A, s); await marcar(B, 'T:B');
        } else if (nome === 'fechar-B') { await marcar(B, 'T:B'); await marcar(A, 'T:A'); sobrevivente = A; }
        else { await marcar(A, 'T:A'); await marcar(B, 'T:B'); }
        const antesA = await f.estado(A), antesB = await f.estado(B);
        // Não confundir bloqueio de estudo sem aviso com preservação: cada alteração deve ter sido aceita na UI.
        if (nome === 'desmarcar' && antesA.feito['T:remover']) throw new Error('Desmarcação não foi aplicada.');
        if (nome === 'certificado' && !antesA.cfg.certs.some(c => c.c === cert.c)) throw new Error('Certificado não entrou na fixture.');
        let cacheOffline = null;
        if (nome !== 'reconectar' && nome !== 'dispositivos') {
          await (sobrevivente === A ? B : A).close(); await sobrevivente.reload();
          await f.ate(async () => { cacheOffline = await f.estado(sobrevivente); return esperado(cacheOffline); }); // aceita recuperação assíncrona, inclusive de um futuro journal
        }
        f.rede(ctx, false); if (ctx2 !== ctx) f.rede(ctx2, false);
        const paginas = [A, B].filter(p => !p.isClosed());
        for (const p of paginas) await p.evaluate(() => window.dispatchEvent(new Event('online')));
        const espera = await f.ate(async () => esperado(await f.ler(conta.uid)));
        const nuvem = await f.ler(conta.uid);
        // Reabrir também as páginas sobreviventes: convergência precisa ser visível, além de existir no servidor.
        for (const p of paginas) await p.reload();
        const estados = []; for (const p of paginas) {
          let s; await f.ate(async () => { s = await f.estado(p); return esperado(s); }); estados.push(s);
        }
        const passou = espera && estados.every(esperado) && (!cacheOffline || esperado(cacheOffline));
        console.log(`${passou ? '✓' : '✗'} ${nome}: ${JSON.stringify({ aceitoA: Object.keys(antesA.feito), aceitoB: Object.keys(antesB.feito), offline: cacheOffline && esperado(cacheOffline), servidor: nuvem && esperado(nuvem), paginas: estados.map(esperado) })}`);
        if (!passou) falhas++;
      } catch (e) { console.log(`✗ ${nome}: ${e.message}`); falhas++; }
      finally { await ctx.close(); if (ctx2 !== ctx) await ctx2.close(); }
    }
  } finally { await f.fechar(); }
  console.log(`F01: ${cenarios.length - falhas}/${cenarios.length} cenários passaram; ${falhas} falha(s). Parecer não alterado automaticamente.`);
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
