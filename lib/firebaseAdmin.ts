import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { mergeSettings, settingsFromEnv, type PublicPricing } from "./settings";
import { templates as seedTemplates } from "./templates";
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
  try {
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
  } catch {
    /* Finik can still open; webhook fulfill needs Admin later */
  }
}

function pickText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
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
  const paymentId = pickText(input.paymentId);
  if (!paymentId) return false;
  const ref = db.collection("payments").doc(paymentId);
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
  const uid = pickText(data.uid, input.uid);
  const plan = pickText(data.plan, input.plan);
  const templateId = pickText(data.templateId, input.templateId) || undefined;
  if (!uid || (plan !== "standard" && plan !== "pro" && plan !== "unlimited")) return false;
  const storedAmount = typeof data.amount === "number" ? data.amount : undefined;
  if (
    data.status !== "succeeded" &&
    typeof storedAmount === "number" &&
    Number.isFinite(input.amount) &&
    input.amount > 0 &&
    Math.abs(storedAmount - input.amount) >= 1
  ) {
    return false;
  }
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
      amount: storedAmount ?? input.amount,
      templateId: templateId ?? null,
      status: "succeeded",
      paidAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return true;
}

export async function confirmReturnPayment(
  paymentId: string,
  uid: string,
  extra?: { templateId?: string; plan?: string },
) {
  const app = adminApp();
  if (!app || !paymentId || !uid) return { paid: false as const };
  const snap = await getFirestore(app).collection("payments").doc(paymentId).get();
  const data = snap.exists
    ? (snap.data() as {
        uid?: string;
        status?: string;
        plan?: string;
        templateId?: string;
        amount?: number;
      })
    : {};
  if (data.uid && data.uid !== uid) return { paid: false as const };
  const templateId = pickText(data.templateId, extra?.templateId) || undefined;
  const plan =
    pickText(data.plan, extra?.plan) || (templateId ? "standard" : extra?.plan === "pro" ? "pro" : "standard");
  const done = await fulfillPayment({
    paymentId,
    amount: 0,
    uid,
    plan,
    templateId,
  });
  if (!done) return { paid: false as const };
  return { paid: true as const, plan, templateId: templateId ?? null };
}
