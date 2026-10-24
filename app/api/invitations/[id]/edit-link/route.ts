import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { setEditLink } from "@/lib/server/invitations";
import { isAdminUser, loadUserProfile } from "@/lib/server/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "cache-control": "no-store" };

async function ownerContext(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return null;
  const profile = await loadUserProfile(session.uid);
  return {
    owner: { ownerUid: session.uid, ownerId: profile?.id || `google:${session.uid}`, email: session.email || profile?.email },
    admin: await isAdminUser(session.uid, session.email),
  };
}

/** Владелец (или админ) выпускает ссылку, по которой страницу можно править без входа 7 дней. */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const ctx = await ownerContext(req);
  if (!ctx) return NextResponse.json({ error: "auth" }, { status: 401, headers });
  const link = await setEditLink(id, ctx.owner, ctx.admin);
  if (!link) return NextResponse.json({ error: "forbidden" }, { status: 403, headers });
  return NextResponse.json(link, { headers });
}

/** Отзывает ссылку: старый адрес перестаёт работать сразу. */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const ctx = await ownerContext(req);
  if (!ctx) return NextResponse.json({ error: "auth" }, { status: 401, headers });
  const result = await setEditLink(id, ctx.owner, ctx.admin, true);
  if (result === false) return NextResponse.json({ error: "forbidden" }, { status: 403, headers });
  return NextResponse.json({ success: true }, { headers });
}
