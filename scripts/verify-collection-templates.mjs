import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const nativeRequire = createRequire(import.meta.url), cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  function req(id) {
    if (id.endsWith(".module.css")) return new Proxy({}, { get: (_, key) => key === "__esModule" ? false : String(key) });
    if (id.endsWith("/locale")) return { useI18n: () => ({ locale: "ky", t: load("lib/i18n.ts").getDict("ky") }) };
    if (id.startsWith("@/") || id.startsWith(".")) {
      const base = id.startsWith("@/") ? path.resolve(id.slice(2)) : path.resolve(path.dirname(file), id);
      if (base.endsWith(".json")) return JSON.parse(fs.readFileSync(base, "utf8"));
      const resolved = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.tsx")].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (resolved) return load(resolved);
    }
    return nativeRequire(id);
  }
  new Function("require", "module", "exports", compiled)(req, module, module.exports);
  return module.exports;
}

const { templates, mergeCatalogTemplates } = load("lib/templates.ts");
const { catalogTargets, collectionDesigns, collectionTemplates, getCollectionDesign } = load("lib/collectionTemplates.ts");
const { inviteFromTemplate } = load("lib/templateCanvas.ts");
const { FormatInvite } = load("components/FormatInvite.tsx");
const expectedAdded = { wedding:14, kyz:24, tushoo:10, anniversary:8, beshik:9, birthday:10, jentek:9, bachelorette:8, corporate:6, iftar:5 };
const publishedCounts = Object.fromEntries(Object.entries(catalogTargets).map(([category,target]) => [category,target-expectedAdded[category]+collectionTemplates.filter(t=>t.eventTypes[0]===category).length]));
const publishedTotal = 39 + collectionTemplates.length;
assert.equal(templates.length, publishedTotal, "catalog follows configured publication, independently of redesign batches");
assert.equal(new Set(templates.map(item => item.id)).size, publishedTotal, "template IDs are unique");
assert.equal(new Set(templates.map(item => item.name.ky)).size, publishedTotal, "Kyrgyz template names are unique");
assert.equal(collectionDesigns.length, 103, "exactly 103 new designs");
assert.deepEqual(Object.fromEntries(Object.keys(catalogTargets).map(category => [category, templates.filter(item => item.eventTypes[0] === category).length])), publishedCounts);
assert.deepEqual(Object.fromEntries(Object.keys(expectedAdded).map(category => [category, collectionDesigns.filter(item => item.event === category).length])), expectedAdded);

let examples = 0, photographs = 0;
for (const template of templates) {
  assert.ok(template.name.ky.trim() && template.name.ru.trim(), `${template.id}: bilingual title`);
  assert.equal(template.eventTypes.length, 1, `${template.id}: one primary category`);
  assert.ok(template.canvas?.names?.trim(), `${template.id}: sample name`);
  assert.ok(template.canvas?.date && template.canvas.time && template.canvas.venue?.trim() && template.canvas.address?.trim(), `${template.id}: complete example`);
  assert.ok(template.canvas.message?.trim(), `${template.id}: sample invitation text`);
  const design = getCollectionDesign({ templateId: template.id, copy: template.canvas.copy });
  if (design?.photo) { assert.ok(fs.existsSync(path.join("public", design.photo)), `${template.id}: image exists`); photographs++; }
  for (const locale of ["ky", "ru"]) {
    const invitation = inviteFromTemplate(template);
    const html = renderToStaticMarkup(React.createElement(FormatInvite, { invitation, locale }));
    assert.ok(html.length > 1000, `${template.id}/${locale}: template renders`);
    if (design) {
      assert.ok(html.includes('name="attendance"'), `${template.id}/${locale}: RSVP remains available`);
      assert.ok(html.includes(`data-collection-design="${template.id}"`), `${template.id}/${locale}: routed to its own design`);
      if (locale === "ky") assert.match(html, /[ӨҮҢөүң]/, `${template.id}: Kyrgyz letters render`);
      if (template === templates.find(item => item.id === "collection-wedding-olive-vow") && locale === "ky") {
        const longName = "Өмүрбек Үсөнбек уулу & Үмүт Жээналы кызы менен узун салтанаттуу ысым";
        const longAddress = "Кыргыз Республикасы, Бишкек шаары, Октябрь району, Чүй проспекти, № 120, үчүнчү кабат, чоң салтанат залы";
        const longHtml = renderToStaticMarkup(React.createElement(FormatInvite, { invitation: { ...invitation, names: longName, address: longAddress }, locale }));
        const visibleHtml = longHtml.replaceAll("&amp;", "&").replaceAll("&quot;", '"');
        assert.ok(visibleHtml.includes(longName) && visibleHtml.includes(longAddress), "long names and addresses remain editable and visible");
      }
    }
    examples++;
  }
}
const merged = mergeCatalogTemplates(templates.filter(item => !item.id.startsWith("collection-")));
assert.equal(merged.length, publishedTotal, "existing saved catalog receives configured entries");
assert.deepEqual(merged.filter(t=>t.id.startsWith('collection-')).map(t=>t.id).sort(), collectionTemplates.map(t=>t.id).sort());
console.log(`PASS: ${publishedTotal} published templates, 103 retained designs, ${photographs} replaceable photos, ${examples} Kyrgyz/Russian SSR renders, and saved-catalog merge.`);
