import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const sources=JSON.parse(await fs.readFile("lib/templateImageSources.json","utf8"));
const report=JSON.parse(await fs.readFile("docs/template-image-quality.json","utf8"));
for(const [source,target] of Object.entries(sources)){
  assert.ok(!source.includes("-clean."),`Generated asset remapped: ${source}`);
  const original=await sharp(path.join("public",source)).metadata();
  const upgraded=await sharp(path.join("public",target)).metadata();
  assert.ok(upgraded.width*upgraded.height>original.width*original.height*1.2,`${source}: no resolution improvement`);
  assert.ok(Math.abs((upgraded.width/upgraded.height)/(original.width/original.height)-1)<.015,`${source}: crop aspect changed`);
}
for(const {file,hash} of report.generatedPreserved){
  assert.equal(crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex"),hash,`${file}: generated artwork changed`);
}
console.log(`PASS: ${Object.keys(sources).length} higher-resolution originals; ${report.generatedPreserved.length} generated assets byte-for-byte unchanged.`);

const restored=JSON.parse(await fs.readFile("lib/templateRestoredImages.json","utf8"));
const restoration=JSON.parse(await fs.readFile("docs/template-image-restoration.json","utf8"));
assert.equal(Object.keys(restored).length,51);
for(const item of restoration.images){
  const c=item.original, key=`${c.source}|${c.x},${c.y},${c.w},${c.h}`;
  assert.equal(restored[key]?.source,item.source,`${item.design}/${item.slot}: missing crop mapping`);
  const meta=await sharp(path.join("public",item.source)).metadata();
  assert.equal(meta.width,item.width);
  assert.equal(meta.height,item.height);
  assert.ok(meta.width>=500,`${item.source}: insufficient native width`);
  assert.ok(meta.width*meta.height>c.w*c.h,`${item.source}: no extra source detail`);
}
assert.equal(new Set(restoration.images.map(i=>i.design)).size,12);
console.log("PASS: 51 restored assets, native dimensions and crop mappings for 12 designs (13 templates).");
