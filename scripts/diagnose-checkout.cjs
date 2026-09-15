// Read-only payment diagnostics; credentials and customer identity are never printed.
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const originalLoad = Module._load;
Module._load = function(name, ...args) { if (name === "server-only") return {}; return originalLoad.call(this, name, ...args); };
require.extensions[".ts"] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
async function main() {
  const { getAdminDb } = require("../lib/firebaseAdmin.ts");
  const { getPaymentSettings } = require("../lib/server/paymentSettings.ts");
  const db = getAdminDb();
  if (!db) throw new Error("firebase-config");
  const pid = process.argv[2];
  const settings = await getPaymentSettings();
  console.log(JSON.stringify({configured: !!(settings.finikApiKey && settings.finikPrivateKey && settings.finikAccountId), beta: settings.finikBeta, siteUrl: settings.siteUrl}));
  for (const collection of ["payments", "purchases"]) {
    const snap = await db.collection(collection).doc(pid).get();
    const p = snap.data();
    console.log(JSON.stringify({collection, exists: snap.exists, status: p?.status, templateId: p?.templateId, plan: p?.plan, finikPaymentId: p?.finikPaymentId}));
  }
  // Finik has no payment-status-by-id endpoint; the webhook write above is
  // the only source of truth for whether this payment actually succeeded.
  await db.terminate();
}
main().catch(error => { console.error("diagnostic-failed", error.code || error.message?.slice(0, 70)); process.exitCode = 1; });
