/* Barreira do caminho novo na nuvem do curso no Claude (progresso2/<id>), com uma nuvem fictícia em memória que segue
   as regras propostas em auditoria/integracao-segura.md, seção 4 (contas fictícias; nenhum serviço real): cada aluno lê
   só os próprios documentos; grava só progresso2/<o próprio id>; progresso/<id> (o caminho das versões antigas) fica só
   para leitura, salvo no "período de reversão" (regras antigas de volta). Confere: migração do caminho antigo sem
   apagar nada e sem tocar nele; isolamento entre contas; falhas e nova tentativa; desmarcações depois da migração não
   voltam; reversão (o caminho antigo muda depois da migração) é unida de novo, uma vez; dois aparelhos migrando juntos.
   Usado por testes/plataforma.test.js. */
const { REGRAS, pode } = require('./regras-nuvem.js');
module.exports = async function testarProgresso2({ b, srv, ok }) {
  console.log('\n== caminho novo (progresso2) e migração do caminho antigo (nuvem fictícia com as regras propostas)');
  /* regras: o conjunto de web/regras-claude.json em vigor ("propostas", "reversao" ou "hoje"); os alunos têm nível interact. */
  const N = { docs: {}, travas: {}, regras: 'propostas', falhaGetAntigo: 0, falhaSet: 0, gravacoesAntigo: 0, recusadas: 0 };
  const copia = x => (x == null ? x : JSON.parse(JSON.stringify(x)));
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const ate = async (f, ms = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await f()) return true; await espera(150); } return false; };
  const hj = new Date().toISOString().slice(0, 10);
  const P = feito => ({ v: 1, t: Date.now() - 60000, cfg: { nome: 'Aluna', alvo: 'cfs2-2027', prova: '2026-11-22', inicio: hj, horas: 3, dias: [0, 1, 2, 3, 4, 5, 6], excl: [] },
    mod: {}, fc: {}, erros: { 'MAT03-2': 1 }, sims: [], feito: Object.assign({ 'T:base': true }, feito), act: {}, aula: {}, ap: {}, diag: null, ativo: null, ult: null, ultAula: null });
  const tem = (s, k) => !!(s && s.feito && s.feito[k]);
  /* Permissões pelo modelo das regras do serviço (testes/regras-nuvem.js), com a regra padrão da raiz incluída. */
  const podeLer = (u, p) => pode(REGRAS[N.regras], 'interact', u, 'read', p);
  const podeGravar = (u, p) => pode(REGRAS[N.regras], 'interact', u, 'write', p);
  async function aparelho(usuario, semente) {
    const ctx = await b.newContext({ serviceWorkers: 'block' }), erros = [];
    await ctx.exposeFunction('__pU', () => usuario);
    await ctx.exposeFunction('__pGet', async p => {
      await espera(60 + Math.random() * 100);
      if (p.startsWith('progresso/') && N.falhaGetAntigo > 0) { N.falhaGetAntigo--; return { erro: 'unavailable' }; }
      return { x: podeLer(usuario, p) ? copia(N.docs[p]) : null };
    });
    await ctx.exposeFunction('__pSet', async (p, o) => {
      await espera(120 + Math.random() * 150);
      if (!podeGravar(usuario, p)) { N.recusadas++; return 'invalid_argument'; }
      if (N.falhaSet > 0) { N.falhaSet--; return 'unavailable'; }
      if (p.startsWith('progresso/')) N.gravacoesAntigo++;
      N.docs[p] = copia(o); return '';
    });
    await ctx.exposeFunction('__pAcq', async (p, h, ttl) => { await espera(30); const ag = Date.now(), t = N.travas[p]; if (t && t.ate > ag && t.h !== h) return { acquired: false, expiresAt: new Date(t.ate).toISOString() }; N.travas[p] = { h, ate: ag + ttl }; return { acquired: true, holder: h, expiresAt: new Date(ag + ttl).toISOString() }; });
    await ctx.addInitScript(sem => {
      if (sem && !sessionStorage.getItem('semeado')) { localStorage.setItem(sem.k, sem.v); sessionStorage.setItem('semeado', '1'); }
      const erro = c => { const e = new Error(c); e.code = c; return e; };
      window.claude = { use: async k => {
        const u = await window.__pU();
        if (k === 'user') return { id: async () => u };
        return { doc: p => ({
          get: async () => { const r = await window.__pGet(p); if (r.erro) throw erro(r.erro); return { exists: r.x != null, data: () => r.x }; },
          set: async o => { const r = await window.__pSet(p, o); if (r) throw erro(r); },
          acquire: async o => window.__pAcq(p, o.holder, o.ttlMs)
        }) };
      } };
    }, semente ? { k: 'missao-eear-v1@claude:' + usuario, v: JSON.stringify(semente) } : null);
    const d = { ctx, erros };
    d.abrir = async () => { d.p = await ctx.newPage(); d.p.on('pageerror', e => erros.push(e.message)); await d.p.goto(srv.url); };
    d.ler = () => d.p.evaluate(k => JSON.parse(localStorage.getItem(k)), 'missao-eear-v1@claude:' + usuario);
    d.marcar = k => d.p.evaluate(k => { const x = document.createElement('button'); x.dataset.a = 'marcar'; x.dataset.k = k; document.body.appendChild(x); x.click(); x.remove(); }, k);
    d.reabrir = async () => { await d.p.close(); await d.abrir(); };
    await d.abrir();
    return d;
  }
  const reiniciar = () => { N.docs = {}; N.travas = {}; N.regras = 'propostas'; N.falhaGetAntigo = 0; N.falhaSet = 0; N.gravacoesAntigo = 0; N.recusadas = 0; };
  const fechar = async (...ds) => { for (const d of ds) await d.ctx.close(); };
  const novo = u => N.docs['progresso2/' + u], antigo = u => N.docs['progresso/' + u];

  { /* 1. Migração: o caminho antigo tem estudo que este aparelho não tem, e o aparelho tem estudo que a nuvem não tem. */
    reiniciar(); N.docs['progresso/ana'] = P({ 'T:velho1': true, 'T:velho2': true }); const antes = JSON.stringify(antigo('ana'));
    const A = await aparelho('ana', Object.assign(P({ 'T:local': true }), { t: Date.now() }));
    await ate(async () => ['T:velho1', 'T:velho2', 'T:local'].every(k => tem(novo('ana'), k)));
    await espera(6000); const l = await A.ler();
    ok(['T:velho1', 'T:velho2', 'T:local', 'T:base'].every(k => tem(novo('ana'), k) && tem(l, k)) && JSON.stringify(antigo('ana')) === antes && N.gravacoesAntigo === 0 && !!(novo('ana').cfg.migV1) && !A.erros.length,
      'migração: o caminho novo recebe a união do antigo com o aparelho, sem apagar nada; o caminho antigo não é tocado' + ` [novo: ${Object.keys((novo('ana') || {}).feito || {})}]`);
    await fechar(A);
  }

  { /* 2. Isolamento: duas contas no mesmo período; nenhuma lê ou grava o documento da outra. */
    reiniciar(); N.docs['progresso/bia'] = P({ 'T:bia-velho': true }); N.docs['progresso2/bia'] = P({ 'T:bia': true }); const biaAntes = JSON.stringify([antigo('bia'), novo('bia')]);
    N.docs['progresso/ana'] = P({ 'T:ana-velho': true });
    const A = await aparelho('ana'); await ate(async () => tem(novo('ana'), 'T:ana-velho')); await A.marcar('T:ana1'); await ate(async () => tem(novo('ana'), 'T:ana1')); await espera(3000);
    const la = await A.ler();
    ok(JSON.stringify([antigo('bia'), novo('bia')]) === biaAntes && !tem(la, 'T:bia') && !tem(la, 'T:bia-velho') && !tem(novo('ana'), 'T:bia') && N.recusadas === 0 && !A.erros.length,
      'isolamento: a conta ana não lê nem grava nada da conta bia (e o app nunca tenta gravar fora do próprio caminho novo)');
    await fechar(A);
  }

  { /* 3. Falhas: a leitura do caminho antigo falha na primeira abertura e as gravações falham algumas vezes; nada se
       perde, o caminho antigo continua igual e a migração acontece ao abrir de novo. */
    reiniciar(); N.docs['progresso/ana'] = P({ 'T:velho1': true }); const antes = JSON.stringify(antigo('ana'));
    N.falhaGetAntigo = 1; N.falhaSet = 3;
    const A = await aparelho('ana'); await espera(9000); await A.marcar('T:a1'); await ate(async () => tem(novo('ana'), 'T:a1')); await espera(3000);
    const semMigrar = !tem(novo('ana'), 'T:velho1');
    await A.reabrir(); await ate(async () => tem(novo('ana'), 'T:velho1')); await espera(3000);
    ok(semMigrar && tem(novo('ana'), 'T:velho1') && tem(novo('ana'), 'T:a1') && tem(await A.ler(), 'T:a1') && JSON.stringify(antigo('ana')) === antes && !A.erros.length,
      'falha ao ler o caminho antigo e gravações recusadas por falta de rede: nada se perde e a migração acontece ao abrir de novo');
    await fechar(A);
  }

  { /* 4. Desmarcação legítima depois da migração não volta do caminho antigo (que não mudou). */
    reiniciar(); N.docs['progresso/ana'] = P({ 'T:velho1': true });
    const A = await aparelho('ana'); await ate(async () => tem(novo('ana'), 'T:velho1')); await espera(6000);
    const B = await aparelho('ana'); await ate(async () => tem(await B.ler(), 'T:velho1')); await espera(6000);
    await B.marcar('T:velho1'); await ate(async () => !tem(novo('ana'), 'T:velho1')); await espera(6000); // B desmarca
    await A.reabrir(); await espera(9000); await A.marcar('T:a1'); await ate(async () => tem(novo('ana'), 'T:a1')); await espera(3000);
    await B.reabrir(); await espera(9000);
    ok(!tem(novo('ana'), 'T:velho1') && !tem(await A.ler(), 'T:velho1') && !tem(await B.ler(), 'T:velho1') && !A.erros.length && !B.erros.length,
      'desmarcar depois da migração: a marcação não volta do caminho antigo ao reabrir os aparelhos');
    await fechar(A, B);
  }

  { /* 5. Reversão: depois da migração, a versão antiga volta ao ar (com as regras antigas) e grava no caminho antigo;
       quando a versão nova volta, o que foi gravado na reversão é unido, uma vez. */
    reiniciar(); N.docs['progresso/ana'] = P({ 'T:velho1': true });
    const A = await aparelho('ana'); await ate(async () => tem(novo('ana'), 'T:velho1')); await espera(6000);
    N.regras = 'reversao'; // a versão anterior volta ao ar com as regras de reversão e grava no caminho antigo
    if (podeGravar('ana', 'progresso/ana')) N.docs['progresso/ana'] = Object.assign(copia(antigo('ana')), { t: Date.now(), feito: Object.assign({}, antigo('ana').feito, { 'T:reversao': true }) });
    N.regras = 'propostas';
    await A.reabrir(); await ate(async () => tem(novo('ana'), 'T:reversao')); await espera(6000);
    await A.marcar('T:reversao'); await ate(async () => !tem(novo('ana'), 'T:reversao')); await espera(6000); // desmarca depois de voltar
    await A.reabrir(); await espera(9000);
    ok(tem(novo('ana'), 'T:velho1') && !tem(novo('ana'), 'T:reversao') && !tem(await A.ler(), 'T:reversao') && !A.erros.length,
      'reversão: o estudo gravado no caminho antigo durante a reversão é unido ao voltar, uma vez (depois de desmarcado, não volta)');
    await fechar(A);
  }

  { /* 6. Dois aparelhos migram ao mesmo tempo, cada um com estudo próprio. */
    reiniciar(); N.docs['progresso/ana'] = P({ 'T:velho1': true });
    const [A, B] = await Promise.all([aparelho('ana', Object.assign(P({ 'T:a': true }), { t: Date.now() })), aparelho('ana', Object.assign(P({ 'T:b': true }), { t: Date.now() }))]);
    const todas = ['T:velho1', 'T:a', 'T:b', 'T:base'];
    await ate(async () => todas.every(k => tem(novo('ana'), k)), 40000); await A.reabrir(); await B.reabrir();
    await ate(async () => { const a = await A.ler(), c = await B.ler(); return todas.every(k => tem(a, k) && tem(c, k)); }, 30000);
    const la = await A.ler(), lb = await B.ler();
    ok(todas.every(k => tem(novo('ana'), k) && tem(la, k) && tem(lb, k)) && N.gravacoesAntigo === 0 && !A.erros.length && !B.erros.length,
      'dois aparelhos migrando ao mesmo tempo: nada se perde e o caminho antigo não é gravado');
    await fechar(A, B);
  }

  { /* 7. Segurança na reversão: com as regras de hoje (sem regra para progresso2), qualquer aluno lê e grava o progresso2
       de outra conta (vazamento confirmado no serviço real); com as regras de reversão, não, e o app continua sincronizando
       só o próprio caminho novo enquanto o antigo volta a ser gravável. */
    reiniciar(); N.docs['progresso/ana'] = P({ 'T:velho1': true }); N.docs['progresso2/bia'] = P({ 'T:bia-privado': true }); const biaAntes = JSON.stringify(novo('bia'));
    N.regras = 'hoje'; const vaza = podeLer('ana', 'progresso2/bia') && podeGravar('ana', 'progresso2/bia');
    N.regras = 'reversao'; const isola = !podeLer('ana', 'progresso2/bia') && !podeGravar('ana', 'progresso2/bia') && podeGravar('ana', 'progresso/ana');
    const A = await aparelho('ana'); await ate(async () => tem(novo('ana'), 'T:velho1')); await A.marcar('T:a1'); await ate(async () => tem(novo('ana'), 'T:a1')); await espera(3000);
    const la = await A.ler();
    ok(vaza && isola && tem(novo('ana'), 'T:a1') && !tem(la, 'T:bia-privado') && JSON.stringify(novo('bia')) === biaAntes && N.gravacoesAntigo === 0 && !A.erros.length,
      'reversão: com as regras de hoje o progresso2 de outra conta vaza (reproduzido); com as regras de reversão fica isolado, e o app segue só no próprio caminho novo');
    await fechar(A);
  }
};
