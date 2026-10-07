import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getInvitationDoc } from "@/lib/server/invitations";
import { invitationViewer } from "@/lib/server/invitationAccess";
import { inviteCoverSource } from "@/lib/inviteShareMeta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 300 * 1024; // предел веса картинки для превью
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
// Обложку задаёт владелец, поэтому сервер ходит только на эти хосты (защита от SSRF).
const REMOTE_HOSTS = new Set(["images.unsplash.com", "storage.googleapis.com", "firebasestorage.googleapis.com"]);

function fallback(req: NextRequest) {
  return NextResponse.redirect(new URL("/og-image.jpg", req.url), 302);
}

function sourceUrl(source: string, req: NextRequest): URL | null {
  if (source.startsWith("/images/") && !source.includes("..")) return new URL(source, req.url);
  try {
    const url = new URL(source);
    return url.protocol === "https:" && REMOTE_HOSTS.has(url.hostname) ? url : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const inv = await getInvitationDoc(id);
    if (!inv) return fallback(req);
    // Картинка отдаётся только у публичной (оплаченной) страницы, как и персональные теги.
    const { viewer } = await invitationViewer(inv, null);
    if (viewer !== "public") return fallback(req);

    const url = sourceUrl(inviteCoverSource(inv), req);
    if (!url) return fallback(req);
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!res.ok) return fallback(req);
    const declared = Number(res.headers.get("content-length") || 0);
    if (declared > MAX_SOURCE_BYTES) return fallback(req);
    const input = Buffer.from(await res.arrayBuffer());
    if (input.length > MAX_SOURCE_BYTES) return fallback(req);

    let quality = 82;
    let out: Buffer;
    do {
      out = await sharp(input, { limitInputPixels: 60_000_000 })
        .rotate()
        .resize(1200, 630, { fit: "cover", position: "centre" })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      quality -= 8;
    } while (out.length > MAX_BYTES && quality >= 34);
    if (out.length > MAX_BYTES) return fallback(req);

    return new NextResponse(new Uint8Array(out), {
      headers: {
        "content-type": "image/jpeg",
        "content-length": String(out.length),
        "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return fallback(req);
  }
}
