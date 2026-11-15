/* Cópia antiga rejeitada + quota REAL: antes de sobrescrever o cache, salvar a entrada inteira no IDB. */
const fs=require('fs'),path=require('path'),{Buffer}=require('buffer'),fixture=require('./a35-fixture.js');
const alvo=path.resolve(process.env.EEAR_REPO_ALVO||path.join(__dirname,'..')),hj=new Date().toISOString().slice(0,10),out=process.env.EEAR_RESET_CACHE_SAIDA||'/tmp/eear-reset-cache-quota.json';
async function capturar(p){return p.evaluate(()=>new Promise(resolve=>{const o=window.indexedDB.open('eear-operacoes',1);o.onsuccess=()=>{const db=o.result,t=db.transaction(['contas','quarentena']),r=t.objectStore('contas').get(''),q=t.objectStore('quarentena').getAll();t.oncomplete=()=>{db.close();resolve({checkpoint:r.result,quarentena:q.result,cache:localStorage.getItem('missao-eear-v1'),recuperacao:localStorage.getItem('missao-eear-v1-recuperar'),indicador:document.querySelector('#sync')?.outerHTML});};};}));}
(async()=>{
 const f=await fixture.abrir(alvo),c=await f.contexto(),raw=JSON.stringify({v:1,cfg:{nome:'Cache Fictício',certsZ:1e30},act:{[hj]:5},feito:{'T:antiga':true}}),r={raw};
 try{
  await c.route(/127\.0\.0\.1:(8280|9299)\//,x=>x.abort());
  await c.addInitScript(raw=>{if(localStorage.getItem('cold-seed'))return;localStorage.setItem('cold-seed','1');localStorage.setItem('missao-eear-v1',raw);let n=0;for(const t of [65536,1024,1])try{for(;;)localStorage.setItem('quota-cold-'+n++,'x'.repeat(t));}catch(e){if(e.name!=='QuotaExceededError')throw e;}},raw);
  let p=await f.pagina(c);await f.clicar(p,'tab',{v:'plano'});await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');r.sobQuota=await capturar(p);
  await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('quota-cold-')).forEach(k=>localStorage.removeItem(k)));
  await f.ate(()=>p.evaluate(raw=>localStorage.getItem('missao-eear-v1')!==raw,raw));r.aposLiberarQuota=await capturar(p);
  const cd=await c.newCDPSession(p),caiu=p.waitForEvent('crash');cd.send('Page.crash').catch(()=>null);await caiu;await p.close();p=await f.pagina(c);await f.clicar(p,'tab',{v:'plano'});await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');r.reaberto=await capturar(p);
  fs.writeFileSync(out,JSON.stringify(r,null,2));await f.clicar(p,'tab',{v:'hoje'});await f.clicar(p,'reccopiar');await p.waitForSelector('#rec-txt');r.copiaVisivel=await p.locator('#rec-txt').inputValue();
  await f.clicar(p,'tab',{v:'plano'});const baixou=p.waitForEvent('download');await f.clicar(p,'dadosbaixar');const download=await baixou,stream=await download.createReadStream(),chunks=[];for await(const b of stream)chunks.push(b);r.backup=JSON.parse(Buffer.concat(chunks).toString());
  r.passou=r.sobQuota.quarentena.some(q=>q.texto===raw)&&r.reaberto.quarentena.some(q=>q.texto===raw)&&r.backup.quarentena.some(q=>q.texto===raw)&&r.copiaVisivel===raw;
  fs.writeFileSync(out,JSON.stringify(r,null,2));console.log((r.passou?'✓ ':'✗ ')+'Cache antigo inseguro/quota real: '+JSON.stringify({quarentenaAntes:r.sobQuota.quarentena.length,quarentenaReaberta:r.reaberto.quarentena.length,originalNoBackup:r.backup.quarentena.some(q=>q.texto===raw),cacheOriginalMantido:r.reaberto.cache===raw}));process.exitCode=r.passou?0:1;
 }finally{await c.close();await f.fechar();}
})().catch(e=>{console.error(e);process.exitCode=1;});
