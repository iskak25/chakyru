"use client";

import { normalizeUser } from "./auth";
import { fetchTemplateAccess } from "./accessClient";
import { getFirebaseAuth, profileFromFirebase } from "./firebase";
import { getUser, grantLocalTemplate, setPendingTemplate, setUser } from "./store";

export const PAID_TEMPLATE_KEY = "chakyru-paid-template";
export const PAYMENT_ID_KEY = "chakyru-payment-id";
export const LAST_PAYMENT_KEY = "chakyru-last-payment";

export function rememberCheckout(input: { paymentId?: string; templateId?: string; plan?: string }) {
  if (typeof window === "undefined") return;
  if (input.templateId) setPendingTemplate(input.templateId);
  if (input.paymentId) sessionStorage.setItem(PAYMENT_ID_KEY, input.paymentId);
  localStorage.setItem(
    LAST_PAYMENT_KEY,
    JSON.stringify({
      pid: input.paymentId || "",
      templateId: input.templateId || "",
      plan: input.plan || "standard",
    }),
  );
}

export function lastCheckout() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_PAYMENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { pid?: string; templateId?: string; plan?: string };
    return {
      pid: parsed.pid || "",
      templateId: parsed.templateId || "",
      plan: parsed.plan === "pro" ? "pro" : "standard",
    };
  } catch {
    return null;
  }
}

export function markPaidTemplate(templateId: string, paymentId?: string) {
  if (typeof window === "undefined") return;
  if (templateId) {
    setPendingTemplate(templateId);
    sessionStorage.setItem(PAID_TEMPLATE_KEY, templateId);
  }
  if (paymentId) sessionStorage.setItem(PAYMENT_ID_KEY, paymentId);
}

export function paidTemplateId() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(PAID_TEMPLATE_KEY) || "";
}

export function ensureGoogleUser() {
  const existing = getUser();
  if (existing?.auth === "google") return existing;
  const fb = getFirebaseAuth()?.currentUser;
  if (!fb) return existing;
  const profile = profileFromFirebase(fb);
  const user = normalizeUser({
    ...existing,
    ...profile,
    auth: "google",
    plan: existing?.plan ?? "free",
    templates: existing?.templates ?? [],
  });
  setUser(user);
  return user;
}

export function unlockPaidTemplate(templateId: string, plan: "standard" | "pro" = "standard") {
  ensureGoogleUser();
  if (!templateId) return getUser();
  markPaidTemplate(templateId);
  return grantLocalTemplate(templateId, plan);
}

export async function restorePaidTemplate(templateId: string) {
  if (!templateId) return false;
  ensureGoogleUser();
  const access = await fetchTemplateAccess(templateId).catch(() => null);
  if (!access?.allowed) return false;
  unlockPaidTemplate(templateId, access.accessType === "pro" ? "pro" : "standard");
  return true;
}

export async function confirmLastCheckout() {
  const checkout = lastCheckout();
  if (!checkout?.pid) return false;
  const auth = getFirebaseAuth();
  await auth?.authStateReady();
  const token = await auth?.currentUser?.getIdToken();
  if (!token) return false;
  try {
    const res = await fetch("/api/pay/confirm", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pid: checkout.pid }),
    });
    const data = (await res.json().catch(() => null)) as {
      paid?: boolean;
      templateId?: string | null;
      plan?: string | null;
    } | null;
    if (!data?.paid) return false;
    const templateId = data.templateId || checkout.templateId;
    if (templateId) unlockPaidTemplate(templateId, data.plan === "pro" ? "pro" : "standard");
    return true;
  } catch {
    return false;
  }
}
