import {chromium} from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const out="disclosure-legibility-proof";fs.mkdirSync(out,{recursive:true});
const targets=[["contact.html",".contact-brief-privacy"],["portal.html",".portal-emergency-note"]];
const widths=[320,390,430,768,1024,1440];
const results=[];
for(const [file,selector] of targets)for(const width of widths)for(const [version,port] of [["before",8773],["after",8774]]){
 const context=await browser.newContext({viewport:{width,height:900}});
 const page=await context.newPage();
 await page.goto("http://127.0.0.1:"+port+"/"+file,{waitUntil:"load"});
 await page.evaluate(()=>document.fonts.ready);
 const info=await page.evaluate(selector=>{
  const el=document.querySelector(selector),s=getComputedStyle(el),r=el.getBoundingClientRect();
  return{fontSize:s.fontSize,lineHeight:s.lineHeight,height:Math.round(r.height),width:Math.round(r.width),overflow:document.documentElement.scrollWidth>innerWidth+1};
 },selector);
 if([390,1440].includes(width))await page.screenshot({path:out+"/"+file+"-"+width+"-"+version+".jpg",type:"jpeg",quality:78,fullPage:true,animations:"disabled"});
 const axe=version==="after"&&[390,1440].includes(width)?await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]).analyze():null;
 results.push({file,width,version,...info,axeViolations:axe?.violations?.map(v=>v.id)});
 await context.close();
}
await browser.close();
fs.writeFileSync(out+"/results.json",JSON.stringify({browser:"Playwright Chromium",results},null,2));
let html=["<!doctype html><html lang='en'><meta charset='utf-8'><title>Stonebridge disclosure legibility review</title><meta name='viewport' content='width=device-width'><style>body{font:16px system-ui;color:#213142;background:#f8f5f0;max-width:1200px;margin:auto;padding:20px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}img{width:100%}@media(max-width:680px){.pair{grid-template-columns:1fr}}</style><h1>Supplemental notice legibility</h1><p>Original content, colors and workflows unchanged.</p>"];
for(const [file] of targets){html.push("<h2>"+file+"</h2>");for(const w of [390,1440]){html.push("<h3>"+w+"px</h3><div class='pair'>");for(const version of ["before","after"]){const name=file+"-"+w+"-"+version+".jpg";html.push("<figure><figcaption>"+version+"</figcaption><a href='"+name+"'><img src='"+name+"' alt='"+file+" "+version+" at "+w+"px'></a></figure>")}html.push("</div>")}}
html.push("</html>");fs.writeFileSync(out+"/index.html",html.join("\n"));
const failures=results.filter(r=>r.overflow||r.axeViolations?.length);console.log(JSON.stringify({checks:results.length,failures},null,2));if(failures.length)process.exitCode=1;
