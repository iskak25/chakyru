import type { AccountRole, PlanId } from "./types";

export type ProPeriod = { proStartedAt?: string | null; proExpiresAt?: string | null };
type Account = ProPeriod & { accountRole?: unknown; plan?: unknown };

export function hasActivePro(account: Account | null | undefined, now = Date.now()): boolean {
  if (!account || !["pro", "vip"].includes(String(account.accountRole))) return false;
  const expires = Date.parse(account.proExpiresAt || "");
  return Number.isFinite(expires) && expires > now;
}

export function effectiveAccount(account: Account, now = Date.now()): { accountRole: AccountRole; plan: PlanId } {
  if (account.accountRole === "admin") return { accountRole: "admin", plan: "free" };
  if (hasActivePro(account, now)) return { accountRole: "pro", plan: "pro" };
  return { accountRole: "guest", plan: account.plan === "standard" ? "standard" : "free" };
}

/** Calendar months in UTC; January 31 + one month becomes the last day of February. */
export function addProMonths(start: string, months: number): string {
  if (!Number.isInteger(months) || months < 1 || months > 12) throw new Error("months");
  const date = new Date(start);
  if (!Number.isFinite(date.getTime())) throw new Error("date");
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString();
}

export function grantProPeriod(account: Account, months: number, now = new Date().toISOString(), extend = false) {
  const start = extend && hasActivePro(account, Date.parse(now)) ? account.proExpiresAt! : now;
  return {
    accountRole: account.accountRole === "admin" ? "admin" as const : "pro" as const,
    plan: "pro" as const,
    proStartedAt: extend && hasActivePro(account, Date.parse(now)) ? account.proStartedAt || now : now,
    proExpiresAt: addProMonths(start, months),
  };
}
