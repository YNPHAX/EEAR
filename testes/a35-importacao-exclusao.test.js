/* Auditoria a35ea9a: controles de mutação após a última conferência de uma exclusão.
   Bundle intocado. Breakpoint nativo após editar(), antes de put(). Firebase sempre bloqueado. */
const path = require('path'), fs = require('fs'), assert = require('assert');
const fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const hj = new Date().toISOString().slice(0, 10);
(async () => {
  const f = await fixture.abrir(alvo); let falhas = 0;
  try {
    for (const locks of [true, false]) for (const modo of ['marcar-controle', 'importacao', 'importacao-sem-crash']) {
      const ctx = await f.contexto();
      try {
        if (!locks) await ctx.addInitScript(() => Object.defineProperty(navigator, 'locks', { value: undefined }));
        await ctx.route(/http:\/\/127\.0\.0\.1:(8180|9199)\//, r => r.abort());
        const A = await f.pagina(ctx); await f.importar(A, { v: 1, cfg: { nome: 'Base Fictícia' }, feito: { 'T:base': true }, act: { [hj]: 2 } });
        await A.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado');
        const B = await f.pagina(ctx); assert(await f.ate(async () => (await f.estado(B)).feito['T:base']));
        const d = await ctx.newCDPSession(A); await d.send('Debugger.enable');
        const linha = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n').findIndex(l => l.includes('if (resultado !== undefined)'));
        assert(linha >= 0, 'Ponto crítico precisa existir no runtime auditado.');
        const bp = await d.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', A.url()).href, lineNumber: linha,
          condition: 'resultado && resultado.apagado === true && (!q.result || q.result.gen !== resultado.gen)' });
        const pausa = new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Exclusão não alcançou breakpoint')), 15000); d.once('Debugger.paused', p => { clearTimeout(t); resolve(p); }); });
        await f.clicar(A, 'dadosapagar'); const apagando = f.clicar(A, 'dadosapagarok').catch(() => null); const ponto = await pausa;
        const prova = await d.send('Debugger.evaluateOnCallFrame', { callFrameId: ponto.callFrames[0].callFrameId, returnByValue: true,
          expression: '({geracaoAnterior:q.result.gen,geracaoNova:resultado.gen,apagado:resultado.apagado,ignoradas:Object.keys(resultado.ignoradas||{})})' });
        const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'IMPORTACAO-APOS-CORTE', o: 'curso', t: 1792195200000 };
        if (modo === 'marcar-controle') await f.clicar(B, 'marcar', { k: 'T:posterior-corte' });
        else await f.importar(B, { v: 1, cfg: { nome: 'Importação Fictícia', certs: [cert] }, feito: { 'T:posterior-corte': true }, act: { [hj]: 3 } });
        const aceito = await f.estado(B); assert(aceito.feito['T:posterior-corte']); assert.strictEqual(aceito.act[hj], 3);
        const reservas = await B.evaluate(() => Object.entries(localStorage).filter(([k]) => k.startsWith('missao-eear-v1-diario#')).map(([k, v]) => ({ k, d: JSON.parse(v) })));
        const pendente = reservas.find(x => x.d.st && x.d.st.feito['T:posterior-corte']); assert(pendente, 'A aceitação precisa ter uma reserva real.');
        const antesCrash = { local: pendente.d.local, gen: pendente.d.gen, id: pendente.d.id };
        if (modo !== 'importacao-sem-crash') { const cdpB = await ctx.newCDPSession(B), caiu = B.waitForEvent('crash'); cdpB.send('Page.crash').catch(() => null); await caiu; await B.close(); }
        await d.send('Debugger.removeBreakpoint', { breakpointId: bp.breakpointId }); await d.send('Debugger.resume'); await apagando;
        const C = await f.pagina(ctx); let recuperado;
        const voltou = await f.ate(async () => { recuperado = await f.estado(C); return recuperado.feito['T:posterior-corte']; }, 7000);
        const certificado = modo === 'marcar-controle' || recuperado.cfg.certs.some(x => x.c === cert.c);
        const checkpoint = await C.evaluate(() => new Promise(resolve => { const o = window.indexedDB.open('eear-operacoes', 1); o.onsuccess = () => { const db = o.result, t = db.transaction('contas', 'readonly'), q = t.objectStore('contas').get(''); t.oncomplete = () => { db.close(); resolve(q.result); }; }; }));
        const recuperacao = await C.evaluate(() => new Promise(resolve => { const o = window.indexedDB.open('eear-operacoes', 1); o.onsuccess = () => { const db = o.result, t = db.transaction('quarentena', 'readonly'), q = t.objectStore('quarentena').getAll(); t.oncomplete = () => { db.close(); resolve({ copias: q.result.length, lsRec: localStorage.getItem('missao-eear-v1-recuperar') }); }; }; }));
        const restouReserva = await C.evaluate(id => Object.values(localStorage).some(x => { try { return JSON.parse(x).id === id; } catch (e) { return false; } }), antesCrash.id);
        const passou = voltou && certificado && recuperado.act[hj] === 1 && checkpoint.st.feito['T:posterior-corte'];
        console.log(`${passou ? '✓' : '✗'} ${modo}, locks=${locks}: ${JSON.stringify({ recuperacao, ignoradaExplicitamente: !!(checkpoint.ignoradas || {})[antesCrash.id], provaCorte: prova.result.value, aceito: aceito.feito, atividadeAceita: aceito.act[hj], antesCrash, voltou: !!voltou, feitoFinal: recuperado.feito, atividadeFinal: recuperado.act[hj], certificado, checkpoint: checkpoint.st.feito, restouReserva, aviso: await C.locator('#sync').innerText() })}`);
        if (!passou) falhas++;
      } finally { await ctx.close(); }
    }
  } finally { await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error('FALHA DE PREPARAÇÃO:', e); process.exitCode = 1; });
