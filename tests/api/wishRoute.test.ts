import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFromBearer = vi.fn();
const setInvitationWishHidden = vi.fn();
const addInvitationWish = vi.fn();
const loadUserProfile = vi.fn();

vi.mock("@/lib/firebaseToken", () => ({ sessionFromBearer: (...a: unknown[]) => sessionFromBearer(...a) }));
vi.mock("@/lib/server/invitations", () => ({
  setInvitationWishHidden: (...a: unknown[]) => setInvitationWishHidden(...a),
  addInvitationWish: (...a: unknown[]) => addInvitationWish(...a),
}));
vi.mock("@/lib/server/users", () => ({ loadUserProfile: (...a: unknown[]) => loadUserProfile(...a) }));

import { PATCH, POST } from "@/app/api/invitations/[id]/wish/route";

const ctx = (id = "inv1") => ({ params: Promise.resolve({ id }) });
const request = (method: string, body?: unknown) =>
  new NextRequest("http://localhost/api/invitations/inv1/wish", {
    method,
    headers: { authorization: "Bearer t", "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

beforeEach(() => {
  sessionFromBearer.mockReset();
  setInvitationWishHidden.mockReset();
  addInvitationWish.mockReset();
  loadUserProfile.mockReset().mockResolvedValue({ id: "google:uid1", email: "u@e.c" });
});

describe("PATCH /wish (hide/show)", () => {
  it("requires authentication", async () => {
    sessionFromBearer.mockResolvedValue(null);
    const res = await PATCH(request("PATCH", { wishId: "w1", hidden: true }), ctx());
    expect(res.status).toBe(401);
    expect(setInvitationWishHidden).not.toHaveBeenCalled();
  });

  it.each([{}, { wishId: "w1" }, { wishId: "", hidden: true }, { wishId: "w1", hidden: "yes" }])("rejects invalid body %j", async (body) => {
    sessionFromBearer.mockResolvedValue({ uid: "uid1", email: "u@e.c" });
    const res = await PATCH(request("PATCH", body), ctx());
    expect(res.status).toBe(400);
  });

  it("returns 403 when the caller does not own the invitation", async () => {
    sessionFromBearer.mockResolvedValue({ uid: "uid1", email: "u@e.c" });
    setInvitationWishHidden.mockResolvedValue(false);
    const res = await PATCH(request("PATCH", { wishId: "w1", hidden: true }), ctx());
    expect(res.status).toBe(403);
  });

  it("passes the owner identity through on success", async () => {
    sessionFromBearer.mockResolvedValue({ uid: "uid1", email: "u@e.c" });
    setInvitationWishHidden.mockResolvedValue(true);
    const res = await PATCH(request("PATCH", { wishId: " w1 ", hidden: false }), ctx());
    expect(res.status).toBe(200);
    expect(setInvitationWishHidden).toHaveBeenCalledWith("inv1", "w1", false, { ownerUid: "uid1", ownerId: "google:uid1", email: "u@e.c" });
  });
});

describe("POST /wish (guest)", () => {
  it.each([
    [{ name: "", text: "x" }],
    [{ name: "A", text: "" }],
    [{ name: "A".repeat(121), text: "x" }],
    [{ name: "A", text: "x".repeat(2001) }],
  ])("rejects invalid wish %j", async (body) => {
    const res = await POST(request("POST", body), ctx());
    expect(res.status).toBe(400);
  });

  it("rejects demo and preview invitations", async () => {
    expect((await POST(request("POST", { name: "A", text: "x" }), ctx("demo"))).status).toBe(400);
    expect((await POST(request("POST", { name: "A", text: "x" }), ctx("preview-1"))).status).toBe(400);
  });

  it("stores a wish and returns it", async () => {
    addInvitationWish.mockResolvedValue({ id: "w9", name: "A", text: "x" });
    const res = await POST(request("POST", { name: " A ", text: " x " }), ctx());
    expect(res.status).toBe(200);
    expect(addInvitationWish).toHaveBeenCalledWith({ invitationId: "inv1", name: "A", text: "x" });
    expect((await res.json()).wish.id).toBe("w9");
  });

  it("returns 404 for an unknown invitation", async () => {
    addInvitationWish.mockResolvedValue(null);
    expect((await POST(request("POST", { name: "A", text: "x" }), ctx())).status).toBe(404);
  });
});
