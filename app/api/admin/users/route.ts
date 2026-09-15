import { NextRequest, NextResponse } from "next/server";
import { callerIsAdmin, listAdminUsers, patchAdminUser } from "@/lib/adminUsers";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { adminUserErrorCode } from "@/lib/adminUserErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function requireAdmin(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const ok = await callerIsAdmin(session.uid, session.email);
  if (!ok) return NextResponse.json({ error: "denied" }, { status: 403 });
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const users = await listAdminUsers();
    return NextResponse.json({ users }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[admin-users]", error instanceof Error ? error.message : "users");
    return NextResponse.json({ error: adminUserErrorCode(error) }, { status: 500, headers: { "cache-control": "no-store" } });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as {
    uid?: string;
    accountRole?: unknown;
    proMonths?: unknown;
  } | null;
  const uid = typeof body?.uid === "string" ? body.uid.trim() : "";
  if (!uid) return NextResponse.json({ error: "uid" }, { status: 400 });
  const role = body?.accountRole;
  if (role !== "guest" && role !== "pro" && role !== "admin") return NextResponse.json({ error: "role" }, { status: 400 });
  const months = body?.proMonths ?? 1;
  if (months !== 1 && months !== 3) return NextResponse.json({ error: "months" }, { status: 400 });
  try {
    await patchAdminUser(uid, { accountRole: role, proMonths: months });
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "protected-admin") return NextResponse.json({ error: "protected-admin" }, { status: 409 });
    return NextResponse.json({ error: "save" }, { status: 500 });
  }
}
