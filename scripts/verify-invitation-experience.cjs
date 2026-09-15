const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
function compile(file, requireImpl = require) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "module", "exports", code)(requireImpl, mod, mod.exports);
  return mod.exports;
}
const { startInvitationScroll } = compile("lib/invitationScroll.ts");
function scrollHarness(interval = 16) {
  let current = 0, next, time = 0, paused = false, done = 0, cancelled = false;
  const positions = [];
  const stop = startInvitationScroll({
    position: () => current, limit: () => 90, move: value => { current = value; positions.push(value); },
    paused: () => paused, frame: cb => { next = cb; return 1; }, cancel: () => { cancelled = true; }, done: () => { done++; next = null; },
  });
  return { positions, pause: value => { paused = value; }, stop, get current() { return current; }, get done() { return done; }, get cancelled() { return cancelled; }, tick(delta = interval) { time += delta; const frame = next; next = null; frame?.(time); } };
}
const scroll = scrollHarness();
for (let i = 0; i < 100; i++) scroll.tick();
assert(scroll.current > 28 && scroll.current < 29, "18px/s must remain smooth at 60Hz");
const beforePause = scroll.current;
scroll.pause(true); scroll.tick(60_000);
assert.equal(scroll.current, beforePause, "hidden tab stays still");
scroll.pause(false); scroll.tick(16);
assert(scroll.current - beforePause < 1, "no jump when returning to a hidden tab");
for (let i = 0; i < 400; i++) scroll.tick();
assert.equal(scroll.current, 90); assert.equal(scroll.done, 1);
assert(scroll.positions.every((value, i, all) => i === 0 || value >= all[i - 1]));
const stopped = scrollHarness(); stopped.tick(); stopped.stop(); stopped.tick();
assert(stopped.cancelled); assert.equal(stopped.current, 0);

const music = compile("lib/music.ts");
const events = ["toi", "wedding", "kyz", "beshik", "anniversary", "iftar", "birthday", "bachelorette", "jentek", "tushoo"];
for (const event of events) {
  const track = music.ONLINE_TRACKS.find(track => track.url === music.defaultMusicForEvent(event));
  assert(track.events.includes(event), `appropriate music for ${event}`);
  assert.equal(music.youtubeId(track.url), null);
  assert.equal(music.templateMusicUrl({ format: "site3d", eventTypes: [event], canvas: { musicUrl: music.DEFAULT_MUSIC_URL } }), track.url);
  assert.equal(music.templateMusicUrl({ format: "photo", eventTypes: [event] }), "");
  assert.equal(music.effectiveMusicUrl("https://example.test/custom.mp3", true, event), "https://example.test/custom.mp3");
}
assert.notEqual(music.defaultMusicForEvent("kyz"), music.defaultMusicForEvent("bachelorette"));
assert.equal(music.effectiveMusicUrl(music.DEFAULT_MUSIC_URL, true, "kyz"), music.DEFAULT_MUSIC_URL, "explicit song choice preserved");
assert.equal(music.effectiveMusicUrl("custom.mp3", false), "");
assert.equal(music.effectiveMusicUrl("https://example.test/song.mp3", true), "https://example.test/song.mp3");
assert.equal(music.effectiveMusicUrl("https://www.youtube.com/watch?v=sadyraliev-eki-zhas", true), music.DEFAULT_MUSIC_URL);
assert.equal(music.youtubeId(music.DEFAULT_MUSIC_URL), null, "default song is direct audio");
assert.equal(music.effectiveMusicUrl("https://www.youtube.com/watch?v=FM3LfQ_urxQ"), music.DEFAULT_MUSIC_URL, "old song link uses direct audio too");
let cursor = 0, hooks = [], effects = [];
let youtubeAPI;
const react = {
  useRef(initial) { const i = cursor++; return hooks[i] ||= { current: initial }; },
  useState(initial) { const i = cursor++; if (!(i in hooks)) hooks[i] = initial; return [hooks[i], value => { hooks[i] = typeof value === "function" ? value(hooks[i]) : value; }]; },
  useEffect(fn) { effects.push(fn); }, useCallback: fn => fn,
};
const { InvitationExperience } = compile("components/InvitationExperience.tsx", name => {
  if (name === "react") return react;
  if (name === "react/jsx-runtime") return require(name);
  if (name.endsWith("/music")) return music;
  if (name.endsWith("/invitationScroll")) return { startInvitationScroll };
  if (name.endsWith("/youtubePlayer")) return { loadYoutubePlayer: async () => youtubeAPI };
  if (name === "./EnvelopeIntro") return { EnvelopeIntro: "envelope" };
  if (name.endsWith(".module.css")) return { default: {} };
  return new Proxy({}, { get: (_, key) => String(key) });
});
global.window = { matchMedia: () => ({ matches: false }) };
const nodes = node => !node || typeof node !== "object" ? [] : [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)];
let plays = 0, pauses = 0;
function render(enabled = true) {
  cursor = 0;
  return nodes(InvitationExperience({ invitation: { names: "A", date: "2026-10-24", music: enabled, musicUrl: "https://example.test/song.mp3" }, locale: "ru", intro: true, variant: "cream", children: "invitation" }));
}
let tree = render();
const audio = tree.find(node => node.type === "audio");
audio.props.ref.current = { play: () => { plays++; return Promise.resolve(); }, pause: () => { pauses++; } };
assert.equal(plays, 0, "no music before opening");
tree.find(node => node.type === "envelope").props.onOpen();
assert.equal(plays, 1, "play() must be called synchronously in the opening gesture");
audio.props.onPlaying();
tree.find(node => node.type === "envelope").props.onOpened();
tree = render();
const mute = tree.find(node => node.props?.["aria-label"] === "Выключить музыку");
assert(mute); mute.props.onClick(); assert.equal(pauses, 1);
tree = render(); assert(tree.find(node => node.props?.["aria-label"] === "Включить музыку"));
tree.find(node => node.props?.["aria-label"] === "Остановить прокрутку").props.onClick();
assert(render().find(node => node.props?.["aria-label"] === "Продолжить прокрутку"));
hooks = []; assert(!render(false).some(node => node.type === "audio"));
async function verifyYoutubeReadiness() {
  hooks = []; effects = []; cursor = 0;
  let events, youtubePlays = 0, destroys = 0;
  // The real API initially returns an instance without playback methods.
  youtubeAPI = { Player: class {
    constructor(_mount, options) { events = options.events; }
    destroy() { destroys++; }
  } };
  global.document = { createElement: () => ({}) };
  global.window.location = { origin: "https://example.test" };
  const renderYoutube = () => {
    cursor = 0;
    return nodes(InvitationExperience({ invitation: { music: true, musicUrl: "https://www.youtube.com/watch?v=testVideo01" }, locale: "ru", intro: true, variant: "cream", children: "invitation" }));
  };
  const youtubeTree = renderYoutube();
  youtubeTree.find(node => node.props?.style?.visibility === "hidden").props.ref.current = { appendChild() {}, replaceChildren() {} };
  const cleanup = effects[1]();
  await Promise.resolve();
  assert(events, "player constructed but not ready");
  assert.doesNotThrow(() => youtubeTree.find(node => node.type === "envelope").props.onOpen());
  assert.equal(youtubePlays, 0);
  const readyPlayer = { playVideo() { youtubePlays++; }, pauseVideo() {} };
  events.onReady({ target: readyPlayer });
  assert.equal(youtubePlays, 1, "queued opening plays after onReady");
  cleanup();
  events.onReady({ target: readyPlayer });
  assert.equal(youtubePlays, 1, "late ready callback ignored after cleanup");
  assert.equal(destroys, 1);
  delete global.document;
  delete global.window;
}
verifyYoutubeReadiness().then(() => console.log("PASS: audio opening and controls; scrolling; YouTube opening before readiness queues playback and cleans up safely.")).catch(error => { console.error(error); process.exitCode = 1; });
