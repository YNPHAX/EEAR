/* Auditoria independente da cópia IndexedDB de diários em 2f6cad6. Nenhum runtime é modificado.
   Usa Browser.crash, perfil persistente e inspeção da origem antes de carregar o app.
   Confirma a conclusão das transações por leituras readonly ordenadas, não por t.commit() retornar.
   Na arquitetura transacional, confere o estado completo do checkpoint comprometido; a segunda queda acontece imediatamente após essa confirmação, sem exigir a exclusão do checkpoint. Mesmas variáveis de F01. EEAR_DURAVEL_CENARIOS: marca,zerar,zerar-estudar,duas-quedas. */
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const hj = new Date().toISOString().slice(0, 10), delay = ms => new Promise(r => setTimeout(r, ms));
const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'DURAVEL-CERT', o: 'curso', t: 1792195200000 };
const leitura = p => p.evaluate(async () => {
  const ler = (nome, loja) => new Promise((resolve, reject) => {
    const o = window.indexedDB.open(nome, 1); o.onupgradeneeded = () => { o.transaction.abort(); }; o.onerror = () => resolve([]);
    o.onsuccess = () => { const db = o.result; if (!db.objectStoreNames.contains(loja)) { db.close(); resolve([]); return; }
      const t = db.transaction(loja, 'readonly'), r = t.objectStore(loja).openCursor(), out = [];
      r.onsuccess = () => { const c = r.result; if (c) { out.push({ k: c.key, v: c.value }); c.continue(); } };
      t.oncomplete = () => { db.close(); resolve(out); }; t.onerror = () => reject(t.error);
    };
  });
  const principal = JSON.parse(localStorage.getItem('missao-eear-v1') || 'null');
  const ls = Object.keys(localStorage).filter(k => k.startsWith('missao-eear-v1-diario#')).map(k => ({ k, d: JSON.parse(localStorage.getItem(k)) }));
  const idb = (await ler('eear-diarios', 'd')).filter(x => String(x.k).startsWith('missao-eear-v1-diario#')).map(x => ({ k: x.k, d: JSON.parse(x.v) }));
  const conta = (await ler('eear-operacoes', 'contas')).find(x => x.k === '');
  return { principal, ls, idb, checkpoint: conta && conta.v.st, geracao: conta && conta.v.gen };
});

const resumo = r => ({ checkpoint: r.checkpoint && { feito: r.checkpoint.feito, act: r.checkpoint.act, certsZ: r.checkpoint.cfg.certsZ || 0, certs: r.checkpoint.cfg.certs.map(c => c.c) }, geracao: r.geracao, principal: r.principal && { feito: r.principal.feito, act: r.principal.act, certsZ: r.principal.cfg.certsZ || 0, certs: r.principal.cfg.certs.map(c => c.c) }, ls: r.ls.map(x => ({ seq: x.d.seq, ts: x.d.ts, feito: x.d.st.feito, baseZ: x.d.base && x.d.base.cfg.certsZ || 0, z: x.d.st.cfg.certsZ || 0 })), idb: r.idb.map(x => ({ seq: x.d.seq, ts: x.d.ts, feito: x.d.st.feito, baseZ: x.d.base && x.d.base.cfg.certsZ || 0, z: x.d.st.cfg.certsZ || 0 })) });

(async () => {
  console.log('Durável independente: alvo ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'duravel-candidato.test.js'))) return;
  const f = await fixture.abrir(alvo), ancora = await f.contexto(), p0 = await f.pagina(ancora), url = p0.url(), origem = new URL(url).origin;
  const cenarios = (process.env.EEAR_DURAVEL_CENARIOS || 'marca,zerar,zerar-estudar,duas-quedas').split(','); let falhas = 0;
  const abrir = async dir => {
    const c = await chromium.launchPersistentContext(dir, { serviceWorkers: 'block' });
    if (process.env.EEAR_DURAVEL_SEM_TRAVAS === '1') await c.addInitScript(() => Object.defineProperty(navigator, 'locks', { get: () => undefined, configurable: true }));
    await c.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('exportação visível'); } }, configurable: true }));
    await c.route('**/*', r => {
      const u = new URL(r.request().url());
      if (u.origin === 'https://www.gstatic.com' && u.pathname.startsWith('/firebasejs/12.19.0/')) return r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(process.env.EEAR_FIREBASE_SDK, path.basename(u.pathname))) });
      if (u.origin === origem || (u.hostname === '127.0.0.1' && ['8180', '9199'].includes(u.port))) return r.continue();
      return r.abort();
    });
    return c;
  };
  const cair = async (ctx, p) => { const cdp = await ctx.newCDPSession(p), fechou = ctx.waitForEvent('close', { timeout: 10000 }); cdp.send('Browser.crash').catch(() => null); await fechou; };
  const sondar = async ctx => { const p = await ctx.newPage(); await p.goto(origem + '/sonda-duravel-sem-app'); const r = await leitura(p); await p.close(); return r; };
  try {
    for (const nome of cenarios) {
      if (!['marca', 'zerar', 'zerar-estudar', 'duas-quedas'].includes(nome)) throw new Error('Cenário desconhecido: ' + nome);
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-idb-indep-')); let ctx;
      try {
        ctx = await abrir(dir); let p = await ctx.newPage(); await p.goto(url);
        const seed = { v: 1, t: Date.now() - 20000, cfg: { nome: 'Durabilidade Fictícia', certs: [cert] }, mod: {}, fc: {}, sims: [], feito: { 'T:base': true }, act: { [hj]: 2 } };
        await f.importar(p, seed);
        if (!await f.ate(async () => await (async () => { const r = await leitura(p); return r.checkpoint ? r.checkpoint.feito['T:base'] : r.idb.some(x => x.d.st.feito['T:base']); })())) throw new Error('Não confirmou o diário inicial no IndexedDB.');
        await delay(6500); // principal e recibo antigos chegam ao disco; não fecha o escritor
        if (nome.startsWith('zerar')) { await f.clicar(p, 'tab', { v: 'plano' }); await f.clicar(p, 'zerar'); await p.waitForSelector('[data-a="zerarok"]'); await p.click('[data-a="zerarok"]'); }
        if (nome !== 'zerar') await f.clicar(p, 'marcar', { k: 'T:novo' });
        const aceito = await f.estado(p), antes = await leitura(p);
        const atual = antes.ls.reduce((a, b) => !a || b.d.seq > a.d.seq ? b : a, null);
        const campos = s => JSON.stringify([s.feito, s.act, s.cfg.certsZ || 0, s.cfg.certs]);
        const confirmouIDB = antes.checkpoint ? campos(antes.checkpoint) === campos(aceito) : atual && antes.idb.some(x => x.k === atual.k && x.d.seq === atual.d.seq);
        if (!confirmouIDB || (nome.startsWith('zerar') && (!aceito.cfg.certsZ || aceito.feito['T:base'])) || (nome !== 'zerar' && !aceito.feito['T:novo'])) throw new Error('Não comprovou aceitação e commit efetivo do diário novo.');
        await delay(300); await cair(ctx, p); ctx = null;
        if (nome === 'duas-quedas') await delay(2500); // diário confirmado, mas já além da carência de 2 s na recuperação
        ctx = await abrir(dir); const antesDoApp = await sondar(ctx);
        p = await ctx.newPage(); await p.goto(url);
        const esperado = s => !!s && (nome.startsWith('zerar') ? !s.feito['T:base'] && !s.cfg.certs.length && s.cfg.certsZ > 0 && (nome === 'zerar' ? Object.keys(s.feito).length === 0 : !!s.feito['T:novo'] && s.act[hj] === 1) : !!s.feito['T:base'] && !!s.feito['T:novo'] && s.act[hj] === 3 && s.cfg.certs.some(c => c.c === cert.c));
        let primeira; const recuperou = await f.ate(async () => { primeira = await f.estado(p); return esperado(primeira); }, 10000);
        let depoisLimpeza = null, segundaPre = null, segundoEstado = null, recuperouSegunda = null;
        if (nome === 'duas-quedas' && recuperou) {
          const limpou = await f.ate(async () => { depoisLimpeza = await leitura(p); return depoisLimpeza.checkpoint ? esperado(depoisLimpeza.checkpoint) : !depoisLimpeza.idb.some(x => x.d.st.feito['T:novo']); }, 4000);
          if (!limpou) throw new Error('Não confirmou o checkpoint durável ou a limpeza do espelho na janela observada.');
          await cair(ctx, p); ctx = null; ctx = await abrir(dir); segundaPre = await sondar(ctx); p = await ctx.newPage(); await p.goto(url);
          recuperouSegunda = await f.ate(async () => { segundoEstado = await f.estado(p); return esperado(segundoEstado); }, 10000);
        }
        const passou = recuperou && (nome !== 'duas-quedas' || recuperouSegunda);
        console.log(`${passou ? '✓' : '✗'} ${nome}: ${JSON.stringify({ aceito: { feito: aceito.feito, act: aceito.act, z: aceito.cfg.certsZ || 0 }, confirmouIDB, antes: resumo(antes), antesDoApp: resumo(antesDoApp), recuperou, primeira: { feito: primeira.feito, act: primeira.act, z: primeira.cfg.certsZ || 0, certs: primeira.cfg.certs.map(c => c.c) }, depoisLimpeza: depoisLimpeza && resumo(depoisLimpeza), segundaPre: segundaPre && resumo(segundaPre), recuperouSegunda, segundoEstado: segundoEstado && { feito: segundoEstado.feito, act: segundoEstado.act } })}`); if (!passou) falhas++;
      } catch (e) { console.log(`✗ ${nome}: FALHA DE PREPARAÇÃO/EXECUÇÃO: ${e.message}`); falhas++; }
      finally { if (ctx) await ctx.close().catch(() => null); fs.rmSync(dir, { recursive: true, force: true }); }
    }
  } finally { await ancora.close(); await f.fechar(); }
  console.log(`Durável: ${falhas} falha(s) em ${cenarios.length} cenários.`); process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
