import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import ts from "typescript";

// Package reviewed ImageGen artwork into individual web assets. No upscaling.
// Input is a local manifest of generated paths and visually checked cell bounds.
const input = JSON.parse(await fs.readFile(process.argv[2] || "tmp/restoration-inputs.json", "utf8"));
async function designs(file, name) {
  const code = ts.transpileModule(await fs.readFile(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function("module", "exports", code)(module, module.exports);
  return module.exports[name];
}
const references = await designs("lib/referenceWeddings.ts", "referenceWeddings");
const pins = await designs("lib/pinterestTemplates.ts", "pinterestDesigns");
const manifest = {}, report = [];
const output = "public/images/template-restored";
await fs.mkdir(output, { recursive: true });
for (const job of input.jobs) {
  const design = references.find(d => d.id === job.id) || pins.find(d => d.id === `pin-${job.id}` || d.key === job.id);
  if (!design) throw Error(`Missing design: ${job.id}`);
  const meta = await sharp(job.generated).metadata();
  for (let i = 0; i < job.tiles.length; i++) {
    const [slot] = job.tiles[i];
    if (slot === "unused") continue;
    const original = design.photos[slot];
    if (!original) throw Error(`Missing photo: ${job.id}/${slot}`);
    const col = i % job.cols, row = Math.floor(i / job.cols);
    const left = Math.round(col * meta.width / job.cols);
    const top = job.rowBounds?.[row] ?? Math.round(row * meta.height / job.rows);
    const right = Math.round((col + 1) * meta.width / job.cols);
    const bottom = job.rowBounds?.[row + 1] ?? Math.round((row + 1) * meta.height / job.rows);
    const override = slot === "hero" && input.heroOverrides[job.id];
    const file = `${job.id}-${slot}.webp`;
    const pipeline = override ? sharp(override) : sharp(job.generated).extract({ left: left + (job.cols > 1 ? 2 : 0), top: top + (job.rows > 1 ? 2 : 0), width: right - left - (job.cols > 1 ? 4 : 0), height: bottom - top - (job.rows > 1 ? 4 : 0) });
    const info = await pipeline.webp({ quality: 95, effort: 6 }).toFile(path.join(output, file));
    const fit = ["flowers", "flower", "birds", "bow", "chandelier", "envelope", "fashion", "women", "men", "collage"].includes(slot) || (job.id === "tuscany" && ["villa", "landscape"].includes(slot)) || (job.id === "rose" && slot === "footer") || (job.id === "silk" && slot === "bottom") ? "contain" : "cover";
    const key = `${original.source}|${original.x},${original.y},${original.w},${original.h}`;
    manifest[key] = { source: `/images/template-restored/${file}`, width: info.width, height: info.height, fit };
    report.push({ design: job.id, slot, original, ...manifest[key], bytes: info.size });
  }
}
await fs.writeFile("lib/templateRestoredImages.json", JSON.stringify(manifest, null, 2) + "\n");
await fs.writeFile("docs/template-image-restoration.json", JSON.stringify({ tool: "built-in image_gen", note: "Reconstructed imagery, not recovered photographic originals. Exported at native generated resolution without upscaling.", images: report }, null, 2) + "\n");
console.log(`Packaged ${report.length} restored photos and decorations for ${input.jobs.length} designs.`);
