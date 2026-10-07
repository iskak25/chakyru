import { isCatalogTemplate } from "./inviteFormats";
import { withEnvelope } from "./envelopes";
import { withDefaultVenue } from "./defaultVenue";
import { peekPreview, peekTemplates } from "./catalogStore";
import { referenceWeddingTemplates } from "./referenceWeddings";
import { pinterestTemplates } from "./pinterestTemplates";
import { anniversaryTemplates } from "./anniversaryTemplates";
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
  "corporate",
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
  {
    id: "tushoo-ayat",
    name: { ky: "Тушоо той — Аят", ru: "Тушоо той — Аят" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 990,
    eventTypes: ["tushoo", "birthday"],
    featured: true,
    envelope: { enabled: true, variant: "midnight" },
    style: style("#102e50", "#fbf2e2", "#bd9455", "#102e50", "#73664f", {
      overlay: "#102e50", pageBg: "#fbf2e2", pageLayout: "tushooNavy",
    }),
    canvas: {
      names: "Аят", date: "2026-11-08", time: "15:00", message: "",
      coverImage: "", musicUrl: "", layout: {}, extras: [], blockColors: {}, copy: {},
      gallery: { hero: "/images/templates/tushoo-ayat/hero.webp" },
    },
  },
  {
    id: "corp-velvet",
    name: { ky: "Жаңы жыл — Кызыл бархыт", ru: "Новый год — Красный бархат" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 990,
    eventTypes: ["corporate"],
    envelope: { enabled: true, variant: "burgundy" },
    style: style("#7a1020", "#4d0813", "#e8c98a", "#fbf7f2", "#8a5a5f", {
      overlay: "#7a1020", pageBg: "#7a1020", pageLayout: "corporate",
    }),
    canvas: {
      names: "Новогодний бал", date: "2026-12-26", time: "18:00", message: "",
      coverImage: "", musicUrl: "", layout: {}, extras: [], blockColors: {}, copy: { "corp.theme": "velvet" },
      gallery: {},
    },
  },
  {
    id: "corp-emerald",
    name: { ky: "Жаңы жыл — Зымырыт бархыт", ru: "Новый год — Изумрудный бархат" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 990,
    eventTypes: ["corporate"],
    envelope: { enabled: true, variant: "forest" },
    style: style("#0e2a22", "#0b2a21", "#c9a45c", "#f1ecd8", "#6b7a62", {
      overlay: "#0e2a22", pageBg: "#0e2a22", pageLayout: "corporate",
    }),
    canvas: {
      names: "Новый год 2027", date: "2026-12-26", time: "18:00", message: "",
      coverImage: "", musicUrl: "", layout: {}, extras: [], blockColors: {}, copy: { "corp.theme": "emerald" },
      gallery: {},
    },
  },
  {
    id: "corp-winter",
    name: { ky: "Жаңы жыл — Кышкы жомок", ru: "Новый год — Зимняя сказка" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 990,
    eventTypes: ["corporate"],
    envelope: { enabled: true, variant: "midnight" },
    style: style("#10285a", "#0c1f4a", "#e3c48a", "#f3e9d2", "#a9b4d0", {
      overlay: "#10285a", pageBg: "#10285a", pageLayout: "corporate",
    }),
    canvas: {
      names: "Зимняя сказка", date: "2026-12-26", time: "18:00", message: "",
      coverImage: "", musicUrl: "", layout: {}, extras: [], blockColors: {}, copy: { "corp.theme": "winter" },
      gallery: {},
    },
  },
  {
    id: "corp-noir",
    name: { ky: "Жаңы жыл — Кара алтын", ru: "Новый год — Чёрное золото" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 990,
    eventTypes: ["corporate"],
    envelope: { enabled: true, variant: "blackGold" },
    style: style("#0b0b0b", "#0a0a0a", "#d9b877", "#eadfc6", "#a79a7f", {
      overlay: "#0b0b0b", pageBg: "#0b0b0b", pageLayout: "corporate",
    }),
    canvas: {
      names: "Культурный Новый год", date: "2026-12-26", time: "18:00", message: "",
      coverImage: "", musicUrl: "", layout: {}, extras: [], blockColors: {}, copy: { "corp.theme": "noir" },
      gallery: {},
    },
  },
  ...anniversaryTemplates,
  ...pinterestTemplates,
  ...referenceWeddingTemplates,
  {
    id: "beshik-nur",
    name: { ky: "Бешик нур", ru: "Свет колыбели" },
    designer: "Studio Nur",
    format: "photo",
    priceSom: 199,
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
    name: { ky: "nike", ru: "nike" },
    designer: "Studio Nur",
    format: "photo",
    priceSom: 199,
    eventTypes: ["wedding"],
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
    priceSom: 199,
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
    designer: "Toichakyru Studio",
    format: "photo",
    priceSom: 199,
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
    priceSom: 199,
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
  photo: { priceSom: 199 },
  site3d: { priceSom: 990 },
} as const;

export const FREE_TEMPLATE_IDS = new Set<string>([]);

/** Keep these at the seed price instead of the format default (990 for site3d). */
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
    const formatDefault = format ? FORMAT_PRICE[format].priceSom : FORMAT_PRICE.site3d.priceSom;
    if (typeof live !== "number" || !Number.isFinite(live) || live < 0 || live === formatDefault) {
      return seed;
    }
  }
  if (typeof live !== "number" || !Number.isFinite(live) || live < 0) return seed;
  return live;
}

export const templates = applyCatalogPrices(seedTemplates).map(withDefaultVenue).map(withEnvelope);

export function mergeCatalogTemplates(live?: InvitationTemplate[] | null): InvitationTemplate[] {
  if (!live?.length) {
    return templates;
  }
  const seedById = new Map(templates.map((item) => [item.id, item]));
  const merged = live.filter(isCatalogTemplate).map((item) => {
    const seed = seedById.get(item.id);
    if (!seed) return withEnvelope(item);
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
  return result.map(withDefaultVenue).map(withEnvelope);
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
