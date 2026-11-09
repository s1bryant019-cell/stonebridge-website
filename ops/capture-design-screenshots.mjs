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
  const file=resolve(root,"."+(path==="/"?"/home-current.html":path));
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
  await page.setViewport({width,height:width<=760?900:900,deviceScaleFactor:1,isMobile:width<=760&&width!==720,hasTouch:width<=760&&width!==720});
  await page.goto(server.base+pathname,{waitUntil:"domcontentloaded",timeout:30000});
  // Full-page visual evidence must include below-the-fold image assets;
  // scrolling screenshots alone does not trigger Chrome's lazy image loader.
  await page.evaluate(async()=>{
    const imgs=[...document.querySelectorAll("img")];
    for(const img of imgs)img.loading="eager";
    await Promise.all(imgs.map(img=>Promise.race([
      img.decode().catch(()=>null),
      new Promise(resolve=>setTimeout(resolve,1600))
    ])));
  });
  await new Promise(r=>setTimeout(r,250));
  const metric=await page.evaluate(()=>{
   const home=document.querySelector(".sb-utility-strip--home-intro");
   const quiet=document.querySelector(".sb-utility-strip--quiet-transition");
   const band=home||quiet;
   const facts=document.querySelector(".home-hero-facts");
   const meet=document.querySelector(".home-hero-support a");
   const support=document.querySelector(".home-hero-support");
   const hero=document.querySelector(".home-hero");
   const heading=document.querySelector(".home-services-title");
   const fee=document.querySelector(".fees-cost-explainer");
   const perspective=document.querySelector(".home-perspective");
   const quote=perspective?.querySelector(".home-founder-quote");
   const label=perspective?.querySelector(".home-eyebrow");
   const next=document.querySelector(".home-start-steps");
   const sections=[["hero",".home-hero"],["recognition",".home-recognition"],["services",".home-services"],["clinicians",".home-clinicians"],["perspective",".home-perspective"],["starting",".home-start-steps"],["final",".home-final"],["footer",".home-footer"]].map(([name,selector])=>{
     const el=document.querySelector(selector),r=el?.getBoundingClientRect(),st=el&&getComputedStyle(el);
     const heading=el?.querySelector("h1,h2");
     return {name,top:r?.top,bottom:r?.bottom,height:r?.height,paddingTop:st?.paddingTop,paddingBottom:st?.paddingBottom,display:st?.display,background:st?.backgroundColor,headingFontSize:heading&&getComputedStyle(heading).fontSize};
   });
   const pr=perspective?.getBoundingClientRect(),qr=quote?.getBoundingClientRect(),lr=label?.getBoundingClientRect(),np=next?.getBoundingClientRect();
   const pcss=perspective&&getComputedStyle(perspective),qcss=quote&&getComputedStyle(quote);
   const cards=[...document.querySelectorAll(".home-service-card,.home-clinician-card,.home-step-card")].map(el=>{
     const r=el.getBoundingClientRect(),p=el.querySelector("p"),q=p?.getBoundingClientRect();
     return {type:el.className,cardHeight:r.height,paragraphHeight:q?.height,paragraphBottomInset:q?r.bottom-q.bottom:null};
   });
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
    meetDisplay:support?getComputedStyle(support).display:null,
    insuranceSectionPresent:!!document.querySelector(".home-insurance-band"),
    heroSupportPresent:!!support,
    serviceCardCount:document.querySelectorAll(".home-services-grid .home-service-card").length,
    adultDestination:document.querySelector(".home-service-card[href*=adult-therapy]")?.getAttribute("href"),
    adolescentDestination:document.querySelector(".home-service-card[href*=adolescent-therapy]")?.getAttribute("href"),
    heroActionLabels:[...hero.querySelectorAll(".home-hero-actions a")].map(a=>a.textContent.trim()),
    responseMentions:(document.querySelector(".home-start-steps")?.innerText.match(/24–48 hours/g)||[]).length,
    mobileConsultationLabel:document.querySelector(".home-consultation-label-mobile")?getComputedStyle(document.querySelector(".home-consultation-label-mobile")).display:null,
    desktopConsultationLabel:document.querySelector(".home-consultation-label-desktop")?getComputedStyle(document.querySelector(".home-consultation-label-desktop")).display:null,
    description:document.querySelector(".home-hero-lede")?.innerText?.trim(),
    perspective:{present:!!perspective,paragraphCount:perspective?.querySelectorAll("p:not(.home-eyebrow)").length,quoteText:quote?.textContent?.trim(),labelText:label?.textContent?.trim(),height:pr?.height,paddingTop:pcss?.paddingTop,paddingBottom:pcss?.paddingBottom,labelQuoteGap:qr&&lr?qr.top-lr.bottom:null,quoteBottomGap:qr&&pr?pr.bottom-qr.bottom:null,quoteWidth:qr?.width,quoteFont:qcss?.fontFamily,quoteColor:qcss?.color,quoteVisibility:qcss?.visibility,quoteOpacity:qcss?.opacity,fontSize:qcss?.fontSize,lineHeight:qcss?.lineHeight,background:pcss?.backgroundColor,nextTopGap:np&&pr?np.top-pr.bottom:null},
    sections,cards
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
   if(variant==="after"&&[390,720,768,1024,1440].includes(width))
     await page.screenshot({path:join(outputDir,variant+"-"+slug+"-full-"+width+".jpg"),type:"jpeg",quality:78,fullPage:true});
   if([390,720,768,1024,1440].includes(width)){
     const perspective=await page.$(".home-perspective");
     if(perspective){
       const r=await perspective.boundingBox();
       const top=Math.max(0,Math.floor(r.y-70));
       const full=await page.evaluate(()=>document.documentElement.scrollHeight);
       const bottom=Math.min(full,Math.ceil(r.y+r.height+100));
       await page.screenshot({path:join(outputDir,variant+"-"+slug+"-perspective-"+width+".png"),type:"png",clip:{x:0,y:top,width,height:bottom-top},captureBeyondViewport:true});
     }
   }
  }
 }finally{await page.close()}
}
try {
 for(const variant of ["before","after"]){
  const server=variant==="before"?before:after;
  for(const width of [375,390,430,720,760,768,901,1024,1199,1280,1440])await visit(server,"/",width,variant,[390,430,720,768,1024,1280,1440].includes(width));

 }
 const homeRows=records.filter(r=>r.variant==="after"&&r.path==="/");
 writeFileSync(join(outputDir,"responsive-measurements.json"),JSON.stringify(records,null,2));
 for(const row of homeRows){
  if(row.scrollWidth>row.width)throw new Error("Horizontal overflow at "+row.width);
  const p=row.perspective;
  if(!p?.present||p.paragraphCount!==0)throw new Error("Perspective must contain only its gold label and quote at "+row.width);
  if(p.labelText!=="The Stonebridge perspective")throw new Error("Perspective label changed at "+row.width);
  if(p.quoteText!=="“We do not choose every part of the story we inherit. We can still become more intentional authors of how we live it.”")throw new Error("Approved quotation changed at "+row.width);
  const padTop=parseFloat(p.paddingTop),padBottom=parseFloat(p.paddingBottom);
  const minimum=row.width<=760?40:row.width<=1100?52:56;
  if(padTop<minimum||padBottom<minimum)throw new Error("Perspective padding cramped at "+row.width+": "+p.paddingTop+"/"+p.paddingBottom);
  if(Math.abs(padTop-padBottom)>8)throw new Error("Unbalanced Perspective padding at "+row.width);
  if(p.labelQuoteGap<15||p.labelQuoteGap>22)throw new Error("Perspective label gap needs 16–20px at "+row.width+": "+p.labelQuoteGap);
  if(p.quoteBottomGap<minimum-2)throw new Error("Perspective quote sits too close to navy band bottom at "+row.width+": "+p.quoteBottomGap);
  if(p.quoteWidth>1000)throw new Error("Perspective quote runs too wide at "+row.width);
  if(p.nextTopGap!==0)throw new Error("Gap between Perspective and Starting Therapy at "+row.width);
  if(row.sections.some(x=>x.height<=0&&x.display!=="none"))throw new Error("Unexpected collapsed visible homepage section at "+row.width);
  if(p.quoteColor!=="rgb(255, 255, 255)"||p.quoteVisibility!=="visible"||p.quoteOpacity!=="1")throw new Error("Perspective quote must be visible white on navy at "+row.width+": "+p.quoteColor);
  if(row.bandText)throw new Error("Original quiet transition must contain no message at "+row.width);
  if(row.insuranceSectionPresent)throw new Error("Unapproved insurance section present at "+row.width);
  if(row.heroSupportPresent||row.meetDisplay)throw new Error("Redundant third hero action present at "+row.width);
  if(row.heroActionLabels.join("|")!=="Request an Appointment|Meet Our Clinicians")throw new Error("Hero actions incorrect at "+row.width+": "+row.heroActionLabels);
  if(row.serviceCardCount!==6)throw new Error("Original six-card service layout not preserved at "+row.width);
  if(row.adultDestination!=="adult-therapy.html"||row.adolescentDestination!=="adolescent-therapy.html")throw new Error("Dedicated therapy links missing at "+row.width);
  if(row.responseMentions!==1)throw new Error("24–48-hour response message must occur once at "+row.width);
  if(row.heroFactsDisplay==="none")throw new Error("Understated practice status missing at "+row.width);
  if(row.width<=760){
   if(row.bandHeight!==14)throw new Error("Mobile transition height changed at "+row.width);
  }else{
   if(row.bandHeight<20||row.bandHeight>28)throw new Error("Desktop transition height changed at "+row.width);
   if(row.headerBookingDisplay!=="none")throw new Error("Two competing booking actions at "+row.width);
   if(row.secondaryButtonBorder!=="0px"||!row.secondaryUnderline.includes("underline"))throw new Error("Desktop secondary link not quiet at "+row.width);
  }
 }
 console.log(JSON.stringify({screenshots:outputDir,measured:records.length,tests:"passed"}));
}finally{await browser.close();await before.close();await after.close()}
