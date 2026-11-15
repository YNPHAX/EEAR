/* Migração de aliases/tombstones já gravados: álgebra real e invariantes de proveniência. */
const assert=require('assert'),fs=require('fs'),vm=require('vm');
const base=()=>({v:1,cfg:{certs:[]},sims:[],mod:{},aula:{},act:{},erros:{},feito:{}});
const c={window:{},navigator:{},loc:{},novoEstado:base,mesclar:x=>x,certValido:x=>!!x.c,certChave:x=>x.c};vm.createContext(c);
vm.runInContext(fs.readFileSync('curso/app/14-abas.js','utf8')+';this.api={opVazio,opMigrar,opSemente,opUnir,opEstado,opPlano,opDelta,opMarcadorResetValido,opValida};',c);
const a=c.api,copia=x=>JSON.parse(JSON.stringify(x));
const X={d:'2026-11-15',tipo:'materia',mat:'por',r:{por:[1,2]},min:5},Y={min:5,r:{por:[1,2]},mat:'por',tipo:'materia',d:'2026-11-15'};
const chave=x=>JSON.stringify(['sims',JSON.stringify(x)+'#0']),kX=chave(X),kY=chave(Y);
const antigo=(x,removido)=>{const m=a.opVazio();m.n=removido?20:0;m.r[chave(x)]=removido?[20,'e:ZERAR']:[0,'z:i:mesma-origem',x];return m;};
for(const [A,B] of [[X,Y],[Y,X]]){
 const duplicado=a.opUnir(antigo(A),antigo(B));assert.strictEqual(a.opEstado(duplicado).sims.length,1);
 const zerado=a.opUnir(antigo(A,true),antigo(B));assert.strictEqual(a.opEstado(zerado).sims.length,0);
 for(const ordem of [[antigo(A),antigo(B),antigo(A,true)],[antigo(A,true),antigo(B),antigo(A)]]){let m=a.opVazio();for(const x of ordem.concat(ordem.slice().reverse()))m=a.opUnir(m,x);assert.strictEqual(a.opEstado(m).sims.length,0);}
}
// Dois aliases e uma chave já canônica no MESMO checkpoint, com tombstone mais recente.
const combinado=a.opVazio();combinado.n=20;combinado.r[kX]=[20,'reset'];combinado.r[kY]=[0,'legado',Y];
assert.strictEqual(a.opEstado(combinado).sims.length,0);assert.deepStrictEqual(copia(a.opMigrar(a.opMigrar(combinado))),copia(a.opMigrar(combinado)));
// Posição/multiplicidade, arrays, valores e IDs realmente distintos não podem ser fundidos.
const st=base();st.sims=[X,X,{...X,r:{por:[2,2]}},{...X,id:'dispositivo-A'},{...X,id:'dispositivo-B'}];
assert.strictEqual(a.opEstado(a.opSemente(st)).sims.length,5);
const st2=base();st2.sims=[{...X,r:{por:[2,1]}}];assert.notDeepStrictEqual(copia(a.opPlano({...base(),sims:[X]})),copia(a.opPlano(st2)));
for(const v of [0,1,Date.now(),253402300799999])assert(a.opMarcadorResetValido(v));
for(const v of [-1,.1,NaN,Infinity,-Infinity,1e30,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER+1,null,'123'])assert(!a.opMarcadorResetValido(v));
// Reset explícito com data que NÃO avança: remove a base e preserva o erro novo concorrente.
const b=base();b.cfg.certsZ=253402300799999;b.erros.q=2;const m=a.opSemente(b),zero=copia(b);zero.erros={};
const z=a.opDelta(m,b,zero,'e:RESET',true),novo=copia(b);novo.erros.q=3;const n=a.opDelta(m,b,novo,'e:ERRO');
assert.strictEqual(a.opEstado(a.opUnir(a.opUnir(m,z),n)).erros.q,1);
console.log('✓ Migração de aliases e tombstones em ambas as ordens, multiplicidade/IDs/arrays preservados; reset explícito e limites numéricos.');

// A ordem de apresentação não pode renomear operações já persistidas.
const foraDeOrdem=base();foraDeOrdem.sims=[{...X,d:'2026-11-20'},{...Y,d:'2026-11-01'}];
const mo=a.opSemente(foraDeOrdem),vista=a.opEstado(mo),zerada=copia(vista);zerada.sims=[];
assert.strictEqual(a.opEstado(a.opUnir(mo,a.opDelta(mo,vista,zerada,'e:ZEROU-SIM'))).sims.length,0,'Zerar remove também simulados fora da ordem cronológica original');

if(process.env.EEAR_REPO_REPROVADO_IA07){
 const old={window:{},navigator:{},loc:{},novoEstado:base,mesclar:x=>x,certValido:x=>!!x.c,certChave:x=>x.c};vm.createContext(old);vm.runInContext(fs.readFileSync(require('path').join(process.env.EEAR_REPO_REPROVADO_IA07,'curso/app/14-abas.js'),'utf8')+';this.api={opSemente,opEstado,opDelta,opUnir};',old);
 const t=old.api,m=t.opSemente(foraDeOrdem),v=t.opEstado(m),z=copia(v);z.sims=[];const antigo=t.opEstado(t.opUnir(m,t.opDelta(m,v,z,'e:ZERO')));assert.strictEqual(antigo.sims.length,2);
 console.log('CONTROLE NEGATIVO SIM ORDEM c186008: reproduziu 2/0; candidato remove 0/0 com identidades persistidas.');
}

// O oráculo de formato não ignora IDs nem diferenças semânticas para obter verde.
const intactos=require('./plataforma-persistencia.js').simuladosIntactos,origem=[X],guardado=copia(a.opEstado(a.opSemente({...base(),sims:origem})).sims);assert(intactos(origem,guardado,false));
for(const mudar of [s=>s[0]._sid+='errado',s=>s[0].r.por.reverse(),s=>s[0].min++,s=>s.push({...s[0]})]){const outro=copia(guardado);mudar(outro);assert(!intactos(origem,outro,false));}
assert(!intactos(origem,guardado,true),'Histórico continua literal, sem adaptação do formato');

// Um ID explícito é opaco, inclusive se parecer o antigo JSON#índice.
const opaco=JSON.stringify(X)+'#0',comId={...base(),sims:[{...X,id:opaco}]},mId=a.opSemente(comId),vId=a.opEstado(mId),zId=copia(vId);zId.sims=[];
const resultadoId=a.opEstado(a.opUnir(mId,a.opDelta(mId,vId,zId,'e:RESET-OPACO')));console.log('ID OPACO APÓS RESET:',JSON.stringify({id:opaco,esperado:0,estado:resultadoId}));assert.strictEqual(resultadoId.sims.length,0);

for(const id of ['', 'sim:opaco', '{}#0', 'null#0', '[]#0', JSON.stringify(Y)+'#7', '@sim:v1:opaco#0', 'ação\"/😀']){
 const raw={...base(),sims:[{...X,id}]},m=a.opSemente(raw);assert(a.opValida(m));const v=a.opEstado(m),z=copia(v);z.sims=[];const apagado=a.opUnir(m,a.opDelta(m,v,z,'e:ZERO'));assert.strictEqual(a.opEstado(a.opUnir(apagado,m)).sims.length,0);
}
for(const id of ['__proto__','prototype','constructor']){assert.throws(()=>a.opSemente({...base(),sims:[{...X,id}]}));assert.throws(()=>a.opSemente({...base(),sims:[{...X,_sid:id}]}));}
const inconsistente=a.opVazio();inconsistente.r[JSON.stringify(['sims','outro-id'])]=[0,'ilegivel',{...X,_sid:'id-diferente'}];assert(!a.opValida(inconsistente));

// Copiar o registro não pode invocar o setter de __proto__ nem perder campos JSON.
const comCampoJSON=JSON.parse('{"d":"2026-11-15","r":{"por":[1,2]},"__proto__":{"dado":"preservado"}}');
const campoPreservado=a.opEstado(a.opSemente({...base(),sims:[comCampoJSON]})).sims[0];assert(Object.prototype.hasOwnProperty.call(campoPreservado,'__proto__'));assert.deepStrictEqual(copia(campoPreservado.__proto__),{dado:'preservado'});
