/* Replica real v4 gera tombstone de ID explícito. Atualização v6 não pode apagar outra origem inédita. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const repo=path.resolve(__dirname,'../..'),fixture=require('../../testes/integridade-fixture.js');
const {local,remoto}=require('../../testes/c186-acoes.js');
const out=process.env.EEAR_AUDITORIA_SAIDA||'/workspace/audit-results/independente';
(async()=>{
 if(fixture.emular(repo,__filename))return;
 const f=await fixture.abrir(repo),c=await f.contexto(),r={candidate:fs.readFileSync(path.join(repo,'curso/app.js')).length};
 let old=true;
 try{
  await c.route('**/app.js',q=>old?q.fulfill({contentType:'text/javascript',body:fs.readFileSync(process.env.EEAR_REPO_REPROVADO_IA07+'/curso/app.js')}):q.fallback());
  const cred=await f.conta('audit-ambiguous',{v:1,t:Date.now(),cfg:{},act:{},feito:{}}),p=await f.pagina(c);
  await f.entrar(p,cred.email);await remoto(p);
  const legacy={d:'2026-11-10',tipo:'materia',mat:'por',r:{por:[1,2]},min:3};
  const explicit={d:'2026-11-01',tipo:'materia',mat:'por',r:{por:[2,2]},min:9,id:JSON.stringify(legacy)+'#0'};
  r.explicit=explicit;r.neverObserved=legacy;
  await f.importar(p,{v:1,cfg:{},sims:[explicit]});await remoto(p);r.beforeReset=await f.estado(p);assert.strictEqual(r.beforeReset.sims.length,1);
  await f.clicar(p,'zerar');await f.clicar(p,'zerarok');await remoto(p);r.oldTombstone=await f.estado(p);assert.strictEqual(r.oldTombstone.sims.length,0);
  old=false;await p.reload();await remoto(p);r.migrated=await f.estado(p);
  await f.importar(p,{v:1,cfg:{},sims:[legacy]});await remoto(p);r.afterNewImport=await f.estado(p);r.remote=await f.ler(cred.uid);
  r.indicator=await p.locator('#sync').innerText();
  r.quarantine=await p.evaluate(()=>new Promise(resolve=>{const o=indexedDB.open('eear-operacoes',1);o.onsuccess=()=>{const db=o.result,t=db.transaction('quarentena'),q=t.objectStore('quarentena').getAll();t.oncomplete=()=>{db.close();resolve(q.result);};};}));
  await p.reload();await local(p);r.reopened=await f.estado(p);
  r.expected=1;r.actual=r.remote.sims.length;r.pass=r.actual===r.expected;
  console.log(JSON.stringify({expected:r.expected,actual:r.actual,reopened:r.reopened.sims.length,quarantine:r.quarantine.length,indicator:r.indicator}));
 }catch(e){r.setupError=e.stack;console.error(e);}finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'tombstone-ambiguo.json'),JSON.stringify(r,null,2));await c.close();await f.fechar();}
 process.exitCode=r.pass?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
