import { describe, expect, it } from "vitest";
import {
  TEMPLATE_ACCESS_TTL_MS,
  canSaveInvitation,
  canUserAccessTemplateFromFacts,
  isFinikSucceeded,
  isPaidPurchaseStatus,
  purchasePriceLocked,
  resolveTemplatePriceForUser,
  templateAccessExpiresAt,
  userTemplatePriceId,
  type AccessFacts,
} from "@/lib/server/accessLogic";
import { inFuture, inPast } from "../fixtures";

const base: AccessFacts = {
  accountRole: "guest",
  plan: "free",
  isAdminEmail: false,
  isFreeTemplate: false,
  hasPaidPurchase: false,
  hasTemplateAccess: false,
};

describe("templateAccessExpiresAt", () => {
  it("expires a plain purchase after the TTL", () => {
    const granted = "2026-01-01T00:00:00.000Z";
    expect(templateAccessExpiresAt("purchase", granted)).toBe(new Date(Date.parse(granted) + TEMPLATE_ACCESS_TTL_MS).toISOString());
  });
  it.each(["free", "pro", "vip", "admin"] as const)("never expires %s access", (type) => {
    expect(templateAccessExpiresAt(type, "2026-01-01T00:00:00.000Z")).toBeNull();
  });
  it("returns null for an invalid grant date", () => {
    expect(templateAccessExpiresAt("purchase", "not-a-date")).toBeNull();
  });
});

describe("canUserAccessTemplateFromFacts", () => {
  it("allows admins by email or role", () => {
    expect(canUserAccessTemplateFromFacts({ ...base, isAdminEmail: true })).toEqual({ allowed: true, accessType: "admin" });
    expect(canUserAccessTemplateFromFacts({ ...base, accountRole: "admin" })).toEqual({ allowed: true, accessType: "admin" });
  });
  it("allows an active pro account", () => {
    expect(canUserAccessTemplateFromFacts({ ...base, accountRole: "pro", proExpiresAt: inFuture() })).toEqual({ allowed: true, accessType: "pro" });
  });
  it("does not allow an expired pro account on a paid template", () => {
    expect(canUserAccessTemplateFromFacts({ ...base, accountRole: "pro", proExpiresAt: inPast() }).allowed).toBe(false);
  });
  it("allows free templates for everyone", () => {
    expect(canUserAccessTemplateFromFacts({ ...base, isFreeTemplate: true })).toEqual({ allowed: true, accessType: "free" });
  });
  it("allows a paid purchase that has not expired", () => {
    expect(canUserAccessTemplateFromFacts({ ...base, hasPaidPurchase: true, templateAccessExpiresAt: inFuture() })).toEqual({ allowed: true, accessType: "purchase" });
  });
  it("allows a purchase with no deadline", () => {
    expect(canUserAccessTemplateFromFacts({ ...base, hasTemplateAccess: true }).allowed).toBe(true);
  });
  it("denies an expired purchase and flags it", () => {
    expect(canUserAccessTemplateFromFacts({ ...base, hasPaidPurchase: true, templateAccessExpiresAt: inPast() })).toEqual({ allowed: false, accessType: null, expired: true });
  });
  it("denies with no facts", () => {
    expect(canUserAccessTemplateFromFacts(base)).toEqual({ allowed: false, accessType: null });
  });
});

describe("resolveTemplatePriceForUser", () => {
  it("is free for free templates regardless of prices", () => {
    expect(resolveTemplatePriceForUser({ isFree: true, individualPrice: 100, basePrice: 500 })).toBe(0);
  });
  it("prefers a valid individual price, including 0", () => {
    expect(resolveTemplatePriceForUser({ isFree: false, individualPrice: 100, basePrice: 500 })).toBe(100);
    expect(resolveTemplatePriceForUser({ isFree: false, individualPrice: 0, basePrice: 500 })).toBe(0);
  });
  it("falls back to base price when the individual price is invalid", () => {
    expect(resolveTemplatePriceForUser({ isFree: false, individualPrice: -5, basePrice: 500 })).toBe(500);
    expect(resolveTemplatePriceForUser({ isFree: false, individualPrice: NaN, basePrice: 500 })).toBe(500);
    expect(resolveTemplatePriceForUser({ isFree: false, individualPrice: null, basePrice: 500 })).toBe(500);
  });
  it("clamps an invalid base price to 0", () => {
    expect(resolveTemplatePriceForUser({ isFree: false, basePrice: -1 })).toBe(0);
    expect(resolveTemplatePriceForUser({ isFree: false, basePrice: Infinity })).toBe(0);
  });
});

describe("purchase helpers", () => {
  it("recognises paid statuses", () => {
    expect(isPaidPurchaseStatus("paid")).toBe(true);
    expect(isPaidPurchaseStatus("succeeded")).toBe(true);
    expect(isPaidPurchaseStatus("pending")).toBe(false);
    expect(isPaidPurchaseStatus(undefined)).toBe(false);
    expect(purchasePriceLocked("paid")).toBe(true);
    expect(purchasePriceLocked("failed")).toBe(false);
  });
  it("builds price ids", () => {
    expect(userTemplatePriceId("u1", "t1")).toBe("u1_t1");
  });
  it("normalises Finik statuses", () => {
    expect(isFinikSucceeded(" success ")).toBe(true);
    expect(isFinikSucceeded("PAID")).toBe(true);
    expect(isFinikSucceeded("FAILED")).toBe(false);
    expect(isFinikSucceeded(undefined)).toBe(false);
  });
});

describe("canSaveInvitation", () => {
  it("rejects editing someone else's invitation", () => {
    expect(canSaveInvitation({ existing: true, owns: false, accessAllowed: true })).toEqual({ ok: false, reason: "owner" });
  });
  it("rejects when access is missing or expired", () => {
    expect(canSaveInvitation({ existing: false, owns: true, accessAllowed: false })).toEqual({ ok: false, reason: "access" });
    expect(canSaveInvitation({ existing: true, owns: true, accessAllowed: false, accessExpired: true })).toEqual({ ok: false, reason: "expired" });
  });
  it("allows the owner with access, and new invitations", () => {
    expect(canSaveInvitation({ existing: true, owns: true, accessAllowed: true })).toEqual({ ok: true });
    expect(canSaveInvitation({ existing: false, owns: false, accessAllowed: true })).toEqual({ ok: true });
  });
});
