import { mkdir, copyFile, access } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "public", "images", "templates");
const assets = path.join(
  process.env.USERPROFILE,
  ".cursor/projects/c-Users-user-Desktop-iskak-chakyru/assets",
);

function u(id, w = 1400) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=78`;
}

const IDS = [
  "1520854222738-8aa737734857",
  "1511285560929-80b456fea0bc",
  "1519222970732-b99d5942b814",
  "1464366400600-7168b8af9bc3",
  "1470337458703-46ad1756a187",
  "1522673603778-01154b12dc65",
  "1511795409834-ef04bbd61622",
  "1460978812367-008d00923947",
  "1529636799510-06499d5f0530",
  "1520853102144-b3568c1b1d4e",
  "1529636127566-e1670c99917d",
  "1583932658273-0e6b2da0d5c4",
  "1591604466107-24460616142d",
  "1606800054854-16c90d4065d4",
  "1527523053412-d478443c717c",
  "1507504031003-b417219a0fde",
  "1478144592103-25e218a048ae",
  "1522335789203-aabd1fc54bc9",
  "1519741347686-c6e0d4c979ed",
  "1515935125871-8dd16c647734",
  "1525772768240-dadbfd199ded",
  "1519167758481-83f550bb49b3",
  "1487412720507-e7ab37603c6f",
  "1515377905703-c4788e51af15",
  "1487070185485-d4841f2e0ade",
  "1469334031218-e382a71b716b",
  "1490481651871-ab68de25d43d",
  "1483985988106-e6ba5b6c9360",
  "1441986300917-64674bd600d8",
  "1497366811353-6870744d04b2",
  "1497366216548-37526070297c",
  "1441974231531-c6227db76b6e",
  "1469474968028-56623f02e42e",
  "1500534314209-a25ddb2bd429",
  "1470071459604-3b5ec3a7fe05",
  "1500530855697-b586d89ba3ee",
  "1499793983690-e43ec05a36a2",
  "1506905925346-21bda4d32df4",
  "1476514525535-07fb3b4ae5f1",
  "1544070078-65521209384d",
  "1522770179533-24471fcdba45",
  "1478146896981-b80fe302ae51",
  "1450101499163-c8848c16fd9b",
  "1455390582262-044cdead277a",
  "1481627834876-b7833e8f5570",
  "1487957950049-72d14d316b30",
  "1511818966892-27b285119ffc",
  "1500382017468-9049fed747ef",
  "1464822759023-fed622ff2c3b",
  "1472214103451-9374bd1c798e",
  "1500534623283-312aade485b7",
  "1493663284031-b7e3aefcae8e",
  "1494438639946-1ebd1d20bf85",
  "1493809842364-78817add7ec9",
  "1484101403633-562f891dc89a",
  "1480714164711-9ea9a33459c0",
  "1449824913935-59a10b8d2000",
  "1477959855646-fe6ace7f5e45",
  "1464146072230-91cabc968626",
  "1529156069898-49953e39b3ac",
  "1511632765486-a01980e36a8d",
  "1490750967868-88aa494afa31",
  "1462275646964-a0e3386b89fa",
  "1501004316040-22b90dfe9ae6",
  "1426604966848-d7adac402bff",
  "1495239410110-4b0c7c446cfa",
  "1511895303733-436fd437f36a",
  "1476703993594-c2e829d29c0c",
  "1516627145497-ae6968895b74",
  "1542816492-760c64304950",
  "1532375810709-75b1da00537c",
  "1555939596-39ad7af8686e",
  "1566073771259-6a8506099945",
  "1492684223066-81342ee5ff30",
  "1514525253161-7a46d19cd819",
  "1510812431401-41d2bd2722f3",
  "1516450360452-9312f5e86fc7",
  "1459749411177-0475448c0f8e",
  "1481833761820-0509d32182b1",
  "1494959764139-4feef559f12b",
  "1521572267360-ee0c2909d518",
  "1438761681033-6461ffad8d80",
  "1487412947147-5dcae20335ad",
  "1519741497674-611481863552",
  "1515934751635-c81c6bc9a2d8",
  "1465495976277-4387d4b0b4c6",
  "1519223423752-8c20e5b5126e",
  "1520853382838-3ad3362dcb80",
  "1515931751293-4aa80aa80f36",
  "1523438885200-e635ba2c371e",
  "1542314831-068cd1dbfeeb",
  "1551882547-ff40c63fe5fa",
  "1564501049412-61c2a3083791",
  "1582719478250-c89cae4dc85b",
  "1522708323590-d24dbb6b0267",
  "1520256862855-398228c41684",
  "1504674900247-0877df9cc836",
  "1551218372-a8789b81b253",
  "1418065460487-3d4849604448",
  "1506377247377-2a5b3b417ebb",
  "1578985545062-69928b1d9587",
  "1563729784474-d77dbb933a9e",
  "1464349095431-e9afc4cad1d0",
  "1455659817273-f97932aa2254",
  "1507676184212-d3959dd31919",
  "1519741533996-4ded1da341e8",
  "1497366754035-f200968a6e72",
  "1559339352-11d035aa65de",
  "1520250497597-28f1fa3d84e5",
  "1503387762-592deb58ef4e",
  "1517248135467-4c7edcad34c4",
  "1522202173748-6c76ce32766f",
  "1522071820081-009f0129c71c",
  "1556761175-4b46a572b786",
  "1523240795612-9a054b0db644",
  "1540555700478-4be289fbecef",
  "1556912172-45b7abe8b7e1",
  "1556911220-bff31c812dba",
  "1470225620780-dba8ba36b745",
  "1470229722913-7c0e2dbb8d05",
  "1506157786151-b8491531f063",
  "1507525428034-b723cf961d3e",
  "1439066615861-d1b5147d090a",
  "1529626455594-4ff0802cfb7e",
  "1524504387438-271175adcbeb",
  "1515886657613-9f3515b0c78f",
  "1488427946854-0abd04183d32",
  "1494790108377-be9c29b29330",
  "1500648767791-00dcc994a43e",
  "1534528741775-53994a69daeb",
  "1506794778202-cad84cf45f1d",
  "1531746020798-e6953c2ea99d",
  "1517841905240-472988babdf9",
  "1544005313-94ddf0286df2",
  "1539571696357-5a69c17a67c6",
  "1519085360753-af0119f7cbe7",
  "1472099645785-5658abf4ff4e",
  "1554151228-14d9def656e4",
  "1544723795-3fb6469f5b39",
  "1531123897727-8f129e1688ce",
  "1527980965255-d3b416303d12",
  "1507003211169-0a1dd7228f2d",
  "1511671782779-c97d3d27a1d4",
  "1521119989659-a83d5d3b6c4e",
  "1558636508-e29b957dd8f9",
  "1556228578-8d89c5bfff1f",
  "1556228450-efae640c42d0",
  "1560440021-8ee7dbf42ca8",
  "1499951360447-b19be8fe80f5",
  "1481277542390-179a9b0ac3bd",
  "1524752396093-479c34b138dd",
  "1492724441997-5dc865305f07",
  "1486312338219-ce68d2c6f44d",
  "1516321318423-f06f85e504b3",
  "1454165804606-c3d57bc86b40",
  "1460925895917-afdab827c52f",
  "1551288049-bebda4e38f71",
  "1504384308090-10d93ee2ef69",
  "1565299624946-b28f40a0ae38",
  "1567620905292-2d4e4dc10c3d",
  "1473093295043-c28894e443e3",
  "1512621776951-a57141f2eefd",
  "1546069901-ba9599a7e63c",
];

const SLOTS = [
  ["ak-shumkar", ["c0", "c1", "c2", "venue"]],
  ["elegant", ["hero", "c0", "c1", "c2", "venue"]],
  ["tun-almaz", ["hero", "c0", "c1", "c2", "venue"]],
  ["komur", ["hero", "c0", "c1", "c2", "venue"]],
  ["ak-kara", ["hero", "c0", "c1", "c2", "venue"]],
  ["veil-kun", ["hero", "c0", "c1", "c2", "venue"]],
  ["atelier", ["hero", "c0", "c1", "c2", "venue"]],
  ["klassika", ["hero", "c0", "c1", "c2"]],
  ["ak-kyoshok", ["hero", "c0", "c1", "c2"]],
  ["tan-tuman", ["hero", "c0", "c1", "c2"]],
  ["altyn-kun", ["hero", "c0", "c1", "c2"]],
  ["mramor", ["hero", "c0", "c1", "c2"]],
  ["ak-bilet", ["hero", "c0", "c1", "c2"]],
  ["modern-cream", ["hero", "c0", "c1", "c2"]],
  ["zhas-shamal", ["hero", "c0", "c1", "c2"]],
  ["jeek", ["hero", "c0", "c1", "c2"]],
  ["nishan", ["hero", "c0", "c1", "c2"]],
  ["polaroid", ["hero", "c0", "c1"]],
  ["kyz-gulu", ["hero", "c0", "c1", "c2"]],
  ["jipek", ["c0", "c1", "c2"]],
  ["gul-zar", ["hero", "c0", "c1", "c2"]],
  ["romashka", ["hero", "c0", "c1", "c2"]],
  ["shai-gul", ["hero", "c0", "c1", "c2"]],
  ["mak", ["hero", "c0", "c1", "c2"]],
  ["baxmal", ["hero", "c0", "c1", "c2"]],
  ["salt", ["hero", "c0", "c1", "c2"]],
  ["altin-jildiz", ["hero", "c0", "c1", "c2"]],
  ["ramadan-nur", ["hero", "c0", "c1", "c2"]],
  ["kok-too", ["hero", "c0", "c1", "c2"]],
  ["toi-kyzyl", ["hero", "c0", "c1", "c2"]],
  ["beshik-jyluu", ["hero", "c0", "c1", "c2"]],
  ["shyrdak", ["hero", "c0", "c1", "c2"]],
  ["zhai-tokoi", ["hero", "c0", "c1", "c2"]],
  ["ivory", ["c1", "c2"]],
  ["mauve", ["c0", "c1", "c2"]],
  ["beshik-nur", ["hero"]],
  ["balalyk", ["hero"]],
  ["ak-jooluk", ["hero"]],
  ["minimal-white", ["hero"]],
  ["kyz-uzatuu-photo", ["hero"]],
  ["zhuzum", ["hero", "c0", "c1"]],
  ["rosa", ["hero", "c0", "c1"]],
  ["midnight", ["hero", "c0"]],
  ["ala-too", ["hero", "c0", "c1"]],
  ["jubilee-gold", ["hero", "c0", "c1"]],
  ["iftar-table", ["hero", "c0", "c1"]],
];

const needed = SLOTS.reduce((n, [, slots]) => n + slots.length, 0);
if (needed > IDS.length) {
  console.error(`need ${needed} ids, have ${IDS.length}`);
  process.exit(1);
}
if (new Set(IDS).size !== IDS.length) {
  console.error("duplicate unsplash ids");
  process.exit(1);
}

const locals = [
  ["jipek", "hero", "aecaab65bd5d5b3a76d4802260ac73f7-fb2794e6-bb97-4259-9d77-ba29d0cef93d.jpg"],
  ["mauve", "hero", "f5ccfa9943f99299916365e3d67bd159-59fe23ed-1a39-4352-8ed5-3ccdceab70f7.jpg"],
  ["ivory", "hero", "ac1d1ac986e4071fcd9c771becbd5834-c1429395-b3bb-4f4f-9787-acef822e0afb.jpg"],
  ["ivory", "c0", "7339692291b1485b9ace46a0b48bcfcf-6fac7dbe-7cd8-4c73-811b-70c9d2ecc976.jpg"],
];

function destOf(id, slot) {
  return path.join(out, id, `${slot}.jpg`);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !res.body) throw new Error(`${res.status}`);
  const type = res.headers.get("content-type") || "";
  if (!type.includes("image")) throw new Error(type || "not-image");
  await pipeline(res.body, createWriteStream(dest));
}

for (const [id] of SLOTS) await mkdir(path.join(out, id), { recursive: true });
for (const [id] of locals) await mkdir(path.join(out, id), { recursive: true });

for (const [id, slot, name] of locals) {
  const matches = (await import("node:fs/promises")).readdir(assets);
  const files = await matches;
  const file = files.find((f) => f.includes(name.replace(".jpg", "")));
  if (!file) throw new Error(`missing local ${name}`);
  await copyFile(path.join(assets, file), destOf(id, slot));
  console.log("local", id, slot);
}

let i = 0;
let ok = 0;
let fail = 0;
for (const [id, slots] of SLOTS) {
  for (const slot of slots) {
    const dest = destOf(id, slot);
    const photoId = IDS[i++];
    if (await exists(dest)) {
      ok += 1;
      continue;
    }
    try {
      await download(u(photoId, slot === "hero" ? 1600 : 1400), dest);
      ok += 1;
      console.log("ok", id, slot);
    } catch (err) {
      fail += 1;
      console.warn("fail", id, slot, photoId, String(err).slice(0, 80));
    }
  }
}

console.log(`done ok=${ok} fail=${fail} used=${i}`);
