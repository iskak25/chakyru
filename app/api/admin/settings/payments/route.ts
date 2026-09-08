import { NextRequest, NextResponse } from "next/server";
import { callerIsAdmin } from "@/lib/adminUsers";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { getPaymentSettings, paymentSettingsView, updatePaymentSettings } from "@/lib/server/paymentSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SECRET_LENGTH = 16_000;
const MAX_ACCOUNT_LENGTH = 200;

async function adminSession(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return { error: NextResponse.json({ error: "auth" }, { status: 401 }) } as const;
  if (!(await callerIsAdmin(session.uid, session.email))) {
    return { error: NextResponse.json({ error: "denied" }, { status: 403 }) } as const;
  }
  return { session } as const;
}

function optionalText(value: unknown, max: number) {
  if (value === undefined) return { value: undefined as string | undefined };
  if (typeof value !== "string") return { error: "input" } as const;
  const trimmed = value.trim();
  if (trimmed.length > max) return { error: "input" } as const;
  return { value: trimmed };
}

export async function GET(req: NextRequest) {
  const auth = await adminSession(req);
  if ("error" in auth) return auth.error;
  const settings = await getPaymentSettings();
  return NextResponse.json(paymentSettingsView(settings), {
    headers: { "cache-control": "no-store" },
  });
}

export async function PUT(req: NextRequest) {
  const auth = await adminSession(req);
  if ("error" in auth) return auth.error;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || Array.isArray(body)) return NextResponse.json({ error: "input" }, { status: 400 });

  const apiKey = optionalText(body.finikApiKey, MAX_SECRET_LENGTH);
  const accountId = optionalText(body.finikAccountId, MAX_ACCOUNT_LENGTH);
  const privateKey = optionalText(body.finikPrivateKey, MAX_SECRET_LENGTH);
  const mcc = optionalText(body.finikMcc, 32);
  const siteUrl = optionalText(body.siteUrl, 500);
  if ([apiKey, accountId, privateKey, mcc, siteUrl].some((item) => "error" in item)) {
    return NextResponse.json({ error: "input" }, { status: 400 });
  }
  if (body.finikBeta !== undefined && typeof body.finikBeta !== "boolean") {
    return NextResponse.json({ error: "input" }, { status: 400 });
  }

  try {
    const next = await updatePaymentSettings({
      finikApiKey: apiKey.value,
      finikAccountId: accountId.value,
      finikPrivateKey: privateKey.value,
      finikMcc: mcc.value,
      finikBeta: body.finikBeta as boolean | undefined,
      siteUrl: siteUrl.value,
      updatedBy: auth.session.uid,
    });
    return NextResponse.json({ ok: true, settings: paymentSettingsView(next) }, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "save" }, { status: 500 });
  }
}