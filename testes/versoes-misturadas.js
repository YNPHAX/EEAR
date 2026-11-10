/* Campanha com versões misturadas na mesma nuvem do curso no Claude, com os builds REAIS (ferramenta de integração,
   fora do CI). Em cada rodada, dois aparelhos com a versão nova e um com a versão anterior abrem a mesma conta numa nuvem
   fictícia em memória (latência aleatória, trava doc.acquire, documentos por caminho, nenhum serviço real), marcam
   tarefas ao mesmo tempo, a versão anterior fecha, e os aparelhos novos marcam mais uma vez. A nuvem começa com um
   progresso só dela no caminho antigo (progresso/<id>), como o de um aparelho que não abre mais o curso.
   Regras da nuvem fictícia (quarto argumento): "novas" (padrão) segue as regras propostas para a versão nova: o caminho
   antigo fica só para leitura; "antigas" deixa o aluno gravar nos dois caminhos (as regras de hoje, ou um esquecimento).
   Confere: nenhuma marcação feita nos aparelhos novos e nada do que só existia na nuvem se perde, na nuvem nem neles.
   O que a versão anterior grava é informado: com as regras novas, a gravação dela é recusada e fica no aparelho dela.
   Uso: node testes/versoes-misturadas.js <site da versão anterior> <site da versão nova> [rodadas] [novas|antigas]
   Os sites vêm de web/build.py. Requer o pacote playwright com o Chromium. Sai com código 1 se houver perda. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const [ANTERIOR, NOVA] = process.argv.slice(2, 4).map(p => path.resolve(p || '')), RODADAS = Number(process.argv[4]) || 5, REGRAS = process.argv[5] === 'antigas' ? 'antigas' : 'novas';
if (!process.argv[3]) { console.error('Uso: node testes/versoes-misturadas.js <site anterior> <site novo> [rodadas] [novas|antigas]'); process.exit(2); }
function servir(raiz) {
  const srv = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split('?')[0]); let f = path.join(raiz, u.replace(/^\/EEAR\/?/, '/'));
    if (f.endsWith(path.sep)) f = path.join(f, 'index.html');
    if (!u.startsWith('/EEAR/') || !f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' }); fs.createReadStream(f).pipe(r);
  });
  return new Promise(res => srv.listen(0, '127.0.0.1', () => res({ url: `http://127.0.0.1:${srv.address().port}/EEAR/`, fechar: () => srv.close() })));
}
const espera = ms => new Promise(r => setTimeout(r, ms)), lat = () => espera(40 + Math.random() * 260);
async function rodada(b, nova, anterior, n) {
  /* Documentos por caminho; a versão nova usa progresso2/aluno1, a anterior progresso/aluno1. */
  const N = { docs: { 'progresso/aluno1': { v: 1, t: Date.now() - 3600000, cfg: {}, mod: {}, fc: {}, erros: { 'MAT03-2': 1 }, sims: [], feito: { 'T:so-na-nuvem': true }, act: {}, aula: {}, ap: {} } }, travas: {}, sets: 0, recusadas: 0 };
  /* EEAR_CAMINHO=progresso: compara com uma versão nova anterior à barreira, que sincroniza no caminho antigo. */
  const NOVO = process.env.EEAR_CAMINHO === 'progresso' ? 'progresso/aluno1' : 'progresso2/aluno1';
  const pode = p => p === NOVO || (REGRAS === 'antigas' && p === 'progresso/aluno1');
  const noDoc = () => (N.docs[NOVO] && N.docs[NOVO].feito) || {};
  async function aparelho(url, nome) {
    const ctx = await b.newContext({ serviceWorkers: 'block' }), erros = [];
    await ctx.exposeFunction('__g', async p => { await lat(); return N.docs[p] == null ? null : JSON.parse(JSON.stringify(N.docs[p])); });
    await ctx.exposeFunction('__s', async (p, o) => { await lat(); if (!pode(p)) { N.recusadas++; return 'invalid_argument'; } N.docs[p] = JSON.parse(JSON.stringify(o)); N.sets++; return ''; });
    await ctx.exposeFunction('__a', async (p, h, ttl) => { await lat(); const ag = Date.now(), t = N.travas[p]; if (t && t.ate > ag && t.h !== h) return { acquired: false, expiresAt: new Date(t.ate).toISOString() }; N.travas[p] = { h, ate: ag + ttl }; return { acquired: true, holder: h, expiresAt: new Date(ag + ttl).toISOString() }; });
    await ctx.addInitScript(() => { window.claude = { use: async k => k === 'user' ? { id: async () => 'aluno1' } : { doc: p => ({ get: async () => { const x = await window.__g(p); return { exists: x != null, data: () => x }; }, set: async o => { const r = await window.__s(p, o); if (r) { const e = new Error(r); e.code = r; throw e; } }, acquire: o => window.__a(p, o.holder, o.ttlMs) }) } }; });
    const p = await ctx.newPage(); p.on('pageerror', e => erros.push(e.message));
    await p.goto(url); await p.waitForTimeout(800);
    const marcar = k => p.evaluate(k => { const x = document.createElement('button'); x.dataset.a = 'marcar'; x.dataset.k = k; document.body.appendChild(x); x.click(); x.remove(); }, k);
    /* A versão nova guarda o progresso da conta em missao-eear-v1@claude:aluno1; a anterior, em missao-eear-v1. */
    const feito = () => p.evaluate(() => { const o = JSON.parse(localStorage.getItem('missao-eear-v1@claude:aluno1') || localStorage.getItem('missao-eear-v1') || 'null'); return (o && o.feito) || {}; });
    return { p, ctx, erros, marcar, feito, nome };
  }
  /* A versão anterior abre primeiro (lê a nuvem). Depois, um aparelho novo X estuda uma vez e fecha: o que ele gravou
     só existe na nuvem (nenhum outro aparelho tem). */
  const V = await aparelho(anterior, 'V'); await espera(1500);
  const X = await aparelho(nova, 'X'); await espera(2500); await X.marcar('T:X-unico');
  for (let t = 0; t < 30 && !noDoc()['T:X-unico']; t++) await espera(500);
  await espera(1000); await X.ctx.close();
  const A = await aparelho(nova, 'A'), B = await aparelho(nova, 'B');
  await espera(3000);
  const marcas = { A: [], B: [], V: [] };
  for (let r = 0; r < 8; r++) {
    await Promise.all([A, B, V].map(async d => { const k = `T:${d.nome}${r}`; marcas[d.nome].push(k); await d.marcar(k); }));
    await espera(700 + Math.random() * 1500);
  }
  await V.ctx.close(); await espera(4000); // a aba da versão anterior fecha
  for (const d of [A, B]) { await d.marcar('T:fim' + d.nome); marcas[d.nome].push('T:fim' + d.nome); }
  const novas = marcas.A.concat(marcas.B, ['T:so-na-nuvem', 'T:X-unico']);
  for (let t = 0; t < 40 && novas.some(k => !noDoc()[k]); t++) await espera(1000); // a nuvem completa (trava de 5 s, conferências)
  /* Reabrir faz cada aparelho receber a nuvem (a trava de 5 s pode atrasar): espera até 40 s. O que não chegar depois
     disso conta como perda. */
  await A.p.reload(); await B.p.reload();
  const falta = s => novas.filter(k => !s[k]);
  for (let t = 0; t < 40; t++) { const [x, y] = [await A.feito(), await B.feito()]; if (!falta(x).length && !falta(y).length) break; await espera(1000); }
  await espera(2000);
  const nuvem = noDoc(), fa = await A.feito(), fb = await B.feito();
  const perda = falta(nuvem).length + falta(fa).length + falta(fb).length;
  const doAntigo = (N.docs['progresso/aluno1'] || {}).feito || {};
  console.log(`  ${perda ? '✗' : '✓'} rodada ${n}: ${novas.length} marcações (dos aparelhos novos e a que só existia na nuvem); faltam na nuvem ${falta(nuvem).length}, no A ${falta(fa).length}, no B ${falta(fb).length}` +
    ` · da versão anterior: no caminho novo ${marcas.V.filter(k => nuvem[k]).length}/${marcas.V.length}, no antigo ${marcas.V.filter(k => doAntigo[k]).length}/${marcas.V.length} · gravações: ${N.sets}, recusadas: ${N.recusadas}` + (perda ? ` · faltam: ${[...new Set(falta(nuvem).concat(falta(fa), falta(fb)))].join(',')}` : ''));
  const erros = [A, B].reduce((a, d) => a.concat(d.erros), []);
  if (erros.length) console.log('    erro de JavaScript na versão nova: ' + erros[0]);
  await A.ctx.close(); await B.ctx.close();
  return !perda && !erros.length;
}
(async () => {
  const sa = await servir(ANTERIOR), sn = await servir(NOVA), b = await chromium.launch();
  console.log(`== versões misturadas: 2 aparelhos novos + 1 com a versão anterior, ${RODADAS} rodadas, regras ${REGRAS}`);
  let ruins = 0;
  for (let i = 1; i <= RODADAS; i++) if (!(await rodada(b, sn.url, sa.url, i))) ruins++;
  await b.close(); sa.fechar(); sn.fechar();
  console.log(ruins ? `\n${ruins} de ${RODADAS} rodadas com perda ou erro` : `\ntudo certo: nenhuma perda em ${RODADAS} rodadas`);
  process.exit(ruins ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
