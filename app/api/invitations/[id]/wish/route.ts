import { NextRequest, NextResponse } from "next/server";
import { addInvitationWish } from "@/lib/server/invitations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await req.json().catch(() => null)) as { name?: string; text?: string } | null;
  const name = body?.name?.trim() || "";
  const text = body?.text?.trim() || "";
  if (!id || !name || !text) return NextResponse.json({ error: "input" }, { status: 400 });
  const wish = await addInvitationWish({ invitationId: id, name, text });
  if (!wish) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ wish });
}
