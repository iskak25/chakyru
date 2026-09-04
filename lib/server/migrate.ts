import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../firebaseAdmin";
import { isPaidPurchaseStatus } from "./accessLogic";

export async function migrateChakyruData() {
  const db = getAdminDb();
  if (!db) throw new Error("firestore");
  const log: string[] = [];
  const users = await db.collection("users").get();
  let accessWrites = 0;
  for (const user of users.docs) {
    const templates = Array.isArray(user.data().templates) ? (user.data().templates as unknown[]) : [];
    for (const templateId of templates) {
      if (typeof templateId !== "string" || !templateId) continue;
      const ref = user.ref.collection("templateAccess").doc(templateId);
      const snap = await ref.get();
      if (snap.exists) continue;
      await ref.set(
        {
          templateId,
          accessType: "purchase",
          grantedAt: user.data().updatedAt || user.data().createdAt || new Date().toISOString(),
        },
        { merge: true },
      );
      accessWrites += 1;
    }
  }
  log.push(`templateAccess created: ${accessWrites}`);

  const payments = await db.collection("payments").get();
  let purchaseWrites = 0;
  for (const payment of payments.docs) {
    const data = payment.data();
    const purchaseRef = db.collection("purchases").doc(payment.id);
    const existing = await purchaseRef.get();
    if (existing.exists) continue;
    const status = isPaidPurchaseStatus(String(data.status ?? "")) ? "paid" : data.status === "failed" ? "failed" : "pending";
    const price = typeof data.price === "number" ? data.price : Number(data.amount ?? 0);
    await purchaseRef.set(
      {
        id: payment.id,
        userId: data.uid || data.userId || "",
        uid: data.uid || data.userId || "",
        templateId: data.templateId ?? null,
        plan: data.plan || "standard",
        price: Number.isFinite(price) ? price : 0,
        amount: Number.isFinite(price) ? price : 0,
        currency: "KGS",
        status,
        source: data.plan === "pro" || data.plan === "unlimited" ? "pro" : "template",
        finikPaymentId: payment.id,
        createdAt: data.createdAt || new Date().toISOString(),
        paidAt: data.paidAt || null,
      },
      { merge: true },
    );
    purchaseWrites += 1;
    if (status === "paid" && typeof data.templateId === "string" && data.templateId && (data.uid || data.userId)) {
      const uid = String(data.uid || data.userId);
      const accessRef = db.collection("users").doc(uid).collection("templateAccess").doc(data.templateId);
      await accessRef.set(
        {
          templateId: data.templateId,
          accessType: "purchase",
          purchaseId: payment.id,
          grantedAt: data.paidAt || data.createdAt || new Date().toISOString(),
        },
        { merge: true },
      );
      await db.collection("users").doc(uid).set(
        {
          templates: FieldValue.arrayUnion(data.templateId),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    }
  }
  log.push(`purchases created: ${purchaseWrites}`);
  return { ok: true as const, log, accessWrites, purchaseWrites };
}
