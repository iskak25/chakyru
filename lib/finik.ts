import { createSign, createVerify, createPublicKey } from "crypto";
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
  return raw.replace(/\\n/g, "\n");
}

function sortedJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(sortedJson).join(",")}]`;
  const keys = Object.keys(value as object).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${sortedJson((value as Record<string, unknown>)[key])}`).join(",")}}`;
}

function headerPart(headers: Record<string, string>) {
  return Object.entries(headers)
    .map(([name, value]) => [name.toLowerCase(), String(value)] as const)
    .filter(([name]) => name === "host" || name.startsWith("x-api-"))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}:${value}`)
    .join("&");
}

function canonicalString(input: {
  method: string;
  path: string;
  headers: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
}) {
  let data = `${input.method.toLowerCase()}\n${input.path}\n${headerPart(input.headers)}\n`;
  if (input.query && Object.keys(input.query).length) {
    const q = Object.entries(input.query)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    data += `${q}\n`;
  }
  if (input.body !== undefined) data += sortedJson(input.body);
  return data;
}

function sign(payload: string, cfg?: FinikConfig) {
  const key = privateKeyPem(cfg);
  const signer = createSign("RSA-SHA256");
  signer.update(payload, "utf8");
  return signer.sign(key, "base64");
}

export function verifyFinikWebhook(input: {
  method: string;
  path: string;
  host: string;
  timestamp: string;
  signature: string;
  body: unknown;
  extraHeaders?: Record<string, string>;
  beta?: boolean;
}) {
  const payload = canonicalString({
    method: input.method,
    path: input.path,
    headers: {
      Host: input.host,
      "x-api-timestamp": input.timestamp,
      ...(input.extraHeaders ?? {}),
    },
    body: input.body,
  });
  const key = createPublicKey((input.beta ?? isBeta()) ? FINIK_PUBLIC.beta : FINIK_PUBLIC.prod);
  const verifier = createVerify("RSA-SHA256");
  verifier.update(payload, "utf8");
  return verifier.verify(key, input.signature, "base64");
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
      name_en: input.templateId ? `Chakyru ${input.templateId}` : `Chakyru ${input.plan}`,
      webhookUrl: input.webhookUrl,
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
  const signature = sign(canonicalString({ method: "POST", path, headers, body }), cfg);
  const res = await fetch(`${baseUrl(cfg)}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "x-api-timestamp": timestamp,
      signature,
    },
    body: sortedJson(body),
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
