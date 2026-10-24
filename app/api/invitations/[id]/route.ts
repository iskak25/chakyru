import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { deleteInvitationDoc, editLinkMatches, getInvitationDoc, setInvitationLinkDisabled, withoutSecrets } from "@/lib/server/invitations";
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
  const resolved = await invitationViewer(invitation, session);
  const { paid } = resolved;
  // Ссылка для правки открывает страницу целиком, даже неоплаченную или отключённую.
  const viaEditLink = editLinkMatches(invitation, req.headers.get("x-edit-token") ?? "");
  const viewer = viaEditLink ? "owner" : resolved.viewer;
  if (viewer === "none") {
    return NextResponse.json({ error: "not found" }, { status: 404, headers: { "cache-control": "no-store" } });
  }
  // Токен ссылки на ответы видит только владелец; хэш ссылки для правки не видит никто.
  return NextResponse.json({ invitation: withoutSecrets(invitation, viaEditLink ? "public" : viewer), paid, viewer }, { headers: { "cache-control": "no-store" } });
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

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ success: false, error: "invitation" }, { status: 400 });
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ success: false, error: "auth" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { linkDisabled?: unknown } | null;
  if (typeof body?.linkDisabled !== "boolean") return NextResponse.json({ success: false, error: "body" }, { status: 400 });

  const profile = await loadUserProfile(session.uid);
  const owner = {
    ownerUid: session.uid,
    ownerId: profile?.id || `google:${session.uid}`,
    email: session.email || profile?.email,
  };
  const admin = await isAdminUser(session.uid, session.email);
  const ok = await setInvitationLinkDisabled(id, owner, admin, body.linkDisabled);
  if (!ok) return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
  return NextResponse.json({ success: true, linkDisabled: body.linkDisabled }, { headers: { "cache-control": "no-store" } });
}
