const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Run real application modules with an isolated in-memory Firestore and Auth service.
// This never connects to Firebase or sends a payment.
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
const identities = [
  { uid: "first", email: "first@example.test", displayName: "First", metadata: { creationTime: "2026-01-01T00:00:00Z" } },
  { uid: "second", email: "second@example.test", displayName: "Second", metadata: { creationTime: "2026-01-02T00:00:00Z" } },
];
let pages = [], authFailure = false;
const auth = {
  listUsers: async (size, token) => {
    if (authFailure) throw new Error("permission-denied");
    assert.equal(size, 1000); pages.push(token);
    return token ? { users: [identities[1]] } : { users: [identities[0]], pageToken: "next" };
  },
  getUser: async uid => identities.find(user => user.uid === uid) || { uid, email: uid + "@example.test", metadata: {} },
};
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const localRequire = name => {
    if (name.endsWith("firebaseAdmin")) return { getAdminDb: () => db, getAdminAuth: () => auth };
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
  const { addProMonths, grantProPeriod, hasActivePro, effectiveAccount } = load("lib/proAccess.ts");
  const { canEditTemplate, mergePaidAccess } = load("lib/auth.ts");
  const { loadUserProfile, canonicalAccount } = load("lib/server/users.ts");
  const { listAdminUsers, patchAdminUser, upsertAuthUser } = load("lib/adminUsers.ts");
  const { createPurchase, fulfillPurchase, findOpenPurchase } = load("lib/server/purchases.ts");
  const { canUserAccessTemplate, ensurePaidTemplateAccess } = load("lib/server/access.ts");
  const { quoteCheckout } = load("lib/server/payments.ts");

  assert.equal(addProMonths("2028-01-31T12:00:00Z", 1), "2028-02-29T12:00:00.000Z");
  assert.equal(addProMonths("2026-11-30T12:00:00Z", 3), "2027-02-28T12:00:00.000Z");
  assert.throws(() => addProMonths("2026-01-01", 0));
  const period = grantProPeriod({ accountRole: "guest" }, 1, "2026-01-10T10:00:00Z");
  assert(hasActivePro(period, Date.parse("2026-02-10T09:59:59Z")));
  assert(!hasActivePro(period, Date.parse("2026-02-10T10:00:00Z")));
  assert.equal(effectiveAccount(period, Date.parse("2026-02-10T10:00:00Z")).accountRole, "guest");
  assert(!hasActivePro({ accountRole: "pro", plan: "pro" }));
  assert(!hasActivePro({ accountRole: "guest", plan: "pro", proExpiresAt: "2099-01-01" }));
  const user = { id: "google:first", name: "First", auth: "google", role: "host", ...grantProPeriod({ accountRole: "guest" }, 1), templates: [] };
  assert(canEditTemplate(user, "any-template"));
  const revoked = mergePaidAccess(user, { accountRole: "guest", plan: "free", proExpiresAt: null, templates: [] });
  assert(!canEditTemplate(revoked, "any-template"));
  assert.equal(revoked.plan, "free");

  const rows = await listAdminUsers();
  assert.deepEqual(pages, [undefined, "next"]);
  assert.equal(rows.length, 2);
  assert.equal(records.get("users/second").name, "Second");
  assert.equal(rows[0].accountRole, "guest");
  authFailure = true;
  await assert.rejects(listAdminUsers, /permission-denied/);
  authFailure = false;
  await patchAdminUser("first", { accountRole: "pro" });
  const assigned = records.get("users/first");
  assert.equal(assigned.proExpiresAt, addProMonths(assigned.proStartedAt, 1));
  await patchAdminUser("second", { accountRole: "pro", proMonths: 3 });
  assert.equal(records.get("users/second").proExpiresAt, addProMonths(records.get("users/second").proStartedAt, 3));
  await upsertAuthUser({ firebaseUid: "second", name: "Second", email: "second@example.test" });
  assert.equal(records.get("users/second").proExpiresAt, addProMonths(records.get("users/second").proStartedAt, 3));

  records.set("users/first", { ...assigned, proExpiresAt: "2020-01-01T00:00:00Z" });
  assert.equal((await loadUserProfile("first")).accountRole, "guest");
  assert.equal(records.get("users/first").accountRole, "guest");
  records.set("purchases/old-pro", { userId: "first", plan: "pro", status: "paid", templateId: "premium" });
  assert.equal((await ensurePaidTemplateAccess("first", "premium")).allowed, false);
  assert.equal(records.has("users/first/templateAccess/premium"), false);
  assert.equal(canonicalAccount({ accountRole: "vip", createdAt: "2020-01-01T00:00:00Z" }).accountRole, "guest");

  await createPurchase({ paymentId: "p1", uid: "first", plan: "pro", amount: 5970, proMonths: 3 });
  assert.equal(await findOpenPurchase("first", { plan: "pro", proMonths: 1, amount: 1990 }), null);
  const paid = await Promise.all([fulfillPurchase({ paymentId: "p1", amount: 5970 }), fulfillPurchase({ paymentId: "p1", amount: 5970 })]);
  assert.deepEqual(paid, [true, true]);
  const grant = records.get("users/first");
  assert.equal(grant.proExpiresAt, addProMonths(grant.proStartedAt, 3), "concurrent duplicate webhook must grant only once");
  await fulfillPurchase({ paymentId: "p1", amount: 5970 });
  assert.equal(records.get("users/first").proExpiresAt, grant.proExpiresAt);
  assert((await canUserAccessTemplate("first", "premium")).allowed);
  await createPurchase({ paymentId: "p2", uid: "first", plan: "pro", amount: 1990, proMonths: 1 });
  await fulfillPurchase({ paymentId: "p2", amount: 1990 });
  assert.equal(records.get("users/first").proExpiresAt, addProMonths(grant.proExpiresAt, 1), "renewal extends the existing period");
  await patchAdminUser("first", { accountRole: "guest" });
  await fulfillPurchase({ paymentId: "p2", amount: 1990 });
  assert.equal((await canUserAccessTemplate("first", "premium")).allowed, false, "replaying paid Pro must not restore revoked access");
  const quote = await quoteCheckout({ uid: "first", plan: "pro", proPriceSom: 1990, proMonths: 3 });
  assert.equal(quote.amount, 5970);
  assert.equal((await quoteCheckout({ uid: "first", plan: "pro", proPriceSom: 1990, proMonths: 999 })).error, "months");
  await createPurchase({ paymentId: "single", uid: "first", plan: "standard", amount: 590, templateId: "owned" });
  await fulfillPurchase({ paymentId: "single", amount: 590 });
  assert((await canUserAccessTemplate("first", "owned")).allowed, "a separately purchased template retains its own entitlement");
  assert(!(await canUserAccessTemplate("first", "other")).allowed);
  await patchAdminUser("first", { accountRole: "admin" });
  assert((await canUserAccessTemplate("first", "other")).allowed);
  console.log("PASS: paginated Auth import, surfaced errors, roles, 1/3 calendar months, exact expiry, server/client revocation, transactional payment idempotency, renewal, old Pro receipts denied, standalone purchases preserved.");
})().catch(error => { console.error(error); process.exitCode = 1; });
