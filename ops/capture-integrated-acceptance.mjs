import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
const BASE=process.env.BASE_URL || 'http://127.0.0.1:8882';
const TEST=process.env.TEST_URL || 'http://127.0.0.1:8001';
const out='visual-integrated-proof';
const pages=fs.readdirSync('.').filter(f=>f.endsWith('.html')).sort();
const changed=['new-clients.html','about.html','adolescent-therapy-illinois.html','bcbs-therapy-illinois.html','trauma-therapy-illinois.html','fees-insurance.html','for-clinicians.html','index.html','home-current.html','team-founder.html','team-jasmine-wilson.html','contact.html','portal.html','individual-therapy.html','family-therapy.html','couples-therapy.html','parent-support.html','privacy-information.html'];
const widths=[390,1440],devices=[[320,568],[360,640],[375,667],[390,844],[393,852],[412,915],[430,932]];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync(out,{recursive:true});
const all=[],axe=[],task=[];
for(const file of pages)for(const width of widths){
 const context=await browser.newContext({viewport:{width,height:900}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(TEST+'/'+file,{waitUntil:'load',timeout:25000});
  await page.waitForTimeout(220);
  let a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  axe.push({file,width,actualPath:new URL(page.url()).pathname,violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
  const m=await page.evaluate(()=>({
   viewportWidthCssPx:innerWidth,documentWidthCssPx:document.documentElement.scrollWidth,
   documentHeightCssPx:document.documentElement.scrollHeight,
   h1:[...document.querySelectorAll('h1')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.textContent.trim().replace(/\s+/g,' ')),
   missingImages:[...document.images].filter(e=>e.complete&&!e.naturalWidth).length
  }));
  all.push({file,width,...m,pageErrors:errors});
  if(changed.includes(file)){
   const fn=path.join(out,file.replace('.html','')+'-'+width+'-after.jpg');
   await page.screenshot({path:fn,type:'jpeg',quality:70,fullPage:true,animations:'disabled'});
  }
 }catch(e){all.push({file,width,error:String(e),pageErrors:errors})}
 await context.close();
}
for(const file of changed)for(const width of widths){
 const context=await browser.newContext({viewport:{width,height:900}});
 const page=await context.newPage();
 await page.goto(BASE+'/'+file,{waitUntil:'load'});
 await page.waitForTimeout(180);
 const fn=path.join(out,file.replace('.html','')+'-'+width+'-before.jpg');
 await page.screenshot({path:fn,type:'jpeg',quality:70,fullPage:true,animations:'disabled'});
 await context.close();
}
for(const [width,height] of devices)for(const [version,url] of [['before',BASE],['integrated',TEST]]){
 const context=await browser.newContext({viewport:{width,height}});
 const page=await context.newPage();
 await page.goto(url+'/new-clients.html',{waitUntil:'load'});
 await page.evaluate(()=>document.fonts.ready);
 const result=await page.evaluate(()=>{
  const box=q=>{const el=document.querySelector(q);if(!el)return null;const r=el.getBoundingClientRect();return {topCssPx:Math.round(r.top+scrollY),bottomCssPx:Math.round(r.bottom+scrollY),heightCssPx:Math.round(r.height)}};
  const action=box('.access-path-row .btn-primary');
  const h=innerHeight;
  return {actualViewportWidthCssPx:innerWidth,actualViewportHeightCssPx:h,
   primaryAction:action,appointmentFullyVisibleWithoutScroll:!!action&&action.bottomCssPx<=h,
   appointmentPartlyVisibleWithoutScroll:!!action&&action.topCssPx<h,
   scrollNeededToSeeFullButtonCssPx:action?Math.max(0,action.bottomCssPx-h):null,
   scrollNeededToSeeButtonTopCssPx:action?Math.max(0,action.topCssPx-h):null,
   hero:box('.access-hero'),intro:box('.access-template-intro'),heading:box('.access-template-intro h2'),
   primaryCard:box('.access-path-row'),secondaryAction:box('.access-path-row:nth-child(2) .btn'),
   safety:box('.access-template-note')};
 });
 task.push({version,requestedViewportWidthCssPx:width,requestedViewportHeightCssPx:height,...result});
 if([390,375,430].includes(width)) await page.screenshot({path:path.join(out,'new-clients-task-'+width+'x'+height+'-'+version+'.jpg'),type:'jpeg',quality:75,fullPage:false});
 await context.close();
}
await browser.close();
const failedAxe=axe.filter(x=>x.violations.length),failedTechnical=all.filter(x=>x.error||x.pageErrors?.length||x.missingImages||x.documentWidthCssPx>x.viewportWidthCssPx+1);
const data={createdAt:new Date().toISOString(),browser:'Playwright Chromium',integrated:true,pages:pages.length,axe,all,task,failures:{axe:failedAxe,technical:failedTechnical}};
fs.writeFileSync(out+'/results.json',JSON.stringify(data,null,2));
const gallery=['<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Stonebridge integrated before/after</title><style>body{font:16px system-ui;background:#f8f5f0;color:#213142;padding:20px;max-width:1300px;margin:auto}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}figure{margin:0}img{width:100%;border:1px solid #bbb}h2{margin-top:60px}figcaption{font-weight:700}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>Stonebridge integrated visual review</h1><p>Before (production main) and proposed combined changes. No live form submissions.</p>'];
for(const file of changed){gallery.push('<h2>'+file+'</h2>');for(const width of widths){gallery.push('<h3>'+width+'px</h3><div class="pair">');for(const ver of ['before','after']){const src=file.replace('.html','')+'-'+width+'-'+ver+'.jpg';gallery.push('<figure><figcaption>'+ver+'</figcaption><a href="'+src+'"><img loading="lazy" src="'+src+'" alt="'+file+' '+ver+' '+width+'px"></a></figure>')}gallery.push('</div>')}}
gallery.push('</html>');fs.writeFileSync(out+'/index.html',gallery.join('\n'));
console.log(JSON.stringify({pages:pages.length,axeScans:axe.length,axeFailures:failedAxe.length,technicalFailures:failedTechnical.length,task},null,2));
if(failedAxe.length||failedTechnical.length)process.exitCode=1;
