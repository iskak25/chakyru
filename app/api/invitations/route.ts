import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { getInvitationDoc, listUserInvitations, saveInvitationDoc } from "@/lib/server/invitations";
import { canUserAccessTemplate } from "@/lib/server/access";
import { loadUserProfile } from "@/lib/server/users";
import type { Invitation } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const profile = await loadUserProfile(session.uid);
  const list = await listUserInvitations(session.uid, profile?.id);
  return NextResponse.json({ invitations: list }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { invitation?: Invitation } | null;
  const invitation = body?.invitation;
  if (!invitation?.id || !invitation.templateId) {
    return NextResponse.json({ error: "invitation" }, { status: 400 });
  }
  const access = await canUserAccessTemplate(session.uid, invitation.templateId);
  if (!access.allowed) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const profile = await loadUserProfile(session.uid);
  const saved = await saveInvitationDoc({
    invitation,
    ownerUid: session.uid,
    ownerId: profile?.id || session.uid,
  });
  if (!saved) return NextResponse.json({ error: "save" }, { status: 403 });
  return NextResponse.json({ ok: true });
}
