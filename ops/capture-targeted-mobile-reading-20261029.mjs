import{chromium}from'playwright';import AxeBuilder from'@axe-core/playwright';import fs from'node:fs';
const pages=['team-founder.html','team-jasmine-wilson.html','for-clinicians.html','individual-therapy.html','family-therapy.html','couples-therapy.html','parent-support.html','privacy-information.html'];
const widths=[320,390,430,768,1440],out='targeted-mobile-reading-proof';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']}),rows=[];
for(const file of pages)for(const width of widths)for(const [version,url] of [['integrated','http://127.0.0.1:8821'],['candidate','http://127.0.0.1:8822']]){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'/'+file,{waitUntil:'load'});
 await page.evaluate(()=>document.fonts.ready);
 const measure=await page.evaluate(()=>{
  const p=[...document.querySelectorAll('main p,main li')].filter(e=>e.getBoundingClientRect().width>100&&e.textContent.trim().length>60);
  const sizes=p.map(e=>parseFloat(getComputedStyle(e).fontSize)).sort((a,b)=>a-b);
  return{viewportWidthCssPx:innerWidth,documentWidthCssPx:document.documentElement.scrollWidth,pageHeightCssPx:document.documentElement.scrollHeight,
  paragraphCount:p.length,paragraphsBelow15Px:sizes.filter(x=>x<15).length,medianParagraphFontPx:sizes.length?sizes[Math.floor(sizes.length/2)]:null,
  brokenImages:[...document.images].filter(e=>e.complete&&!e.naturalWidth).length};
 });
 const axe=version==='candidate'&&[390,1440].includes(width)?await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze():null;
 if([390,1440].includes(width))await page.screenshot({path:out+'/'+file+'-'+width+'-'+version+'.jpg',fullPage:true,type:'jpeg',quality:73,animations:'disabled'});
 rows.push({file,width,version,...measure,pageErrors:errors,axeViolations:axe?.violations?.map(v=>v.id)});
 await context.close();
}
await browser.close();fs.writeFileSync(out+'/results.json',JSON.stringify(rows,null,2));
const gallery=['<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Stonebridge targeted mobile typography</title><style>body{font:16px system-ui;background:#f8f5f0;color:#213142;max-width:1400px;margin:auto;padding:20px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}img{width:100%;border:1px solid #aaa}h2{margin-top:55px}@media(max-width:720px){.pair{grid-template-columns:1fr}}</style><h1>Mobile body-text refinement</h1><p>Images preserve current page designs, approved content and photos.</p>'];
for(const file of pages){gallery.push('<h2>'+file+'</h2>');for(const width of [390,1440]){gallery.push('<h3>'+width+'px</h3><div class="pair">');for(const version of ['integrated','candidate']){let name=file+'-'+width+'-'+version+'.jpg';gallery.push('<figure><figcaption>'+version+'</figcaption><a href="'+name+'"><img loading="lazy" src="'+name+'" alt="'+file+' '+version+' at '+width+'px"></a></figure>')}gallery.push('</div>')}}
gallery.push('</html>');fs.writeFileSync(out+'/index.html',gallery.join('\n'));
const failed=rows.filter(r=>r.documentWidthCssPx>r.viewportWidthCssPx+1||r.brokenImages||r.pageErrors.length||r.axeViolations?.length);
console.log(JSON.stringify({tested:rows.length,failed,summary:pages.map(file=>{let a=rows.find(x=>x.file===file&&x.width===390&&x.version==='integrated'),b=rows.find(x=>x.file===file&&x.width===390&&x.version==='candidate');return{file,under15Before:a.paragraphsBelow15Px,under15After:b.paragraphsBelow15Px,scrollDeltaCssPx:b.pageHeightCssPx-a.pageHeightCssPx}})},null,2));
if(failed.length)process.exitCode=1;