import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFromBearer = vi.fn();
const getInvitationDoc = vi.fn();
const saveInvitationDoc = vi.fn();
const isAdminUser = vi.fn();

vi.mock("@/lib/firebaseToken", () => ({ sessionFromBearer: (...a: unknown[]) => sessionFromBearer(...a) }));
vi.mock("@/lib/server/invitations", () => ({
  getInvitationDoc: (...a: unknown[]) => getInvitationDoc(...a),
  saveInvitationDoc: (...a: unknown[]) => saveInvitationDoc(...a),
  listUserInvitations: vi.fn(),
  sameInvitationOwner: (existing: { ownerUid?: string } | null, input: { ownerUid: string }) => !existing || existing.ownerUid === input.ownerUid,
}));
vi.mock("@/lib/server/access", () => ({ ensurePaidTemplateAccess: vi.fn().mockResolvedValue({ allowed: true, expired: false, template: {} }) }));
vi.mock("@/lib/server/invitationAccess", () => ({ isInvitationPaid: vi.fn().mockResolvedValue(true) }));
vi.mock("@/lib/server/users", () => ({ isAdminUser: (...a: unknown[]) => isAdminUser(...a), loadUserProfile: vi.fn().mockResolvedValue(null) }));

import { PUT } from "@/app/api/invitations/route";

const put = () => PUT(new NextRequest("http://localhost/api/invitations", {
  method: "PUT", headers: { authorization: "Bearer t" }, body: JSON.stringify({ invitation: { id: "inv1", templateId: "t1" } }),
}));

beforeEach(() => {
  sessionFromBearer.mockReset().mockResolvedValue({ uid: "admin1" });
  getInvitationDoc.mockReset().mockResolvedValue({ id: "inv1", templateId: "t1", ownerUid: "someone-else" });
  saveInvitationDoc.mockReset().mockResolvedValue(true);
  isAdminUser.mockReset();
});

describe("PUT /api/invitations by someone who is not the owner", () => {
  it("lets an admin save another account's page", async () => {
    isAdminUser.mockResolvedValue(true);
    expect((await put()).status).toBe(200);
    expect(saveInvitationDoc).toHaveBeenCalledWith(expect.objectContaining({ isAdmin: true }));
  });

  it("still refuses an ordinary user", async () => {
    isAdminUser.mockResolvedValue(false);
    expect((await put()).status).toBe(403);
    expect(saveInvitationDoc).not.toHaveBeenCalled();
  });
});
