import type { AccountRole, PlanId, TemplateAccessType } from "../types";
import { hasActivePro } from "../proAccess";

export type AccessFacts = {
  accountRole: AccountRole;
  plan: PlanId;
  proExpiresAt?: string | null;
  isAdminEmail: boolean;
  isFreeTemplate: boolean;
  hasPaidPurchase: boolean;
  hasTemplateAccess: boolean;
};

export type AccessDecision = {
  allowed: boolean;
  accessType: TemplateAccessType | null;
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
}): { ok: boolean; reason?: "owner" | "access" } {
  if (facts.existing && !facts.owns) return { ok: false, reason: "owner" };
  if (!facts.accessAllowed) return { ok: false, reason: "access" };
  return { ok: true };
}
