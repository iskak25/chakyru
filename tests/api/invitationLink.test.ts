import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFromBearer = vi.fn();
const setInvitationLinkDisabled = vi.fn();
const canUserAccessTemplate = vi.fn();
const loadUserProfile = vi.fn();
const isAdminUser = vi.fn();

vi.mock("@/lib/firebaseToken", () => ({ sessionFromBearer: (...a: unknown[]) => sessionFromBearer(...a) }));
vi.mock("@/lib/server/invitations", () => ({
  getInvitationDoc: vi.fn(),
  deleteInvitationDoc: vi.fn(),
  setInvitationLinkDisabled: (...a: unknown[]) => setInvitationLinkDisabled(...a),
  sameInvitationOwner: (existing: { ownerUid?: string } | null, input: { ownerUid: string }) => !existing || existing.ownerUid === input.ownerUid,
}));
vi.mock("@/lib/server/access", () => ({ canUserAccessTemplate: (...a: unknown[]) => canUserAccessTemplate(...a) }));
vi.mock("@/lib/server/users", () => ({
  isAdminUser: (...a: unknown[]) => isAdminUser(...a),
  loadUserProfile: (...a: unknown[]) => loadUserProfile(...a),
}));

import { PATCH } from "@/app/api/invitations/[id]/route";
import { invitationViewer } from "@/lib/server/invitationAccess";
import type { Invitation } from "@/lib/types";

const ctx = { params: Promise.resolve({ id: "inv1" }) };
const patch = (body: unknown, auth = "Bearer t") =>
  PATCH(new NextRequest("http://localhost/api/invitations/inv1", { method: "PATCH", headers: { authorization: auth }, body: JSON.stringify(body) }), ctx);

beforeEach(() => {
  sessionFromBearer.mockReset().mockResolvedValue({ uid: "u1" });
  setInvitationLinkDisabled.mockReset().mockResolvedValue(true);
  loadUserProfile.mockReset().mockResolvedValue(null);
  isAdminUser.mockReset().mockResolvedValue(false);
  canUserAccessTemplate.mockReset().mockResolvedValue({ template: {}, isFree: false, allowed: true, owned: true });
});

describe("disabled invitation link", () => {
  const paid = { id: "inv1", templateId: "t1", ownerUid: "u1" } as Invitation;

  it("keeps a switched-off page public for nobody but its owner", async () => {
    expect((await invitationViewer({ ...paid, linkDisabled: true }, null)).viewer).toBe("none");
    expect((await invitationViewer({ ...paid, linkDisabled: true }, { uid: "u2" })).viewer).toBe("none");
    expect((await invitationViewer({ ...paid, linkDisabled: true }, { uid: "u1" })).viewer).toBe("owner");
  });

  it("serves the page again once the link is switched back on", async () => {
    expect((await invitationViewer({ ...paid, linkDisabled: false }, null)).viewer).toBe("public");
  });
});

describe("PATCH /api/invitations/[id]", () => {
  it("lets the owner switch the link off and on", async () => {
    expect((await patch({ linkDisabled: true })).status).toBe(200);
    expect(setInvitationLinkDisabled).toHaveBeenLastCalledWith("inv1", expect.objectContaining({ ownerUid: "u1" }), false, true);
    expect((await patch({ linkDisabled: false })).status).toBe(200);
    expect(setInvitationLinkDisabled).toHaveBeenLastCalledWith("inv1", expect.anything(), false, false);
  });

  it("refuses anonymous, malformed and foreign requests", async () => {
    sessionFromBearer.mockResolvedValueOnce(null);
    expect((await patch({ linkDisabled: true })).status).toBe(401);
    expect((await patch({ linkDisabled: "yes" })).status).toBe(400);
    setInvitationLinkDisabled.mockResolvedValueOnce(false);
    expect((await patch({ linkDisabled: true })).status).toBe(403);
  });
});
