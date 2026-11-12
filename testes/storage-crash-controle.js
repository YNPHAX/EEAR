/* Diagnóstico independente da persistência do Chromium; sem EEAR/Firebase.
   Distingue perda no backend localStorage após Browser.crash de falha do recuperador do app.
   Não transforma a falha do teste de recuperação em aprovação: imprime os controles observados.
   Requer o mesmo Playwright/Chromium das outras sondas. Nenhum dado ou perfil real. */
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
(async () => {
  const srv = http.createServer((q, r) => r.end('<!doctype html><title>Storage isolado</title>'));
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const url = 'http://127.0.0.1:' + srv.address().port;
  const abrir = async dir => {
    const ctx = await chromium.launchPersistentContext(dir);
    await ctx.route('**/*', r => new URL(r.request().url()).origin === url ? r.continue() : r.abort());
    return ctx;
  };
  try {
    for (const [modo, ms] of [['limpo', 1200], ['crash', 1200], ['crash', 6500]]) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-storage-controle-')); let ctx;
      try {
        ctx = await abrir(dir); const p = await ctx.newPage(); await p.goto(url);
        await p.evaluate(() => localStorage.setItem('marcador', 'ficticio-duravel'));
        await new Promise(r => setTimeout(r, ms));
        if (modo === 'limpo') await ctx.close();
        else { const c = await ctx.newCDPSession(p), fim = ctx.waitForEvent('close'); c.send('Browser.crash').catch(() => null); await fim; }
        ctx = await abrir(dir); const q = await ctx.newPage(); await q.goto(url);
        console.log(JSON.stringify({ modo, ms, marcador: await q.evaluate(() => localStorage.getItem('marcador')) }));
      } finally { if (ctx) await ctx.close().catch(() => null); fs.rmSync(dir, { recursive: true, force: true }); }
    }
  } finally { await new Promise(r => srv.close(r)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
