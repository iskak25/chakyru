import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

// Download original public source files only. Never process generated artwork.
const generated=[];
for(const folder of ["public/images/wedding-references","public/images/pinterest-references"]){
 for(const name of await fs.readdir(folder))if(name.endsWith("-clean.png")){
   const file=path.join(folder,name);generated.push({file,hash:crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex")});
 }
}
const sources=JSON.parse(await fs.readFile("public/images/pinterest-references/sources.json","utf8"));
const candidates=sources.map(s=>({file:`/images/pinterest-references/${s.id}.jpg`,url:s.image.replace(/\/\d+x\//,"/originals/")}));
const previous=JSON.parse(await fs.readFile("lib/templateImageSources.json","utf8").catch(()=>"{}"));
const oldReport=JSON.parse(await fs.readFile("docs/template-image-quality.json","utf8").catch(()=>"{}"));
const imported=await fs.readFile("scripts/fetch-template-photos.mjs","utf8");
for(const m of imported.matchAll(/\["(jipek|ivory|mauve)", "hero", "([a-f0-9]{32})-/g)){
 const [,id,hash]=m;candidates.push({file:`/images/templates/${id}/hero.jpg`,url:`https://i.pinimg.com/originals/${hash.slice(0,2)}/${hash.slice(2,4)}/${hash.slice(4,6)}/${hash}.jpg`});
}
const archive=await fs.readFile("docs/reference-weddings.md","utf8");
for(const m of archive.matchAll(/\/templates\/reference-([^`]+)`[^\n]+`([a-f0-9]{30,32})\.jpg`/g)) {
 const [,id,hash]=m;candidates.push({file:`/images/wedding-references/${id}.jpg`,url:`https://i.pinimg.com/originals/${hash.slice(0,2)}/${hash.slice(2,4)}/${hash.slice(4,6)}/${hash}.jpg`});
}
await fs.mkdir("public/images/template-originals",{recursive:true});
const upgraded={...previous},report=[...(oldReport.images||[])];
for(let i=0;i<candidates.length;i+=4)await Promise.all(candidates.slice(i,i+4).map(async c=>{
 try {
   if(previous[c.file] || oldReport.images?.some(item=>item.file===c.file))return;
   if(new URL(c.url).hostname!=="i.pinimg.com")throw Error("Unexpected host");
   const old=await sharp(path.join("public",c.file)).metadata();
   const response=await fetch(c.url,{signal:AbortSignal.timeout(25000)});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   const buffer=Buffer.from(await response.arrayBuffer()),next=await sharp(buffer).metadata();
   const ratio=(next.width/next.height)/(old.width/old.height);
   if(Math.abs(ratio-1)>.015)throw Error("Different aspect ratio: original crop retained");
   if(next.width*next.height<=old.width*old.height*1.2)throw Error("Original has no additional resolution");
   const target=`/images/template-originals/${c.file.replace(/^\/images\//,"").replaceAll("/","-")}`;
   await fs.writeFile(path.join("public",target),buffer);
   upgraded[c.file]=target;
   report.push({...c,target,before:[old.width,old.height],after:[next.width,next.height]});
   console.log(`UPGRADED ${c.file}: ${old.width}x${old.height} -> ${next.width}x${next.height}`);
 }catch(error){report.push({...c,unchanged:error.message});console.log(`KEPT ${c.file}: ${error.message}`);}
}));
for(const item of generated){const hash=crypto.createHash("sha256").update(await fs.readFile(item.file)).digest("hex");if(hash!==item.hash)throw Error(`Generated artwork changed: ${item.file}`);}
await fs.writeFile("lib/templateImageSources.json",JSON.stringify(upgraded,null,2)+"\n");
await fs.writeFile("docs/template-image-quality.json",JSON.stringify({generatedPreserved:generated,images:report},null,2)+"\n");
console.log(`${Object.keys(upgraded).length} originals upgraded; ${generated.length} generated files unchanged.`);
