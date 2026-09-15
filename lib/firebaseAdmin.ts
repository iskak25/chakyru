import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { mergeSettings, type PublicPricing } from "./settings";
import type { PlanId } from "./types";
import { getPaymentSettings, type PaymentSettings } from "./server/paymentSettings";
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

export async function getAdminAuth() {
  const app = adminApp();
  if (!app) return null;
  // Lazy import: loading "firebase-admin/auth" at module top-level pulls in
  // jwks-rsa -> jose's ESM build, which fails under Vercel/Turbopack
  // (ERR_REQUIRE_ESM) and was breaking every route that merely imports this
  // file (pay/me/sync/access), not just the admin routes that need auth.
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth(app);
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

export async function getAdminSettings(): Promise<PaymentSettings & { proPriceSom: number }> {
  const payment = await getPaymentSettings();
  const pricing = await publicProPricing();
  return { ...payment, proPriceSom: pricing.proPriceSom };
}

export async function publicProPricing(): Promise<PublicPricing> {
  const app = adminApp();
  if (!app) return { proPriceSom: 1990 };
  try {
    const snap = await getFirestore(app).collection("catalog").doc("pricing").get();
    return { proPriceSom: mergeSettings(snap.data()).proPriceSom };
  } catch {
    return { proPriceSom: 1990 };
  }
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

export async function confirmReturnPayment(
  paymentId: string,
  uid: string,
  templateId?: string,
) {
  // Finik has no payment-status-by-id endpoint (webhook is the sole source
  // of truth — see lib/finik.ts), so this just reflects whatever the webhook
  // has already written to the purchase record.
  const { confirmOwnedPurchase } = await import("./server/purchases");
  return confirmOwnedPurchase(paymentId, uid, { templateId });
}

export function getAdminStorageBucket() {
  const app = adminApp();
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  return app && bucket ? getStorage(app).bucket(bucket) : null;
}
