import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { mergeSettings, settingsFromEnv, type PublicPricing } from "./settings";
import type { PlanId, SiteSettings } from "./types";
export { uidFromBearer } from "./firebaseToken";

function parseServiceAccount(raw: string) {
  let json = raw.trim();
  if (
    (json.startsWith('"') && json.endsWith('"')) ||
    (json.startsWith("'") && json.endsWith("'"))
  ) {
    json = json.slice(1, -1);
  }
  try {
    return JSON.parse(json) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
  } catch {
    const repaired = json.replace(/("private_key"\s*:\s*")([\s\S]*?)("\s*,)/, (_m, a: string, pem: string, c: string) => {
      return `${a}${pem.replace(/\r?\n/g, "\\n")}${c}`;
    });
    return JSON.parse(repaired) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
  }
}

function credentials() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!json) return null;
  try {
    const parsed = parseServiceAccount(json);
    if (!parsed.client_email || !parsed.private_key) return null;
    return cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    });
  } catch {
    return null;
  }
}

function adminApp() {
  const creds = credentials();
  if (!creds) return null;
  const existing = getApps()[0];
  if (existing) return existing;
  try {
    return initializeApp({ credential: creds });
  } catch {
    return null;
  }
}

export function adminReady() {
  return Boolean(credentials());
}

export function getAdminDb() {
  const app = adminApp();
  return app ? getFirestore(app) : null;
}

export function serviceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!json) return null;
  try {
    const parsed = parseServiceAccount(json);
    if (!parsed.client_email || !parsed.private_key) return null;
    return {
      projectId: parsed.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    };
  } catch {
    return null;
  }
}

export async function getAdminSettings(): Promise<SiteSettings> {
  const env = settingsFromEnv();
  const app = adminApp();
  if (!app) return env;
  try {
    const db = getFirestore(app);
    const [pricing, payments] = await Promise.all([
      db.collection("catalog").doc("pricing").get(),
      db.collection("catalog").doc("payments").get(),
    ]);
    return mergeSettings({ ...(pricing.data() ?? {}), ...(payments.data() ?? {}) });
  } catch {
    return env;
  }
}

export async function publicProPricing(): Promise<PublicPricing> {
  const settings = await getAdminSettings();
  return { proPriceSom: settings.proPriceSom };
}

export async function templatePriceSom(templateId: string): Promise<number | null> {
  const { getCatalogBasePrice } = await import("./server/templates");
  return getCatalogBasePrice(templateId);
}

export async function savePayment(input: {
  paymentId: string;
  uid: string;
  plan: Exclude<PlanId, "free">;
  amount: number;
  templateId?: string;
}) {
  const { createPurchase } = await import("./server/purchases");
  await createPurchase(input);
}

export async function fulfillPayment(input: {
  paymentId: string;
  amount: number;
  uid?: string;
  plan?: string;
  templateId?: string;
  transactionId?: string;
}) {
  const { fulfillPurchase } = await import("./server/purchases");
  return fulfillPurchase(input);
}

export async function confirmReturnPayment(paymentId: string, uid: string) {
  const { confirmOwnedPurchase } = await import("./server/purchases");
  return confirmOwnedPurchase(paymentId, uid);
}
