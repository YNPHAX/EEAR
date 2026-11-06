/* Testes da plataforma: integridade dos dados do curso e comportamentos que o aluno vê no navegador.
   Monta o site numa pasta temporária (web/build.py) e abre num servidor local em /EEAR/; não grava nada no repositório.
   Uso (na raiz): node testes/plataforma.test.js        Requer Python 3, Node e o pacote playwright com o Chromium. */
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'), vm = require('vm');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
let falhas = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`); if (!cond) falhas++; };

/* Os mesmos arquivos de dados que a página carrega, fora do navegador. */
function carregarDados() {
  const html = fs.readFileSync(path.join(RAIZ, 'curso', 'index.html'), 'utf8');
  const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
  for (const m of html.matchAll(/src="dados\/([^"]+)"/g)) vm.runInContext(fs.readFileSync(path.join(RAIZ, 'curso', 'dados', m[1]), 'utf8'), ctx, { filename: m[1] });
  return ctx.EEAR;
}

function testarDados(E) {
  console.log('\n== dados do curso');
  const ids = new Set(E.modulos.map(m => m.id));
  ok(ids.size === E.modulos.length, `${E.modulos.length} aulas, sem id repetido`);
  const ruins = [];
  for (const m of E.modulos) {
    if (!E.materias[m.m] || !m.t || !m.teoria) ruins.push(m.id + ' (campos)');
    if ((m.modalidades || []).some(x => !['normal', 'bct'].includes(x))) ruins.push(m.id + ' (modalidade)');
    (m.q || []).forEach((q, i) => { if (!Array.isArray(q[1]) || q[1].length !== 4 || !(Number.isInteger(q[2]) && q[2] >= 0 && q[2] < 4) || !q[3]) ruins.push(`${m.id} q${i + 1}`); });
  }
  ok(!ruins.length, 'toda aula tem matéria, título e teoria; toda questão tem 4 alternativas, gabarito válido e comentário' + (ruins.length ? ': ' + ruins.slice(0, 8).join(', ') : ''));
  /* Flashcards: [frente, verso] ou [frente, verso, versão ≥ 2]. Eles vão para a tela como HTML: só as marcações simples
     abaixo são aceitas, e um "<" solto não pode vir seguido de letra. */
  const cartoesRuins = [];
  for (const m of E.modulos) (m.fc || []).forEach((c, i) => {
    const forma = Array.isArray(c) && (c.length === 2 || (c.length === 3 && Number.isInteger(c[2]) && c[2] >= 2)) && typeof c[0] === 'string' && typeof c[1] === 'string' && c[0].trim() && c[1].trim();
    const html = forma && [c[0], c[1]].every(t => !/<(?!\/?(b|i|u|sub|sup|br)>)[A-Za-z\/!?]/.test(t));
    if (!forma || !html) cartoesRuins.push(`${m.id}~${i}`);
  });
  ok(!cartoesRuins.length, 'todo flashcard tem frente e verso, versão opcional válida e só HTML simples' + (cartoesRuins.length ? ': ' + cartoesRuins.slice(0, 8).join(', ') : ''));
  /* Duas alternativas com o mesmo valor (como 5/14 e 10/28) dão duas respostas certas. Quando o enunciado pede uma forma
     de escrever (notação científica), as formas equivalentes são distratores de propósito. */
  const exp = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '⁻': '-' };
  const valor = s => {
    const t = s.replace(/<[^>]+>/g, '').trim(), sinal = /^[−-]/.test(t) ? -1 : 1, u = t.replace(/^[−-]\s*/, '');
    let m = u.match(/^(\d+(?:,\d+)?)\s*×\s*10([⁻⁰-⁹¹²³]+)(.*)$/);
    if (m) return [sinal * Number(m[1].replace(',', '.')) * 10 ** Number([...m[2]].map(c => exp[c]).join('')), m[3].trim()];
    if ((m = u.match(/^(\d+)\s*\/\s*(\d+)(.*)$/))) return [sinal * m[1] / m[2], m[3].trim()];
    if ((m = u.match(/^(\d+(?: \d{3})*(?:,\d+)?)(\s*[^\d√π/^,].*|)$/))) return [sinal * Number(m[1].replace(/ /g, '').replace(',', '.')), m[2].trim()];
    return null;
  };
  const iguais = [], repetidas = [], semDestaque = [];
  for (const m of E.modulos) (m.q || []).forEach((q, i) => {
    if (new Set(q[1]).size !== q[1].length) repetidas.push(`${m.id} q${i + 1}`);
    if (/destacad/i.test(q[0]) && ![q[0], ...q[1]].some(x => /<(u|b)>/.test(x))) semDestaque.push(`${m.id} q${i + 1}`);
    if (/notação científica/i.test(q[0])) return;
    const v = q[1].map(valor);
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++)
      if (v[a] && v[b] && v[a][1] === v[b][1] && Math.abs(v[a][0] - v[b][0]) <= 1e-9 * Math.max(Math.abs(v[a][0]), Math.abs(v[b][0]))) iguais.push(`${m.id} q${i + 1}`);
  });
  ok(!iguais.length && !repetidas.length, 'nenhuma questão tem duas alternativas iguais ou com o mesmo valor' + (iguais.length || repetidas.length ? ': ' + [...iguais, ...repetidas].join(', ') : ''));
  ok(!semDestaque.length, 'todo enunciado que fala em termo "destacado" tem o destaque marcado' + (semDestaque.length ? ': ' + semDestaque.join(', ') : ''));
  for (const p of E.provas) {
    const dir = path.join(RAIZ, 'curso', 'provas', p.id.replace('-', '_'));
    const semImg = p.q.filter(q => !fs.existsSync(path.join(dir, `q${String(q.n).padStart(2, '0')}.webp`))).map(q => q.n);
    const semAula = p.q.filter(q => !ids.has(q.mod)).map(q => q.n);
    ok(p.q.length === 96 && !semImg.length && !semAula.length, `${p.nome}: 96 questões, cada uma com imagem e aula do curso` + (semImg.length || semAula.length ? ` (sem imagem: ${semImg}; sem aula: ${semAula})` : ''));
  }
  for (const mod of ['normal', 'bct']) ok(E.modulos.some(m => m.m === 'ing' && (!m.modalidades || m.modalidades.includes(mod))), `modalidade ${mod} tem aulas de Inglês`);
  /* As 67 aulas que existiam antes do registro de certificados não têm desde; toda aula que entrou depois tem. */
  const antigas = new Set([['POR', 14], ['ING', 16], ['MAT', 20], ['FIS', 17]].flatMap(([p, n]) => [...Array(n)].map((_, i) => p + String(i + 1).padStart(2, '0'))));
  const semDesde = E.modulos.filter(m => !m.desde).map(m => m.id), novas = E.modulos.filter(m => m.desde).map(m => m.id);
  ok(semDesde.length === antigas.size && semDesde.every(id => antigas.has(id)) && novas.every(id => !antigas.has(id)),
    `só as 67 aulas anteriores ao registro de certificados ficam sem "desde" (novas: ${novas.join(', ')})`);
  /* Questões oficiais de física moderna (efeito fotoelétrico, átomo de Bohr, fissão do urânio-235) ficam na aula FIS18. */
  const fm = [['cfs2-2025', 51], ['cfs2-2025', 68], ['cfs1-2025', 51]].filter(([p, n]) => (E.provas.find(x => x.id === p) || { q: [] }).q.some(q => q.n === n && q.mod === 'FIS18'));
  ok(fm.length === 3, `questões oficiais de física moderna ligadas à aula FIS18 (${fm.length} de 3)`);
}

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
          window.claude = { use: async k => k === 'user' ? { id: async () => 'aluno-1' } : { doc: () => ({ get: async () => ({ exists: !!window.__nuvem.doc, data: () => JSON.parse(JSON.stringify(window.__nuvem.doc)) }), set: async o => { window.__nuvem.gravados.push(JSON.parse(JSON.stringify(o))); } }) } };
        }, doc);
        await p.goto(srv.url); await p.evaluate(s => localStorage.setItem('missao-eear-v1', JSON.stringify(s)), estado); await p.goto(srv.url); await p.waitForTimeout(500);
        const res = { st: await p.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1'))), gravados: await p.evaluate(() => window.__nuvem.gravados), erros };
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
  console.log('\n== versão dos flashcards (cópia do site com os 7 cartões da POR02 na versão 2)');
  {
    /* Cópia isolada do site montado: os cartões da POR02 ganham a versão 2, como numa reformulação. Nada do curso muda. */
    const saida2 = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-site-v2-'));
    fs.cpSync(saida, saida2, { recursive: true });
    fs.appendFileSync(path.join(saida2, 'dados', 'por1.js'), "\nEEAR.modulos.find(m => m.id === 'POR02').fc.forEach(c => { c[2] = 2; });\n");
    /* Outra cópia sem nenhuma versão nos cartões, como o site antes da reformulação. */
    const saida0 = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-site-v1-'));
    fs.cpSync(saida, saida0, { recursive: true });
    for (const f of fs.readdirSync(path.join(saida0, 'dados')).filter(f => /^(por|mat|fis|ing)\d\.js$/.test(f))) fs.appendFileSync(path.join(saida0, 'dados', f), '\nEEAR.modulos.forEach(m => (m.fc || []).forEach(c => { c.length = 2; }));\n');
    const srv2 = await servir(saida2), srv0 = await servir(saida0), por02 = E.modulos.find(m => m.id === 'POR02').fc;
    const desvio = id => { let x = 2166136261; for (let i = 0; i < id.length; i++) { x ^= id.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x % 7; };
    const ids2 = por02.map((_, i) => 'POR02~' + i), DIA = 864e5;
    /* Dia local (como o app calcula) de um instante num fuso. */
    const diaLocal = (ms, tz) => { const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms)).split('-').map(Number); return Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / DIA); };
    const dstr = n => new Date(n * DIA).toISOString().slice(0, 10);
    async function abrirEm(url, estado, ms, tz) {
      const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 860 }, timezoneId: tz });
      const p = await ctx.newPage(), erros = []; p.on('pageerror', e => erros.push(e.message));
      await p.clock.setFixedTime(new Date(ms));
      await p.goto(url); if (estado) { await p.evaluate(s => localStorage.setItem('missao-eear-v1', s), typeof estado === 'string' ? estado : JSON.stringify(estado)); await p.goto(url); }
      await p.waitForTimeout(250);
      const guardado = () => p.evaluate(() => localStorage.getItem('missao-eear-v1'));
      const vencidos = async () => { await p.click('[data-a="tab"][data-v="hoje"]'); await p.waitForTimeout(100); return Number(await p.locator('.grid2 .card').first().locator('.score').innerText()); };
      const revisar = async acertos => { // revisa a fila do dia pela tela e devolve os cartões revisados
        const feitos = []; await p.click('[data-a="tab"][data-v="hoje"]'); await p.waitForTimeout(80);
        if (!(await p.locator('[data-a="fcini"]').first().isEnabled())) return feitos;
        await p.locator('[data-a="fcini"]').first().click(); await p.waitForTimeout(100);
        while (await p.locator('[data-a="fcvirar"]').count()) {
          const frente = (await p.locator('.fc > div').first().innerText()).trim(), i = por02.findIndex(c => c[0].replace(/<[^>]+>/g, '').trim() === frente);
          feitos.push('POR02~' + i); await p.click('[data-a="fcvirar"]'); await p.waitForTimeout(40);
          await p.click(`[data-a="fcaval"][data-ok="${acertos ? 1 : 0}"]`); await p.waitForTimeout(60);
        }
        return feitos;
      };
      return { ctx, p, erros, guardado, vencidos, revisar };
    }
    for (const tz of ['America/Sao_Paulo', 'Asia/Tokyo']) {
      const T0 = Date.UTC(2026, 11, 1, 1, 30), D = diaLocal(T0, tz);  // 01h30 UTC: dia 30/11 em São Paulo e 01/12 em Tóquio
      const fc = {}; ids2.forEach(id => { fc[id] = [6, D + 50]; });  // os 7 cartões estavam dominados (caixa de 60 dias)
      const st0 = Object.assign(base({}), { mod: { POR02: { lido: dstr(D - 20), tent: 1, best: 0.9, ok: dstr(D - 20) } }, fc, erros: {}, sims: [] });
      st0.cfg.prova = '2027-05-30';
      const antes = JSON.stringify(st0), ate = k => ids2.filter(id => desvio(id) <= k).length;
      // sem versões nos cartões (como antes da reformulação), nenhum desses cartões volta
      let r = await abrirEm(srv0.url, st0, T0, tz);
      ok(await r.vencidos() === 0, `${tz}: sem versão nos dados, nenhum cartão dominado volta antes da hora`);
      await r.ctx.close();
      // com a versão 2: abrir não grava nada e devolve só os cartões de desvio 0; a âncora flutua até o aluno estudar
      r = await abrirEm(srv2.url, st0, T0, tz);
      ok(await r.guardado() === antes, `${tz}: abrir com cartões em versão nova não altera o progresso gravado`);
      ok(await r.vencidos() === ate(0), `${tz}: no 1º dia voltam só os cartões de desvio 0 (${ate(0)} de 7)`);
      await r.ctx.close();
      r = await abrirEm(srv2.url, st0, T0 + 3 * DIA, tz);
      ok(await r.vencidos() === ate(0) && await r.guardado() === antes, `${tz}: sem estudar, 3 dias depois, ainda voltam ${ate(0)} (a âncora só fica quando o aluno estuda)`);
      await r.ctx.close();
      // o aluno estuda no dia D: a âncora fica gravada e os demais voltam aos poucos, até D + 6
      r = await abrirEm(srv2.url, st0, T0, tz);
      const vistos = await r.revisar(true);
      let st = JSON.parse(await r.guardado());
      ok(st.cfg.fcAncora && st.cfg.fcAncora['POR02:2'] === dstr(D) && vistos.length === ate(0), `${tz}: ao estudar, a âncora fica no dia local ${dstr(D)}`);
      ok(vistos.every(id => st.fc[id][0] === 3 && st.fc[id][1] === D + 7 && JSON.stringify((st.cfg.fcv || {})[id]) === JSON.stringify([2, D + 7])), `${tz}: acerto na versão nova vai para a caixa 3 (volta em 7 dias) e registra a versão vista`);
      ok(ids2.filter(id => !vistos.includes(id)).every(id => JSON.stringify(st.fc[id]) === JSON.stringify([6, D + 50])), `${tz}: os cartões ainda não revistos mantêm o histórico intacto`);
      const salvo = await r.guardado(); await r.ctx.close();
      const porDia = [];
      for (let k = 1; k <= 7; k++) { r = await abrirEm(srv2.url, salvo, T0 + k * DIA, tz); porDia.push(await r.vencidos()); await r.ctx.close(); }
      // os ainda não revistos voltam até o 6º dia; os revistos no dia D voltam, como agendado, em D + 7
      const esperado = [1, 2, 3, 4, 5, 6, 7].map(k => ids2.filter(id => !vistos.includes(id) && desvio(id) <= Math.min(k, 6)).length + (k >= 7 ? vistos.length : 0));
      ok(JSON.stringify(porDia) === JSON.stringify(esperado) && porDia[5] === 7 - vistos.length, `${tz}: os demais voltam distribuídos até o 6º dia (${porDia.join(', ')}; esperado ${esperado.join(', ')})`);
      // revisar tudo no dia D+6 e conferir que nada volta antes da data nova
      r = await abrirEm(srv2.url, salvo, T0 + 6 * DIA, tz); const resto = await r.revisar(true); st = JSON.parse(await r.guardado()); const tudo = await r.guardado(); await r.ctx.close();
      r = await abrirEm(srv2.url, tudo, T0 + 7 * DIA, tz);
      const agendados = ids2.filter(id => st.fc[id][1] <= D + 7).length;  // só os revistos no dia D (vencem em D + 7)
      ok(resto.length === 7 - vistos.length && agendados === vistos.length && await r.vencidos() === agendados, `${tz}: depois de revistos, no dia seguinte só vencem os cartões já agendados (${agendados}); nenhum se repete fora da data`);
      await r.ctx.close();
      // uma versão antiga do app revisa o texto antigo e regrava [caixa, data] sem a versão: o cartão volta
      const velho = JSON.parse(tudo), alvo = ids2[0]; velho.fc[alvo] = [5, D + 6 + 30];
      r = await abrirEm(srv2.url, velho, T0 + 13 * DIA, tz);
      ok(await r.vencidos() >= 1 && (await r.revisar(true)).includes(alvo), `${tz}: cartão regravado por uma versão antiga do app volta para a revisão da versão nova`);
      await r.ctx.close();
      // data original mais cedo que o espalhamento: vale a data original
      const cedo = JSON.parse(JSON.stringify(st0)); const longe = ids2.find(id => desvio(id) >= 3); cedo.fc[longe] = [2, D + 1];
      r = await abrirEm(srv2.url, cedo, T0 + DIA, tz);
      ok(await r.vencidos() === ate(0) + 1,`${tz}: um cartão que já venceria antes do espalhamento continua vencendo na data original`);
      await r.ctx.close();
    }
    { // exportar, colar, nuvem simulada e zerar
      const tz = 'America/Sao_Paulo', T0 = Date.UTC(2026, 11, 1, 15), D = diaLocal(T0, tz);
      const fc = {}; ids2.forEach(id => { fc[id] = [6, D + 50]; });
      const st0 = Object.assign(base({}), { mod: { POR02: { lido: dstr(D - 20), tent: 1 } }, fc, erros: {}, sims: [] });
      let r = await abrirEm(srv2.url, st0, T0, tz); await r.revisar(true);
      await r.p.click('[data-a="tab"][data-v="plano"]'); await r.p.click('[data-a="expcopiar"]').catch(() => {}); await r.p.waitForTimeout(100);
      const codigo = await r.p.locator('#exp-txt').inputValue().catch(() => r.guardado()), origem = JSON.parse(await r.guardado()); await r.ctx.close();
      r = await abrirEm(srv2.url, null, T0 + DIA, tz); await r.p.fill('#ini-nome', 'X'); await r.p.click('[data-a="comecar"]'); await r.p.waitForTimeout(80);
      await r.p.click('[data-a="tab"][data-v="plano"]'); await r.p.click('[data-a="impabrir"]'); await r.p.fill('#imp-txt', codigo); await r.p.click('[data-a="impok"]'); await r.p.waitForTimeout(120);
      const imp = JSON.parse(await r.guardado());
      ok(JSON.stringify([imp.fc, imp.cfg.fcv, imp.cfg.fcAncora]) === JSON.stringify([origem.fc, origem.cfg.fcv, origem.cfg.fcAncora]), 'colar progresso leva cartões, versões vistas e âncora');
      const vImp = await r.vencidos(); await r.ctx.close();
      r = await abrirEm(srv2.url, origem, T0 + DIA, tz);
      ok(await r.vencidos() === vImp, 'o aparelho que recebeu o progresso mostra os mesmos cartões vencidos que o original');
      await r.ctx.close();
      // nuvem simulada mais nova, com versões vistas: o aparelho fica com elas, sem misturar com as próprias
      const nuvem = JSON.parse(JSON.stringify(origem)); nuvem.t = Date.now() + 60000;
      const ctx = await b.newContext({ serviceWorkers: 'block', timezoneId: tz }), p = await ctx.newPage();
      await p.clock.setFixedTime(new Date(T0 + DIA));
      await ctx.addInitScript(d => { window.claude = { use: async k => k === 'user' ? { id: async () => 'aluno-1' } : { doc: () => ({ get: async () => ({ exists: true, data: () => JSON.parse(JSON.stringify(d)) }), set: async () => {} }) } }; }, nuvem);
      await p.goto(srv2.url); await p.evaluate(s => localStorage.setItem('missao-eear-v1', JSON.stringify(s)), st0); await p.goto(srv2.url); await p.waitForTimeout(500);
      const sinc = await p.evaluate(() => JSON.parse(localStorage.getItem('missao-eear-v1')));
      ok(JSON.stringify([sinc.fc, sinc.cfg.fcv, sinc.cfg.fcAncora]) === JSON.stringify([nuvem.fc, nuvem.cfg.fcv, nuvem.cfg.fcAncora]), 'sincronização simulada: cartões e versões vêm juntos da nuvem mais nova');
      await ctx.close();
      r = await abrirEm(srv2.url, origem, T0 + DIA, tz);
      await r.p.click('[data-a="tab"][data-v="plano"]'); await r.p.click('[data-a="zerar"]'); await r.p.waitForTimeout(50); await r.p.click('[data-a="zerarok"]'); await r.p.waitForTimeout(100);
      const z = JSON.parse(await r.guardado());
      ok(!Object.keys(z.fc).length && !z.cfg.fcv && !z.cfg.fcAncora && !r.erros.length, 'zerar progresso apaga cartões, versões vistas e âncoras');
      await r.ctx.close();
    }
    { // dados reais: progresso antigo com todos os cartões de Português dominados, aberto no site com as reformulações
      const tz = 'America/Sao_Paulo', T0 = Date.UTC(2026, 11, 1, 15), D = diaLocal(T0, tz);
      const POR = E.modulos.filter(m => m.m === 'por'), todos = [], versao = {};
      POR.forEach(m => m.fc.forEach((c, i) => { const id = m.id + '~' + i; todos.push(id); versao[id] = Number.isInteger(c[2]) && c[2] > 1 ? c[2] : 1; }));
      const novos = todos.filter(id => versao[id] > 1), iguais = todos.filter(id => versao[id] === 1);
      const frentes = {}; POR.forEach(m => m.fc.forEach((c, i) => { frentes[c[0].replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()] = m.id + '~' + i; }));
      const fc = {}; todos.forEach(id => { fc[id] = [6, D + 50]; });
      const mod = {}; POR.forEach(m => { mod[m.id] = { lido: dstr(D - 30), tent: 1, best: 0.9, ok: dstr(D - 30) }; });
      const st0 = Object.assign(base({}), { mod, fc, erros: {}, sims: [] }); st0.cfg.prova = '2027-05-30';
      const antes = JSON.stringify(st0), ate = k => novos.filter(id => desvio(id) <= k).length;
      const revisarTudo = async p => { // revisa pela tela a fila do dia e devolve os ids revisados
        const feitos = []; await p.click('[data-a="tab"][data-v="hoje"]'); await p.waitForTimeout(80);
        if (!(await p.locator('[data-a="fcini"]').first().isEnabled())) return feitos;
        await p.locator('[data-a="fcini"]').first().click(); await p.waitForTimeout(100);
        while (await p.locator('[data-a="fcvirar"]').count()) {
          feitos.push(frentes[(await p.locator('.fc > div').first().innerText()).replace(/\s+/g, ' ').trim()]);
          await p.click('[data-a="fcvirar"]'); await p.waitForTimeout(30); await p.click('[data-a="fcaval"][data-ok="1"]'); await p.waitForTimeout(40);
        }
        return feitos;
      };
      ok(POR.reduce((s, m) => s + m.fc.length, 0) === 117 && novos.length === 100 && iguais.length === 17 && novos.every(id => versao[id] === 2), `Português: 117 cartões, 100 na versão 2 e 17 sem versão (${novos.length}/${iguais.length})`);
      let r = await abrirEm(srv.url, st0, T0, tz);
      ok(await r.guardado() === antes && await r.vencidos() === ate(0), `Português: abrir não altera o progresso antigo e devolve só os reformulados de desvio 0 (${ate(0)} de 100)`);
      const dia0 = await revisarTudo(r.p); let st = JSON.parse(await r.guardado()); const salvo = await r.guardado(); await r.ctx.close();
      ok(dia0.length === ate(0) && dia0.every(id => versao[id] === 2 && st.fc[id][0] === 3 && st.fc[id][1] === D + 7), 'Português: no 1º dia só voltam cartões reformulados, e o acerto os agenda para 7 dias');
      ok(iguais.every(id => JSON.stringify(st.fc[id]) === JSON.stringify([6, D + 50]) && !(st.cfg.fcv || {})[id]) && JSON.stringify(st.mod) === JSON.stringify(st0.mod), 'Português: os 17 cartões mantidos e o registro das aulas ficam intactos');
      const porDia = [], vistos = new Set(dia0);
      for (let k = 1; k <= 6; k++) { r = await abrirEm(srv.url, salvo, T0 + k * DIA, tz); porDia.push(await r.vencidos()); await r.ctx.close(); }
      const esperado = [1, 2, 3, 4, 5, 6].map(k => novos.filter(id => !vistos.has(id) && desvio(id) <= k).length);
      ok(JSON.stringify(porDia) === JSON.stringify(esperado) && porDia[5] === 100 - dia0.length, `Português: os outros reformulados voltam distribuídos até o 6º dia (${porDia.join(', ')})`);
      r = await abrirEm(srv.url, salvo, T0 + 6 * DIA, tz); const resto = await revisarTudo(r.p); const fim = await r.guardado(); st = JSON.parse(fim); await r.ctx.close();
      r = await abrirEm(srv.url, fim, T0 + 7 * DIA, tz); const v7 = await r.vencidos(); await r.ctx.close();
      ok(resto.length === 100 - dia0.length && resto.every(id => versao[id] === 2) && novos.every(id => JSON.stringify(st.cfg.fcv[id]) === JSON.stringify([2, st.fc[id][1]])) && v7 === dia0.length && !r.erros.length, `Português: cada reformulado volta uma única vez; no 7º dia só vencem os ${dia0.length} agendados`);
    }
    srv2.fechar(); srv0.fechar(); fs.rmSync(saida2, { recursive: true, force: true }); fs.rmSync(saida0, { recursive: true, force: true });
  }

  await b.close(); srv.fechar();
  fs.rmSync(saida, { recursive: true, force: true });
}

(async () => {
  const E = carregarDados();
  testarDados(E);
  await testarNavegador(E);
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
