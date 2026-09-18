const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// In-memory Firestore mock, same shape as scripts/verify-pro-access.cjs.
const records = new Map();
let transactionTail = Promise.resolve();
const copy = value => structuredClone(value);
const ref = key => ({
  path: key, id: key.split("/").at(-1),
  get: async () => snapshot(key),
  set: async (value, options) => write(key, value, options),
  collection: name => collection(key + "/" + name),
});
const snapshot = key => ({ id: key.split("/").at(-1), ref: ref(key), exists: records.has(key), data: () => copy(records.get(key)) });
function write(key, value, options) {
  const next = options?.merge ? copy(records.get(key) || {}) : {};
  for (const [field, item] of Object.entries(value)) {
    next[field] = item?.__union ? [...new Set([...(next[field] || []), ...item.__union])] : copy(item);
  }
  records.set(key, next);
}
function collection(name, conditions = [], limit = Infinity) {
  return {
    doc: id => ref(name + "/" + id),
    where: (field, op, value) => { assert.equal(op, "=="); return collection(name, [...conditions, [field, value]], limit); },
    limit: count => collection(name, conditions, count),
    get: async () => {
      const docs = [...records.keys()].filter(key => key.startsWith(name + "/") && key.split("/").length === name.split("/").length + 1)
        .filter(key => conditions.every(([field, value]) => records.get(key)[field] === value)).slice(0, limit).map(snapshot);
      return { docs, empty: !docs.length };
    },
  };
}
const db = {
  collection,
  runTransaction(fn) {
    const work = transactionTail.then(async () => {
      const writes = [];
      const result = await fn({ get: item => item.get(), set: (item, value, options) => writes.push([item.path, value, options]) });
      for (const args of writes) write(...args);
      return result;
    });
    transactionTail = work.catch(() => {});
    return work;
  },
};
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const localRequire = name => {
    if (name.endsWith("firebaseAdmin")) return { getAdminDb: () => db, getAdminAuth: () => null };
    if (name === "firebase-admin/firestore") return { FieldValue: { arrayUnion: (...values) => ({ __union: values }) } };
    if (name === "../templates") return { isFreeTemplate: () => false };
    if (name === "./templates") return { getCatalogTemplate: async id => ({ id, priceSom: 590 }), getCatalogBasePrice: async () => 590 };
    if (name.startsWith(".")) return load(path.resolve(path.dirname(file), name + ".ts"));
    return require(name);
  };
  new Function("require", "module", "exports", code)(localRequire, mod, mod.exports);
  return mod.exports;
}

(async () => {
  const { templateAccessExpiresAt, canUserAccessTemplateFromFacts, canSaveInvitation } = load("lib/server/accessLogic.ts");

  // Pure logic: only a plain purchase carries a 2-week deadline.
  assert.equal(templateAccessExpiresAt("purchase", "2026-01-01T00:00:00.000Z"), "2026-01-15T00:00:00.000Z");
  assert.equal(templateAccessExpiresAt("free", "2026-01-01T00:00:00.000Z"), null);
  assert.equal(templateAccessExpiresAt("pro", "2026-01-01T00:00:00.000Z"), null);
  assert.equal(templateAccessExpiresAt("admin", "2026-01-01T00:00:00.000Z"), null);

  const baseFacts = { accountRole: "guest", plan: "free", isAdminEmail: false, isFreeTemplate: false, hasPaidPurchase: false };
  const future = new Date(Date.now() + 86_400_000).toISOString();
  const past = new Date(Date.now() - 86_400_000).toISOString();

  let d = canUserAccessTemplateFromFacts({ ...baseFacts, hasTemplateAccess: true, templateAccessExpiresAt: future });
  assert.deepEqual(d, { allowed: true, accessType: "purchase" });

  d = canUserAccessTemplateFromFacts({ ...baseFacts, hasTemplateAccess: true, templateAccessExpiresAt: past });
  assert.equal(d.allowed, false);
  assert.equal(d.expired, true);

  d = canUserAccessTemplateFromFacts({ ...baseFacts, hasPaidPurchase: true, hasTemplateAccess: false, templateAccessExpiresAt: null });
  assert.deepEqual(d, { allowed: true, accessType: "purchase" }, "a fresh purchase with no access-doc timestamp yet is not treated as expired");

  d = canUserAccessTemplateFromFacts({ ...baseFacts, isAdminEmail: true, hasTemplateAccess: true, templateAccessExpiresAt: past });
  assert.equal(d.allowed, true, "admin bypasses a per-template deadline");

  assert.deepEqual(canSaveInvitation({ existing: false, owns: false, accessAllowed: false, accessExpired: true }), { ok: false, reason: "expired" });
  assert.deepEqual(canSaveInvitation({ existing: false, owns: false, accessAllowed: false, accessExpired: false }), { ok: false, reason: "access" });
  assert.deepEqual(canSaveInvitation({ existing: true, owns: false, accessAllowed: true, accessExpired: true }), { ok: false, reason: "owner" }, "ownership mismatch still wins over an expiry reason");
  assert.deepEqual(canSaveInvitation({ existing: false, owns: false, accessAllowed: true }), { ok: true });

  // Integration: grant now, force the clock forward past the 2-week window, and confirm
  // ensurePaidTemplateAccess does NOT silently renew it just because it's being checked again.
  const { grantTemplateAccess, canUserAccessTemplate, ensurePaidTemplateAccess } = load("lib/server/access.ts");
  await grantTemplateAccess({ uid: "buyer", templateId: "tpl-1", accessType: "purchase", purchaseId: "pay-1" });
  const freshDoc = records.get("users/buyer/templateAccess/tpl-1");
  assert(freshDoc.expiresAt, "grant writes an expiresAt");
  assert((await canUserAccessTemplate("buyer", "tpl-1")).allowed, "freshly granted access is usable immediately");

  // Rewind the grant to 15 days ago, as if the 2-week window had already elapsed.
  const fifteenDaysAgo = new Date(Date.now() - 15 * 86_400_000).toISOString();
  records.set("users/buyer/templateAccess/tpl-1", { ...freshDoc, grantedAt: fifteenDaysAgo, expiresAt: templateAccessExpiresAt("purchase", fifteenDaysAgo) });
  records.set("purchases/pay-1", { userId: "buyer", templateId: "tpl-1", plan: "standard", status: "paid" });

  const expiredAccess = await canUserAccessTemplate("buyer", "tpl-1");
  assert.equal(expiredAccess.allowed, false);
  assert.equal(expiredAccess.expired, true);
  assert.equal(expiredAccess.owned, true, "still counts as owned, just no longer editable");

  const healed = await ensurePaidTemplateAccess("buyer", "tpl-1");
  assert.equal(healed.allowed, false, "loading the editor after expiry must not silently renew access");
  assert.equal(records.get("users/buyer/templateAccess/tpl-1").expiresAt, templateAccessExpiresAt("purchase", fifteenDaysAgo), "expiresAt must stay untouched, not reset to a fresh 2-week window");

  // A genuinely new purchase (different id) does grant a fresh window.
  await grantTemplateAccess({ uid: "buyer", templateId: "tpl-1", accessType: "purchase", purchaseId: "pay-2" });
  assert((await canUserAccessTemplate("buyer", "tpl-1")).allowed, "re-purchasing resets the 2-week window");

  console.log("PASS: 2-week template-access expiry — pure logic, admin bypass, save-gate reasons, no silent renewal on re-check, renewal on genuine repurchase.");
})().catch(error => { console.error(error); process.exitCode = 1; });
