/* Versões antigas e novas do app na mesma nuvem do curso no Claude (nuvem fictícia em memória, com latência e a trava
   doc.acquire; contas fictícias; nenhum serviço real). A versão antiga (a publicada hoje) grava o progresso inteiro dela
   por cima, sem assinatura e sem ler de novo. O defeito coberto aqui: um aparelho novo unia esse documento e o gravava
   ASSINADO; outro aparelho novo, cuja base tinha marcações que a versão antiga não conhecia, via o documento assinado
   como sucessor da base dele e apagava as próprias marcações (tarefas, caderno de erros, folhas da apostila).
   Confere: a perda não acontece mais (cenário determinístico e cenário com concorrência); apagar e restaurar marcações
   entre aparelhos novos continua funcionando, inclusive depois que a versão antiga deixa de gravar; interrupção e
   reconexão não perdem nada; nuvem incompatível não apaga o progresso deste aparelho. Usado por testes/plataforma.test.js. */
module.exports = async function testarEpocaNuvem({ b, srv, ok }) {
  console.log('\n== versões antiga e nova na mesma nuvem do Claude (nuvem fictícia, contas fictícias)');
  const N = { doc: null, trava: null, usuario: '', foraDoAr: false, atraso: {}, semRede: {} }; // atraso e semRede: por aparelho (nome)
  const copia = x => (x == null ? x : JSON.parse(JSON.stringify(x)));
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const ate = async (f, ms = 25000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await f()) return true; await espera(150); } return false; };
  const D = new Date(), hj = D.getFullYear() + '-' + String(D.getMonth() + 1).padStart(2, '0') + '-' + String(D.getDate()).padStart(2, '0');
  const LS = () => 'missao-eear-v1@claude:' + N.usuario, LS_BASE = () => 'missao-eear-v1-base@claude:' + N.usuario;
  const P0 = () => ({ v: 1, t: Date.now() - 60000, cfg: { nome: 'Aluna Teste', alvo: 'cfs2-2027', prova: '2026-11-22', inicio: hj, horas: 3, dias: [0, 1, 2, 3, 4, 5, 6], excl: [] },
    mod: { POR01: { best: 0.9, tent: 2, lido: '2026-10-01' } }, fc: {}, erros: { 'MAT03-2': 1 }, sims: [], feito: { 'T:base': true }, act: { [hj]: 1 }, aula: {}, ap: {}, diag: null, ativo: null, ult: null, ultAula: 'POR01' });
  /* O que a versão antiga grava: o progresso inteiro dela (o que leu ao abrir, mais o que estudou), sem os campos que
     ela não conhece fora de cfg (sinc, ep), por cima, sem ler de novo. */
  const antiga = (lido, extra) => { const o = copia(lido); delete o.sinc; delete o.ep; o.t = Date.now(); o.feito = Object.assign({}, o.feito, extra); return o; };
  async function aparelho(semente, nome) {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } }), erros = [];
    await ctx.exposeFunction('__eU', () => N.usuario);
    const fora = () => N.foraDoAr || !!N.semRede[nome];
    await ctx.exposeFunction('__eGet', async () => { await espera(60 + Math.random() * 120); if (fora()) return { off: true }; return { x: copia(N.doc) }; });
    await ctx.exposeFunction('__eSet', async o => { const d = N.atraso[nome] || 0; N.atraso[nome] = 0; await espera(150 + Math.random() * 250 + d); if (fora()) return 'unavailable'; N.doc = copia(o); return ''; });
    await ctx.exposeFunction('__eAcq', async (h, ttl) => { await espera(40); if (fora()) return { off: true }; const ag = Date.now(), t = N.trava; if (t && t.ate > ag && t.h !== h) return { acquired: false, expiresAt: new Date(t.ate).toISOString() }; N.trava = { h, ate: ag + ttl }; return { acquired: true, holder: h, expiresAt: new Date(ag + ttl).toISOString() }; });
    await ctx.addInitScript(semente => {
      if (semente && !sessionStorage.getItem('semeado')) { localStorage.setItem(semente.k, semente.v); sessionStorage.setItem('semeado', '1'); }
      const off = () => { const e = new Error('sem rede'); e.code = 'unavailable'; return e; };
      window.claude = { use: async k => {
        const u = await window.__eU();
        if (k === 'user') return { id: async () => u };
        return { doc: c => /^progresso\//.test(c) ? { get: async () => ({ exists: false, data: () => null }), set: async () => { const e = new Error('regras'); e.code = 'invalid_argument'; throw e; }, acquire: async o => ({ acquired: true, holder: o.holder, expiresAt: new Date(Date.now() + 5000).toISOString() }) } : ({
          get: async () => { const r = await window.__eGet(); if (r.off) throw off(); return { exists: r.x != null, data: () => r.x }; },
          set: async o => { const r = await window.__eSet(o); if (r) throw off(); },
          acquire: async o => { const r = await window.__eAcq(o.holder, o.ttlMs); if (r.off) throw off(); return r; }
        }) };
      } };
    }, semente ? { k: LS(), v: JSON.stringify(semente) } : null);
    return abrirPagina(ctx, erros);
  }
  /* Mesmo aparelho (mesmo armazenamento local), página nova: como fechar e abrir o curso de novo. */
  const reabrir = d => abrirPagina(d.ctx, d.erros);
  async function abrirPagina(ctx, erros) {
    const p = await ctx.newPage(); p.on('pageerror', e => erros.push(e.message));
    const ler = k => p.evaluate(k => JSON.parse(localStorage.getItem(k)), k || LS());
    const clicar = (a, d) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d); document.body.appendChild(x); x.click(); x.remove(); }, [a, d || {}]);
    const marcar = k => clicar('marcar', { k });
    await p.goto(srv.url);
    return { p, ctx, erros, ler, marcar, clicar, sincronizou: async () => !!(await ler(LS_BASE())) };
  }
  /* Assina como o app (resumo FNV-1a do documento sem sinc, em ordem fixa de chaves): simula um documento assinado por
     um aparelho novo que não tinha o que este aparelho tem. */
  const canonico = x => (Array.isArray(x) ? x.map(canonico) : x && typeof x === 'object' ? Object.keys(x).sort().reduce((o, k) => { o[k] = canonico(x[k]); return o; }, {}) : x);
  const assinar = o => { const x = copia(o); delete x.sinc; const t = JSON.stringify(canonico(x)); let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } x.sinc = h.toString(36) + '.' + t.length.toString(36); return x; };
  const tem = (s, k) => !!(s && s.feito && s.feito[k]);
  const fechar = async (...ds) => { for (const d of ds) await d.ctx.close(); };
  const roda = n => !process.env.EEAR_EPOCA || process.env.EEAR_EPOCA.split(',').includes(String(n)); // só para depurar

  if (roda(1)) { /* 1. Determinístico: o que o defeito apagava (marcação, caderno de erros e folha da apostila do aparelho B). */
    N.usuario = 'ep-lavagem'; N.doc = P0(); N.trava = null;
    const A = await aparelho(); await ate(A.sincronizou); await espera(5500);
    const lidoPelaAntiga = copia(N.doc); // a versão antiga abre agora e lê a nuvem
    const sB = Object.assign(P0(), { t: Date.now(), erros: { 'MAT03-2': 1, 'POR02-3': 2 }, ap: { 'TESTE-AP': { r: { 1: 'b' }, ok: { 1: 0 }, tent: 1 } }, feito: { 'T:base': true, 'T:b0': true } });
    const B = await aparelho(sB); await ate(async () => (await B.sincronizou()) && tem(N.doc, 'T:b0')); await espera(5500);
    await B.marcar('T:b1'); await ate(async () => tem(N.doc, 'T:b1') && tem((await B.ler(LS_BASE())).st, 'T:b1')); await espera(5500);
    N.doc = antiga(lidoPelaAntiga, { 'T:v1': true }); // a versão antiga grava por cima: sem nada do B
    await A.marcar('T:a1'); await ate(async () => tem(N.doc, 'T:a1')); await espera(5500); // A une o documento antigo e grava
    await B.marcar('T:b2'); await ate(async () => tem(N.doc, 'T:b2')); await espera(3000);
    const n = N.doc, lb = await B.ler();
    const doB = s => s && ['T:b0', 'T:b1', 'T:b2'].every(k => tem(s, k)) && s.erros['POR02-3'] === 2 && s.ap['TESTE-AP'] && s.ap['TESTE-AP'].r[1] === 'b';
    ok(doB(n) && doB(lb) && tem(n, 'T:a1') && tem(n, 'T:v1') && !A.erros.length && !B.erros.length,
      'versão antiga grava por cima e outro aparelho novo une e grava assinado: as marcações, o caderno de erros e a apostila do aparelho B não somem (nem na nuvem nem nele)' + ` [nuvem: ${Object.keys(n.feito)} | B: ${Object.keys(lb.feito)} | erros B: ${Object.keys(lb.erros)}]`);
    await fechar(A, B);
  }

  if (roda(2)) { /* 2. Só aparelhos novos: apagar e restaurar uma marcação passa de um aparelho para o outro e não volta sozinha. */
    N.usuario = 'ep-apagar'; N.doc = P0(); N.trava = null;
    const A = await aparelho(); await ate(A.sincronizou); await espera(5500);
    await A.marcar('T:x'); await ate(async () => tem(N.doc, 'T:x')); await espera(5500);
    const B = await aparelho(); await ate(async () => (await B.sincronizou()) && tem(await B.ler(), 'T:x')); await espera(5500);
    await B.marcar('T:x'); await ate(async () => !tem(N.doc, 'T:x')); await espera(5500); // B desmarca
    await A.marcar('T:y'); await ate(async () => tem(N.doc, 'T:y')); await espera(3000);
    const apagou = !tem(N.doc, 'T:x') && !tem(await A.ler(), 'T:x');
    await A.marcar('T:x'); await ate(async () => tem(N.doc, 'T:x')); await espera(5500); // A marca de novo
    await B.marcar('T:z'); await ate(async () => tem(N.doc, 'T:z')); await espera(3000);
    ok(apagou && tem(N.doc, 'T:x') && tem(await B.ler(), 'T:x') && !A.erros.length && !B.erros.length,
      'só aparelhos novos: desmarcar num aparelho desmarca no outro e não volta; marcar de novo também passa para o outro');
    await fechar(A, B);
  }

  if (roda(3)) { /* 3. Depois que a versão antiga para de gravar, apagar volta a funcionar entre os aparelhos novos. */
    N.usuario = 'ep-depois'; N.doc = P0(); N.trava = null;
    const A = await aparelho(); await ate(A.sincronizou); await espera(5500);
    const lido = copia(N.doc);
    const B = await aparelho(); await ate(B.sincronizou); await espera(5500);
    await B.marcar('T:b1'); await ate(async () => tem(N.doc, 'T:b1')); await espera(5500);
    N.doc = antiga(lido, { 'T:v1': true });
    await A.marcar('T:a1'); await ate(async () => tem(N.doc, 'T:a1')); await espera(5500);
    await B.marcar('T:b2'); await ate(async () => tem(N.doc, 'T:b2') && tem(N.doc, 'T:b1')); await espera(5500);
    await A.marcar('T:a2'); await ate(async () => tem(N.doc, 'T:a2')); await espera(5500); // os dois já estão na mesma época
    const juntos = ['T:a1', 'T:a2', 'T:b1', 'T:b2', 'T:v1'].every(k => tem(N.doc, k));
    await B.marcar('T:a1'); await ate(async () => !tem(N.doc, 'T:a1')); await espera(5500); // B desmarca uma tarefa feita no A
    await A.marcar('T:a3'); await ate(async () => tem(N.doc, 'T:a3')); await espera(3000);
    ok(juntos && !tem(N.doc, 'T:a1') && !tem(await A.ler(), 'T:a1') && tem(N.doc, 'T:b1') && !A.erros.length && !B.erros.length,
      'depois da gravação antiga, os aparelhos novos se reconciliam sem perda e voltam a propagar desmarcações (não há ressurreição)');
    await fechar(A, B);
  }

  if (roda(4)) { /* 4. Interrupção e reconexão: o aparelho B fica sem rede enquanto a versão antiga e o aparelho A gravam; B também é
       fechado com uma gravação pendente e reaberto. */
    N.usuario = 'ep-rede'; N.doc = P0(); N.trava = null;
    const A = await aparelho(); await ate(A.sincronizou); await espera(5500);
    const lido = copia(N.doc);
    let B = await aparelho(); await ate(B.sincronizou); await espera(5500);
    await B.marcar('T:b1'); await ate(async () => tem(N.doc, 'T:b1')); await espera(5500);
    N.foraDoAr = true; await B.marcar('T:off'); await espera(2500); N.foraDoAr = false;
    N.doc = antiga(lido, { 'T:v1': true });
    await A.marcar('T:a1'); await ate(async () => tem(N.doc, 'T:a1')); await espera(1000);
    await ate(async () => tem(N.doc, 'T:off') && tem(N.doc, 'T:b1'), 30000); await espera(5500); // B reconecta e reenvia
    await B.marcar('T:fecha'); await B.p.close(); // fechado antes de gravar na nuvem (o aparelho guarda a cópia local)
    N.doc = antiga(lido, { 'T:v2': true });
    B = await reabrir(B); await ate(async () => tem(N.doc, 'T:fecha')); await espera(3000);
    const n = N.doc, lb = await B.ler();
    ok(['T:b1', 'T:off', 'T:fecha', 'T:a1', 'T:v2'].every(k => tem(n, k)) && ['T:b1', 'T:off', 'T:fecha'].every(k => tem(lb, k)) && !B.erros.length,
      'sem rede, gravação da versão antiga no meio e aparelho fechado com gravação pendente: ao reconectar e ao reabrir, nada se perde' + ` [nuvem: ${Object.keys(n.feito)}]`);
    await fechar(A, B);
  }

  if (roda(5)) { /* 5. Nuvem incompatível: nada do que só este aparelho tem é apagado (documento antigo, assinado de outra época,
       assinado sem época, de versão futura e corrompido). */
    N.usuario = 'ep-incompat'; N.doc = P0(); N.trava = null;
    const A = await aparelho(); await ate(A.sincronizou); await espera(5500);
    await A.marcar('T:meu'); await ate(async () => tem(N.doc, 'T:meu')); await espera(5500);
    const assinaturaConfere = !!N.doc.sinc && assinar(N.doc).sinc === N.doc.sinc; // o teste assina como o app
    const assinadoSemMeu = copia(N.doc); delete assinadoSemMeu.feito['T:meu'];
    /* Montado na hora, com t posterior à base: um documento assinado que parece descender da base deste aparelho. */
    const outraEpoca = () => assinar(Object.assign(copia(assinadoSemMeu), { ep: 'outra-epoca', t: Date.now() + 1000 }));
    const casos = [['antigo, sem assinatura', antiga(P0(), {})], ['assinatura que não bate', assinadoSemMeu], ['assinado por outro aparelho em outra época', outraEpoca], ['versão futura', { v: 3, dados: 'x' }], ['corrompido', { v: 1, cfg: 'x', feito: 7 }]];
    const resultados = [];
    for (const [nome, doc] of casos) {
      N.doc = typeof doc === 'function' ? doc() : copia(doc); await A.marcar('T:' + nome); await espera(7000);
      const l = await A.ler(); resultados.push([nome, tem(l, 'T:meu') && tem(l, 'T:base')]);
    }
    ok(assinaturaConfere && resultados.every(r => r[1]) && !A.erros.length, 'nuvem incompatível (antiga, assinatura que não bate, assinada em outra época, versão futura, corrompida): o progresso deste aparelho não é apagado' + ` [${resultados.map(r => r[0] + ': ' + (r[1] ? 'ok' : 'PERDEU')).join('; ')}]`);
    await fechar(A);
  }

  if (roda(6)) { /* 6. Concorrência: dois aparelhos novos marcam em rodadas enquanto uma versão antiga grava por cima de tempos em
       tempos com o que leu ao abrir; depois ela fecha. Nenhuma marcação dos aparelhos novos se perde. */
    N.usuario = 'ep-concorrencia'; N.doc = P0(); N.trava = null;
    const A = await aparelho(); await ate(A.sincronizou);
    const B = await aparelho(); await ate(B.sincronizou);
    const lido = copia(N.doc), novas = [], dela = {};
    for (let r = 0; r < 6; r++) {
      novas.push(`T:a${r}`, `T:b${r}`); dela[`T:v${r}`] = true;
      await Promise.all([A.marcar(`T:a${r}`), B.marcar(`T:b${r}`)]);
      await espera(400 + Math.random() * 1500);
      N.doc = antiga(lido, dela);
      await espera(300 + Math.random() * 1200);
    }
    await A.marcar('T:fimA'); await B.marcar('T:fimB'); novas.push('T:fimA', 'T:fimB');
    await ate(async () => novas.every(k => tem(N.doc, k)), 45000); await espera(6000);
    await A.p.reload(); await B.p.reload();
    await ate(async () => { const la = await A.ler(), lb = await B.ler(); return novas.every(k => tem(la, k) && tem(lb, k)); }, 20000); await espera(6000);
    const n = N.doc, la = await A.ler(), lb = await B.ler(), falta = s => novas.filter(k => !tem(s, k));
    ok(!falta(n).length && !falta(la).length && !falta(lb).length && !A.erros.length && !B.erros.length,
      'concorrência com uma versão antiga gravando por cima: nenhuma marcação dos aparelhos novos se perde, na nuvem nem neles' + ` [faltam na nuvem: ${falta(n)} | A: ${falta(la)} | B: ${falta(lb)}]`);
    await fechar(A, B);
  }

  if (roda(7)) { /* 7. Gravação atrasada de outro aparelho novo: A estuda sem rede; B estuda depois e grava com a trava, mas a
       resposta demora mais que a trava; A volta, grava e confirma; a gravação de B chega depois e cobre a de A (assinada,
       da mesma época, mais recente). A não pode tratar o que gravou como apagado do outro lado. */
    N.usuario = 'ep-atrasada'; N.doc = P0(); N.trava = null; N.atraso = {}; N.semRede = {};
    const A = await aparelho(null, 'A'); await ate(A.sincronizou); await espera(5500);
    const B = await aparelho(null, 'B'); await ate(B.sincronizou); await espera(5500);
    N.semRede.A = true; await A.marcar('T:a1'); await espera(1000);
    N.atraso.B = 12000; await B.marcar('T:b1'); await espera(2500); // B pega a trava e grava (atrasado)
    N.semRede.A = false; // A grava quando a trava de B vencer
    await ate(async () => tem(N.doc, 'T:a1')); const aGravou = tem(N.doc, 'T:a1');
    await ate(async () => tem(N.doc, 'T:b1')); await espera(5500); const coberta = !tem(N.doc, 'T:a1');
    await A.marcar('T:a2'); await ate(async () => tem(N.doc, 'T:a2')); await espera(5500);
    const n = N.doc, la = await A.ler();
    ok(aGravou && coberta && tem(n, 'T:a1') && tem(la, 'T:a1') && tem(n, 'T:b1') && !A.erros.length && !B.erros.length,
      'gravação atrasada de outro aparelho chega depois da que este aparelho confirmou: o que ele gravou não é apagado' + ` [a gravação de A chegou: ${aGravou}; foi coberta: ${coberta} | nuvem: ${Object.keys(n.feito)} | A: ${Object.keys(la.feito)}]`);
    await fechar(A, B);
  }

  if (roda(8)) { /* 8. "Colar progresso" com um código antigo e sincronizar: o estudo dos outros aparelhos não some. */
    N.usuario = 'ep-colar'; N.doc = P0(); N.trava = null; N.atraso = {}; N.semRede = {};
    const A = await aparelho(); await ate(A.sincronizou); await espera(5500);
    const codigo = JSON.stringify(Object.assign(copia(await A.ler()), { t: Date.now() })); // código copiado agora
    const B = await aparelho(); await ate(B.sincronizou); await espera(5500);
    await B.marcar('T:b1'); await ate(async () => tem(N.doc, 'T:b1')); await espera(5500);
    await A.marcar('T:a1'); await ate(async () => tem(N.doc, 'T:a1') && tem(N.doc, 'T:b1')); await espera(5500);
    await A.clicar('tab', { v: 'plano' }); await A.clicar('impabrir'); await A.p.fill('#imp-txt', codigo); await A.clicar('impok');
    await espera(3000); await espera(5500);
    await B.marcar('T:b2'); await ate(async () => tem(N.doc, 'T:b2')); await espera(5500);
    const n = N.doc, lb = await B.ler();
    ok(tem(n, 'T:b1') && tem(lb, 'T:b1') && tem(n, 'T:a1') && !A.erros.length && !B.erros.length,
      'colar um progresso antigo num aparelho e sincronizar: nada do que estava na nuvem e nos outros aparelhos é apagado' + ` [nuvem: ${Object.keys(n.feito)} | B: ${Object.keys(lb.feito)}]`);
    await fechar(A, B);
  }
};
