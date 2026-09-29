import { describe, expect, it } from "vitest";
import { checkoutReturn, paymentReturnHref } from "@/lib/checkoutReturn";
import { PUBLIC_SITE_ORIGIN, paymentOrigin } from "@/lib/paymentOrigin";
import { adminUserErrorCode, adminUserErrorMessage } from "@/lib/adminUserErrors";
import { DEFAULT_VENUE, invitationMapUrl } from "@/lib/defaultVenue";
import { buildShareMessage } from "@/lib/shareMessage";
import { makeInvitation } from "../fixtures";

describe("checkoutReturn", () => {
  it("reads plain params", () => {
    expect(checkoutReturn("template=abc&pid=p1")).toEqual({ templateId: "abc", paymentId: "p1" });
  });
  it("recovers a provider param glued onto the template id", () => {
    expect(checkoutReturn("template=abc?paymentId=42")).toEqual({ templateId: "abc", paymentId: "42" });
  });
  it("accepts alternative payment id names", () => {
    expect(checkoutReturn("template=a&PaymentId=9").paymentId).toBe("9");
  });
  it("rejects unsafe template ids", () => {
    expect(checkoutReturn("template=../etc").templateId).toBe("");
    expect(checkoutReturn("template=a b").templateId).toBe("");
    expect(checkoutReturn("").templateId).toBe("");
  });
  it("builds the return href", () => {
    expect(paymentReturnHref("p1", "t1")).toBe("/pay/return?pid=p1&template=t1");
    expect(paymentReturnHref("p1", "")).toBe("/pay/return?pid=p1");
  });
});

describe("paymentOrigin", () => {
  it("canonicalises known hosts", () => {
    expect(paymentOrigin("https://chakyru.vercel.app/x")).toBe(PUBLIC_SITE_ORIGIN);
    expect(paymentOrigin("https://toichakyru.com/x", "https://stale.example.com")).toBe(PUBLIC_SITE_ORIGIN);
  });
  it("uses the configured origin off the public site", () => {
    expect(paymentOrigin("http://localhost:3000/a", "https://staging.example.com/b")).toBe("https://staging.example.com");
  });
  it("falls back to the request origin, then the public origin", () => {
    expect(paymentOrigin("http://localhost:3000/a")).toBe("http://localhost:3000");
    expect(paymentOrigin("garbage", "also garbage")).toBe(PUBLIC_SITE_ORIGIN);
  });
  it("rejects origins with credentials or non-http protocols", () => {
    expect(paymentOrigin("https://u:p@evil.com/x")).toBe(PUBLIC_SITE_ORIGIN);
    expect(paymentOrigin("javascript:alert(1)")).toBe(PUBLIC_SITE_ORIGIN);
  });
});

describe("adminUserErrors", () => {
  it.each([
    [{ message: "firebase-admin-not-configured" }, "firebase-config"],
    [{ code: "auth/insufficient-permission" }, "firebase-permission"],
    [{ code: "7" }, "firebase-permission"],
    [{ code: "app/invalid-credential" }, "firebase-credential"],
    [{ code: "ERR_REQUIRE_ESM" }, "firebase-runtime"],
    [{ code: "ETIMEDOUT" }, "firebase-unavailable"],
    [{ code: "something-else" }, "users"],
    [null, "users"],
  ])("maps %j to %s", (error, code) => {
    expect(adminUserErrorCode(error)).toBe(code);
  });
  it("localises messages and falls back", () => {
    const ru = adminUserErrorMessage("firebase-config", true, "fb");
    const ky = adminUserErrorMessage("firebase-config", false, "fb");
    expect(ru).not.toBe(ky);
    expect(ru).toContain("FIREBASE_SERVICE_ACCOUNT");
    expect(adminUserErrorMessage("users", true, "fallback")).toBe("fallback");
  });
});

describe("invitationMapUrl", () => {
  const base = { venue: "", address: "", city: "", mapUrl: "" };
  it("prefers an explicit map url", () => {
    expect(invitationMapUrl({ ...base, mapUrl: "https://maps.example/x" })).toBe("https://maps.example/x");
  });
  it("uses the default venue map for the default or empty venue", () => {
    expect(invitationMapUrl(base)).toBe(DEFAULT_VENUE.mapUrl);
    expect(invitationMapUrl({ ...base, venue: DEFAULT_VENUE.venue })).toBe(DEFAULT_VENUE.mapUrl);
  });
  it("builds a 2GIS search for custom venues", () => {
    expect(invitationMapUrl({ venue: "Зал", address: "ул. А 1", city: "Ош", mapUrl: "" }))
      .toBe(`https://2gis.kg/search/${encodeURIComponent("Зал, ул. А 1, Ош")}`);
  });
});

describe("buildShareMessage", () => {
  const url = "https://www.toichakyru.com/i/abc";
  const inv = makeInvitation({ eventType: "wedding", names: "Айбек & Айгүл", date: "2026-06-06", time: "16:00", venue: "Зал", city: "Бишкек" });

  it("builds a Russian message with all details", () => {
    const text = buildShareMessage(inv, "ru", url);
    expect(text).toContain("Айбек & Айгүл");
    expect(text).toContain("нашу свадьбу");
    expect(text).toContain("Дата: 6 июня");
    expect(text).toContain("Время: 16:00");
    expect(text).toContain("Место: Зал, Бишкек");
    expect(text).toContain(url);
  });
  it("builds a Kyrgyz message", () => {
    const text = buildShareMessage(inv, "ky", url);
    expect(text).toContain("үйлөнүү тоюбузга");
    expect(text).toContain("Күнү: 6-июнь");
    expect(text).toContain(url);
  });
  it("omits missing details", () => {
    const text = buildShareMessage(makeInvitation({ names: "", date: "", time: "", venue: "", city: "" }), "ru", url);
    expect(text).not.toContain("Дата:");
    expect(text).not.toContain("Время:");
    expect(text).not.toContain("Место:");
  });
  it("ignores a malformed date", () => {
    expect(buildShareMessage(makeInvitation({ date: "06/06/2026" }), "ru", url)).not.toContain("Дата:");
  });
  it("does not use surrogate-pair emoji", () => {
    expect(buildShareMessage(inv, "ru", url)).not.toMatch(/[\uD800-\uDFFF]/);
  });
});
