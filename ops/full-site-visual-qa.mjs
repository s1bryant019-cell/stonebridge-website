/**
 * Stonebridge comprehensive preview-only visual QA.
 * No external writes, no form submissions, no production-domain promotion.
 * Captures the actual DOM rendered in a headless browser and runs axe WCAG checks.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import puppeteer from 'puppeteer-core';
import axe from 'axe-core';

const root=process.cwd();
const out=path.resolve('visual-full-site-review');
fs.mkdirSync(out,{recursive:true});
const all=fs.readdirSync(root).filter(n=>n.endsWith('.html')&&!['home-current.html','index.html','fit-safety-check.html'].includes(n)).sort();
const pages=['home-current.html','index.html',...all];
const widths=[390,768,1440];
const extra=[{file:'home-current.html',width:1024},{file:'index.html',width:1024},{file:'home-current.html',width:720},{file:'index.html',width:720}];
const type={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.json':'application/json'};
const server=createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const target=path.resolve(root,'.'+(pathname==='/'?'/home-current.html':pathname));
  if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end('Not found');return}
  res.writeHead(200,{'Content-Type':type[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(fs.readFileSync(target));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking']});
const records=[], brokenLinks=[], browserErrors=[], imageErrors=[], violations=[], heroEvidence=[], keyboard=[];
const slug=name=>name.replace(/\.html$/,'');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const rgb=color=>{
 const m=String(color).match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
 return m?[+m[1],+m[2],+m[3]]:null;
};
function contrast(a,b) {
 if(!a||!b)return null;
 const L=c=>{const x=c.map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return x[0]*.2126+x[1]*.7152+x[2]*.0722};
 const v=[L(a),L(b)].sort((x,y)=>y-x);return Math.round(100*(v[0]+.05)/(v[1]+.05))/100;
}
const bgFor=(file,width)=>file==='index.html'&&width>=1101?'#0F2A45':'#FAF5EF';
const fromHex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const cases=[...pages.flatMap(file=>widths.map(width=>({file,width}))),...extra];
try{
 for(const {file,width} of cases){
  const page=await browser.newPage();
  const errors=[];
  try{
   await page.setViewport({width,height:width===1024?720:900,deviceScaleFactor:1,isMobile:false,hasTouch:false});
   page.on('pageerror',error=>errors.push(error.message));
   page.on('console',msg=>{if(msg.type()==='error'&&/Uncaught/.test(msg.text()))errors.push(msg.text())});
   const response=await page.goto(origin+'/'+file,{waitUntil:'domcontentloaded',timeout:30000});
   await page.evaluate(async()=>{
     await document.fonts.ready;
     const images=[...document.images];images.forEach(img=>img.loading='eager');
     await Promise.all(images.map(img=>Promise.race([img.decode().catch(()=>null),new Promise(r=>setTimeout(r,1800))])));
   });
   await sleep(150);
   const metric=await page.evaluate(()=>{
     const sectionNames=[['hero','.home-hero'],['recognition','.home-recognition'],['services','.home-services'],['clinicians','.home-clinicians'],['perspective','.home-perspective'],['getting-started','.home-start-steps'],['final','.home-final'],['header','header'],['footer','footer']];
     const styleInfo=el=>{if(!el)return null;const s=getComputedStyle(el),r=el.getBoundingClientRect();return {text:el.textContent?.trim().replace(/\s+/g,' ').slice(0,180),color:s.color,backgroundColor:s.backgroundColor,backgroundImage:s.backgroundImage.slice(0,160),fontSize:s.fontSize,fontFamily:s.fontFamily,lineHeight:s.lineHeight,display:s.display,visibility:s.visibility,opacity:s.opacity,outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,rect:{x:r.x,y:r.y,w:r.width,h:r.height}}};
     const hero=document.querySelector('.home-hero');
     const cta=hero?.querySelector('.home-hero-action--secondary');
     const facts=hero?.querySelector('.home-hero-facts');
     const primary=hero?.querySelector('.home-hero-action--primary');
     const nav=document.querySelector('header .menu');
     const root=document.documentElement;
     const imgs=[...document.images].filter(im=>!im.complete||im.naturalWidth===0).map(im=>({src:im.getAttribute('src'),alt:im.alt}));
     const sections=sectionNames.map(([name,sel])=>({name,...styleInfo(document.querySelector(sel))}));
     const cards=[...document.querySelectorAll('.home-service-card,.home-clinician-card,.home-step-card,.services-primary-item,.team-clinician-card')].map(c=>{const r=c.getBoundingClientRect(),p=c.querySelector('p');return {label:c.querySelector('h2,h3')?.textContent?.trim().slice(0,90),width:Math.round(r.width),height:Math.round(r.height),pHeight:p&&Math.round(p.getBoundingClientRect().height),overflowX:c.scrollWidth>c.clientWidth+2,overflowY:c.scrollHeight>c.clientHeight+2}});
     return {title:document.title,url:location.pathname,viewportWidth:innerWidth,scrollWidth:root.scrollWidth,scrollHeight:root.scrollHeight,h1:[...document.querySelectorAll('h1')].map(x=>x.textContent.trim()),sections,hero:hero?{background:styleInfo(hero),secondary:styleInfo(cta),primary:styleInfo(primary),status:styleInfo(facts),statusItems:[...facts?.querySelectorAll('li')||[]].map(styleInfo)}:null,missingImages:imgs,cards,nav:styleInfo(nav),headings:[...document.querySelectorAll('h1,h2')].map(h=>({tag:h.tagName,text:h.textContent.trim().slice(0,120),width:Math.round(h.getBoundingClientRect().width),overflow:h.scrollWidth>h.clientWidth+2})),links:[...document.querySelectorAll('a[href]')].map(a=>({href:a.getAttribute('href'),text:a.textContent.trim().slice(0,85)})),focusableCount:document.querySelectorAll('a[href],button,input,select,textarea').length};
   });
   metric.file=file;metric.width=width;metric.http=response.status();
   records.push(metric);
   if(errors.length)browserErrors.push({file,width,errors});
   if(metric.missingImages.length)imageErrors.push({file,width,images:metric.missingImages});
   if(metric.scrollWidth>width+1)browserErrors.push({file,width,error:'horizontal overflow',scrollWidth:metric.scrollWidth});
   const hrefs=metric.links.filter(l=>l.href&&!/^(?:https?:|mailto:|tel:|javascript:|data:|#)/.test(l.href));
   for(const link of hrefs){
     const u=new URL(link.href,origin+'/'+file);
     if(u.hostname!==new URL(origin).hostname)continue;
     let filename=decodeURIComponent(u.pathname).replace(/^\//,'');
     if(!filename)filename='home-current.html';
     const rewrites={'new-clients':'new-clients.html','bcbs-therapy-illinois':'bcbs-therapy-illinois.html','trauma-therapy-illinois':'trauma-therapy-illinois.html','adolescent-therapy-illinois':'adolescent-therapy-illinois.html'};
     filename=rewrites[filename]||filename;
     if(!fs.existsSync(path.resolve(root,filename)))brokenLinks.push({file,width,href:link.href,text:link.text});
   }
   const axeResult=await page.addScriptTag({content:axe.source}).then(()=>page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})));
   const thisViolations=axeResult.violations.map(v=>({id:v.id,impact:v.impact,description:v.help,targets:v.nodes.slice(0,9).map(n=>({target:n.target,summary:n.failureSummary?.slice(0,260)})),count:v.nodes.length}));
   violations.push({file,width,violations:thisViolations,incompleteContrast:axeResult.incomplete.filter(x=>x.id==='color-contrast').map(x=>x.nodes.length)});
   const safe=slug(file)+'-'+width;
   await page.screenshot({path:path.join(out,safe+'-full.jpg'),type:'jpeg',quality:67,fullPage:true,animations:'disabled'});
   if(metric.hero){
     const hero=await page.$('.home-hero');
     if(hero)await hero.screenshot({path:path.join(out,safe+'-hero.png')});
     const back=fromHex(bgFor(file,width));
     const status=metric.hero.status,secondary=metric.hero.secondary;
     const individualStatus=metric.hero.statusItems.map(item=>({text:item.text,color:item.color,fontSize:item.fontSize,contrast:contrast(rgb(item.color),back)}));
     const navBlock={file,width,assumedHeroSurface:bgFor(file,width),statusColor:status?.color,secondaryColor:secondary?.color,statusContrast:contrast(rgb(status?.color),back),statusItems:individualStatus,secondaryContrast:contrast(rgb(secondary?.color),back),fontSize:status?.fontSize,primaryColor:metric.hero.primary?.color,primaryBackground:metric.hero.primary?.backgroundColor,primaryContrast:contrast(rgb(metric.hero.primary?.color),rgb(metric.hero.primary?.backgroundColor))};
     heroEvidence.push(navBlock);
     if(navBlock.statusContrast!==null&&navBlock.statusContrast<4.5)browserErrors.push({file,width,error:'Hero status container contrast below WCAG AA',...navBlock});
     for(const item of individualStatus){
       if(item.contrast===null||item.contrast<4.5)browserErrors.push({file,width,error:'Visible hero status item contrast below WCAG AA',item,background:bgFor(file,width)});
       if(parseFloat(item.fontSize)<14)browserErrors.push({file,width,error:'Visible hero status item font below 14px',item});
     }
     if(navBlock.secondaryContrast!==null&&navBlock.secondaryContrast<4.5)browserErrors.push({file,width,error:'Hero secondary contrast below WCAG AA',...navBlock});
     if(status&&parseFloat(status.fontSize)<14)browserErrors.push({file,width,error:'Hero status below 14px',fontSize:status.fontSize});
     const link=await page.$('.home-hero-action--secondary');
     if(link){
       await page.keyboard.press('Tab');await link.focus();const focus=await page.evaluate(()=>{const a=document.activeElement,s=getComputedStyle(a);return {text:a.textContent.trim(),outline:s.outlineStyle,outlineWidth:s.outlineWidth,outlineColor:s.outlineColor,boxShadow:s.boxShadow}});
       if(width===1024||width===1440||width===390){
         await page.screenshot({path:path.join(out,safe+'-focus.jpg'),type:'jpeg',quality:72,clip:{x:0,y:0,width,height:Math.min(650,900)},captureBeyondViewport:true});
         await page.hover('.home-hero-action--secondary');
         const hover=await page.evaluate(()=>{const s=getComputedStyle(document.querySelector('.home-hero-action--secondary'));return {color:s.color,textDecorationColor:s.textDecorationColor}});
         keyboard.push({file,width,focus,hover});
       }
       if(focus.outline==='none'&&focus.boxShadow==='none')browserErrors.push({file,width,error:'Hero secondary focus has no visible outline'});
     }
   }
   await page.close();
  }catch(e){browserErrors.push({file,width,error:String(e),stack:String(e.stack).slice(0,900)});await page.close();}
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
const dedupBroken=[...new Map(brokenLinks.map(x=>[x.file+':'+x.href,x])).values()];
const summary={browser:'Puppeteer Chromium',date:new Date().toISOString(),files:pages.length,viewports:widths,additionalViewportCases:extra,actualScreenshots:records.length,heroEvidence,keyboard,report:{browserErrors,imageErrors,brokenLinks:dedupBroken,accessibilityViolations:violations.filter(x=>x.violations.length>0)},records:records.map(({links,...rest})=>rest)};
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(summary,null,2));
const gallery=['<!doctype html><meta charset="utf-8"><title>Stonebridge Full-Site Visual Review</title><style>body{background:#f5efe8;color:#163b61;font:16px system-ui;max-width:1200px;margin:auto;padding:24px}h2{margin-top:48px}img{width:100%;height:auto;border:1px solid #d6c9b9;border-radius:4px}.screens{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}a{color:#163b61}@media(max-width:800px){.screens{grid-template-columns:1fr}}</style><h1>Stonebridge full-site visual review</h1><p>Captured from the review branch in Chromium. No form submissions.</p><p><a href="results.json">Accessibility, hero contrast, overflow and link results (JSON)</a></p>'];
for(const file of pages){gallery.push('<h2>'+file+'</h2><div class="screens">');for(const width of widths)gallery.push('<figure><figcaption>'+width+'px</figcaption><a href="'+slug(file)+'-'+width+'-full.jpg"><img loading="lazy" src="'+slug(file)+'-'+width+'-full.jpg" alt="'+file+' '+width+'px"></a></figure>');gallery.push('</div>');}
gallery.push('</html>');fs.writeFileSync(path.join(out,'gallery.html'),gallery.join('\n'));
console.log(JSON.stringify({files:pages.length,screenshots:records.length,missingImages:imageErrors.length,brokenLinks:dedupBroken.length,browserErrors:browserErrors.length,axeViolatingCases:violations.filter(x=>x.violations.length).length,heroEvidence,keyboard},null,2));
if(browserErrors.length)process.exitCode=1;
