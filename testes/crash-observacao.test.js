/* Intercalação controlada em oncomplete INATIVO: o commit real já acabou.
   Segura só a resposta de um cache antigo; outras transações continuam. Não muda o runtime. */
const fs=require('fs'),path=require('path'),assert=require('assert'),fixture=require('./a35-fixture.js');
const alvo=path.resolve(process.env.EEAR_REPO_ALVO||path.join(__dirname,'..')),hj=new Date().toISOString().slice(0,10);
const saida=process.env.EEAR_CRASH_SAIDA||'/tmp/eear-crash-observacao.json';
async function instrumentar(p,janela){
 await p.evaluate(({hj,janela})=>{
  const infos=new WeakMap(),put=window.IDBObjectStore.prototype.put,get=window.IDBObjectStore.prototype.get;
  const d=Object.getOwnPropertyDescriptor(window.IDBTransaction.prototype,'oncomplete');let n=0,qual=0;
  window.__eventos=[];window.__retidas=[];
  const foto=x=>x?JSON.parse(JSON.stringify(x)):null;
  const info=t=>{if(!infos.has(t))infos.set(t,{seq:++n,put:false,antes:null,depois:null});return infos.get(t);};
  window.IDBObjectStore.prototype.get=function(...args){const q=get.apply(this,args),i=info(this.transaction);if(this.name==='contas')q.addEventListener('success',()=>{i.antes=foto(q.result);});return q;};
  window.IDBObjectStore.prototype.put=function(v,...args){const i=info(this.transaction);if(this.name==='contas'){i.put=true;i.depois=foto(v);}return put.call(this,v,...args);};
  Object.defineProperty(window.IDBTransaction.prototype,'oncomplete',{configurable:true,get:d.get,set(fn){
   return d.set.call(this,function(ev){const i=info(this),candidato=this.objectStoreNames.length===2&&!i.put&&i.antes?.st?.cfg?.certsZ&&!(i.antes.st.act[hj]||0);
    if(candidato)qual++;const nova=window.__faseAntigaLiberada&&i.put&&i.depois?.st?.act?.[hj]===1;const reter=(candidato&&qual===janela)||nova;if(nova)window.__novaRetida=true;
    window.__eventos.push({...i,tipo:reter?'complete-retido':'complete',inativo:true,tempo:performance.now()});
    if(reter){window.__retidas.push(()=>{window.__eventos.push({seq:i.seq,tipo:'resposta-antiga-liberada',tempo:performance.now()});fn.call(this,ev);});return;}
    return fn.call(this,ev);
   });
  }});
 },{hj,janela});
}
async function capturar(p,f){
 const ui=await f.estado(p);
 return {ui,...await p.evaluate(()=>new Promise((resolve,reject)=>{
  const q=window.indexedDB.open('eear-operacoes',1);q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,t=db.transaction('contas'),r=t.objectStore('contas').get('');t.oncomplete=()=>{db.close();resolve({checkpoint:r.result,indicador:document.querySelector('#sync')?.outerHTML,cache:localStorage.getItem('missao-eear-v1'),reservas:Object.keys(localStorage).filter(k=>k.startsWith('missao-eear-v1-diario#')).map(k=>[k,localStorage.getItem(k)]),eventos:window.__eventos});};};
 }))};
}
(async()=>{
 const f=await fixture.abrir(alvo),resultados=[];let falhas=0;
 try{for(const janela of [1,2]){
  const c=await f.contexto();let p;
  const r={janela};
  try{
   await c.addInitScript(()=>Object.defineProperty(navigator,'locks',{value:undefined}));
   await c.route(/127\.0\.0\.1:(8280|9299)\//,x=>x.abort());p=await f.pagina(c);
   await f.importar(p,{v:1,cfg:{nome:'Crash Fictício'},feito:{'T:antiga':true},act:{[hj]:5}});
   await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');
   r.base=await capturar(p,f);assert.strictEqual(r.base.checkpoint.st.act[hj],5);
   await instrumentar(p,janela);await f.clicar(p,'zerar');await f.clicar(p,'zerarok');
   await p.waitForFunction(()=>window.__retidas.length===1);r.resetRetido=await capturar(p,f);
   await f.clicar(p,'marcar',{k:'T:nova'});
   assert(await f.ate(async()=>{const x=await capturar(p,f);return x.checkpoint.st.act[hj]===1&&x.checkpoint.st.feito['T:nova'];}));
   r.novaConfirmada=await capturar(p,f);assert.strictEqual(r.novaConfirmada.ui.act[hj],1);
   await p.evaluate(async()=>{window.__faseAntigaLiberada=true;window.__retidas.shift()();await Promise.resolve();await Promise.resolve();});
   await p.waitForFunction(()=>window.__novaRetida===true);r.aposRespostaAntiga=await capturar(p,f);
   const preservouUI=r.aposRespostaAntiga.ui.act[hj]===1&&r.aposRespostaAntiga.ui.feito['T:nova'],preservouCheckpoint=r.aposRespostaAntiga.checkpoint.st.act[hj]===1;
   await p.evaluate(()=>{window.__faseAntigaLiberada=false;while(window.__retidas.length)window.__retidas.shift()();});
   const d=await c.newCDPSession(p),caiu=p.waitForEvent('crash');d.send('Page.crash').catch(()=>null);await caiu;await p.close();p=await f.pagina(c);
   await f.clicar(p,'tab',{v:'plano'});await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');r.reaberto=await capturar(p,f);
   r.passou=!!(preservouUI&&preservouCheckpoint&&r.reaberto.ui.act[hj]===1&&r.reaberto.ui.feito['T:nova']);
   r.resumo={preservouUI,preservouCheckpoint,exportacao:r.aposRespostaAntiga.ui.act[hj]||0,checkpoint:r.aposRespostaAntiga.checkpoint.st.act[hj],reaberto:r.reaberto.ui.act[hj],reservas:r.aposRespostaAntiga.reservas.length,indicador:r.aposRespostaAntiga.indicador};
   if(!r.passou)falhas++;console.log((r.passou?'✓ ':'✗ ')+'oncomplete-'+janela+': '+JSON.stringify(r.resumo));
  }catch(e){r.preparacaoFalhou=true;r.erro=e.stack;falhas++;console.error('PREPARAÇÃO janela '+janela,e);}finally{await c.close();}
  resultados.push(r);fs.writeFileSync(saida,JSON.stringify(resultados,null,2));
 }}finally{await f.fechar();}process.exitCode=falhas?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
