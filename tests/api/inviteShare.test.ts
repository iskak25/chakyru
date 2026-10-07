import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getInvitationDoc = vi.fn();
const invitationViewer = vi.fn();

vi.mock("@/lib/server/invitations", () => ({ getInvitationDoc: (...a: unknown[]) => getInvitationDoc(...a) }));
vi.mock("@/lib/server/invitationAccess", () => ({ invitationViewer: (...a: unknown[]) => invitationViewer(...a) }));
vi.mock("@/components/GuestInvite", () => ({ GuestInvite: () => null }));

import { generateMetadata } from "@/app/i/[id]/page";
import { GET as ogImage } from "@/app/api/og/[id]/route";

const inv = {
  id: "inv1",
  templateId: "klassika",
  eventType: "tushoo",
  date: "2025-11-08",
  venue: "Ала-Тоо",
  city: "Бишкек",
  coverImage: "/images/hero.jpg",
};
const props = { params: Promise.resolve({ id: "inv1" }) };

beforeEach(() => {
  getInvitationDoc.mockReset().mockResolvedValue(inv);
  invitationViewer.mockReset();
  vi.unstubAllGlobals();
});

describe("generateMetadata for /i/[id]", () => {
  it("gives a paid page personal title, description and image", async () => {
    invitationViewer.mockResolvedValue({ viewer: "public", paid: true });
    const meta = await generateMetadata(props);
    expect(meta.title).toBe("Тушоо той — 8-ноябрь");
    expect(String(meta.description)).toContain("Ала-Тоо");
    const image = (meta.openGraph?.images as { url: string; width: number; height: number; type: string }[])[0];
    expect(image).toMatchObject({ url: "/api/og/inv1", width: 1200, height: 630, type: "image/jpeg" });
  });

  it("keeps personal data out of the preview of an unpaid page", async () => {
    invitationViewer.mockResolvedValue({ viewer: "none", paid: false });
    const meta = await generateMetadata(props);
    expect(meta.title).toBeUndefined();
    expect(meta.openGraph).toBeUndefined();
    expect(meta.robots).toMatchObject({ index: false });
  });

  it("falls back to the generic tags when the page does not exist", async () => {
    getInvitationDoc.mockResolvedValue(null);
    expect(await generateMetadata(props)).toEqual({});
  });
});

describe("GET /api/og/[id]", () => {
  const req = () => new NextRequest("http://localhost/api/og/inv1");
  const ctx = { params: Promise.resolve({ id: "inv1" }) };

  it("serves a 1200×630 JPEG of at most 300 KB made from the cover", async () => {
    invitationViewer.mockResolvedValue({ viewer: "public", paid: true });
    const source = readFileSync("public/images/hero.jpg");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Uint8Array(source), { headers: { "content-type": "image/jpeg" } })));
    const res = await ogImage(req(), ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.length).toBeLessThanOrEqual(300 * 1024);
    const meta = await sharp(body).metadata();
    expect([meta.width, meta.height, meta.format]).toEqual([1200, 630, "jpeg"]);
  });

  it("does not render anything for an unpaid page", async () => {
    invitationViewer.mockResolvedValue({ viewer: "none", paid: false });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await ogImage(req(), ctx);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("/og-image.jpg");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses to fetch covers from hosts outside the allowlist", async () => {
    invitationViewer.mockResolvedValue({ viewer: "public", paid: true });
    getInvitationDoc.mockResolvedValue({ ...inv, coverImage: "https://evil.example/a.jpg" });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await ogImage(req(), ctx);
    expect(res.status).toBe(302);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
