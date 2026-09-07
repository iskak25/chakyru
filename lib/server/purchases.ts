import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../firebaseAdmin";
import type { PlanId, Purchase, PurchaseSource, PurchaseStatus } from "../types";
import { grantTemplateAccess } from "./access";
import { isFinikSucceeded, isPaidPurchaseStatus, purchasePriceLocked } from "./accessLogic";

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

async function purchaseByField(field: string, value: string): Promise<Purchase | null> {
  const db = getAdminDb();
  if (!db || !value) return null;
  for (const collection of ["purchases", "payments"] as const) {
    const snap = await db.collection(collection).where(field, "==", value).limit(1).get().catch(() => null);
    if (snap && !snap.empty) {
      const doc = snap.docs[0];
      return purchaseFromPayment(doc.id, (doc.data() ?? {}) as Record<string, unknown>);
    }
  }
  return null;
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
  return (
    (await purchaseByField("finikPaymentId", purchaseId)) ||
    (await purchaseByField("finikTransactionId", purchaseId)) ||
    (await purchaseByField("paymentId", purchaseId))
  );
}

export async function findUserPurchase(uid: string, input?: { paymentId?: string; templateId?: string }) {
  if (input?.paymentId) {
    const found = await getPurchase(input.paymentId);
    if (found && samePurchasePayer(found.userId, uid)) return found;
  }
  const db = getAdminDb();
  if (!db) return null;
  const ids = [...new Set([uid, `google:${uid}`])];
  const snaps = await Promise.all(
    ids.flatMap((id) => [
      db.collection("purchases").where("userId", "==", id).get().catch(() => null),
      db.collection("purchases").where("uid", "==", id).get().catch(() => null),
      db.collection("payments").where("uid", "==", id).get().catch(() => null),
      db.collection("payments").where("userId", "==", id).get().catch(() => null),
    ]),
  );
  const rows = snaps
    .flatMap((snap) => snap?.docs ?? [])
    .map((doc) => purchaseFromPayment(doc.id, (doc.data() ?? {}) as Record<string, unknown>))
    .filter((item, index, all) => all.findIndex((row) => row.id === item.id) === index);
  const templateId = input?.templateId?.trim() || "";
  const ranked = rows
    .filter((item) => samePurchasePayer(item.userId, uid))
    .filter((item) => !templateId || item.templateId === templateId || item.plan === "pro" || item.plan === "unlimited")
    .sort((a, b) => {
      const paid = Number(isPaidPurchaseStatus(b.status)) - Number(isPaidPurchaseStatus(a.status));
      if (paid) return paid;
      return b.createdAt.localeCompare(a.createdAt);
    });
  return ranked[0] ?? null;
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
  if (input.uid && found.userId && !samePurchasePayer(found.userId, input.uid)) return false;

  const id = found.id;
  const uid = input.uid || found.userId;
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
    console.info("[PURCHASE_FULFILL]", {
      paymentId: id,
      frozenPrice,
      reportedAmount: input.amount,
      note: "amount-mismatch-ignored",
    });
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

export function samePurchasePayer(userId: string | undefined, uid: string) {
  if (!userId || !uid) return false;
  return userId === uid || userId === `google:${uid}` || userId.replace(/^google:/, "") === uid;
}

export async function confirmOwnedPurchase(
  paymentId: string,
  uid: string,
  input?: { templateId?: string; finikStatus?: string },
): Promise<{ paid: boolean; plan?: string; templateId?: string | null; status?: string }> {
  const purchase = await findUserPurchase(uid, { paymentId, templateId: input?.templateId });
  if (!purchase || !samePurchasePayer(purchase.userId, uid)) {
    return { paid: false, status: "missing" };
  }
  if (purchase.status === "failed" || purchase.status === "cancelled" || purchase.status === "refunded") {
    return { paid: false, plan: purchase.plan, templateId: purchase.templateId ?? null, status: purchase.status };
  }
  if (purchasePriceLocked(purchase.status)) {
    if (purchase.templateId && purchase.plan === "standard") {
      await grantTemplateAccess({
        uid,
        templateId: purchase.templateId,
        accessType: "purchase",
        purchaseId: purchase.id,
      });
    }
    return { paid: true, plan: purchase.plan, templateId: purchase.templateId ?? null, status: "paid" };
  }
  if (purchase.status === "pending" && isFinikSucceeded(input?.finikStatus)) {
    const done = await fulfillPurchase({
      paymentId: purchase.id,
      amount: purchase.price,
      uid,
      plan: purchase.plan,
      templateId: purchase.templateId,
    });
    if (done) {
      return { paid: true, plan: purchase.plan, templateId: purchase.templateId ?? null, status: "paid" };
    }
  }
  return { paid: false, plan: purchase.plan, templateId: purchase.templateId ?? null, status: purchase.status };
}

export function purchaseIsImmutable(purchase: Purchase) {
  return purchasePriceLocked(purchase.status);
}

export async function attachFinikPaymentId(purchaseId: string, finikPaymentId: string) {
  const db = getAdminDb();
  const id = pickText(purchaseId);
  const finikId = pickText(finikPaymentId);
  if (!db || !id || !finikId) return;
  await Promise.all([
    db.collection("payments").doc(id).set({ finikPaymentId: finikId }, { merge: true }),
    db.collection("purchases").doc(id).set({ finikPaymentId: finikId }, { merge: true }),
  ]);
}

export async function failPurchase(paymentId: string, status: "failed" | "cancelled") {
  const db = getAdminDb();
  if (!db) return false;
  const found = await getPurchase(paymentId);
  if (!found) return false;
  if (isPaidPurchaseStatus(found.status)) return true;
  if (found.status === status) return true;
  const payload = {
    status,
    updatedAt: new Date().toISOString(),
  };
  await Promise.all([
    db.collection("payments").doc(found.id).set(payload, { merge: true }),
    db.collection("purchases").doc(found.id).set(payload, { merge: true }),
  ]);
  return true;
}
