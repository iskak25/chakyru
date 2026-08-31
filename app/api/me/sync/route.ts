import { NextRequest, NextResponse } from "next/server";
import { upsertAuthUser } from "@/lib/adminUsers";
import { sessionFromBearer } from "@/lib/firebaseToken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  try {
    const user = await upsertAuthUser({
      firebaseUid: session.uid,
      name: session.name || session.email || "Google",
      email: session.email,
      picture: session.picture || undefined,
    });
    return NextResponse.json({ user }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "sync" }, { status: 500 });
  }
}
