import { describe, expect, it } from "vitest";
import { canEditBeforePayment, invitationIsPaid } from "@/lib/server/accessLogic";

const unpaid = { templateKnown: true, isFree: false, allowed: false, owned: false };

describe("invitationIsPaid", () => {
  it("keeps a page private/demo until the owner pays", () => {
    expect(invitationIsPaid(unpaid)).toBe(false);
  });
  it.each([
    ["free template", { isFree: true }],
    ["paid purchase / pro / admin", { allowed: true }],
    ["owned but editing window expired", { owned: true }],
  ])("is paid for %s", (_name, patch) => {
    expect(invitationIsPaid({ ...unpaid, ...patch })).toBe(true);
  });
  it("keeps legacy pages of removed templates working", () => {
    expect(invitationIsPaid({ ...unpaid, templateKnown: false })).toBe(true);
  });
});

describe("canEditBeforePayment", () => {
  it("lets an unpaid owner edit a catalog template", () => {
    expect(canEditBeforePayment({ allowed: false, templateKnown: true })).toBe(true);
  });
  it("still blocks an expired paid editing window", () => {
    expect(canEditBeforePayment({ allowed: false, expired: true, templateKnown: true })).toBe(false);
  });
  it("rejects an unknown template", () => {
    expect(canEditBeforePayment({ allowed: false, templateKnown: false })).toBe(false);
  });
});
