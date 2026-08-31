import { NextRequest, NextResponse } from "next/server";
import { createFinikPayment, finikReady, isPaidPlan } from "@/lib/finik";

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
        const admin = await import("@/lib/firebaseAdmin");
        const templateId = req.nextUrl.searchParams.get("template")?.trim() || undefined;
        const plan = req.nextUrl.searchParams.get("plan")?.trim() || undefined;
        const status = await admin.confirmReturnPayment(pid, uid, { templateId, plan });
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
      const price = admin ? await admin.templatePriceSom(templateId) : null;
      if (price == null) {
        const { templates } = await import("@/lib/templates");
        const seed = templates.find((item) => item.id === templateId)?.priceSom;
        if (typeof seed !== "number") return NextResponse.json({ error: "template" }, { status: 400 });
        amount = seed;
      } else {
        amount = price;
      }
    }
    const paymentId = crypto.randomUUID();
    const origin = originOf(req, settings.siteUrl || "https://chakyru.vercel.app");
    await admin?.savePayment({
      paymentId,
      uid,
      plan: body.plan,
      amount,
      templateId: templateId || undefined,
    });
    if (amount <= 0) {
      const done = admin
        ? await admin.fulfillPayment({
            paymentId,
            amount: 0,
            uid,
            plan: body.plan,
            templateId: templateId || undefined,
          })
        : false;
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
      templateId: templateId || undefined,
      config: cfg,
      redirectUrl: `${origin}/pay/return?pid=${paymentId}&plan=${encodeURIComponent(body.plan)}${templateId ? `&template=${encodeURIComponent(templateId)}` : ""}`,
      webhookUrl: `${origin}/api/pay/webhook`,
    });
    if (!created.paymentUrl) {
      return NextResponse.json({ error: "finik" }, { status: 502 });
    }
    return NextResponse.json({ paymentUrl: created.paymentUrl, paymentId });
  } catch (err) {
    return fail(err);
  }
}
