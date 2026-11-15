/* Entrada inválida é recusada/quarentenada sem tocar no estudo. JSON/IDB reais e dados fictícios. */
const fs=require('fs'),path=require('path'),assert=require('assert'),fixture=require('./a35-fixture.js');
const alvo=path.resolve(process.env.EEAR_REPO_ALVO||path.join(__dirname,'..')),hj=new Date().toISOString().slice(0,10);
const saida=process.env.EEAR_RESET_SAIDA||'/tmp/eear-reset-validacao.json';
async function armazenamento(p){return p.evaluate(()=>new Promise((resolve,reject)=>{
 const o=window.indexedDB.open('eear-operacoes',1);o.onerror=()=>reject(o.error);o.onsuccess=()=>{const db=o.result,t=db.transaction(['contas','quarentena']),c=t.objectStore('contas').get(''),q=t.objectStore('quarentena').getAll();t.oncomplete=()=>{db.close();resolve({conta:c.result,quarentena:q.result});};};
}));}
(async()=>{
 const f=await fixture.abrir(alvo),c=await f.contexto(),resultados=[];
 try{
  await c.route(/127\.0\.0\.1:(8280|9299)\//,q=>q.abort());let p=await f.pagina(c);
  await f.importar(p,{v:1,cfg:{nome:'Validação Fictícia'},act:{[hj]:5},feito:{'T:preservada':true},erros:{'POR01-0':2}});
  await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');const inicial=await armazenamento(p);
  for(const literal of ['-1','0.5','null','1e30','9007199254740991','9007199254740992','253402300800000','"123"','{}','[]','NaN','Infinity','-Infinity','1e309']){
   const texto='{"v":1,"cfg":{"nome":"Entrada Fictícia","certsZ":'+literal+'},"feito":{"T:indevida":true},"act":{"'+hj+'":999}}';
   await f.clicar(p,'tab',{v:'plano'});await f.clicar(p,'impabrir');await p.fill('#imp-txt',texto);await f.clicar(p,'impok');
   const aviso=await p.locator('body').innerText();assert(/preservad.+recuperação/.test(aviso),'Recusa deve ser explícita e oferecer recuperação: '+literal);
   assert(await f.ate(async()=>(await armazenamento(p)).quarentena.some(q=>q.texto===texto)),'Entrada original deve persistir inteira: '+literal);
   const depois=await armazenamento(p);assert.deepStrictEqual(depois.conta,inicial.conta,'Entrada inválida não altera checkpoint: '+literal);
   const ui=await f.estado(p);assert.strictEqual(ui.act[hj],5);assert(ui.feito['T:preservada']&&!ui.feito['T:indevida']);
   resultados.push({literal,recusou:true,preservou:true,copias:depois.quarentena.length});
  }
  for(const campo of ['id','_sid']){
   const texto=JSON.stringify({v:1,cfg:{},sims:[{d:'2026-11-15',r:{por:[1,2]},[campo]:'__proto__'}]});await f.clicar(p,'impabrir');await p.fill('#imp-txt',texto);await f.clicar(p,'impok');
   assert(await f.ate(async()=>(await armazenamento(p)).quarentena.some(q=>q.texto===texto)));assert.deepStrictEqual((await armazenamento(p)).conta,inicial.conta);resultados.push({campo,recusou:true,preservou:true});
  }
  const cd=await c.newCDPSession(p),caiu=p.waitForEvent('crash');cd.send('Page.crash').catch(()=>null);await caiu;await p.close();p=await f.pagina(c);await f.clicar(p,'tab',{v:'plano'});
  await p.waitForFunction(()=>document.querySelector('#sync')?.dataset.local==='confirmado');const reaberto=await armazenamento(p);assert.strictEqual(reaberto.conta.st.act[hj],5);assert.strictEqual(reaberto.quarentena.length,16);
  // Um checkpoint antigo com marcador inseguro também não pode ser normalizado e sobrescrito em silêncio.
  await p.evaluate(()=>new Promise((resolve,reject)=>{const o=window.indexedDB.open('eear-operacoes',1);o.onsuccess=()=>{const db=o.result,t=db.transaction('contas','readwrite'),s=t.objectStore('contas'),q=s.get('');q.onsuccess=()=>{const r=q.result;r.meta.r['["cfg","certsZ"]']=[0,'legado',1e30];r.st.cfg.certsZ=1e30;s.put(r,'');};t.oncomplete=()=>{db.close();resolve();};t.onerror=()=>reject(t.error);};}));
  await p.reload();await f.clicar(p,'tab',{v:'plano'});assert(await f.ate(async()=>(await p.locator('#sync').getAttribute('data-local'))==='falhou'));
  const corrompido=await armazenamento(p);assert.strictEqual(corrompido.conta.st.cfg.certsZ,1e30);assert(corrompido.quarentena.some(q=>q.origem==='checkpoint'&&q.texto.includes('1e+30')));
  await p.waitForTimeout(3400);const repetido=await armazenamento(p);console.log('DIAGNÓSTICO quarentena incompatível: '+corrompido.quarentena.length+' → '+repetido.quarentena.length);assert.strictEqual(repetido.quarentena.length,corrompido.quarentena.length,'Checkpoint incompatível não deve gerar cópias infinitas no polling');
  resultados.push({checkpointAntigoPreservado:true,indicador:await p.locator('#sync').innerText(),checkpoint:corrompido.conta});
  fs.writeFileSync(saida,JSON.stringify(resultados,null,2));console.log('✓ 14 marcadores/JSON inválidos e dois IDs reservados: recusa, cópia integral, checkpoint intacto e recuperação após crash; checkpoint antigo inseguro preservado.');
 }finally{await c.close();await f.fechar();}
})().catch(e=>{console.error(e);process.exitCode=1;});
