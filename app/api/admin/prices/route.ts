import { NextRequest, NextResponse } from "next/server";
import { callerIsAdmin } from "@/lib/adminUsers";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { listUserTemplatePrices, setUserTemplatePrice } from "@/lib/server/access";
import { patchCatalogBasePrices, setProPriceSom } from "@/lib/server/templates";

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
  const prices = await listUserTemplatePrices();
  return NextResponse.json({ userPrices: prices }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as {
    prices?: Record<string, number>;
    proPriceSom?: number;
  } | null;
  try {
    if (body?.prices && typeof body.prices === "object") {
      await patchCatalogBasePrices(body.prices);
    }
    if (typeof body?.proPriceSom === "number" && Number.isFinite(body.proPriceSom) && body.proPriceSom >= 0) {
      await setProPriceSom(body.proPriceSom);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "save" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as {
    userId?: string;
    templateId?: string;
    price?: number;
  } | null;
  const userId = body?.userId?.trim();
  const templateId = body?.templateId?.trim();
  const price = body?.price;
  if (!userId || !templateId || typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "input" }, { status: 400 });
  }
  try {
    await setUserTemplatePrice({ userId, templateId, price });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "save" }, { status: 500 });
  }
}
