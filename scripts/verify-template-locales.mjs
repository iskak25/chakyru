import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const nativeRequire=createRequire(import.meta.url), cache=new Map();
let currentLocale="ru";
function load(file) {
  file=path.resolve(file);
  if(cache.has(file))return cache.get(file).exports;
  const loadedModule={exports:{}};cache.set(file,loadedModule);
  const source=fs.readFileSync(file,"utf8");
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  function require(id) {
    if(id.endsWith(".module.css"))return new Proxy({},{get:(_,key)=>key==="__esModule"?false:String(key)});
    if(id.endsWith("/useCatalog"))return {useCatalog:()=>({templates:load("lib/templates.ts").templates})};
    if(id.endsWith("/locale"))return {useI18n:()=>({locale:currentLocale,t:load("lib/i18n.ts").getDict(currentLocale)})};
    if(id==="next/navigation")return {useRouter:()=>({}),usePathname:()=>"/templates",useSearchParams:()=>new URLSearchParams()};
    if(id.startsWith("@/")||id.startsWith(".")) {
      const base=id.startsWith("@/")?path.resolve(id.slice(2)):path.resolve(path.dirname(file),id);
      if(base.endsWith(".json"))return JSON.parse(fs.readFileSync(base,"utf8"));
      const resolved=[base,`${base}.ts`,`${base}.tsx`,path.join(base,"index.tsx")].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
      if(resolved)return load(resolved);
    }
    return nativeRequire(id);
  }
  new Function("require","module","exports",compiled)(require,loadedModule,loadedModule.exports);
  return loadedModule.exports;
}
const {FormatInvite}=load("components/FormatInvite.tsx");
const {templates}=load("lib/templates.ts");
const {inviteFromTemplate}=load("lib/templateCanvas.ts");
const {invitationText}=load("lib/inviteTranslations.ts");
const records=[];
for(const locale of ["ru","ky"]) {
  currentLocale=locale;
  for(const template of templates) {
    const inv=inviteFromTemplate(template);
    const html=renderToStaticMarkup(React.createElement(FormatInvite,{invitation:inv,locale,startOpen:true}));
    assert.ok(html.length>300,`${template.id}: empty ${locale} render`);
    if(process.argv.includes("--images")) {
      const restored=load("lib/templateImageSources.ts").restoredTemplateImage;
      const design=load("lib/referenceWeddings.ts").referenceWedding(inv)||load("lib/pinterestTemplates.ts").getPinterestDesign(inv);
      const replaced=Object.entries(design?.photos||{}).filter(([,crop])=>restored(crop));
      if(replaced.length) {
        assert.ok(html.includes("/images/template-restored/"),`${template.id}: restoration not rendered`);
        assert.ok(!/src="\/images\/(?:template-originals\/|wedding-references\/[^".]+\.jpg|pinterest-references\/\d+\.jpg)/.test(html),`${template.id}: screenshot crop still rendered`);
        const custom={...inv,gallery:Object.fromEntries(Object.keys(design.photos).map(slot=>[slot,`/user-photos/${slot}.jpg`]))};
        const customHtml=renderToStaticMarkup(React.createElement(FormatInvite,{invitation:custom,locale,startOpen:true}));
        assert.ok(customHtml.includes("/user-photos/"),`${template.id}: user gallery missing`);
        assert.ok(!customHtml.includes("/images/template-restored/"),`${template.id}: restored artwork overrides user photo`);
      }
    }
    const decode=t=>t.replaceAll("&amp;","&").replaceAll("&#x27;","'").replaceAll("&quot;",'"').trim();
    const texts=[...html.replace(/<svg\b[\s\S]*?<\/svg>/g,"").matchAll(/>([^<>]+)</g)].map(m=>decode(m[1])).filter(Boolean);
    const attributes=[...html.matchAll(/(?:placeholder|aria-label)="([^"]+)"/g)].map(m=>decode(m[1]));
    records.push({id:template.id,locale,texts,attributes});
    if(process.argv.includes("--dump"))continue;
    assert.ok(!texts.some(t=>/[қҚәӘғҒұҰіІ]/.test(t)),`${template.id}/${locale}: Kazakh copy`);
    assert.ok(![...texts,...attributes].some(t=>/[A-Za-z]{2,}/.test(t)),`${template.id}/${locale}: foreign copy`);
    for(const text of [...texts,...attributes])assert.equal(invitationText(text,locale).replace(/\s+/g," ").toLocaleLowerCase(),text.replace(/\s+/g," ").toLocaleLowerCase(),`${template.id}/${locale}: untranslated ${text}`);
    const before=JSON.stringify(inv);
    renderToStaticMarkup(React.createElement(FormatInvite,{invitation:inv,locale:locale==="ru"?"ky":"ru",startOpen:true}));
    assert.equal(JSON.stringify(inv),before,`${template.id}: language switch modified stored data`);
  }
}
fs.mkdirSync("tmp",{recursive:true});
fs.writeFileSync("tmp/template-locale-audit.json",JSON.stringify(records,null,2));
const unknown=[...new Set(records.filter(r=>!r.id.startsWith("theme-jentek")&&!r.id.startsWith("theme-tushoo")).flatMap(r=>r.texts).filter(t=>t.length>6&&/[a-zа-яөүң]/i.test(t)&&invitationText(t,"ru")===t&&invitationText(t,"ky")===t))];
fs.writeFileSync("tmp/template-locale-unknown.txt",unknown.join("\n---\n"));
console.log(`Rendered ${templates.length} templates in both languages (${records.length} pages). Text audit: tmp/template-locale-audit.json`);
assert.equal(invitationText("SAVE THE DATE","ru"),"СОХРАНИТЕ ДАТУ");
assert.equal(invitationText("SAVE THE DATE","ky"),"КҮНДҮ ЭСТЕП КАЛЫҢЫЗ");
assert.equal(invitationText("Мой собственный текст с именем Jane","ky"),"Мой собственный текст с именем Jane");
assert.notDeepEqual(records.find(r=>r.id==="reference-stars"&&r.locale==="ru").texts,records.find(r=>r.id==="reference-stars"&&r.locale==="ky").texts);
if(process.argv.includes("--http")) {
  for(const template of templates) {
    const response=await fetch(`${process.env.PREVIEW_URL||"http://127.0.0.1:3000"}/templates/${template.id}`);
    assert.equal(response.status,200,`${template.id}: preview HTTP status`);
    await response.text();
  }
  console.log(`PASS: all ${templates.length} preview routes return HTTP 200.`);
}
