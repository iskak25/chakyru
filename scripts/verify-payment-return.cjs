const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
function load(file, resolve = require) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "module", "exports", code)(resolve, mod, mod.exports);
  return mod.exports;
}
const { paymentOrigin } = load("lib/paymentOrigin.ts");
const canonical = "https://www.toichakyru.com";
const { checkoutReturn, paymentReturnHref } = load("lib/checkoutReturn.ts");
const pid = "c48258b5-b60c-4ee8-ae35-4d268cdfdf18";
for (const query of [
  `template=baxmal%3FpaymentId%3D${pid}`,
  `template=baxmal?paymentId=${pid}`,
  `pid=${pid}&plan=standard&template=baxmal?paymentId=provider-id`,
  `pid=${pid}&template=baxmal`,
]) assert.deepEqual(checkoutReturn(query), { templateId: "baxmal", paymentId: pid });
assert.equal(paymentReturnHref(pid, "baxmal"), `/pay/return?pid=${pid}&template=baxmal`);
for (const host of ["www.toichakyru.com", "toichakyru.com", "chakyru.vercel.app"]) {
  assert.equal(paymentOrigin(`https://${host}/api/pay`, "https://chakyru.vercel.app"), canonical);
}
assert.equal(paymentOrigin("http://localhost:3000/api/pay"), "http://localhost:3000");
assert.equal(paymentOrigin("https://preview.vercel.app/api/pay", canonical), canonical);
assert.equal(paymentOrigin("https://www.toichakyru.com/api/pay", "https://obsolete.example"), canonical);

async function verifySaveBeforeNavigation(ok, query = "template=wedding") {
  const effects = [], navigation = [], state = [];
  let finishSave, savedInvitation;
  const invitation = { id: "paid-invitation", templateId: "wedding" };
  const { default: Page } = load("app/create/new/page.tsx", name => {
    if (name === "react") return { Suspense: "suspense", useEffect: fn => effects.push(fn), useState: initial => [initial, value => state.push(value)] };
    if (name === "react/jsx-runtime") return require(name);
    if (name === "next/navigation") return { useRouter: () => ({ replace: url => navigation.push(url) }), useSearchParams: () => new URLSearchParams(query) };
    if (name.endsWith("/checkoutReturn")) return { checkoutReturn, paymentReturnHref };
    if (name.endsWith("/accessClient")) return {
      fetchTemplateAccess: async () => ({ allowed: true, accessType: "purchase" }),
      pushInvitationRemote: inv => { savedInvitation = inv; return new Promise(resolve => { finishSave = resolve; }); },
    };
    if (name.endsWith("/auth")) return { canEditTemplate: () => true };
    if (name.endsWith("/payAccess")) return { unlockPaidTemplate() {} };
    if (name.endsWith("/store")) return { getUser: () => ({}), openPaidInvitation: () => ({ invitation, created: true }) };
    if (name.endsWith("/locale")) return { useI18n: () => ({ locale: "ru" }) };
    throw new Error(name);
  });
  const inner = Page().props.children;
  inner.type();
  effects[0]();
  await new Promise(setImmediate);
  if (query.includes("paymentId")) {
    assert.equal(savedInvitation, undefined, "corrupt return must confirm payment before creating any invitation");
    assert.deepEqual(navigation, [paymentReturnHref(pid, "baxmal")]);
    return;
  }
  assert.equal(savedInvitation, invitation);
  assert.deepEqual(navigation, [], "must wait for cloud save");
  finishSave(ok ? { ok: true } : { ok: false, error: "network" });
  await Promise.resolve();
  await Promise.resolve();
  if (ok) assert.deepEqual(navigation, ["/create/paid-invitation?setup=1"]);
  else { assert.deepEqual(navigation, []); assert(state.includes(true), "save failure offers retry, not payment"); }
}
async function run() {
  await verifySaveBeforeNavigation(true);
  await verifySaveBeforeNavigation(false);
  await verifySaveBeforeNavigation(true, `template=baxmal%3FpaymentId%3D${pid}`);
  const { default: config } = load("next.config.ts");
  const redirects = await config.redirects();
  const legacy = redirects.find(item => item.source === "/pay/return");
  assert.equal(legacy.destination, `${canonical}/pay/return`);
  assert.equal(legacy.has[0].value, "chakyru.vercel.app");
  assert(!redirects.some(item => item.source.startsWith("/api")), "webhook host must remain unchanged");
  console.log("PASS: canonical payment origin, legacy return redirect, editor waits for cloud save, retry on failure.");
}
run().catch(error => { console.error(error); process.exitCode = 1; });
