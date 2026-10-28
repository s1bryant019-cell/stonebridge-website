/* Evidence-only 390px/1440px screenshots and measured comparison. No live changes. */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {fileURLToPath} from "node:url";
import puppeteer from "puppeteer-core";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const out=path.join(root,"visual-consistency-audit"),shots=path.join(out,"screenshots");
fs.mkdirSync(shots,{recursive:true});
const sitemap=fs.readFileSync(path.join(root,"sitemap.xml"),"utf8");
const pages=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>{
 const u=new URL(m[1]);let filename=u.pathname==="/"?"index.html":u.pathname.slice(1);
 if(!filename.endsWith(".html"))filename+=".html";
 return {url:u.pathname,filename,type:"Sitemap"};
});
for(const f of ["assessment.html","forensic.html","psychotherapy.html","home-current.html"]){
 pages.push({url:"/"+f,filename:f,type:f==="home-current.html"?"Legacy direct-access page":"Public, not in sitemap"});
}
const mime={".html":"text/html; charset=utf-8",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",".jpeg":"image/jpeg",".woff2":"font/woff2",".ico":"image/x-icon",".json":"application/json"};
const server=http.createServer((req,res)=>{
 try{
  let rel=decodeURIComponent(new URL(req.url,"http://localhost").pathname).replace(/^\/+/,"")||"index.html";
  if(["new-clients","bcbs-therapy-illinois","adolescent-therapy-illinois","trauma-therapy-illinois"].includes(rel))rel+=".html";
  if(rel==="fit-safety-check"||rel==="fit-safety-check.html"){res.writeHead(308,{Location:"/new-clients.html"});return res.end();}
  const f=path.resolve(root,rel);
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end("Not found");}
  res.writeHead(200,{"content-type":mime[path.extname(f)]||"application/octet-stream","cache-control":"no-store"});
  fs.createReadStream(f).pipe(res);
 }catch(e){res.writeHead(500);res.end(String(e));}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BIN||"/usr/bin/google-chrome",headless:true,args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"]});
const results=[];
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function measure(){
 const r=e=>{if(!e)return null;let a=e.getBoundingClientRect();return {x:Math.round(a.x),y:Math.round(a.y),w:Math.round(a.width),h:Math.round(a.height)}};
 const st=e=>e?getComputedStyle(e):null;
 const vis=e=>{if(!e)return false;let a=e.getBoundingClientRect(),s=st(e);return a.width>0&&a.height>0&&s.display!=="none"&&s.visibility!=="hidden"};
 const header=document.querySelector("header.site-header")||document.querySelector("body > header");
 const hero=document.querySelector("main > section:first-of-type")||document.querySelector("main section");
 const main=document.querySelector("main"),heading=main?.querySelector("h1"),footer=document.querySelector("footer");
 const nav=header?.querySelector("nav")||document.querySelector("nav");
 const toggle=document.querySelector(".mobile-toggle");
 const paragraphs=[...(main?.querySelectorAll("p")||[])].filter(vis).map(e=>e.textContent.trim().replace(/\s+/g," ")).filter(s=>s.length>70);
 const copies={};for(const s of paragraphs){let key=s.toLowerCase();copies[key]=(copies[key]||0)+1;}
 return {
  title:document.title,h1:heading?.textContent.trim().slice(0,200),
  header:r(header),hero:r(hero),footer:r(footer),main:r(main),
  headerBg:st(header)?.backgroundColor,heroBg:st(hero)?.backgroundColor,footerBg:st(footer)?.backgroundColor,
  heroImg:hero?.querySelector("img")?.getAttribute("src"),
  logo:header?.querySelector('img[src*="logo"]')?.getAttribute("src")||null,
  navText:[...(nav?.querySelectorAll("a")||[])].filter(vis).map(e=>e.textContent.trim()).filter(Boolean).slice(0,15),
  menuVisible:vis(toggle),h1Font:st(heading)?.fontFamily,h1Size:st(heading)?.fontSize,
  bodyFont:st(document.body)?.fontFamily,bodySize:st(document.body)?.fontSize,
  sectionCount:main?.querySelectorAll(":scope > section").length||0,
  ctas:[...(main?.querySelectorAll('a.btn,button.btn,a[class*="cta"]')||[])].filter(vis).map(e=>e.textContent.trim().slice(0,85)).slice(0,13),
  images:[...(main?.querySelectorAll("img")||[])].filter(vis).slice(0,10).map(e=>({src:(e.currentSrc||e.src).split("/").pop().split("?")[0],fit:st(e).objectFit,render:Math.round(e.getBoundingClientRect().width)})),
  duplicateParagraphs:Object.entries(copies).filter(([_,n])=>n>1).slice(0,4).map(([text,count])=>({text:text.slice(0,115),count})),
  height:document.documentElement.scrollHeight,overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),
  footerText:footer?.textContent.trim().replace(/\s+/g," ").slice(0,135)
 };
}
for(let i=0;i<pages.length;i++){
 const item={...pages[i],views:{}};
 for(const v of [{key:"mobile",width:390,height:844},{key:"desktop",width:1440,height:900}]){
  const tab=await browser.newPage();
  await tab.setViewport({width:v.width,height:v.height,isMobile:v.width===390,hasTouch:v.width===390,deviceScaleFactor:1});
  const errors=[];tab.on("pageerror",e=>errors.push(e.message.slice(0,130)));
  try{
   await tab.goto("http://127.0.0.1:"+port+item.url,{waitUntil:"domcontentloaded",timeout:22000});
   await tab.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,2000))])).catch(()=>{});
   await new Promise(resolve=>setTimeout(resolve,100));
   const data=await tab.evaluate(measure);
   const prefix=item.filename.replace(".html","")+"-"+v.key;
   const top=prefix+"-top.jpg",bottom=prefix+"-footer.jpg",full=prefix+"-full.jpg";
   await tab.screenshot({path:path.join(shots,top),type:"jpeg",quality:60});
   if(v.width===390){
     const toggle=await tab.$(".mobile-toggle");
     if(toggle&&await toggle.isIntersectingViewport()){
      try{await toggle.click();const opened=await tab.evaluate(()=>document.querySelector(".mobile-toggle")?.getAttribute("aria-expanded"));await toggle.click();const closed=await tab.evaluate(()=>document.querySelector(".mobile-toggle")?.getAttribute("aria-expanded"));data.menuTest={opened,closed};}
      catch(e){data.menuTest={error:String(e.message).slice(0,100)};}
     }
   }
   await tab.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
   await new Promise(resolve=>setTimeout(resolve,160));
   await tab.screenshot({path:path.join(shots,bottom),type:"jpeg",quality:60});
   await tab.screenshot({path:path.join(shots,full),type:"jpeg",quality:45,fullPage:true,timeout:20000});
   item.views[v.key]={...data,errors,shots:{top,bottom,full}};
  }catch(e){item.views[v.key]={error:String(e.message).slice(0,240),errors};}
  await tab.close();
 }
 results.push(item);
 console.log("PAGE",i+1,"/",pages.length,item.filename,"mobile overflow:",item.views.mobile.overflow,"desktop overflow:",item.views.desktop.overflow,"errors:",item.views.mobile.error||item.views.desktop.error||"none");
}
await browser.close();await new Promise(resolve=>server.close(resolve));
fs.writeFileSync(path.join(out,"measurements.json"),JSON.stringify({date:"2026-10-28",baseline:"59b9ef77ab963c23c3ca1c6fd584829a6307a64e",pages:results},null,2));
const style="body{font:14px/1.5 system-ui,sans-serif;background:#f5f7f9;color:#18314b;margin:0}header{position:sticky;top:0;background:#163b61;color:#fff;padding:13px 22px;z-index:9}main{max-width:1320px;margin:auto;padding:20px}.toc{display:flex;flex-wrap:wrap;gap:7px;margin:15px 0}.toc a{background:white;padding:5px 9px;border:1px solid #d6dce2;border-radius:5px}a{color:#135284}.panel{background:#fff;border-radius:8px;padding:18px;margin-bottom:22px;border:1px solid #dce4ed}.pair{display:grid;grid-template-columns:minmax(280px,390px) minmax(420px,1fr);gap:13px}.block{padding:12px;border:1px solid #dce4ed;border-radius:5px}.subshots{display:grid;grid-template-columns:1fr 1fr;gap:8px}.subshots img{width:100%;height:auto;display:block}table{width:100%;border-collapse:collapse;margin:13px 0;font-size:12px}td,th{border-bottom:1px solid #e2e7ed;padding:7px;vertical-align:top;text-align:left}th{width:27%}h1{font-size:22px;margin:0}h2{margin:0 0 8px}.info{color:#526477;font-size:12px}.warn{background:#fbf2e5;padding:10px}@media(max-width:950px){.pair{grid-template-columns:1fr}}";
const metricRows=(m,d)=>{
 const fields=[
 ["Header height (px)",m.header?.h,d.header?.h],["Header color",m.headerBg,d.headerBg],["Header logo source",m.logo,d.logo],["Navigation labels",m.navText?.join(" · "),d.navText?.join(" · ")],
 ["First content / hero height (px)",m.hero?.h,d.hero?.h],["Hero image",m.heroImg,d.heroImg],["H1 size and font",(m.h1Size||"")+" "+(m.h1Font||""),(d.h1Size||"")+" "+(d.h1Font||"")],
 ["Main width (px)",m.main?.w,d.main?.w],["Document length (px)",m.height,d.height],["Section count",m.sectionCount,d.sectionCount],
 ["Button / CTA text",m.ctas?.join(" | "),d.ctas?.join(" | ")],["Image samples",m.images?.map(x=>x.src).join(", "),d.images?.map(x=>x.src).join(", ")],
 ["Footer background",m.footerBg,d.footerBg],["Footer text excerpt",m.footerText,d.footerText],["Horizontal overflow (px)",m.overflow,d.overflow],["JavaScript errors",m.errors?.join("; ")||"None",d.errors?.join("; ")||"None"]
 ];
 return fields.map(([key,a,b])=>"<tr><th>"+esc(key)+"</th><td>"+esc(a??"—")+"</td><td>"+esc(b??"—")+"</td></tr>").join("");
};
function screenshot(m,key,title){
 if(!m.shots?.[key])return "<span>Screenshot unavailable</span>";
 const x="screenshots/"+m.shots[key];
 return "<div><strong>"+title+"</strong><a href='"+x+"' target='_blank'><img loading='lazy' alt='"+title+"' src='"+x+"'></a></div>";
}
const sections=results.map((p,i)=>{
 const m=p.views.mobile,d=p.views.desktop;
 return "<section class='panel' id='p"+i+"'><h2>"+(i+1)+". "+esc(p.filename)+"</h2><p class='info'>"+esc(p.type)+" · <a href='https://stonebridgepsychgroup.com"+esc(p.url)+"'>Production URL</a></p>"
 +"<div class='pair'><div class='block'><h3>Mobile 390 × 844</h3><div class='subshots'>"+screenshot(m,"top","Top fold / header / hero")+screenshot(m,"bottom","Bottom fold / footer")+"</div><p><a href='screenshots/"+esc(m.shots?.full)+"'>Open full mobile screenshot</a></p></div>"
 +"<div class='block'><h3>Desktop 1440 × 900</h3><div class='subshots'>"+screenshot(d,"top","Top fold / header / hero")+screenshot(d,"bottom","Bottom fold / footer")+"</div><p><a href='screenshots/"+esc(d.shots?.full)+"'>Open full desktop screenshot</a></p></div></div>"
 +"<table><thead><tr><th>Measured element</th><th>390px mobile</th><th>1440px desktop</th></tr></thead><tbody>"+metricRows(m,d)+"</tbody></table>"
 +"<p class='info'>H1: "+esc(m.h1)+" · Mobile menu test: "+esc(JSON.stringify(m.menuTest||"not applicable"))+" · Identical repeated paragraphs: "+esc(JSON.stringify(m.duplicateParagraphs||[]))+"</p></section>";
}).join("");
const nav=results.map((p,i)=>"<a href='#p"+i+"'>"+esc(p.filename)+"</a>").join("");
const html="<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Stonebridge complete visual consistency audit</title><style>"+style+"</style></head><body><header><h1>Stonebridge · all-page visual consistency</h1><div>390px mobile versus 1440px desktop · Oct 28, 2026</div></header><main><section class='panel'><h2>Before design changes: the evidence</h2><p>All 21 sitemap pages, plus four public direct-access / legacy pages. For each page: full-page images, a screenshot of the initial viewport, a screenshot at the footer, and directly comparable layout measurements. Captured from the same production commit using a local browser server; no design or clinical changes were made.</p><p class='warn'>Desktop/mobile browser captures do not certify aesthetic quality, assistive-technology compliance, physical touch behavior, real-user performance, or clinician-specific TherapyPortal behavior. Please review the separate findings memo alongside these images.</p></section><nav class='toc'>"+nav+"</nav>"+sections+"</main></body></html>";
fs.writeFileSync(path.join(out,"index.html"),html);
const failures=results.flatMap(p=>["mobile","desktop"].filter(v=>p.views[v]?.error||p.views[v]?.overflow>2||p.views[v]?.errors?.length).map(v=>({page:p.filename,viewport:v,reason:p.views[v].error||p.views[v].errors||p.views[v].overflow})));
console.log("FINAL",JSON.stringify({pages:pages.length,viewports:50,failures,report:"visual-consistency-audit/index.html"}));
