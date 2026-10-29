/* Non-production, headed-browser review for actual browser full zoom and Firefox text-only zoom.
   Requires Chromium/Firefox from temporary Playwright install, Xvfb DISPLAY and xdotool. */
const {chromium,firefox}=require('playwright');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const base=process.env.STONEBRIDGE_TEST_URL||'http://127.0.0.1:8811';
const pages=['index.html','new-clients.html','contact.html','portal.html','services.html','team.html','team-founder.html','team-jasmine-wilson.html','for-clinicians.html','fees-insurance.html','careers.html'];
const out='zoom-reflow-proof';fs.mkdirSync(out,{recursive:true});
const report={browserFullZoom:[],firefoxTextOnlyZoom:[],errors:[]};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const measure=()=>({width:innerWidth,docWidth:document.documentElement.scrollWidth,
 overflow:document.documentElement.scrollWidth>innerWidth+1,
 dpr:devicePixelRatio,rootFontPx:parseFloat(getComputedStyle(document.documentElement).fontSize)});
function windowFor(className){
 const s=execFileSync('xdotool',['search','--class',className],{encoding:'utf8'}).trim().split('\n');
 if(!s.at(-1))throw new Error(className+' GUI window not found');
 return s.at(-1);
}
function key(win,what){execFileSync('xdotool',['key','--window',win,'--clearmodifiers',what],{stdio:'ignore'})}
(async()=>{
 const cb=await chromium.launch({headless:false,args:['--no-sandbox','--disable-gpu']});
 const cp=await cb.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1});
 await cp.goto(base+'/new-clients.html',{waitUntil:'load'});
 const cw=windowFor('chromium');
 key(cw,'ctrl+0');await sleep(300);
 for(const [target,steps] of [[100,0],[200,5],[400,3]]){
  for(let i=0;i<steps;i++){key(cw,'ctrl+plus');await sleep(80)}
  for(const file of pages){
   await cp.goto(base+'/'+file,{waitUntil:'load',timeout:25000});
   const m=await cp.evaluate(measure);
   report.browserFullZoom.push({file,zoomPercent:target,...m});
   if(target!==100&&['index.html','new-clients.html','team.html'].includes(file)){
    await cp.screenshot({path:out+'/'+file+'-chromium-'+target+'.jpg',type:'jpeg',quality:70,fullPage:false,animations:'disabled'});
   }
  }
 }
 await cb.close();

 const fb=await firefox.launch({headless:false,firefoxUserPrefs:{'browser.zoom.full':false,'browser.zoom.siteSpecific':false}});
 const fp=await fb.newPage({viewport:{width:1280,height:900}});
 await fp.goto(base+'/new-clients.html',{waitUntil:'load'});
 const fw=windowFor('firefox');
 for(const target of [100,200,400]){
  for(let i=0;i<45;i++){
   const font=await fp.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).fontSize));
   if(font >= target*16/100 - 0.7)break;
   key(fw,'ctrl+plus');await sleep(45);
  }
  for(const width of [1280,640,320]){
   await fp.setViewportSize({width,height:900});
   for(const file of pages){
    await fp.goto(base+'/'+file,{waitUntil:'load',timeout:25000});
    const m=await fp.evaluate(measure);
    report.firefoxTextOnlyZoom.push({file,zoomPercent:target,viewportRequestedCssPx:width,...m});
    if(target===200&&['index.html','new-clients.html','team.html','team-jasmine-wilson.html'].includes(file)&&width===320){
      await fp.screenshot({path:out+'/'+file+'-firefox-text-only-200-at-320.jpg',type:'jpeg',quality:70,fullPage:false,animations:'disabled'});
    }
   }
  }
 }
 await fb.close();
 fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));
 const mandatory=report.browserFullZoom.filter(x=>x.overflow).concat(report.firefoxTextOnlyZoom.filter(x=>x.zoomPercent===200&&x.overflow));
 const optional=report.firefoxTextOnlyZoom.filter(x=>x.zoomPercent===400&&x.overflow);
 console.log(JSON.stringify({browserFullZoomChecks:report.browserFullZoom.length,
 fullZoomFailures:report.browserFullZoom.filter(x=>x.overflow),
 firefox200Checks:report.firefoxTextOnlyZoom.filter(x=>x.zoomPercent===200).length,
 firefox200Failures:report.firefoxTextOnlyZoom.filter(x=>x.zoomPercent===200&&x.overflow),
 optional400TextOnlyFailures:optional.length,
 actualFullZoomLevels:[...new Set(report.browserFullZoom.map(x=>x.dpr))],
 actualFirefoxRootTextSizes:[...new Set(report.firefoxTextOnlyZoom.map(x=>x.rootFontPx))]},null,2));
 if(mandatory.length)process.exitCode=1;
})().catch(e=>{report.errors.push(String(e));fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));console.error(e);process.exitCode=1});
