/* Image-only comparison build; does not replace live website references. */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import sharp from "sharp";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const out=path.join(root,"image-optimization-review");
const assets=path.join(out,"assets");
fs.mkdirSync(assets,{recursive:true});
const names=[
 ["Adult Therapy","thoughtful_man_in_cozy_home_office.png"],
 ["Adolescent Therapy","focused_study_in_a_cozy_bedroom.png"],
 ["Couples Therapy","couples_teletherapy_in_a_cozy_living_room.png"],
 ["Family Therapy","cozy_family_telehealth_session.png"],
 ["Group/telehealth service image","cozy_home_office_video_call.png"]
];
const data=[];
for(const [label,filename] of names){
 const src=path.join(root,filename);
 const basename=filename.replace(/\.png$/,"");
 const original="assets/"+filename;
 fs.copyFileSync(src,path.join(assets,filename));
 const originalMeta=await sharp(src).metadata();
 const item={label,filename,original,originalBytes:fs.statSync(src).size,dimensions:[originalMeta.width,originalMeta.height],variants:[]};
 for(const width of [640,960]){
  const dest=basename+"-"+width+".webp";
  await sharp(src).resize({width,withoutEnlargement:true}).webp({quality:82,effort:5}).toFile(path.join(assets,dest));
  const m=await sharp(path.join(assets,dest)).metadata();
  item.variants.push({width:m.width,height:m.height,src:"assets/"+dest,bytes:fs.statSync(path.join(assets,dest)).size});
 }
 data.push(item);
 console.log("IMAGE",label,"original",item.originalBytes,"webp",[...item.variants.map(x=>x.bytes)].join("/"));
}
fs.writeFileSync(path.join(out,"measurements.json"),JSON.stringify({quality:82,dimensionsPreserved:true,images:data},null,2));
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function kb(n){return Math.round(n/1024).toLocaleString()+" KiB";}
const sections=data.map((x,i)=>{
 const [a,b]=x.variants;
 return "<section><h2>"+(i+1)+". "+esc(x.label)+"</h2><p>"+esc(x.filename)+" · Original "+x.dimensions.join("×")+" px · "+kb(x.originalBytes)+"</p>"
 +"<div class='triple'><figure><img src='"+x.original+"' alt='"+esc(x.label)+" original'><figcaption>Original PNG · "+kb(x.originalBytes)+"</figcaption></figure>"
 +"<figure><img src='"+a.src+"' alt='"+esc(x.label)+" WebP 640'><figcaption>WebP "+a.width+"×"+a.height+" · "+kb(a.bytes)+" · "+Math.round(100*(1-a.bytes/x.originalBytes))+"% fewer bytes</figcaption></figure>"
 +"<figure><img src='"+b.src+"' alt='"+esc(x.label)+" WebP 960'><figcaption>WebP "+b.width+"×"+b.height+" · "+kb(b.bytes)+" · "+Math.round(100*(1-b.bytes/x.originalBytes))+"% fewer bytes</figcaption></figure></div>"
 +"<p class='note'>All three images use the same display aspect ratio, crop, and object-fit:cover rule. Check hair, fine fabric texture, faces and background edges at native display size and 2× DPR.</p></section>";
}).join("");
const css="body{margin:0;background:#f8f5f0;font:15px/1.5 system-ui;color:#18324a}header,main{max-width:1280px;margin:auto;padding:20px}h1{font-size:26px}h2{font-size:21px;margin:0}section{background:white;margin:20px 0;padding:22px;border:1px solid #ddd;border-radius:8px}.triple{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.triple figure{margin:0;max-width:480px}.triple img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover}.triple figcaption{font-size:13px;padding:7px 0}.note{font-size:12px;color:#5a6570}.warning{padding:12px;background:#fff2d4}@media(max-width:760px){.triple{grid-template-columns:1fr}.triple figure{max-width:390px}}";
fs.writeFileSync(path.join(out,"index.html"),"<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Stonebridge homepage image quality review</title><style>"+css+"</style></head><body><header><h1>Stonebridge · Home service-card image optimization review</h1><p class='warning'>These are proposed, generated image files for visual comparison only. The live site has not been altered. Do not deploy until the owner approves texture, facial detail, cropping and 1×/2× sharpness.</p><p>Quality: WebP 82. Two responsive widths: 640 / 960 pixels. Original 1122px PNGs retained as fallback candidates. The gallery uses the same 4:5 card crop and cover behavior for all variants.</p></header><main>"+sections+"</main></body></html>");
console.log("REPORT",out);
