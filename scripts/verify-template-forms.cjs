const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, imports, fetchMock, formData) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', 'fetch', 'FormData', code)(imports, mod, mod.exports, fetchMock, formData);
  return mod.exports;
}
function harness(component, design, id = 'live', editing = false) {
  let index = 0, success = true, hooks = [], requests = [], tree;
  const fetchMock = async (url, options) => { requests.push(JSON.parse(options.body)); return Response.json({ guest: { id: 'saved' } }, { status: success ? 200 : 500 }); };
  const submission = load('lib/guestSubmission.ts', require, fetchMock);
  const imports = name => {
    if (name === 'react') return { useId: () => 'form', useEffect() {}, useState(initial) { const i = index++; if (!(i in hooks)) hooks[i] = initial; return [hooks[i], v => { hooks[i] = v; }]; } };
    if (name === 'react/jsx-runtime') return require(name);
    if (name.endsWith('/guestSubmission')) return submission;
    if (name.endsWith('/store')) return { addRsvp: async (id, name, rsvp, plusOne, details) => submission.guestFetch(`/api/invitations/${id}/rsvp`, { body: JSON.stringify({ name, rsvp, plusOne, ...details }) }) };
    if (name.endsWith('/weddingEditor')) return { safeWeddingLink: v => v, weddingStyle: () => '', weddingProgram: () => [] };
    if (name.endsWith('/defaultVenue')) return { invitationMapUrl: () => '' };
    if (name.endsWith('/inviteTranslations')) return { invitationText: v => v, invitationDateLocale: () => 'ru-RU' };
    if (name.endsWith('/music')) return { effectiveMusicUrl: () => '' };
    return new Proxy({}, { get: (_, key) => key === '__esModule' ? false : String(key) });
  };
  class FormDataMock { constructor(value) { this.value = value; } get(key) { return this.value[key]; } has(key) { return key in this.value; } }
  const mod = load(`components/${component}.tsx`, imports, fetchMock, FormDataMock);
  const inv = { id, templateId: 'test', names: 'Test', date: '2026-10-20', time: '18:00', copy: {}, gallery: {}, blockColors: {}, layout: {}, guests: [], wishes: [], venue: 'Hall', address: '', city: '' };
  const render = () => { index = 0; tree = mod[component]({ invitation: inv, design: { photos: { hero: { source: '/test.webp', w: 100, h: 200 } }, colors: [], format: 'site3d', ...design }, locale: 'ru', startOpen: true, onChange: editing ? () => {} : undefined }); };
  const nodes = (node = tree) => !node || typeof node !== 'object' ? [] : [node, ...[node.props?.children].flat(Infinity).filter(Boolean).flatMap(child => nodes(child))];
  render();
  return { requests, fail() { success = false; }, recover() { success = true; }, async submit(overrides = {}) {
    const form = nodes().find(n => n.type === 'form'); assert(form, `${component}/${design.key || design.id} form exists`);
    const target = { name: ' Guest ', guestName: ' Guest ', attendance: 'yes', guests: '3', note: 'Hello', guestWish: 'Congratulations', ...overrides, setAttribute() {}, removeAttribute() {}, querySelectorAll: () => [], elements: { namedItem: () => null } };
    await form.props.onSubmit({ preventDefault() {}, currentTarget: target }); render();
  } };
}
(async () => {
  global.HTMLTextAreaElement = class {};
  const cases = [
    ['WeddingInvitation', {}],
    ...['rose','silk','calligraphy','mountains','sage','burgundy','tuscany','winter','stars'].map(id => ['ReferenceWedding', { id }]),
    ...['ethno','burgundy','goldBride','pearl','blue'].map(key => ['PinterestInvite', { key }]),
    ...['jentekCradle','tushooGarden'].map(key => ['FamilySiteInvite', { key, eventType: key === 'tushooGarden' ? 'tushoo' : 'jentek' }]),
    ...['silkSite','nikahSite','monoSite','newspaperSite','glam','blushParty'].map(key => ['ThemedSiteInvite', { key }]),
  ];
  for (const [component, design] of cases) {
    const h = harness(component, design); await h.submit(); assert.equal(h.requests.length, 1, `${component} submits`); assert.equal(h.requests[0].name, 'Guest');
    const p = harness(component, design, 'preview-test'); await p.submit(); assert.equal(p.requests.length, 0, `${component} preview isolated`);
    const e = harness(component, design, 'live', true); await e.submit(); assert.equal(e.requests.length, 0, `${component} editor isolated`);
    const retry = harness(component, design); retry.fail(); await retry.submit(); retry.recover(); await retry.submit(); assert.equal(retry.requests.length, 2, `${component} can retry`);
  }
  const sage = harness('ReferenceWedding', { id: 'sage' }); await sage.submit({ attendance: 'maybe', guests: '1' }); assert.equal(sage.requests[0].rsvp, 'yes'); assert.equal(sage.requests[0].plusOne, 1);
  const rose = harness('ReferenceWedding', { id: 'rose' }); await rose.submit(); assert.equal(rose.requests[0].wish, undefined); assert.equal(rose.requests[0].note, undefined);
  console.log(`PASS: ${cases.length} template designs submit, preview/editor isolation, retry; spouse count and congratulations routing`);
})().catch(error => { console.error(error); process.exitCode = 1; });
