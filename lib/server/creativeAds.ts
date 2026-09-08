import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../firebaseAdmin";
import { isAdminEmail } from "../auth";
import { ensurePaidTemplateAccess } from "./access";
import { loadUserProfile } from "./users";
import { getCatalogTemplate } from "./templates";
import { emptyCreativeAd, getCreativeAdsProvider } from "../creativeAds/provider";
import type { CreativeAd, CreativeFormatId, CreativeLanguage, CreativeStyleId } from "../creativeAds/types";
import type { EventType } from "../types";

const COLLECTION = "creativeAds";
const DEFAULT_CREDITS = 3;

function asCreative(id: string, data: Record<string, unknown>): CreativeAd | null {
  if (!data || typeof data.userId !== "string" || typeof data.templateId !== "string") return null;
  return {
    ...(emptyCreativeAd({
      id,
      userId: data.userId,
      templateId: data.templateId,
    })),
    ...(data as unknown as CreativeAd),
    id,
  };
}

export async function getCreativeCredits(uid: string, email?: string) {
  const profile = await loadUserProfile(uid);
  if (isAdminEmail(email) || isAdminEmail(profile?.email) || profile?.accountRole === "admin" || profile?.accountRole === "vip") {
    return { credits: Infinity, unlimited: true as const };
  }
  if (profile?.plan === "pro" || profile?.plan === "unlimited") {
    return { credits: Infinity, unlimited: true as const };
  }
  const credits = typeof profile?.creativeCredits === "number" ? profile.creativeCredits : DEFAULT_CREDITS;
  return { credits, unlimited: false as const };
}

export async function ensureCreativeCredits(uid: string) {
  const db = getAdminDb();
  if (!db) return;
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ creativeCredits: DEFAULT_CREDITS, updatedAt: new Date().toISOString() }, { merge: true });
    return;
  }
  if (typeof snap.data()?.creativeCredits !== "number") {
    await ref.set({ creativeCredits: DEFAULT_CREDITS, updatedAt: new Date().toISOString() }, { merge: true });
  }
}

async function consumeCredit(uid: string, unlimited: boolean) {
  if (unlimited) return true;
  const db = getAdminDb();
  if (!db) return false;
  const ref = db.collection("users").doc(uid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = typeof snap.data()?.creativeCredits === "number" ? snap.data()!.creativeCredits : DEFAULT_CREDITS;
    if (current < 1) return false;
    tx.set(ref, { creativeCredits: current - 1, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  });
}

export async function listCreativeAds(uid: string) {
  const db = getAdminDb();
  if (!db) return [];
  const snap = await db.collection(COLLECTION).where("userId", "==", uid).get().catch(() => null);
  const rows = (snap?.docs ?? [])
    .map((doc) => asCreative(doc.id, (doc.data() ?? {}) as Record<string, unknown>))
    .filter((item): item is CreativeAd => Boolean(item));
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCreativeAd(id: string, uid: string) {
  const db = getAdminDb();
  if (!db || !id) return null;
  const snap = await db.collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  const item = asCreative(id, (snap.data() ?? {}) as Record<string, unknown>);
  if (!item || item.userId !== uid) return null;
  return item;
}

export async function generateCreativeAd(input: {
  uid: string;
  email?: string;
  templateId: string;
  style: CreativeStyleId;
  format: CreativeFormatId;
  language: CreativeLanguage;
  eventType: EventType;
}) {
  const db = getAdminDb();
  if (!db) throw new Error("firestore");
  const access = await ensurePaidTemplateAccess(input.uid, input.templateId, input.email);
  if (!access.allowed) {
    const err = new Error("access");
    (err as Error & { code?: string }).code = "access";
    throw err;
  }
  await ensureCreativeCredits(input.uid);
  const balance = await getCreativeCredits(input.uid, input.email);
  const spent = await consumeCredit(input.uid, balance.unlimited);
  if (!spent) {
    const err = new Error("credits");
    (err as Error & { code?: string }).code = "credits";
    throw err;
  }

  const template = await getCatalogTemplate(input.templateId);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const draft = emptyCreativeAd({
    id,
    userId: input.uid,
    templateId: input.templateId,
    style: input.style,
    format: input.format,
    language: input.language,
    eventType: input.eventType,
    status: "generating",
    createdAt: now,
    updatedAt: now,
  });
  await db.collection(COLLECTION).doc(id).set(draft);

  try {
    const provider = getCreativeAdsProvider();
    const result = await provider.generate({
      userId: input.uid,
      templateId: input.templateId,
      templateName: template?.name.ru || template?.name.ky || input.templateId,
      style: input.style,
      format: input.format,
      language: input.language,
      eventType: input.eventType,
    });
    const ready: CreativeAd = {
      ...draft,
      status: "ready",
      title: result.copy.title,
      subtitle: result.copy.subtitle,
      cta: result.copy.cta,
      variants: result.variants,
      activeVariantId: result.variants[0]?.id || "",
      prompt: result.prompt,
      updatedAt: new Date().toISOString(),
    };
    await db.collection(COLLECTION).doc(id).set(ready, { merge: true });
    return ready;
  } catch {
    await db.collection(COLLECTION).doc(id).set(
      { status: "failed", error: "generate", updatedAt: new Date().toISOString() },
      { merge: true },
    );
    if (!balance.unlimited) {
      await db.collection("users").doc(input.uid).set(
        { creativeCredits: FieldValue.increment(1), updatedAt: new Date().toISOString() },
        { merge: true },
      );
    }
    const err = new Error("generate");
    (err as Error & { code?: string }).code = "generate";
    throw err;
  }
}

export async function updateCreativeAd(
  id: string,
  uid: string,
  patch: Partial<
    Pick<
      CreativeAd,
      | "title"
      | "subtitle"
      | "cta"
      | "favorite"
      | "overlay"
      | "blur"
      | "textColor"
      | "buttonColor"
      | "align"
      | "fontSize"
      | "activeVariantId"
    >
  >,
) {
  const db = getAdminDb();
  if (!db) return null;
  const existing = await getCreativeAd(id, uid);
  if (!existing) return null;
  const next = {
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await db.collection(COLLECTION).doc(id).set(next, { merge: true });
  return { ...existing, ...next };
}

export async function deleteCreativeAd(id: string, uid: string) {
  const db = getAdminDb();
  if (!db) return false;
  const existing = await getCreativeAd(id, uid);
  if (!existing) return false;
  await db.collection(COLLECTION).doc(id).delete();
  return true;
}
