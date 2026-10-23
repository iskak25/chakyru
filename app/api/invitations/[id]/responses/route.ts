import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { getInvitationDoc, responsesTokenMatches, setResponsesToken } from "@/lib/server/invitations";
import { isAdminUser, loadUserProfile } from "@/lib/server/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "cache-control": "no-store" };

/** Открытый просмотр ответов гостей по секретному токену, без входа. Только чтение. */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const inv = id && token ? await getInvitationDoc(id) : null;
  if (!inv || !responsesTokenMatches(inv, token)) return NextResponse.json({ error: "not found" }, { status: 404, headers });
  return NextResponse.json({
    names: inv.names, date: inv.date,
    guests: inv.guests ?? [],
    wishes: (inv.wishes ?? []).filter(w => !w.hidden),
  }, { headers });
}

async function ownerContext(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return null;
  const profile = await loadUserProfile(session.uid);
  return {
    owner: { ownerUid: session.uid, ownerId: profile?.id || `google:${session.uid}`, email: session.email || profile?.email },
    admin: await isAdminUser(session.uid, session.email),
  };
}

/** Владелец получает (при необходимости создаёт) токен ссылки. */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const ctx = await ownerContext(req);
  if (!ctx) return NextResponse.json({ error: "auth" }, { status: 401, headers });
  const token = await setResponsesToken(id, ctx.owner, ctx.admin);
  if (!token) return NextResponse.json({ error: "forbidden" }, { status: 403, headers });
  return NextResponse.json({ token }, { headers });
}

/** Владелец отзывает ссылку: старый адрес перестаёт открываться. */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const ctx = await ownerContext(req);
  if (!ctx) return NextResponse.json({ error: "auth" }, { status: 401, headers });
  const result = await setResponsesToken(id, ctx.owner, ctx.admin, true);
  if (result === false) return NextResponse.json({ error: "forbidden" }, { status: 403, headers });
  return NextResponse.json({ success: true }, { headers });
}
