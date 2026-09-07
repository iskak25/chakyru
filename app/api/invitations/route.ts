import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { canSaveInvitation } from "@/lib/server/accessLogic";
import { ensurePaidTemplateAccess } from "@/lib/server/access";
import { getInvitationDoc, listUserInvitations, sameInvitationOwner, saveInvitationDoc } from "@/lib/server/invitations";
import { loadUserProfile } from "@/lib/server/users";
import type { Invitation } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(status: number, error: string, reason?: string) {
  return NextResponse.json(
    { success: false, error, reason },
    { status, headers: { "cache-control": "no-store" } },
  );
}

export async function GET(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return fail(401, "auth");
  const profile = await loadUserProfile(session.uid);
  const list = await listUserInvitations(session.uid, profile?.id);
  return NextResponse.json({ success: true, invitations: list }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return fail(401, "auth");

  const body = (await req.json().catch(() => null)) as { invitation?: Invitation } | null;
  const invitation = body?.invitation;
  if (!invitation?.id || !invitation.templateId) {
    return fail(400, "invitation");
  }

  const profile = await loadUserProfile(session.uid);
  const owner = {
    ownerUid: session.uid,
    ownerId: profile?.id || `google:${session.uid}`,
    email: session.email || profile?.email,
  };
  const existing = await getInvitationDoc(invitation.id);
  const owns = sameInvitationOwner(existing, owner);
  const access = await ensurePaidTemplateAccess(session.uid, invitation.templateId, session.email);
  const gate = canSaveInvitation({
    existing: Boolean(existing),
    owns,
    accessAllowed: access.allowed,
  });

  console.info("[INVITATION_UPDATE]", {
    userId: session.uid,
    invitationId: invitation.id,
    ownerId: existing?.ownerUid || existing?.ownerId || null,
    templateId: invitation.templateId,
    paymentStatus: access.accessType || null,
    access: access.allowed,
    result: gate.ok ? "ok" : gate.reason,
  });

  if (!gate.ok) {
    return fail(403, "forbidden", gate.reason);
  }

  const saved = await saveInvitationDoc({
    invitation,
    ...owner,
  });
  if (!saved) {
    return fail(403, "forbidden", "owner");
  }

  const next = (await getInvitationDoc(invitation.id)) || invitation;
  return NextResponse.json(
    { success: true, ok: true, invitation: next },
    { headers: { "cache-control": "no-store" } },
  );
}
