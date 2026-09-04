import type { AccountRole, PlanId, TemplateAccessType } from "../types";

export type AccessFacts = {
  accountRole: AccountRole;
  plan: PlanId;
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
  if (facts.accountRole === "vip") {
    return { allowed: true, accessType: "vip" };
  }
  if (facts.plan === "pro" || facts.plan === "unlimited") {
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
