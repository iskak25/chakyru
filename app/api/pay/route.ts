import { NextRequest, NextResponse } from "next/server";
import { createFinikPayment, finikReady, isPaidPlan } from "@/lib/finik";
import { fulfillPayment, getAdminSettings, savePayment, templatePriceSom, uidFromBearer } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

function originOf(req: NextRequest, siteUrl?: string) {
  const env = (siteUrl || process.env.NEXT_PUBLIC_SITE_URL)?.trim().replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  const uid = await uidFromBearer(req.headers.get("authorization"));
  const settings = await getAdminSettings();
  const cfg = {
    apiKey: settings.finikApiKey,
    accountId: settings.finikAccountId,
    privateKey: settings.finikPrivateKey,
    mcc: settings.finikMcc,
    beta: settings.finikBeta,
  };
  if (!uid) {
    return NextResponse.json({ error: "auth" }, { status: settings.finikApiKey ? 401 : 503 });
  }
  const body = (await req.json().catch(() => null)) as { plan?: string; templateId?: string } | null;
  if (!body?.plan || !isPaidPlan(body.plan) || body.plan === "unlimited") {
    return NextResponse.json({ error: "plan" }, { status: 400 });
  }
  const templateId = typeof body.templateId === "string" ? body.templateId.trim() : "";
  let amount = 0;
  if (body.plan === "pro") {
    amount = settings.proPriceSom;
  } else {
    if (!templateId) return NextResponse.json({ error: "template" }, { status: 400 });
    const price = await templatePriceSom(templateId);
    if (price == null) return NextResponse.json({ error: "template" }, { status: 400 });
    amount = price;
  }
  const paymentId = crypto.randomUUID();
  const origin = originOf(req, settings.siteUrl);
  try {
    await savePayment({
      paymentId,
      uid,
      plan: body.plan,
      amount,
      templateId: body.plan === "standard" ? templateId : undefined,
    });
    if (amount <= 0) {
      const done = await fulfillPayment({
        paymentId,
        amount: 0,
        uid,
        plan: body.plan,
        templateId: body.plan === "standard" ? templateId : undefined,
      });
      if (!done) return NextResponse.json({ error: "fulfill" }, { status: 500 });
      return NextResponse.json({ granted: true, paymentId });
    }
    if (!finikReady(cfg)) {
      return NextResponse.json({ error: "finik" }, { status: 503 });
    }
    const created = await createFinikPayment({
      plan: body.plan,
      paymentId,
      uid,
      amount,
      templateId: body.plan === "standard" ? templateId : undefined,
      config: cfg,
      redirectUrl: `${origin}/pay/return?pid=${paymentId}`,
      webhookUrl: `${origin}/api/pay/webhook`,
    });
    if (!created.paymentUrl) {
      return NextResponse.json({ error: "finik" }, { status: 502 });
    }
    return NextResponse.json({ paymentUrl: created.paymentUrl, paymentId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "finik";
    return NextResponse.json({ error: message.slice(0, 300) }, { status: 502 });
  }
}
