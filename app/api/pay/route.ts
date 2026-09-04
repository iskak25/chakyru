import { NextRequest, NextResponse } from "next/server";
import { createFinikPayment, finikReady, isPaidPlan } from "@/lib/finik";
import { quoteCheckout, openCheckout } from "@/lib/server/payments";
import { fulfillPurchase } from "@/lib/server/purchases";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function originOf(req: NextRequest, siteUrl?: string) {
  const env = (siteUrl || process.env.NEXT_PUBLIC_SITE_URL)?.trim().replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function fail(err: unknown) {
  const message = err instanceof Error ? err.message : "pay";
  return NextResponse.json({ error: message.slice(0, 300) }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    const pid = req.nextUrl.searchParams.get("pid")?.trim();
    if (pid) {
      const { uidFromBearer } = await import("@/lib/firebaseToken");
      const uid = await uidFromBearer(req.headers.get("authorization"));
      if (!uid) {
        return NextResponse.json({ paid: false, error: "auth" }, { status: 401, headers: { "cache-control": "no-store" } });
      }
      try {
        const { confirmReturnPayment } = await import("@/lib/firebaseAdmin");
        const status = await confirmReturnPayment(pid, uid);
        return NextResponse.json(status, { headers: { "cache-control": "no-store" } });
      } catch (err) {
        const message = err instanceof Error ? err.message : "confirm";
        return NextResponse.json({ paid: false, error: message.slice(0, 300) }, { status: 500, headers: { "cache-control": "no-store" } });
      }
    }
    return NextResponse.json(
      {
        ok: true,
        hasSa: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT),
        hasFinikKey: Boolean(process.env.FINIK_API_KEY),
        hasAccount: Boolean(process.env.FINIK_ACCOUNT_ID),
        hasPem: Boolean(process.env.FINIK_PRIVATE_KEY?.includes("BEGIN")),
        hasProjectId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uidFromBearer } = await import("@/lib/firebaseToken");
    const { settingsFromEnv } = await import("@/lib/settings");
    const uid = await uidFromBearer(req.headers.get("authorization"));
    let admin: typeof import("@/lib/firebaseAdmin") | null = null;
    try {
      admin = await import("@/lib/firebaseAdmin");
    } catch {
      admin = null;
    }
    const settings = admin ? await admin.getAdminSettings() : settingsFromEnv();
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
    const body = (await req.json().catch(() => null)) as { plan?: string; templateId?: string; price?: unknown } | null;
    if (!body?.plan || !isPaidPlan(body.plan) || body.plan === "unlimited") {
      return NextResponse.json({ error: "plan" }, { status: 400 });
    }
    const templateId = typeof body.templateId === "string" ? body.templateId.trim() : "";
    const quoted = await quoteCheckout({
      uid,
      plan: body.plan,
      templateId: templateId || undefined,
      proPriceSom: settings.proPriceSom,
    });
    if ("error" in quoted) {
      return NextResponse.json({ error: quoted.error }, { status: 400 });
    }
    if (quoted.granted) {
      return NextResponse.json({ granted: true });
    }
    const amount = quoted.amount;
    const paymentId = await openCheckout({
      uid,
      plan: body.plan,
      amount,
      templateId: quoted.templateId,
    });
    if (amount <= 0) {
      const done = await fulfillPurchase({
        paymentId,
        amount: 0,
        uid,
        plan: body.plan,
        templateId: quoted.templateId,
      });
      if (!done) return NextResponse.json({ error: "fulfill" }, { status: 500 });
      return NextResponse.json({ granted: true, paymentId });
    }
    if (!finikReady(cfg)) {
      return NextResponse.json({ error: "finik" }, { status: 503 });
    }
    const origin = originOf(req, settings.siteUrl || "https://chakyru.vercel.app");
    const created = await createFinikPayment({
      plan: body.plan,
      paymentId,
      uid,
      amount,
      templateId: quoted.templateId,
      config: cfg,
      redirectUrl: `${origin}/pay/return?pid=${paymentId}&plan=${encodeURIComponent(body.plan)}${quoted.templateId ? `&template=${encodeURIComponent(quoted.templateId)}` : ""}`,
      webhookUrl: `${origin}/api/pay/webhook`,
    });
    if (!created.paymentUrl) {
      return NextResponse.json({ error: "finik" }, { status: 502 });
    }
    return NextResponse.json({ paymentUrl: created.paymentUrl, paymentId, amount });
  } catch (err) {
    return fail(err);
  }
}
