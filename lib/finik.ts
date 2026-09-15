import "server-only";

import { Signer } from "@mancho.devs/authorizer";
import type { PlanId } from "./types";

export function isPaidPlan(value: string): value is Exclude<PlanId, "free"> {
  return value === "standard" || value === "pro" || value === "unlimited";
}

export type FinikConfig = {
  apiKey: string;
  accountId: string;
  privateKey: string;
  mcc: string;
  beta: boolean;
};

export function finikReady(cfg: FinikConfig) {
  return Boolean(cfg.apiKey.trim() && cfg.accountId.trim() && cfg.privateKey.trim());
}

const FINIK_PUBLIC = {
  prod: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuF/PUmhMPPidcMxhZBPb
BSGJoSphmCI+h6ru8fG8guAlcPMVlhs+ThTjw2LHABvciwtpj51ebJ4EqhlySPyT
hqSfXI6Jp5dPGJNDguxfocohaz98wvT+WAF86DEglZ8dEsfoumojFUy5sTOBdHEu
g94B4BbrJvjmBa1YIx9Azse4HFlWhzZoYPgyQpArhokeHOHIN2QFzJqeriANO+wV
aUMta2AhRVZHbfyJ36XPhGO6A5FYQWgjzkI65cxZs5LaNFmRx6pjnhjIeVKKgF99
4OoYCzhuR9QmWkPl7tL4Kd68qa/xHLz0Psnuhm0CStWOYUu3J7ZpzRK8GoEXRcr8
tQIDAQAB
-----END PUBLIC KEY-----`,
  beta: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwlrlKz/8gLWd1ARWGA/8
o3a3Qy8G+hPifyqiPosiTY6nCHovANMIJXk6DH4qAqqZeLu8pLGxudkPbv8dSyG7
F9PZEAryMPzjoB/9P/F6g0W46K/FHDtwTM3YIVvstbEbL19m8yddv/xCT9JPPJTb
LsSTVZq5zCqvKzpupwlGS3Q3oPyLAYe+ZUn4Bx2J1WQrBu3b08fNaR3E8pAkCK27
JqFnP0eFfa817VCtyVKcFHb5ij/D0eUP519Qr/pgn+gsoG63W4pPHN/pKwQUUiAy
uLSHqL5S2yu1dffyMcMVi9E/Q2HCTcez5OvOllgOtkNYHSv9pnrMRuws3u87+hNT
ZwIDAQAB
-----END PUBLIC KEY-----`,
};

export function finikConfigured() {
  return finikReady({
    apiKey: process.env.FINIK_API_KEY?.trim() || "",
    accountId: process.env.FINIK_ACCOUNT_ID?.trim() || "",
    privateKey: process.env.FINIK_PRIVATE_KEY?.trim() || "",
    mcc: process.env.FINIK_MCC?.trim() || "5999",
    beta: process.env.FINIK_BETA === "1" || process.env.FINIK_BETA === "true",
  });
}

function isBeta(cfg?: FinikConfig) {
  if (cfg) return cfg.beta;
  return process.env.FINIK_BETA === "1" || process.env.FINIK_BETA === "true";
}

function baseUrl(cfg?: FinikConfig) {
  return isBeta(cfg) ? "https://beta.api.acquiring.averspay.kg" : "https://api.acquiring.averspay.kg";
}

function privateKeyPem(cfg?: FinikConfig) {
  const raw = (cfg?.privateKey || process.env.FINIK_PRIVATE_KEY || "").trim();
  if (!raw) return "";
  return raw
    .replace(/\\n/g, "\n")
    .replace(/-----[\s]*BEGIN[\s]+([A-Z0-9 ]+?)[\s]*-----/g, (_m, name: string) => `-----BEGIN ${name.trim()}-----`)
    .replace(/-----[\s]*END[\s]+([A-Z0-9 ]+?)[\s]*-----/g, (_m, name: string) => `-----END ${name.trim()}-----`);
}

// Finik signs/verifies with its own reference algorithm (published as the
// @mancho.devs/authorizer npm package: method+path+host/x-api-* headers+
// query+body, "\n"-joined). That algorithm only sorts JSON object keys at
// the TOP level of the body -- nested objects (e.g. a webhook's `fields` or
// our own `Data`) keep their original key order. A previous hand-rolled
// version of this file recursively re-sorted every nested key, which built
// a different canonical string than the one Finik actually signed and made
// every real webhook fail signature verification. Using their own library
// avoids re-diverging from it.
async function sign(requestData: ConstructorParameters<typeof Signer>[0], cfg?: FinikConfig) {
  const key = privateKeyPem(cfg);
  if (!key.includes("BEGIN")) throw new Error("finik_private_key");
  try {
    return await new Signer(requestData).sign(key);
  } catch {
    throw new Error("finik_private_key");
  }
}

export async function verifyFinikWebhook(input: {
  method: string;
  path: string;
  host: string;
  timestamp: string;
  signature: string;
  body: unknown;
  extraHeaders?: Record<string, string>;
  query?: Record<string, string>;
  beta?: boolean;
  debugLabel?: string;
}) {
  const publicKey = (input.beta ?? isBeta()) ? FINIK_PUBLIC.beta : FINIK_PUBLIC.prod;
  const signer = new Signer({
    httpMethod: input.method,
    path: input.path,
    headers: {
      Host: input.host,
      "x-api-timestamp": input.timestamp,
      ...(input.extraHeaders ?? {}),
    },
    body: (input.body ?? null) as Record<string, unknown> | null,
    queryStringParameters: input.query ?? null,
  });
  try {
    const ok = await signer.verify(publicKey, input.signature);
    if (!ok && input.debugLabel) {
      // Temporary: log the exact canonical string this attempt hashed, so a
      // failing verification can be compared byte-for-byte against what
      // Finik intended to sign. No secrets (public key only) are logged.
      const getData = (signer as unknown as { getData?: () => string }).getData;
      console.info("[FINIK_WEBHOOK_CANONICAL]", {
        label: input.debugLabel,
        host: input.host,
        beta: input.beta ?? isBeta(),
        canonical: typeof getData === "function" ? getData.call(signer) : "unavailable",
      });
    }
    return ok;
  } catch (err) {
    if (input.debugLabel) {
      console.info("[FINIK_WEBHOOK_VERIFY_ERROR]", {
        label: input.debugLabel,
        host: input.host,
        beta: input.beta ?? isBeta(),
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return false;
  }
}

function cleanHost(value: string) {
  return value.split(",")[0].trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
}

export async function verifyFinikCallback(input: {
  method: string;
  path: string;
  hosts: string[];
  timestamp: string;
  signature: string;
  body: unknown;
  preferBeta: boolean;
  extraHeaders?: Record<string, string>;
  query?: Record<string, string>;
}) {
  if (!input.signature || !input.timestamp) return false;
  const hosts = [...new Set(input.hosts.map(cleanHost).filter(Boolean))];
  const paths = [...new Set([input.path, input.path.replace(/\/$/, "") || "/"])];
  const betas = input.preferBeta ? [true, false] : [false, true];
  for (const host of hosts) {
    for (const path of paths) {
      for (const beta of betas) {
        const ok = await verifyFinikWebhook({
          method: input.method,
          path,
          host,
          timestamp: input.timestamp,
          signature: input.signature,
          body: input.body,
          extraHeaders: input.extraHeaders,
          query: input.query,
          beta,
          debugLabel: `host=${host} path=${path} beta=${beta}`,
        });
        if (ok) return true;
      }
    }
  }
  return false;
}

export async function createFinikPayment(input: {
  plan: Exclude<PlanId, "free">;
  paymentId: string;
  redirectUrl: string;
  webhookUrl: string;
  uid: string;
  amount: number;
  templateId?: string;
  config: FinikConfig;
}) {
  const cfg = input.config;
  const apiKey = cfg.apiKey.trim();
  const accountId = cfg.accountId.trim();
  const host = new URL(baseUrl(cfg)).host;
  const timestamp = Date.now().toString();
  const body = {
    Amount: input.amount,
    CardType: "FINIK_QR",
    PaymentId: input.paymentId,
    RedirectUrl: input.redirectUrl,
    Data: {
      accountId,
      merchantCategoryCode: cfg.mcc.trim() || "5999",
      name_en: input.templateId ? `Toichakyru ${input.templateId}` : `Toichakyru ${input.plan}`,
      webhookUrl: input.webhookUrl,
      paymentId: input.paymentId,
      plan: input.plan,
      uid: input.uid,
      templateId: input.templateId ?? "",
    },
  };
  const path = "/v1/payment";
  const headers = {
    Host: host,
    "x-api-key": apiKey,
    "x-api-timestamp": timestamp,
  };
  const signature = await sign({ httpMethod: "POST", path, headers, body, queryStringParameters: null }, cfg);
  const res = await fetch(`${baseUrl(cfg)}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "x-api-timestamp": timestamp,
      signature,
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });
  const location = res.headers.get("location");
  if (res.status === 201) {
    const data = (await res.json()) as { paymentUrl?: string; paymentId?: string };
    return { paymentUrl: data.paymentUrl || location || "", paymentId: data.paymentId || input.paymentId };
  }
  if (location && [301, 302, 303, 307, 308].includes(res.status)) {
    return { paymentUrl: location, paymentId: input.paymentId };
  }
  const text = await res.text();
  throw new Error(text || `Finik ${res.status}`);
}

export type FinikWebhook = {
  id?: string;
  transactionId?: string;
  status?: string;
  amount?: number;
  accountId?: string;
  fields?: Record<string, unknown>;
};

function fieldFrom(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

export function finikWebhookPaymentId(body: FinikWebhook) {
  const fields = body.fields ?? {};
  const data = ((body as { Data?: Record<string, unknown> }).Data ?? {}) as Record<string, unknown>;
  return (
    fieldFrom(fields, "paymentId", "PaymentId", "payment_id") ||
    fieldFrom(data, "paymentId", "PaymentId", "payment_id") ||
    fieldFrom(body as Record<string, unknown>, "paymentId", "PaymentId") ||
    (typeof body.id === "string" ? body.id.trim() : "") ||
    (typeof body.transactionId === "string" ? body.transactionId.trim() : "")
  );
}

// Finik's Web SDK / acquiring API (docs: finik.kg/documentation/web-sdk/reference/)
// exposes only POST /v1/payment for creating a payment. There is no GET
// status-lookup endpoint — the webhook is documented as the sole source of
// truth for a payment's final status. An earlier version of this file
// guessed at /v1/payment/{id} and /v1/payments/{id}, which Finik correctly
// rejects with 403 on every call (see confirmReturnPayment in
// lib/firebaseAdmin.ts, which now relies on the webhook alone).
