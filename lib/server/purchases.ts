import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../firebaseAdmin";
import type { PlanId, Purchase, PurchaseSource, PurchaseStatus } from "../types";
import { grantTemplateAccess } from "./access";
import { isPaidPurchaseStatus, purchasePriceLocked } from "./accessLogic";

function pickText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function asPurchaseStatus(value?: string): PurchaseStatus {
  if (value === "paid" || value === "succeeded") return "paid";
  if (value === "failed" || value === "cancelled" || value === "refunded") return value;
  return "pending";
}

function sourceOf(plan: string, templateId?: string): PurchaseSource {
  if (plan === "pro" || plan === "unlimited") return "pro";
  if (templateId) return "template";
  return "template";
}

function purchaseFromPayment(id: string, data: Record<string, unknown>): Purchase {
  const plan = pickText(data.plan) as Exclude<PlanId, "free">;
  const templateId = pickText(data.templateId) || undefined;
  const price = typeof data.price === "number" ? data.price : Number(data.amount ?? 0);
  return {
    id,
    userId: pickText(data.userId, data.uid),
    templateId,
    plan: plan === "pro" || plan === "unlimited" || plan === "standard" ? plan : "standard",
    price: Number.isFinite(price) ? price : 0,
    currency: "KGS",
    status: asPurchaseStatus(typeof data.status === "string" ? data.status : undefined),
    finikPaymentId: pickText(data.finikPaymentId, data.paymentId) || id,
    finikTransactionId: pickText(data.finikTransactionId) || undefined,
    createdAt: pickText(data.createdAt) || new Date().toISOString(),
    paidAt: pickText(data.paidAt) || undefined,
    source: (pickText(data.source) as PurchaseSource) || sourceOf(plan, templateId),
  };
}

export async function getPurchase(purchaseId: string): Promise<Purchase | null> {
  const db = getAdminDb();
  if (!db || !purchaseId) return null;
  const purchaseSnap = await db.collection("purchases").doc(purchaseId).get();
  if (purchaseSnap.exists) {
    return purchaseFromPayment(purchaseId, (purchaseSnap.data() ?? {}) as Record<string, unknown>);
  }
  const paymentSnap = await db.collection("payments").doc(purchaseId).get();
  if (paymentSnap.exists) {
    return purchaseFromPayment(purchaseId, (paymentSnap.data() ?? {}) as Record<string, unknown>);
  }
  const byFinik = await db.collection("purchases").where("finikPaymentId", "==", purchaseId).limit(1).get();
  if (!byFinik.empty) {
    const doc = byFinik.docs[0];
    return purchaseFromPayment(doc.id, (doc.data() ?? {}) as Record<string, unknown>);
  }
  return null;
}

export async function findOpenPurchase(uid: string, input: { plan: Exclude<PlanId, "free">; templateId?: string }) {
  const db = getAdminDb();
  if (!db) return null;
  const snap = await db.collection("payments").where("uid", "==", uid).get();
  const match = snap.docs.find((doc) => {
    const data = doc.data() as { plan?: string; templateId?: string; status?: string };
    if (isPaidPurchaseStatus(data.status) || data.status === "failed" || data.status === "cancelled") return false;
    if (data.plan !== input.plan) return false;
    if (input.plan === "standard") return data.templateId === input.templateId;
    return true;
  });
  return match ? getPurchase(match.id) : null;
}

export async function createPurchase(input: {
  paymentId: string;
  uid: string;
  plan: Exclude<PlanId, "free">;
  amount: number;
  templateId?: string;
}) {
  const db = getAdminDb();
  if (!db) return;
  const createdAt = new Date().toISOString();
  const payload = {
    uid: input.uid,
    userId: input.uid,
    plan: input.plan,
    amount: input.amount,
    price: input.amount,
    currency: "KGS" as const,
    templateId: input.templateId ?? null,
    status: "pending" as const,
    source: sourceOf(input.plan, input.templateId),
    finikPaymentId: input.paymentId,
    createdAt,
  };
  await Promise.all([
    db.collection("payments").doc(input.paymentId).set(payload, { merge: true }),
    db.collection("purchases").doc(input.paymentId).set(
      {
        id: input.paymentId,
        ...payload,
      },
      { merge: true },
    ),
  ]);
}

export async function fulfillPurchase(input: {
  paymentId: string;
  amount: number;
  uid?: string;
  plan?: string;
  templateId?: string;
  transactionId?: string;
}) {
  const db = getAdminDb();
  if (!db) return false;
  const paymentId = pickText(input.paymentId);
  if (!paymentId) return false;
  const found =
    (await getPurchase(paymentId)) ||
    (input.transactionId ? await getPurchase(input.transactionId) : null);
  if (!found) return false;
  if (input.uid && found.userId && input.uid !== found.userId) return false;

  const id = found.id;
  const uid = found.userId;
  const plan = found.plan;
  const templateId = found.templateId;
  const frozenPrice = found.price;
  const paymentRef = db.collection("payments").doc(id);
  const purchaseRef = db.collection("purchases").doc(id);

  if (isPaidPurchaseStatus(found.status)) {
    if (plan === "standard" && templateId) {
      await grantTemplateAccess({
        uid,
        templateId,
        accessType: "purchase",
        purchaseId: id,
      });
    }
    return true;
  }

  if (found.status !== "pending") return false;

  if (Number.isFinite(input.amount) && input.amount > 0 && Math.abs(frozenPrice - input.amount) >= 1) {
    return false;
  }

  const paidAt = new Date().toISOString();
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const currentPlan = userSnap.data()?.plan;
  const keepPro = currentPlan === "pro" || currentPlan === "unlimited";

  if (plan === "pro" || plan === "unlimited") {
    await userRef.set({ plan: "pro", updatedAt: paidAt }, { merge: true });
  } else {
    const patch: Record<string, unknown> = {
      plan: keepPro ? currentPlan : "standard",
      updatedAt: paidAt,
    };
    if (templateId) patch.templates = FieldValue.arrayUnion(templateId);
    await userRef.set(patch, { merge: true });
    if (templateId) {
      await grantTemplateAccess({
        uid,
        templateId,
        accessType: "purchase",
        purchaseId: id,
      });
    }
  }

  const paidPayload = {
    uid,
    userId: uid,
    plan,
    amount: frozenPrice,
    price: frozenPrice,
    currency: "KGS",
    templateId: templateId ?? null,
    status: "paid",
    paidAt,
    finikPaymentId: found.finikPaymentId || id,
    finikTransactionId: pickText(input.transactionId) || found.finikTransactionId || null,
    source: found.source,
  };

  await Promise.all([
    paymentRef.set({ ...paidPayload, status: "succeeded" }, { merge: true }),
    purchaseRef.set({ id, ...paidPayload }, { merge: true }),
  ]);
  return true;
}

export async function confirmOwnedPurchase(
  paymentId: string,
  uid: string,
): Promise<{ paid: boolean; plan?: string; templateId?: string | null }> {
  const purchase = await getPurchase(paymentId);
  if (!purchase || purchase.userId !== uid) return { paid: false };
  if (purchasePriceLocked(purchase.status)) {
    if (purchase.plan === "standard" && purchase.templateId) {
      await grantTemplateAccess({
        uid,
        templateId: purchase.templateId,
        accessType: "purchase",
        purchaseId: paymentId,
      });
    }
    return { paid: true, plan: purchase.plan, templateId: purchase.templateId ?? null };
  }
  return { paid: false, plan: purchase.plan, templateId: purchase.templateId ?? null };
}

export function purchaseIsImmutable(purchase: Purchase) {
  return purchasePriceLocked(purchase.status);
}
