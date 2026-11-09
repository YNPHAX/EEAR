/* Testes da sincronização entre aparelhos com uma nuvem fictícia, em memória (nenhum serviço real). Dois aparelhos
   (contextos separados do navegador) estudam offline e depois sincronizam; confere a união por tipo de dado, o "Zerar
   progresso", a nuvem de uma versão futura, falhas de rede e a repetição. Usado por testes/plataforma.test.js. */

module.exports = async function testarSincronia({ b, srv, base, ok }) {
  console.log('\n== sincronização entre aparelhos (nuvem fictícia)');
  const nuvem = { doc: null, gravacoes: 0, offline: {}, falhas: 0, usuario: 'aluno-ficticio' };
  /* Chaves locais da conta em uso (cada conta tem as suas; veja testes/contas.js). */
  const LS = () => 'missao-eear-v1@claude:' + nuvem.usuario, LS_BASE = () => 'missao-eear-v1-base@claude:' + nuvem.usuario, LS_REC = () => 'missao-eear-v1-recuperar@claude:' + nuvem.usuario;
  const copia = x => JSON.parse(JSON.stringify(x));
  const esperar = async (f, ms = 9000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await f()) return true; await new Promise(r => setTimeout(r, 150)); } return false; };
  async function aparelho(nome) {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } }), erros = [];
    await ctx.exposeFunction('__nuvemUsuario', () => nuvem.usuario);
    await ctx.exposeFunction('__nuvemGet', () => (nuvem.offline[nome] ? { off: true } : { doc: nuvem.doc ? copia(nuvem.doc) : null }));
    await ctx.exposeFunction('__nuvemSet', o => { if (nuvem.offline[nome]) return { off: true }; if (nuvem.falhas > 0) { nuvem.falhas--; return { off: true }; } nuvem.doc = copia(o); nuvem.gravacoes++; return {}; });
    await ctx.addInitScript(() => {
      const fora = () => { const e = new Error('sem rede'); e.code = 'unavailable'; throw e; };
      window.claude = { use: async k => (k === 'user' ? { id: () => window.__nuvemUsuario() } : { doc: () => ({
        get: async () => { const r = await window.__nuvemGet(); if (r.off) fora(); return { exists: !!r.doc, data: () => r.doc }; },
        set: async o => { const r = await window.__nuvemSet(o); if (r.off) fora(); },
        // trava da API real (doc.acquire); aqui sempre concedida: a disputa pela trava fica em testes/nuvem-claude.js
        acquire: async o => { const r = await window.__nuvemGet(); if (r.off) fora(); return { acquired: true, holder: o.holder, expiresAt: new Date(Date.now() + (o.ttlMs || 30000)).toISOString() }; }
      }) }) };
    });
    const p = await ctx.newPage(); p.on('pageerror', e => erros.push(e.message));
    const ler = k => p.evaluate(k => JSON.parse(localStorage.getItem(k)), k || LS());
    /* "Estudar": altera o progresso como o app faria e reabre o app (a abertura sincroniza). */
    const estudar = async f => { const s = await ler(); f(s); s.t = Date.now(); await p.evaluate(([k, x]) => localStorage.setItem(k, JSON.stringify(x)), [LS(), s]); await p.reload(); await p.waitForTimeout(300); };
    return { p, ctx, erros, ler, estudar, abrir: async estado => { await p.goto(srv.url); if (estado) { await p.evaluate(([k, x]) => localStorage.setItem(k, JSON.stringify(x)), [LS(), estado]); await p.reload(); } await p.waitForTimeout(400); } };
  }
  const D = new Date(), hj = D.getFullYear() + '-' + String(D.getMonth() + 1).padStart(2, '0') + '-' + String(D.getDate()).padStart(2, '0');
  const P0 = () => Object.assign(base({}), { t: Date.now() - 60000, act: { [hj]: 1 }, erros: { 'MAT03-2': 1, 'POR01-3': 2 } });

  { // 1. dois aparelhos estudam offline coisas diferentes
    nuvem.doc = P0(); nuvem.gravacoes = 0; nuvem.offline = {};
    const A = await aparelho('A'), B = await aparelho('B');
    await A.abrir(copia(nuvem.doc)); await B.abrir(copia(nuvem.doc));
    const comBase = !!(await A.ler(LS_BASE())) && !!(await B.ler(LS_BASE()));
    nuvem.offline = { A: true, B: true };
    await A.estudar(s => { s.mod.POR02 = { lido: hj, best: 0.9, tent: 1, ok: hj }; s.fc['POR02~0'] = [1, 99999]; s.act[hj] += 3; s.sims.push({ d: hj, tipo: 'materia', mat: 'por', r: { por: [20, 24] }, min: 40 }); delete s.erros['MAT03-2']; });
    await B.estudar(s => { s.mod.MAT01 = { lido: hj, best: 0.8, tent: 1, ok: hj }; s.fc['MAT01~0'] = [2, 99998]; s.act[hj] += 2; s.sims.push({ d: hj, tipo: 'materia', mat: 'mat', r: { mat: [15, 24] }, min: 50 }); s.erros['FIS01-1'] = 1; s.feito['T:1'] = true; });
    nuvem.offline = {};
    await esperar(async () => nuvem.doc.mod.POR02 && nuvem.doc.mod.MAT01);
    await A.p.reload(); await B.p.reload(); await A.p.waitForTimeout(500); await B.p.waitForTimeout(300);
    const a = await A.ler(), bb = await B.ler(), n = nuvem.doc;
    const tudo = s => !!(s.mod.POR01 && s.mod.POR02 && s.mod.MAT01 && s.fc['POR02~0'] && s.fc['MAT01~0'] && s.fc['POR01~0'] && s.act[hj] === 6 && s.sims.length === 3 && !s.erros['MAT03-2'] && s.erros['FIS01-1'] === 1 && s.erros['POR01-3'] === 2 && s.feito['T:1']);
    ok(comBase && tudo(a) && tudo(bb) && tudo(n) && !A.erros.length && !B.erros.length, 'estudo offline nos dois aparelhos: aulas, cartões, simulados e atividade dos dois ficam; o erro corrigido sai; os dois aparelhos e a nuvem terminam iguais');
    ok(JSON.stringify([a.mod, a.fc, a.sims, a.erros, a.act]) === JSON.stringify([bb.mod, bb.fc, bb.sims, bb.erros, bb.act]), 'os dois aparelhos convergem para o mesmo progresso' + ['mod', 'fc', 'sims', 'erros', 'act'].filter(k => JSON.stringify(a[k]) !== JSON.stringify(bb[k])).map(k => ` — ${k}: ${JSON.stringify(a[k]).slice(0, 160)} ≠ ${JSON.stringify(bb[k]).slice(0, 160)}`).join(''));
    const antes = nuvem.gravacoes; await A.p.reload(); await B.p.reload(); await A.p.waitForTimeout(500);
    ok(nuvem.gravacoes === antes, `sincronizar de novo sem mudanças não grava nada na nuvem${nuvem.gravacoes - antes ? ` (${nuvem.gravacoes - antes} gravações)` : ''}`);

    // 2. o mesmo cartão, a mesma aula e o mesmo erro mexidos nos dois aparelhos
    nuvem.offline = { A: true, B: true };
    await A.estudar(s => { s.fc['POR01~0'] = [3, 88888]; s.mod.POR01.tent += 1; s.mod.POR01.best = 0.95; delete s.erros['POR01-3']; s.sims.push({ d: hj, tipo: 'diag', r: { por: [5, 10] }, min: 30 }); });
    await new Promise(r => setTimeout(r, 30));
    await B.estudar(s => { s.fc['POR01~0'] = [0, 77777]; s.mod.POR01.tent += 1; s.erros['POR01-3'] += 1; s.sims.push({ d: hj, tipo: 'diag', r: { por: [5, 10] }, min: 30 }); });
    nuvem.offline = {};
    await esperar(async () => nuvem.doc.mod.POR01.tent >= 4);
    await A.p.reload(); await A.p.waitForTimeout(500);
    const z = await A.ler();
    ok(z.mod.POR01.tent === 4 && z.mod.POR01.best === 0.95, 'mesma aula nos dois: as tentativas somam (2 + 1 + 1) e vale a melhor nota');
    ok(JSON.stringify(z.fc['POR01~0']) === JSON.stringify([0, 77777]), 'mesmo cartão nos dois: vale a revisão gravada por último');
    ok(z.erros['POR01-3'] === 3, 'erro corrigido num aparelho e errado de novo no outro continua no caderno');
    ok(z.sims.filter(x => x.tipo === 'diag').length === 2, 'dois simulados iguais feitos em aparelhos diferentes contam como dois');
    await A.ctx.close(); await B.ctx.close();
  }

  { // 3. "Zerar progresso" num aparelho; o outro estudou offline uma aula nova depois da última sincronização
    nuvem.doc = P0(); nuvem.offline = {};
    const A = await aparelho('A'), B = await aparelho('B');
    await A.abrir(copia(nuvem.doc)); await B.abrir(copia(nuvem.doc));
    nuvem.offline = { B: true };
    await A.p.click('[data-a="tab"][data-v="plano"]'); await A.p.click('[data-a="zerar"]'); await A.p.click('[data-a="zerarok"]');
    await esperar(async () => nuvem.doc.cfg.certsZ > 0);
    await B.estudar(s => { s.mod.MAT02 = { lido: hj, best: 0.7, tent: 1 }; });
    nuvem.offline = {};
    await esperar(async () => !!nuvem.doc.mod.MAT02);
    const n = nuvem.doc;
    ok(!n.mod.POR01 && !n.fc['POR01~0'] && !n.erros['MAT03-2'] && !!n.mod.MAT02 && n.cfg.certsZ > 0, 'zerar num aparelho apaga o que existia antes; a aula estudada offline no outro depois disso fica' + (n.mod.POR01 || !n.mod.MAT02 ? ` [aulas na nuvem: ${Object.keys(n.mod)}]` : ''));
    await A.ctx.close(); await B.ctx.close();
  }

  { // 4. aparelho sem base, com estudo mais novo que um "Zerar" feito em outro aparelho: vira cópia de recuperação
    const zerou = Date.now() - 20000;
    nuvem.doc = Object.assign(base({ certs: [], certsZ: zerou }), { t: zerou, mod: {}, fc: {}, erros: {}, sims: [] }); nuvem.offline = {};
    const A = await aparelho('A'); const local = Object.assign(P0(), { t: Date.now() });
    nuvem.offline = { A: true }; await A.abrir(local); // aparelho que nunca sincronizou: sem base
    await A.p.evaluate(k => localStorage.removeItem(k), LS_BASE()); nuvem.offline = {}; await A.p.reload(); await A.p.waitForTimeout(500);
    const st = await A.ler(), rec = await A.ler(LS_REC());
    ok(!st.mod.POR01 && rec && rec.mod.POR01 && JSON.stringify(rec.erros) === JSON.stringify(local.erros) && await A.p.locator('[data-a="reccopiar"]').count() === 1, 'sem como separar o que veio antes do "Zerar": o progresso deste aparelho vira cópia de recuperação, oferecida na tela Hoje' + (rec ? '' : ' [sem cópia]'));
    await A.ctx.close();
  }

  { // 5. nuvem com progresso de uma versão futura do app
    nuvem.doc = { v: 2, t: Date.now() + 1e6, formatoNovo: true }; nuvem.gravacoes = 0; nuvem.offline = {};
    const A = await aparelho('A'); const local = P0(); local.t = Date.now();
    await A.abrir(local);
    const st = await A.ler(); await A.p.click('[data-a="tab"][data-v="plano"]');
    ok(nuvem.doc.v === 2 && nuvem.gravacoes === 0 && JSON.stringify(st.mod) === JSON.stringify(local.mod) && /versão mais nova/.test(await A.p.locator('#sync').innerText()), 'nuvem de uma versão mais nova: nada é gravado por cima, o progresso local fica e o aluno é avisado');
    await A.ctx.close();
  }

  { // 7. outra conta entra no mesmo aparelho: ela vê só o próprio progresso; o da conta anterior fica guardado à parte
    nuvem.doc = P0(); nuvem.offline = {}; nuvem.usuario = 'conta-a';
    const A = await aparelho('A'); await A.abrir(copia(nuvem.doc));
    const cacheA = await A.ler(), baseA = await A.ler(LS_BASE());
    nuvem.usuario = 'conta-b'; nuvem.doc = Object.assign(base({}), { t: Date.now(), mod: { MAT05: { lido: hj, best: 0.5, tent: 1 } }, fc: {}, erros: {}, sims: [] });
    await A.p.reload(); await A.p.waitForTimeout(600);
    const st = await A.ler(), aindaA = await A.p.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1@claude:conta-a')));
    ok(baseA && baseA.conta === 'claude:conta-a' && !!st.mod.MAT05 && !st.mod.POR01 && !st.erros['MAT03-2'] && JSON.stringify(aindaA) === JSON.stringify(cacheA) && !nuvem.doc.mod.POR01, 'outra conta no mesmo aparelho: vê só o próprio progresso, nada da conta anterior vai para a nuvem dela, e o da conta anterior fica intacto à parte');
    nuvem.usuario = 'aluno-ficticio';
    await A.ctx.close();
  }

  { // 6. falhas de rede: a gravação tenta de novo e não perde nada
    nuvem.doc = P0(); nuvem.offline = {};
    const A = await aparelho('A'); await A.abrir(copia(nuvem.doc));
    nuvem.falhas = 2;
    await A.estudar(s => { s.mod.FIS01 = { lido: hj, best: 1, tent: 1, ok: hj }; });
    const chegou = await esperar(async () => !!nuvem.doc.mod.FIS01, 15000);
    ok(chegou && !!(await A.ler()).mod.FIS01 && !A.erros.length, 'duas gravações falham por falta de rede: a terceira chega e o progresso local fica intacto');
    await A.ctx.close();
  }
};
