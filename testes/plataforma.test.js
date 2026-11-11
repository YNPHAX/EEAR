/* Testes da plataforma: integridade dos dados do curso e comportamentos que o aluno vê no navegador.
   Monta o site numa pasta temporária (web/build.py) e abre num servidor local em /EEAR/; não grava nada no repositório.
   Uso (na raiz): node testes/plataforma.test.js        Requer Python 3, Node e o pacote playwright com o Chromium. */
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
let falhas = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`); if (!cond) falhas++; };

const dados = require('./dados.js'), testarVersoes = require('./versoes.js'), testarCelular = require('./celular.js'), testarRobustez = require('./robustez.js'), testarSincronia = require('./sincronia.js'), testarContas = require('./contas.js'), testarNuvemClaude = require('./nuvem-claude.js'), testarExclusaoNuvem = require('./exclusao-nuvem.js'), testarEpocaNuvem = require('./epoca-nuvem.js'), testarProgresso2 = require('./progresso2-nuvem.js'), testarFalhasNuvem = require('./falhas-nuvem.js'), testarAbas = require('./abas.js'), testarInterrupcao = require('./abas-interrupcao.js');
const { carregarDados, testarDados, testarContasMat, testarContasFis } = dados;
dados.usar(ok);


/* Servidor estático que imita o GitHub Pages: o site fica em /EEAR/. */
function servir(raiz) {
  const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
  const srv = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split('?')[0]);
    let f = path.join(raiz, u.replace(/^\/EEAR\/?/, '/'));
    if (f.endsWith(path.sep)) f = path.join(f, 'index.html');
    if (!u.startsWith('/EEAR/') || !f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  });
  return new Promise(res => srv.listen(0, '127.0.0.1', () => res({ url: `http://127.0.0.1:${srv.address().port}/EEAR/`, fechar: () => srv.close() })));
}

async function testarNavegador(E) {
  const { chromium } = require('playwright');
  const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-site-'));
  execFileSync('python3', ['web/build.py', saida], { cwd: RAIZ, stdio: 'ignore' });
  const srv = await servir(saida), b = await chromium.launch();
  const hoje = new Date().toISOString().slice(0, 10), todos = E.modulos.map(m => m.id);
  const base = cfg => ({ v: 1, t: Date.now(), cfg: Object.assign({ nome: 'Aluno Teste', alvo: 'cfs2-2027', prova: '2026-11-22', inicio: hoje, horas: 3, dias: [0, 1, 2, 3, 4, 5, 6], excl: [] }, cfg),
    mod: { POR01: { best: 0.9, tent: 2, lido: '2026-10-01' }, ING14: { best: 0.8, tent: 1, lido: '2026-10-02' } }, fc: { 'POR01~0': [2, 20400] }, erros: { 'MAT03-2': 1 },
    sims: [{ d: '2026-10-03', tipo: 'materia', mat: 'por', prova: null, r: { por: [18, 24] }, min: 50 }], feito: {}, act: { '2026-10-01': 1 }, aula: {}, ap: {}, diag: null, ativo: null, ult: null, ultAula: 'POR01' });
  async function abrir(estado) {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 860 } }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message));
    await p.goto(srv.url);
    if (estado) { await p.evaluate(s => localStorage.setItem('missao-eear-v1', JSON.stringify(s)), estado); await p.goto(srv.url); }
    await p.waitForTimeout(250);
    return { ctx, p, erros, aba: async v => { await p.click(`[data-a="tab"][data-v="${v}"]`); await p.waitForTimeout(150); return p.locator('main').innerText(); },
      salvo: () => p.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1'))) };
  }
  const intactos = (a, d) => ['mod', 'fc', 'erros', 'sims', 'act', 'ultAula'].every(k => JSON.stringify(a[k]) === JSON.stringify(d[k]));

  console.log('\n== simulado completo no tempo do edital (4h20)');
  {
    const { ctx, p } = await abrir(null);
    await p.fill('#ini-nome', 'Novo'); await p.click('[data-a="comecar"]'); await p.waitForTimeout(150);
    await p.click('[data-a="tab"][data-v="simulados"]'); await p.waitForTimeout(150);
    ok(/96 questões, 24 por matéria, em 4h20/.test(await p.locator('main').innerText()), 'aluno novo: simulado completo em 4h20');
    await ctx.close();
  }
  {
    const antes = base({ tempoSim: 240 });
    const { ctx, p, aba, salvo, erros } = await abrir(antes);
    const t = await aba('simulados');
    await p.click('[data-a="tab"][data-v="plano"]'); await p.waitForTimeout(100);
    await p.click('[data-a="tab"][data-v="hoje"]'); await p.waitForTimeout(100);
    await p.evaluate(() => document.querySelector('[data-a="tab"][data-v="simulados"]').click()); await p.waitForTimeout(100);
    const depois = await salvo();
    ok(/em 4h20/.test(t), 'progresso antigo com o padrão de 4h passa a mostrar 4h20');
    ok(intactos(antes, depois), 'e nada do progresso (notas, cartões, erros, simulados, atividade) muda');
    ok(!erros.length, 'sem erro de JavaScript' + (erros.length ? ': ' + erros[0] : ''));
    await ctx.close();
  }
  {
    const { ctx, aba } = await abrir(base({ tempoSim: 240, cv: 2 }));
    ok(/em 4h\./.test(await aba('simulados')), 'quem escolheu 4h depois da mudança continua com 4h');
    await ctx.close();
  }

  console.log('\n== quiz com a quantidade real de questões');
  {
    const ing10 = E.modulos.find(m => m.id === 'ING10'), n = ing10.q.length;
    let k = 0; while (k / n < 0.8) k++;
    const { ctx, p, erros } = await abrir(base({ horas: 10, excl: todos.filter(i => i !== 'ING10'), modalidade: 'normal' }));
    const t = await p.locator('main').innerText();
    ok(t.includes(`Quiz ING10: meta de ${k} acertos em ${n}`) && t.includes(`ING10 · ${n} questões`), `plano mostra "meta de ${k} acertos em ${n}" para a aula com ${n} questões`);
    ok(!/ING10[^\n]*10 questões|meta de 8 acertos em 10/.test(t), 'e não promete 10 questões');
    ok(!erros.length, 'sem erro de JavaScript');
    await ctx.close();
  }

  console.log('\n== modalidade de Inglês (edital: básico x BCT)');
  {
    const nVistas = mod => E.modulos.filter(m => m.m === 'ing' && (!m.modalidades || m.modalidades.includes(mod))).length;
    for (const mod of ['normal', 'bct']) {
      const antes = base({ modalidade: mod });
      const { ctx, p, salvo, erros } = await abrir(antes);
      await p.click('[data-a="tab"][data-v="materias"]'); await p.waitForTimeout(100);
      await p.click('[data-a="mat"][data-s="ing"]'); await p.waitForTimeout(150);
      const t = await p.locator('main').innerText();
      ok(new RegExp(`de ${nVistas(mod)} aulas concluídas`).test(t), `${mod}: trilha de Inglês com ${nVistas(mod)} aulas`);
      ok(intactos(antes, await salvo()), `${mod}: notas das aulas da outra modalidade continuam guardadas`);
      ok(!erros.length, `${mod}: sem erro de JavaScript`);
      await ctx.close();
    }
  }

  console.log('\n== aulas novas (Física 5.8 do edital e tipos de discurso)');
  for (const id of ['FIS18', 'POR15']) {
    const m = E.modulos.find(x => x.id === id), n = E.modulos.filter(x => x.m === m.m).length;
    const antes = base({});
    const { ctx, p, salvo, erros } = await abrir(antes);
    await p.click('[data-a="tab"][data-v="materias"]'); await p.waitForTimeout(100);
    await p.click(`[data-a="mat"][data-s="${m.m}"]`); await p.waitForTimeout(150);
    ok(new RegExp(`de ${n} aulas concluídas`).test(await p.locator('main').innerText()), `${id}: trilha da matéria com ${n} aulas`);
    await p.click(`[data-a="mod"][data-id="${id}"]`); await p.waitForTimeout(150);
    ok((await p.locator('main').innerText()).includes(m.t), `${id}: a aula abre pela trilha`);
    await p.evaluate(i => document.querySelector(`[data-a="quizmod"][data-id="${i}"]`).click(), id); await p.waitForTimeout(150);
    ok((await p.locator('main').innerText()).includes(`Questão 1 de ${m.q.length}`), `${id}: quiz com ${m.q.length} questões`);
    const depois = await salvo();  // abrir a aula muda só ultAula ("Continuar de onde parei")
    ok(intactos(antes, Object.assign({}, depois, { ultAula: antes.ultAula })) && depois.ultAula === id && !erros.length,
      `${id}: notas, cartões, erros, simulados e atividade intactos; "continuar" aponta para a aula; sem erro de JavaScript` + (erros.length ? ': ' + erros[0] : ''));
    await ctx.close();
  }

  console.log('\n== certificados conquistados antes das aulas novas (FIS18 e POR15)');
  {
    const pad = n => String(n).padStart(2, '0'), ids = (p, n) => [...Array(n)].map((_, i) => p + pad(i + 1));
    /* Progresso de uma versão sem registro de certificados: aulas com 80% ou mais e a data em que chegaram a 80%. */
    const legado = (lista, extra) => {
      const mod = {}; lista.forEach((id, i) => { mod[id] = { best: 0.9, tent: 1, lido: '2026-09-30', ok: '2026-10-' + pad(1 + (i % 20)) }; });
      return Object.assign({ v: 1, t: 1, cfg: { nome: 'Aluno Teste', alvo: 'cfs2-2027', prova: '2026-11-22', inicio: '2026-09-01', horas: 3, dias: [0, 1, 2, 3, 4, 5, 6], excl: [], cv: 2 },
        mod, fc: { 'POR01~0': [2, 20400] }, erros: { 'MAT03-2': 1 }, sims: [{ d: '2026-10-03', tipo: 'materia', mat: 'por', prova: null, r: { por: [18, 24] }, min: 50 }],
        feito: {}, act: { '2026-10-01': 1 }, aula: {}, ap: {}, diag: null, ativo: null, ult: null, ultAula: 'FIS17' }, extra || {});
    };
    const fisPor = ids('FIS', 17).concat(ids('POR', 14));
    /* Para esse progresso, a versão no ar (main 4c967de) mostra estes certificados (conferido no build da main). */
    const ORIGINAL = { fis: ['com 17 aulas', '46 horas', '17 de outubro de 2026', 'MTMO-FZKM'], por: ['com 14 aulas', '37 horas', '20 de outubro de 2026', 'V4PV-3G7D'] };
    const card = async (p, s) => {
      await p.click('[data-a="tab"][data-v="materias"]'); await p.waitForTimeout(80); await p.click(`[data-a="mat"][data-s="${s}"]`); await p.waitForTimeout(120);
      return p.locator('.cert-cta').innerText();
    };
    const verCert = async (p, s, botao) => {
      await card(p, s); const bt = p.locator(`.cert-cta ${botao || '[data-a="cert"]'}`).first();
      if (!(await bt.count())) return '';
      await bt.click(); await p.waitForTimeout(120); return p.locator('#cert').innerText().catch(() => '');
    };
    const tem = (t, xs) => xs.every(x => t.toLowerCase().includes(x.toLowerCase()));
    const certs = st => (st.cfg.certs || []).map(r => `${r.s}:${r.ids.length}:${r.o}`).sort().join(' ');
    /* Responde o quiz da aula pela tela, acertando todas: acha cada questão pelo enunciado e clica na alternativa certa. */
    const fazerQuiz = async (p, id) => {
      const m = E.modulos.find(x => x.id === id);
      await p.click('[data-a="tab"][data-v="materias"]'); await p.waitForTimeout(80); await p.click(`[data-a="mat"][data-s="${m.m}"]`); await p.waitForTimeout(100);
      await p.click(`[data-a="mod"][data-id="${id}"]`); await p.waitForTimeout(100);
      await p.evaluate(i => document.querySelector(`[data-a="quizmod"][data-id="${i}"]`).click(), id); await p.waitForTimeout(100);
      for (let k = 0; k < m.q.length; k++) {
        const ok = await p.evaluate(qs => {
          const txt = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
          const en = txt(document.querySelector('.q-enun').innerHTML), q = qs.find(x => txt(x[0]) === en);
          const b = q && [...document.querySelectorAll('.opt')].find(o => txt(o.children[1].innerHTML) === txt(q[1][q[2]]));
          if (!b) return false; b.click(); return true;
        }, m.q);
        if (!ok) return false;
        await p.waitForTimeout(30); await p.click('[data-a="qprox"]'); await p.waitForTimeout(30);
      }
      return /Módulo dominado/.test(await p.locator('main').innerText());
    };

    { // 1. certificado antigo legítimo, com data e código originais; abrir sem estudar não grava nada
      const antes = legado(fisPor);
      const { ctx, p, salvo, erros } = await abrir(antes);
      const guardado = JSON.stringify(antes);  // exatamente o que a versão antiga deixou gravado
      const cf = await card(p, 'fis');
      ok(/conquistado/i.test(cf) && cf.includes('Certificado de 17 de outubro de 2026 · 17 aulas'), 'certificado antigo de Física aparece como conquistado depois da aula nova');
      ok(tem(await verCert(p, 'fis'), ORIGINAL.fis), 'certificado antigo de Física com as aulas, a carga horária, a data e o código originais');
      ok(tem(await verCert(p, 'por'), ORIGINAL.por), 'certificado antigo de Português com as aulas, a carga horária, a data e o código originais');
      ok(await p.evaluate(() => localStorage.getItem('missao-eear-v1')) === guardado, 'abrir o curso e ver os certificados sem estudar não grava nada');
      // 2. ao estudar, o registro é gravado; concluir a FIS18 libera o certificado novo, e o antigo continua
      ok(await fazerQuiz(p, 'FIS18'), 'quiz da FIS18 concluído pela tela');
      const st = await salvo(), fis = (st.cfg.certs || []).filter(r => r.s === 'fis');
      const velho = fis.find(r => r.ids.length === 17), novo = fis.find(r => r.ids.length === 18);
      ok(velho && velho.o === 'anterior' && velho.d === '2026-10-17' && velho.c === 'MTMO-FZKM' && velho.h === 46 && velho.mod === null, 'registro gravado do certificado antigo: 17 aulas, 46 h, data e código originais');
      ok(novo && novo.o === 'curso' && novo.h === 49 && novo.ids.includes('FIS18'), 'certificado novo de Física exige as 18 aulas (49 h)');
      ok(fisPor.every(id => JSON.stringify(st.mod[id]) === JSON.stringify(antes.mod[id])) && JSON.stringify([st.fc, st.erros, st.sims]) === JSON.stringify([antes.fc, antes.erros, antes.sims]), 'notas, cartões, erros e simulados antigos intactos depois de estudar');
      const c2 = await card(p, 'fis');
      ok(/liberado/i.test(c2) && /17 aulas/.test(c2), 'Física liberada com as aulas atuais e o certificado de 17 aulas ainda na lista');
      ok(tem(await verCert(p, 'fis', '[data-i]'), ORIGINAL.fis), 'o certificado antigo continua abrindo para reimprimir');
      ok(!erros.length, 'sem erro de JavaScript' + (erros.length ? ': ' + erros[0] : ''));
      await ctx.close();
    }
    { // 3. aluno incompleto não recebe o certificado antigo, nem completando a aula antiga depois da atualização
      const { ctx, p, salvo } = await abrir(legado(ids('FIS', 16).concat(ids('POR', 14))));
      ok(!/conquistado/i.test(await card(p, 'fis')), 'sem todas as aulas antigas, nenhum certificado antigo de Física');
      ok(await fazerQuiz(p, 'FIS17'), 'quiz da FIS17 concluído depois da atualização');
      const cf = await card(p, 'fis'), st = await salvo();
      ok(/17\/18/.test(cf) && !(st.cfg.certs || []).some(r => r.s === 'fis'), 'completar a FIS17 depois da atualização não dá o certificado antigo: falta a FIS18');
      ok((st.cfg.certs || []).some(r => r.s === 'por' && r.o === 'anterior'), 'o certificado antigo de Português do mesmo aluno continua');
      await ctx.close();
    }
    { // 4. evidência insuficiente: nota sem a data de conclusão, ou progresso que já usou a aula nova
      const semData = legado(fisPor); ids('FIS', 17).forEach(id => { delete semData.mod[id].ok; });
      let r = await abrir(semData); ok(!/conquistado/i.test(await card(r.p, 'fis')) && /conquistado/i.test(await card(r.p, 'por')), 'nota de 80% sem a data de conclusão não basta para o certificado antigo');
      await r.ctx.close();
      const comRastro = legado(fisPor); comRastro.fc['FIS18~0'] = [1, 20400];
      r = await abrir(comRastro); ok(!/conquistado/i.test(await card(r.p, 'fis')) && /conquistado/i.test(await card(r.p, 'por')), 'progresso que já tinha a FIS18 não ganha o certificado antigo de Física');
      await r.ctx.close();
    }
    { // 5. aluno novo (progresso com registro) precisa das aulas novas
      const st0 = legado(fisPor); st0.cfg.certs = [];
      const { ctx, p, salvo } = await abrir(st0);
      ok(/17\/18/.test(await card(p, 'fis')) && /14\/15/.test(await card(p, 'por')), 'aluno novo com as aulas antigas não tem certificado: faltam FIS18 e POR15');
      ok(await fazerQuiz(p, 'POR15'), 'quiz da POR15 concluído pela tela');
      const st = await salvo(), por = (st.cfg.certs || []).filter(r => r.s === 'por');
      ok(por.length === 1 && por[0].ids.length === 15 && por[0].o === 'curso' && /liberado/i.test(await card(p, 'por')), 'concluindo a POR15, sai o certificado de Português com 15 aulas');
      await ctx.close();
    }
    { // 6. troca de modalidade não apaga o certificado de Inglês conquistado
      const ingN = E.modulos.filter(m => m.m === 'ing' && (!m.modalidades || m.modalidades.includes('normal'))).map(m => m.id);
      const { ctx, p, salvo } = await abrir(legado(ingN, { ultAula: 'ING01' }));
      ok(/conquistado|liberado/i.test(await card(p, 'ing')), 'certificado de Inglês (CFS normal) registrado');
      await p.click('[data-a="tab"][data-v="plano"]'); await p.waitForTimeout(100);
      await p.selectOption('#cfg-modalidade', 'bct'); await p.waitForTimeout(150);
      const st = await salvo(), cing = await card(p, 'ing');
      ok(st.cfg.modalidade === 'bct' && (st.cfg.certs || []).some(r => r.s === 'ing' && r.mod === 'normal' && r.ids.length === ingN.length), 'depois de trocar para o BCT, o registro do certificado normal continua gravado');
      ok(/conquistado/i.test(cing) && /CFS normal/.test(cing) && tem(await verCert(p, 'ing', '[data-i]'), [`com ${ingN.length} aulas`]), 'no BCT, o certificado de Inglês do CFS normal continua aberto para reimprimir');
      await ctx.close();
    }
    { // 7. colar progresso não apaga certificados nem os duplica
      const st0 = legado(fisPor);
      let r = await abrir(st0);
      await fazerQuiz(r.p, 'FIS18'); const comCert = await r.salvo(); await r.ctx.close();
      r = await abrir(comCert);
      const outro = legado(ids('MAT', 3)); outro.cfg.certs = [];
      const colar = async o => { await r.p.click('[data-a="tab"][data-v="plano"]'); await r.p.waitForTimeout(80); await r.p.click('[data-a="impabrir"]'); await r.p.fill('#imp-txt', JSON.stringify(o)); await r.p.click('[data-a="impok"]'); await r.p.waitForTimeout(120); };
      await colar(outro);
      let st = await r.salvo();
      ok(certs(st) === certs(comCert) && Object.keys(st.mod).length === 3, 'colar outro progresso troca as notas, mas mantém os certificados conquistados');
      await colar(comCert); st = await r.salvo();
      ok(certs(st) === certs(comCert), 'colar um progresso com os mesmos certificados não duplica nenhum');
      await r.ctx.close();
    }
    { // 8. sincronização com a nuvem (simulada): não perde certificados e respeita o "Zerar progresso"
      let r = await abrir(legado(fisPor)); await fazerQuiz(r.p, 'FIS18'); const local = await r.salvo(); await r.ctx.close();
      const nuvem = async (estado, doc) => {
        const ctx = await b.newContext({ serviceWorkers: 'block' }), p = await ctx.newPage(), erros = [];
        p.on('pageerror', e => erros.push(e.message));
        await ctx.addInitScript(d => {
          window.__nuvem = { doc: d, gravados: [] };
          window.claude = { use: async k => k === 'user' ? { id: async () => 'aluno-1' } : { doc: c => /^progresso\//.test(c) ? { get: async () => ({ exists: false, data: () => null }), set: async () => { const e = new Error('regras'); e.code = 'invalid_argument'; throw e; }, acquire: async o => ({ acquired: true, holder: o.holder, expiresAt: new Date(Date.now() + 5000).toISOString() }) } : ({ get: async () => ({ exists: !!window.__nuvem.doc, data: () => JSON.parse(JSON.stringify(window.__nuvem.doc)) }), set: async o => { window.__nuvem.gravados.push(JSON.parse(JSON.stringify(o))); }, acquire: async o => ({ acquired: true, holder: o.holder, expiresAt: new Date(Date.now() + o.ttlMs).toISOString() }) }) } };
        }, doc);
        // aparelho já conectado à conta: o progresso local dela fica na chave da conta (veja testes/contas.js)
        await p.goto(srv.url); await p.evaluate(s => localStorage.setItem('missao-eear-v1@claude:aluno-1', JSON.stringify(s)), estado); await p.goto(srv.url); await p.waitForTimeout(500);
        const res = { st: await p.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1@claude:aluno-1'))), gravados: await p.evaluate(() => window.__nuvem.gravados), erros };
        await ctx.close(); return res;
      };
      const semCerts = JSON.parse(JSON.stringify(local)); semCerts.cfg.certs = []; semCerts.t = local.t + 1000;
      let res = await nuvem(local, semCerts);
      ok(certs(res.st) === certs(local) && res.gravados.some(o => certs(o) === certs(local)) && !res.erros.length, 'nuvem mais nova sem os certificados deste aparelho: eles ficam e voltam para a nuvem');
      const velha = JSON.parse(JSON.stringify(local)), sem = JSON.parse(JSON.stringify(local)); velha.t = local.t - 1000; sem.cfg.certs = [];
      res = await nuvem(sem, velha);
      ok(certs(res.st) === certs(local) && res.gravados.length > 0, 'aparelho mais novo sem os certificados da nuvem: recebe os da nuvem e grava a união');
      const zerada = { v: 1, t: Date.now() + 60000, cfg: Object.assign({}, local.cfg, { certs: [], certsZ: Date.now() + 60000 }), mod: {}, fc: {}, erros: {}, sims: [], feito: {}, act: {}, aula: {}, ap: {}, diag: null, ativo: null, ult: null, ultAula: null };
      res = await nuvem(local, zerada);
      ok(!(res.st.cfg.certs || []).length && Object.keys(res.st.mod).length === 0, 'progresso zerado em outro aparelho: a nuvem não traz de volta os certificados apagados');
    }
    { // 9. zerar progresso apaga os certificados registrados
      let r = await abrir(legado(fisPor)); await fazerQuiz(r.p, 'FIS18');
      await r.p.click('[data-a="tab"][data-v="plano"]'); await r.p.waitForTimeout(80);
      await r.p.click('[data-a="zerar"]'); await r.p.waitForTimeout(50); await r.p.click('[data-a="zerarok"]'); await r.p.waitForTimeout(120);
      const st = await r.salvo(), cf = await card(r.p, 'fis');
      ok(Array.isArray(st.cfg.certs) && !st.cfg.certs.length && st.cfg.certsZ > 0 && !/conquistado|liberado/i.test(cf), 'zerar progresso apaga os certificados registrados e marca quando foi zerado');
      await r.ctx.close();
      r = await abrir(st);
      ok(!/conquistado|liberado/i.test(await card(r.p, 'fis')), 'depois de zerar, abrir de novo não recria certificado antigo');
      await r.ctx.close();
    }
  }

  console.log('\n== histórico de simulados vindo de outra versão');
  {
    const est = base({}); est.sims.push({ d: '2026-10-04', tipo: 'materia', mat: 'xyz', prova: null, r: { xyz: [1, 2] }, min: 5 });
    const { ctx, aba, erros } = await abrir(est);
    await aba('simulados');
    ok(!erros.length, 'matéria desconhecida no histórico não quebra a aba Simulados' + (erros.length ? ': ' + erros[0] : ''));
    await ctx.close();
  }
  await testarVersoes({ E, b, srv, saida, base, servir, ok });
  await testarCelular({ E, b, srv, base, ok });
  await testarRobustez({ b, srv, base, ok });
  await testarSincronia({ b, srv, base, ok });
  await testarContas({ b, srv, base, ok });
  await testarNuvemClaude({ b, srv, base, ok });
  await testarExclusaoNuvem({ b, srv, base, ok });
  await testarEpocaNuvem({ b, srv, ok });
  await testarProgresso2({ b, srv, ok });
  await testarFalhasNuvem({ b, srv, ok });
  await testarAbas({ b, srv, base, ok });
  await testarInterrupcao({ b, srv, saida, base, ok });

  await b.close(); srv.fechar();
  fs.rmSync(saida, { recursive: true, force: true });
}

(async () => {
  const E = carregarDados();
  testarDados(E);
  require('./regras-nuvem.js').testarRegras(ok);
  testarContasMat(E);
  testarContasFis(E);
  await testarNavegador(E);
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
