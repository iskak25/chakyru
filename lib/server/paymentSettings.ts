import "server-only";

import { getAdminDb } from "../firebaseAdmin";

export type PaymentSettings = {
  provider: "finik";
  enabled: boolean;
  finikApiKey: string;
  finikAccountId: string;
  finikPrivateKey: string;
  finikMcc: string;
  finikBeta: boolean;
  siteUrl: string;
};

const PRIVATE_COLLECTION = "private_settings";
const PRIVATE_DOCUMENT = "payments";
const LEGACY_COLLECTION = "catalog";
const LEGACY_DOCUMENT = "payments";

function envSettings(): PaymentSettings {
  const apiKey = process.env.FINIK_API_KEY?.trim() || "";
  const accountId = process.env.FINIK_ACCOUNT_ID?.trim() || "";
  const privateKey = process.env.FINIK_PRIVATE_KEY?.trim() || "";
  return {
    provider: "finik",
    enabled: Boolean(apiKey && accountId && privateKey),
    finikApiKey: apiKey,
    finikAccountId: accountId,
    finikPrivateKey: privateKey,
    finikMcc: process.env.FINIK_MCC?.trim() || "5999",
    finikBeta: process.env.FINIK_BETA === "1" || process.env.FINIK_BETA === "true",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "",
  };
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function boolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function fromData(data: Record<string, unknown> | undefined, fallback: PaymentSettings): PaymentSettings {
  const apiKey = text(data?.finikApiKey, fallback.finikApiKey);
  const accountId = text(data?.finikAccountId, fallback.finikAccountId);
  const privateKey = text(data?.finikPrivateKey, fallback.finikPrivateKey);
  return {
    provider: "finik",
    enabled: typeof data?.enabled === "boolean" ? data.enabled : Boolean(apiKey && accountId && privateKey),
    finikApiKey: apiKey,
    finikAccountId: accountId,
    finikPrivateKey: privateKey,
    finikMcc: text(data?.finikMcc, fallback.finikMcc) || "5999",
    finikBeta: boolean(data?.finikBeta, fallback.finikBeta),
    siteUrl: text(data?.siteUrl, fallback.siteUrl),
  };
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const fallback = envSettings();
  const db = getAdminDb();
  if (!db) return fallback;
  try {
    const privateDoc = await db.collection(PRIVATE_COLLECTION).doc(PRIVATE_DOCUMENT).get();
    if (privateDoc.exists) return fromData(privateDoc.data() as Record<string, unknown>, fallback);

    // Compatibility fallback for the one-time migration from catalog/payments.
    const legacyDoc = await db.collection(LEGACY_COLLECTION).doc(LEGACY_DOCUMENT).get();
    return legacyDoc.exists ? fromData(legacyDoc.data() as Record<string, unknown>, fallback) : fallback;
  } catch {
    return fallback;
  }
}

export function maskSecret(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return `••••••••${trimmed.slice(-4)}`;
}

export function paymentSettingsView(settings: PaymentSettings) {
  return {
    provider: settings.provider,
    enabled: settings.enabled,
    finikAccountId: settings.finikAccountId,
    finikApiKeyConfigured: Boolean(settings.finikApiKey),
    finikPrivateKeyConfigured: Boolean(settings.finikPrivateKey),
    finikApiKeyMasked: maskSecret(settings.finikApiKey),
    finikPrivateKeyMasked: maskSecret(settings.finikPrivateKey),
    finikMcc: settings.finikMcc,
    finikBeta: settings.finikBeta,
    siteUrl: settings.siteUrl,
  };
}

export async function updatePaymentSettings(input: {
  finikApiKey?: string;
  finikAccountId?: string;
  finikPrivateKey?: string;
  finikMcc?: string;
  finikBeta?: boolean;
  siteUrl?: string;
  updatedBy: string;
}) {
  const db = getAdminDb();
  if (!db) throw new Error("firestore");
  const current = await getPaymentSettings();
  const next = {
    provider: "finik" as const,
    finikApiKey: input.finikApiKey?.trim() || current.finikApiKey,
    finikAccountId: input.finikAccountId?.trim() || current.finikAccountId,
    finikPrivateKey: input.finikPrivateKey?.trim() || current.finikPrivateKey,
    finikMcc: input.finikMcc?.trim() || current.finikMcc,
    finikBeta: typeof input.finikBeta === "boolean" ? input.finikBeta : current.finikBeta,
    siteUrl: input.siteUrl?.trim() || current.siteUrl,
    enabled: Boolean(
      (input.finikApiKey?.trim() || current.finikApiKey) &&
        (input.finikAccountId?.trim() || current.finikAccountId) &&
        (input.finikPrivateKey?.trim() || current.finikPrivateKey),
    ),
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy,
  };
  const changedFields = [
    next.finikApiKey !== current.finikApiKey ? "finikApiKey" : "",
    next.finikAccountId !== current.finikAccountId ? "finikAccountId" : "",
    next.finikPrivateKey !== current.finikPrivateKey ? "finikPrivateKey" : "",
    next.finikMcc !== current.finikMcc ? "finikMcc" : "",
    next.finikBeta !== current.finikBeta ? "finikBeta" : "",
    next.siteUrl !== current.siteUrl ? "siteUrl" : "",
  ].filter(Boolean);
  await db.collection(PRIVATE_COLLECTION).doc(PRIVATE_DOCUMENT).set(next, { merge: true });
  await db.collection("auditLogs").add({
    action: "payment_settings_updated",
    userId: input.updatedBy,
    changedFields,
    createdAt: next.updatedAt,
  });
  return next;
}