import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const source = fs.readFileSync("lib/referenceWeddings.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const loaded = { exports: {} };
new Function("module", "exports", "require", compiled)(loaded, loaded.exports, require);
const { referenceWeddings, referenceWeddingTemplates, referenceWedding } = loaded.exports;
assert.equal(referenceWeddings.length, 9);
assert.equal(new Set(referenceWeddingTemplates.map(t => t.id)).size, 9);
for (const template of referenceWeddingTemplates) {
  const design = referenceWedding({ templateId: template.id, copy: template.canvas.copy });
  assert.ok(design);
  assert.equal(referenceWedding({ templateId: "admin-clone", copy: template.canvas.copy }).id, design.id);
  assert.equal(template.format, "site3d");
  for (const crop of Object.values(design.photos)) {
    assert.ok(fs.existsSync(path.join("public", crop.source)), crop.source);
    assert.ok(crop.x >= 0 && crop.y >= 0 && crop.w > 0 && crop.h > 0);
    assert.ok(crop.x + crop.w <= crop.width && crop.y + crop.h <= crop.height, `${design.id}: crop outside image`);
  }
}
console.log("PASS: nine unique templates, assets, crop bounds and admin clone routing");

// Exercise the additional RSVP fields without accessing Firebase or sending guest data.
let saved = { templateId: "reference-rose", guests: [] };
const fakeRef = { get: async () => ({ exists: true, data: () => saved }), set: async value => { saved = { ...saved, ...value }; } };
const serverModule = { exports: {} };
const serverCode = ts.transpileModule(fs.readFileSync("lib/server/invitations.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
new Function("module", "exports", "require", serverCode)(serverModule, serverModule.exports, name => {
  assert.equal(name, "../firebaseAdmin");
  return { getAdminDb: () => ({ collection: () => ({ doc: () => fakeRef }) }) };
});
const input = { invitationId: "local-test-only", name: "Test guest", rsvp: "yes", plusOne: 1, drinks: "Без алкоголя", note: "Поздравляем!" };
await serverModule.exports.addInvitationRsvp(input);
assert.equal(saved.guests[0].drinks, input.drinks);
assert.equal(saved.guests[0].note, input.note);
await serverModule.exports.addInvitationRsvp({ invitationId: input.invitationId, name: input.name, rsvp: "no", plusOne: 0 });
assert.equal(saved.guests.length, 1);
assert.equal(saved.guests[0].rsvp, "no");
assert.equal(saved.guests[0].note, input.note);
console.log("PASS: RSVP preferences persist; existing guest updates preserve optional fields");
if (process.argv.includes("--http")) {
  const base = process.env.PREVIEW_URL || "http://localhost:3000";
  for (const design of referenceWeddings) {
    const response = await fetch(`${base}/templates/reference-${design.id}`);
    assert.equal(response.status, 200, design.id);
    const html = await response.text();
    assert.ok(html.includes(`data-reference-design="${design.id}"`), `${design.id}: missing rendered design`);
    assert.ok(!html.includes("data-wedding-inspector"), `${design.id}: duplicate inspector`);
    const ids = [...html.matchAll(/data-box="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${design.id}: duplicate editable IDs`);
    assert.ok(html.includes("name=\"attendance\""), `${design.id}: missing attendance form`);
    console.log(`PASS: ${design.id} HTTP 200, SSR, editable IDs and guest form`);
  }
}
