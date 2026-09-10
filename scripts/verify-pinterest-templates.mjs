import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const loaded={exports:{}};
const compiled=ts.transpileModule(fs.readFileSync("lib/pinterestTemplates.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
new Function("module","exports",compiled)(loaded,loaded.exports);
const {pinterestDesigns,themedSiteDesigns,pinterestTemplates,getPinterestDesign}=loaded.exports;
const allDesigns=[...pinterestDesigns,...themedSiteDesigns];
assert.equal(pinterestTemplates.length,17);
assert.equal(pinterestTemplates.filter(t=>t.format==="site3d").length,13);
assert.equal(pinterestTemplates.filter(t=>t.format==="photo").length,4);
assert.equal(new Set(pinterestTemplates.map(t=>t.id)).size,17);
assert.equal(pinterestTemplates.filter(t=>t.eventTypes.includes("bachelorette")).length,2);
assert.equal(pinterestTemplates.filter(t=>t.eventTypes.includes("jentek")).length,1);
assert.equal(pinterestTemplates.filter(t=>t.eventTypes.includes("tushoo")).length,1);
for(const t of pinterestTemplates){
  const d=getPinterestDesign({templateId:t.id,copy:t.canvas.copy});
  assert.ok(d);
  assert.equal(getPinterestDesign({templateId:"admin-clone",copy:t.canvas.copy}).key,d.key);
  assert.equal(t.eventTypes[0],d.eventType || (t.format==="photo"?"wedding":"kyz"));
  for(const c of Object.values(d.photos)){
    assert.ok(fs.existsSync(path.join("public",c.source)),c.source);
    assert.ok(c.x>=0&&c.y>=0&&c.w>0&&c.h>0&&c.x+c.w<=c.width&&c.y+c.h<=c.height,`${t.id}: crop bounds`);
  }
}
console.log("PASS: 5 kyz sites, 4 JPG cards, 8 themed sites, categories, clone routing, assets and crop bounds");
if(process.argv.includes("--http")){
  for(const d of allDesigns){
    const r=await fetch(`${process.env.PREVIEW_URL||"http://localhost:3000"}/templates/${d.id}`);
    assert.equal(r.status,200,d.id);
    const html=await r.text();
    assert.ok(html.includes(`data-pinterest-design="${d.key}"`),`${d.id}: missing render`);
    const ids=[...html.matchAll(/data-box="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,`${d.id}: duplicate element IDs`);
    assert.ok(!html.includes("data-wedding-inspector"),"duplicate inspector");
    assert.equal(html.includes('name="attendance"'),d.format==="site3d",`${d.id}: form kind`);
    assert.equal(html.includes('data-invitation-card=""'),d.format==="photo",`${d.id}: JPG export target`);
    if(d.eventType==="jentek"||d.eventType==="tushoo") {
      assert.ok(html.includes(`data-family-site="${d.eventType}"`),`${d.id}: family renderer`);
      for(const id of ["parents-names","names","calendar","countdown","program-title-1","map-button","rsvp-note","rsvp-guests"]) assert.ok(ids.includes(id),`${d.id}: missing ${id}`);
      assert.ok(!html.includes('name="drinks"'),`${d.id}: inappropriate drinks field`);
    }
    console.log(`PASS: ${d.id}, HTTP 200, editable elements and correct format`);
  }
}
