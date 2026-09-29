import { describe, expect, it } from "vitest";
import { addProMonths, effectiveAccount, grantProPeriod, hasActivePro } from "@/lib/proAccess";
import { inFuture, inPast } from "../fixtures";

describe("hasActivePro", () => {
  it("needs a pro/vip role and a future expiry", () => {
    expect(hasActivePro({ accountRole: "pro", proExpiresAt: inFuture() })).toBe(true);
    expect(hasActivePro({ accountRole: "vip", proExpiresAt: inFuture() })).toBe(true);
    expect(hasActivePro({ accountRole: "pro", proExpiresAt: inPast() })).toBe(false);
    expect(hasActivePro({ accountRole: "guest", proExpiresAt: inFuture() })).toBe(false);
    expect(hasActivePro({ accountRole: "pro" })).toBe(false);
    expect(hasActivePro(null)).toBe(false);
    expect(hasActivePro(undefined)).toBe(false);
  });
  it("honours a custom clock", () => {
    const account = { accountRole: "pro", proExpiresAt: "2026-06-01T00:00:00.000Z" };
    expect(hasActivePro(account, Date.parse("2026-05-31T00:00:00.000Z"))).toBe(true);
    expect(hasActivePro(account, Date.parse("2026-06-01T00:00:00.000Z"))).toBe(false);
  });
});

describe("effectiveAccount", () => {
  it("keeps admins", () => {
    expect(effectiveAccount({ accountRole: "admin" })).toEqual({ accountRole: "admin", plan: "free" });
  });
  it("keeps active pro", () => {
    expect(effectiveAccount({ accountRole: "pro", proExpiresAt: inFuture() })).toEqual({ accountRole: "pro", plan: "pro" });
  });
  it("downgrades expired pro to guest, keeping a standard plan", () => {
    expect(effectiveAccount({ accountRole: "pro", proExpiresAt: inPast(), plan: "standard" })).toEqual({ accountRole: "guest", plan: "standard" });
    expect(effectiveAccount({ accountRole: "pro", proExpiresAt: inPast(), plan: "pro" })).toEqual({ accountRole: "guest", plan: "free" });
  });
});

describe("addProMonths", () => {
  it("adds calendar months in UTC", () => {
    expect(addProMonths("2026-01-15T10:00:00.000Z", 1)).toBe("2026-02-15T10:00:00.000Z");
    expect(addProMonths("2026-11-15T00:00:00.000Z", 3)).toBe("2027-02-15T00:00:00.000Z");
  });
  it("clamps to the last day of a shorter month", () => {
    expect(addProMonths("2026-01-31T00:00:00.000Z", 1)).toBe("2026-02-28T00:00:00.000Z");
    expect(addProMonths("2028-01-31T00:00:00.000Z", 1)).toBe("2028-02-29T00:00:00.000Z");
  });
  it("rejects invalid input", () => {
    expect(() => addProMonths("2026-01-01T00:00:00.000Z", 0)).toThrow("months");
    expect(() => addProMonths("2026-01-01T00:00:00.000Z", 13)).toThrow("months");
    expect(() => addProMonths("2026-01-01T00:00:00.000Z", 1.5)).toThrow("months");
    expect(() => addProMonths("garbage", 1)).toThrow("date");
  });
});

describe("grantProPeriod", () => {
  const now = "2026-03-01T00:00:00.000Z";
  it("starts from now for a new grant", () => {
    expect(grantProPeriod({ accountRole: "guest" }, 2, now)).toEqual({
      accountRole: "pro", plan: "pro", proStartedAt: now, proExpiresAt: "2026-05-01T00:00:00.000Z",
    });
  });
  it("extends an active period from its expiry and keeps the start", () => {
    const account = { accountRole: "pro", proStartedAt: "2026-02-01T00:00:00.000Z", proExpiresAt: "2026-04-01T00:00:00.000Z" };
    expect(grantProPeriod(account, 1, now, true)).toEqual({
      accountRole: "pro", plan: "pro", proStartedAt: "2026-02-01T00:00:00.000Z", proExpiresAt: "2026-05-01T00:00:00.000Z",
    });
  });
  it("restarts when extending an expired period", () => {
    const account = { accountRole: "pro", proStartedAt: "2025-01-01T00:00:00.000Z", proExpiresAt: "2025-02-01T00:00:00.000Z" };
    expect(grantProPeriod(account, 1, now, true).proExpiresAt).toBe("2026-04-01T00:00:00.000Z");
  });
  it("does not demote admins", () => {
    expect(grantProPeriod({ accountRole: "admin" }, 1, now).accountRole).toBe("admin");
  });
});
