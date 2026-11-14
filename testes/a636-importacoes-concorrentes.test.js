/* Segunda auditoria: importa os MESMOS bytes em 2/3 importadoras e uma aba observadora sobre a mesma base, sem mudar o bundle.
   Pausa nativa numa transação observadora SEM alterações; nenhuma importação confirma antes da liberação.
   Controle com backup v2 demonstra a diferença entre identidade preservada e delta de snapshot legado. */
const fs = require('fs'), path = require('path'), assert = require('assert'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), hj = new Date().toISOString().slice(0, 10);
(async () => {
  const f = await fixture.abrir(alvo); let falhas = 0;
  try {
    { // Controle sequencial dos mesmos snapshots antigos: não deve inventar outra atividade.
      const c = await f.contexto();
      try {
        await c.route(/http:\/\/127\.0\.0\.1:(8180|9199)\//, r => r.abort());
        const p = await f.pagina(c), backup = { v: 1, cfg: { nome: 'Fictícia' }, act: { [hj]: 5 }, feito: { 'T:importada': true } };
        await f.importar(p, { v: 1, cfg: {}, act: { [hj]: 2 } });
        await p.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado');
        for (let n = 0; n < 2; n++) { await f.importar(p, backup); await p.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado'); assert.strictEqual((await f.estado(p)).act[hj], 5); }
        console.log('✓ Controle: repetir sequencialmente o mesmo backup legado preserva exatamente 5.');
      } finally { await c.close(); }
    }
    for (const [tipo, abas, locks] of [['legado', 2, true], ['legado', 3, false], ['identificado', 2, false]]) {
      const c = await f.contexto(); let d, bp;
      try {
        await c.route(/http:\/\/127\.0\.0\.1:(8180|9199)\//, r => r.abort());
        if (!locks) await c.addInitScript(() => Object.defineProperty(navigator, 'locks', { value: undefined }));
        const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'BACKUP-REPETIDO-A636', o: 'curso', t: 1792195200000 };
        let backup = { v: 1, cfg: { nome: 'Origem Fictícia', certs: [cert] }, feito: { 'T:importada': true }, act: { [hj]: 5 } };
        if (tipo === 'identificado') { const origem = await f.contexto(); try { await origem.route(/http:\/\/127\.0\.0\.1:(8180|9199)\//, r => r.abort()); const o = await f.pagina(origem); await f.importar(o, backup); backup = await f.estado(o); assert(backup.cfg._ops); } finally { await origem.close(); } }
        const paginas = [await f.pagina(c)], A = paginas[0];
        await f.importar(A, { v: 1, cfg: { nome: 'Base Fictícia' }, feito: { 'T:base': true }, act: { [hj]: 2 } });
        await A.waitForFunction(() => document.querySelector('#sync').dataset.local === 'confirmado');
        for (let i = 1; i <= abas; i++) { const p = await f.pagina(c); assert.strictEqual((await f.estado(p)).act[hj], 2); paginas.push(p); }
        d = await c.newCDPSession(A); await d.send('Debugger.enable');
        const lineNumber = fs.readFileSync(path.join(alvo, 'curso/app.js'), 'utf8').split('\n').findIndex(l => l.includes('if (resultado !== undefined)'));
        assert(lineNumber >= 0);
        bp = await d.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', A.url()).href, lineNumber,
          condition: `q.result && q.result.st && q.result.st.act['${hj}'] === 2 && !q.result.st.feito['T:importada']` });
        const parada = new Promise((r, j) => { const t = setTimeout(() => j(new Error('Não atingiu transação de importação')), 15000); d.once('Debugger.paused', p => { clearTimeout(t); r(p); }); });
        const pausa = await parada; // consolidação periódica sem alterações: segura somente a transação observadora
        const prova = await d.send('Debugger.evaluateOnCallFrame', { callFrameId: pausa.callFrames[0].callFrameId, returnByValue: true, expression: `({antes:q.result.st.act,proposto:resultado && resultado.meta ? opEstado(resultado.meta).act : null,recibos:Object.keys(q.result.recibos||{})})` });
        const esperado = tipo === 'identificado' ? 7 : 5;
        for (let i = 1; i <= abas; i++) { await f.importar(paginas[i], backup); assert.strictEqual((await f.estado(paginas[i])).act[hj], esperado); }
        const diario = await paginas[1].evaluate(hj => Object.entries(localStorage).filter(([k]) => k.startsWith('missao-eear-v1-diario#')).map(([k, txt]) => { const o = JSON.parse(txt); return { k, id: o.id, origem: o.origem, act: o.st.act[hj], contribuicoes: o.delta.c[JSON.stringify(['act', hj])] }; }), hj);
        console.log('PRECONDICAO ' + JSON.stringify({ tipo, abas, prova: prova.result.value, diario }));
        assert(diario.length >= abas, 'Todas as importações aceitas precisam estar reservadas.');
        await d.send('Debugger.removeBreakpoint', { breakpointId: bp.breakpointId }); bp = null; await d.send('Debugger.resume');
        const C = await f.pagina(c); await C.waitForFunction(() => document.documentElement.dataset.armazenamento === 'pronto');
        let final; assert(await f.ate(async () => { final = await f.estado(C); return final.feito['T:importada'] && await C.locator('#sync').getAttribute('data-local') === 'confirmado'; }));
        await C.waitForTimeout(1800); final = await f.estado(C); await C.reload(); const reaberto = await f.estado(C);
        const passou = final.act[hj] === esperado && reaberto.act[hj] === esperado && reaberto.cfg.certs.filter(x => x.c === cert.c).length === 1;
        console.log(`${passou ? '✓' : '✗'} importar-mesmos-bytes-${tipo}-${abas}-importacoes-${abas + 1}-abas: ${JSON.stringify({ locks, esperado, atividadeFinal: final.act[hj], atividadeReaberta: reaberto.act[hj], certificado: reaberto.cfg.certs.map(x => x.c), prova: prova.result.value, diario, aviso: await C.locator('#sync').innerText() })}`);
        if (!passou) falhas++;
      } finally { if (d && bp) { await d.send('Debugger.removeBreakpoint', { breakpointId: bp.breakpointId }).catch(() => null); await d.send('Debugger.resume').catch(() => null); } await c.close(); }
    }
  } finally { await f.fechar(); }
  process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error('PREPARAÇÃO/EXECUÇÃO:', e); process.exitCode = 1; });
