import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFromBearer = vi.fn();
const getInvitationDoc = vi.fn();
const invitationViewer = vi.fn();

vi.mock("@/lib/firebaseToken", () => ({ sessionFromBearer: (...a: unknown[]) => sessionFromBearer(...a) }));
vi.mock("@/lib/server/invitations", () => ({
  getInvitationDoc: (...a: unknown[]) => getInvitationDoc(...a),
  deleteInvitationDoc: vi.fn(),
}));
vi.mock("@/lib/server/invitationAccess", () => ({ invitationViewer: (...a: unknown[]) => invitationViewer(...a) }));
vi.mock("@/lib/server/users", () => ({ isAdminUser: vi.fn(), loadUserProfile: vi.fn() }));

import { GET } from "@/app/api/invitations/[id]/route";

const ctx = { params: Promise.resolve({ id: "inv1" }) };
const get = (auth?: string) =>
  GET(new NextRequest("http://localhost/api/invitations/inv1", { headers: auth ? { authorization: auth } : {} }), ctx);

const inv = { id: "inv1", templateId: "t1", names: "Secret & Names" };

beforeEach(() => {
  sessionFromBearer.mockReset().mockResolvedValue(null);
  getInvitationDoc.mockReset().mockResolvedValue(inv);
  invitationViewer.mockReset();
});

describe("GET /api/invitations/[id]", () => {
  it("hides an unpaid page from strangers exactly like a missing one", async () => {
    invitationViewer.mockResolvedValue({ viewer: "none", paid: false });
    const res = await get();
    expect(res.status).toBe(404);
    expect(JSON.stringify(await res.json())).not.toContain("Secret");
  });

  it("shows an unpaid page to its owner, flagged as unpaid", async () => {
    sessionFromBearer.mockResolvedValue({ uid: "u1" });
    invitationViewer.mockResolvedValue({ viewer: "owner", paid: false });
    const res = await get("Bearer t");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ paid: false, viewer: "owner", invitation: { id: "inv1" } });
  });

  it("serves a paid page publicly", async () => {
    invitationViewer.mockResolvedValue({ viewer: "public", paid: true });
    const res = await get();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ paid: true, viewer: "public" });
  });

  it("returns 404 for an unknown page", async () => {
    getInvitationDoc.mockResolvedValue(null);
    expect((await get()).status).toBe(404);
    expect(invitationViewer).not.toHaveBeenCalled();
  });
});
