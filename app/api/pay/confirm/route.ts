import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { uidFromBearer } = await import("@/lib/firebaseToken");
    const uid = await uidFromBearer(req.headers.get("authorization"));
    if (!uid) return NextResponse.json({ paid: false, error: "auth" }, { status: 401 });
    const body = (await req.json().catch(() => null)) as { pid?: string } | null;
    const pid = typeof body?.pid === "string" ? body.pid.trim() : "";
    if (!pid) return NextResponse.json({ paid: false, error: "payment" }, { status: 400 });
    const { confirmReturnPayment } = await import("@/lib/firebaseAdmin");
    const status = await confirmReturnPayment(pid, uid);
    return NextResponse.json({
      ...status,
      error: status.paid ? undefined : "pending",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "confirm";
    return NextResponse.json({ paid: false, error: message.slice(0, 300) }, { status: 500 });
  }
}
