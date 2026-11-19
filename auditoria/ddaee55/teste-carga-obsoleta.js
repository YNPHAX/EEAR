/* A -> B -> A com duas cargas A entregues fora de ordem. Só callbacks nativos inativos são retidos. */
const fs=require('fs'),path=require('path'),assert=require('assert'),fixture=require('../../testes/integridade-fixture.js');
const repo=path.resolve(process.env.EEAR_REPO_ALVO||path.resolve(__dirname,'../..')),out=process.env.EEAR_AUDITORIA_SAIDA||'/workspace/audit-results/independente';
async function switchTo(p,email){await p.evaluate(async email=>{const ap=await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),au=await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js');await au.signInWithEmailAndPassword(au.getAuth(ap.getApp()),email,'auditoria-f01-123');},email);}
(async()=>{
 if(fixture.emular(repo,__filename))return;
 const f=await fixture.abrir(repo),c=await f.contexto(),r={};
 try{
  const A=await f.conta('obsolete-load-A',{v:1,t:Date.now(),cfg:{},feito:{'T:must-reset':true},act:{'2026-11-19':1}}),B=await f.conta('obsolete-load-B',{v:1,t:Date.now(),cfg:{},feito:{},act:{}});
  const p=await f.pagina(c);await f.entrar(p,A.email);await p.waitForFunction(()=>document.documentElement.dataset.armazenamento==='pronto');
  await f.clicar(p,'tab',{v:'plano'});await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.nuvem==='confirmado');
  r.initial=await f.estado(p);assert(r.initial.feito['T:must-reset']);
  await switchTo(p,B.email);await p.waitForFunction(id=>localStorage.getItem('missao-eear-conta')===id&&document.documentElement.dataset.armazenamento==='pronto','firebase:'+B.uid);
  await p.evaluate(id=>{
   localStorage.removeItem('missao-eear-v1@'+id);
   window.__retidas=[];window.__auditEvents=[];window.__hold=true;
   const infos=new WeakMap(),get=IDBObjectStore.prototype.get,put=IDBObjectStore.prototype.put,d=Object.getOwnPropertyDescriptor(IDBTransaction.prototype,'oncomplete');
   const info=t=>{if(!infos.has(t))infos.set(t,{account:null,put:false});return infos.get(t);};
   IDBObjectStore.prototype.get=function(k){if(this.name==='contas'){info(this.transaction).account=k;info(this.transaction).store=this;}return get.call(this,k);};
   IDBObjectStore.prototype.put=function(...args){if(this.name==='contas')info(this.transaction).put=true;return put.apply(this,args);};
   Object.defineProperty(IDBTransaction.prototype,'oncomplete',{configurable:true,get:d.get,set(fn){return d.set.call(this,function(ev){const i=info(this);if(window.__hold&&i.account===id&&i.put){let inactive;try{get.call(i.store,id);}catch(e){inactive=e.name;}window.__auditEvents.push({type:'hold',inactive,account:i.account,put:i.put});window.__retidas.push(()=>fn.call(this,ev));return;}fn.call(this,ev);});}});
  },'firebase:'+A.uid);
  await switchTo(p,A.email);await p.waitForFunction(()=>window.__retidas.length===1);r.firstLoad=await p.evaluate(()=>document.documentElement.dataset.armazenamento);
  await switchTo(p,B.email);await p.waitForFunction(id=>localStorage.getItem('missao-eear-conta')===id&&document.documentElement.dataset.armazenamento==='pronto','firebase:'+B.uid);
  await switchTo(p,A.email);await p.waitForFunction(()=>window.__retidas.length===2);r.secondLoad=await p.evaluate(()=>document.documentElement.dataset.armazenamento);
  await p.evaluate(()=>window.__retidas.shift()());
  // A carga atual permanece retida. A antiga não deve liberar mutações na conta atual.
  r.prematureReady=await f.ate(()=>p.evaluate(()=>document.documentElement.dataset.armazenamento==='pronto'),2000);
  r.holdsRemaining=await p.evaluate(()=>window.__retidas.length);
  if(r.prematureReady){
   r.visibleBeforeReset=await f.estado(p);r.indicator=await p.locator('#sync').innerText();
   r.checkpointBeforeReset=await p.evaluate(id=>new Promise(resolve=>{const o=indexedDB.open('eear-operacoes',1);o.onsuccess=()=>{const db=o.result,t=db.transaction('contas'),q=t.objectStore('contas').get(id);t.oncomplete=()=>{db.close();resolve(q.result);};};}),'firebase:'+A.uid);
   await f.clicar(p,'zerar');await f.clicar(p,'zerarok');r.acceptedReset=await f.estado(p);
  }
  await p.evaluate(()=>{window.__hold=false;while(window.__retidas.length)window.__retidas.shift()();});
  await f.clicar(p,'tab',{v:'plano'});await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');
  r.final=await f.estado(p);r.oldTaskSurvives=!!r.final.feito['T:must-reset'];r.events=await p.evaluate(()=>window.__auditEvents);
  assert(r.events.every(e=>e.inactive==='TransactionInactiveError'),'A retenção deve ocorrer fora de uma transação ativa.');
  r.pass=!r.prematureReady;
  console.log(JSON.stringify({first:r.firstLoad,second:r.secondLoad,prematureReady:r.prematureReady,holdsRemaining:r.holdsRemaining,visibleTask:r.visibleBeforeReset?.feito['T:must-reset'],finalTask:r.oldTaskSurvives}));
 }catch(e){r.setupError=e.stack;console.error(e);}finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'carga-obsoleta.json'),JSON.stringify(r,null,2));await c.close();await f.fechar();}
 process.exitCode=r.pass?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
