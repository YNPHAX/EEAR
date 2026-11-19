/* Fronteira remota real: somente emulador demo, usuário fictício, regras exatas do candidato. */
const fs=require('fs'),path=require('path'),assert=require('assert'),fixture=require('../../testes/integridade-fixture.js');
const repo=path.resolve(__dirname,'../..'),out=process.env.EEAR_AUDITORIA_SAIDA||'/workspace/audit-results/independente';
(async()=>{
 if(fixture.emular(repo,__filename))return;
 assert.strictEqual(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8380');
 const signup=await fetch('http://127.0.0.1:9399/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'audit-boundary@exemplo.test',password:'only-fake-test-123',returnSecureToken:true})});
 assert.strictEqual(signup.status,200);const cred=await signup.json(),results=[];
 const docs='http://127.0.0.1:8380/v1/projects/demo-eear-properties-c186/databases/(default)/documents';
 for(const [name,n,unicode,expected]of [['ascii-899999',899999,false,200],['ascii-900000',900000,false,403],['ascii-900001',900001,false,403],['unicode-899999',899999,true,200],['unicode-900000',900000,true,403]]){
  const text=unicode?'á'.repeat(Math.floor(n/2))+(n%2?'x':''):'x'.repeat(n);
  const response=await fetch(docs+':commit',{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer '+cred.idToken},body:JSON.stringify({writes:[{update:{name:'projects/demo-eear-properties-c186/databases/(default)/documents/alunos/'+cred.localId,fields:{v:{integerValue:'6'},t:{integerValue:'1'},dados:{stringValue:text}}},updateTransforms:[{fieldPath:'atualizado',setToServerValue:'REQUEST_TIME'}]}]})});
  const responseBody=await response.json();results.push({name,bytes:Buffer.byteLength(text),utf16:text.length,expected,status:response.status,error:responseBody.error?.status});
  console.log(JSON.stringify(results.at(-1)));
 }
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'limite-fronteira.json'),JSON.stringify(results,null,2));
 process.exitCode=results.every(x=>x.status===x.expected)?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
