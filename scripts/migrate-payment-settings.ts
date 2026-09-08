import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../lib/firebaseAdmin";

async function main() {
  const db = getAdminDb();
  if (!db) throw new Error("firestore");

  const legacyRef = db.collection("catalog").doc("payments");
  const privateRef = db.collection("private_settings").doc("payments");
  const [legacySnap, privateSnap] = await Promise.all([legacyRef.get(), privateRef.get()]);
  const legacy = legacySnap.data() ?? {};

  if (!privateSnap.exists) {
    const apiKey = typeof legacy.finikApiKey === "string" ? legacy.finikApiKey.trim() : "";
    const accountId = typeof legacy.finikAccountId === "string" ? legacy.finikAccountId.trim() : "";
    const privateKey = typeof legacy.finikPrivateKey === "string" ? legacy.finikPrivateKey.trim() : "";
    await privateRef.set({
      provider: "finik",
      enabled: Boolean(apiKey && accountId && privateKey),
      finikApiKey: apiKey,
      finikAccountId: accountId,
      finikPrivateKey: privateKey,
      finikMcc: typeof legacy.finikMcc === "string" && legacy.finikMcc.trim() ? legacy.finikMcc.trim() : "5999",
      finikBeta: typeof legacy.finikBeta === "boolean" ? legacy.finikBeta : false,
      siteUrl: typeof legacy.siteUrl === "string" ? legacy.siteUrl.trim() : "",
      migratedAt: new Date().toISOString(),
    });
  }

  await legacyRef.set({
    provider: "finik",
    enabled: Boolean(legacy.finikApiKey && legacy.finikAccountId && legacy.finikPrivateKey),
    finikMcc: legacy.finikMcc ?? "5999",
    finikBeta: legacy.finikBeta === true,
    siteUrl: legacy.siteUrl ?? "",
    finikApiKey: FieldValue.delete(),
    finikAccountId: FieldValue.delete(),
    finikPrivateKey: FieldValue.delete(),
    migratedAt: new Date().toISOString(),
  }, { merge: true });

  console.log("payment settings migration completed; secrets were not printed");
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "migration failed");
  process.exitCode = 1;
});