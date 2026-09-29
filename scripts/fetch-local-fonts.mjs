import { mkdir, writeFile } from "node:fs/promises";

const families = ["manrope", "cormorantgaramond", "greatvibes", "marckscript", "playfairdisplay", "unbounded", "caveat", "philosopher"];
for (const family of families) {
  const response = await fetch(`https://api.github.com/repos/google/fonts/contents/ofl/${family}`);
  if (!response.ok) throw new Error(`${family}: HTTP ${response.status}`);
  const entries = await response.json();
  const directory = new URL(`../app/fonts/${family}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  for (const entry of entries.filter(item => item.name.endsWith(".ttf") || item.name === "OFL.txt")) {
    const asset = await fetch(entry.download_url);
    if (!asset.ok) throw new Error(`${entry.name}: HTTP ${asset.status}`);
    const bytes = new Uint8Array(await asset.arrayBuffer());
    // Avoid bracket characters in paths consumed by build tools.
    const name = entry.name.replaceAll("[", "-").replaceAll("]", "");
    await writeFile(new URL(name, directory), bytes);
    console.log(`${family}/${name}: ${bytes.length} bytes`);
  }
}
