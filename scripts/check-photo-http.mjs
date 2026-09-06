const pages = [
  "/templates/ak-shumkar",
  "/templates/elegant",
  "/templates/klassika",
  "/templates/modern-cream",
  "/templates/kyz-gulu",
  "/templates/ivory",
  "/templates/mauve",
  "/templates/salt",
  "/templates/minimal-white",
  "/templates/rosa",
  "/templates",
];

const images = [
  "/images/templates/ak-shumkar/hero.jpg",
  "/images/templates/kyz-gulu/hero.jpg",
  "/images/templates/ivory/hero.jpg",
  "/images/templates/mauve/hero.jpg",
  "/images/templates/rosa/hero.jpg",
  "/images/templates/minimal-white/hero.jpg",
  "/images/journal-walk.jpg",
  "/images/editorial-couple.jpg",
];

let fail = 0;
for (const p of [...pages, ...images]) {
  const res = await fetch(`http://localhost:3000${p}`, { redirect: "manual" });
  const ok = res.status >= 200 && res.status < 400;
  if (!ok) {
    fail += 1;
    console.log("FAIL", res.status, p);
  } else {
    console.log("ok", res.status, p);
  }
}
if (fail) process.exit(1);
