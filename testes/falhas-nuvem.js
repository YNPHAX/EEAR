/* Falhas da nuvem sem perda silenciosa (curso/app/13-falhas-nuvem.js), com uma nuvem fictícia em memória (nenhum
   serviço real). A lógica de gravar() é a mesma para o Firebase e para o link do curso no Claude; aqui a nuvem é a do
   Claude, mais simples de simular. Confere: gravação recusada para a sincronização, avisa o aluno e não apaga nada;
   erro passageiro de cota tenta de novo e chega; a conexão voltando grava na hora, sem esperar a espera crescente; o
   app indo para o fundo envia o que estava esperando. Usado por testes/plataforma.test.js; o caminho do Firebase com
   as regras reais fica em testes/firebase-emulador.test.js. */

module.exports = async function testarFalhasNuvem({ b, srv, ok }) {
  console.log('\n== falhas da nuvem: tentar de novo, avisar quando parar, nunca apagar (nuvem fictícia)');
  const N = { doc: null, usuario: '', erros: [], fora: false, tentativas: 0, leituras: 0, gravouEm: 0 };
  const LS = () => 'missao-eear-v1@claude:' + N.usuario;
  const copia = x => (x == null ? x : JSON.parse(JSON.stringify(x)));
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const ate = async (f, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await f()) return true; await espera(100); } return false; };
  const naNuvem = k => !!(N.doc && N.doc.feito && N.doc.feito[k]);
  async function aparelho() {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } }), erros = [];
    await ctx.exposeFunction('__fUsuario', () => N.usuario);
    await ctx.exposeFunction('__fGet', () => { N.leituras++; return N.fora ? { erro: 'unavailable' } : { doc: copia(N.doc) }; });
    await ctx.exposeFunction('__fSet', o => {
      N.tentativas++;
      if (N.fora) return { erro: 'unavailable' };
      if (N.erros.length) return { erro: N.erros[0] === 'sempre' ? N.erros[1] : N.erros.shift() };
      N.doc = copia(o); N.gravouEm = Date.now(); return {};
    });
    await ctx.addInitScript(() => {
      const falha = c => { const e = new Error('falha da nuvem fictícia'); e.code = c; throw e; };
      window.claude = { use: async k => (k === 'user' ? { id: async () => window.__fUsuario() } : { doc: c => /^progresso\//.test(c)
        ? { get: async () => ({ exists: false, data: () => null }), set: async () => falha('invalid_argument'), acquire: async o => ({ acquired: true, holder: o.holder, expiresAt: new Date(Date.now() + 5000).toISOString() }) }
        : {
          get: async () => { const r = await window.__fGet(); if (r.erro) falha(r.erro); return { exists: r.doc != null, data: () => r.doc }; },
          set: async o => { const r = await window.__fSet(o); if (r.erro) falha(r.erro); },
          acquire: async o => { const r = await window.__fGet(); if (r.erro) falha(r.erro); return { acquired: true, holder: o.holder, expiresAt: new Date(Date.now() + (o.ttlMs || 5000)).toISOString() }; }
        } }) };
    });
    const p = await ctx.newPage(); p.on('pageerror', e => erros.push(e.message));
    const clicar = (a, d) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d); document.body.appendChild(x); x.click(); x.remove(); }, [a, d || {}]);
    const local = async k => { const s = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), LS()); return !!(s && s.feito && s.feito[k]); };
    const aviso = async () => { await clicar('tab', { v: 'plano' }); await p.waitForTimeout(150); return p.locator('#sync').innerText(); };
    await p.goto(srv.url); await p.waitForTimeout(800);
    return { p, ctx, erros, marcar: k => clicar('marcar', { k }), local, aviso };
  }

  { // 1. gravação recusada (o aluno não tem permissão de gravar, como um visitante só com leitura no Claude)
    Object.assign(N, { doc: null, usuario: 'falha-recusa', erros: ['sempre', 'invalid_argument'], fora: false, tentativas: 0 });
    const A = await aparelho(); await A.marcar('T:recusada');
    await ate(async () => N.tentativas > 0); await espera(2500);
    const tentativas = N.tentativas, txt = await A.aviso(); await espera(6000);
    ok(/parou/.test(txt) && /nada foi apagado/.test(txt) && /não permite gravar/.test(txt) && await A.local('T:recusada') && !naNuvem('T:recusada') && N.tentativas === tentativas && !A.erros.length,
      `gravação recusada: a sincronização para (sem repetir a gravação recusada), o aviso diz que parou e por quê, e a marcação fica neste aparelho [aviso: ${txt}]`);
    N.erros = []; await A.p.reload();
    ok(await ate(async () => naNuvem('T:recusada')), 'gravação recusada: depois que a nuvem volta a aceitar, abrir o app de novo envia o que ficou no aparelho');
    await A.ctx.close();
  }
  { // 2. erro passageiro diferente de "sem rede" (cota estourada, servidor ocupado): antes parava; agora tenta de novo
    Object.assign(N, { doc: null, usuario: 'falha-cota', erros: ['resource_exhausted', 'deadline-exceeded'], fora: false, tentativas: 0 });
    const A = await aparelho(); await A.marcar('T:cota');
    const chegou = await ate(async () => naNuvem('T:cota'), 30000), txt = await A.aviso();
    ok(chegou && N.tentativas >= 3 && !/parou/.test(txt) && await A.local('T:cota') && !A.erros.length, `cota estourada e servidor ocupado: o app tenta de novo, com espera crescente, e o estudo chega à nuvem (${N.tentativas} tentativas)`);
    await A.ctx.close();
  }
  { // 3. sem rede por um tempo: a espera cresce; quando a conexão volta, grava na hora
    Object.assign(N, { doc: null, usuario: 'falha-rede', erros: [], fora: true, tentativas: 0, leituras: 0 });
    const A = await aparelho(); await A.marcar('T:sem-rede'); await espera(9000);
    const txt = await A.aviso(), tentativas = N.leituras;
    N.fora = false; const t0 = Date.now();
    await A.p.evaluate(() => window.dispatchEvent(new Event('online')));
    const chegou = await ate(async () => naNuvem('T:sem-rede'), 2500), ms = Date.now() - t0;
    ok(/salvo neste aparelho/.test(txt) && !/parou/.test(txt) && tentativas >= 2 && tentativas <= 5 && chegou && await A.local('T:sem-rede') && !A.erros.length,
      `sem rede: tentativas espaçadas (${tentativas} em 9 s, com a primeira abertura), o estudo fica salvo neste aparelho, e a conexão voltando grava na hora (${ms} ms) [aviso: ${txt}]`);
    await A.ctx.close();
  }
  { // 4. o app vai para o fundo (trocar de app no celular) logo depois de estudar: envia sem esperar o intervalo
    Object.assign(N, { doc: null, usuario: 'falha-fundo', erros: [], fora: false, tentativas: 0 });
    const A = await aparelho(); await A.marcar('T:base'); await ate(async () => naNuvem('T:base'));
    const t0 = Date.now(); await A.marcar('T:fundo');
    await A.p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const chegou = await ate(async () => naNuvem('T:fundo'), 5000), ms = N.gravouEm - t0;
    ok(chegou && ms < 1300 && !A.erros.length, `app indo para o fundo: o estudo vai para a nuvem sem esperar o intervalo de 1,5 s (${ms} ms)`);
    await A.ctx.close();
  }
  { // 5. página fechando ou navegando (pagehide antes de ficar oculta): nada começa; senão, a união terminada depois
    //    gravaria a cópia desta página por cima do que outra abertura guardou neste aparelho (defeito achado nesta revisão)
    Object.assign(N, { doc: null, usuario: 'falha-saida', erros: [], fora: false, tentativas: 0 });
    const A = await aparelho(); await A.marcar('T:base'); await ate(async () => naNuvem('T:base'));
    /* Espera a sincronização de T:base terminar (depois de gravar, ela ainda confere a nuvem): uma marcação feita no meio
       dela vai para a nuvem logo no fim dela (comportamento normal, de antes desta mudança), e o teste a confundia com o
       envio antecipado. Era a falha intermitente do CI no commit 5aca0a4 (1 em 6 execuções aqui). */
    await espera(1000);
    /* Mede QUANDO a gravação acontece, em vez de esperar um tempo fixo (no CI, mais lento, a espera fixa podia cruzar o
       intervalo normal de 1,5 s): o envio antecipado gravaria em milissegundos; o caminho normal, depois do intervalo. */
    const t0 = Date.now(); await A.marcar('T:saindo');
    await A.p.evaluate(() => { window.dispatchEvent(new Event('pagehide')); Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const chegou = await ate(async () => naNuvem('T:saindo'), 8000), ms = N.gravouEm - t0;
    ok(chegou && ms >= 1400 && await A.local('T:saindo') && !A.erros.length, `página fechando: o envio antecipado não começa; o estudo fica no aparelho e segue o intervalo normal (gravou ${ms} ms depois de marcar)`);
    await A.ctx.close();
  }
};
