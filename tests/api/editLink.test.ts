import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFromBearer = vi.fn();
const getInvitationDoc = vi.fn();
const saveInvitationDoc = vi.fn();

vi.mock("@/lib/firebaseToken", () => ({ sessionFromBearer: (...a: unknown[]) => sessionFromBearer(...a) }));
vi.mock("@/lib/firebaseAdmin", () => ({ getAdminDb: () => null }));
vi.mock("firebase-admin/firestore", () => ({ FieldValue: { delete: () => null } }));
vi.mock("@/lib/server/access", () => ({ ensurePaidTemplateAccess: vi.fn() }));
vi.mock("@/lib/server/invitationAccess", () => ({
  isInvitationPaid: vi.fn().mockResolvedValue(false),
  invitationViewer: vi.fn().mockResolvedValue({ viewer: "none", paid: false }),
}));
vi.mock("@/lib/server/users", () => ({ isAdminUser: vi.fn().mockResolvedValue(false), loadUserProfile: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/server/invitations", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/invitations")>()),
  getInvitationDoc: (...a: unknown[]) => getInvitationDoc(...a),
  saveInvitationDoc: (...a: unknown[]) => saveInvitationDoc(...a),
}));

import { PUT } from "@/app/api/invitations/route";
import { GET } from "@/app/api/invitations/[id]/route";
import { EDIT_LINK_TTL_MS, editLinkMatches } from "@/lib/server/invitations";

const sha = (t: string) => createHash("sha256").update(t).digest("hex");
const link = (token: string, expiresAt: string) => ({ editLink: { hash: sha(token), expiresAt } });
const inFuture = () => new Date(Date.now() + 3600_000).toISOString();

describe("editLinkMatches", () => {
  it("accepts the right secret before expiry only", () => {
    expect(editLinkMatches(link("s3cret", inFuture()), "s3cret")).toBe(true);
    expect(editLinkMatches(link("s3cret", inFuture()), "other")).toBe(false);
    expect(editLinkMatches(link("s3cret", new Date(Date.now() - 1000).toISOString()), "s3cret")).toBe(false);
    expect(editLinkMatches({}, "s3cret")).toBe(false);
    expect(editLinkMatches(link("s3cret", inFuture()), "")).toBe(false);
  });

  it("lasts exactly one week", () => {
    expect(EDIT_LINK_TTL_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe("saving and reading through an edit link", () => {
  const stored = { id: "inv1", templateId: "t1", ownerUid: "owner1", ownerId: "google:owner1", responsesToken: "r", ...link("s3cret", inFuture()) };
  const put = (token?: string) => PUT(new NextRequest("http://localhost/api/invitations", {
    method: "PUT", headers: token ? { "x-edit-token": token } : {}, body: JSON.stringify({ invitation: { id: "inv1", templateId: "t1" } }),
  }));

  beforeEach(() => {
    sessionFromBearer.mockReset().mockResolvedValue(null);
    getInvitationDoc.mockReset().mockResolvedValue(stored);
    saveInvitationDoc.mockReset().mockResolvedValue(true);
  });

  it("saves without a login and keeps the page's real owner", async () => {
    const res = await put("s3cret");
    expect(res.status).toBe(200);
    expect(saveInvitationDoc).toHaveBeenCalledWith(expect.objectContaining({ ownerUid: "owner1", isAdmin: true }));
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain("editLink");
    expect(JSON.stringify(body)).not.toContain("responsesToken");
  });

  it("refuses a wrong token, an expired token and a request with nothing", async () => {
    expect((await put("wrong")).status).toBe(403);
    getInvitationDoc.mockResolvedValue({ ...stored, ...link("s3cret", new Date(Date.now() - 1000).toISOString()) });
    expect((await put("s3cret")).status).toBe(403);
    expect((await put()).status).toBe(401);
    expect(saveInvitationDoc).not.toHaveBeenCalled();
  });

  it("lets the link read an unpaid page, without exposing secrets", async () => {
    const ctx = { params: Promise.resolve({ id: "inv1" }) };
    const get = (token?: string) => GET(new NextRequest("http://localhost/api/invitations/inv1", { headers: token ? { "x-edit-token": token } : {} }), ctx);
    expect((await get()).status).toBe(404);
    const res = await get("s3cret");
    expect(res.status).toBe(200);
    expect(JSON.stringify(await res.json())).not.toMatch(/editLink|responsesToken/);
  });
});
