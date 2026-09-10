import fs from "node:fs/promises";
import path from "node:path";

const inputs = [
  ["kyz", "C:/Users/user/Desktop/референцы/кыз_узатуу_3d.txt"],
  ["photo", "C:/Users/user/Desktop/референцы/свадибные_jpg.txt"],
];
const folder = "public/images/pinterest-references";
await fs.mkdir(folder, { recursive: true });
const records = [];
for (const [group, file] of inputs) {
  for (const source of (await fs.readFile(file, "utf8")).match(/https:\/\/ru\.pinterest\.com\/pin\/\d+\//g) || []) {
    const id = source.match(/pin\/(\d+)/)[1];
    const response = await fetch(`https://www.pinterest.com/pin/${id}/`);
    if (!response.ok) throw Error(`${id}: HTTP ${response.status}`);
    const html = await response.text();
    function meta(key) {
      const tag = [...html.matchAll(/<meta\b[^>]*>/g)].map(m => m[0]).find(s => s.includes(`property="${key}"`) || s.includes(`name="${key}"`));
      return tag?.match(/content="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&").replaceAll("&quot;", '"') || "";
    }
    const image = meta("og:image");
    if (new URL(image).hostname !== "i.pinimg.com") throw Error("Unexpected image host");
    const asset = await fetch(image);
    if (!asset.ok) throw Error(`${id}: image HTTP ${asset.status}`);
    await fs.writeFile(path.join(folder, `${id}.jpg`), Buffer.from(await asset.arrayBuffer()));
    const record = { id, group, source, image, title: meta("og:title"), video: meta("og:video") };
    records.push(record);
    console.log(JSON.stringify(record));
  }
}
await fs.writeFile(path.join(folder, "sources.json"), JSON.stringify(records, null, 2) + "\n");
