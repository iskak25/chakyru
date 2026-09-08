import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { generateCreativeAd, getCreativeCredits } from "@/lib/server/creativeAds";
import type { CreativeFormatId, CreativeLanguage, CreativeStyleId } from "@/lib/creativeAds/types";
import type { EventType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    templateId?: string;
    style?: CreativeStyleId;
    format?: CreativeFormatId;
    language?: CreativeLanguage;
    eventType?: EventType;
  } | null;
  if (!body?.templateId || !body.style || !body.format) {
    return NextResponse.json({ error: "input" }, { status: 400 });
  }
  try {
    const item = await generateCreativeAd({
      uid: session.uid,
      email: session.email,
      templateId: body.templateId,
      style: body.style,
      format: body.format,
      language: body.language || "ru",
      eventType: body.eventType || "wedding",
    });
    const credits = await getCreativeCredits(session.uid, session.email);
    return NextResponse.json({
      item,
      credits: credits.unlimited ? null : credits.credits,
      unlimited: credits.unlimited,
    });
  } catch (err) {
    const code = err instanceof Error && "code" in err ? String((err as { code?: string }).code) : "";
    if (code === "access") return NextResponse.json({ error: "access" }, { status: 403 });
    if (code === "credits") return NextResponse.json({ error: "credits" }, { status: 402 });
    return NextResponse.json({ error: "generate" }, { status: 500 });
  }
}
