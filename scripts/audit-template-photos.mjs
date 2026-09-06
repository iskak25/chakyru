import { readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const src = readFileSync(new URL("../lib/templatePhotos.ts", import.meta.url), "utf8");
const paths = [...src.matchAll(/(?:hero|c0|c1|c2|venue): "([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
const reserved = [
  "/images/journal-walk.jpg",
  "/images/journal-rings.jpg",
  "/images/journal-hands.jpg",
  "/images/editorial-couple.jpg",
  "/images/hero-family.jpg",
];
const seen = new Map();
let bad = 0;

function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const mk = buf[i + 1];
    if (mk === 0xc0 || mk === 0xc1 || mk === 0xc2) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    if (mk === 0xd8 || mk === 0xd9 || (mk >= 0xd0 && mk <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) break;
    i += 2 + len;
  }
  return null;
}

for (const p of paths) {
  seen.set(p, (seen.get(p) || 0) + 1);
  if (reserved.includes(p)) {
    console.log("LANDING", p);
    bad += 1;
  }
  const abs = path.join("public", p.replace(/^\//, ""));
  if (!existsSync(abs)) {
    console.log("MISS", p);
    bad += 1;
    continue;
  }
  const st = statSync(abs);
  const dim = jpegSize(readFileSync(abs));
  const slot = p.split("/").pop().replace(".jpg", "");
  const min = slot === "hero" ? 1100 : 800;
  if (dim && dim.w < min && dim.h < min) {
    console.log("SMALL", `${dim.w}x${dim.h}`, `${Math.round(st.size / 1024)}kb`, p);
  }
  const own = p.match(/^\/images\/templates\/([^/]+)\/([^/.]+)\.jpg$/);
  if (!own) console.log("NOT-OWN", p);
}

const dups = [...seen].filter(([, n]) => n > 1);
console.log("assigned", paths.length, "unique", seen.size, "dups", dups.length, "bad", bad);
if (dups.length) console.log(dups);
