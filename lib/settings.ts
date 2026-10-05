import type { SiteSettings } from "./types";
import { proPlanPrice } from "./proPlans";

export const DEFAULT_PRO_SOM = 1990;

export const defaultSettings: SiteSettings = {
  proPriceSom: DEFAULT_PRO_SOM,
};

export function settingsFromEnv(): SiteSettings {
  return { ...defaultSettings };
}

function num(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function mergeSettings(stored?: Partial<SiteSettings> | Record<string, unknown> | null): SiteSettings {
  const raw = stored ?? {};
  return {
    proPriceSom: num(raw.proPriceSom, DEFAULT_PRO_SOM),
  };
}

export type PublicPricing = {
  proPriceSom: number;
};

// Цена Pro за месяц задана тарифной таблицей (lib/proPlans.ts); сохранённая настройка её не меняет.
export function publicPricing(_settings?: SiteSettings): PublicPricing {
  return { proPriceSom: proPlanPrice(1) };
}
