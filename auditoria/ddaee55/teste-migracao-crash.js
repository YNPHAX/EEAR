/* Falha transacional durante upgrade, com checkpoint nativo anterior e Page.crash. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const repo=path.resolve(__dirname,'../..'),fixture=require('../../testes/a35-fixture.js');
const out=process.env.EEAR_AUDITORIA_SAIDA||'/workspace/audit-results/independente';
async function cp(p){return p.evaluate(()=>new Promise(resolve=>{const o=indexedDB.open('eear-operacoes',1);o.onsuccess=()=>{const db=o.result,t=db.transaction('contas'),q=t.objectStore('contas').get('');t.oncomplete=()=>{db.close();resolve(q.result);};};}));}
(async()=>{
 const f=await fixture.abrir(repo),c=await f.contexto(),result={};let old=true;
 try{
  await c.route('**/app.js',q=>old?q.fulfill({contentType:'text/javascript',body:fs.readFileSync(process.env.EEAR_REPO_REPROVADO_IA07+'/curso/app.js')}):q.fallback());
  await c.route(/127\.0\.0\.1:(8280|9299)\//,q=>q.abort());
  await c.addInitScript(()=>{
   if(!location.search.includes('audit-abort=1'))return;
   window.__aborts=0;const put=IDBObjectStore.prototype.put;
   IDBObjectStore.prototype.put=function(...args){const q=put.apply(this,args);if(this.name==='contas'){window.__aborts++;this.transaction.abort();}return q;};
  });
  let p=await f.pagina(c);const url=p.url();
  const sims=[{d:'2026-11-19',r:{por:[1,2]},min:8},{d:'2026-11-01',r:{por:[2,2]},min:2}];
  await f.importar(p,{v:1,cfg:{nome:'Audit Migration'},sims,act:{'2026-11-19':2}});
  await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');
  result.original=await cp(p);assert.strictEqual(result.original.st.sims.length,2);await p.close();old=false;
  p=await c.newPage();await p.goto(url+'?audit-abort=1');await p.waitForFunction(()=>window.__aborts>0);
  result.aborted=await cp(p);assert.deepStrictEqual(result.aborted,result.original,'Aborted migration must preserve original checkpoint');
  await f.clicar(p,'tab',{v:'plano'});result.indicatorDuringAbort=await p.locator('#sync').evaluate(e=>e.outerHTML);
  assert.notStrictEqual(await p.locator('#sync').getAttribute('data-local'),'confirmado');
  const d=await c.newCDPSession(p),crashed=p.waitForEvent('crash');d.send('Page.crash').catch(()=>null);await crashed;await p.close();
  p=await f.pagina(c);await f.clicar(p,'tab',{v:'plano'});await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');
  result.recovered=await cp(p);assert.strictEqual(result.recovered.st.sims.length,2);assert.strictEqual(result.recovered.st.act['2026-11-19'],2);
  assert(result.recovered.st.sims.every(s=>typeof s._sid==='string'));
  await p.reload();await f.clicar(p,'tab',{v:'plano'});await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');
  result.second=await cp(p);assert.deepStrictEqual(result.second.meta,result.recovered.meta);
  result.pass=true;console.log('PASS migration abort: original intact; crash/recovery 2/2; second migration idempotent.');
 }catch(e){result.error=e.stack;console.error(e);}finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'migracao-crash.json'),JSON.stringify(result,null,2));await c.close();await f.fechar();}
 process.exitCode=result.pass?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
