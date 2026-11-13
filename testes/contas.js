/* Testes do isolamento entre contas no mesmo aparelho e dos dados do aluno (baixar, consultar, apagar), com a nuvem
   fictícia do link do curso (window.claude), em memória. Os fluxos do Firebase (sair, excluir a conta, transações e
   regras) estão em testes/firebase-emulador.test.js, com os emuladores oficiais. Usado por testes/plataforma.test.js. */
module.exports = async function testarContas({ b, srv, base, ok }) {
  console.log('\n== contas no mesmo aparelho e dados do aluno');
  const nuvens = {}; // conta → documento
  let usuario = null;
  const chave = (k, id) => k + (id ? '@claude:' + id : '');
  async function aparelho() {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, acceptDownloads: true }), erros = [];
    await ctx.exposeFunction('__usuario', () => usuario);
    await ctx.exposeFunction('__get', () => (nuvens[usuario] ? JSON.parse(JSON.stringify(nuvens[usuario])) : null));
    await ctx.exposeFunction('__set', o => { nuvens[usuario] = JSON.parse(JSON.stringify(o)); });
    await ctx.addInitScript(() => {
      window.claude = { use: async k => (k === 'user' ? { id: () => window.__usuario() } : { doc: c => /^progresso\//.test(c) ? { get: async () => ({ exists: false, data: () => null }), set: async () => { const e = new Error('regras'); e.code = 'invalid_argument'; throw e; }, acquire: async o => ({ acquired: true, holder: o.holder, expiresAt: new Date(Date.now() + 5000).toISOString() }) } : ({ get: async () => { const d = await window.__get(); return { exists: !!d, data: () => d }; }, set: o => window.__set(o), acquire: async o => ({ acquired: true, holder: o.holder, expiresAt: new Date(Date.now() + o.ttlMs).toISOString() }) }) }) };
    });
    const p = await ctx.newPage(); p.on('pageerror', e => erros.push(e.message));
    const ler = k => p.evaluate(k => JSON.parse(localStorage.getItem(k)), k);
    // Prepara uma cópia de versão antiga, sem checkpoint dessa identidade. Não altera o runtime.
    const gravar = async (k, v) => {
      if (!p.url().endsWith('__perfil-legado-fixture')) await p.goto(srv.url + '__perfil-legado-fixture');
      if (/^missao-eear-v1(?:@|$)/.test(k)) await p.evaluate(k => new Promise(resolve => {
        const o = window.indexedDB.open('eear-operacoes', 1); o.onupgradeneeded = () => o.transaction.abort(); o.onerror = () => resolve();
        o.onsuccess = () => { const db = o.result; if (!db.objectStoreNames.contains('contas')) { db.close(); resolve(); return; } const t = db.transaction('contas', 'readwrite'); t.objectStore('contas').delete(k.includes('@') ? k.slice(k.indexOf('@') + 1) : ''); t.oncomplete = () => { db.close(); resolve(); }; };
      }), k);
      await p.evaluate(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)), [k, v]);
    };
    return { ctx, p, erros, ler, gravar, abrir: async () => { await p.goto(srv.url); await p.waitForTimeout(600); } };
  }
  const hj = new Date().toISOString().slice(0, 10);
  const semConta = () => Object.assign(base({ nome: 'Aluno sem conta' }), { t: Date.now() - 5000, mod: { POR01: { best: 0.9, tent: 2, lido: '2026-10-01', ok: '2026-10-01' }, MAT02: { lido: hj, tent: 1, best: 0.5 } }, erros: { 'MAT03-2': 1 } });

  { // 1 e 2. progresso sem conta: não vai sozinho para a conta; vai quando o aluno pede, e continua guardado
    usuario = null; const A = await aparelho(); await A.p.goto(srv.url);
    const anon = semConta(); await A.gravar('missao-eear-v1', anon);
    usuario = 'ana'; nuvens.ana = Object.assign(base({ nome: 'Ana' }), { t: Date.now() - 1000, mod: { FIS03: { lido: hj, best: 1, tent: 1, ok: hj } }, fc: {}, erros: {}, sims: [] });
    await A.abrir(); await A.p.waitForTimeout(1800);
    const conta = await A.ler(chave('missao-eear-v1', 'ana')), aindaAnon = await A.ler('missao-eear-v1'), aviso = await A.p.locator('[data-a="contalevar"]').count();
    ok(!!conta.mod.FIS03 && !conta.mod.POR01 && !nuvens.ana.mod.POR01 && JSON.stringify(aindaAnon) === JSON.stringify(anon) && aviso === 1 && !A.erros.length, 'ao entrar numa conta, o progresso feito sem conta não aparece nela nem vai para a nuvem; fica intacto e o aluno pode levá-lo');
    await A.p.click('[data-a="contalevar"]'); await A.p.waitForTimeout(2500);
    const depois = await A.ler(chave('missao-eear-v1', 'ana'));
    ok(!!depois.mod.FIS03 && !!depois.mod.POR01 && depois.cfg.nome === 'Ana' && !!nuvens.ana.mod.POR01 && JSON.stringify(await A.ler('missao-eear-v1')) === JSON.stringify(anon) && !(await A.p.locator('[data-a="contalevar"]').count()), '"Levar para a conta": a conta recebe o estudo feito sem conta (o nome da conta fica), a nuvem também, e o progresso sem conta continua guardado');

    // 3. alternância entre três contas no mesmo aparelho
    usuario = 'bia'; nuvens.bia = Object.assign(base({ nome: 'Bia' }), { t: Date.now(), mod: { ING05: { lido: hj, best: 0.7, tent: 1 } }, fc: {}, erros: {}, sims: [] });
    await A.abrir(); const vB = await A.p.locator('main').innerText(), sB = await A.ler(chave('missao-eear-v1', 'bia'));
    usuario = 'caio'; await A.abrir(); const sC = await A.ler(chave('missao-eear-v1', 'caio')), vC = await A.p.locator('main').innerText();
    usuario = 'ana'; await A.abrir(); const sA = await A.ler(chave('missao-eear-v1', 'ana')), vA = await A.p.locator('main').innerText();
    ok(!!sB.mod.ING05 && !sB.mod.POR01 && !sB.mod.FIS03 && /Bia/.test(vB) && !/Ana/.test(vB), 'conta B: só o progresso dela, sem nada da conta A nem do progresso sem conta');
    ok((!sC || (!Object.keys(sC.mod).length)) && !/Ana|Bia/.test(vC) && !nuvens.caio, 'conta C nova: começa vazia, e nada das outras contas é gravado na nuvem dela');
    ok(!!sA.mod.FIS03 && !!sA.mod.POR01 && !sA.mod.ING05 && /Ana/.test(vA) && !nuvens.ana.mod.ING05 && !nuvens.bia.mod.FIS03, 'de volta à conta A: o progresso dela está como antes, e as nuvens de A e B não se misturaram' + (sA.mod.FIS03 && sA.mod.POR01 && !sA.mod.ING05 && /Ana/.test(vA) && !nuvens.ana.mod.ING05 && !nuvens.bia.mod.FIS03 ? '' : ` [aulas A ${Object.keys(sA.mod)} | tela ${vA.slice(0, 60).replace(/\n/g, ' ')} | nuvem A ${Object.keys(nuvens.ana.mod)} | nuvem B ${Object.keys(nuvens.bia.mod)}]`));

    // 4. conta lembrada, mas o serviço da conta não está disponível: o aparelho mostra o progresso sem conta
    const ctx2 = await b.newContext({ serviceWorkers: 'block' }), p2 = await ctx2.newPage();
    await p2.addInitScript(([a, c]) => { if (!sessionStorage.getItem('fixture-conta-sem-servico')) { localStorage.setItem('missao-eear-v1', JSON.stringify(a)); localStorage.setItem('missao-eear-v1@claude:ana', JSON.stringify(c)); localStorage.setItem('missao-eear-conta', 'claude:ana'); sessionStorage.setItem('fixture-conta-sem-servico', '1'); } }, [anon, sA]);
    await p2.goto(srv.url); await p2.waitForTimeout(300);
    ok(/Missão de hoje, Aluno\b/.test(await p2.locator('main').innerText()) && !/Ana/.test(await p2.locator('main').innerText()), 'conta lembrada sem o serviço que a confirma: o aparelho não mostra o progresso dela, só o sem conta');
    await ctx2.close();

    // 5. progresso ilegível numa conta: a cópia de recuperação é dessa conta e não aparece nas outras
    usuario = 'bia'; await A.gravar(chave('missao-eear-v1', 'bia'), '{"v":1,"t":5,"mod":{"POR0'); await A.abrir();
    const recB = await A.p.evaluate(() => localStorage.getItem('missao-eear-v1-recuperar@claude:bia')), avisoB = await A.p.locator('[data-a="reccopiar"]').count();
    usuario = 'ana'; await A.abrir(); const avisoA = await A.p.locator('[data-a="reccopiar"]').count();
    ok(recB === '{"v":1,"t":5,"mod":{"POR0' && avisoB === 1 && avisoA === 0 && !A.erros.length, 'progresso ilegível na conta B: a cópia de recuperação fica na conta B e não aparece para a conta A');
    await A.ctx.close();
  }

  { // 6. dados do aluno: baixar, consultar e apagar (sem conta e com conta)
    usuario = null; const A = await aparelho(); await A.p.goto(srv.url);
    const anon = semConta(); await A.gravar('missao-eear-v1', anon); await A.gravar('missao-eear-v1@claude:outra', semConta()); await A.abrir();
    await A.p.click('[data-a="tab"][data-v="plano"]');
    const [arq] = await Promise.all([A.p.waitForEvent('download'), A.p.click('[data-a="dadosbaixar"]')]);
    const baixado = JSON.parse(require('fs').readFileSync(await arq.path(), 'utf8'));
    ok(require('util').isDeepStrictEqual(baixado.progresso.mod, anon.mod) && baixado.conta === null && /missao-eear-meus-dados-\d{4}-\d{2}-\d{2}\.json/.test(arq.suggestedFilename()), '"Baixar meus dados" entrega um arquivo com o progresso deste aparelho');
    await A.p.click('[data-a="dadosver"]'); const lista = await A.p.locator('main').innerText();
    ok(/2 aulas estudadas/.test(lista) && /1 outra conta/.test(lista) && !/outra@|Aluno sem conta.*Aluno sem conta/.test(lista), '"O que está guardado" mostra o que este aparelho guarda e só a quantidade de outras contas, sem o conteúdo delas');
    await A.p.click('[data-a="dadosapagar"]'); await A.p.click('[data-a="cancelar"]');
    ok(JSON.stringify(await A.ler('missao-eear-v1')) === JSON.stringify(anon), 'cancelar a exclusão não apaga nada');
    await A.p.click('[data-a="dadosapagar"]'); await A.p.click('[data-a="dadosapagarok"]'); await A.p.waitForTimeout(100);
    const sobrou = await A.p.evaluate(() => [localStorage.getItem('missao-eear-v1'), localStorage.getItem('missao-eear-v1@claude:outra')]);
    ok(sobrou[0] === null && sobrou[1] !== null && !A.erros.length, 'apagar os dados sem conta, com confirmação, apaga só o progresso sem conta; o de outra conta fica');
    await A.p.evaluate(() => { const x = document.createElement('button'); x.dataset.a = 'dadosapagarok'; document.body.appendChild(x); x.click(); x.click(); x.remove(); });
    ok(!A.erros.length && (await A.p.evaluate(() => localStorage.getItem('missao-eear-v1@claude:outra'))) !== null, 'repetir a confirmação não apaga mais nada nem dá erro');
    /* "Apagar também as outras contas": a conta "sinc" tem a cópia igual à que a nuvem confirmou (a base); a conta "outra"
       tem estudo que a nuvem ainda não confirmou. Só a primeira pode ser apagada (antes, as duas eram, e o estudo não
       enviado da outra conta se perdia). */
    const sinc = semConta(); await A.gravar('missao-eear-v1', anon); await A.gravar('missao-eear-v1@claude:sinc', sinc); await A.gravar('missao-eear-v1-base@claude:sinc', { conta: 'claude:sinc', st: sinc });
    await A.abrir(); await A.p.click('[data-a="tab"][data-v="plano"]'); await A.p.click('[data-a="dadosapagar"]');
    const avisoAntes = await A.p.locator('main').innerText();
    await A.p.click('[data-a="dadosapagartudo"]'); await A.p.waitForTimeout(100);
    const resto = await A.p.evaluate(() => Object.keys(localStorage).filter(k => k.indexOf('missao-eear-v1') === 0).sort());
    ok(JSON.stringify(resto) === '["missao-eear-v1@claude:outra"]' && /1 conta tem progresso que a nuvem ainda não confirmou/.test(avisoAntes) && /menos a cópia de uma conta/.test(await A.p.locator('main').innerText()) && !A.erros.length, '"Apagar também as outras contas": apaga o sem conta e a conta já confirmada na nuvem; a conta com estudo não confirmado fica, com aviso antes e depois' + ` [ficou: ${resto.join(', ')}]`);
    await A.p.evaluate(() => localStorage.removeItem('missao-eear-v1@claude:outra'));
    await A.gravar('missao-eear-v1', anon); await A.gravar('missao-eear-v1@claude:sinc', sinc); await A.gravar('missao-eear-v1-base@claude:sinc', { conta: 'claude:sinc', st: sinc });
    await A.abrir(); await A.p.click('[data-a="tab"][data-v="plano"]'); await A.p.click('[data-a="dadosapagar"]');
    await A.p.click('[data-a="dadosapagartudo"]'); await A.p.waitForTimeout(100);
    const resto2 = await A.p.evaluate(() => Object.keys(localStorage).filter(k => k.indexOf('missao-eear-v1') === 0));
    ok(!resto2.length && /todas as contas/.test(await A.p.locator('main').innerText()), 'com todas as contas confirmadas na nuvem, "Apagar também as outras contas" apaga tudo deste aparelho e diz isso');

    // com conta: apagar só depois que a nuvem tem tudo
    usuario = 'davi'; nuvens.davi = null; await A.gravar('missao-eear-conta', 'claude:davi'); await A.abrir(); await A.p.waitForTimeout(1500);
    await A.p.evaluate(() => { const x = document.createElement('button'); x.dataset.a = 'marcar'; x.dataset.k = 'T:teste'; document.body.appendChild(x); x.click(); x.remove(); });
    await A.p.evaluate(() => { const x = document.createElement('button'); x.dataset.a = 'tab'; x.dataset.v = 'plano'; document.body.appendChild(x); x.click(); x.remove(); }); await A.p.click('[data-a="dadosapagar"]');
    const bloqueado = (await A.p.locator('[data-a="dadosapagarok"]').count()) === 0 && /não está salva na nuvem/.test(await A.p.locator('main').innerText());
    await A.p.click('[data-a="cancelar"]'); await A.p.waitForTimeout(2500); // a gravação na nuvem acontece
    await A.p.click('[data-a="dadosapagar"]'); await A.p.click('[data-a="dadosapagarok"]'); await A.p.waitForTimeout(100);
    const local = await A.ler(chave('missao-eear-v1', 'davi'));
    ok(bloqueado && !local && !!nuvens.davi && nuvens.davi.feito['T:teste'] === true && !A.erros.length, 'com conta: apagar deste aparelho fica bloqueado enquanto a nuvem não tem tudo; depois, apaga só a cópia local e a nuvem continua com o progresso');
    await A.ctx.close();
  }
};
