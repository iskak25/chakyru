import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { deleteInvitationDoc, getInvitationDoc } from "@/lib/server/invitations";
import { invitationViewer } from "@/lib/server/invitationAccess";
import { isAdminUser, loadUserProfile } from "@/lib/server/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "not found" }, { status: 404 });
  const invitation = await getInvitationDoc(id);
  if (!invitation) return NextResponse.json({ error: "not found" }, { status: 404 });
  // Before payment only the owner (or an admin) may read the page. Everyone else gets the same
  // 404 as for a page that does not exist, so a copied address reveals nothing.
  const session = await sessionFromBearer(req.headers.get("authorization"));
  const { viewer, paid } = await invitationViewer(invitation, session);
  if (viewer === "none") {
    return NextResponse.json({ error: "not found" }, { status: 404, headers: { "cache-control": "no-store" } });
  }
  return NextResponse.json({ invitation, paid, viewer }, { headers: { "cache-control": "no-store" } });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ success: false, error: "invitation" }, { status: 400 });
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ success: false, error: "auth" }, { status: 401 });

  const profile = await loadUserProfile(session.uid);
  const owner = {
    ownerUid: session.uid,
    ownerId: profile?.id || `google:${session.uid}`,
    email: session.email || profile?.email,
  };
  const admin = await isAdminUser(session.uid, session.email);
  const ok = await deleteInvitationDoc(id, owner, admin);
  if (!ok) return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
  return NextResponse.json({ success: true }, { headers: { "cache-control": "no-store" } });
}
