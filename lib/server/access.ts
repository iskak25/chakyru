import { FieldValue } from "firebase-admin/firestore";
import { isAdminEmail } from "../auth";
import { getAdminDb } from "../firebaseAdmin";
import { isFreeTemplate } from "../templates";
import type { TemplateAccess, TemplateAccessType } from "../types";
import {
  canUserAccessTemplateFromFacts,
  isPaidPurchaseStatus,
  resolveTemplatePriceForUser,
  userTemplatePriceId,
} from "./accessLogic";
import { getCatalogBasePrice, getCatalogTemplate } from "./templates";
import { loadUserProfile } from "./users";

export { canUserAccessTemplateFromFacts, resolveTemplatePriceForUser };

async function hasTemplateAccessDoc(uid: string, templateId: string) {
  const db = getAdminDb();
  if (!db) return false;
  const snap = await db.collection("users").doc(uid).collection("templateAccess").doc(templateId).get();
  return snap.exists;
}

async function hasPaidTemplatePurchase(uid: string, templateId: string) {
  const db = getAdminDb();
  if (!db) return false;
  const [purchases, payments] = await Promise.all([
    db.collection("purchases").where("userId", "==", uid).get().catch(() => null),
    db.collection("payments").where("uid", "==", uid).get().catch(() => null),
  ]);
  const paidPurchase = purchases?.docs.some((doc) => {
    const data = doc.data() as { templateId?: string; status?: string };
    return data.templateId === templateId && isPaidPurchaseStatus(data.status);
  });
  if (paidPurchase) return true;
  return Boolean(
    payments?.docs.some((doc) => {
      const data = doc.data() as { templateId?: string; status?: string };
      return data.templateId === templateId && isPaidPurchaseStatus(data.status);
    }),
  );
}

export async function canUserAccessTemplate(uid: string, templateId: string) {
  const profile = await loadUserProfile(uid);
  const template = await getCatalogTemplate(templateId);
  const basePrice = template?.priceSom ?? 0;
  const free = isFreeTemplate(templateId, basePrice);
  const hasAccessDoc = await hasTemplateAccessDoc(uid, templateId);
  const hasLegacy = Boolean(profile?.templates?.includes(templateId));
  const hasPaid = await hasPaidTemplatePurchase(uid, templateId);
  const decision = canUserAccessTemplateFromFacts({
    accountRole: profile?.accountRole ?? "user",
    plan: profile?.plan ?? "free",
    isAdminEmail: isAdminEmail(profile?.email),
    isFreeTemplate: free,
    hasPaidPurchase: hasPaid,
    hasTemplateAccess: hasAccessDoc || hasLegacy,
  });
  return {
    ...decision,
    owned: decision.accessType === "purchase" || hasAccessDoc || hasLegacy || hasPaid,
    isFree: free,
    profile,
    template,
  };
}

export async function getIndividualTemplatePrice(uid: string, templateId: string) {
  const db = getAdminDb();
  if (!db) return null;
  const snap = await db.collection("userTemplatePrices").doc(userTemplatePriceId(uid, templateId)).get();
  const price = snap.data()?.price;
  return typeof price === "number" && Number.isFinite(price) && price >= 0 ? price : null;
}

export async function getTemplatePriceForUser(uid: string, templateId: string) {
  const basePrice = await getCatalogBasePrice(templateId);
  if (basePrice == null) return null;
  const individual = await getIndividualTemplatePrice(uid, templateId);
  return resolveTemplatePriceForUser({
    isFree: isFreeTemplate(templateId, basePrice),
    individualPrice: individual,
    basePrice,
  });
}

export async function grantTemplateAccess(input: {
  uid: string;
  templateId: string;
  accessType: TemplateAccessType;
  purchaseId?: string;
}) {
  const db = getAdminDb();
  if (!db) return false;
  const grantedAt = new Date().toISOString();
  const access: TemplateAccess = {
    templateId: input.templateId,
    accessType: input.accessType,
    purchaseId: input.purchaseId,
    grantedAt,
  };
  const userRef = db.collection("users").doc(input.uid);
  const accessRef = userRef.collection("templateAccess").doc(input.templateId);
  await db.runTransaction(async (tx) => {
    tx.set(accessRef, access, { merge: true });
    tx.set(
      userRef,
      {
        templates: FieldValue.arrayUnion(input.templateId),
        updatedAt: grantedAt,
      },
      { merge: true },
    );
  });
  return true;
}

export async function setUserTemplatePrice(input: { userId: string; templateId: string; price: number }) {
  const db = getAdminDb();
  if (!db) throw new Error("firestore");
  const now = new Date().toISOString();
  const id = userTemplatePriceId(input.userId, input.templateId);
  await db.collection("userTemplatePrices").doc(id).set(
    {
      userId: input.userId,
      templateId: input.templateId,
      price: input.price,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function listUserTemplatePrices() {
  const db = getAdminDb();
  if (!db) return [];
  const snap = await db.collection("userTemplatePrices").get();
  return snap.docs.map((doc) => doc.data() as { userId: string; templateId: string; price: number });
}
