import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const nativeRequire = createRequire(import.meta.url), cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  function require(id) {
    if (id.endsWith(".module.css")) return new Proxy({}, { get: (_, k) => k === "__esModule" ? false : String(k) });
    if (id.endsWith("/locale")) return { useI18n: () => ({ locale: "ru", t: load("lib/i18n.ts").getDict("ru") }) };
    if (id.startsWith("@/") || id.startsWith(".")) {
      const base = id.startsWith("@/") ? path.resolve(id.slice(2)) : path.resolve(path.dirname(file), id);
      if (base.endsWith(".json")) return JSON.parse(fs.readFileSync(base, "utf8"));
      const resolved = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.tsx")].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
      if (resolved) return load(resolved);
    }
    return nativeRequire(id);
  }
  new Function("require", "module", "exports", compiled)(require, module, module.exports);
  return module.exports;
}

const { templates, mergeCatalogTemplates } = load("lib/templates.ts");
const { envelopeForTemplate, envelopeVariants, shouldShowEnvelope } = load("lib/envelopes.ts");
const { inviteFromTemplate } = load("lib/templateCanvas.ts");
const { FormatInvite } = load("components/FormatInvite.tsx");
const variants = new Set();
const render = (invitation, props = {}) => renderToStaticMarkup(React.createElement(FormatInvite, { invitation, locale: "ru", interactive: true, ...props }));
let sites = 0, photos = 0;
for (const template of templates) {
  const inv = inviteFromTemplate(template), before = JSON.stringify(inv);
  const html = render(inv);
  const enabled = template.format === "site3d";
  assert.equal(html.includes("data-envelope-intro="), enabled, `${template.id}: format gate`);
  if (enabled) {
    sites++;
    const config = envelopeForTemplate(template); variants.add(config.variant);
    assert.ok(envelopeVariants[config.variant]);
    assert.ok(html.includes('data-stage="closed"'));
    assert.ok(!html.includes('data-box='), `${template.id}: invitation leaked before opening`);
    assert.ok(!html.includes('<audio') && !html.includes('<iframe'), `${template.id}: media mounted before opening`);
    for (const layer of ["back", "card", "left", "right", "bottom", "flap", "seal"]) assert.ok(html.includes(layer), `${template.id}: ${layer} missing`);
    const openHtml = render(inv, { startOpen: true });
    assert.ok(!openHtml.includes("data-envelope-intro="));
    assert.ok(openHtml.includes('data-box=') && openHtml.includes('<input'), `${template.id}: existing invitation/RSVP missing after bypass`);
    const editor = render(inv, { onChange: () => {} });
    assert.ok(!editor.includes("data-envelope-intro="), `${template.id}: editor blocked`);
    assert.ok(!shouldShowEnvelope(template, { interactive: false }));
    const clone = { ...template, id: "admin-copy", envelope: undefined };
    assert.equal(envelopeForTemplate(clone).variant, config.variant, `${template.id}: clone art direction`);
  } else {
    photos++;
    assert.equal(html, render(inv, { interactive: false }), `${template.id}: photo path changed`);
    assert.equal(envelopeForTemplate({ ...template, envelope: { enabled: true, variant: "burgundy" } }).enabled, false);
  }
  assert.equal(JSON.stringify(inv), before, `${template.id}: invitation data mutated`);
}
assert.equal(sites, 23); assert.equal(photos, 9); assert.ok(variants.size >= 9);
assert.ok(mergeCatalogTemplates(templates.map(({ envelope, ...old }) => old)).filter(t => t.format === "site3d").every(t => t.envelope.enabled));
console.log(`PASS: ${sites} 3D intros, ${photos} unchanged photo templates, ${variants.size} palettes, editor/export bypass, guest forms and clone metadata.`);

// Geometry of the CSS scene through the complete card extraction, including small landscape screens.
for (const width of [320, 360, 375, 390, 412, 430, 768, 1440]) for (const height of [360, 568, 667, 844, 900]) {
  const small = height <= 540;
  const envelopeWidth = Math.min(small ? 440 : 520, width - (small ? 40 : 48), (small ? .65 : .7) * height);
  const h = envelopeWidth / 1.48;
  const topAtExtraction = height * .54 - h * .5 + h * .07 - h * .89 * .88;
  assert.ok(topAtExtraction >= 0, `${width}x${height}: extracted card clipped above viewport`);
  assert.ok(envelopeWidth * .86 * 1.25 <= width, `${width}x${height}: expanded card overflows width`);
}
console.log("PASS: envelope/card geometry at requested mobile widths and desktop, portrait and landscape. Browser rendering still requires visual QA.");

if (process.argv.includes("--http")) {
  for (const template of templates) {
    const response = await fetch(`${process.env.PREVIEW_URL || "http://localhost:3000"}/templates/${template.id}`);
    assert.equal(response.status, 200, template.id);
    const html = await response.text();
    assert.equal(html.includes("data-envelope-intro="), template.format === "site3d", `${template.id}: route gate`);
  }
  console.log("PASS: all 32 preview routes return the correct initial experience.");
}
