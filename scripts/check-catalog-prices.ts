import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function parseServiceAccount(raw: string) {
  let json = raw.trim();
  if ((json.startsWith('"') && json.endsWith('"')) || (json.startsWith("'") && json.endsWith("'"))) {
    json = json.slice(1, -1);
  }
  try {
    return JSON.parse(json) as { project_id?: string; client_email?: string; private_key?: string };
  } catch {
    const repaired = json.replace(/("private_key"\s*:\s*")([\s\S]*?)("\s*,)/, (_m, a: string, pem: string, c: string) => `${a}${pem.replace(/\r?\n/g, "\\n")}${c}`);
    return JSON.parse(repaired) as { project_id?: string; client_email?: string; private_key?: string };
  }
}

function adminApp() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT not set");
  const parsed = parseServiceAccount(json);
  if (!parsed.client_email || !parsed.private_key) throw new Error("invalid service account");
  const existing = getApps()[0];
  if (existing) return existing;
  return initializeApp({
    credential: cert({ projectId: parsed.project_id, clientEmail: parsed.client_email, privateKey: parsed.private_key.replace(/\\n/g, "\n") }),
  });
}

async function main() {
  const db = getFirestore(adminApp());
  const snap = await db.collection("catalog").doc("templates").get();
  const data = snap.data();
  const items = Array.isArray(data?.items) ? data.items : [];
  console.log(`catalog/templates exists: ${snap.exists}, items: ${items.length}`);
  for (const item of items) {
    console.log(`${item.id}\t${item.format}\t${item.priceSom}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
