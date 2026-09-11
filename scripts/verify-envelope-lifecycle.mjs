// Unit-test the real intro's event handlers/effects with deterministic hooks and host APIs.
// This exercises cleanup and timing; it is not a substitute for browser animation QA.
import fs from "node:fs";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
const compile = file => ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
const config = { exports: {} };
new Function("exports", compile("lib/envelopes.ts"))(config.exports);

function harness(reduced) {
  const hooks = [], effects = [], timers = new Map(), listeners = new Map();
  let index = 0, now = 0, nextId = 0, tree, focused = "", scrolled = false;
  const root = { style: { overflow: "clip" }, clientWidth: 980 };
  const body = { style: { overflow: "auto", paddingRight: "6px" } };
  const document = { documentElement: root, body, addEventListener: (k, f) => listeners.set(k, f), removeEventListener: (k, f) => { if (listeners.get(k) === f) listeners.delete(k); } };
  const window = { innerWidth: 1000, matchMedia: () => ({ matches: reduced }) };
  const react = {
    useState(initial) { const i = index++; hooks[i] ??= { value: initial }; return [hooks[i].value, v => { hooks[i].value = v; }]; },
    useRef(initial) { const i = index++; hooks[i] ??= { current: initial }; return hooks[i]; },
    useEffect(fn, deps) { const i = index++; const old = hooks[i]; if (!old || deps.some((v, j) => !Object.is(v, old.deps[j]))) effects.push(() => { old?.cleanup?.(); hooks[i] = { deps, cleanup: fn() }; }); },
  };
  const module = { exports: {} };
  new Function("require", "module", "exports", "window", "document", "getComputedStyle", "setTimeout", "clearTimeout", compile("components/EnvelopeIntro.tsx"))(
    id => id === "react" ? react : id.endsWith("/envelopes") ? config.exports : id.endsWith(".css") ? new Proxy({}, { get: (_, k) => k === "__esModule" ? false : k }) : require(id),
    module, module.exports, window, document, el => el.style,
    (fn, delay) => { const id = ++nextId; timers.set(id, { fn, at: now + delay }); return id; }, id => timers.delete(id),
  );
  function nodes(node = tree) {
    if (!node || typeof node !== "object") return [];
    return [node, ...[node.props?.children].flat(Infinity).filter(Boolean).flatMap(n => nodes(n))];
  }
  function render() {
    index = 0;
    tree = module.exports.EnvelopeIntro({ variant: "cream", names: "Айбек & Айгүл", date: "2027-06-20", locale: "ru", children: { type: "existing-invitation", props: {} } });
    for (const node of nodes()) if (node.props?.ref) node.props.ref.current = { focus: () => { focused = node.type; }, scrollIntoView: () => { scrolled = true; } };
    while (effects.length) effects.shift()();
  }
  render();
  return {
    root, body, listeners, timers, render, nodes,
    get focused() { return focused; }, get scrolled() { return scrolled; },
    click() { nodes().find(n => n.type === "button").props.onClick(); },
    advance(ms) { const target = now + ms; for (;;) { const entry = [...timers].sort((a,b) => a[1].at-b[1].at)[0]; if (!entry || entry[1].at > target) break; now = entry[1].at; timers.delete(entry[0]); entry[1].fn(); render(); } now = target; },
    unmount() { hooks.forEach(h => h?.cleanup?.()); },
  };
}
for (const reduced of [false, true]) {
  const h = harness(reduced);
  assert.equal(h.body.style.overflow, "hidden");
  assert.equal(h.body.style.paddingRight, "26px");
  assert.equal(h.focused, "button");
  assert.ok(!h.nodes().some(n => n.type === "existing-invitation"));
  let prevented = false;
  h.listeners.get("keydown")({ key: "Tab", preventDefault: () => { prevented = true; } });
  assert.ok(prevented);
  h.click(); h.click(); h.render();
  assert.equal(h.timers.size, 2, "double click must not restart animation");
  assert.equal(h.nodes().find(n => n.type === "button").props["aria-disabled"], true);
  h.advance(reduced ? 40 : 1650);
  assert.ok(h.nodes().some(n => n.type === "existing-invitation"));
  assert.equal(h.nodes().find(n => n.props?.inert !== undefined).props.inert, true);
  h.advance(reduced ? 140 : 750);
  assert.ok(!h.nodes().some(n => n.props?.["data-envelope-intro"]));
  assert.equal(h.nodes().find(n => n.props?.inert !== undefined).props.inert, false);
  assert.equal(h.root.style.overflow, "clip");
  assert.equal(h.body.style.overflow, "auto");
  assert.equal(h.body.style.paddingRight, "6px");
  assert.equal(h.listeners.size, 0);
  assert.equal(h.focused, "div"); assert.ok(h.scrolled);
  h.render();
  assert.ok(!h.nodes().some(n => n.props?.["data-envelope-intro"]), "ordinary rerender reopened envelope");
  h.unmount();
  const interrupted = harness(reduced);
  interrupted.click(); interrupted.render(); interrupted.unmount();
  assert.equal(interrupted.timers.size, 0);
  assert.equal(interrupted.listeners.size, 0);
  assert.equal(interrupted.body.style.overflow, "auto");
}
console.log("PASS: normal/reduced opening, double-click guard, child reveal, inert removal, focus, scroll restoration, rerender persistence and unmount cleanup.");
