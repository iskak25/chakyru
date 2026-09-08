import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { listCreativeAds } from "@/lib/server/creativeAds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const items = await listCreativeAds(session.uid);
  return NextResponse.json({ items }, { headers: { "cache-control": "no-store" } });
}
