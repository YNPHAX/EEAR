/* O contrato de "salvo" é o checkpoint IDB, não o cache localStorage opcional.
   Nenhuma espera depende de nota/certificado esperado; falha se o app não confirma armazenamento. */
const {isDeepStrictEqual}=require('util');
async function lerCheckpoint(p){
 await p.click('[data-a="tab"][data-v="plano"]');
 await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');
 return p.evaluate(()=>new Promise((resolve,reject)=>{
  const o=window.indexedDB.open('eear-operacoes',1);o.onerror=()=>reject(o.error);o.onupgradeneeded=()=>{o.transaction.abort();reject(new Error('A verificação não pode criar o checkpoint.'));};
  o.onsuccess=()=>{const db=o.result,t=db.transaction('contas'),q=t.objectStore('contas').get('');t.oncomplete=()=>{db.close();q.result?.st?resolve(q.result.st):reject(new Error('Confirmação sem checkpoint.'));};t.onerror=()=>reject(t.error);};
 }));
}
const canonico=x=>Array.isArray(x)?x.map(canonico):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonico(x[k])])):x;
function simuladosIntactos(a,b,historico){
 if(historico)return isDeepStrictEqual(a,b); // critérios históricos originais permanecem literais
 if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)return false;
 return a.every((x,i)=>{
  const y=b[i];if(isDeepStrictEqual(x,y))return true; // cache de leitura pode continuar no formato antigo
  if(!y||typeof x.id==='string'||Object.prototype.hasOwnProperty.call(x,'_sid'))return false;
  if(y._sid!=='@sim:v1:'+JSON.stringify(canonico(x))+'#'+i)return false;
  const z={...y};delete z._sid;return isDeepStrictEqual(x,z); // todos os demais campos/arrays/valores são exatos
 });
}
module.exports={lerCheckpoint,simuladosIntactos};
