/* Upgrade real do cliente c186008: mesmo perfil/IDB, aliases antigos, tombstones e escritor v4.
   Somente emuladores demo; scripts servidos byte a byte das duas versões, sem funções internas. */
const fs=require('fs'),path=require('path'),assert=require('assert'),fixture=require('./integridade-fixture.js');
const {local,remoto,cairPagina}=require('./c186-acoes.js');
const alvo=path.resolve(process.env.EEAR_REPO_ALVO||path.join(__dirname,'..')),antigo=process.env.EEAR_REPO_REPROVADO_IA07;
assert(antigo,'Defina EEAR_REPO_REPROVADO_IA07=c186008');
const sha=require('child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:antigo,encoding:'utf8'}).trim();assert.strictEqual(sha,'c186008012ba12709fc07c08e36532471a894a8c');
const out=process.env.EEAR_UPGRADE_SAIDA||'/tmp/eear-simulados-upgrade.json',hj=new Date().toISOString().slice(0,10);
(async()=>{
 if(fixture.emular(alvo,path.join(__dirname,'simulados-upgrade.test.js')))return;
 const f=await fixture.abrir(alvo),cs=[],estados={};let legadoB=true;
 try{
  const conta=await f.conta('upgrade',{v:1,t:Date.now(),cfg:{nome:'Upgrade Fictício'},act:{},feito:{}}),velho=fs.readFileSync(path.join(antigo,'curso/app.js'));
  const ca=await f.contexto(),cb=await f.contexto();cs.push(ca,cb);
  await ca.route('**/app.js',q=>q.fulfill({contentType:'text/javascript',body:velho}));
  await cb.route('**/app.js',q=>legadoB?q.fulfill({contentType:'text/javascript',body:velho}):q.fallback());
  const A=await f.pagina(ca);await f.entrar(A,conta.email);await remoto(A);let B=await f.pagina(cb);await f.entrar(B,conta.email);await remoto(B);
  const X={v:1,cfg:{nome:'Origem Fictícia'},act:{[hj]:2},sims:[{d:'2026-11-15',tipo:'materia',mat:'por',r:{por:[1,2]},min:5}]};
  const Y={...X,sims:[{min:5,r:{por:[1,2]},mat:'por',tipo:'materia',d:'2026-11-15'}]};
  f.rede(ca,true);f.rede(cb,true);await f.importar(A,X);await local(A);await f.importar(B,Y);await local(B);
  f.rede(ca,false);await A.evaluate(()=>window.dispatchEvent(new Event('online')));await remoto(A);
  f.rede(cb,false);await B.evaluate(()=>window.dispatchEvent(new Event('online')));await remoto(B);
  estados.duplicadoAntigo=await f.estado(B);assert.strictEqual(estados.duplicadoAntigo.sims.length,2);assert.strictEqual(estados.duplicadoAntigo.act[hj],2);
  legadoB=false;await B.reload();await remoto(B);estados.migrado=await f.estado(B);assert.strictEqual(estados.migrado.sims.length,1);assert.strictEqual(estados.migrado.act[hj],2);
  await f.clicar(B,'zerar');await f.clicar(B,'zerarok');await remoto(B);await f.importar(B,estados.duplicadoAntigo);await remoto(B);
  estados.reimportacaoIdentificada=await f.ler(conta.uid);assert.strictEqual(estados.reimportacaoIdentificada.sims.length,0);assert.strictEqual(estados.reimportacaoIdentificada.act[hj]||0,0);
  // Cliente antigo continua com sua cópia. O envelope monotônico o impede de substituir v6.
  await f.clicar(A,'marcar',{k:'T:legitima-antiga'});await local(A);await A.evaluate(()=>window.dispatchEvent(new Event('online')));
  assert(await f.ate(async()=>/versão|atualiz/i.test(await A.locator('#sync').innerText())));estados.avisoAntigo=await A.locator('#sync').innerText();
  const token=await A.evaluate(async()=>{const ap=await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),au=await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js');return au.getAuth(ap.getApp()).currentUser.getIdToken();});
  const url='http://127.0.0.1:8380/v1/projects/demo-eear-properties-c186/databases/(default)/documents';
  const antes=await(await fetch(url+'/alunos/'+conta.uid,{headers:{Authorization:'Bearer owner'}})).json();assert.strictEqual(antes.fields.v.integerValue,'6');
  for (const versao of ['4', '5']) {
    const tentativa=await fetch(url+':commit',{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({writes:[{update:{name:'projects/demo-eear-properties-c186/databases/(default)/documents/alunos/'+conta.uid,fields:{v:{integerValue:versao},dados:{stringValue:JSON.stringify(estados.duplicadoAntigo)},t:{integerValue:'1'}}},updateTransforms:[{fieldPath:'atualizado',setToServerValue:'REQUEST_TIME'}]}]})});
    assert.strictEqual(tentativa.status,403);estados['escritorV'+versao+'HTTP']=tentativa.status;
  }
  const depois=await(await fetch(url+'/alunos/'+conta.uid,{headers:{Authorization:'Bearer owner'}})).json();assert.strictEqual(depois.fields.dados.stringValue,antes.fields.dados.stringValue);
  // Migração explícita conserva a atividade nova de A e os tombstones de B.
  estados.copiaAntiga=await f.estado(A);await f.importar(B,estados.copiaAntiga);await remoto(B);estados.nuvem=await f.ler(conta.uid);
  assert.strictEqual(estados.nuvem.sims.length,0);assert.strictEqual(estados.nuvem.act[hj],1);assert(estados.nuvem.feito['T:legitima-antiga']);
  B=await cairPagina(B,cb,f);await remoto(B);estados.reaberto=await f.estado(B);assert.strictEqual(estados.reaberto.sims.length,0);assert.strictEqual(estados.reaberto.act[hj],1);
  const cc=await f.contexto();cs.push(cc);const C=await f.pagina(cc);await f.entrar(C,conta.email);await remoto(C);estados.outro=await f.estado(C);assert.strictEqual(estados.outro.sims.length,0);assert.strictEqual(estados.outro.act[hj],1);
  fs.writeFileSync(out,JSON.stringify(estados,null,2));console.log('✓ Upgrade c186: 2→1 simulado, Zerar/reimportar→0; escritores v4/v5 403 sem alteração; atividade nova 1/1 após crash e em outro aparelho.');
 }finally{for(const c of cs)await c.close();await f.fechar();}
})().catch(e=>{console.error(e);process.exitCode=1;});
