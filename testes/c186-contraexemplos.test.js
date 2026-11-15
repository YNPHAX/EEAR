/* Provas e2e das propriedades negativas: app imutável, SDK real e emulador em portas isoladas.
   Mantém as expectativas originais; saída não zero se qualquer propriedade falhar. */
const path = require('path'), fs = require('fs'), assert = require('assert'), nodeCrypto = require('crypto');
const fxt = require('./c186-fixture.js'), { base, rng, permutar, ordenar, igual, alvo } = require('./c186-propriedades-base.js');
const { responder, local, remoto, cairPagina } = require('./c186-acoes.js');
const out = process.env.EEAR_AUDITORIA_SAIDA || '/tmp/eear-propriedades-c186008', hj = new Date().toISOString().slice(0,10);
const seed = 1, resultados = []; let falhas = 0;
async function executar(nome, fn) { try { const r = await fn(); resultados.push({ nome, seed, ...r }); if (!r.passou) falhas++; console.log((r.passou ? '✓ ' : '✗ ') + nome + ': ' + JSON.stringify(r.resumo)); } catch (e) { falhas++; resultados.push({ nome, seed, preparacaoFalhou: true, erro: e.stack }); console.error('PREPARAÇÃO/EXECUÇÃO ' + nome, e); } fs.writeFileSync(path.join(out,'contraexemplos-resultados.json'),JSON.stringify(resultados,null,2)); }
(async () => {
 if (fxt.emular(alvo, path.join(__dirname,'c186-contraexemplos.test.js'))) return;
 const f = await fxt.abrir(alvo);
 try {
 for (const reset of [false,true]) await executar(reset ? 'reset-simulados-canonicos' : 'idempotencia-simulados-canonicos', async () => {
  const cs = [];
  try {
   const cred = await f.conta('canonico-' + reset, { v:1,t:Date.now(),cfg:{nome:'Fictícia'},act:{},feito:{} });
   const paginas=[];
   for (let i=0;i<2;i++) { const c=await f.contexto();cs.push(c);const p=await f.pagina(c);paginas.push(p);await f.entrar(p,cred.email);await remoto(p); }
   const [A,B]=paginas; f.rede(cs[1],true); if (!reset) f.rede(cs[0],true);
   const original=base(); original.cfg.nome='Origem canônica fictícia';original.act[hj]=2;original.sims=[{d:'2026-11-15',tipo:'materia',mat:'por',prova:null,r:{por:[1,2]},min:5}];
   const outra=permutar(original,rng(seed));igual(original,outra);assert.notStrictEqual(JSON.stringify(original),JSON.stringify(outra));
   await f.importar(A,original);await local(A);const aceitoA=await f.estado(A);assert.strictEqual(aceitoA.sims.length,1);
   let antesReset=null;
   if (reset) { await remoto(A);await f.clicar(A,'zerar');await f.clicar(A,'zerarok');await remoto(A);antesReset=await f.ler(cred.uid);assert.strictEqual(antesReset.sims.length,0); }
   await f.importar(B,outra);await local(B);const aceitoB=await f.estado(B);assert.strictEqual(aceitoB.sims.length,1);
   const hA=Object.keys(aceitoA.cfg._importacoes),hB=Object.keys(aceitoB.cfg._importacoes);assert.deepStrictEqual(hA,hB,'O app precisa reconhecer a mesma origem.');
   if (!reset) { f.rede(cs[0],false);await A.evaluate(()=>window.dispatchEvent(new Event('online')));await remoto(A); }
   f.rede(cs[1],false);await B.evaluate(()=>window.dispatchEvent(new Event('online')));await remoto(B);
   const nuvem=await f.ler(cred.uid), Cctx=await f.contexto();cs.push(Cctx);const C=await f.pagina(Cctx);await f.entrar(C,cred.email);await remoto(C);const novo=await f.estado(C);
   const reaberto=await cairPagina(B,cs[1],f);await remoto(reaberto);const recuperado=await f.estado(reaberto);
   const esperado=reset?0:1, passou=nuvem.sims.length===esperado&&novo.sims.length===esperado&&recuperado.sims.length===esperado;
   return { passou, origemA:original,origemB:outra,aceitoA,aceitoB,antesReset,nuvem,novo,recuperado,
    sequencia:reset?['A importar','A Zerar confirmado','B importar offline','B reconectar','reabrir/crash']:['A importar offline','B importar offline','A reconectar','B reconectar','reabrir/crash'],
    resumo:{esperado,simuladosNuvem:nuvem.sims.length,simuladosNovo:novo.sims.length,simuladosRecuperados:recuperado.sims.length,atividadeNuvem:nuvem.act[hj]||0,hashesApp:hA,simuladosCanonicos:nuvem.sims.map(ordenar),hashesTexto:[original,outra].map(x=>nodeCrypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'))} };
  } finally { for(const c of cs)await c.close(); }
 });
 for(const marcador of [0,1e30]) await executar(marcador===0?'controle-reset-normal':'reset-marcador-inseguro',async()=>{
  const cs=[];
  try{
   const cred=await f.conta('marcador-'+marcador,{v:1,t:Date.now(),cfg:{nome:'Fictícia'},act:{},feito:{}});
   const ca=await f.contexto();cs.push(ca);const A=await f.pagina(ca);await f.entrar(A,cred.email);await remoto(A);
   const arquivo={v:1,cfg:{nome:'Marcador Fictício',certsZ:marcador},erros:{'POR01-0':2},act:{[hj]:2}};
   await f.importar(A,arquivo);await remoto(A);const inicial=await f.ler(cred.uid);assert.strictEqual(inicial.erros['POR01-0'],2);
   const cb=await f.contexto();cs.push(cb);let B=await f.pagina(cb);await f.entrar(B,cred.email);await remoto(B);f.rede(cb,true);
   await f.clicar(A,'zerar');await f.clicar(A,'zerarok');await remoto(A);const zerado=await f.ler(cred.uid);assert.deepStrictEqual(zerado.erros,{});
   await f.clicar(B,'errosini');assert.deepStrictEqual(await responder(B,true),{id:'POR01-0',errado:true});await f.clicar(B,'sairquiz');await local(B);const aceito=await f.estado(B);assert.strictEqual(aceito.erros['POR01-0'],3);
   B=await cairPagina(B,cb,f);const aposCrash=await f.estado(B);assert.strictEqual(aposCrash.erros['POR01-0'],3);
   f.rede(cb,false);await B.evaluate(()=>window.dispatchEvent(new Event('online')));await remoto(B);const nuvem=await f.ler(cred.uid);
   await B.reload();await remoto(B);const reaberto=await f.estado(B);const passou=nuvem.erros['POR01-0']===1&&reaberto.erros['POR01-0']===1;
   return {passou,arquivo,inicial,zerado,aceito,aposCrash,nuvem,reaberto,sequencia:['importar erros=2','A Zerar','B errar uma vez offline','crash e reabrir B','B reconectar'],
    resumo:{marcador,seguro:Number.isSafeInteger(marcador),avanca:marcador+1!==marcador,resetAntes:inicial.cfg.certsZ,resetDepois:zerado.cfg.certsZ,esperado:1,erroNuvem:nuvem.erros['POR01-0'],erroReaberto:reaberto.erros['POR01-0'],aviso:await B.locator('#sync').innerText()}};
  }finally{for(const c of cs)await c.close();}
 });
 }finally{await f.fechar();}
 console.log('Contraexemplos: '+falhas+' falha(s), '+resultados.filter(x=>x.preparacaoFalhou).length+' de preparação.');process.exitCode=falhas?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
