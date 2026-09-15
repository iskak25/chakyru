import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync("components/AnniversaryInvite.tsx", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;

function harness(id, editing = false) {
  const hooks = [], requests = [];
  let index = 0, success = true, tree;
  const module = { exports: {} };
  const stub = new Proxy({}, { get: (_, key) => key === "__esModule" ? false : String(key) });
  const fetchMock = async (url, options) => { requests.push({ url, body: JSON.parse(options.body) }); return Response.json({ guest: { id: "saved" } }, { status: success ? 200 : 500 }); };
  const submission = { exports: {} };
  new Function("exports", "fetch", ts.transpileModule(fs.readFileSync("lib/guestSubmission.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(submission.exports, fetchMock);
  new Function("require", "module", "exports", "fetch", "FormData", compiled)(name => {
    if (name === "react") return { useState(initial) { const i = index++; if (!(i in hooks)) hooks[i] = initial; return [hooks[i], value => { hooks[i] = value; }]; } };
    if (name === "react/jsx-runtime") return require(name);
    if (name.endsWith("/weddingEditor")) return { safeWeddingLink: value => value };
    if (name.endsWith("/music")) return { effectiveMusicUrl: () => "" };
    if (name.endsWith("/defaultVenue")) return { invitationMapUrl: () => "" };
    if (name.endsWith("/guestSubmission")) return submission.exports;
    return stub;
  }, module, module.exports, async (url, options) => { requests.push({ url, body: JSON.parse(options.body) }); return { ok: success }; }, class { constructor(values) { this.values = values; } get(key) { return this.values[key]; } });
  const inv = { id, templateId: "jubilee-monochrome", names: "Тест", date: "2026-10-24", time: "18:00", venue: "Зал", address: "Бишкек", city: "Бишкек", copy: {}, gallery: {} };
  function render() { index = 0; tree = module.exports.AnniversaryInvite({ invitation: inv, design: { key: "monochrome", names: "Тест", hero: "/test.webp", paper: "#000", ink: "#fff" }, locale: "ru", onChange: editing ? () => {} : undefined }); }
  function nodes(node = tree) { return !node || typeof node !== "object" ? [] : [node, ...[node.props?.children].flat(Infinity).filter(Boolean).flatMap(child => nodes(child))]; }
  render();
  return { requests, nodes, fail: () => { success = false; }, recover: () => { success = true; }, async submit(values = {}) { await nodes().find(n => n.type === "form").props.onSubmit({ preventDefault() {}, currentTarget: { name: "  Гость  ", attendance: "yes", guests: "3", note: "Без орехов", ...values } }); render(); } };
}
for (const id of ["preview", "preview-custom", "demo"]) {
  const h = harness(id); await h.submit(); assert.equal(h.requests.length, 0); assert.ok(h.nodes().some(n => n.props?.role === "status"));
}
const editing = harness("saved-invitation", true); await editing.submit(); assert.equal(editing.requests.length, 0);
const guest = harness("saved/invitation"); await guest.submit();
assert.deepEqual(guest.requests, [{ url: "/api/invitations/saved%2Finvitation/rsvp", body: { name: "Гость", rsvp: "yes", plusOne: 2, note: "Без орехов" } }]);
await guest.submit(); assert.equal(guest.requests.length, 1, "sent form must not resubmit");
const retry = harness("retry"); retry.fail(); await retry.submit(); assert.ok(retry.nodes().some(n => n.props?.role === "alert"));
retry.recover(); await retry.submit({ attendance: "no", guests: "1" }); assert.equal(retry.requests.length, 2); assert.equal(retry.requests[1].body.rsvp, "no"); assert.ok(retry.nodes().some(n => n.props?.role === "status"));
const empty = harness("empty"); await empty.submit({ name: "   " }); assert.equal(empty.requests.length, 0);
console.log("PASS: jubilee RSVP preview/editor isolation, guest payload, duplicate prevention, failure/retry and empty-name validation; no network requests sent.");
