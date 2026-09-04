import { isAdminEmail } from "../auth";
import { getAdminDb } from "../firebaseAdmin";
import type { AccountRole, PlanId, UserProfile } from "../types";

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

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getAdminDb();
  if (!db || !uid) return null;
  const snap = await db.collection("users").doc(uid).get();
  const data = snap.data() ?? {};
  const email = typeof data.email === "string" ? data.email : "";
  const accountRole = isAdminEmail(email) ? "admin" : parseRole(data.accountRole);
  return {
    id: String(data.id ?? `google:${uid}`),
    firebaseUid: uid,
    name: String(data.name ?? ""),
    role: data.role === "designer" ? "designer" : "host",
    auth: "google",
    email,
    picture: data.picture ? String(data.picture) : undefined,
    plan: parsePlan(data.plan),
    accountRole,
    templates: parseTemplates(data.templates),
  };
}

export async function isAdminUser(uid: string, email?: string) {
  if (isAdminEmail(email)) return true;
  const profile = await loadUserProfile(uid);
  return profile?.accountRole === "admin";
}
