/* Auditoria noturna independente de 8bd32d2: privacidade da exclusão, sessões de outros aparelhos,
   diários inválidos/futuros e estudos independentes. Só emuladores demo e handlers reais.
   Mesmas variáveis da fixture F01; EEAR_NOTURNA_CENARIOS seleciona casos separados por vírgula. */
const path = require('path'), { execFileSync } = require('child_process'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const hj = new Date().toISOString().slice(0, 10);
const seed = () => ({ v: 1, t: Date.now() - 20000, cfg: { nome: 'Pessoa Fictícia Auditoria Noturna', certs: [] }, mod: {}, fc: {}, sims: [], feito: { 'T:base': true }, act: { [hj]: 2 } });
const sdkAuth = async p => p.evaluate(async () => {
  const a = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js');
  const au = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js');
  const u = au.getAuth(a.getApp()).currentUser; return u && u.uid;
});

(async () => {
  console.log('Noturna: alvo ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'noturna-integridade.test.js'))) return;
  const f = await fixture.abrir(alvo), cenarios = (process.env.EEAR_NOTURNA_CENARIOS || 'sair-apagar,excluir-conta,outra-sessao,diario-corrompido,diario-futuro,atividade-dispositivos,simulados-iguais').split(',');
  let falhas = 0;
  const sincronizada = async p => f.ate(async () => (await p.locator('#sync').innerText()) === 'Progresso salvo na sua conta.');
  const apagarConta = async p => {
    await f.clicar(p, 'tab', { v: 'plano' }); await f.clicar(p, 'contaexcluir');
    await p.fill('#conta-senha', 'auditoria-f01-123'); await p.fill('#conta-confirma', 'EXCLUIR'); await f.clicar(p, 'contaexcluirok');
    if (!await f.ate(async () => !await sdkAuth(p))) throw new Error('A exclusão não encerrou a sessão do solicitante.');
    await f.clicar(p, 'tab', { v: 'plano' });
  };
  const dadosLocais = (p, uid) => p.evaluate(uid => Object.keys(localStorage).filter(k => k.startsWith('missao-eear-v1') && k.includes('@firebase:' + uid)).map(k => ({ chave: k.replace(uid, '<UID_FICTICIO>'), texto: localStorage.getItem(k) })), uid);
  try {
    for (const nome of cenarios) {
      if (!['sair-apagar', 'excluir-conta', 'outra-sessao', 'diario-corrompido', 'diario-futuro', 'atividade-dispositivos', 'simulados-iguais'].includes(nome)) throw new Error('Cenário desconhecido: ' + nome);
      const ctx = await f.contexto(); let extra;
      try {
        let passou = false, resultado;
        if (nome.startsWith('diario-')) {
          const A = await f.pagina(ctx), principal = seed();
          const raw = nome === 'diario-corrompido' ? '{"seq":9,"st":{"v":1,"feito":{"T:unica-copia":true}' : JSON.stringify({ seq: 9, bid: '', base: null, st: { v: 2, t: Date.now(), dadosFuturos: { estudo: 'Única cópia de versão futura' } } });
          await A.evaluate(([s, raw]) => { localStorage.setItem('missao-eear-v1', JSON.stringify(s)); localStorage.setItem('missao-eear-v1-diario#aba-interrompida-ficticia', raw); }, [principal, raw]);
          await A.reload(); await new Promise(r => setTimeout(r, 4500));
          const res = await A.evaluate(raw => ({ original: localStorage.getItem('missao-eear-v1-diario#aba-interrompida-ficticia') === raw, backup: Object.keys(localStorage).some(k => k.includes('recuperar') && localStorage.getItem(k) === raw), restantes: Object.keys(localStorage).filter(k => k.startsWith('missao-eear-v1-diario')).length }), raw);
          passou = res.original || res.backup; resultado = { preservadoExato: passou, ...res, avisoRecuperacao: await A.locator('[data-a="reccopiar"]').count() };
        } else {
          const conta = await f.conta('noturna-' + nome, seed()), A = await f.pagina(ctx); await f.entrar(A, conta.email);
          if (!await sincronizada(A)) throw new Error('Base de A ainda não confirmada.');
          if (nome === 'sair-apagar' || nome === 'excluir-conta') {
            await f.clicar(A, 'marcar', { k: 'T:privado' }); if (!await sincronizada(A)) throw new Error('Estudo privado não confirmou.');
            await require('./copias-privadas.js')(A, conta.uid, true);
            const antes = await dadosLocais(A, conta.uid);
            if (nome === 'sair-apagar') {
              await f.clicar(A, 'tab', { v: 'plano' });
              if (!await f.ate(async () => { await f.clicar(A, 'contasair'); return await A.locator('[data-a="contasairapagar"]').isVisible().catch(() => false); })) {
                const corpo = (await A.locator('body').innerText()).split('\n').filter(l => /nuvem|conta|apagar|salvo/.test(l));
                const estado = await f.estado(A), guardado = await A.evaluate(uid => Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith('missao-eear-v1') && k.includes('@firebase:' + uid)).map(k => { const t = localStorage.getItem(k); let o = t; try { o = JSON.parse(t); } catch (e) { /* pedido de trava é texto simples */ } return [k.replace(uid, '<UID>'), o]; })), conta.uid);
                console.log('DIAGNÓSTICO sair-apagar: ' + JSON.stringify({ corpo, estado, guardado }));
                throw new Error('A UI não habilitou sair apagando após a confirmação na nuvem.');
              }
              await A.click('[data-a="contasairapagar"]');
              if (!await f.ate(async () => !await sdkAuth(A))) throw new Error('Não saiu.');
              await f.clicar(A, 'tab', { v: 'plano' });
            } else await apagarConta(A);
            const depois = await dadosLocais(A, conta.uid), servidor = await f.ler(conta.uid);
            const mensagem = (await A.locator('body').innerText()).split('\n').filter(l => /apagado|excluído|saiu/.test(l)).join(' ');
            await A.reload(); const aposReabrir = await dadosLocais(A, conta.uid);
            const residuosIDB = await require('./copias-privadas.js')(A, conta.uid, false);
            passou = depois.length === 0 && aposReabrir.length === 0 && residuosIDB.length === 0 && (nome === 'sair-apagar' ? !!servidor.feito['T:privado'] : servidor === null);
            resultado = { dadosAntes: antes.length, dadosDepois: depois.map(x => ({ chave: x.chave, nomeRetido: x.texto.includes('Pessoa Fictícia'), estudoRetido: x.texto.includes('T:privado') })), aposReabrir: aposReabrir.length, residuosIDB, servidorExiste: !!servidor, mensagem };
          } else {
            extra = await f.contexto(); const B = await f.pagina(extra); await f.entrar(B, conta.email); if (!await sincronizada(B)) throw new Error('Base de B ainda não confirmada.');
            if (nome === 'outra-sessao') {
              f.rede(extra, true); await f.clicar(B, 'marcar', { k: 'T:offline' }); const aceito = !!(await f.estado(B)).feito['T:offline'];
              await apagarConta(A); const apagado = await f.ler(conta.uid) === null;
              const login = await fetch('http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: conta.email, password: 'auditoria-f01-123', returnSecureToken: true }) });
              const uidAntigo = await sdkAuth(B);
              f.rede(extra, false); await B.evaluate(() => window.dispatchEvent(new Event('online')));
              const voltou = await f.ate(async () => !!await f.ler(conta.uid)); const s = await f.ler(conta.uid);
              passou = aceito && apagado && login.status >= 400 && !voltou;
              resultado = { aceitoOffline: aceito, documentoApagado: apagado, novoLoginHTTP: login.status, outraSessaoAindaConectada: uidAntigo === conta.uid, documentoRecriado: voltou, nomeRecriado: !!(s && s.cfg.nome), feito: s && s.feito };
            } else if (nome === 'atividade-dispositivos' || nome === 'simulados-iguais') {
              f.rede(ctx, true); f.rede(extra, true);
              let idsDistintos = null, aceitos;
              if (nome === 'atividade-dispositivos') {
                await f.clicar(A, 'marcar', { k: 'T:A-independente' }); await f.clicar(B, 'marcar', { k: 'T:B-independente' });
              } else {
                await f.clicar(A, 'simini', { tipo: 'materia', s: 'por' }); await f.clicar(B, 'simini', { tipo: 'materia', s: 'por' });
                const a = (await f.estado(A)).ativo, b = (await f.estado(B)).ativo; idsDistintos = a.ini !== b.ini && JSON.stringify(a.ids) !== JSON.stringify(b.ids);
                for (const p of [A, B]) { await f.clicar(p, 'go', { v: 'sim' }); await f.clicar(p, 'entregar'); await p.waitForSelector('[data-a="entregarok"]'); await p.click('[data-a="entregarok"]'); }
              }
              const a = await f.estado(A), b = await f.estado(B); aceitos = { A: a.act[hj], B: b.act[hj], simuladosA: a.sims.length, simuladosB: b.sims.length, registrosIguais: JSON.stringify(a.sims) === JSON.stringify(b.sims), idsDistintos };
              if (a.act[hj] !== 3 || b.act[hj] !== 3 || (nome === 'simulados-iguais' && (!idsDistintos || a.sims.length !== 1 || b.sims.length !== 1))) throw new Error('Não comprovou duas atividades independentes aceitas: ' + JSON.stringify(aceitos));
              f.rede(ctx, false); f.rede(extra, false); await A.evaluate(() => window.dispatchEvent(new Event('online'))); await B.evaluate(() => window.dispatchEvent(new Event('online')));
              const esperado = s => s && s.act[hj] === 4 && (nome === 'simulados-iguais' ? s.sims.length === 2 : s.feito['T:A-independente'] && s.feito['T:B-independente']);
              const convergiu = await f.ate(async () => esperado(await f.ler(conta.uid)));
              const s = await f.ler(conta.uid); await A.reload(); let reaberto;
              const retomou = await f.ate(async () => { reaberto = await f.estado(A); return esperado(reaberto); });
              // A leitura inicial agora é assíncrona (checkpoint + Auth). Exigir também durabilidade offline.
              const gravouCache = await f.ate(async () => A.evaluate(uid => { const t = localStorage.getItem('missao-eear-v1@firebase:' + uid); return t && JSON.parse(t).act; }, conta.uid).then(act => act && act[hj] === 4));
              f.rede(ctx, true); await A.reload();
              const duravelOffline = await f.ate(async () => { reaberto = await f.estado(A); return esperado(reaberto); });
              passou = convergiu && retomou && gravouCache && duravelOffline && esperado(reaberto); resultado = { aceitos, convergiu, esperadoAtividade: 4, atividadeServidor: s.act[hj], simuladosServidor: s.sims.length, atividadeReaberto: reaberto.act[hj], feito: s.feito };
            } else throw new Error('Cenário desconhecido: ' + nome);
          }
        }
        console.log(`${passou ? '✓' : '✗'} ${nome}: ${JSON.stringify(resultado)}`); if (!passou) falhas++;
      } catch (e) { console.log(`✗ ${nome}: FALHA DE PREPARAÇÃO/EXECUÇÃO: ${e.message}`); falhas++; }
      finally { await ctx.close(); if (extra) await extra.close(); }
    }
  } finally { await f.fechar(); }
  console.log(`Noturna: ${falhas} falha(s) em ${cenarios.length} cenários.`); process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
