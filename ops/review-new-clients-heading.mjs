import { chromium } from 'playwright';
import fs from 'node:fs';
const original=process.env.STONEBRIDGE_BEFORE_URL||'http://127.0.0.1:8781';
const editorial=process.env.STONEBRIDGE_AFTER_URL||'http://127.0.0.1:8782';
const out='editorial-h2-proof';
fs.mkdirSync(out,{recursive:true});
const devices=[[320,568],[375,667],[390,844],[393,852],[412,915],[430,932],[1440,900]];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const records=[];
const expectedPhrase='Choose your next step.';
for(const [width,height] of devices){
 for(const [version,base] of [['before',original],['editorial',editorial]]){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/new-clients.html',{waitUntil:'load'});
 await page.evaluate(()=>document.fonts.ready);
 const detail=await page.evaluate(()=>{
 const bbox=selector=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return {topCssPx:Math.round(r.top+scrollY),bottomCssPx:Math.round(r.bottom+scrollY),heightCssPx:Math.round(r.height)}};
 const btn=bbox('.access-path-row .btn-primary');
 return {h2:document.querySelector('.access-template-intro h2')?.textContent.trim(),
   viewportWidthCssPx:innerWidth,viewportHeightCssPx:innerHeight,
   hero:bbox('.access-hero'),h2Box:bbox('.access-template-intro h2'),
   primaryCta:btn,scrollToEntireCtaCssPx:btn?Math.max(0,btn.bottomCssPx-innerHeight):null,
   crisisText:document.querySelector('.access-template-note')?.textContent.trim(),
   crisis:bbox('.access-template-note'),
   firstAppointmentHref:document.querySelector('.access-path-row .btn-primary')?.getAttribute('href'),
   secondaryAppointmentHref:document.querySelector('.access-path-row:nth-child(2) a')?.getAttribute('href'),
   pathCount:document.querySelectorAll('.access-path-row').length,
   documentWidthCssPx:document.documentElement.scrollWidth};
 });
 const filename='new-clients-'+width+'x'+height+'-'+version+'.jpg';
 await page.screenshot({path:out+'/'+filename,fullPage:true,animations:'disabled',type:'jpeg',quality:82});
 records.push({version,requestedViewportWidthCssPx:width,requestedViewportHeightCssPx:height,...detail,errors,filename});
 await context.close();
 }
}
await browser.close();
const pairs=devices.map(([width,height])=>{const before=records.find(r=>r.requestedViewportWidthCssPx===width&&r.version==='before'),after=records.find(r=>r.requestedViewportWidthCssPx===width&&r.version==='editorial');return {size:width+'x'+height,h2HeightBefore:before.h2Box?.heightCssPx,h2HeightAfter:after.h2Box?.heightCssPx,actionBottomBefore:before.primaryCta?.bottomCssPx,actionBottomAfter:after.primaryCta?.bottomCssPx,scrollBefore:before.scrollToEntireCtaCssPx,scrollAfter:after.scrollToEntireCtaCssPx,samePhotoAndRoutes:before.firstAppointmentHref===after.firstAppointmentHref&&before.secondaryAppointmentHref===after.secondaryAppointmentHref&&before.pathCount===after.pathCount&&before.crisisText===after.crisisText}});
const errors=records.filter(r=>r.errors.length||r.documentWidthCssPx>r.viewportWidthCssPx+1).concat(pairs.filter(r=>!r.samePhotoAndRoutes));
fs.writeFileSync(out+'/measurements.json',JSON.stringify({base:original,candidate:editorial,records,pairs,errors},null,2));
const h=['<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Stonebridge New Clients H2 editorial alternative</title><style>body{font:16px system-ui;color:#213142;background:#f8f5f0;padding:24px;margin:auto;max-width:1450px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}img{width:100%;border:1px solid #c7c0b9}figure{margin:0}figcaption{font-weight:700;margin-bottom:10px}h2{margin-top:45px} @media(max-width:720px){.pair{grid-template-columns:1fr}}</style><h1>New Clients H2 — editorial alternative only</h1><p>Before = release candidate PR #72. Editorial = one H2 text change only. Not an approved production change.</p>'];
for(const [width,height] of devices){h.push('<h2>'+width+'×'+height+'</h2><div class="pair">');for(const version of ['before','editorial']){const name='new-clients-'+width+'x'+height+'-'+version+'.jpg';h.push('<figure><figcaption>'+version+'</figcaption><a href="'+name+'"><img loading="lazy" src="'+name+'" alt="New Clients '+version+' at '+width+' by '+height+'"></a></figure>')}h.push('</div>')}
h.push('</html>');
fs.writeFileSync(out+'/index.html',h.join('\n'));
console.log(JSON.stringify({pairs,errors},null,2));
if(errors.length)process.exitCode=1;
