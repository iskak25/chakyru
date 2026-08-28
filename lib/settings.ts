import type { SiteSettings } from "./types";

export const DEFAULT_PRO_SOM = 1990;
export const DEFAULT_PRO_TENGE = 4900;

export const defaultSettings: SiteSettings = {
  proPriceSom: DEFAULT_PRO_SOM,
  proPriceTenge: DEFAULT_PRO_TENGE,
  finikApiKey: "",
  finikAccountId: "",
  finikPrivateKey: "",
  finikMcc: "5999",
  finikBeta: true,
  siteUrl: "",
};

export function settingsFromEnv(): SiteSettings {
  return {
    ...defaultSettings,
    finikApiKey: process.env.FINIK_API_KEY?.trim() || "",
    finikAccountId: process.env.FINIK_ACCOUNT_ID?.trim() || "",
    finikPrivateKey: process.env.FINIK_PRIVATE_KEY?.trim() || "",
    finikMcc: process.env.FINIK_MCC?.trim() || "5999",
    finikBeta: process.env.FINIK_BETA === "1" || process.env.FINIK_BETA === "true",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "",
  };
}

function num(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function mergeSettings(stored?: Partial<SiteSettings> | Record<string, unknown> | null): SiteSettings {
  const env = settingsFromEnv();
  const raw = stored ?? {};
  return {
    proPriceSom: num(raw.proPriceSom, env.proPriceSom),
    proPriceTenge: num(raw.proPriceTenge, env.proPriceTenge),
    finikApiKey: text(raw.finikApiKey).trim() || env.finikApiKey,
    finikAccountId: text(raw.finikAccountId).trim() || env.finikAccountId,
    finikPrivateKey: text(raw.finikPrivateKey).trim() || env.finikPrivateKey,
    finikMcc: text(raw.finikMcc).trim() || env.finikMcc,
    finikBeta: typeof raw.finikBeta === "boolean" ? raw.finikBeta : env.finikBeta,
    siteUrl: text(raw.siteUrl).trim() || env.siteUrl,
  };
}

export type PublicPricing = {
  proPriceSom: number;
  proPriceTenge: number;
};

export function publicPricing(settings: SiteSettings): PublicPricing {
  return { proPriceSom: settings.proPriceSom, proPriceTenge: settings.proPriceTenge };
}
