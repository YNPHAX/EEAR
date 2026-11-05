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

  console.log('\n== histórico de simulados vindo de outra versão');
  {
    const est = base({}); est.sims.push({ d: '2026-10-04', tipo: 'materia', mat: 'xyz', prova: null, r: { xyz: [1, 2] }, min: 5 });
    const { ctx, aba, erros } = await abrir(est);
    await aba('simulados');
    ok(!erros.length, 'matéria desconhecida no histórico não quebra a aba Simulados' + (erros.length ? ': ' + erros[0] : ''));
    await ctx.close();
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
