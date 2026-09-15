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
  const { fetchFinikPaymentStatus } = require("../lib/finik.ts");
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
  // Avoid printing provider response bodies in diagnostics.
  const info = console.info; console.info = (...args) => info(args[0], {status: args[1]?.status, path: args[1]?.path});
  const status = await fetchFinikPaymentStatus(pid, {apiKey: settings.finikApiKey, privateKey: settings.finikPrivateKey, accountId: settings.finikAccountId, mcc: settings.finikMcc, beta: settings.finikBeta});
  console.log(JSON.stringify({providerStatus: status?.status || null}));
  await db.terminate();
}
main().catch(error => { console.error("diagnostic-failed", error.code || error.message?.slice(0, 70)); process.exitCode = 1; });
