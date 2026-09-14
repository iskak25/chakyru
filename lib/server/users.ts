import { isAdminEmail } from "../auth";
import { getAdminDb } from "../firebaseAdmin";
import { addProMonths, effectiveAccount } from "../proAccess";
import type { UserProfile } from "../types";

/** Migrate legacy unlimited roles once, using their recorded grant/update date. */
export function canonicalAccount(data: Record<string, unknown>, now = new Date().toISOString()) {
  let proStartedAt = typeof data.proStartedAt === "string" ? data.proStartedAt : null;
  let proExpiresAt = typeof data.proExpiresAt === "string" ? data.proExpiresAt : null;
  let role = data.accountRole;
  const legacyPro = role === "vip" || ((role === "user" || !role) && ["pro", "unlimited"].includes(String(data.plan)));
  if (legacyPro && !Object.hasOwn(data, "proExpiresAt")) {
    const recorded = [data.updatedAt, data.createdAt].find(value => typeof value === "string" && Number.isFinite(Date.parse(value)));
    proStartedAt = typeof recorded === "string" ? recorded : now;
    proExpiresAt = addProMonths(proStartedAt, 1);
    role = "pro";
  }
  if (isAdminEmail(typeof data.email === "string" ? data.email : "")) role = "admin";
  return { ...effectiveAccount({ accountRole: role, plan: data.plan, proStartedAt, proExpiresAt }, Date.parse(now)), proStartedAt, proExpiresAt };
}

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getAdminDb();
  if (!db || !uid) return null;
  const ref = db.collection("users").doc(uid);
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const data = snap.data() ?? {};
    const account = canonicalAccount(data);
    if (Object.entries(account).some(([key, value]) => data[key] !== value)) {
      tx.set(ref, { ...account, updatedAt: new Date().toISOString() }, { merge: true });
    }
    return {
      id: String(data.id ?? `google:${uid}`), firebaseUid: uid,
      name: String(data.name ?? ""), role: data.role === "designer" ? "designer" : "host",
      auth: "google", email: String(data.email ?? ""), picture: data.picture ? String(data.picture) : undefined,
      ...account,
      templates: Array.isArray(data.templates) ? data.templates.filter((id: unknown): id is string => typeof id === "string") : [],
      creativeCredits: typeof data.creativeCredits === "number" ? data.creativeCredits : undefined,
    };
  });
}

export async function isAdminUser(uid: string, email?: string) {
  if (isAdminEmail(email)) return true;
  return (await loadUserProfile(uid))?.accountRole === "admin";
}