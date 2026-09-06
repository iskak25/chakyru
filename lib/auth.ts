import type { AccountRole, Invitation, User } from "./types";

function parseAccountRole(value: unknown): AccountRole {
  if (value === "admin" || value === "vip") return value;
  return "user";
}

const BOOTSTRAP_ADMIN_EMAILS = ["dastaniskak0302@gmail.com", "iskak2512@gmail.com"];

export function adminEmails() {
  const fromEnv = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...BOOTSTRAP_ADMIN_EMAILS, ...fromEnv])];
}

export function isAdminEmail(email?: string) {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export function normalizeUser(raw: Partial<User> & { name: string }): User {
  const auth = raw.auth === "google" ? "google" : "name";
  return {
    id:
      raw.id ||
      (auth === "google"
        ? `google:${raw.email || raw.name}`
        : `name:${raw.name.trim().toLowerCase()}`),
    name: raw.name,
    role: raw.role === "designer" ? "designer" : "host",
    auth,
    email: raw.email,
    picture: raw.picture,
    plan: raw.plan ?? "free",
    accountRole: parseAccountRole(raw.accountRole),
    templates: Array.isArray(raw.templates) ? raw.templates.filter((id): id is string => typeof id === "string") : [],
  };
}

export function isAdmin(user: User | null) {
  if (!user || user.auth !== "google") return false;
  return user.accountRole === "admin" || isAdminEmail(user.email);
}

export function isAdminUser(user: User | null) {
  return isAdmin(user);
}

export function myInvitations(user: User | null, list: Invitation[]): Invitation[] {
  if (!user) return [];
  return list.filter((inv) => inv.id !== "demo" && !inv.id.startsWith("preview-") && ownsInvitation(user, inv));
}

export function canEditTemplate(user: User | null, templateId?: string): boolean {
  if (!user || user.auth !== "google") return false;
  if (isAdminUser(user) || user.accountRole === "vip") return true;
  if (user.plan === "pro" || user.plan === "unlimited") return true;
  if (!templateId) return (user.templates?.length ?? 0) > 0;
  if (templateId === "klassika") return true;
  return (user.templates ?? []).includes(templateId);
}

export function userIdentityIds(user: User | null): string[] {
  if (!user) return [];
  const ids = new Set<string>([user.id]);
  const raw = user.id.startsWith("google:") ? user.id.slice("google:".length) : user.id;
  if (raw) {
    ids.add(raw);
    ids.add(`google:${raw}`);
  }
  if (user.email) {
    ids.add(user.email);
    ids.add(`google:${user.email}`);
  }
  return [...ids];
}

export function ownsInvitation(
  user: User | null,
  inv?: { ownerId?: string; ownerUid?: string } | null,
): boolean {
  if (!user || !inv) return false;
  if (isAdmin(user)) return true;
  const ids = userIdentityIds(user);
  if (inv.ownerId && ids.includes(inv.ownerId)) return true;
  if (inv.ownerUid && (ids.includes(inv.ownerUid) || ids.includes(`google:${inv.ownerUid}`))) return true;
  return !inv.ownerId && !inv.ownerUid;
}

export function canEditInvitation(
  user: User | null,
  inv?: { ownerId?: string; ownerUid?: string; templateId?: string } | null,
): boolean {
  if (!user || user.auth !== "google" || !inv) return false;
  if (isAdmin(user)) return true;
  if (!ownsInvitation(user, inv)) return false;
  return canEditTemplate(user, inv.templateId);
}

export function canCreateInvitation(user: User | null, _list?: Invitation[]): boolean {
  return canEditTemplate(user);
}

export function canSubscribe(user: User | null): boolean {
  return Boolean(user && user.auth === "google");
}

function planRank(plan?: string) {
  if (plan === "pro" || plan === "unlimited") return 2;
  if (plan === "standard") return 1;
  return 0;
}

export function mergePaidAccess(
  current: User,
  remote: Partial<Pick<User, "plan" | "templates" | "accountRole">>,
): User {
  const plan = planRank(remote.plan) >= planRank(current.plan) ? remote.plan || current.plan : current.plan;
  const templates = [...new Set([...(current.templates ?? []), ...(remote.templates ?? [])])];
  return {
    ...current,
    accountRole: remote.accountRole || current.accountRole,
    plan,
    templates,
  };
}

export function planLoginHref(plan: "standard" | "pro", templateId?: string) {
  const q = new URLSearchParams({ plan, google: "1" });
  if (templateId) q.set("from", templateId);
  return `/login?${q.toString()}`;
}
