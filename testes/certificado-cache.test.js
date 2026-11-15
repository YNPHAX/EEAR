/* Prova que cache atrasado não é perda durável: UI/checkpoint/exportação versus cache opcional.
   Cache recusa a escrita final; quiz e transação reais, rede Firebase bloqueada. */
const fs=require('fs'),path=require('path'),assert=require('assert'),fixture=require('./a35-fixture.js'),{local,cairPagina}=require('./c186-acoes.js');
const alvo=path.resolve(process.env.EEAR_REPO_ALVO||path.join(__dirname,'..')),out=process.env.EEAR_CERT_CACHE_SAIDA||'/tmp/eear-certificado-cache.json';
(async()=>{
 const f=await fixture.abrir(alvo),c=await f.contexto(),r={};
 try{
  await c.route(/127\.0\.0\.1:(8280|9299)\//,q=>q.abort());let p=await f.pagina(c);const mod={};for(let i=1;i<15;i++)mod['POR'+String(i).padStart(2,'0')]={best:.9,tent:1,ok:'2026-10-01'};
  await f.importar(p,{v:1,cfg:{nome:'Certificado Fictício',certs:[]},mod});await local(p);
  await p.evaluate(()=>{const real=window.Storage.prototype.setItem;window.__cacheFalhou=0;window.Storage.prototype.setItem=function(k,v){if(k==='missao-eear-v1'){const x=JSON.parse(v);if(x.mod?.POR15?.best>=.8&&x.cfg.certs.some(c=>c.s==='por'&&c.ids.length===15)){window.__cacheFalhou++;throw new window.DOMException('Falha fictícia do cache opcional','QuotaExceededError');}}return real.call(this,k,v);};});
  await f.clicar(p,'quizmod',{id:'POR15'});const n=await p.evaluate(()=>window.EEAR.modulos.find(m=>m.id==='POR15').q.length);
  for(let i=0;i<n;i++){
   assert(await p.evaluate(()=>{const txt=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent.replace(/\s+/g,' ').trim();},en=txt(document.querySelector('.q-enun').innerHTML),qs=window.EEAR.modulos.find(m=>m.id==='POR15').q,q=qs.find(x=>txt(x[0])===en),b=q&&[...document.querySelectorAll('.opt')].find(o=>txt(o.children[1].innerHTML)===txt(q[1][q[2]]));if(!b)return false;b.click();return true;}));
   await f.clicar(p,'qprox');
  }
  assert(/Módulo dominado/.test(await p.locator('main').innerText()));await local(p);assert(await f.ate(()=>p.evaluate(()=>window.__cacheFalhou>0)));
  r.ui=await f.estado(p);r.armazenamento=await p.evaluate(()=>new Promise(resolve=>{const o=window.indexedDB.open('eear-operacoes',1);o.onsuccess=()=>{const db=o.result,t=db.transaction('contas'),q=t.objectStore('contas').get('');t.oncomplete=()=>{db.close();resolve({checkpoint:q.result,cache:JSON.parse(localStorage.getItem('missao-eear-v1')),reservas:Object.keys(localStorage).filter(k=>k.startsWith('missao-eear-v1-diario#')),indicador:document.querySelector('#sync').outerHTML});};};}));
  const por=s=>(s.cfg.certs||[]).filter(x=>x.s==='por'&&x.ids.length===15);
  assert.strictEqual(por(r.ui).length,1);assert.strictEqual(por(r.armazenamento.checkpoint.st).length,1);assert.strictEqual(por(r.armazenamento.cache).length,0,'Controle: o cache opcional pode estar atrasado apesar do commit.');
  p=await cairPagina(p,c,f);r.reaberto=await f.estado(p);assert.strictEqual(por(r.reaberto).length,1);assert.deepStrictEqual(por(r.reaberto),por(r.ui));
  fs.writeFileSync(out,JSON.stringify(r,null,2));console.log('✓ POR15: cache sem certificado, UI/checkpoint com certificado exato; código/data/15 aulas sobrevivem ao crash. A leitura de localStorage não prova o checkpoint.');
 }finally{await c.close();await f.fechar();}
})().catch(e=>{console.error(e);process.exitCode=1;});
