/* Fluxo público real: ordem cronológica, importação atrasada, atividades idênticas independentes,
   Zerar, novo estudo, reimportação e crash. Somente Auth/Firestore demo. */
const fs=require('fs'),path=require('path'),assert=require('assert'),fixture=require('./integridade-fixture.js');
const {local,remoto,cairPagina}=require('./c186-acoes.js'),alvo=path.resolve(process.env.EEAR_REPO_ALVO||path.join(__dirname,'..')),hj=new Date().toISOString().slice(0,10);
const out=process.env.EEAR_SIM_IDENTIDADES_SAIDA||'/tmp/eear-simulados-identidades.json';
async function entregar(p,f){await f.clicar(p,'simini',{tipo:'materia',s:'por'});await f.clicar(p,'entregar');await f.clicar(p,'entregarok');await local(p);return f.estado(p);}
const ordenar=x=>Array.isArray(x)?x.map(ordenar):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,ordenar(x[k])])):x;
const conteudo=x=>{const y={...x};delete y.id;delete y._sid;return ordenar(y);};
(async()=>{
 if(fixture.emular(alvo,path.join(__dirname,'simulados-identidades.test.js')))return;
 const f=await fixture.abrir(alvo),cs=[],r={};
 try{
  const conta=await f.conta('sim-identidades',{v:1,t:Date.now(),cfg:{nome:'Simulados Fictícios'},act:{},feito:{}});
  for(let i=0;i<3;i++)cs.push(await f.contexto());let A=await f.pagina(cs[0]),B=await f.pagina(cs[1]);
  await f.entrar(A,conta.email);await remoto(A);await f.entrar(B,conta.email);await remoto(B);f.rede(cs[1],true);
  const raw={v:1,cfg:{nome:'Ordem Fictícia'},act:{[hj]:2},sims:[{d:'2026-11-20',tipo:'materia',mat:'por',r:{por:[1,2]},min:5},{d:'2026-11-01',tipo:'materia',mat:'por',r:{por:[2,2]},min:5}]};
  await f.importar(A,raw);await remoto(A);r.antes=await f.estado(A);assert.strictEqual(r.antes.sims.length,2);assert(r.antes.sims.every(s=>typeof s._sid==='string'));
  await f.clicar(A,'zerar');await f.clicar(A,'zerarok');await remoto(A);r.zerado=await f.ler(conta.uid);assert.strictEqual(r.zerado.sims.length,0);
  await f.importar(B,raw);await local(B);assert.strictEqual((await f.estado(B)).sims.length,2);f.rede(cs[1],false);await B.evaluate(()=>window.dispatchEvent(new Event('online')));await remoto(B);r.atrasado=await f.ler(conta.uid);assert.strictEqual(r.atrasado.sims.length,0);
  A=await cairPagina(A,cs[0],f);await remoto(A);assert.strictEqual((await f.estado(A)).sims.length,0);
  f.rede(cs[0],true);f.rede(cs[1],true);r.liveA=await entregar(A,f);r.liveB=await entregar(B,f);
  assert.strictEqual(r.liveA.sims.length,1);assert.strictEqual(r.liveB.sims.length,1);assert.notStrictEqual(r.liveA.sims[0].id,r.liveB.sims[0].id);assert.deepStrictEqual(conteudo(r.liveA.sims[0]),conteudo(r.liveB.sims[0]));
  f.rede(cs[0],false);await A.evaluate(()=>window.dispatchEvent(new Event('online')));await remoto(A);f.rede(cs[1],false);await B.evaluate(()=>window.dispatchEvent(new Event('online')));await remoto(B);
  r.concorrentes=await f.ler(conta.uid);assert.strictEqual(r.concorrentes.sims.length,2);assert.strictEqual(r.concorrentes.act[hj],2);assert.strictEqual(Object.values(r.concorrentes.erros).reduce((n,x)=>n+x,0),48);
  const identificado=await f.estado(B);B=await cairPagina(B,cs[1],f);await remoto(B);assert.strictEqual((await f.estado(B)).sims.length,2);
  await A.reload();await remoto(A);assert.strictEqual((await f.estado(A)).sims.length,2);await f.clicar(A,'zerar');await f.clicar(A,'zerarok');await remoto(A);
  const C=await f.pagina(cs[2]);await f.entrar(C,conta.email);await remoto(C);assert.strictEqual((await f.estado(C)).sims.length,0);
  r.posterior=await entregar(C,f);await remoto(C);const id=r.posterior.sims[0].id;await f.importar(C,identificado);await remoto(C);r.final=await f.ler(conta.uid);
  assert.strictEqual(r.final.sims.length,1);assert.strictEqual(r.final.sims[0].id,id);assert.strictEqual(r.final.act[hj],1);assert.strictEqual(Object.values(r.final.erros).reduce((n,x)=>n+x,0),24);
  fs.writeFileSync(out,JSON.stringify(r,null,2));console.log('✓ Simulados fora de ordem não voltam; dois estudos reais idênticos contam 2/2; após Zerar/novo estudo/reimportar fica 1/1, inclusive após crash.');
 }finally{for(const c of cs)await c.close();await f.fechar();}
})().catch(e=>{console.error(e);process.exitCode=1;});
