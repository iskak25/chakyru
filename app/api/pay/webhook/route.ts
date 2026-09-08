import { NextRequest, NextResponse } from "next/server";
import { finikWebhookPaymentId, verifyFinikCallback, type FinikWebhook } from "@/lib/finik";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { failPurchase, fulfillPurchase } = await import("@/lib/server/purchases");
    const raw = await req.text();
    let body: FinikWebhook = {};
    try {
      body = JSON.parse(raw) as FinikWebhook;
    } catch {
      return NextResponse.json({ error: "body" }, { status: 400 });
    }
    const settings = await (await import("@/lib/server/paymentSettings")).getPaymentSettings();
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
    const paymentId = finikWebhookPaymentId(body);
    const status = String(body.status || "").toUpperCase();
    if (!paymentId) {
      console.info("[FINIK_WEBHOOK]", { result: "missing-payment-id", status });
      return NextResponse.json({ error: "payment" }, { status: 400 });
    }
    if (status === "FAILED" || status === "CANCELLED" || status === "CANCELED") {
      const done = await failPurchase(paymentId, status === "FAILED" ? "failed" : "cancelled");
      console.info("[FINIK_WEBHOOK]", { paymentId, status, failed: done });
      return NextResponse.json({ ok: true });
    }
    if (status !== "SUCCEEDED") {
      return NextResponse.json({ ok: true });
    }
    const amount = Number(body.amount ?? body.fields?.amount ?? 0);
    const done = await fulfillPurchase({
      paymentId,
      amount,
      transactionId: typeof body.transactionId === "string" ? body.transactionId : undefined,
    });
    console.info("[FINIK_WEBHOOK]", {
      paymentId,
      status,
      fulfilled: done,
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
