import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFromBearer = vi.fn();
const getInvitationDoc = vi.fn();
const setResponsesToken = vi.fn();

vi.mock("@/lib/firebaseToken", () => ({ sessionFromBearer: (...a: unknown[]) => sessionFromBearer(...a) }));
vi.mock("@/lib/server/invitations", () => ({
  getInvitationDoc: (...a: unknown[]) => getInvitationDoc(...a),
  setResponsesToken: (...a: unknown[]) => setResponsesToken(...a),
  responsesTokenMatches: (inv: { responsesToken?: string }, t: string) => Boolean(inv.responsesToken) && inv.responsesToken === t,
}));
vi.mock("@/lib/server/users", () => ({ isAdminUser: vi.fn().mockResolvedValue(false), loadUserProfile: vi.fn().mockResolvedValue(null) }));

import { DELETE, GET, POST } from "@/app/api/invitations/[id]/responses/route";

const ctx = { params: Promise.resolve({ id: "inv1" }) };
const req = (query = "", method = "GET", auth?: string) =>
  new NextRequest(`http://localhost/api/invitations/inv1/responses${query}`, { method, headers: auth ? { authorization: auth } : {} });

const inv = {
  id: "inv1", names: "A & B", date: "2026-11-20", responsesToken: "secret",
  guests: [{ id: "g1", name: "Гость", rsvp: "yes", plusOne: 1 }],
  wishes: [{ id: "w1", name: "X", text: "ok" }, { id: "w2", name: "Y", text: "hidden", hidden: true }],
};

beforeEach(() => {
  sessionFromBearer.mockReset().mockResolvedValue(null);
  getInvitationDoc.mockReset().mockResolvedValue(inv);
  setResponsesToken.mockReset();
});

describe("GET /api/invitations/[id]/responses", () => {
  it("opens with the right token, without login, hiding hidden wishes and the token itself", async () => {
    const res = await GET(req("?token=secret"), ctx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.guests).toHaveLength(1);
    expect(body.wishes.map((w: { id: string }) => w.id)).toEqual(["w1"]);
    expect(JSON.stringify(body)).not.toContain("secret");
  });
  it("answers 404 for a wrong, empty or missing token", async () => {
    for (const q of ["?token=nope", "?token=", ""]) expect((await GET(req(q), ctx)).status).toBe(404);
  });
  it("answers 404 when the invitation has no token set", async () => {
    getInvitationDoc.mockResolvedValue({ ...inv, responsesToken: undefined });
    expect((await GET(req("?token=undefined"), ctx)).status).toBe(404);
  });
});

describe("owner link management", () => {
  it("requires a login to create or revoke the link", async () => {
    expect((await POST(req("", "POST"), ctx)).status).toBe(401);
    expect((await DELETE(req("", "DELETE"), ctx)).status).toBe(401);
  });
  it("returns the token to the owner and 403 to anyone else", async () => {
    sessionFromBearer.mockResolvedValue({ uid: "u1" });
    setResponsesToken.mockResolvedValueOnce("tok");
    expect(await (await POST(req("", "POST", "Bearer t"), ctx)).json()).toEqual({ token: "tok" });
    setResponsesToken.mockResolvedValueOnce(false);
    expect((await POST(req("", "POST", "Bearer t"), ctx)).status).toBe(403);
  });
  it("revokes the link for the owner", async () => {
    sessionFromBearer.mockResolvedValue({ uid: "u1" });
    setResponsesToken.mockResolvedValueOnce(null);
    expect((await DELETE(req("", "DELETE", "Bearer t"), ctx)).status).toBe(200);
    expect(setResponsesToken).toHaveBeenCalledWith("inv1", expect.anything(), false, true);
  });
});
