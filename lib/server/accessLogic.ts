import type { AccountRole, PlanId, TemplateAccessType } from "../types";
import { hasActivePro } from "../proAccess";

// A standard (non-pro) template purchase grants editing access for this long from the grant.
export const TEMPLATE_ACCESS_TTL_MS = 14 * 24 * 60 * 60 * 1000;

/** Only a plain "purchase" grant expires; free/pro/vip/admin access never carries a per-template deadline. */
export function templateAccessExpiresAt(accessType: TemplateAccessType, grantedAt: string): string | null {
  if (accessType !== "purchase") return null;
  const granted = Date.parse(grantedAt);
  if (!Number.isFinite(granted)) return null;
  return new Date(granted + TEMPLATE_ACCESS_TTL_MS).toISOString();
}

export type AccessFacts = {
  accountRole: AccountRole;
  plan: PlanId;
  proExpiresAt?: string | null;
  isAdminEmail: boolean;
  isFreeTemplate: boolean;
  hasPaidPurchase: boolean;
  hasTemplateAccess: boolean;
  templateAccessExpiresAt?: string | null;
};

export type AccessDecision = {
  allowed: boolean;
  accessType: TemplateAccessType | null;
  expired?: boolean;
};

export function canUserAccessTemplateFromFacts(facts: AccessFacts): AccessDecision {
  if (facts.isAdminEmail || facts.accountRole === "admin") {
    return { allowed: true, accessType: "admin" };
  }
  if (hasActivePro(facts)) {
    return { allowed: true, accessType: "pro" };
  }
  if (facts.isFreeTemplate) {
    return { allowed: true, accessType: "free" };
  }
  if (facts.hasPaidPurchase || facts.hasTemplateAccess) {
    const expired = Boolean(facts.templateAccessExpiresAt && Date.parse(facts.templateAccessExpiresAt) <= Date.now());
    if (expired) return { allowed: false, accessType: null, expired: true };
    return { allowed: true, accessType: "purchase" };
  }
  return { allowed: false, accessType: null };
}

export function resolveTemplatePriceForUser(input: {
  isFree: boolean;
  individualPrice?: number | null;
  basePrice: number;
}): number {
  if (input.isFree) return 0;
  if (typeof input.individualPrice === "number" && Number.isFinite(input.individualPrice) && input.individualPrice >= 0) {
    return input.individualPrice;
  }
  const base = Number.isFinite(input.basePrice) && input.basePrice >= 0 ? input.basePrice : 0;
  return base;
}

export function isPaidPurchaseStatus(status?: string) {
  return status === "paid" || status === "succeeded";
}

export function purchasePriceLocked(status?: string) {
  return isPaidPurchaseStatus(status);
}

export function userTemplatePriceId(userId: string, templateId: string) {
  return `${userId}_${templateId}`;
}

export function isFinikSucceeded(status?: string) {
  return ["SUCCESS", "SUCCEEDED", "PAID"].includes(String(status || "").trim().toUpperCase());
}

export function canSaveInvitation(facts: {
  existing: boolean;
  owns: boolean;
  accessAllowed: boolean;
  accessExpired?: boolean;
}): { ok: boolean; reason?: "owner" | "access" | "expired" } {
  if (facts.existing && !facts.owns) return { ok: false, reason: "owner" };
  if (!facts.accessAllowed) return { ok: false, reason: facts.accessExpired ? "expired" : "access" };
  return { ok: true };
}
