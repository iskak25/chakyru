const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

function load(file, dependencies) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", code)(name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }, mod, mod.exports);
  return mod.exports;
}

function noUndefined(value) {
  assert.notEqual(value, undefined, "Firestore rejects undefined values");
  if (value && typeof value === "object") Object.values(value).forEach(noUndefined);
}

(async () => {
  let stored;
  const ref = { get: async () => ({ exists: !!stored, data: () => structuredClone(stored) }) };
  const db = {
    collection: () => ({ doc: () => ref }),
    runTransaction: fn => fn({ get: r => r.get(), set: (_ref, value) => {
      noUndefined(value);
      stored = structuredClone(value);
    } }),
  };
  const server = load("lib/server/invitations.ts", { "../firebaseAdmin": { getAdminDb: () => db } });
  const invitation = {
    id: "save-test", templateId: "test", names: "Names", venue: "Venue", date: "2026-12-12",
    coverImage: "https://example.test/cover.jpg", gallery: { hero: "https://example.test/hero.jpg" },
    extras: [{ id: "text", kind: "text", text: "Added text" }, { id: "photo", kind: "image", src: "https://example.test/extra.jpg" }],
    copy: { title: "Edited title" }, layout: {}, guests: [], wishes: [],
  };
  const owner = { ownerId: "google:owner", ownerUid: "owner" };
  assert.equal(await server.saveInvitationDoc({ invitation, ...owner }), true);
  let guest = await server.getInvitationDoc(invitation.id);
  assert.deepEqual(guest.extras, invitation.extras);
  assert.deepEqual(guest.gallery, invitation.gallery);
  assert.deepEqual(guest.copy, invitation.copy);
  stored.guests = [{ id: "guest", name: "Guest" }];
  await server.saveInvitationDoc({ invitation: { ...invitation, gallery: {}, copy: {}, extras: [] }, ...owner });
  guest = await server.getInvitationDoc(invitation.id);
  assert.deepEqual(guest.gallery, {});
  assert.deepEqual(guest.copy, {});
  assert.equal(guest.guests.length, 1);

  const cache = new Map();
  global.localStorage = { getItem: key => cache.get(key) ?? null, setItem: (key, value) => cache.set(key, value), removeItem: key => cache.delete(key) };
  const events = [];
  global.window = { setTimeout, clearTimeout, dispatchEvent: e => events.push(e) };
  const requests = [];
  const store = load("lib/store.ts", {
    "./auth": {}, "./templates": { getTemplate: () => ({ format: "site3d" }) },
    "./music": {}, "./defaultVenue": { DEFAULT_VENUE: {} },
    "./accessClient": { pushInvitationRemote: next => new Promise(resolve => requests.push({ next, resolve })) },
  });
  const tick = () => new Promise(resolve => setImmediate(resolve));
  store.saveInvitation(invitation);
  const drain = store.flushInvitationSync(invitation.id);
  await tick();
  const updated = { ...invitation, copy: { title: "Newest text" } };
  store.saveInvitation(updated);
  requests[0].resolve({ ok: true, invitation });
  await tick();
  assert.equal(requests.length, 2);
  assert.equal(store.getInvitation(invitation.id).copy.title, "Newest text");
  assert.equal(events.filter(e => e.detail?.state === "saved").length, 0);
  requests[1].resolve({ ok: true, invitation: updated });
  assert.equal(await drain, true);
  assert.equal(store.hasUnsavedInvitation(invitation.id), false);
  assert.equal(store.getInvitation(invitation.id).copy.title, "Newest text");

  store.saveInvitation(updated);
  const failure = store.flushInvitationSync(invitation.id);
  await tick();
  requests[2].resolve({ ok: false, error: "network" });
  assert.equal(await failure, false);
  store.rememberRemoteInvitation(invitation);
  assert.equal(store.getInvitation(invitation.id).copy.title, "Newest text");
  assert.equal(store.hasUnsavedInvitation(invitation.id), true);
  const retry = store.flushInvitationSync(invitation.id);
  await tick();
  requests[3].resolve({ ok: true, invitation: updated });
  assert.equal(await retry, true);
  // Older drafts must upload embedded photos before the invitation PUT.
  global.File ??= require("node:buffer").File;
  let uploadCount = 0;
  global.fetch = async (url) => {
    if (url.startsWith("data:")) return { blob: async () => new Blob(["photo"], { type: "image/png" }) };
    assert.equal(url, "/api/uploads/images");
    uploadCount++;
    return { ok: true, json: async () => ({ url: "https://example.test/uploaded.png" }) };
  };
  const media = load("lib/uploadImage.ts", {
    "./firebase": { getFirebaseAuth: () => ({ authStateReady: async () => {}, currentUser: { getIdToken: async () => "token" } }) },
  });
  const data = "data:image/png;base64,cGhvdG8=";
  const migrated = await media.persistInvitationImages({ ...invitation, coverImage: data, gallery: { hero: data }, extras: [{ id: "photo", kind: "image", src: data }] });
  assert.equal(uploadCount, 1);
  assert.equal(migrated.coverImage, "https://example.test/uploaded.png");
  assert.equal(migrated.gallery.hero, migrated.coverImage);
  assert.equal(migrated.extras[0].src, migrated.coverImage);
  console.log("PASS: guest photos/text, undefined fields, deletions, guest preservation, ordered saves, failed-save retry and draft protection");
})().catch(error => { console.error(error); process.exitCode = 1; });
