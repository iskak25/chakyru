import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getInvitationDoc } from "@/lib/server/invitations";
import { invitationViewer } from "@/lib/server/invitationAccess";
import { inviteCoverSource, inviteShareMeta, templateCardColors } from "@/lib/inviteShareMeta";
import type { Invitation } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 300 * 1024; // предел веса картинки для превью
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
// Обложку задаёт владелец, поэтому сервер ходит только на эти хосты (защита от SSRF).
const REMOTE_HOSTS = new Set(["images.unsplash.com", "storage.googleapis.com", "firebasestorage.googleapis.com"]);

function fallback(req: NextRequest) {
  return NextResponse.redirect(new URL("/og-image.jpg", req.url), 302);
}

const esc = (value: string) => value.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

/** Карточка в цветах шаблона для приглашений без растровой картинки. */
async function textCard(inv: Invitation) {
  const { paper, ink, accent } = templateCardColors(inv);
  const { title } = inviteShareMeta(inv);
  const names = esc((inv.names || "").slice(0, 60));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${esc(paper)}"/><rect x="36" y="36" width="1128" height="558" fill="none" stroke="${esc(accent)}" stroke-width="3"/><text x="600" y="260" text-anchor="middle" font-family="Georgia,serif" font-size="30" letter-spacing="6" fill="${esc(accent)}">${esc(title.toUpperCase())}</text><text x="600" y="370" text-anchor="middle" font-family="Georgia,serif" font-size="${names.length > 24 ? 64 : 92}" font-style="italic" fill="${esc(ink)}">${names}</text><text x="600" y="470" text-anchor="middle" font-size="36" fill="${esc(accent)}">♥</text></svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 86 }).toBuffer();
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

    const cover = inviteCoverSource(inv);
    if (!cover) {
      const card = await textCard(inv);
      return new NextResponse(new Uint8Array(card), { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" } });
    }
    const url = sourceUrl(cover, req);
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
        .resize(1200, 630, { fit: "cover", position: sharp.strategy.attention })
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
