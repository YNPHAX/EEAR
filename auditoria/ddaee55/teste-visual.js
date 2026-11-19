const fs=require('fs'),path=require('path'),fixture=require('../../testes/a35-fixture.js');
const repo=path.resolve(__dirname,'../..'),out=process.env.EEAR_AUDITORIA_SAIDA||'/workspace/audit-results/independente';
(async()=>{const f=await fixture.abrir(repo),c=await f.contexto(),results=[];try{
 await c.route(/127\.0\.0\.1:(8280|9299)\//,q=>q.abort());const p=await f.pagina(c);
 await p.waitForFunction(()=>document.documentElement.dataset.armazenamento!=='carregando');
 fs.mkdirSync(out,{recursive:true});
 for(const [width,height,theme]of [[320,568,'light'],[390,844,'dark'],[1440,900,'light']]){
  await p.setViewportSize({width,height});await p.emulateMedia({colorScheme:theme});await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  results.push(await p.evaluate(({width,height,theme})=>{
   const s=getComputedStyle(document.documentElement),contrast=(a,b)=>{const lum=x=>{const c=x.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];};const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
   const links=[...document.querySelectorAll('a')].filter(e=>e.textContent.trim()&&e.getClientRects().length).map(e=>{
    const fg=getComputedStyle(e).color;let ancestor=e,bg;
    while(ancestor){bg=getComputedStyle(ancestor).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)')break;ancestor=ancestor.parentElement;}
    return{text:e.textContent.trim(),fg,bg,contrast:contrast(fg,bg)};
   });
   return{width,height,theme,overflow:document.documentElement.scrollWidth>innerWidth,tokens:Object.fromEntries(['--bg','--ink','--accent','--surface','--muted','--ok','--bad'].map(k=>[k,s.getPropertyValue(k).trim()])),links};
  },{width,height,theme}));
  await p.screenshot({path:path.join(out,`visual-${width}-${theme}.png`),fullPage:true});
 }
 fs.writeFileSync(path.join(out,'visual.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await c.close();await f.fechar();}})().catch(e=>{console.error(e);process.exitCode=1;});
