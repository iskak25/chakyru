const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const records = new Map();
const clone = value => structuredClone(value);
const ref = id => ({ id, get: async () => snapshot(id) });
const snapshot = id => ({ exists: records.has(id), data: () => clone(records.get(id)) });
let tail = Promise.resolve();
const db = {
  collection: () => ({ doc: ref }),
  runTransaction(fn) {
    const run = tail.then(() => fn({
      get: r => r.get(),
      set: (r, value) => records.set(r.id, { ...records.get(r.id), ...clone(value) }),
    }));
    tail = run.catch(() => {});
    return run;
  },
};
function load(file, requireMock, fetchMock) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'module', 'exports', 'fetch', code)(name => name.endsWith('/guestSubmission') ? load('lib/guestSubmission.ts', require, fetchMock) : requireMock(name), mod, mod.exports, fetchMock);
  return mod.exports;
}

(async () => {
  const api = load('lib/server/invitations.ts', name => name === '../firebaseAdmin' ? { getAdminDb: () => db } : require(name));
  records.set('invite', { templateId: 'test', ownerUid: 'owner', ownerId: 'google:owner', guests: [], wishes: [] });
  await Promise.all(Array.from({ length: 10 }, (_, i) => api.addInvitationWish({ invitationId: 'invite', name: `Guest ${i}`, text: `Wish ${i}` })));
  assert.equal(records.get('invite').wishes.length, 10);
  await Promise.all(Array.from({ length: 5 }, (_, i) => api.addInvitationRsvp({ invitationId: 'invite', name: `Guest ${i}`, rsvp: 'yes', plusOne: 2, note: 'No nuts' })));
  assert.equal(records.get('invite').guests.length, 5);
  await api.saveInvitationDoc({ invitation: { ...clone(records.get('invite')), id: 'invite', names: 'Updated', guests: [], wishes: [] }, ownerUid: 'owner', ownerId: 'google:owner' });
  assert.equal(records.get('invite').wishes.length, 10);
  assert.equal(records.get('invite').guests.length, 5);
  assert.equal(records.get('invite').guests[0].note, 'No nuts');
  assert.equal(await api.saveInvitationDoc({ invitation: { ...clone(records.get('invite')), id: 'invite' }, ownerUid: 'stranger', ownerId: 'google:stranger' }), false);
  assert.equal(await api.addInvitationWish({ invitationId: 'missing', name: 'Guest', text: 'Hello' }), null);

  let hooks = [], index = 0, success = false, requests = [];
  const { GuestWishForm } = load('components/GuestWishForm.tsx', name => name === 'react' ? { useState(initial) { const i = index++; if (!(i in hooks)) hooks[i] = initial; return [hooks[i], value => { hooks[i] = value; }]; } } : name === './AppDialog' ? { AppDialog: 'dialog' } : name.endsWith('.css') ? { default: {} } : require(name), async (url, options) => { requests.push(JSON.parse(options.body)); return Response.json({ wish: { id: 'saved' } }, { status: success ? 200 : 500 }); });
  function render(id = 'invite') { index = 0; return GuestWishForm({ invitationId: id, locale: 'ru' }); }
  function nodes(tree) { return !tree || typeof tree !== 'object' ? [] : [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)]; }
  let tree = render();
  assert(!nodes(tree).some(n => n.type === 'form'));
  nodes(tree).find(n => n.type === 'button').props.onClick();
  tree = render();
  assert(nodes(tree).some(n => n.type === 'dialog'));
  nodes(tree).find(n => n.type === 'input').props.onChange({ target: { value: ' Guest ' } });
  nodes(tree).find(n => n.type === 'textarea').props.onChange({ target: { value: ' Congratulations ' } });
  nodes(tree).find(n => n.type === 'dialog').props.onClose();
  tree = render();
  assert(!nodes(tree).some(n => n.type === 'form'));
  nodes(tree).find(n => n.type === 'button').props.onClick();
  tree = render();
  assert.equal(nodes(tree).find(n => n.type === 'textarea').props.value, ' Congratulations ');
  await nodes(tree).find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(hooks[1], ' Congratulations ');
  assert.equal(hooks[2], 'error');
  success = true; tree = render();
  await nodes(tree).find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(hooks[2], 'sent'); assert.equal(hooks[1], '');
  assert.deepEqual(requests[1], { name: 'Guest', text: 'Congratulations' });
  tree = render();
  nodes(tree).find(n => n.type === 'dialog').props.onClose();
  assert(!nodes(render()).some(n => n.type === 'form'));
  hooks = ['Guest', 'Preview text', 'idle', true]; tree = render('preview-test');
  await nodes(tree).find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(requests.length, 2);
  const combined = { invitationId: 'invite', name: 'Couple', rsvp: 'yes', plusOne: 3, drinks: 'Tea', wish: 'Best wishes' };
  await api.addInvitationRsvp(combined);
  await api.addInvitationRsvp(combined);
  assert.equal(records.get('invite').guests.find(g => g.name === 'Couple').plusOne, 3);
  assert.equal(records.get('invite').guests.find(g => g.name === 'Couple').drinks, 'Tea');
  assert.equal(records.get('invite').wishes.filter(w => w.name === 'Couple').length, 1);
  console.log('PASS: concurrent guest submissions preserved, stale editor saves safe, owner check, missing invite, wish failure/retry/success, preview does not submit');
})().catch(error => { console.error(error); process.exitCode = 1; });
