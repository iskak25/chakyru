import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { uidFromBearer } = await import("@/lib/firebaseToken");
    const uid = await uidFromBearer(req.headers.get("authorization"));
    if (!uid) return NextResponse.json({ paid: false, error: "auth" }, { status: 401 });
    const body = (await req.json().catch(() => null)) as {
      pid?: string;
      templateId?: string;
      plan?: string;
    } | null;
    const pid = typeof body?.pid === "string" ? body.pid.trim() : "";
    if (!pid) return NextResponse.json({ paid: false, error: "payment" }, { status: 400 });
    const admin = await import("@/lib/firebaseAdmin");
    const status = await admin.confirmReturnPayment(pid, uid, {
      templateId: typeof body?.templateId === "string" ? body.templateId.trim() : undefined,
      plan: typeof body?.plan === "string" ? body.plan.trim() : undefined,
    });
    return NextResponse.json({
      ...status,
      error: status.paid ? undefined : "fulfill",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "confirm";
    return NextResponse.json({ paid: false, error: message.slice(0, 300) }, { status: 500 });
  }
}
