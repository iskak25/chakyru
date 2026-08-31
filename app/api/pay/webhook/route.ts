import { NextRequest, NextResponse } from "next/server";
import { verifyFinikWebhook, type FinikWebhook } from "@/lib/finik";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await import("@/lib/firebaseAdmin");
    const raw = await req.text();
    let body: FinikWebhook = {};
    try {
      body = JSON.parse(raw) as FinikWebhook;
    } catch {
      return NextResponse.json({ error: "body" }, { status: 400 });
    }
    const settings = await admin.getAdminSettings();
    const signature = req.headers.get("signature") || "";
    const timestamp = req.headers.get("x-api-timestamp") || "";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const extra: Record<string, string> = { Host: host };
    req.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith("x-api-")) extra[key] = value;
    });
    const ok = verifyFinikWebhook({
      method: "POST",
      path: "/api/pay/webhook",
      host,
      timestamp,
      signature,
      body,
      extraHeaders: extra,
      beta: settings.finikBeta,
    });
    if (!ok) {
      return NextResponse.json({ error: "signature" }, { status: 401 });
    }
    if (String(body.status || "").toUpperCase() !== "SUCCEEDED") {
      return NextResponse.json({ ok: true });
    }
    const fields = body.fields ?? {};
    const paymentId = String(body.transactionId || fields.paymentId || body.id || "");
    const amount = Number(body.amount ?? fields.amount ?? 0);
    if (!paymentId) {
      return NextResponse.json({ error: "payment" }, { status: 400 });
    }
    const done = await admin.fulfillPayment({
      paymentId,
      amount,
      uid: typeof fields.uid === "string" ? fields.uid : undefined,
      plan: typeof fields.plan === "string" ? fields.plan : undefined,
      templateId: typeof fields.templateId === "string" ? fields.templateId : undefined,
    });
    if (!done) {
      return NextResponse.json({ error: "fulfill" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "webhook";
    return NextResponse.json({ error: message.slice(0, 300) }, { status: 500 });
  }
}
