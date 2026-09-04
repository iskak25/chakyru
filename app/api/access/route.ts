import { NextRequest, NextResponse } from "next/server";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { canUserAccessTemplate, getTemplatePriceForUser } from "@/lib/server/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  const templateId = req.nextUrl.searchParams.get("templateId")?.trim() || "";
  if (!templateId) return NextResponse.json({ error: "template" }, { status: 400 });
  try {
    const [access, price] = await Promise.all([
      canUserAccessTemplate(session.uid, templateId),
      getTemplatePriceForUser(session.uid, templateId),
    ]);
    return NextResponse.json(
      {
        allowed: access.allowed,
        accessType: access.accessType,
        owned: access.owned,
        isFree: access.isFree,
        price,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "access" }, { status: 500 });
  }
}
