import { NextRequest, NextResponse } from "next/server";
import { callerIsAdmin, listAdminUsers, patchAdminUser } from "@/lib/adminUsers";
import { sessionFromBearer } from "@/lib/firebaseToken";
import type { AccountRole, PlanId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const ok = await callerIsAdmin(session.uid, session.email);
  if (!ok) return NextResponse.json({ error: "denied" }, { status: 403 });
  return null;
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    const users = await listAdminUsers();
    return NextResponse.json({ users }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as {
    uid?: string;
    plan?: PlanId;
    accountRole?: AccountRole;
  } | null;
  const uid = body?.uid?.trim();
  if (!uid) return NextResponse.json({ error: "uid" }, { status: 400 });
  try {
    await patchAdminUser(uid, { plan: body?.plan, accountRole: body?.accountRole });
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "save" }, { status: 500 });
  }
}
