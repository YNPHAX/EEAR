/* Gravações simultâneas no link do curso no Claude (nuvem fictícia, em memória; nenhum serviço real). A nuvem do Claude
   não tem transação: cada aparelho lê, une e grava. A nuvem fictícia tem latência e a trava cooperativa da API real
   (doc.acquire: concede a um "holder" por ttlMs; ocupada, responde { acquired: false, expiresAt }). Confere que dois
   aparelhos marcando ao mesmo tempo não perdem nada, com e sem a trava, e que gravações de fora (um app antigo, sem a
   trava) são percebidas. Usado por testes/plataforma.test.js. */

module.exports = async function testarNuvemClaude({ b, srv, base, ok }) {
  console.log('\n== link do curso no Claude: gravações simultâneas (nuvem fictícia com latência e trava)');
  const N = { doc: null, trava: null, gravacoes: 0, atrasoGet: 120, atrasoSet: 700, semTrava: false, criaVazio: true, erroTrava: '', intruso: null, usuario: 'aluno-concorrente' };
  const LS = () => 'missao-eear-v1@claude:' + N.usuario, LS_BASE = () => 'missao-eear-v1-base@claude:' + N.usuario;
  const copia = x => (x == null ? x : JSON.parse(JSON.stringify(x)));
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const ate = async (f, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await f()) return true; await espera(150); } return false; };
  async function aparelho() {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } }), erros = [];
    await ctx.exposeFunction('__cCfg', () => ({ usuario: N.usuario, semTrava: N.semTrava, erroTrava: N.erroTrava }));
    await ctx.exposeFunction('__cGet', async () => { await espera(N.atrasoGet); return copia(N.doc); });
    await ctx.exposeFunction('__cSet', async o => { const x = copia(o); await espera(N.atrasoSet); N.doc = x; N.gravacoes++; if (N.intruso) { const f = N.intruso; N.intruso = null; N.doc = f(x); } return true; });
    await ctx.exposeFunction('__cAcquire', async (holder, ttl) => {
      await espera(40); const agora = Date.now(), t = N.trava;
      if (t && t.ate > agora && t.holder !== holder) return { acquired: false, expiresAt: new Date(t.ate).toISOString() };
      N.trava = { holder, ate: agora + Math.min(Math.max(ttl || 30000, 1000), 600000) };
      if (N.doc == null && N.criaVazio) N.doc = {}; // a API real pode criar o documento, vazio, ao conceder a trava
      return { acquired: true, version: 1, holder, expiresAt: new Date(N.trava.ate).toISOString() };
    });
    await ctx.addInitScript(() => {
      window.claude = { use: async k => {
        const cfg = await window.__cCfg();
        if (k === 'user') return { id: async () => cfg.usuario };
        return { doc: () => { const d = {
          get: async () => { const x = await window.__cGet(); return { exists: x != null, data: () => x }; },
          set: async o => { await window.__cSet(o); }
        }; if (cfg.erroTrava) d.acquire = async () => { const e = new Error('recusada'); e.code = cfg.erroTrava; throw e; }; else if (!cfg.semTrava) d.acquire = o => window.__cAcquire(o.holder, o.ttlMs); return d; } };
      } };
    });
    const p = await ctx.newPage(); p.on('pageerror', e => erros.push(e.message));
    const ler = k => p.evaluate(k => JSON.parse(localStorage.getItem(k)), k || LS());
    const clicar = (a, d) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d); document.body.appendChild(x); x.click(); x.remove(); }, [a, d || {}]);
    const marcar = k => clicar('marcar', { k }), plano = () => clicar('tab', { v: 'plano' });
    await p.goto(srv.url); await p.waitForTimeout(300);
    return { p, ctx, erros, ler, marcar, plano };
  }
  const D = new Date(), hj = D.getFullYear() + '-' + String(D.getMonth() + 1).padStart(2, '0') + '-' + String(D.getDate()).padStart(2, '0');
  const P0 = () => Object.assign(base({}), { t: Date.now() - 60000, act: { [hj]: 1 }, erros: { 'MAT03-2': 1 } });

  /* Dois aparelhos da mesma conta marcam tarefas diferentes ao mesmo tempo, em rodadas; depois abrem de novo. */
  async function rodadas(rotulo) {
    N.doc = P0(); N.trava = null; N.usuario = 'aluno-' + rotulo;
    const A = await aparelho(), B = await aparelho();
    await ate(async () => !!(await A.ler(LS_BASE())) && !!(await B.ler(LS_BASE())));
    const chaves = [];
    for (let i = 0; i < 4; i++) { chaves.push(`T:a${i}`, `T:b${i}`); await Promise.all([A.marcar(`T:a${i}`), B.marcar(`T:b${i}`)]); await espera(2600); }
    /* Cada aparelho recebe a nuvem ao abrir ou ao gravar: espera a nuvem ficar completa (até 40 s), reabre os dois e
       espera que eles a recebam. */
    const todas = s => s && s.feito && chaves.every(k => s.feito[k]);
    await ate(async () => todas(N.doc), 40000); await espera(1500);
    await A.p.reload(); await B.p.reload();
    await ate(async () => todas(await A.ler()) && todas(await B.ler()), 20000);
    const n = N.doc || {}, a = await A.ler(), bb = await B.ler();
    const falta = s => chaves.filter(k => !(s && s.feito && s.feito[k]));
    return { nuvem: falta(n), A: falta(a), B: falta(bb), erros: A.erros.concat(B.erros), da: A, db: B };
  }
  const resumo = r => ['nuvem', 'A', 'B'].filter(k => r[k].length).map(k => `${k} sem ${r[k].join(',')}`).join('; ');

  { // 1. com a trava (doc.acquire)
    const r = await rodadas('trava');
    ok(!r.nuvem.length && !r.A.length && !r.B.length && !r.erros.length, 'com a trava: 8 marcações feitas ao mesmo tempo em dois aparelhos ficam na nuvem e nos dois aparelhos' + (resumo(r) ? ' — ' + resumo(r) : '') + (r.erros[0] ? ' — erro: ' + r.erros[0] : ''));
    await r.da.ctx.close(); await r.db.ctx.close();
  }
  { // 2. sem a trava (contrato antigo da API): a gravação não é confiável, mas nada se perde e o aluno é avisado
    N.semTrava = true;
    const r = await rodadas('semtrava');
    await r.da.p.click('[data-a="tab"][data-v="plano"]');
    const aviso = await r.da.p.locator('#sync').innerText();
    ok(!r.nuvem.length && !r.A.length && !r.B.length && !r.erros.length, 'sem a trava: nenhuma das 8 marcações simultâneas se perde' + (resumo(r) ? ' — ' + resumo(r) : ''));
    ok(/ao mesmo tempo/.test(aviso), 'sem a trava: o aluno é avisado de que a sincronização com dois aparelhos abertos ao mesmo tempo não é garantida' + ` [aviso: ${aviso}]`);
    N.semTrava = false;
    await r.da.ctx.close(); await r.db.ctx.close();
  }
  { // 3. a API recusa a trava (por exemplo, sem permissão): segue sem trava, sem erro e sem perder nada
    N.erroTrava = 'not_granted'; N.doc = P0(); N.trava = null; N.usuario = 'aluno-recusa';
    const A = await aparelho(); await A.marcar('T:recusa'); await ate(async () => N.doc && N.doc.feito && N.doc.feito['T:recusa']);
    await A.plano();
    ok(!!(N.doc.feito && N.doc.feito['T:recusa']) && !A.erros.length && /ao mesmo tempo/.test(await A.p.locator('#sync').innerText()) && !(await A.ler(LS_BASE())), 'trava recusada pela nuvem: o progresso chega à conta sem a trava, sem base e com o aviso ao aluno');
    N.erroTrava = ''; await A.ctx.close();
  }
  { // 4. conta nova: a trava cria o documento vazio antes da primeira gravação
    N.doc = null; N.trava = null; N.criaVazio = true; N.usuario = 'aluno-novo';
    const A = await aparelho(); await A.marcar('T:primeira');
    await ate(async () => N.doc && N.doc.v === 1 && N.doc.feito && N.doc.feito['T:primeira']);
    await A.plano();
    ok(!!(N.doc && N.doc.v === 1 && N.doc.feito['T:primeira']) && !/versão mais nova/.test(await A.p.locator('#sync').innerText()), 'conta nova: o documento vazio criado pela trava é tratado como conta sem progresso, e não como versão futura');
    await A.ctx.close();
  }
  { // 5. a trava está com outro aparelho: este espera ela vencer e grava depois, sem erro
    N.doc = P0(); N.usuario = 'aluno-espera'; const A = await aparelho(); await espera(1500);
    N.trava = { holder: 'outro-aparelho', ate: Date.now() + 4000 }; const g0 = N.gravacoes;
    await A.marcar('T:depois'); await espera(2500);
    const antes = !!(N.doc.feito && N.doc.feito['T:depois']), g1 = N.gravacoes;
    await ate(async () => N.doc.feito && N.doc.feito['T:depois'], 15000);
    ok(!antes && g1 === g0 && !!N.doc.feito['T:depois'] && !A.erros.length, 'trava ocupada por outro aparelho: nada é gravado enquanto ela vale; a marcação chega depois que ela vence');
    await A.ctx.close();
  }
  { // 6. um app antigo, sem a trava, grava por cima logo depois (com o que ele leu antes): a conferência percebe e refaz
    N.doc = P0(); N.trava = null; N.usuario = 'aluno-intruso'; const A = await aparelho(); await espera(1500);
    const velho = copia(N.doc);
    N.intruso = () => Object.assign(copia(velho), { t: Date.now(), feito: Object.assign({}, velho.feito, { 'T:antigo': true }) });
    await A.marcar('T:novo');
    await ate(async () => N.doc.feito && N.doc.feito['T:novo'] && N.doc.feito['T:antigo'], 20000);
    await A.p.reload(); // a trava anterior deste aparelho pode estar valendo ainda (até 5 s)
    await ate(async () => { const x = await A.ler(), y = await A.ler(LS_BASE()); return x.feito['T:antigo'] && y && y.st.feito['T:novo']; }, 15000);
    const a = await A.ler(), base0 = await A.ler(LS_BASE());
    ok(!!(N.doc.feito['T:novo'] && N.doc.feito['T:antigo'] && a.feito['T:novo'] && a.feito['T:antigo']) && !!(base0 && base0.st.feito['T:novo']), 'gravação de um app antigo por cima: a conferência percebe, a união é refeita e a marcação deste aparelho e a do outro ficam');
    await A.ctx.close();
  }
};
