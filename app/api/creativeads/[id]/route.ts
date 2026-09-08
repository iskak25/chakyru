import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { deleteCreativeAd, getCreativeAd, updateCreativeAd } from "@/lib/server/creativeAds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await context.params;
  const item = await getCreativeAd(id, session.uid);
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ item }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await context.params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "body" }, { status: 400 });
  const allowed = [
    "title",
    "subtitle",
    "cta",
    "favorite",
    "overlay",
    "blur",
    "textColor",
    "buttonColor",
    "align",
    "fontSize",
    "activeVariantId",
  ] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }
  const item = await updateCreativeAd(id, session.uid, patch);
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await context.params;
  const ok = await deleteCreativeAd(id, session.uid);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
