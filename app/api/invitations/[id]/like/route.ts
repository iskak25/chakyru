import { NextRequest, NextResponse } from "next/server";
import { likeInvitationWish } from "@/lib/server/invitations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await req.json().catch(() => null)) as { wishId?: string } | null;
  const wishId = body?.wishId?.trim() || "";
  if (!id || !wishId) return NextResponse.json({ error: "input" }, { status: 400 });
  const ok = await likeInvitationWish(id, wishId);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
