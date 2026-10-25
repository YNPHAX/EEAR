/* Conteúdo do curso: aulas, questões, cartões, vídeos e provas oficiais, sem abrir o navegador.
   Uso: node testes/dados.test.js [pasta_do_projeto] */
const fs = require('fs'), path = require('path');
const { RAIZ, relatorio, carregarDados } = require('./lib/base');

function testarDados(fonte = RAIZ) {
  const r = relatorio('Conteúdo do curso (aulas, questões, cartões, vídeos, provas)');
  const { EEAR, arquivos } = carregarDados(fonte);
  const M = EEAR.modulos, MATS = ['por', 'ing', 'mat', 'fis'];
  r.ok(arquivos.length > 0, `${arquivos.length} arquivos de dados carregados sem erro`);

  // aulas
  const ids = M.map(m => m.id);
  r.igual(ids.length, new Set(ids).size, `${M.length} aulas, sem id repetido`);
  r.ok(M.every(m => MATS.includes(m.m)), 'toda aula pertence a uma das 4 matérias');
  r.nota('aulas por matéria: ' + MATS.map(s => `${s} ${M.filter(m => m.m === s).length}`).join(', '));
  const curtas = M.filter(m => !m.teoria || m.teoria.replace(/<[^>]+>/g, '').length < 300).map(m => m.id);
  r.igual(curtas, [], 'toda aula tem teoria (mais de 300 caracteres)');
  r.igual(M.filter(m => !(m.ex || []).length).map(m => m.id), [], 'toda aula tem exemplos resolvidos');
  r.igual(M.filter(m => !(m.fc || []).length).map(m => m.id), [], 'toda aula tem flashcards');

  // questões inéditas: 4 alternativas diferentes, índice da correta válido e comentário
  const ruins = [];
  M.forEach(m => (m.q || []).forEach((q, i) => {
    if (!q[0] || !Array.isArray(q[1]) || q[1].length !== 4 || new Set(q[1]).size !== 4 || !(q[2] >= 0 && q[2] <= 3) || !q[3]) ruins.push(`${m.id} q${i + 1}`);
  }));
  r.igual(ruins, [], `${M.reduce((a, m) => a + m.q.length, 0)} questões inéditas no formato certo`);
  r.igual(M.filter(m => (m.q || []).length < 10).map(m => m.id), [], 'toda aula tem pelo menos 10 questões no quiz');
  r.igual(M.reduce((a, m) => a.concat(m.fc.filter(c => !c[0] || !c[1]).map(() => m.id)), []), [], `${M.reduce((a, m) => a + m.fc.length, 0)} flashcards com frente e verso`);

  // videoaulas
  const VA = EEAR.videoaulas || {};
  const vids = Object.entries(VA).flatMap(([mod, vs]) => vs.map(v => ({ mod, ...v })));
  r.igual(M.filter(m => !(VA[m.id] || []).length).map(m => m.id), [], `${vids.length} videoaulas; toda aula tem pelo menos uma`);
  r.igual(vids.filter(v => !/^[\w-]{11}$/.test(v.id) || !v.t || !v.c || !['a', 'q', 'y'].includes(v.k)).map(v => v.mod + ' ' + v.id), [], 'vídeos com id do YouTube, título, canal e tipo');
  r.igual(Object.keys(VA).filter(k => !ids.includes(k)), [], 'vídeos só de aulas que existem');

  // provas oficiais
  const P = EEAR.provas || [];
  r.ok(P.length > 0, `${P.length} provas oficiais: ${P.map(p => p.nome).join(', ')}`);
  P.forEach(p => {
    const prob = [];
    if (p.q.length !== 96) prob.push(`${p.q.length} questões`);
    const porMat = {}; p.q.forEach(q => { porMat[q.m] = (porMat[q.m] || 0) + 1; });
    if (MATS.some(s => porMat[s] !== 24)) prob.push('matérias ' + JSON.stringify(porMat));
    p.q.forEach((q, i) => {
      if (q.n !== i + 1) prob.push(`ordem q${q.n}`);
      if (!ids.includes(q.mod)) prob.push(`q${q.n} aula ${q.mod} não existe`);
      if (!(q.c >= 0 && q.c <= 3)) prob.push(`q${q.n} gabarito`);
      if (!fs.existsSync(path.join(fonte, 'curso', p.dir, q.img))) prob.push(`q${q.n} imagem ${q.img} não existe`);
      if (q.t && !(p.textos || {})[q.t]) prob.push(`q${q.n} texto-base ${q.t} não existe`);
    });
    Object.values(p.textos || {}).flat().forEach(t => { if (!fs.existsSync(path.join(fonte, 'curso', p.dir, t.img))) prob.push(`texto ${t.img} não existe`); });
    r.igual(prob, [], `${p.nome}: 96 questões, 24 por matéria, gabarito, aula, imagens e textos (${p.q.filter(q => q.anulada).length} anuladas)`);
  });

  // gabarito do provas.js igual ao registrado em ferramentas/provas/provas.json (quando existir)
  const pj = path.join(fonte, 'ferramentas', 'provas', 'provas.json');
  if (fs.existsSync(pj)) {
    const regs = JSON.parse(fs.readFileSync(pj, 'utf8'));
    regs.forEach(x => {
      const p = P.find(y => y.id === x.id);
      const gab = p ? p.q.map(q => q.anulada ? 'X' : 'ABCD'[q.c]).join('') : null;
      r.igual(gab, x.gab, `${x.nome}: gabarito do curso igual ao de provas.json`);
    });
  } else r.nota('sem ferramentas/provas/provas.json nesta versão: gabaritos conferidos só pelo formato');

  // calendário de provas
  const CAL = EEAR.calendario || [];
  r.ok(CAL.length > 0 && CAL.every(c => /^\d{4}-\d{2}-\d{2}$/.test(c.d) && c.nome), `calendário com ${CAL.length} provas e datas válidas`);
  return r;
}

if (require.main === module) {
  const r = testarDados(path.resolve(process.argv[2] || RAIZ));
  r.imprimir(); process.exit(r.falhas() ? 1 : 0);
}
module.exports = { testarDados };
