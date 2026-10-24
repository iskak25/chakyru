import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { canEditBeforePayment, canSaveInvitation } from "@/lib/server/accessLogic";
import { isInvitationPaid } from "@/lib/server/invitationAccess";
import { ensurePaidTemplateAccess } from "@/lib/server/access";
import { editLinkMatches, getInvitationDoc, listUserInvitations, sameInvitationOwner, saveInvitationDoc, withoutSecrets } from "@/lib/server/invitations";
import { isAdminUser, loadUserProfile } from "@/lib/server/users";
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
  const editToken = req.headers.get("x-edit-token") ?? "";
  if (!session && !editToken) return fail(401, "auth");

  const body = (await req.json().catch(() => null)) as { invitation?: Invitation } | null;
  const invitation = body?.invitation;
  if (!invitation?.id || !invitation.templateId) {
    return fail(400, "invitation");
  }

  const existing = await getInvitationDoc(invitation.id);
  // Ссылка для правки: сохраняет только эту страницу и только пока не истёк срок; владелец не меняется.
  if (editToken && editLinkMatches(existing, editToken)) {
    const saved = await saveInvitationDoc({ invitation, ownerUid: existing!.ownerUid ?? "", ownerId: existing!.ownerId ?? "", isAdmin: true });
    if (!saved) return fail(403, "forbidden", "owner");
    const next = (await getInvitationDoc(invitation.id)) || invitation;
    return NextResponse.json(
      { success: true, ok: true, invitation: withoutSecrets(next, "public"), paid: await isInvitationPaid(next) },
      { headers: { "cache-control": "no-store" } },
    );
  }
  if (!session) return fail(editToken ? 403 : 401, editToken ? "forbidden" : "auth", editToken ? "expired" : undefined);

  const profile = await loadUserProfile(session.uid);
  const owner = {
    ownerUid: session.uid,
    ownerId: profile?.id || `google:${session.uid}`,
    email: session.email || profile?.email,
  };
  // Админ правит любую страницу; владелец страницы при этом не меняется.
  const admin = await isAdminUser(session.uid, session.email);
  const owns = admin || sameInvitationOwner(existing, owner);
  const access = await ensurePaidTemplateAccess(session.uid, invitation.templateId, session.email);
  const gate = canSaveInvitation({
    existing: Boolean(existing),
    owns,
    // Editing is free before payment; payment unlocks the public link, not the editor.
    accessAllowed: canEditBeforePayment({ allowed: access.allowed, expired: access.expired, templateKnown: Boolean(access.template) }),
    accessExpired: access.expired,
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
    isAdmin: admin,
  });
  if (!saved) {
    return fail(403, "forbidden", "owner");
  }

  const next = (await getInvitationDoc(invitation.id)) || invitation;
  return NextResponse.json(
    { success: true, ok: true, invitation: withoutSecrets(next, "owner"), paid: await isInvitationPaid(next) },
    { headers: { "cache-control": "no-store" } },
  );
}
