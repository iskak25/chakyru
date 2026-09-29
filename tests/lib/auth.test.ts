import { describe, expect, it } from "vitest";
import {
  adminEmails, canCreateInvitation, canEditInvitation, canEditTemplate, canSubscribe, isAdmin, isAdminEmail,
  mergePaidAccess, myInvitations, normalizeUser, ownsInvitation, planLoginHref, userIdentityIds,
} from "@/lib/auth";
import { inFuture, inPast, makeInvitation, makeUser } from "../fixtures";

describe("admin emails", () => {
  it("includes bootstrap admins, case-insensitively", () => {
    expect(isAdminEmail("ISKAK2512@gmail.com")).toBe(true);
    expect(isAdminEmail(" iskak2512@gmail.com ")).toBe(true);
    expect(isAdminEmail("nobody@example.com")).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });
  it("has no duplicates", () => {
    const list = adminEmails();
    expect(new Set(list).size).toBe(list.length);
  });
});

describe("normalizeUser", () => {
  it("builds ids from the name for name logins", () => {
    const user = normalizeUser({ name: " John ", auth: "name" });
    expect(user.id).toBe("name:john");
    expect(user.auth).toBe("name");
  });
  it("builds ids from the email for google logins", () => {
    expect(normalizeUser({ name: "A", auth: "google", email: "a@b.c" }).id).toBe("google:a@b.c");
  });
  it("defaults unknown values", () => {
    const user = normalizeUser({ name: "A", role: "weird" as never, accountRole: "weird" as never, templates: ["t1", 5 as never] });
    expect(user.role).toBe("host");
    expect(user.accountRole).toBe("guest");
    expect(user.templates).toEqual(["t1"]);
  });
  it("downgrades an expired pro account", () => {
    const user = normalizeUser({ name: "A", accountRole: "pro", proExpiresAt: inPast() });
    expect(user.accountRole).toBe("guest");
    expect(user.plan).toBe("free");
  });
  it("keeps an active pro account", () => {
    const user = normalizeUser({ name: "A", accountRole: "pro", proExpiresAt: inFuture() });
    expect(user.accountRole).toBe("pro");
    expect(user.plan).toBe("pro");
  });
});

describe("isAdmin", () => {
  it("requires a google login", () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(makeUser({ auth: "name", accountRole: "admin" }))).toBe(false);
    expect(isAdmin(makeUser({ accountRole: "admin" }))).toBe(true);
    expect(isAdmin(makeUser({ email: "iskak2512@gmail.com" }))).toBe(true);
    expect(isAdmin(makeUser())).toBe(false);
  });
});

describe("ownership", () => {
  it("collects every identity alias", () => {
    expect(userIdentityIds(makeUser()).sort()).toEqual(["google:uid1", "uid1", "user@example.com", "google:user@example.com"].sort());
    expect(userIdentityIds(null)).toEqual([]);
  });
  it("matches by ownerId or ownerUid", () => {
    const user = makeUser();
    expect(ownsInvitation(user, { ownerId: "google:uid1" })).toBe(true);
    expect(ownsInvitation(user, { ownerUid: "uid1" })).toBe(true);
    expect(ownsInvitation(user, { ownerId: "google:other" })).toBe(false);
    expect(ownsInvitation(user, { ownerUid: "other" })).toBe(false);
  });
  it("treats ownerless invitations as owned, and admins as owners of everything", () => {
    expect(ownsInvitation(makeUser(), {})).toBe(true);
    expect(ownsInvitation(makeUser({ accountRole: "admin" }), { ownerId: "x" })).toBe(true);
  });
  it("is false without a user or invitation", () => {
    expect(ownsInvitation(null, {})).toBe(false);
    expect(ownsInvitation(makeUser(), null)).toBe(false);
  });
});

describe("myInvitations", () => {
  it("filters demo/preview invitations and other owners", () => {
    const list = [
      makeInvitation({ id: "a", ownerUid: "uid1" }),
      makeInvitation({ id: "demo" }),
      makeInvitation({ id: "preview-1" }),
      makeInvitation({ id: "b", ownerUid: "someone" }),
    ];
    expect(myInvitations(makeUser(), list).map((i) => i.id)).toEqual(["a"]);
    expect(myInvitations(null, list)).toEqual([]);
  });
});

describe("template editing rights", () => {
  it("needs a google login", () => {
    expect(canEditTemplate(null, "t1")).toBe(false);
    expect(canEditTemplate(makeUser({ auth: "name", templates: ["t1"] }), "t1")).toBe(false);
  });
  it("allows purchased templates only", () => {
    const user = makeUser({ templates: ["t1"] });
    expect(canEditTemplate(user, "t1")).toBe(true);
    expect(canEditTemplate(user, "t2")).toBe(false);
    expect(canEditTemplate(user)).toBe(true);
    expect(canEditTemplate(makeUser())).toBe(false);
  });
  it("allows everything for admins and active pro", () => {
    expect(canEditTemplate(makeUser({ accountRole: "admin" }), "any")).toBe(true);
    expect(canEditTemplate(makeUser({ accountRole: "pro", proExpiresAt: inFuture() }), "any")).toBe(true);
    expect(canEditTemplate(makeUser({ accountRole: "pro", proExpiresAt: inPast() }), "any")).toBe(false);
  });
  it("canEditInvitation combines ownership and template access", () => {
    const user = makeUser({ templates: ["tpl1"] });
    expect(canEditInvitation(user, { ownerUid: "uid1", templateId: "tpl1" })).toBe(true);
    expect(canEditInvitation(user, { ownerUid: "uid1", templateId: "tpl2" })).toBe(false);
    expect(canEditInvitation(user, { ownerUid: "other", templateId: "tpl1" })).toBe(false);
    expect(canEditInvitation(user, null)).toBe(false);
    expect(canEditInvitation(makeUser({ accountRole: "admin" }), { ownerUid: "other", templateId: "x" })).toBe(true);
  });
  it("canCreateInvitation / canSubscribe", () => {
    expect(canCreateInvitation(makeUser({ templates: ["t"] }))).toBe(true);
    expect(canCreateInvitation(makeUser())).toBe(false);
    expect(canSubscribe(makeUser())).toBe(true);
    expect(canSubscribe(makeUser({ auth: "name" }))).toBe(false);
    expect(canSubscribe(null)).toBe(false);
  });
});

describe("mergePaidAccess", () => {
  it("lets the server revoke access", () => {
    const local = makeUser({ accountRole: "pro", plan: "pro", proExpiresAt: inFuture(), templates: ["t1"] });
    const merged = mergePaidAccess(local, { accountRole: "guest", plan: "free", proExpiresAt: null, templates: [] });
    expect(merged.accountRole).toBe("guest");
    expect(merged.plan).toBe("free");
    expect(merged.templates).toEqual([]);
  });
});

describe("planLoginHref", () => {
  it("builds standard and pro links", () => {
    expect(planLoginHref("standard", "t1")).toBe("/login?plan=standard&google=1&from=t1");
    expect(planLoginHref("pro", undefined, 3)).toBe("/login?plan=pro&google=1&months=3");
  });
});
