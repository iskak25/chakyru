import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { addInvitationWish, setInvitationWishHidden } from "@/lib/server/invitations";
import { loadUserProfile } from "@/lib/server/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await req.json().catch(() => null)) as { name?: string; text?: string } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!id || id === "demo" || id.startsWith("preview-") || !name || !text || name.length > 120 || text.length > 2000) return NextResponse.json({ error: "input" }, { status: 400 });
  const wish = await addInvitationWish({ invitationId: id, name, text });
  if (!wish) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ wish });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { wishId?: string; hidden?: boolean } | null;
  const wishId = typeof body?.wishId === "string" ? body.wishId.trim() : "";
  if (!id || !wishId || typeof body?.hidden !== "boolean") return NextResponse.json({ error: "input" }, { status: 400 });
  const profile = await loadUserProfile(session.uid);
  const ok = await setInvitationWishHidden(id, wishId, body.hidden, {
    ownerUid: session.uid,
    ownerId: profile?.id || `google:${session.uid}`,
    email: session.email || profile?.email,
  });
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ ok: true });
}
