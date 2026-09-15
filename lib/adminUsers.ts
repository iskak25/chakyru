import { isAdminEmail } from "./auth";
import { getAdminDb } from "./firebaseAdmin";
import { grantProPeriod, type ProPeriod } from "./proAccess";
import { canonicalAccount } from "./server/users";
import type { AccountRole, PlanId } from "./types";

export type AdminUserRow = ProPeriod & {
  id: string; firebaseUid: string; name: string; email: string; picture?: string;
  accountRole: AccountRole; plan: PlanId; templates?: string[]; createdAt?: string; protectedAdmin?: boolean;
};

function rowFromFirestore(uid: string, data: Record<string, unknown>): AdminUserRow {
  return {
    id: String(data.id ?? `google:${uid}`), firebaseUid: uid,
    name: String(data.name ?? ""), email: String(data.email ?? ""),
    picture: data.picture ? String(data.picture) : undefined,
    ...canonicalAccount(data),
    templates: Array.isArray(data.templates) ? data.templates.filter((id): id is string => typeof id === "string") : [],
    createdAt: typeof data.createdAt === "string" ? data.createdAt : undefined,
    protectedAdmin: isAdminEmail(String(data.email ?? "")),
  };
}

export async function callerIsAdmin(uid: string, email: string) {
  if (isAdminEmail(email)) return true;
  const db = getAdminDb();
  if (!db) return false;
  return (await db.collection("users").doc(uid).get()).data()?.accountRole === "admin";
}

export async function upsertAuthUser(input: {
  firebaseUid: string; name: string; email: string; picture?: string; createdAt?: string;
}): Promise<AdminUserRow> {
  const db = getAdminDb();
  if (!db || !input.firebaseUid) throw new Error("firebase-admin-not-configured");
  const ref = db.collection("users").doc(input.firebaseUid);
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const existing = snap.data() ?? {};
    const now = new Date().toISOString();
    const data = {
      ...existing, id: `google:${input.firebaseUid}`, firebaseUid: input.firebaseUid,
      name: input.name || String(existing.name ?? "") || input.email,
      email: input.email || String(existing.email ?? ""), picture: input.picture || existing.picture || null,
      templates: Array.isArray(existing.templates) ? existing.templates : [],
      createdAt: existing.createdAt || input.createdAt || now,
    };
    const account = canonicalAccount(data, now);
    tx.set(ref, { ...data, ...account, updatedAt: now }, { merge: true });
    return rowFromFirestore(input.firebaseUid, { ...data, ...account });
  });
}

export async function patchAdminUser(uid: string, patch: { accountRole: "guest" | "pro" | "admin"; proMonths?: number }) {
  if (!["guest", "pro", "admin"].includes(patch.accountRole)) throw new Error("role");
  if (patch.proMonths !== undefined && patch.proMonths !== 1 && patch.proMonths !== 3) throw new Error("months");
  const db = getAdminDb();
  if (!db) throw new Error("firebase-admin-not-configured");
  // No Firebase Auth Admin lookup here on purpose: every real user already has a
  // users/{uid} Firestore doc (name/email/picture/createdAt) written by
  // /api/me/sync on login, via upsertAuthUser below. Reading that instead of
  // calling auth.getUser(uid) avoids loading "firebase-admin/auth", whose
  // jwks-rsa -> jose dependency chain fails to load under Vercel's Node
  // bundler (ERR_REQUIRE_ESM) -- see listAdminUsers for the same reasoning.
  const ref = db.collection("users").doc(uid);
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const existing = snap.data() ?? {};
    const email = String(existing.email ?? "");
    if (isAdminEmail(email) && patch.accountRole !== "admin") throw new Error("protected-admin");
    const now = new Date().toISOString();
    const account = patch.accountRole === "pro"
      ? grantProPeriod({ ...canonicalAccount(existing, now), accountRole: "guest" }, patch.proMonths ?? 1, now)
      : { accountRole: patch.accountRole, plan: "free", proStartedAt: null, proExpiresAt: null };
    tx.set(ref, {
      ...account, id: existing.id ?? `google:${uid}`, firebaseUid: uid,
      name: String(existing.name ?? ""), email,
      picture: existing.picture ?? null, createdAt: existing.createdAt || now,
      updatedAt: now,
    }, { merge: true });
  });
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const db = getAdminDb();
  if (!db) throw new Error("firebase-admin-not-configured");
  // This used to also paginate Firebase Authentication (auth.listUsers()) and
  // upsert every account into Firestore here, to keep the users collection in
  // sync. That's unnecessary -- /api/me/sync already upserts every user's doc
  // on login (see upsertAuthUser) -- and calling into "firebase-admin/auth"
  // pulls in jwks-rsa, whose CJS require() of jose's ESM-only build crashes
  // Vercel's Node serverless bundler with ERR_REQUIRE_ESM (this worked in
  // local dev, which doesn't bundle the same way, masking the bug there).
  // Reading Firestore directly sidesteps the broken dependency entirely.
  const snap = await db.collection("users").get();
  const rows: AdminUserRow[] = [];
  for (const doc of snap.docs) {
    const row = await db.runTransaction(async tx => {
      const fresh = await tx.get(doc.ref);
      if (!fresh.exists) return null;
      const data = fresh.data() ?? {};
      const account = canonicalAccount(data);
      if (Object.entries(account).some(([key, value]) => data[key] !== value)) tx.set(doc.ref, account, { merge: true });
      return rowFromFirestore(doc.id, { ...data, ...account });
    });
    if (row) rows.push(row);
  }
  return rows.sort((a, b) => a.email.localeCompare(b.email));
}
