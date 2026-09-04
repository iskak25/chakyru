import { NextRequest, NextResponse } from "next/server";
import { callerIsAdmin } from "@/lib/adminUsers";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { migrateChakyruData } from "@/lib/server/migrate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const ok = await callerIsAdmin(session.uid, session.email);
  if (!ok) return NextResponse.json({ error: "denied" }, { status: 403 });
  try {
    const result = await migrateChakyruData();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "migrate";
    return NextResponse.json({ error: message.slice(0, 300) }, { status: 500 });
  }
}
