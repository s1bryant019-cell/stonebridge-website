import {chromium,firefox,webkit} from 'playwright';
import fs from 'node:fs';
const origin=process.env.STONEBRIDGE_TEST_URL||'http://127.0.0.1:8001';
const rows=[];
for(const [browserName,engine] of Object.entries({chromium,firefox,webkit})){
 const browser=await engine.launch({headless:true,args:browserName==='chromium'?['--no-sandbox']:[]});
 for(const width of [390,1440]){
  const ctx=await browser.newContext({viewport:{width,height:844}});
  const page=await ctx.newPage();await page.goto(origin+'/new-clients.html',{waitUntil:'load'});
  await page.keyboard.press('Tab');
  const first=await page.evaluate(()=>document.activeElement?.textContent?.trim()||'');
  const menu=page.locator('button.mobile-toggle');let opened=null,escapeState=null;
  if(await menu.isVisible()){
   await menu.focus();await page.keyboard.press('Enter');
   opened=await menu.getAttribute('aria-expanded');
   await page.keyboard.press('Escape');
   escapeState=await menu.getAttribute('aria-expanded');
  }
  const paths=await page.locator('.access-path-row a').evaluateAll(as=>as.map(a=>({label:a.textContent.trim(),href:a.getAttribute('href'),tabIndex:a.tabIndex})));
  await page.goto(origin+'/contact.html',{waitUntil:'load'});
  let attemptedRequests=0;
  await page.route('**/api/consultation-request',route=>{attemptedRequests++;route.abort()});
  await page.locator('#consultation-submit-button').click();
  const invalid=await page.locator('#consultation-request-form [aria-invalid="true"]').count();
  const row={browserName,width,skipFirst:first.toLowerCase().includes('skip'),menuOpened:opened,menuAfterEscape:escapeState,paths,invalidRequiredControls:invalid,apiAttempts:attemptedRequests};
  rows.push(row);
  await ctx.close();
 }
 await browser.close();
}
fs.mkdirSync('release-candidate-proof',{recursive:true});fs.writeFileSync('release-candidate-proof/keyboard-pathways.json',JSON.stringify(rows,null,2));
const failures=rows.filter(x=>!x.skipFirst||x.paths.length!==2||x.paths.some(a=>a.tabIndex<0)||x.apiAttempts!==0||x.invalidRequiredControls<1||(x.width===390&&x.menuOpened!=='true'));
console.log(JSON.stringify({testCases:rows.length,failures,rows:rows.map(({browserName,width,skipFirst,menuOpened,menuAfterEscape,invalidRequiredControls,apiAttempts})=>({browserName,width,skipFirst,menuOpened,menuAfterEscape,invalidRequiredControls,apiAttempts}))},null,2));
if(failures.length)process.exitCode=1;
