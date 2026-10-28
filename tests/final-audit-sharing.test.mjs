import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";

const read = file => readFileSync(new URL("../"+file,import.meta.url),"utf8");
const pages = [
 "index.html","home-current.html","services.html","about.html","team.html",
 "team-founder.html","team-jasmine-wilson.html","new-clients.html","fees-insurance.html",
 "individual-therapy.html","couples-therapy.html","family-therapy.html","parent-support.html"
];
const attr=(tag,key)=>tag?.match(new RegExp('\\b'+key+'="([^"]*)"'))?.[1]??null;
const tags=html=>[...html.matchAll(/<meta\b[^>]+>/gi)].map(x=>x[0]);
test("Open Graph page title, description, URL and approved image follow existing site metadata",()=>{
 for(const path of pages){
   const html=read(path),meta=tags(html);
   const description=meta.find(x=>attr(x,"name")==="description");
   const canonical=html.match(/<link\b[^>]*rel="canonical"[^>]*>/i)?.[0];
   const og=Object.fromEntries(meta.filter(x=>attr(x,"property")?.startsWith("og:")).map(x=>[attr(x,"property"),attr(x,"content")]));
   assert.equal(og["og:title"],html.match(/<title>([^<]+)<\/title>/)?.[1],path);
   assert.equal(og["og:description"],attr(description,"content"),path);
   assert.equal(og["og:url"],attr(canonical,"href"),path);
   assert.ok(og["og:image"]?.startsWith("https://stonebridgepsychgroup.com/"),path);
   assert.ok(existsSync(new URL("../"+og["og:image"].split("/").pop(),import.meta.url)),path);
   assert.equal(meta.filter(x=>attr(x,"property")==="og:title").length,1,path);
 }
});