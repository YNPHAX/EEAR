/* Exclusão do progresso na nuvem do curso no Claude, a pedido do aluno, com uma nuvem fictícia em memória (contas
   fictícias; nenhum serviço real). A nuvem guarda um documento por conta, como as regras do curso (cada aluno só grava
   progresso/<o próprio id>), com latência e a trava da API (doc.acquire). Confere: confirmação explícita; a outra conta
   intacta; falha ao gravar e conferência que não bate; outro aparelho da mesma conta não restaura sozinho; reabrir não
   restaura; versão antiga que regrava às cegas é percebida; "Enviar de novo" só a pedido; apagar a última cópia local.
   Usado por testes/plataforma.test.js. */
module.exports = async function testarExclusaoNuvem({ b, srv, base, ok }) {
  console.log('\n== apagar o progresso da nuvem do curso no Claude (nuvem fictícia, contas fictícias)');
  const N = { docs: {}, travas: {}, usuario: 'ana', falhaSet: '', intruso: null };
  const copia = x => (x == null ? x : JSON.parse(JSON.stringify(x)));
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const ate = async (f, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await f()) return true; await espera(150); } return false; };
  const LS = u => 'missao-eear-v1@claude:' + u;
  async function aparelho(usuario) {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } }), erros = [];
    await ctx.exposeFunction('__u', () => usuario);
    await ctx.exposeFunction('__g', async u => { await espera(60); return copia(N.docs[u]); });
    await ctx.exposeFunction('__s', async (u, o) => {
      await espera(200);
      if (u !== usuario) return 'permission-denied'; // regra do curso: cada aluno só grava o próprio documento
      if (N.falhaSet) return N.falhaSet;
      N.docs[u] = copia(o);
      if (N.intruso) { const f = N.intruso; N.intruso = null; N.docs[u] = f(copia(o)); }
      return '';
    });
    await ctx.exposeFunction('__a', async (u, h, ttl) => { const t = N.travas[u], ag = Date.now(); if (t && t.ate > ag && t.h !== h) return { acquired: false, expiresAt: new Date(t.ate).toISOString() }; N.travas[u] = { h, ate: ag + ttl }; return { acquired: true, holder: h, expiresAt: new Date(ag + ttl).toISOString() }; });
    await ctx.addInitScript(() => {
      window.claude = { use: async k => {
        const u = await window.__u();
        if (k === 'user') return { id: async () => u };
        return { doc: caminho => { const dono = caminho.split('/')[1]; return {
          get: async () => { const x = await window.__g(dono); return { exists: x != null, data: () => x }; },
          set: async o => { const r = await window.__s(dono, o); if (r) { const e = new Error(r); e.code = r; throw e; } },
          acquire: o => window.__a(dono, o.holder, o.ttlMs)
        }; } };
      } };
    });
    const p = await ctx.newPage(); p.on('pageerror', e => erros.push(e.message));
    const clicar = (a, d) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d || {}); document.body.appendChild(x); x.click(); x.remove(); }, [a, d || {}]);
    const ler = () => p.evaluate(k => JSON.parse(localStorage.getItem(k)), LS(usuario));
    const tela = () => p.locator('main').innerText();
    const dados = async () => { await clicar('tab', { v: 'plano' }); await p.waitForTimeout(150); };
    const apagar = async texto => { await dados(); await clicar('nuvemapagar'); await p.waitForTimeout(100); await p.fill('#nuvem-confirma', texto); await clicar('nuvemapagarok'); };
    await p.goto(srv.url); await p.waitForTimeout(1200);
    return { p, ctx, erros, clicar, ler, tela, dados, apagar };
  }
  const P = nome => Object.assign(base({ nome }), { t: Date.now() - 60000, feito: { 'T:base': true } });
  N.docs.ana = P('Ana'); N.docs.bia = P('Bia'); const biaAntes = JSON.stringify(N.docs.bia);

  // 1. confirmação explícita; a exclusão grava só a marca; a cópia deste aparelho e a outra conta ficam
  const A = await aparelho('ana'); await A.clicar('marcar', { k: 'T:ana1' });
  await ate(async () => N.docs.ana.feito && N.docs.ana.feito['T:ana1']); await espera(5500);
  await A.apagar('apagar'); await A.p.waitForTimeout(600);
  const recusou = N.docs.ana.v === 1 && /Digite APAGAR/.test(await A.tela());
  await A.apagar('APAGAR'); await ate(async () => N.docs.ana && N.docs.ana.apagado, 20000); await A.p.waitForTimeout(500);
  const marca = N.docs.ana, localA = await A.ler();
  ok(recusou && marca.v === 2 && !!marca.apagado && !marca.mod && !marca.feito && !!localA.feito['T:ana1'] && /foi apagado da nuvem/.test(await A.tela()) && JSON.stringify(N.docs.bia) === biaAntes && !A.erros.length,
    'apagar da nuvem: sem "APAGAR" nada acontece; com ele, a nuvem fica só com a marca de exclusão (sem progresso), a cópia deste aparelho fica e a outra conta não é tocada');
  await A.clicar('marcar', { k: 'T:depois' }); await espera(3000);
  ok(!!N.docs.ana.apagado && !N.docs.ana.feito, 'depois de apagar, o que o aluno estuda neste aparelho não volta para a nuvem');

  // 2. reabrir este aparelho não restaura; outro aparelho da mesma conta, com cópia local, também não
  await A.p.reload(); await A.p.waitForTimeout(2000);
  const B = await aparelho('ana'); await B.p.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [LS('ana'), Object.assign(P('Ana'), { t: Date.now(), feito: { 'T:base': true, 'T:aparelhoB': true } })]);
  await B.p.reload(); await B.dados(); // B espera a trava que A abriu ao reabrir
  await ate(async () => /foi apagado da nuvem/.test(await B.tela()), 20000);
  const telaB = await B.tela(), localB = await B.ler();
  ok(!!N.docs.ana.apagado && !N.docs.ana.feito && localB.feito['T:aparelhoB'] && /foi apagado da nuvem/.test(telaB) && /Enviar de novo/.test(telaB) && !B.erros.length,
    'reabrir este aparelho ou abrir outro aparelho da mesma conta não restaura a nuvem; a cópia local do outro aparelho fica, com a opção de enviar de novo');

  // 3. versão antiga, aberta antes, regrava às cegas: este aparelho percebe, avisa e não une; "Apagar de novo" funciona.
  // B fecha antes: um aparelho novo que nunca viu a marca (coberta pela versão antiga) sincroniza normalmente (limite documentado).
  await B.ctx.close();
  N.docs.ana = Object.assign(P('Ana'), { t: Date.now(), feito: { 'T:base': true, 'T:abaAntiga': true } });
  await A.p.reload(); await A.dados(); await ate(async () => /versão antiga do curso/.test(await A.tela()), 20000);
  const reapareceu = /versão antiga do curso/.test(await A.tela()) && !N.docs.ana.feito['T:ana1'];
  await A.apagar('APAGAR'); await ate(async () => N.docs.ana.apagado, 20000);
  ok(reapareceu && !!N.docs.ana.apagado && !N.docs.ana.feito && !A.erros.length, 'versão antiga regravou depois da exclusão: o aparelho que apagou percebe, não mistura a cópia dele e apaga de novo a pedido');

  // 4. falha ao gravar: nada é apagado e a sincronização continua; conferência que não bate: não se declara apagado
  await A.ctx.close();
  N.docs.ana = P('Ana'); const C = await aparelho('ana'); await espera(5500);
  N.falhaSet = 'unavailable'; await C.apagar('APAGAR'); await ate(async () => /Nada foi apagado da nuvem/.test(await C.tela()), 20000); N.falhaSet = '';
  const falhou = /Nada foi apagado da nuvem/.test(await C.tela()) && N.docs.ana.v === 1 && !N.docs.ana.apagado;
  await espera(5500); N.intruso = () => P('Ana'); await C.apagar('APAGAR'); await ate(async () => /não deu para confirmar/.test(await C.tela()), 20000);
  const naoConfirmou = /não deu para confirmar/.test(await C.tela()) && !(await C.p.evaluate(() => localStorage.getItem('missao-eear-v1-apagado@claude:ana')));
  ok(falhou && naoConfirmou && !C.erros.length, 'sem conexão ao apagar: "nada foi apagado" e a nuvem fica como estava; se outra gravação cobre a exclusão, o app não diz que apagou');

  // 5. "Enviar de novo" só a pedido; depois de apagado, a última cópia local pode ser apagada com aviso
  await espera(5500); await C.apagar('APAGAR'); await ate(async () => N.docs.ana.apagado, 20000); await C.p.waitForTimeout(500);
  await C.clicar('dadosapagar'); await C.p.waitForTimeout(100);
  const ultima = /última cópia/.test(await C.tela()) && (await C.p.locator('[data-a="dadosapagarok"]').count()) === 1;
  await C.clicar('cancelar'); await C.clicar('nuvemreenviar'); await ate(async () => N.docs.ana.v === 1 && N.docs.ana.feito, 20000);
  ok(ultima && N.docs.ana.v === 1 && !!N.docs.ana.feito['T:base'] && !N.docs.ana.apagado && !C.erros.length, '"Enviar de novo para a nuvem" (a pedido) desfaz a exclusão com a cópia deste aparelho; antes disso, apagar a última cópia local é permitido, com aviso');
  await C.ctx.close();
};
