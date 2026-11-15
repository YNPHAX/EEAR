/* Modelo independente por ações aceitas: seis sementes, duas contas, três abas A, dispositivo B,
   offline, reset, Levar, repetição, abort nativo, crash e confirmação HTTP perdida. */
const path=require('path'),fs=require('fs'),assert=require('assert'),fxt=require('./c186-fixture.js');
const {alvo,rng}=require('./c186-propriedades-base.js'),{local,remoto,cairPagina}=require('./c186-acoes.js');
const out=process.env.EEAR_AUDITORIA_SAIDA||'/tmp/eear-propriedades-c186008',hj=new Date().toISOString().slice(0,10),resultados=[];
(async()=>{
 if(fxt.emular(alvo,path.join(__dirname,'c186-fluxos.test.js')))return;
 const f=await fxt.abrir(alvo);let falhas=0;
 try{for(let seed=1;seed<=6;seed++){
  const cs=[],trace=[],r=rng(seed),s={seed,trace,webLocks:seed%2===1};let liberar;
  const contexto=async()=>{const c=await f.contexto();cs.push(c);if(!s.webLocks)await c.addInitScript(()=>Object.defineProperty(navigator,'locks',{value:undefined}));return c;};
  try{
   const cert={s:'fis',mod:null,ids:['FIS01'],h:3,d:'2026-10-17',c:'CERT-SEED-'+seed,o:'curso',t:1792195200000};
   const A=await f.conta('fluxos-A-'+seed,{v:1,t:Date.now(),cfg:{nome:'A Fictícia',certs:[cert]},act:{},feito:{}}),B=await f.conta('fluxos-B-'+seed,{v:1,t:Date.now(),cfg:{nome:'B Fictícia'},act:{},feito:{}});
   const c1=await contexto(),c2=await contexto(),p1=await f.pagina(c1);await f.entrar(p1,A.email);await remoto(p1);let p2=await f.pagina(c1);await local(p2);let p3=await f.pagina(c2);await f.entrar(p3,A.email);await remoto(p3);
   let esperado=0,validos=new Set();
   for(let rodada=0;rodada<2;rodada++){
    if(rodada){
     // Zerar elimina o histórico observado. Reabrir comprova que A já recebeu TODAS as operações de B.
     await p2.close();await p1.reload();await remoto(p1);p2=await f.pagina(c1);await local(p2);const visto=await f.estado(p1);assert.strictEqual(visto.act[hj],esperado);assert([...validos].every(k=>visto.feito[k]));
     await f.clicar(p1,'zerar');await f.clicar(p1,'zerarok');await remoto(p1);await p3.reload();await remoto(p3);await local(p2);esperado=0;validos=new Set();assert(await f.ate(async()=>{const a=await f.estado(p2),b=await f.estado(p3);s.observacaoReset={a,b,nuvem:await f.ler(A.uid)};return !(a.act[hj]||0)&&!(b.act[hj]||0)&&!a.cfg.certs.length&&!b.cfg.certs.length;}));trace.push({tipo:'zerar-confirmado'});}
    f.rede(c1,true);f.rede(c2,true);const paginas=[p1,p2,p3],n=5+Math.floor(r()*5);
    for(let k=0;k<n;k+=3){const lote=[];for(let j=k;j<Math.min(k+3,n);j++){const ator=Math.floor(r()*3),key=`T:seed-${seed}-${rodada}-${j}`;lote.push(f.clicar(paginas[ator],'marcar',{k:key}));trace.push({tipo:'estudar-offline',ator,key});validos.add(key);esperado++;}await Promise.all(lote);await Promise.all(paginas.map(local));}
    const antesCrash=await f.estado(p3);s['antesCrash'+rodada]=antesCrash;
    if(!rodada){
     // Um abort real impede checkpoint: reserva aceita existe, confirmação local não pode ser dada.
     await p3.evaluate(()=>{window.__aborts=0;const put=window.IDBObjectStore.prototype.put;window.IDBObjectStore.prototype.put=function(...args){const q=put.apply(this,args);if(this.name==='contas'){window.__aborts++;this.transaction.abort();}return q;};});
     const key='T:abort-'+seed;await f.clicar(p3,'marcar',{k:key});validos.add(key);esperado++;trace.push({tipo:'put-abortado',key});
     assert(await f.ate(()=>p3.evaluate(()=>window.__aborts>0)));
     assert.notStrictEqual(await p3.locator('#sync').getAttribute('data-local'),'confirmado');
     s.aceitoAntesAbort=await f.estado(p3);p3=await cairPagina(p3,c2,f);await local(p3);const depois=await f.estado(p3);assert(depois.feito[key]);s.recuperadoAbort=depois;
    }
    f.rede(c1,false);await p1.evaluate(()=>window.dispatchEvent(new Event('online')));await remoto(p1);
    if(rodada){
     let iniciou;const iniciado=new Promise(q=>{iniciou=q;}),espera=new Promise(q=>{liberar=q;});let reter=true,habilitada=false;
     await c2.route(/127\.0\.0\.1:8380\/.*:commit(?:\?|$)/,async q=>{if(!habilitada||!reter||!(q.request().postData()||'').includes(A.uid))return q.fallback();reter=false;const res=await q.fetch();iniciou(res.status());await espera;await q.fulfill({response:res}).catch(()=>null);});
     habilitada=true;f.rede(c2,false);await p3.evaluate(()=>window.dispatchEvent(new Event('online')));
     const http=await Promise.race([iniciado,new Promise((_,rej)=>setTimeout(()=>rej(new Error('Não reteve confirmação de commit')),20000))]);assert.strictEqual(http,200);trace.push({tipo:'commit-aceito-resposta-retida',http});
     const cd=await c2.newCDPSession(p3),caiu=p3.waitForEvent('crash');cd.send('Page.crash').catch(()=>null);await caiu;await p3.close();liberar();p3=await f.pagina(c2);await local(p3);await remoto(p3);
    }else{f.rede(c2,false);await p3.evaluate(()=>window.dispatchEvent(new Event('online')));await remoto(p3);}
    assert(await f.ate(async()=>{const d=await f.ler(A.uid);return d&&d.act[hj]===esperado&&[...validos].every(k=>d.feito[k]);}));const nuvem=await f.ler(A.uid);
    assert.strictEqual(nuvem.act[hj],esperado);assert.strictEqual(Object.keys(nuvem.feito).length,validos.size);assert.strictEqual(nuvem.cfg.certs.length,rodada?0:1);assert.strictEqual((await f.ler(B.uid)).act[hj]||0,0);s['nuvemA'+rodada]=nuvem;
   }
   // Nova origem anônima, transferência explícita a B e repetição dos mesmos IDs.
   const cb=await contexto(),pb=await f.pagina(cb);await pb.fill('#ini-nome','Sem conta Fictício');await f.clicar(pb,'comecar');await local(pb);
   for(let i=0;i<2;i++)await f.clicar(pb,'marcar',{k:'T:anon-'+seed+'-'+i});await local(pb);const backup=await f.estado(pb);assert.strictEqual(backup.act[hj],2);
   await f.entrar(pb,B.email);await remoto(pb);await f.clicar(pb,'contalevar');await remoto(pb);assert.strictEqual((await f.ler(B.uid)).act[hj],2);trace.push({tipo:'levar',conta:'B',esperado:2});
   for(let k=0;k<3;k++){await f.importar(pb,backup);await remoto(pb);assert.strictEqual((await f.ler(B.uid)).act[hj],2);trace.push({tipo:'reimportar-identificada',conta:'B'});}
   await f.clicar(pb,'zerar');await f.clicar(pb,'zerarok');await remoto(pb);await f.importar(pb,backup);await remoto(pb);assert.strictEqual((await f.ler(B.uid)).act[hj]||0,0);
   await f.clicar(pb,'contasair');await f.clicar(pb,'contasairmanter');assert(await f.ate(()=>pb.evaluate(()=>!localStorage.getItem('missao-eear-conta'))));await f.entrar(pb,B.email);await remoto(pb);
   s.finalB=await f.ler(B.uid);s.finalA=await f.ler(A.uid);assert.strictEqual(s.finalA.act[hj],esperado);assert.deepStrictEqual(s.finalB.feito,{});assert.deepStrictEqual(s.finalB.cfg.certs,[]);assert.strictEqual(s.finalB.act[hj]||0,0);
   s.passou=true;console.log('✓ seed='+seed+' locks='+s.webLocks+' ações='+trace.length+' A='+esperado+' B=0; abort/crash, ACK perdido, reset, Levar, reimportar e sessão preservados.');
  }catch(e){falhas++;s.passou=false;s.erro=e.stack;console.error('✗ seed='+seed,e);}finally{if(liberar)liberar();for(const c of cs)await c.close();}
  resultados.push(s);fs.writeFileSync(path.join(out,'fluxos-resultados.json'),JSON.stringify(resultados,null,2));
 }}finally{await f.fechar();}process.exitCode=falhas?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
