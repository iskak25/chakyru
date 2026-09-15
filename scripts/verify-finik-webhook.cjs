const assert = require("node:assert/strict"), fs = require("node:fs"), ts = require("typescript"), crypto = require("node:crypto");
function load(file, resolve = require) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  new Function("require", "module", "exports", code)(resolve, mod, mod.exports);
  return mod.exports;
}
const logic = load("lib/server/accessLogic.ts", name => name.endsWith("/proAccess") ? load("lib/proAccess.ts") : require(name));
const keys = crypto.generateKeyPairSync("rsa", {modulusLength: 2048});
const finik = load("lib/finik.ts", name => name === "server-only" ? {} : name === "crypto" ? {...crypto, createPublicKey: () => keys.publicKey} : require(name));
const timestamp = String(Date.now());
const body = {amount: 1, fields: {paymentId: "order-1"}, status: "success"};
const canonical = `post\n/api/pay/webhook\nhost:www.toichakyru.com&x-api-client:client&x-api-timestamp:${timestamp}\nretry=1\n${JSON.stringify(body)}`;
const signature = crypto.sign("RSA-SHA256", Buffer.from(canonical), keys.privateKey).toString("base64");
const verification = {method: "POST", path: "/api/pay/webhook", hosts: ["www.toichakyru.com"], timestamp, signature, body, preferBeta: false, extraHeaders: {"x-api-client": "client"}, query: {retry: "1"}};
assert(finik.verifyFinikCallback(verification), "all signed x-api headers and query must be included");
assert(!finik.verifyFinikCallback({...verification, extraHeaders: {}}), "missing signed header fails verification");
assert(!finik.verifyFinikCallback({...verification, body: {...body, amount: 2}}), "tampered amount fails verification");
let valid = true, grants = 0;
const route = load("app/api/pay/webhook/route.ts", name => {
  if (name === "next/server") return {NextResponse: {json: (data, init) => ({data, status: init?.status || 200})}};
  if (name.endsWith("/finik")) return {...finik, verifyFinikCallback: () => valid};
  if (name.endsWith("/accessLogic")) return logic;
  if (name.endsWith("/paymentSettings")) return {getPaymentSettings: async () => ({finikBeta: false, siteUrl: "https://www.toichakyru.com"})};
  if (name.endsWith("/purchases")) return {fulfillPurchase: async input => {assert.equal(input.paymentId, "order-1"); grants++; return true;}, failPurchase: async () => true};
  throw new Error(name);
});
async function send(status) {
  return route.POST({text: async () => JSON.stringify({...body, status}), headers: new Headers({host: "www.toichakyru.com"}), nextUrl: new URL("https://www.toichakyru.com/api/pay/webhook")});
}
async function main() {
  for (const status of ["success", "SUCCESS", "succeeded", "SUCCEEDED"]) {
    const before = grants;
    assert.equal((await send(status)).status, 200);
    assert.equal(grants, before + 1, `${status} grants paid access`);
  }
  const before = grants;
  await send("pending"); assert.equal(grants, before);
  valid = false;
  assert.equal((await send("success")).status, 401); assert.equal(grants, before);
  console.log("PASS: Finik success variants, pending/unsigned rejected, signed headers/query and tamper protection.");
}
main().catch(error => {console.error(error); process.exitCode = 1;});
