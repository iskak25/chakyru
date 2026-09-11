import { isCatalogTemplate } from "./inviteFormats";
import { peekPreview, peekTemplates } from "./catalogStore";
import { referenceWeddingTemplates } from "./referenceWeddings";
import { pinterestTemplates } from "./pinterestTemplates";
import { invitationText } from "./inviteTranslations";
import type { EventType, InvitationTemplate, InviteFormat, TemplateStyle } from "./types";

export const eventTypes: EventType[] = [
  "toi",
  "wedding",
  "kyz",
  "beshik",
  "anniversary",
  "iftar",
  "birthday",
  "bachelorette",
  "jentek",
  "tushoo",
];

export const formats: InviteFormat[] = ["site3d", "photo"];

function style(
  bg: string,
  panel: string,
  accent: string,
  text: string,
  muted: string,
  extra?: Partial<TemplateStyle>,
): TemplateStyle {
  return { bg, panel, accent, text, muted, ornament: accent, ...extra };
}

const seedTemplates: InvitationTemplate[] = [
  ...pinterestTemplates,
  ...referenceWeddingTemplates,
  {
    id: "beshik-nur",
    name: { ky: "Бешик нур", ru: "Свет колыбели" },
    designer: "Studio Nur",
    format: "photo",
    priceSom: 250,
    eventTypes: ["beshik", "birthday"],
    style: style(
      "linear-gradient(165deg, #3d4a2c 0%, #1e2616 100%)",
      "rgba(255, 250, 240, 0.95)",
      "#d4b06a",
      "#2c331c",
      "#6a6450",
    ),
  },
  {
    id: "balalyk",
    name: { ky: "Балалык", ru: "Детский" },
    designer: "Studio Nur",
    format: "photo",
    priceSom: 250,
    eventTypes: ["birthday", "beshik"],
    style: style(
      "linear-gradient(165deg, #4a6a8a 0%, #243848 100%)",
      "rgba(244, 250, 255, 0.95)",
      "#f0d48a",
      "#243848",
      "#6a7a88",
    ),
  },
  {
    id: "ak-jooluk",
    name: { ky: "Ак жоолук", ru: "Белый платок" },
    designer: "Meerim Design",
    format: "photo",
    priceSom: 250,
    eventTypes: ["wedding", "kyz", "toi"],
    style: style(
      "linear-gradient(165deg, #f3e6d8 0%, #c9b49a 100%)",
      "rgba(255, 252, 248, 0.94)",
      "#6b3a2a",
      "#4a2c22",
      "#8a6a5a",
    ),
  },
  {
    id: "minimal-white",
    name: { ky: "Минимал", ru: "Минимал" },
    designer: "Chakyru Studio",
    format: "photo",
    priceSom: 250,
    eventTypes: ["wedding", "birthday", "anniversary"],
    style: style(
      "linear-gradient(165deg, #f7f4ef 0%, #e4ddd2 100%)",
      "rgba(255, 255, 255, 0.9)",
      "#2a2a2a",
      "#2a2a2a",
      "#7a7a7a",
    ),
  },
  {
    id: "kyz-uzatuu-photo",
    name: { ky: "Кыз узатуу", ru: "Кыз узатуу" },
    designer: "Meerim Design",
    format: "photo",
    priceSom: 250,
    eventTypes: ["kyz", "wedding"],
    style: style(
      "linear-gradient(165deg, #8a3a4a 0%, #4a1c28 100%)",
      "rgba(255, 244, 246, 0.95)",
      "#f0c8a0",
      "#4a1c26",
      "#8a6070",
    ),
  },
  {
    id: "baxmal",
    name: { ky: "Баркыт", ru: "Бархат" },
    designer: "Amina K.",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi", "anniversary"],
    featured: true,
    style: style("#4a1a1e", "rgba(246,241,232,0.95)", "#d4b48a", "#f6f1e8", "#c4a890", {
      overlay: "#4a1a1e",
      pageBg: "#4a1a1e",
      pageLayout: "velvet",
    }),
  },
];

const FORMAT_PRICE = {
  photo: { priceSom: 250 },
  site3d: { priceSom: 590 },
} as const;

export const FREE_TEMPLATE_IDS = new Set<string>([]);

/** Keep these at the seed price instead of the format default (590 for site3d). */
const SEED_PRICE_IDS = new Set<string>([]);

export function isFreeTemplate(templateId: string, basePrice?: number) {
  if (FREE_TEMPLATE_IDS.has(templateId)) return true;
  return typeof basePrice === "number" && Number.isFinite(basePrice) && basePrice <= 0;
}

function applyCatalogPrices(list: InvitationTemplate[]): InvitationTemplate[] {
  return list.map((item) => {
    if (FREE_TEMPLATE_IDS.has(item.id)) return { ...item, priceSom: 0 };
    if (SEED_PRICE_IDS.has(item.id)) return item;
    return { ...item, priceSom: FORMAT_PRICE[item.format].priceSom };
  });
}

export function pickStoredPrice(live: number | undefined, seed: number, templateId?: string, format?: InviteFormat) {
  if (templateId && SEED_PRICE_IDS.has(templateId)) {
    const formatDefault = format ? FORMAT_PRICE[format].priceSom : 590;
    if (typeof live !== "number" || !Number.isFinite(live) || live < 0 || live === formatDefault) {
      return seed;
    }
  }
  if (typeof live !== "number" || !Number.isFinite(live) || live < 0) return seed;
  return live;
}

export const templates = applyCatalogPrices(seedTemplates);

export function mergeCatalogTemplates(live?: InvitationTemplate[] | null): InvitationTemplate[] {
  if (!live?.length) {
    return templates;
  }
  const seedById = new Map(templates.map((item) => [item.id, item]));
  const merged = live.filter(isCatalogTemplate).map((item) => {
    const seed = seedById.get(item.id);
    if (!seed) return item;
    const { priceTenge: _tenge, ...liveItem } = item as InvitationTemplate & { priceTenge?: number };
    const picked = pickStoredPrice(liveItem.priceSom, seed.priceSom, item.id, seed.format);
    return {
      ...seed,
      ...liveItem,
      name: {
        ky: invitationText(liveItem.name?.ky || seed.name.ky, "ky"),
        ru: invitationText(liveItem.name?.ru || seed.name.ru, "ru"),
      },
      style: { ...seed.style, ...liveItem.style },
      format: liveItem.format || seed.format,
      priceSom: picked,
    };
  });
  const seen = new Set(merged.map((item) => item.id));
  const result = [...merged, ...templates.filter((item) => !seen.has(item.id))];
  return result;
}

export function getTemplate(id: string) {
  const preview = peekPreview();
  if (preview && preview.id === id) return preview;
  const list = peekTemplates() ?? templates;
  return list.find((t) => t.id === id) ?? templates.find((t) => t.id === id) ?? list[0] ?? templates[0];
}

export function allTemplates() {
  return peekTemplates() ?? templates;
}

export function formatOf(templateId: string): InviteFormat {
  return getTemplate(templateId).format;
}
