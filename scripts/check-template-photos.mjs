import { existsSync, statSync } from "node:fs";
import path from "node:path";

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

const sets = {
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

const pub = path.resolve(import.meta.dirname, "../public");
const miss = [];
const ok = [];
const seen = new Map();

for (const [id, set] of Object.entries(sets)) {
  for (const [slot, rel] of Object.entries(set)) {
    const abs = path.join(pub, rel.replace(/^\//, ""));
    const good = existsSync(abs) && statSync(abs).size > 2000;
    if (seen.has(rel) && seen.get(rel) !== `${id}/${slot}`) {
      miss.push(`DUP ${rel} ${seen.get(rel)} ${id}/${slot}`);
    } else {
      seen.set(rel, `${id}/${slot}`);
    }
    if (!good) miss.push(`MISS ${id} ${slot} ${rel}`);
    else ok.push(`${id} ${slot}`);
  }
}

console.log("ok", ok.length);
console.log(miss.join("\n") || "none missing");
