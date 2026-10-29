import {chromium,firefox,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const pages=fs.readdirSync('.').filter(p=>p.endsWith('.html')).sort();
const engines={chromium,firefox,webkit},out={browsers:[],axe:[],regressions:[]};
for(const [browserName,engine] of Object.entries(engines)){
 const browser=await engine.launch({headless:true,args:browserName==='chromium'?['--no-sandbox']:[]});
 for(const file of pages)for(const width of [320,390,1440]){
 const context=await browser.newContext({viewport:{width,height:900}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto('http://127.0.0.1:8001/'+file,{waitUntil:'domcontentloaded',timeout:22000});await page.waitForTimeout(220);
 const m=await page.evaluate(()=>({v:innerWidth,documentWidth:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(x=>x.complete&&!x.naturalWidth).length}));
 out.browsers.push({browser:browserName,file,width,actualPath:new URL(page.url()).pathname,overflow:m.documentWidth>m.v+1,brokenImages:m.brokenImages,pageErrors:errors});
 if(browserName==='chromium'&&[390,1440].includes(width)){
 const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
 out.axe.push({file,width,violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
 }
 }catch(e){out.browsers.push({browser:browserName,file,width,error:String(e).slice(0,260)});}
 await context.close();
 }
 for(const width of [320,390,1440]){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
 await page.goto('http://127.0.0.1:8001/new-clients.html',{waitUntil:'load'});
 const result=await page.evaluate(()=>({hero:Math.round(document.querySelector('.access-hero').getBoundingClientRect().height),cta:Math.round(document.querySelector('.access-path-row .btn-primary').getBoundingClientRect().bott...[truncated]