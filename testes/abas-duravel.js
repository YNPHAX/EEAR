/* Queda do navegador inteiro (Browser.crash) logo depois de uma marcação (curso/app/16-diario-duravel.js). No Chromium,
   uma gravação recente no localStorage pode não chegar ao disco nessa queda; o diário também vai para o IndexedDB e
   volta na abertura seguinte. Perfil temporário persistente, sem conta e sem rede; nada é falsificado (a queda é a do
   processo real do navegador). Confere também o controle: sem a marcação nova, nada aparece do nada. Usado por
   testes/plataforma.test.js. */
const fs = require('fs'), os = require('os'), path = require('path');
module.exports = async function testarDuravel({ srv, base, ok }) {
  console.log('\n== queda do navegador inteiro logo depois de estudar (diário durável)');
  const { chromium } = require('playwright'), K = 'missao-eear-v1', tem = (s, k) => !!(s && s.feito && s.feito[k]);
  const clicar = (p, a, d) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d || {}); document.body.appendChild(x); x.click(); x.remove(); }, [a, d]);
  const abrir = dir => chromium.launchPersistentContext(dir, { serviceWorkers: 'block' });
  const ate = async (f, ms) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await f()) return true; await new Promise(r => setTimeout(r, 200)); } return false; };
  for (const espera of [1200, 300]) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-duravel-')); let ctx;
    try {
      ctx = await abrir(dir); let p = ctx.pages()[0] || await ctx.newPage(); await p.goto(srv.url);
      await p.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [K, Object.assign(base({}), { t: Date.now() - 60000, feito: { 'T:base': true } })]);
      await ctx.close(); // a semente chega ao disco (fechamento limpo)
      ctx = await abrir(dir); p = ctx.pages()[0] || await ctx.newPage(); await p.goto(srv.url); await p.waitForTimeout(400);
      await clicar(p, 'marcar', { k: 'T:antes-da-queda' });
      await new Promise(r => setTimeout(r, espera));
      const cdp = await ctx.newCDPSession(p), fim = ctx.waitForEvent('close'); cdp.send('Browser.crash').catch(() => null); await fim; ctx = null;
      ctx = await abrir(dir); p = ctx.pages()[0] || await ctx.newPage(); await p.goto(srv.url);
      const voltou = await ate(async () => tem(await p.evaluate(k => JSON.parse(localStorage.getItem(k)), K), 'T:antes-da-queda'), 10000);
      const s = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), K);
      ok(voltou && tem(s, 'T:base') && !tem(s, 'T:nunca-marcada'),
        `queda do navegador ${espera} ms depois de marcar: a marcação volta na abertura seguinte e a semente continua [feito: ${s ? Object.keys(s.feito) : '-'}]`);
    } catch (e) { ok(false, `queda do navegador (${espera} ms): o cenário não terminou — ${e.message}`); } finally { if (ctx) await ctx.close().catch(() => null); fs.rmSync(dir, { recursive: true, force: true }); }
  }
  { // isolamento: um diário de outra conta, guardado no IndexedDB, não entra na cópia de quem abre o app (aqui, sem conta)
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eear-duravel-')); let ctx;
    try {
      ctx = await abrir(dir); const p = ctx.pages()[0] || await ctx.newPage(); await p.goto(srv.url);
      const outra = JSON.stringify({ seq: 9, bid: '', base: null, bseq: 0, ant: [], ts: Date.now(), st: Object.assign(base({}), { feito: { 'T:de-outra-conta': true } }) });
      await p.evaluate(v => new Promise(res => { const o = window.indexedDB.open('eear-diarios', 1); o.onupgradeneeded = () => o.result.createObjectStore('d'); o.onsuccess = () => { const t = o.result.transaction('d', 'readwrite'); t.objectStore('d').put(v, 'missao-eear-v1-diario@claude:outra#tx'); t.oncomplete = () => { o.result.close(); res(); }; }; }), outra);
      await p.reload(); await p.waitForTimeout(1500);
      const r = await p.evaluate(() => ({ s: JSON.parse(localStorage.getItem('missao-eear-v1') || 'null'), outra: localStorage.getItem('missao-eear-v1-diario@claude:outra#tx') }));
      ok(!tem(r.s, 'T:de-outra-conta') && r.outra === null, `isolamento: o diário durável de outra conta não é restaurado na conta aberta [cópia: ${r.s ? Object.keys(r.s.feito) : 'nenhuma'}; diário da outra conta no localStorage: ${r.outra === null ? 'não' : 'sim'}]`);
    } catch (e) { ok(false, 'isolamento do diário durável: o cenário não terminou — ' + e.message); } finally { if (ctx) await ctx.close().catch(() => null); fs.rmSync(dir, { recursive: true, force: true }); }
  }
};
