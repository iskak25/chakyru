import { NextRequest, NextResponse } from "next/server";
import { verifyFinikCallback, type FinikWebhook } from "@/lib/finik";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fieldText(fields: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = fields[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const admin = await import("@/lib/firebaseAdmin");
    const { fulfillPurchase } = await import("@/lib/server/purchases");
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
    const forwarded = req.headers.get("x-forwarded-host") || "";
    const host = req.headers.get("host") || "";
    let siteHost = "";
    try {
      siteHost = settings.siteUrl ? new URL(settings.siteUrl).host : "";
    } catch {
      siteHost = "";
    }
    const ok = verifyFinikCallback({
      method: "POST",
      path: "/api/pay/webhook",
      hosts: [forwarded, host, siteHost, "chakyru.vercel.app"],
      timestamp,
      signature,
      body,
      preferBeta: settings.finikBeta,
    });
    if (!ok) {
      return NextResponse.json({ error: "signature" }, { status: 401 });
    }
    if (String(body.status || "").toUpperCase() !== "SUCCEEDED") {
      return NextResponse.json({ ok: true });
    }
    const fields = body.fields ?? {};
    const paymentId =
      fieldText(fields, "paymentId", "PaymentId") ||
      (typeof body.transactionId === "string" ? body.transactionId.trim() : "") ||
      (typeof body.id === "string" ? body.id.trim() : "");
    const amount = Number(body.amount ?? fields.amount ?? 0);
    if (!paymentId) {
      return NextResponse.json({ error: "payment" }, { status: 400 });
    }
    const done = await fulfillPurchase({
      paymentId,
      amount,
      transactionId: typeof body.transactionId === "string" ? body.transactionId : undefined,
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
