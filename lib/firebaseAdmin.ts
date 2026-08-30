import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { mergeSettings, settingsFromEnv, type PublicPricing } from "./settings";
import { templates as seedTemplates } from "./templates";
import type { PlanId, SiteSettings } from "./types";

function credentials() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
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

export async function uidFromBearer(header: string | null) {
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const app = adminApp();
  if (!app) return null;
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    return decoded.uid;
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
  return { proPriceSom: settings.proPriceSom, proPriceTenge: settings.proPriceTenge };
}

export async function templatePriceSom(templateId: string): Promise<number | null> {
  const app = adminApp();
  if (app) {
    try {
      const snap = await getFirestore(app).collection("catalog").doc("templates").get();
      const items = snap.data()?.items as { id?: string; priceSom?: number }[] | undefined;
      const found = items?.find((item) => item.id === templateId);
      if (found && typeof found.priceSom === "number") return found.priceSom;
    } catch {
      /* fall through to seed */
    }
  }
  return seedTemplates.find((item) => item.id === templateId)?.priceSom ?? null;
}

export async function savePayment(input: {
  paymentId: string;
  uid: string;
  plan: Exclude<PlanId, "free">;
  amount: number;
  templateId?: string;
}) {
  const app = adminApp();
  if (!app) return;
  await getFirestore(app)
    .collection("payments")
    .doc(input.paymentId)
    .set(
      {
        uid: input.uid,
        plan: input.plan,
        amount: input.amount,
        templateId: input.templateId ?? null,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    );
}

export async function fulfillPayment(input: {
  paymentId: string;
  amount: number;
  uid?: string;
  plan?: string;
  templateId?: string;
}) {
  const app = adminApp();
  if (!app) return false;
  const db = getFirestore(app);
  const ref = db.collection("payments").doc(input.paymentId);
  const snap = await ref.get();
  const data = snap.exists
    ? (snap.data() as {
        uid?: string;
        plan?: PlanId;
        amount?: number;
        status?: string;
        templateId?: string;
      })
    : {};
  if (data.status === "succeeded") return true;
  const uid = data.uid || input.uid;
  const plan = data.plan || input.plan;
  const templateId = data.templateId || input.templateId;
  if (!uid || (plan !== "standard" && plan !== "pro" && plan !== "unlimited")) return false;
  if (typeof data.amount === "number" && data.amount !== input.amount) return false;
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const currentPlan = userSnap.data()?.plan;
  const keepPro = currentPlan === "pro" || currentPlan === "unlimited";
  if (plan === "pro" || plan === "unlimited") {
    await userRef.set({ plan: "pro", updatedAt: new Date().toISOString() }, { merge: true });
  } else {
    const patch: Record<string, unknown> = {
      plan: keepPro ? currentPlan : "standard",
      updatedAt: new Date().toISOString(),
    };
    if (templateId) patch.templates = FieldValue.arrayUnion(templateId);
    await userRef.set(patch, { merge: true });
  }
  await ref.set(
    {
      uid,
      plan,
      amount: input.amount,
      templateId: templateId ?? null,
      status: "succeeded",
      paidAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return true;
}
