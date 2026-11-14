/* Interrompe o código real dentro da transação IDB, mantendo as asserções de A+B e contagem exata.
   B não pode confirmar enquanto A possui a transação. Reservas só podem sair após checkpoint durável. */
module.exports = async function interromper({ ctx, paginas, clicar, estado, fonte, abrir }) {
  const [A, B, C] = paginas, linhas = fonte.split('\n');
  const lineNumber = linhas.findIndex(l => l.includes('resultado = editar(q.result || null, t);'));
  if (lineNumber < 0) throw new Error('Ponto nativo da transação não encontrado.');
  // Pausa somente DENTRO de oncomplete: Debugger.pause arbitrário pode prender uma transação
  // de B/C e impedir A de atingir seu breakpoint. Não é evidência de perda do aplicativo.
  const ociosa = linhas.findIndex(l => l.includes('t.oncomplete = () => resultado instanceof Error'));
  if (ociosa < 0) throw new Error('Revisar ponto de transação concluída dos observadores.');
  const observadores = [];
  for (const p of [B, C]) {
    const d = await ctx.newCDPSession(p); await d.send('Debugger.enable');
    const parada = new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Observador não concluiu a transação')), 10000); d.once('Debugger.paused', r => { clearTimeout(t); resolve(r); }); });
    const bp = await d.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', p.url()).href, lineNumber: ociosa, columnNumber: linhas[ociosa].indexOf('resultado instanceof Error') });
    const ponto = await parada;
    const prova = await d.send('Debugger.evaluateOnCallFrame', { callFrameId: ponto.callFrames[0].callFrameId, returnByValue: true, expression: '(()=>{try{s.get(id);return "ativa";}catch(e){return e.name;}})()' });
    if (prova.result.value !== 'TransactionInactiveError') throw new Error('Observador pausado antes do término da transação: ' + JSON.stringify(prova));
    await d.send('Debugger.removeBreakpoint', { breakpointId: bp.breakpointId }); observadores.push(d);
  }
  // Barreira readwrite SEM alterações confirma que nenhum observador pausado segura a fila IDB.
  await A.evaluate(() => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Observadores pausados ainda bloqueiam IndexedDB')), 10000);
    const o = window.indexedDB.open('eear-operacoes', 1); o.onerror = () => { clearTimeout(timer); reject(o.error); };
    o.onsuccess = () => { const db = o.result, t = db.transaction(['contas', 'quarentena'], 'readwrite'); t.oncomplete = () => { clearTimeout(timer); db.close(); resolve(); }; t.onerror = t.onabort = () => { clearTimeout(timer); db.close(); reject(t.error); }; };
  }));
  console.log('Preparação nativa: dois observadores em oncomplete inativo; barreira IDB concluída sem alterações.');
  const cdp = await ctx.newCDPSession(A); await cdp.send('Debugger.enable');
  await cdp.send('Debugger.setBreakpointByUrl', { url: new URL('app.js', A.url()).href, lineNumber, condition: '(loc.ops || []).some(o => o.st.feito["T:A-race"]) && !(q.result && q.result.st && q.result.st.feito["T:A-race"])' });
  const parada = new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('Transação não atingiu o breakpoint')), 10000); cdp.once('Debugger.paused', p => { clearTimeout(t); resolve(p); }); });
  const marcando = clicar(A, 'marcar', { k: 'T:A-race' }).catch(() => null); const paradaA = await parada;
  const diagnostico = await cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: paradaA.callFrames[0].callFrameId, returnByValue: true, expression: '({pronta:q.readyState,feito:q.result&&q.result.st&&q.result.st.feito,id,operacoes:(loc.ops||[]).map(o=>o.id)})' });
  console.log('Ponto nativo: leitura anterior à operação confirmada, ' + JSON.stringify(diagnostico.result.value));
  if (!diagnostico.result.value || (diagnostico.result.value.feito && diagnostico.result.value.feito['T:A-race'])) throw new Error('A operação já estava confirmada ou o ponto não precede a aplicação: revisar preparação.');
  for (const d of observadores) { await d.send('Debugger.resume'); await d.send('Debugger.disable'); }
  await clicar(B, 'marcar', { k: 'T:B-race' });
  const sB = await estado(B);
  const reserva = () => C.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('missao-eear-v1-diario')).map(k => JSON.parse(localStorage.getItem(k))).some(d => d.st && d.st.feito['T:B-race']));
  const antes = await reserva(); await B.close(); await C.waitForTimeout(2500); const depoisCarencia = await reserva();
  if (!sB.feito['T:B-race'] || !antes || !depoisCarencia) throw new Error('Não comprovou B aceita e preservada enquanto a transação bloqueava o checkpoint.');
  const caiu = A.waitForEvent('crash', { timeout: 10000 }); cdp.send('Page.crash').catch(() => null); await caiu; await A.close(); await marcando;
  const D = await abrir(); let s; const fim = Date.now() + 15000;
  do { s = await estado(D); if (s.feito['T:A-race'] && s.feito['T:B-race'] && s.act[new Date().toISOString().slice(0, 10)] === 4) break; await D.waitForTimeout(100); } while (Date.now() < fim);
  return { passou: !!(s.feito['T:A-race'] && s.feito['T:B-race'] && s.act[new Date().toISOString().slice(0, 10)] === 4), Baceita: true, reservaAntes: antes, reservaDepois2500ms: depoisCarencia, estado: s, D };
};
