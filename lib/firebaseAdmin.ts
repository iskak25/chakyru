import { cert, getApps, initializeApp } from "firebase-admin/app";
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
  const { confirmOwnedPurchase, findUserPurchase } = await import("./server/purchases");
  const { fetchFinikPaymentStatus } = await import("./finik");
  const settings = await getAdminSettings();
  const cfg = {
    apiKey: settings.finikApiKey,
    accountId: settings.finikAccountId,
    privateKey: settings.finikPrivateKey,
    mcc: settings.finikMcc,
    beta: settings.finikBeta,
  };
  const purchase = await findUserPurchase(uid, { paymentId, templateId });
  const ids = [...new Set([paymentId, purchase?.finikPaymentId, purchase?.id].filter((value): value is string => Boolean(value)))];
  let finikStatus: string | undefined;
  for (const id of ids) {
    const finik = await fetchFinikPaymentStatus(id, cfg);
    if (finik?.status) {
      finikStatus = finik.status;
      break;
    }
  }
  return confirmOwnedPurchase(paymentId, uid, {
    templateId,
    finikStatus,
  });
}
