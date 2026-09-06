import { createWriteStream, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pub = path.join(root, "public");
const out = path.join(pub, "images", "templates");

const USED_UNSPLASH = new Set([
  ...readFileSync(path.join(root, "scripts", "fetch-template-photos.mjs"), "utf8").matchAll(/"(\d{10,}-[a-z0-9]+)"/g),
].map((m) => m[1]));

const LANDING_IDS = [
  "1600585154340-be6161a56a0c",
  "1600210492486-724fe5c67fb0",
  "1414235077428-338989a2e8c0",
  "1464226184884-fa280b87c399",
  "1571896349842-33c89424de2d",
  "1512917774080-9991f1c4c750",
];
for (const id of LANDING_IDS) USED_UNSPLASH.add(id);

const LUXURY = ["ak-shumkar", "elegant", "tun-almaz", "komur", "ak-kara", "veil-kun", "atelier"];
const SITE3D = [
  ...LUXURY,
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
const PHOTO = ["beshik-nur", "balalyk", "ak-jooluk", "shumkar-photo", "minimal-white", "kyz-uzatuu-photo"];
const VIDEO = ["zhuzum", "rosa", "midnight", "ala-too", "jubilee-gold", "iftar-table"];

function slotsOf(id) {
  if (LUXURY.includes(id)) return ["hero", "c0", "c1", "c2", "venue"];
  if (SITE3D.includes(id)) return ["hero", "c0", "c1", "c2"];
  if (VIDEO.includes(id)) return ["hero", "c0", "c1"];
  return ["hero"];
}

const COPIES = [
  ["hero-toi.jpg", "ak-shumkar", "hero"],
  ["collage-1.jpg", "komur", "hero"],
  ["collage-2.jpg", "jeek", "hero"],
  ["collage-3.jpg", "jeek", "c0"],
  ["venue-table.jpg", "iftar-table", "hero"],
];

/** Unique Unsplash photos, not used by the previous fetch script or landing. */
const DOWNLOADS = [
  ["jeek", "c2", "1493553495410-b043067b2fc4"],
  ["nishan", "c0", "1533105079780-318b27bbfa30"],
  ["polaroid", "c2", "1524368538948-afd89acfd27c"],
  ["zhas-shamal", "c2", "1447753900614-912cdff7cc72"],
  ["kyz-gulu", "hero", "1606216794074-735e91aa2c92"],
  ["kyz-gulu", "c0", "1478144592103-25e218a04891"],
  ["kyz-gulu", "c1", "1520855955093-34265f956481"],
  ["jipek", "c1", "1487070252559-a2e1bfb86342"],
  ["gul-zar", "c1", "1490750967990-4dd90819e699"],
  ["gul-zar", "c2", "1457087682940-5ca8f9ab5d90"],
  ["romashka", "hero", "1522673607200-8e1b27a2d8c8"],
  ["mak", "c1", "1468327272730-43d7d5cf5858"],
  ["baxmal", "c1", "1519167750440-fb2d4a713c8c"],
  ["baxmal", "c2", "1460364159754-344b6a6b0d4b"],
  ["salt", "hero", "1604014237800-1c9102c219da"],
  ["salt", "c0", "1544078753-3692d3422699"],
  ["altin-jildiz", "hero", "1595475873610-1a0791f0b736"],
  ["altin-jildiz", "c2", "1618772446666-0d4d06d70ed3"],
  ["kok-too", "c2", "1469474968028-56623f02e42e"],
  ["toi-kyzyl", "c1", "1516450360452-9312f5e86fc7"],
  ["beshik-jyluu", "hero", "1503454537195-1c99dcc959c8"],
  ["beshik-jyluu", "c1", "1515488764276-dbfaaa4c98d4"],
  ["shyrdak", "c2", "1540518614836-1bed88cf82de"],
  ["midnight", "c1", "1595476102490-ba529312dae5"],
  ["jubilee-gold", "hero", "1529636798452-aca247b46b90"],
  ["jubilee-gold", "c1", "1587271636175-90d422bb2354"],
  ["zhuzum", "hero", "1423488132837-6ba444fc0890"],
  ["zhuzum", "c0", "1560493676-04071c5f467b"],
  ["rosa", "hero", "1516589178581-6cd175e6c098"],
  ["rosa", "c0", "1507291743334-5850a67e1b18"],
  ["rosa", "c1", "1560963689-76bef157380c"],
  ["ak-jooluk", "hero", "1591604466107-ec97de577aff"],
  ["shumkar-photo", "hero", "1496747611176-843222e1e57c"],
  ["minimal-white", "hero", "1606800052538-6e4cd273d358"],
  ["kyz-uzatuu-photo", "hero", "1591604971936-38aed0ce8035"],
];

const PEXELS_FALLBACK = [
  1024993, 169198, 265722, 1043902, 1128782, 1444442, 2253844, 2788488, 3014856, 3171837, 3310976, 3337209, 3585798,
  3916019, 4255486, 4783287, 5061666, 587741, 931177, 1024960, 1616113, 1729797, 1779414, 2253870, 2291462, 2486168,
  3014853, 3171823, 888899, 1128318, 1346197, 1395967, 1488315, 1579253, 1666065, 1684187, 1730877, 1813947, 1857157,
];

function destOf(id, slot) {
  return path.join(out, id, `${slot}.jpg`);
}

function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) break;
    i += 2 + len;
  }
  return null;
}

function keepExisting(file, slot) {
  if (!existsSync(file)) return false;
  const st = statSync(file);
  if (st.size < 8000) return false;
  const dim = jpegSize(readFileSync(file));
  if (!dim) return st.size > 40000;
  const minW = slot === "hero" ? 1100 : slot === "c2" ? 800 : 900;
  return dim.w >= minW || dim.h >= minW;
}

async function download(url, dest) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ChakyruPhotoBot/1.0)" },
  });
  if (!res.ok || !res.body) throw new Error(String(res.status));
  const type = res.headers.get("content-type") || "";
  if (!type.includes("image")) throw new Error(type || "not-image");
  await pipeline(res.body, createWriteStream(dest));
  if (statSync(dest).size < 12000) throw new Error("tiny");
}

function unsplash(id, slot) {
  const w = slot === "hero" ? 1800 : slot === "c2" ? 1200 : 1400;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=82`;
}

function pexels(id, slot) {
  const w = slot === "hero" ? 1600 : 1200;
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

const ALL = [...SITE3D, ...PHOTO, ...VIDEO];
for (const id of ALL) await mkdir(path.join(out, id), { recursive: true });

for (const [name, id, slot] of COPIES) {
  const dest = destOf(id, slot);
  if (keepExisting(dest, slot)) continue;
  await copyFile(path.join(pub, "images", name), dest);
  console.log("copy", name, "->", id, slot);
}

const taken = new Set(USED_UNSPLASH);
let pexelsI = 0;
let ok = 0;
let fail = 0;

for (const [id, slot, photoId] of DOWNLOADS) {
  const dest = destOf(id, slot);
  if (keepExisting(dest, slot)) {
    ok += 1;
    continue;
  }
  const ids = taken.has(photoId) ? [] : [photoId];
  let done = false;
  for (const uid of ids) {
    try {
      await download(unsplash(uid, slot), dest);
      taken.add(uid);
      ok += 1;
      done = true;
      console.log("unsplash", id, slot, uid);
      break;
    } catch (err) {
      console.warn("unsplash-fail", id, slot, uid, String(err).slice(0, 80));
    }
  }
  while (!done && pexelsI < PEXELS_FALLBACK.length) {
    const pid = PEXELS_FALLBACK[pexelsI++];
    try {
      await download(pexels(pid, slot), dest);
      ok += 1;
      done = true;
      console.log("pexels", id, slot, pid);
    } catch (err) {
      console.warn("pexels-fail", id, slot, pid, String(err).slice(0, 80));
    }
  }
  if (!done) {
    fail += 1;
    console.error("MISS", id, slot);
  }
}

const lines = [
  "export type TemplatePhotoSet = {",
  "  hero: string;",
  "  c0: string;",
  "  c1: string;",
  "  c2: string;",
  "  venue: string;",
  "};",
  "",
  "const SETS: Record<string, TemplatePhotoSet> = {",
];

const seen = new Map();
const miss = [];
for (const id of ALL) {
  const slots = slotsOf(id);
  const set = { hero: "", c0: "", c1: "", c2: "", venue: "" };
  for (const slot of slots) {
    const rel = `/images/templates/${id}/${slot}.jpg`;
    const abs = destOf(id, slot);
    if (!keepExisting(abs, slot) && !(existsSync(abs) && statSync(abs).size > 8000)) {
      miss.push(`${id}/${slot}`);
    }
    if (seen.has(rel)) miss.push(`DUP ${rel}`);
    seen.set(rel, `${id}/${slot}`);
    set[slot] = rel;
  }
  lines.push(
    `  "${id}": { hero: "${set.hero}", c0: "${set.c0}", c1: "${set.c1}", c2: "${set.c2}", venue: "${set.venue}" },`,
  );
}
lines.push("};");
lines.push("");
lines.push("export function getTemplatePhotos(templateId: string): TemplatePhotoSet {");
lines.push("  return SETS[templateId] ?? SETS.klassika!;");
lines.push("}");
lines.push("");
lines.push("export function allTemplatePhotoSets() {");
lines.push("  return SETS;");
lines.push("}");
lines.push("");

writeFileSync(path.join(root, "lib", "templatePhotos.ts"), lines.join("\n"));
console.log(`done ok=${ok} fail=${fail} miss=${miss.length || 0}`);
if (miss.length) console.log(miss.join("\n"));
