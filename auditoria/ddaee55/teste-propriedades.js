/* Auditoria: novos seeds e oráculo de conjuntos de eventos, extração do bundle sem mutá-lo. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const {carregar,base,copia,rng,permutar,igual,hashEsperado}=require('../../testes/integridade-base.js');
const a=carregar(),out=process.env.EEAR_AUDITORIA_SAIDA||'/workspace/audit-results/independente';
fs.mkdirSync(out,{recursive:true});
const result={hashEsperado,seeds:[],markers:[],failures:[],canonical:0,arrays:0};
for(let z=0;z<192;z++){
 const seed=(0xA7082026+z*7919)>>>0,r=rng(seed),actors=Array.from({length:8},()=>({m:a.opSemente(base()),add:new Set(),rem:new Set()}));
 const trace=[];
 try{
  for(let step=0;step<96;step++){
   const i=Math.floor(r()*8),j=Math.floor(r()*8),actor=actors[i],type=Math.floor(r()*4),id=`e:audit:${seed}:${step}`;
   if(type<2){
    const before=copia(a.opEstado(actor.m)),after=copia(before);after.erros.q=(after.erros.q||0)+1;
    actor.m=a.opUnir(actor.m,a.opDelta(actor.m,before,after,id,false));actor.add.add(id);trace.push({type:'error',i,id});
   }else if(type===2){
    const before=copia(a.opEstado(actor.m)),after=copia(before);after.erros={};
    actor.m=a.opUnir(actor.m,a.opDelta(actor.m,before,after,id,true));actor.add.forEach(x=>actor.rem.add(x));trace.push({type:'reset',i,id});
   }else{
    actor.m=a.opUnir(actor.m,actors[j].m);actors[j].add.forEach(x=>actor.add.add(x));actors[j].rem.forEach(x=>actor.rem.add(x));trace.push({type:'merge',i,j});
   }
   for(const x of actors)assert.strictEqual(a.opEstado(x.m).erros.q||0,[...x.add].filter(id=>!x.rem.has(id)).length);
  }
  const all=actors.reduce((m,x)=>a.opUnir(m,x.m),a.opVazio());
  for(const x of actors)igual(a.opUnir(all,x.m),all);
  const reversed=actors.slice().reverse().reduce((m,x)=>a.opUnir(m,x.m),a.opVazio());igual(a.opEstado(all),a.opEstado(reversed));
  result.seeds.push({seed,steps:trace.length,pass:true});
 }catch(e){result.failures.push({seed,error:e.stack,trace});}
 const raw=base();raw.sims=[{d:'2026-11-19',r:{por:[1,2]},nested:{b:{z:1,a:null},a:[{c:false,b:'ação 😀'},null]}}];
 const perm=permutar(raw,r);assert.strictEqual(a.identidadeImportacao(raw),a.identidadeImportacao(perm));
 const merged=a.opUnir(a.opSemente(raw),a.opSemente(perm));assert.strictEqual(a.opEstado(merged).sims.length,1);result.canonical++;
 const different=copia(raw);different.sims[0].nested.a.reverse();
 assert.notStrictEqual(a.identidadeImportacao(raw),a.identidadeImportacao(different));assert.strictEqual(a.opEstado(a.opUnir(a.opSemente(raw),a.opSemente(different))).sims.length,2);result.arrays++;
}
const cases=[['absent',undefined,true],['zero',0,true],['negative-zero',-0,true],['one',1,true],['max-date',253402300799999,true],['above-date',253402300800000,false],['below-safe',Number.MAX_SAFE_INTEGER-1,false],['max-safe',Number.MAX_SAFE_INTEGER,false],['above-safe',Number.MAX_SAFE_INTEGER+1,false],['1e30',1e30,false],['negative',-1,false],['fraction',.5,false],['numeric-string','123',false],['null',null,false],['object',{},false],['array',[],false],['NaN',NaN,false],['Infinity',Infinity,false]];
for(const [name,value,expected]of cases){let accepted=false;try{const st=base();if(value!==undefined)st.cfg.certsZ=value;a.opSemente(st);accepted=true;}catch{/* explicit rejection */}result.markers.push({name,value:String(value),expected,accepted});assert.strictEqual(accepted,expected,name);}
fs.writeFileSync(path.join(out,'auditor-propriedades.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({seeds:result.seeds.length,steps:192*96,canonical:result.canonical,arrays:result.arrays,markers:result.markers.length,failures:result.failures.length}));
process.exitCode=result.failures.length?1:0;
