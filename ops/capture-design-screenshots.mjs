import {createServer} from "node:http";
import {readFileSync, existsSync, mkdirSync, writeFileSync} from "node:fs";
import {resolve, extname, join} from "node:path";
import puppeteer from "puppeteer-core";

const baselineRoot=process.env.STONEBRIDGE_BASELINE_DIR;
if(!baselineRoot)throw new Error("Set STONEBRIDGE_BASELINE_DIR");
const outputDir=resolve("visual-review-screenshots");
mkdirSync(outputDir,{recursive:true});
const mime={".html":"text/html",".css":"text/css",".js":"application/javascript",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".ico":"image/x-icon",".json":"application/json",".woff2":"font/woff2"};
async function serve(root) {
 const server=createServer((req,res)=>{
  const path=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const file=resolve(root,"."+(path==="/"?"/index.html":path));
  if(!file.startsWith(resolve(root)+"/")||!existsSync(file)){res.writeHead(404);res.end("Not found");return}
  res.writeHead(200,{"Content-Type":mime[extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
  res.end(readFileSync(file));
 });
 await new Promise(r=>server.listen(0,"127.0.0.1",r));
 return {base:"http://127.0.0.1:"+server.address().port,close:()=>new Promise(r=>server.close(r))};
}
const before=await serve(baselineRoot),after=await serve(process.cwd());
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BIN||"/usr/bin/google-chrome",headless:true,args:["--no-sandbox","--disable-dev-shm-usage","--disable-background-networking"]});
const records=[];
async function visit(server,pathname,width,variant,capture) {
 const page=await browser.newPage();
 try {
  await page.setViewport({width,height:width<=760?844:900,deviceScaleFactor:1,isMobile:width<=760,hasTouch:width<=760});
  await page.goto(server.base+pathname,{waitUntil:"domcontentloaded",timeout:30000});
  await new Promise(r=>setTimeout(r,350));
  const metric=await page.evaluate(()=>{
   const home=document.querySelector(".sb-utility-strip--home-intro");
   const quiet=document.querySelector(".sb-utility-strip--quiet-transition");
   const band=home||quiet;
   const facts=document.querySelector(".home-hero-facts");
   const meet=document.querySelector(".home-hero-support a");
   const heading=document.querySelector(".home-services-title");
   const fee=document.querySelector(".fees-cost-explainer");
   return {path:location.pathname,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
    bandHeight:band?.getBoundingClientRect().height,bandInnerDisplay:home?.querySelector(".sb-utility-strip__inner")&&getComputedStyle(home.querySelector(".sb-utility-strip__inner")).display,
    bandText:band?.innerText?.trim(),aria:quiet?.getAttribute("aria-hidden"),
    factsFontSize:facts&&getComputedStyle(facts).fontSize,meetUnderline:meet&&getComputedStyle(meet).textDecorationLine,
    servicesOverflow:heading?.scrollWidth-heading?.clientWidth,insuranceAnchors:fee?.querySelectorAll('a[href="#payment-options"]').length,
    headerBookingDisplay:getComputedStyle(document.querySelector(".site-header .header-cta")).display,
    heroBookingDisplay:getComputedStyle(document.querySelector(".home-hero-action--primary")).display,
    secondaryButtonBorder:getComputedStyle(document.querySelector(".home-hero-actions .home-hero-action--secondary")).borderTopWidth,
    secondaryUnderline:getComputedStyle(document.querySelector(".home-hero-actions .home-hero-action--secondary")).textDecorationLine,
    heroFactsDisplay:facts&&getComputedStyle(facts).display,
    meetDisplay:getComputedStyle(document.querySelector(".home-hero-support")).display,
    mobileConsultationLabel:document.querySelector(".home-consultation-label-mobile")?getComputedStyle(document.querySelector(".home-consultation-label-mobile")).display:null,
    desktopConsultationLabel:document.querySelector(".home-consultation-label-desktop")?getComputedStyle(document.querySelector(".home-consultation-label-desktop")).display:null,
    description:document.querySelector(".home-hero-lede")?.innerText?.trim()
   };
  });
  records.push({variant,...metric});
  if(capture){
   const slug=pathname==="/"?"homepage":pathname.replace(/^\//,"").replace(/\.html$/,"");
   const height=await page.evaluate(()=>{
    const recognition=document.querySelector(".home-recognition");
    if(!recognition)return document.body.scrollHeight;
    return Math.ceil(recognition.getBoundingClientRect().top+window.scrollY+Math.min(220,window.innerHeight*0.25));
   });
   await page.screenshot({path:join(outputDir,variant+"-"+slug+"-"+width+".jpg"),type:"jpeg",quality:70,clip:{x:0,y:0,width,height},captureBeyondViewport:true});
   const band=await page.$(".sb-utility-strip--home-intro, .sb-utility-strip--quiet-transition");
   if(band&&await band.isVisible())await band.screenshot({path:join(outputDir,variant+"-"+slug+"-band-"+width+".png")});
  }
 }finally{await page.close()}
}
try {
 for(const variant of ["before","after"]){
  const server=variant==="before"?before:after;
  for(const width of [375,390,430,760,768,901,1024,1199,1280,1440])await visit(server,"/",width,variant,[390,430,1024,1280,1440].includes(width));

 }
 const homeRows=records.filter(r=>r.variant==="after"&&r.path==="/");
 for(const row of homeRows){
  if(row.scrollWidth>row.width)throw new Error("Horizontal overflow at "+row.width);
  if(row.bandText)throw new Error("Homepage band must contain zero text at "+row.width);
  if(row.width<=760){
    if(row.bandHeight!==14)throw new Error("Mobile band wrong at "+row.width);
    if(row.heroFactsDisplay==="none"||row.desktopConsultationLabel!=="none")throw new Error("Mobile facts or consultation label missing at "+row.width);
  }else{
    if(row.bandHeight<20||row.bandHeight>28)throw new Error("Desktop band wrong at "+row.width);
    if(row.headerBookingDisplay!=="none"||row.heroFactsDisplay!=="none"||row.meetDisplay!=="none")throw new Error("Competing desktop CTAs/facts visible at "+row.width);
    if(row.secondaryButtonBorder!=="0px"||!row.secondaryUnderline.includes("underline"))throw new Error("Consultation not a text link at "+row.width);
    if(row.desktopConsultationLabel==="none"||row.mobileConsultationLabel!=="none")throw new Error("Desktop consultation label wrong at "+row.width);
  }
 }
 writeFileSync(join(outputDir,"responsive-measurements.json"),JSON.stringify(records,null,2));
 console.log(JSON.stringify({screenshots:outputDir,measured:records.length,tests:"passed"}));
}finally{await browser.close();await before.close();await after.close()}
