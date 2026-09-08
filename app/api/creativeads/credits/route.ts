import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { ensureCreativeCredits, getCreativeCredits } from "@/lib/server/creativeAds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  await ensureCreativeCredits(session.uid);
  const credits = await getCreativeCredits(session.uid, session.email);
  return NextResponse.json(
    {
      credits: credits.unlimited ? null : credits.credits,
      unlimited: credits.unlimited,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
