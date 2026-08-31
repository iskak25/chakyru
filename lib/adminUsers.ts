import { createPrivateKey } from "crypto";
import { importPKCS8, SignJWT } from "jose";
import { isAdminEmail } from "./auth";
import { getAdminDb, serviceAccount } from "./firebaseAdmin";
import type { AccountRole, PlanId } from "./types";

export type AdminUserRow = {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  picture?: string;
  accountRole: AccountRole;
  plan: PlanId;
  templates?: string[];
  createdAt?: string;
};

type AuthRecord = {
  localId?: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  createdAt?: string;
};

function parseRole(value: unknown): AccountRole {
  if (value === "admin" || value === "vip") return value;
  return "user";
}

function parsePlan(value: unknown): PlanId {
  if (value === "standard" || value === "pro" || value === "unlimited") return value;
  return "free";
}

function parseTemplates(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && id.length > 0);
}

function createdIso(value?: string) {
  const ms = Number(value);
  if (!Number.isFinite(ms) || ms <= 0) return new Date().toISOString();
  return new Date(ms).toISOString();
}

async function identityAccessToken() {
  const sa = serviceAccount();
  if (!sa?.clientEmail || !sa.privateKey) return null;
  try {
    const pem = sa.privateKey.includes("BEGIN RSA PRIVATE KEY")
      ? createPrivateKey(sa.privateKey).export({ type: "pkcs8", format: "pem" }).toString()
      : sa.privateKey;
    const key = await importPKCS8(pem, "RS256");
    const now = Math.floor(Date.now() / 1000);
    const assertion = await new SignJWT({
      scope:
        "https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform",
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(sa.clientEmail)
      .setSubject(sa.clientEmail)
      .setAudience("https://oauth2.googleapis.com/token")
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(key);
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    const data = (await res.json()) as { access_token?: string };
    return res.ok && data.access_token ? data.access_token : null;
  } catch {
    return null;
  }
}

async function listIdentityUsers(): Promise<AuthRecord[]> {
  try {
    const sa = serviceAccount();
    const projectId = sa?.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
    const token = await identityAccessToken();
    if (!projectId || !token) return [];
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const batchRes = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:batchGet`, {
      method: "POST",
      headers,
      body: JSON.stringify({ maxResults: 1000 }),
    });
    if (batchRes.ok) {
      const data = (await batchRes.json()) as { users?: AuthRecord[]; userInfo?: AuthRecord[] };
      const rows = data.users ?? data.userInfo;
      if (Array.isArray(rows) && rows.length) return rows;
    }

    const downloadRes = await fetch("https://www.googleapis.com/identitytoolkit/v3/relyingparty/downloadAccount", {
      method: "POST",
      headers,
      body: JSON.stringify({ targetProjectId: projectId, maxResults: 1000 }),
    });
    if (downloadRes.ok) {
      const data = (await downloadRes.json()) as { users?: AuthRecord[] };
      if (Array.isArray(data.users) && data.users.length) return data.users;
    }

    const queryRes = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:query`, {
      method: "POST",
      headers,
      body: JSON.stringify({ returnUserInfo: true, limit: "500" }),
    });
    if (!queryRes.ok) return [];
    const data = (await queryRes.json()) as { userInfo?: AuthRecord[] };
    return Array.isArray(data.userInfo) ? data.userInfo : [];
  } catch {
    return [];
  }
}

function rowFromFirestore(uid: string, data: Record<string, unknown>): AdminUserRow {
  return {
    id: String(data.id ?? `google:${uid}`),
    firebaseUid: uid,
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    picture: data.picture ? String(data.picture) : undefined,
    accountRole: parseRole(data.accountRole),
    plan: parsePlan(data.plan),
    templates: parseTemplates(data.templates),
    createdAt: typeof data.createdAt === "string" ? data.createdAt : undefined,
  };
}

export async function callerIsAdmin(uid: string, email: string) {
  if (isAdminEmail(email)) return true;
  const db = getAdminDb();
  if (!db) return false;
  const snap = await db.collection("users").doc(uid).get();
  return snap.data()?.accountRole === "admin";
}

export async function upsertAuthUser(input: {
  firebaseUid: string;
  name: string;
  email: string;
  picture?: string;
}): Promise<AdminUserRow | null> {
  const db = getAdminDb();
  if (!db || !input.firebaseUid) return null;
  const ref = db.collection("users").doc(input.firebaseUid);
  const snap = await ref.get();
  const now = new Date().toISOString();
  const existing = snap.data() ?? {};
  const row: AdminUserRow = {
    id: `google:${input.firebaseUid}`,
    firebaseUid: input.firebaseUid,
    name: input.name || String(existing.name ?? "") || input.email,
    email: input.email || String(existing.email ?? ""),
    picture: input.picture || (existing.picture ? String(existing.picture) : undefined),
    accountRole: isAdminEmail(input.email) ? "admin" : parseRole(existing.accountRole),
    plan: parsePlan(existing.plan),
    templates: parseTemplates(existing.templates),
    createdAt: typeof existing.createdAt === "string" ? existing.createdAt : now,
  };
  await ref.set(
    {
      id: row.id,
      firebaseUid: row.firebaseUid,
      name: row.name,
      email: row.email,
      picture: row.picture ?? null,
      accountRole: row.accountRole,
      plan: row.plan,
      templates: row.templates ?? [],
      createdAt: row.createdAt,
      updatedAt: now,
    },
    { merge: true },
  );
  return row;
}

export async function patchAdminUser(uid: string, patch: { plan?: PlanId; accountRole?: AccountRole }) {
  const db = getAdminDb();
  if (!db || !uid) throw new Error("firestore");
  const next: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (patch.plan === "free" || patch.plan === "standard" || patch.plan === "pro") next.plan = patch.plan;
  if (patch.accountRole === "user" || patch.accountRole === "vip" || patch.accountRole === "admin") {
    next.accountRole = patch.accountRole;
  }
  await db.collection("users").doc(uid).set(next, { merge: true });
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const db = getAdminDb();
  const byUid = new Map<string, AdminUserRow>();

  if (db) {
    const snap = await db.collection("users").get();
    for (const doc of snap.docs) {
      byUid.set(doc.id, rowFromFirestore(doc.id, (doc.data() ?? {}) as Record<string, unknown>));
    }
  }

  const authUsers = await listIdentityUsers();
  for (const auth of authUsers) {
    const uid = auth.localId?.trim();
    if (!uid) continue;
    const email = auth.email || byUid.get(uid)?.email || "";
    const name = auth.displayName || byUid.get(uid)?.name || email || "Google";
    const existing = byUid.get(uid);
    const row: AdminUserRow = {
      id: existing?.id ?? `google:${uid}`,
      firebaseUid: uid,
      name,
      email,
      picture: auth.photoUrl || existing?.picture,
      accountRole: existing?.accountRole ?? (isAdminEmail(email) ? "admin" : "user"),
      plan: existing?.plan ?? "free",
      templates: existing?.templates ?? [],
      createdAt: existing?.createdAt ?? createdIso(auth.createdAt),
    };
    byUid.set(uid, row);
    if (db && !existing) {
      await upsertAuthUser({
        firebaseUid: uid,
        name: row.name,
        email: row.email,
        picture: row.picture,
      });
    }
  }

  return [...byUid.values()].sort((a, b) => a.email.localeCompare(b.email));
}
