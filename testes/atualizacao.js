/* Atualização e reversão com os builds reais de duas versões (por exemplo, a main e o resultado de um merge), servidas
   na mesma origem, porque o localStorage é por origem, como no navegador do aluno: /a/ = versão anterior, /b/ = nova.
   1. o aluno estuda na versão anterior (progresso realista e ações pela interface);
   2. abre a versão nova: nada some (aulas, notas, cartões, erros, tarefas, simulados, nome);
   3. estuda na versão nova;
   4. reversão: a versão anterior volta ao ar e abre o progresso gravado pela nova, sem erro e sem perder estudo;
   5. volta à versão nova: o estudo feito nas duas continua.
   Ferramenta de integração (não faz parte de testes/plataforma.test.js; requer o playwright com o Chromium).
   Uso: node testes/atualizacao.js <site da versão anterior> <site da versão nova> (pastas geradas por web/build.py) */
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const [A, B] = process.argv.slice(2).map(p => path.resolve(p));
const tipos = { js: 'text/javascript', html: 'text/html; charset=utf-8', css: 'text/css', webp: 'image/webp', png: 'image/png', svg: 'image/svg+xml', woff2: 'font/woff2', webmanifest: 'application/manifest+json' };
let falhas = 0; const ok = (c, m) => { console.log(`${c ? '  ✓' : '  ✗'} ${m}`); if (!c) falhas++; };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const raiz = u.startsWith('/a/') ? A : u.startsWith('/b/') ? B : null; if (!raiz) { r.writeHead(404); return r.end(); }
  let f = path.join(raiz, u.slice(3)); if (u.endsWith('/')) f = path.join(f, 'index.html'); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': tipos[path.extname(f).slice(1)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const base = `http://127.0.0.1:${srv.address().port}`;
  const b = await chromium.launch(), ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } }), p = await ctx.newPage(), erros = [];
  p.on('pageerror', e => erros.push(e.message));
  const LS = 'missao-eear-v1';
  const temFc = (st, id) => Object.keys(st.fc).some(k => k.startsWith(id + '~'));
  const ler = () => p.evaluate(k => JSON.parse(localStorage.getItem(k)), LS);
  const clicar = (a, d) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d || {}); document.body.appendChild(x); x.click(); x.remove(); }, [a, d || {}]);
  const abrir = async v => { await p.goto(`${base}/${v}/`); await p.waitForTimeout(600); };
  // progresso de quem estudou na versão publicada: aulas, quiz, cartões, simulado, erros, apostila, certificado
  const P = { v: 1, t: Date.now() - 86400000, cfg: { nome: 'Aluna Antiga', alvo: 'cfs2-2027', prova: '2027-05-30', inicio: '2026-10-01', horas: 3, dias: [0, 1, 2, 3, 4, 5, 6], excl: [] },
    mod: { POR01: { lido: '2026-10-02', best: 0.9, tent: 2, ok: '2026-10-02' }, MAT01: { lido: '2026-10-03', best: 0.6, tent: 1 }, FIS02: { lido: '2026-10-04', best: 1, tent: 1, ok: '2026-10-04' } },
    fc: { 'POR01~0': [2, 20400], 'MAT01~1': [1, 20390], 'FIS02~0': [3, 20410], 'ING07~2': [1, 20395] }, erros: { 'MAT01-2': 1 },
    sims: [{ d: '2026-10-05', tipo: 'materia', mat: 'por', prova: null, r: { por: [18, 24] }, min: 50 }], feito: { 'T:antigo': true }, act: { '2026-10-02': 3 }, aula: {}, ap: {}, diag: null, ativo: null, ult: null, ultAula: 'POR01' };
  console.log('\n== 1. estudo na versão anterior');
  await abrir('a'); await p.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [LS, P]); await abrir('a');
  await clicar('marcar', { k: 'T:na-main' }); await clicar('fcmod', { id: 'POR02' }); await p.waitForTimeout(200);
  await clicar('fcvirar'); await clicar('fcaval', { ok: '1' }); await p.waitForTimeout(300);
  const p1 = await ler();
  ok(p1.feito['T:na-main'] && temFc(p1, 'POR02') && p1.mod.POR01 && !erros.length, 'na versão anterior: o progresso antigo abre e o aluno marca uma tarefa e revisa um cartão' + (erros[0] ? ' — ' + erros[0] : ''));
  console.log('\n== 2. atualização para a versão nova');
  await abrir('b'); await clicar('tab', { v: 'hoje' }); await p.waitForTimeout(300); const p2 = await ler(), txt = await p.locator('main').innerText();
  const mesmos = k => JSON.stringify(Object.keys(p1[k]).sort()) === JSON.stringify(Object.keys(p2[k]).sort());
  ok(mesmos('mod') && mesmos('fc') && mesmos('erros') && mesmos('feito') && p2.sims.length === p1.sims.length && p2.cfg.nome === 'Aluna Antiga' && JSON.stringify(p2.mod) === JSON.stringify(p1.mod), 'na versão nova: aulas, notas, cartões, erros, tarefas, simulados e o nome continuam iguais');
  ok(!erros.length && /Aluna Antiga|Hoje|Continuar/i.test(txt), 'na versão nova: abre sem erro de JavaScript' + (erros[0] ? ' — ' + erros[0] : ''));
  await clicar('marcar', { k: 'T:no-novo' }); await clicar('fcmod', { id: 'MAT02' }); await p.waitForTimeout(200); await clicar('fcvirar'); await clicar('fcaval', { ok: '0' }); await p.waitForTimeout(300);
  const p3 = await ler();
  ok(p3.feito['T:no-novo'] && temFc(p3, 'MAT02'), 'na versão nova: o aluno estuda (tarefa e cartão)');
  console.log('\n== 3. reversão: a versão anterior volta ao ar');
  await abrir('a'); await clicar('tab', { v: 'plano' }); await p.waitForTimeout(300); await clicar('tab', { v: 'treino' }); await p.waitForTimeout(300); await clicar('tab', { v: 'hoje' }); await p.waitForTimeout(300);
  await clicar('marcar', { k: 'T:depois-da-volta' }); await p.waitForTimeout(300);
  const p4 = await ler();
  ok(!erros.length, 'versão anterior com o progresso gravado pela nova: abre Hoje, Plano e Treino sem erro de JavaScript' + (erros[0] ? ' — ' + erros[0] : ''));
  const perdeu = ['mod', 'fc', 'erros', 'feito'].flatMap(k => Object.keys(p3[k]).filter(x => !(x in p4[k])).map(x => k + ':' + x));
  ok(!perdeu.length && p4.sims.length === p3.sims.length && p4.feito['T:depois-da-volta'], 'versão anterior com o progresso da nova: nenhum estudo some' + (perdeu.length ? ' — sumiu ' + perdeu.join(', ') : ''));
  const cfgPerdida = Object.keys(p3.cfg).filter(k => !(k in p4.cfg));
  console.log(`  (configuração da versão nova que a anterior descarta ao gravar: ${cfgPerdida.length ? cfgPerdida.join(', ') : 'nada'})`);
  console.log('\n== 4. volta ao app novo');
  await abrir('b'); await p.waitForTimeout(300); const p5 = await ler();
  const diagnostico = await p.evaluate(() => new Promise(resolve => {
    const o = window.indexedDB.open('eear-operacoes', 1); o.onerror = () => resolve({ erro: String(o.error) });
    o.onsuccess = () => { const db = o.result, t = db.transaction(['contas', 'quarentena'], 'readonly'), q = t.objectStore('contas').get(''), r = t.objectStore('quarentena').getAll();
      t.oncomplete = () => { db.close(); resolve({ feitoCheckpoint: q.result && q.result.st.feito, recuperar: localStorage.getItem('missao-eear-v1-recuperar'), copiasComEstudo: r.result.filter(x => String(x.texto).includes('T:depois-da-volta')).length }); };
    };
  }));
  console.log('DIAGNÓSTICO retorno de versão: ' + JSON.stringify(diagnostico));
  ok(!erros.length && p5.feito['T:no-novo'] && p5.feito['T:depois-da-volta'] && p5.feito['T:na-main'] && temFc(p5, 'MAT02') && temFc(p5, 'POR02'), 'de volta à versão nova: o estudo feito nas duas continua');
  // Mantém a exigência automática acima. Este controle adicional distingue perda definitiva de recuperação manual.
  const ofereceuCopia = await p.locator('[data-a="reccopiar"]').count() > 0;
  ok(ofereceuCopia && diagnostico.recuperar && diagnostico.recuperar.includes('T:depois-da-volta') && diagnostico.copiasComEstudo > 0, 'reversão: cópia do estudo legado preservada em quarentena e oferecida pela interface');
  if (diagnostico.recuperar) {
    await clicar('tab', { v: 'plano' }); await clicar('impabrir'); await p.fill('#imp-txt', diagnostico.recuperar); await clicar('impok');
    await p.waitForFunction(() => { const s = JSON.parse(localStorage.getItem('missao-eear-v1') || 'null'); return s && s.feito['T:depois-da-volta']; });
    await abrir('b'); const recuperado = await ler();
    ok(!erros.length && recuperado.feito['T:no-novo'] && recuperado.feito['T:depois-da-volta'] && recuperado.feito['T:na-main'] && temFc(recuperado, 'MAT02') && temFc(recuperado, 'POR02'), 'reversão: recuperação explícita pela UI preserva o estudo das duas versões após reabrir');
  }
  await b.close(); srv.close();
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo'); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
