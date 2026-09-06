import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pub = path.join(root, "public", "images");
const reserved = new Set([
  "/images/journal-walk.jpg",
  "/images/journal-rings.jpg",
  "/images/journal-hands.jpg",
  "/images/editorial-couple.jpg",
  "/images/hero-family.jpg",
]);

const site3d = [
  "ak-shumkar",
  "elegant",
  "tun-almaz",
  "komur",
  "ak-kara",
  "veil-kun",
  "atelier",
  "klassika",
  "ak-kyoshok",
  "tan-tuman",
  "altyn-kun",
  "mramor",
  "ak-bilet",
  "modern-cream",
  "zhas-shamal",
  "jeek",
  "nishan",
  "polaroid",
  "kyz-gulu",
  "jipek",
  "gul-zar",
  "romashka",
  "shai-gul",
  "mak",
  "baxmal",
  "salt",
  "altin-jildiz",
  "ramadan-nur",
  "kok-too",
  "toi-kyzyl",
  "beshik-jyluu",
  "shyrdak",
  "zhai-tokoi",
  "ivory",
  "mauve",
];
const luxury = new Set(["ak-shumkar", "elegant", "tun-almaz", "komur", "ak-kara", "veil-kun", "atelier"]);
const photo = ["beshik-nur", "balalyk", "ak-jooluk", "shumkar-photo", "minimal-white", "kyz-uzatuu-photo"];
const video = ["zhuzum", "rosa", "midnight", "ala-too", "jubilee-gold", "iftar-table"];

function relOf(abs) {
  return "/" + path.relative(path.join(root, "public"), abs).replaceAll("\\", "/");
}

function collect(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) collect(abs, acc);
    else if (st.size > 2000 && /\.(jpe?g|webp|png)$/i.test(name)) acc.push(relOf(abs));
  }
  return acc;
}

const pool = collect(pub).filter((rel) => !reserved.has(rel));
const used = new Set();
const assigned = {};

function take(rel) {
  if (!rel || used.has(rel) || !pool.includes(rel)) return "";
  used.add(rel);
  return rel;
}

function prefer(id, slot) {
  if (id === "ak-shumkar" && slot === "hero") return take("/images/hero-toi.jpg");
  if (id === "shumkar-photo" && slot === "hero") return take("/images/collage-1.jpg");
  if (id === "polaroid" && slot === "c2") return take("/images/collage-2.jpg");
  if (id === "midnight" && slot === "c1") return take("/images/collage-3.jpg");
  if (id === "ivory" && slot === "venue") return take("/images/venue-table.jpg");
  return take(`/images/templates/${id}/${slot}.jpg`);
}

function leftovers() {
  return pool.filter((rel) => !used.has(rel));
}

function fill(id, slots) {
  assigned[id] = {};
  for (const slot of slots) assigned[id][slot] = prefer(id, slot);
  for (const slot of slots) {
    if (assigned[id][slot]) continue;
    const next = leftovers()[0];
    assigned[id][slot] = take(next);
  }
}

for (const id of site3d) {
  const slots = luxury.has(id) ? ["hero", "c0", "c1", "venue"] : ["hero", "c0", "c1"];
  fill(id, slots);
}
for (const id of photo) fill(id, ["hero"]);
for (const id of video) fill(id, ["hero", "c0", "c1"]);
for (const id of site3d) {
  const next = leftovers()[0];
  assigned[id].c2 = take(next);
}

const missing = [];
for (const [id, slots] of Object.entries(assigned)) {
  for (const [slot, rel] of Object.entries(slots)) {
    if (!rel) missing.push(`${id} ${slot}`);
  }
}

const lines = [
  `export type TemplatePhotoSet = {`,
  `  hero: string;`,
  `  c0: string;`,
  `  c1: string;`,
  `  c2: string;`,
  `  venue: string;`,
  `};`,
  ``,
  `const SETS: Record<string, TemplatePhotoSet> = {`,
];

for (const [id, slots] of Object.entries(assigned)) {
  const hero = slots.hero || "";
  const c0 = slots.c0 || "";
  const c1 = slots.c1 || "";
  const c2 = slots.c2 || "";
  const venue = slots.venue || "";
  lines.push(
    `  ${JSON.stringify(id)}: { hero: ${JSON.stringify(hero)}, c0: ${JSON.stringify(c0)}, c1: ${JSON.stringify(c1)}, c2: ${JSON.stringify(c2)}, venue: ${JSON.stringify(venue)} },`,
  );
}
lines.push(`};`, ``);
lines.push(`export function getTemplatePhotos(templateId: string): TemplatePhotoSet {`);
lines.push(`  return SETS[templateId] ?? SETS.klassika!;`);
lines.push(`}`, ``);
lines.push(`export function allTemplatePhotoSets() {`);
lines.push(`  return SETS;`);
lines.push(`}`, ``);

writeFileSync(path.join(root, "lib", "templatePhotos.ts"), lines.join("\n"));
console.log("assigned templates", Object.keys(assigned).length);
console.log("used files", used.size);
console.log("leftover", leftovers().length);
console.log("missing", missing.join(", ") || "none");
