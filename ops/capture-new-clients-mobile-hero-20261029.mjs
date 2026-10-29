import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const out='new-clients-mobile-proof';fs.mkdirSync(out,{recursive:true});
const sizes=[[320,568],[375,667],[390,844],[393,852],[412,915],[430,932]];
const b=await chromium.launch({headless:true,args:['--no-sandbox']}),rows=[];
for(const [width,height] of sizes)for(const [version,url] of [['integrated','http://127.0.0.1:8811'],['candidate','http://127.0.0.1:8812']]){
 const context=await b.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url+'/new-clients.html',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
 const state=await page.evaluate(()=>{
  const get=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{top:Math.round(r.top+scrollY),bottom:Math.round(r.bottom+scrollY),height:Math.round(r.height)}};
  const action=get('.access-path-row .btn-primary');return {
   viewportWidthCssPx:innerWidth,viewportHeightCssPx:innerHeight,hero:get('.access-hero'),
   heading:get('.access-template-intro h2'),primaryAppointmentCTA:action,emergencyGuidance:get('.access-template-note'),
   scrollToFullCTA:Math.max(0,action.bottom-innerHeight),
   overflow:document.documentElement.scrollWidth>innerWidth+1,
   pendingDisclaimerPreserved:document.querySelector('.access-hero-copy p')?.textContent.includes('pending until Stonebridge confirms availability and fit'),
   emergencyGuidancePreserved:document.querySelector('.access-template-note')?.textContent.includes('988')
  };
 });
 const axe=version==='candidate'?await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze():null;
 await page.screenshot({path:out+'/'+version+'-'+width+'x'+height+'-full.jpg',fullPage:true,type:'jpeg',quality:77,animations:'disabled'});
 await page.screenshot({path:out+'/'+version+'-'+width+'x'+height+'-fold.jpg',fullPage:false,type:'jpeg',quality:80,animations:'disabled'});
 rows.push({version,width,height,...state,pageErrors:errors,axeViolations:axe?.violations?.map(v=>v.id)});
 await context.close();
}
await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify(rows,null,2));
let html=['<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Stonebridge New Clients mobile review</title><style>body{font:16px system-ui;color:#213142;background:#f8f5f0;max-width:1400px;margin:auto;padding:20px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}img{width:100%;border:1px solid #ccc}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>New Clients—current integrated versus targeted mobile hero</h1>'];
for(const [w,h] of sizes){html.push('<h2>'+w+' × '+h+'</h2>');for(const shot of ['fold','full']){html.push('<h3>'+shot+'</h3><div class="pair">');for(const ver of ['integrated','candidate']){const name=ver+'-'+w+'x'+h+'-'+shot+'.jpg';html.push('<figure><figcaption>'+ver+'</figcaption><a href="'+name+'"><img loading="lazy" src="'+name+'" alt="'+ver+' New Clients at '+w+'x'+h+'"></a></figure>')}html.push('</div>')}}html.push('</html>');fs.writeFileSync(out+'/index.html',html.join('\n'));
const failed=rows.filter(x=>x.overflow||!x.pendingDisclaimerPreserved||!x.emergencyGuidancePreserved||x.pageErrors.length||x.axeViolations?.length);
console.log(JSON.stringify({captures:rows.length,violations:failed,rows:rows.map(x=>({version:x.version,viewport:x.width+'x'+x.height,hero:x.hero.height,CTA:x.primaryAppointmentCTA.bottom,scroll:x.scrollToFullCTA}))},null,2));
if(failed.length)process.exitCode=1;