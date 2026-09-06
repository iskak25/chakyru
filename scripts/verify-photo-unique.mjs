import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../lib/templatePhotos.ts", import.meta.url), "utf8");
const paths = [...src.matchAll(/(?:hero|c0|c1|c2|venue): "([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
const seen = new Map();
let dup = 0;
for (const p of paths) {
  seen.set(p, (seen.get(p) || 0) + 1);
}
for (const [p, n] of seen) {
  if (n > 1) {
    dup += 1;
    console.log("DUP", n, p);
  }
}
const reserved = [
  "/images/journal-walk.jpg",
  "/images/journal-rings.jpg",
  "/images/journal-hands.jpg",
  "/images/editorial-couple.jpg",
  "/images/hero-family.jpg",
];
for (const p of reserved) {
  if (seen.has(p)) console.log("LANDING", p);
}
console.log("unique", seen.size, "values", paths.length, "dups", dup);
