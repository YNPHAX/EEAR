/* Gate IA07/IA08: preserva literalmente os testes originais e seus negativos no SHA antigo.
   Os testes do candidato aceitam recusa/quarentena de entrada inválida, nunca progresso corrompido. */
const fs=require('fs'),path=require('path'),assert=require('assert'),nodeCrypto=require('crypto'),{spawnSync,execFileSync}=require('child_process');
const base=process.env.EEAR_REPO_REPROVADO_IA07,saida=process.env.EEAR_AUDITORIA_SAIDA||path.join(require('os').tmpdir(),'eear-integridade-gate');
assert(base,'Defina EEAR_REPO_REPROVADO_IA07 para o checkout c186008.');
assert.strictEqual(execFileSync('git',['rev-parse','HEAD'],{cwd:base,encoding:'utf8'}).trim(),'c186008012ba12709fc07c08e36532471a894a8c');
const hashes=require('./c186-originais.sha256.json');
for(const [n,h]of Object.entries(hashes))assert.strictEqual(nodeCrypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,n))).digest('hex'),h,'Teste original alterado: '+n);
fs.mkdirSync(saida,{recursive:true});const antes=path.join(saida,'antes');fs.mkdirSync(antes,{recursive:true});let falhas=0;
for(const n of ['c186-propriedades','c186-contraexemplos','crash-observacao']){
 const r=spawnSync(process.execPath,[path.join(__dirname,n+'.test.js')],{env:{...process.env,EEAR_REPO_ALVO:base,EEAR_AUDITORIA_SAIDA:antes,EEAR_CRASH_SAIDA:path.join(antes,'crash.json')},encoding:'utf8'}),s=(r.stdout||'')+(r.stderr||'');
 process.stdout.write(s);fs.writeFileSync(path.join(antes,n+'.log'),s);
 const evidencia=JSON.parse(fs.readFileSync(path.join(antes,n==='c186-propriedades'?'propriedades-resultados.json':n==='crash-observacao'?'crash.json':'contraexemplos-resultados.json')));
 const reproduziu=r.status===1&&(n==='c186-propriedades'?evidencia.falhas.length===3:n==='crash-observacao'?evidencia.length===2&&evidencia.some(x=>!x.resumo.preservouUI)&&evidencia.every(x=>x.resumo.preservouCheckpoint&&x.resumo.reaberto===1)&&!evidencia.some(x=>x.preparacaoFalhou):evidencia.length===4&&evidencia.filter(x=>!x.passou).length===3&&!evidencia.some(x=>x.preparacaoFalhou));
 console.log('CONTROLE NEGATIVO ORIGINAL '+n+': '+(reproduziu?'REPRODUZIU':'FALHOU'));if(!reproduziu)falhas++;
}
const alvo=path.resolve(process.env.EEAR_REPO_ALVO||path.join(__dirname,'..')),hash=nodeCrypto.createHash('sha256').update(fs.readFileSync(path.join(alvo,'curso/app.js'))).digest('hex');
assert(!process.env.EEAR_RUNTIME_SHA256||hash===process.env.EEAR_RUNTIME_SHA256,'Runtime não corresponde ao hash explícito.');
for(const n of ['integridade-propriedades','simulados-migracao','simulados-identidades','integridade-simulados','integridade-fluxos','integridade-dados','reset-validacao','reset-cache-quota','simulados-upgrade','crash-observacao','certificado-cache','importacoes-crash']){
 const r=spawnSync(process.execPath,[path.join(__dirname,n+'.test.js')],{env:{...process.env,EEAR_REPO_ALVO:alvo,EEAR_AUDITORIA_SAIDA:saida,EEAR_RUNTIME_SHA256:hash,EEAR_RESET_SAIDA:path.join(saida,'reset-validacao.json'),EEAR_UPGRADE_SAIDA:path.join(saida,'upgrade.json'),EEAR_CRASH_SAIDA:path.join(saida,'crash.json'),EEAR_RESET_CACHE_SAIDA:path.join(saida,'cache-quota.json'),EEAR_SIM_IDENTIDADES_SAIDA:path.join(saida,'simulados-identidades.json'),EEAR_CERT_CACHE_SAIDA:path.join(saida,'certificado-cache.json')},stdio:'inherit'});
 console.log('GATE IA07/IA08 '+n+': '+(r.status===0?'PASSOU':'FALHOU'));if(r.status!==0)falhas++;
}
process.exitCode=falhas?1:0;
