import { isAdminEmail } from "./auth";
import { getAdminAuth, getAdminDb } from "./firebaseAdmin";
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
  const auth = getAdminAuth();
  if (!db || !auth) throw new Error("firebase-admin-not-configured");
  const identity = await auth.getUser(uid);
  if (isAdminEmail(identity.email) && patch.accountRole !== "admin") throw new Error("protected-admin");
  const ref = db.collection("users").doc(uid);
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const existing = snap.data() ?? {};
    const now = new Date().toISOString();
    const account = patch.accountRole === "pro"
      ? grantProPeriod({ ...canonicalAccount(existing, now), accountRole: "guest" }, patch.proMonths ?? 1, now)
      : { accountRole: patch.accountRole, plan: "free", proStartedAt: null, proExpiresAt: null };
    tx.set(ref, {
      ...account, id: `google:${uid}`, firebaseUid: uid,
      name: identity.displayName || identity.email || "", email: identity.email || "",
      picture: identity.photoURL || null, createdAt: existing.createdAt || identity.metadata.creationTime || now,
      updatedAt: now,
    }, { merge: true });
  });
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const db = getAdminDb();
  const auth = getAdminAuth();
  if (!db || !auth) throw new Error("firebase-admin-not-configured");
  // Paginate Firebase Authentication; surface errors rather than reporting an empty list.
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (let offset = 0; offset < page.users.length; offset += 20) {
      await Promise.all(page.users.slice(offset, offset + 20).map(user => upsertAuthUser({
        firebaseUid: user.uid, name: user.displayName || user.email || "", email: user.email || "",
        picture: user.photoURL, createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString() : undefined,
      })));
    }
    pageToken = page.pageToken;
  } while (pageToken);
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
