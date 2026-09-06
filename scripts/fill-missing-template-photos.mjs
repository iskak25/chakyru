import { access, mkdir } from "node:fs/promises";
import { createWriteStream, existsSync, statSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pub = path.join(root, "public");

function pack(id, extra = {}) {
  const base = `/images/templates/${id}`;
  const c2 = extra.c2 ?? `${base}/c2.jpg`;
  return {
    hero: extra.hero ?? `${base}/hero.jpg`,
    c0: extra.c0 ?? `${base}/c0.jpg`,
    c1: extra.c1 ?? `${base}/c1.jpg`,
    c2,
    venue: extra.ownVenue ? `${base}/venue.jpg` : extra.venue ?? c2,
  };
}

const SETS = {
  "ak-shumkar": pack("ak-shumkar", { hero: "/images/hero-toi.jpg", ownVenue: true }),
  elegant: pack("elegant", { ownVenue: true }),
  "tun-almaz": pack("tun-almaz", { ownVenue: true }),
  komur: pack("komur", { ownVenue: true }),
  "ak-kara": pack("ak-kara", { ownVenue: true }),
  "veil-kun": pack("veil-kun", { ownVenue: true }),
  atelier: pack("atelier", { ownVenue: true }),
  klassika: pack("klassika"),
  "ak-kyoshok": pack("ak-kyoshok"),
  "tan-tuman": pack("tan-tuman"),
  "altyn-kun": pack("altyn-kun"),
  mramor: pack("mramor"),
  "ak-bilet": pack("ak-bilet"),
  "modern-cream": pack("modern-cream"),
  "zhas-shamal": pack("zhas-shamal"),
  jeek: pack("jeek"),
  nishan: pack("nishan"),
  polaroid: pack("polaroid", { c2: "/images/collage-2.jpg" }),
  "kyz-gulu": pack("kyz-gulu"),
  jipek: pack("jipek"),
  "gul-zar": pack("gul-zar"),
  romashka: pack("romashka"),
  "shai-gul": pack("shai-gul"),
  mak: pack("mak"),
  baxmal: pack("baxmal"),
  salt: pack("salt"),
  "altin-jildiz": pack("altin-jildiz"),
  "ramadan-nur": pack("ramadan-nur"),
  "kok-too": pack("kok-too"),
  "toi-kyzyl": pack("toi-kyzyl"),
  "beshik-jyluu": pack("beshik-jyluu"),
  shyrdak: pack("shyrdak"),
  "zhai-tokoi": pack("zhai-tokoi"),
  ivory: pack("ivory", { venue: "/images/venue-table.jpg" }),
  mauve: pack("mauve"),
  "beshik-nur": pack("beshik-nur"),
  balalyk: pack("balalyk"),
  "ak-jooluk": pack("ak-jooluk"),
  "shumkar-photo": pack("shumkar-photo", { hero: "/images/collage-1.jpg" }),
  "minimal-white": pack("minimal-white"),
  "kyz-uzatuu-photo": pack("kyz-uzatuu-photo"),
  zhuzum: pack("zhuzum"),
  rosa: pack("rosa"),
  midnight: pack("midnight", { c1: "/images/collage-3.jpg" }),
  "ala-too": pack("ala-too"),
  "jubilee-gold": pack("jubilee-gold"),
  "iftar-table": pack("iftar-table"),
};

const PEXELS = [
  1024993, 169198, 265722, 1043902, 1128782, 1444442, 2253844, 2788488, 3014856, 3171837, 3310976, 3337209, 3585798,
  3916019, 4255486, 4783287, 5061666, 587741, 931177, 1024960, 1616113, 1729797, 1779414, 2253870, 2291462, 2486168,
  3014853, 3171823, 888899, 1128318, 1346197, 1395967, 1488315, 1579253, 1666065, 1684187, 1730877, 1813947, 1857157,
  2055389, 2122363, 2174662, 2253842, 2291464, 2306281, 2475751, 256737, 265720, 265721, 2788491, 2959192, 3014854,
  3171816, 3171829, 3310975, 3650469, 3872626, 4033324, 4275885, 4347368, 4498135, 4505456, 4577143, 4783291, 4947554,
  5005252, 5061659, 5273635, 540522, 611328, 724553, 931162, 1024967, 1045541, 1164983, 1244627, 1395964, 1444424,
  1488312, 1545590, 1579256, 1616116, 1666067, 1684185, 1729801, 1779410, 1813945, 1857153, 2122361, 2174656, 2253848,
  2306283, 2475753, 2788485, 2959195, 3014848, 3171831, 3310983, 3337210, 3916017, 4255485, 4783285, 5061660,
];

function okFile(abs) {
  return existsSync(abs) && statSync(abs).size > 2000;
}

const required = [...new Set(Object.values(SETS).flatMap((set) => Object.values(set)))];
const missing = required.filter((rel) => !okFile(path.join(pub, rel.replace(/^\//, ""))));
console.log("required", required.length, "missing", missing.length);

if (missing.length > PEXELS.length) {
  console.error("not enough pexels ids");
  process.exit(1);
}

async function download(url, dest) {
  await mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !res.body) throw new Error(String(res.status));
  await pipeline(res.body, createWriteStream(dest));
}

let i = 0;
let ok = 0;
let fail = 0;
for (const rel of missing) {
  const dest = path.join(pub, rel.replace(/^\//, ""));
  const id = PEXELS[i++];
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;
  try {
    await download(url, dest);
    if (!okFile(dest)) throw new Error("tiny");
    ok += 1;
    console.log("ok", rel, id);
  } catch (err) {
    fail += 1;
    console.warn("fail", rel, id, String(err).slice(0, 80));
  }
}
console.log(`filled ok=${ok} fail=${fail}`);
