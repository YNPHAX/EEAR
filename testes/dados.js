/* Testes dos dados do curso (sem navegador): integridade das aulas, questões, provas e contas dos flashcards de Matemática.
   Usado por testes/plataforma.test.js. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.resolve(__dirname, '..');
let ok = () => {};

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
  /* curso/app.js é a montagem de curso/app/ (web/montar_app.py): os dois não podem divergir. */
  const pasta = path.join(RAIZ, 'curso', 'app'), partes = fs.readdirSync(pasta).filter(f => f.endsWith('.js')).sort();
  const montado = '/* Missão EEAR — app do curso (sem dependências). */\n(function () {\n' + partes.map(f => fs.readFileSync(path.join(pasta, f), 'utf8')).join('') + '})();\n';
  ok(fs.readFileSync(path.join(RAIZ, 'curso', 'app.js'), 'utf8') === montado, `curso/app.js igual à montagem dos ${partes.length} arquivos de curso/app/`);
}

/* Flashcards de Matemática com conta: o resultado é recalculado aqui, de forma independente, e precisa aparecer no verso. */
function testarContasMat(E) {
  console.log('\n== contas dos flashcards de Matemática (recalculadas)');
  const card = id => { const [m, i] = id.split('~'); const c = (E.modulos.find(x => x.id === m) || { fc: [] }).fc[+i]; return c ? c[1].replace(/<\/?[a-z][^>]*>/gi, ' ') : ''; };
  const perto = (a, b) => Math.abs(a - b) < 1e-9;
  const fat = n => n <= 1 ? 1 : n * fat(n - 1), comb = (n, p) => fat(n) / (fat(p) * fat(n - p));
  const mdc = (a, b) => b ? mdc(b, a % b) : Math.abs(a), frac = (a, b) => { const g = mdc(a, b); return `${a / g}/${b / g}`; };
  const media = v => v.reduce((s, x) => s + x, 0) / v.length, dp = v => Math.sqrt(media(v.map(x => (x - media(v)) ** 2)));
  const raizes = (a, b, c) => { const d = b * b - 4 * a * c; return d < 0 ? [] : [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)]; };
  const cpx = { mul: ([a, b], [c, d]) => [a * c - b * d, a * d + b * c], div: (z, [c, d]) => cpx.mul(z, [c / (c * c + d * d), -d / (c * c + d * d)]) };
  const r1 = raizes(2, -6, 3), [x5a, x5b] = raizes(1, -6, 8).map(Math.log2), z = cpx.div([1, 3], [1, 1]);
  const lg2 = 0.30, lg3 = 0.48, dados5 = [4.5, 7.5];
  const casos = [
    ['MAT01~0', Math.log2(32) === 5 && 2 ** 5 - 1 === 31, ['n = 5', '31']],
    ['MAT01~1', 25 + 18 - 7 === 36, ['36', '40 − 36 = 4']],
    ['MAT01~2', frac(27, 99) === '3/11', ['3/11']],
    ['MAT02~2', (5 * 2) - 3 === 7 && (5 - 3) * 2 === 4, ['= 7', '= 4']],
    ['MAT02~3', ((3 * 4 - 6) + 6) / 3 === 4, ['(x + 6)/3']],
    ['MAT03~3', r1.length === 2 && perto(1 / r1[0] + 1 / r1[1], 2), ['S/P = 2', 'Δ = 12']],
    ['MAT03~4', 2 * 4 - 16 + 3 === -5 && 8 / 4 === 2, ['−5', 'x = 2']],
    ['MAT03~5', raizes(1, -6, 9.0001).length === 0 && raizes(1, -6, 9).length === 2, ['k > 9']],
    ['MAT03~6', -2 + 4 + 1 === 3, ['máximo 3']],
    ['MAT04~2', raizes(1, -4, -5).join() === [-1, 5].join(), ['{−1, 5}']],
    ['MAT04~3', [...Array(21)].map((_, i) => i - 10).filter(x => Math.abs(x - 3) < 2).join() === '2,3,4', ['2, 3 e 4']],
    ['MAT05~5', perto(2000 * 1.05 ** 2, 2205) && 2000 * 1.1 === 2200, ['2.205,00']],
    ['MAT05~6', 80 * 0.5 ** 3 === 10, ['10 g']],
    ['MAT05~7', perto(x5a, 1) && perto(x5b, 2) && 4 ** 1 - 6 * 2 + 8 === 0 && 4 ** 2 - 6 * 4 + 8 === 0, ['{1, 2}']],
    ['MAT06~1', perto(2 * lg2 + lg3, 1.08) && perto(lg3 - lg2, 0.18), ['1,08', '0,18']],
    ['MAT06~3', perto(Math.log(32) / Math.log(8), 5 / 3), ['5/3']],
    ['MAT06~5', perto(2 - lg2, 1.7), ['1,70']],
    ['MAT06~7', perto(Math.log(9) / Math.log(3) + Math.log(1) / Math.log(3), 2) && raizes(1, -8, -9).join() === '-1,9', ['x = 9', 'x > 8']],
    ['MAT07~1', [...Array(50)].reduce((s, _, i) => s + 2 * i + 1, 0) === 2500, ['2500']],
    ['MAT07~4', perto(6 / (1 - 1 / 3), 9), ['= 9', '|q| < 1']],
    ['MAT07~5', 6 * 6 === 12 * 3 && 6 === (0 + 12) / 2, ['x = 3', 'x = 0']],
    ['MAT07~6', 3 + 7 + 11 === 21 && 3 * 11 === 33, ['3, 7 e 11']],
    ['MAT07~7', 2 * 6 * 18 === 216 && 6 / 2 === 18 / 6, ['2, 6 e 18']],
    ['MAT08~3', 3 ** 2 * -3 === -27, ['−27']],
    ['MAT08~7', 4 * -2 === -8, ['−8', '1/4']],
    ['MAT09~4', 2 * 3 - (-1) * 1 === 7, ['= 7']],
    ['MAT09~5', 4 - 2 * 2 === 0, ['k = 2', 'SI']],
    ['MAT09~6', 7 + 3 === 10 && 7 - 3 === 4, ['x = 7', 'y = 3']],
    ['MAT10~0', comb(10, 3) === 120 && 10 * 9 * 8 === 720, ['120', '720']],
    ['MAT10~3', fat(6) / (fat(3) * fat(2)) === 60, ['= 60']],
    ['MAT10~5', (3 - 1) ** 4 === 16, ['16']],
    ['MAT10~7', 8 + 1 === 9, ['9 termos', '5º']],
    ['MAT11~0', [...Array(30)].filter((_, i) => (i + 1) % 4 === 0).length === 7, ['7/30']],
    ['MAT11~2', [1, 2, 3, 4, 5, 6].filter(x => x % 2 === 0 || x > 3).length === 4, ['2/3']],
    ['MAT11~4', perto(0.2 / 0.6, 1 / 3), ['1/3']],
    ['MAT11~5', 1 - 0.5 ** 3 === 7 / 8, ['7/8']],
    ['MAT11~7', perto(3 / 5 * 2 / 4, 0.3) && perto((3 / 5) ** 2, 9 / 25), ['3/10', '9/25']],
    ['MAT12~0', media([7, 9]) === 8 && [12, 4, 9, 7, 2, 15].sort((a, b) => a - b)[2] === 7, ['= 8']],
    ['MAT12~3', media([2, 5, 8].map(x => (x - 5) ** 2)) === 6, ['= 6']],
    ['MAT12~5', media(dados5) === 6 && dp(dados5) === 1.5 && media(dados5.map(x => x + 1)) === 7 && dp(dados5.map(x => x + 1)) === 1.5 && media(dados5.map(x => 2 * x)) === 12 && dp(dados5.map(x => 2 * x)) === 3, ['média 7', 'média 12', 'desvio 3']],
    ['MAT12~6', 45 / 120 * 360 === 135, ['135°']],
    ['MAT13~6', perto(Math.acos((9 + 25 - 49) / 30) * 180 / Math.PI, 120), ['120°']],
    ['MAT14~0', 225 / 180 === 5 / 4 && perto(5 / 6 * 180, 150), ['5π/4', '150°']],
    ['MAT14~3', 3 - 2 * -1 === 5 && 3 - 2 * 1 === 1, ['[1, 5]']],
    ['MAT15~1', 35 + 70 === 105 && 180 - 105 === 75, ['105°']],
    ['MAT15~2', (8 - 2) * 180 / 8 === 135, ['135°']],
    ['MAT15~3', 8 * 5 / 2 === 20 && raizes(1, -3, -40).join() === '-5,8', ['n = 8']],
    ['MAT15~5', 10 * 2 ** 2 === 40, ['40 cm²']],
    ['MAT16~0', 110 / 2 === 55 && (360 - 110) / 2 === 125, ['55°', '125°']],
    ['MAT16~4', 90 / 360 * 16 === 4 && 90 / 360 * 2 * 4 === 2, ['4π cm²', '2π cm']],
    ['MAT17~6', 2 * 10 ** 3 === 2000, ['2000 L']],
    ['MAT18~4', Math.abs(3 * 2 + 4 * 1 + 5) / Math.hypot(3, 4) === 3, ['= 3']],
    ['MAT18~6', 6 / 2 === 3 && -4 / 2 === -2 && (6 / 2) ** 2 + (4 / 2) ** 2 + 12 === 25, ['(3, −2)', 'raio 5']],
    ['MAT19~1', 3 + 3 === 6 && 9 + 16 === 25, ['= 6', '= 25']],
    ['MAT19~3', perto(z[0], 2) && perto(z[1], 1), ['2 + i']],
    ['MAT19~5', perto(6 * Math.cos(Math.PI / 2), 0) && perto(6 * Math.sin(Math.PI / 2), 6), ['6i']],
    ['MAT20~0', 8 - 4 + 5 === 9, ['= 9']],
    ['MAT20~2', (1 - 2) ** 5 === -1 && (0 - 2) ** 5 === -32, ['−1', '−32']],
    ['MAT20~3', [-1, 2, 4].every(x => x ** 3 - 5 * x ** 2 + 2 * x + 8 === 0) && -1 + 2 + 4 === 5, ['= 5']],
    ['MAT20~4', -6 / 3 === -2, ['= −2']],
    ['MAT20~5', (-1 * 2) + (-1 * 4) + (2 * 4) === 2, ['= 2']],
    ['MAT01~5', [2, 4, 6, 8].filter(x => ![6, 8, 10].includes(x)).join() === '2,4', ['{2, 4}', '{10}']],
    ['MAT20~7', 4 + 4 === 8, ['4 + 4 = 8', 'x + 1']]
  ];
  const ruins = casos.filter(([id, conta, txt]) => !conta || !txt.every(t => card(id).includes(t))).map(([id]) => id);
  ok(!ruins.length, `${casos.length} cartões de Matemática: a conta recalculada confere com o verso` + (ruins.length ? ': ' + ruins.join(', ') : ''));
  const versoes = E.modulos.filter(m => m.m === 'mat').flatMap(m => m.fc.map(c => c[2] || 1));
  ok(versoes.length === 155 && versoes.filter(v => v === 2).length === 88 && versoes.filter(v => v === 1).length === 67, `Matemática: 155 cartões, 88 na versão 2 e 67 sem versão`);
}

/* Flashcards de Física com conta: o resultado é recalculado aqui, de forma independente, e precisa aparecer no verso. */
function testarContasFis(E) {
  console.log('\n== contas dos flashcards de Física (recalculadas)');
  const card = id => { const [m, i] = id.split('~'); const c = (E.modulos.find(x => x.id === m) || { fc: [] }).fc[+i]; return c ? c[1].replace(/<\/?[a-z][^>]*>/gi, ' ') : ''; };
  const perto = (a, b) => Math.abs(a - b) < 1e-9, g = 10;
  const casos = [
    ['FIS01~3', Math.abs(9 - 4) === 5 && 9 + 4 === 13, ['5 N ≤ R ≤ 13 N']],
    ['FIS02~0', (60 - 30) / 1.5 === 20 && (60 + 30) / 1.5 === 60, ['20 km/h', '60 km/h']],
    ['FIS02~1', 40 / 8 === 5, ['t = 5 s', 'retrógrado']],
    ['FIS02~2', perto(2 / (90 - 70), 0.1), ['20 km/h', '6 min']],
    ['FIS02~3', 25 / (60 + 40) === 0.25, ['100 km/h', '15 min']],
    ['FIS02~5', (35 - 10) / 5 === 5, ['5 m/s']],
    ['FIS03~2', 20 ** 2 / (2 * 5) === 40, ['40 m']],
    ['FIS03~3', 10 * 2 + 4 * 10 / 2 === 40, ['40 m']],
    ['FIS03~4', (8 - 24) / 4 === -4, ['−4 m/s²']],
    ['FIS03~5', Math.sqrt(2 * g * 5) === 10, ['10 m/s']],
    ['FIS04~2', perto(20 ** 2 * Math.sin(Math.PI / 3) / g, 20 * Math.sqrt(3)) && perto(Math.sin(Math.PI / 3), Math.sin(2 * Math.PI / 3)), ['20√3']],
    ['FIS04~4', 1800 / 60 === 30, ['30 Hz', '1/30 s']],
    ['FIS04~7', 90 * 20 / 6 === 300, ['300 rpm']],
    ['FIS05~3', 0.25 * 200 === 50, ['50 N']],
    ['FIS05~5', 50 * (g - 2) === 400, ['400 N']],
    ['FIS05~7', perto(5 / (2 / 0.04), 0.1), ['10 cm']],
    ['FIS06~5', 30 ** 2 / (2 * g) === 45, ['45 m']],
    ['FIS06~6', 1500 * 20 === 30000, ['30 kW']],
    ['FIS06~7', perto(15 * 8 * 30 / 1000, 3.6) && perto(3.6 * 0.8, 2.88), ['3,6 kWh', 'R$ 2,88']],
    ['FIS07~1', 0.5 * 12 === 6 && 6 / 300 === 0.02, ['6 N·s', '0,02 s']],
    ['FIS07~2', 0.02 * 400 / 2 === 4, ['4 N·s']],
    ['FIS07~5', 3000 * 4 / 4000 === 3 && 3000 * 4 ** 2 / 2 === 24000 && 4000 * 3 ** 2 / 2 === 18000, ['3 m/s', '24 000 J', '18 000 J']],
    ['FIS07~6', 6 / 10 === 0.6, ['0,6']],
    ['FIS07~7', 2 * 3 + 2 * 1 === 2 * 1 + 2 * 3 && (2 * 9 + 2 * 1) / 2 === 10, ['8 kg·m/s', '10 J']],
    ['FIS08~2', perto(Math.pow(27, 2 / 3), 9), ['= 9']],
    ['FIS08~4', 10 * 2 ** 2 === 40, ['40 m/s²']],
    ['FIS09~5', perto(60 * 1.2 / 0.8, 90), ['90 N']],
    ['FIS09~6', (1 * 0 + 2 * 3 + 1 * 6) / 4 === 3, ['3 m']],
    ['FIS10~2', 1000 * g * (7 - 2) === 5e4, ['5 × 10⁴ Pa']],
    ['FIS10~4', 100 * 1 / 5 === 20, ['20 cm']],
    ['FIS10~6', perto(1 - 0.9 / 1.0, 0.1), ['90%', '10%']],
    ['FIS10~7', 2 * g - 1000 * 500e-6 * g === 15, ['15 N']],
    ['FIS11~0', -40 / 5 === (-40 - 32) / 9, ['−40 °C = −40 °F']],
    ['FIS11~2', perto(20 * 1.2e-5 * (50 - 10), 9.6e-3), ['9,6 mm']],
    ['FIS12~1', perto(2 * 10 / 300 * 600 / 4, 10), ['10 L']],
    ['FIS12~2', -100 - (-300) === 200, ['+200 J']],
    ['FIS12~7', 1 - 300 / 600 === 0.5 && Math.round(100 * (1 - 27 / 327)) === 92, ['50%', '92%']],
    ['FIS13~3', 340 / 500 === 0.68 && 1500 / 500 === 3, ['0,68 m', '3 m']],
    ['FIS14~1', 360 / 90 - 1 === 3 && 360 / 45 - 1 === 7, ['n = 3', 'n = 7']],
    ['FIS14~2', perto(1 / (1 / 10 - 1 / 15), 30), ['30 cm', '−2']],
    ['FIS15~1', 2 * 2 ** 2 === 8, ['8F']],
    ['FIS15~2', (8 + 0) / 2 === 4 && (4 + 0) / 2 === 2 && 4 + 2 + 2 === 8, ['+4 μC', '+2 μC']],
    ['FIS16~3', 220 ** 2 / 4400 === 11 && 110 ** 2 / 11 === 1100, ['11 Ω', '1100 W']],
    ['FIS16~5', 12 * 4 / (12 + 4) === 3 && 12 / 12 + 12 / 4 === 12 / 3, ['3 Ω', '1 A', '3 A']],
    ['FIS16~6', 9 / (4 + 0.5) === 2 && 9 - 0.5 * 2 === 8 && 4 * 2 === 8, ['2 A', '8 V']],
    ['FIS17~7', 220 / 11 === 20 && 11 * 2 / 220 === 0.1, ['= 20', '0,1 A']],
    ['FIS18~1', 5 - 2 === 3 && 2.5 < 3, ['3,0 eV']],
    ['FIS18~12', 64 / 2 ** 4 === 4 && 20 / 4 === 5, ['T½ = 5 h']]
  ];
  const ruins = casos.filter(([id, conta, txt]) => !conta || !txt.every(t => card(id).includes(t))).map(([id]) => id);
  ok(!ruins.length, `${casos.length} cartões de Física: a conta recalculada confere com o verso` + (ruins.length ? ': ' + ruins.join(', ') : ''));
  const versoes = E.modulos.filter(m => m.m === 'fis').flatMap(m => m.fc.map(c => c[2] || 1));
  ok(versoes.length === 157 && versoes.filter(v => v === 2).length === 84 && versoes.filter(v => v === 1).length === 73, `Física: 157 cartões, 84 na versão 2 e 73 sem versão`);
}

module.exports = { carregarDados, testarDados, testarContasMat, testarContasFis, usar: f => { ok = f; } };
