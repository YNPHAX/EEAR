/* Investigações adicionais no app real: reset/nuvem, suspensão, exclusão, contagens e escrita interrompida.
   Mesmas dependências e EEAR_REPO_ALVO de f01-abas.test.js. Só emuladores; não modifica o alvo.
   EEAR_F01_RISCOS seleciona casos separados por vírgula. Falhas são evidência de risco/defeito, não aprovação. */
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));

(async () => {
  console.log('Riscos F01: ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'f01-riscos.test.js'))) return;
  const f = await fixture.abrir(alvo), hj = new Date().toISOString().slice(0, 10);
  const cenarios = (process.env.EEAR_F01_RISCOS || 'zerar-nuvem,suspensa,exclusao-surda,contagens,escrita-interrompida').split(',');
  const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'RISCO-CERT', o: 'curso', t: 1792195200000 };
  const resumo = s => s && ({ t: s.t, certsZ: s.cfg.certsZ || 0, certs: s.cfg.certs.map(c => c.c), feito: s.feito, act: s.act });
  let falhas = 0;
  try {
    for (const nome of cenarios) {
      const ctx = await f.contexto();
      try {
        const seed = { v: 1, t: Date.now() - 20000, cfg: { nome: 'Auditoria riscos', certs: [cert] }, feito: { 'T:base': true }, act: { [hj]: 2 }, mod: {}, fc: {}, sims: [] };
        const conta = await f.conta('risco-' + nome, seed), A = await f.pagina(ctx); await f.entrar(A, conta.email);
        const B = await f.pagina(ctx); await f.clicar(B, 'tab', { v: 'plano' }); await B.waitForSelector('[data-a="contasair"]');
        if (!(await f.ate(async () => {
          await f.estado(A); await f.estado(B);
          return (await A.locator('#sync').innerText()) === 'Progresso salvo na sua conta.' && (await B.locator('#sync').innerText()) === 'Progresso salvo na sua conta.';
        }))) throw new Error('Base ainda não confirmada nas duas páginas.');
        const chave = 'missao-eear-v1@firebase:' + conta.uid;
        const marcar = (p, k) => f.clicar(p, 'marcar', { k });
        let passou = false, resultado;
        if (nome === 'zerar-nuvem' || nome === 'zerar-unica') {
          const P = nome === 'zerar-unica' ? A : B;
          if (nome === 'zerar-unica') await B.close();
          f.rede(ctx, true);
          await f.clicar(A, 'zerar'); await A.waitForSelector('[data-a="zerarok"]'); await A.click('[data-a="zerarok"]');
          await marcar(P, 'T:depois');
          const aceito = resumo(await f.estado(P));
          if (nome !== 'zerar-unica') await A.close(); await P.reload();
          const offline = resumo(await f.estado(P));
          f.rede(ctx, false); await P.evaluate(() => window.dispatchEvent(new Event('online')));
          await f.ate(async () => { const s = await f.ler(conta.uid); return s && s.cfg.certsZ > 0 && s.feito['T:depois'] && !s.feito['T:base']; });
          const servidor = resumo(await f.ler(conta.uid)), antesReabrir = resumo(await f.estado(P));
          const aviso = await P.locator('#sync').innerText();
          await P.reload();
          await f.ate(async () => { await f.estado(P); return (await P.locator('#sync').innerText()) === 'Progresso salvo na sua conta.'; });
          const reaberto = resumo(await f.estado(P));
          passou = !!(servidor.certsZ && !servidor.feito['T:base'] && !servidor.certs.length && servidor.feito['T:depois'] && !reaberto.feito['T:base']);
          resultado = { aceito, offline, servidor, antesReabrir, aviso, reaberto };
        } else if (nome === 'suspensa') {
          f.rede(ctx, true);
          const cdp = await ctx.newCDPSession(B);
          await cdp.send('Page.setWebLifecycleState', { state: 'frozen' });
          await f.clicar(A, 'zerar'); await f.clicar(A, 'zerarok');
          await cdp.send('Page.setWebLifecycleState', { state: 'active' });
          await marcar(B, 'T:apos-suspensao');
          await f.ate(async () => { const s = await f.estado(B); return s.cfg.certsZ > 0 && !s.feito['T:base']; });
          const s = await f.estado(B); passou = !s.feito['T:base'] && !s.cfg.certs.length && !!s.feito['T:apos-suspensao']; resultado = resumo(s);
          await cdp.detach();
        } else if (nome === 'exclusao-surda') {
          // Modela o limite reconhecido pelo autor: a notificação de remoção não chega à aba antiga.
          await B.addInitScript(() => window.addEventListener('storage', e => e.stopImmediatePropagation(), true));
          await B.reload(); await f.estado(B);
          await f.clicar(A, 'dadosapagar'); await A.waitForSelector('[data-a="dadosapagarok"]'); await A.click('[data-a="dadosapagarok"]');
          const removido = await A.evaluate(k => localStorage.getItem(k) === null, chave);
          f.rede(ctx, true); await marcar(B, 'T:novo');
          const s = await f.estado(B); passou = removido && !s.feito['T:base']; resultado = { removido, restaurado: resumo(s) };
        } else if (nome === 'contagens') {
          f.rede(ctx, true);
          const n = 30;
          for (let i = 0; i < n; i++) await Promise.all([marcar(A, 'T:A' + i), marcar(B, 'T:B' + i)]);
          await B.waitForTimeout(800);
          const a = await f.estado(A), b = await f.estado(B);
          const cache = await B.evaluate(k => JSON.parse(localStorage.getItem(k)), chave);
          const esperado = 2 + 2 * n;
          passou = [a, b, cache].every(s => s.act[hj] === esperado) && Array.from({ length: n }, (_, i) => i).every(i => cache.feito['T:A' + i] && cache.feito['T:B' + i]);
          resultado = { esperado, A: a.act[hj], B: b.act[hj], cache: cache.act[hj], marcacoes: Object.keys(cache.feito).length };
        } else if (nome === 'escrita-interrompida') {
          f.rede(ctx, true);
          const linhas = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n');
          const aposLeitura = linhas.findIndex(l => l === '    let u = st;');
          const aposEscrita = linhas.findIndex(l => l === '    lembrarLocal(txt, u);');
          if (aposLeitura < 0 || aposEscrita < 0) throw new Error('Revisar breakpoints para este alvo; não adaptar silenciosamente.');
          const cdp = await ctx.newCDPSession(A); await cdp.send('Debugger.enable');
          const url = new URL('app.js', A.url()).href;
          const bp1 = await cdp.send('Debugger.setBreakpointByUrl', { url, lineNumber: aposLeitura });
          const bp2 = await cdp.send('Debugger.setBreakpointByUrl', { url, lineNumber: aposEscrita });
          const pausa = () => new Promise((resolve, reject) => {
            const t = setTimeout(() => reject(new Error('Breakpoint não atingido')), 10000);
            cdp.once('Debugger.paused', r => { clearTimeout(t); resolve(r); });
          });
          let pausou = pausa(); const gravando = marcar(A, 'T:A-race').catch(() => null); await pausou;
          // A já leu a chave real e está suspensa antes de escrever; B grava e fecha com sua alteração persistida.
          await Promise.race([marcar(B, 'T:B-race'), new Promise((_, reject) => setTimeout(() => reject(new Error('Outro renderer bloqueado pelo debugger')), 10000))]);
          const antes = await B.evaluate(k => JSON.parse(localStorage.getItem(k)), chave);
          await B.close(); await cdp.send('Debugger.removeBreakpoint', { breakpointId: bp1.breakpointId });
          pausou = pausa(); await cdp.send('Debugger.resume'); await pausou;
          // A escreveu o snapshot antigo de verdade; fechar antes de processar storage impede a reparação posterior.
          await A.close(); await gravando;
          const C = await f.pagina(ctx), s = await f.estado(C);
          passou = !!(s.feito['T:A-race'] && s.feito['T:B-race']);
          resultado = { BconfirmadaAntesDeFechar: !!antes.feito['T:B-race'], aposFecharAmbas: resumo(s), breakpointAposSetItem: bp2.locations.length > 0 };
        } else throw new Error('Cenário desconhecido: ' + nome);
        console.log(`${passou ? '✓' : '✗'} ${nome}: ${JSON.stringify(resultado)}`);
        if (!passou) falhas++;
      } catch (e) { console.log(`✗ ${nome}: FALHA DE PREPARAÇÃO/EXECUÇÃO: ${e.message}`); falhas++; }
      finally { await ctx.close(); }
    }
  } finally { await f.fechar(); }
  console.log(`Riscos: ${falhas} falha(s) em ${cenarios.length} investigações.`); process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
