import { peekPreview, peekTemplates } from "./catalogStore";
import type { EventType, InvitationTemplate, InviteFormat, TemplateStyle } from "./types";

export const eventTypes: EventType[] = [
  "toi",
  "wedding",
  "kyz",
  "beshik",
  "anniversary",
  "iftar",
  "birthday",
];

export const formats: InviteFormat[] = ["photo", "videoMusic", "videoVoice", "site3d"];

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
    id: "ak-shumkar",
    name: { ky: "Ак шумкар", ru: "Белый сокол" },
    designer: "Amina K.",
    format: "site3d",
    priceSom: 11,
    eventTypes: ["toi", "wedding"],
    featured: true,
    style: style(
      "linear-gradient(165deg, #1c3326 0%, #0f1f16 100%)",
      "rgba(250, 246, 240, 0.94)",
      "#c4a35e",
      "#1c3326",
      "#6b5e4a",
      { overlay: "#0f2a1c", pageBg: "#ffffff", pageLayout: "classic" },
    ),
  },
  {
    id: "klassika",
    name: { ky: "Классика", ru: "Классика" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 0,
    eventTypes: ["toi", "wedding", "birthday", "anniversary"],
    style: style(
      "linear-gradient(165deg, #4a3b2c 0%, #2a2118 100%)",
      "rgba(252, 247, 240, 0.96)",
      "#8b5e34",
      "#3a2c20",
      "#7a6a58",
      { overlay: "#4a3b2c", pageBg: "#faf6ef", pageLayout: "editorial" },
    ),
  },
  {
    id: "elegant",
    name: { ky: "Элегант", ru: "Элегантный" },
    designer: "Meerim Design",
    format: "site3d",
    priceSom: 11,
    eventTypes: ["wedding", "toi"],
    featured: true,
    style: style(
      "linear-gradient(165deg, #2a2438 0%, #121018 100%)",
      "rgba(250, 246, 252, 0.95)",
      "#c9b48a",
      "#2a2438",
      "#6a6478",
      { overlay: "#121018", pageBg: "#f6efe4", pageLayout: "heroTimer" },
    ),
  },
  {
    id: "salt",
    name: { ky: "Салттуу", ru: "Традиционный" },
    designer: "Studio Nur",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["toi", "kyz"],
    style: style(
      "linear-gradient(165deg, #3d2a18 0%, #1c140c 100%)",
      "rgba(255, 248, 236, 0.95)",
      "#d4a24a",
      "#3d2a18",
      "#7a6248",
    ),
  },
  {
    id: "modern-cream",
    name: { ky: "Заманбап", ru: "Современный" },
    designer: "Studio Nur",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "birthday", "toi"],
    featured: true,
    style: style(
      "linear-gradient(165deg, #e8dcc8 0%, #cbbba0 100%)",
      "rgba(255, 252, 247, 0.92)",
      "#2a4a36",
      "#2a4a36",
      "#6d6458",
      { overlay: "#3d5346", pageBg: "#efe4d2", pageLayout: "editorial" },
    ),
  },
  {
    id: "kyz-gulu",
    name: { ky: "Кыз гүлү", ru: "Цветок невесты" },
    designer: "Meerim Design",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["kyz", "wedding"],
    featured: true,
    style: style(
      "linear-gradient(165deg, #5c2430 0%, #2c1218 100%)",
      "rgba(255, 246, 248, 0.95)",
      "#c45c6a",
      "#4a1c26",
      "#8a5a62",
    ),
  },
  {
    id: "zhuzum",
    name: { ky: "Жүзүм", ru: "Виноград" },
    designer: "Meerim Design",
    format: "videoMusic",
    priceSom: 590,
    eventTypes: ["kyz", "toi", "wedding"],
    style: style(
      "linear-gradient(165deg, #6b2d4a 0%, #3a1828 100%)",
      "rgba(255, 244, 248, 0.95)",
      "#c9a227",
      "#4a1c32",
      "#8a6070",
    ),
  },
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
    id: "altin-jildiz",
    name: { ky: "Алтын жылдыз", ru: "Золотая звезда" },
    designer: "Amina K.",
    format: "site3d",
    priceSom: 11,
    eventTypes: ["anniversary", "toi"],
    featured: true,
    style: style(
      "linear-gradient(165deg, #1a2744 0%, #0c1220 100%)",
      "rgba(247, 242, 232, 0.95)",
      "#d4af67",
      "#1a2744",
      "#5c6170",
    ),
  },
  {
    id: "ramadan-nur",
    name: { ky: "Рамазан нур", ru: "Свет Рамадана" },
    designer: "Bishkek Type",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["iftar"],
    style: style(
      "linear-gradient(165deg, #1e3a34 0%, #0d1f1b 100%)",
      "rgba(245, 250, 246, 0.95)",
      "#b7a06a",
      "#16332c",
      "#5a6b64",
      { overlay: "#16332c", pageBg: "#0d1f1b", pageLayout: "classic" },
    ),
  },
  {
    id: "ak-kyoshok",
    name: { ky: "Ак көшөгө", ru: "Белая завеса" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi", "anniversary"],
    featured: true,
    style: style(
      "linear-gradient(165deg, #f3e6d8 0%, #c9b49a 100%)",
      "rgba(255, 252, 248, 0.94)",
      "#4a4a4a",
      "#2a2a2a",
      "#7a7a7a",
      { overlay: "#c9b49a", pageBg: "#faf6ef", pageLayout: "editorial" },
    ),
  },
  {
    id: "romashka",
    name: { ky: "Ромашка", ru: "Ромашка" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi"],
    featured: true,
    style: style("#ffffff", "rgba(255,255,255,0.96)", "#c4a35e", "#c4a35e", "#b8a078", {
      overlay: "#f7efe3",
      pageBg: "#ffffff",
      pageLayout: "bloom",
    }),
  },
  {
    id: "ak-bilet",
    name: { ky: "Ак билет", ru: "Белый билет" },
    designer: "Meerim Design",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "anniversary"],
    featured: true,
    style: style("#ffffff", "rgba(255,255,255,0.96)", "#c5b48a", "#9a8b6a", "#b0a488", {
      overlay: "#f4f0e8",
      pageBg: "#ffffff",
      pageLayout: "bloom",
    }),
  },
  {
    id: "shai-gul",
    name: { ky: "Чай гүл", ru: "Чайная роза" },
    designer: "Amina K.",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "kyz"],
    featured: true,
    style: style("#fff8f4", "rgba(255,248,244,0.96)", "#d4a090", "#c4897a", "#c4a090", {
      overlay: "#f8ebe4",
      pageBg: "#fff8f4",
      pageLayout: "bloom",
    }),
  },
  {
    id: "zhas-shamal",
    name: { ky: "Жаңы шамал", ru: "Лён" },
    designer: "Studio Nur",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi", "birthday"],
    featured: true,
    style: style("#fbf7f0", "rgba(251,247,240,0.96)", "#b8924a", "#b8924a", "#c4b090", {
      overlay: "#f3e6d4",
      pageBg: "#fbf7f0",
      pageLayout: "bloom",
    }),
  },
  {
    id: "tan-tuman",
    name: { ky: "Таң туман", ru: "Утренний туман" },
    designer: "Bishkek Type",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "beshik", "anniversary"],
    featured: true,
    style: style("#f6f8f5", "rgba(246,248,245,0.96)", "#8aa890", "#6a8a72", "#90a898", {
      overlay: "#e8efe6",
      pageBg: "#f6f8f5",
      pageLayout: "editorial",
    }),
  },
  {
    id: "kok-too",
    name: { ky: "Көк тоо", ru: "Синие горы" },
    designer: "Bishkek Type",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["toi", "wedding"],
    featured: true,
    style: style(
      "linear-gradient(165deg, #1b3a4a 0%, #0c1c24 100%)",
      "rgba(240, 248, 250, 0.95)",
      "#8fd0d8",
      "#16323a",
      "#5a7074",
    ),
  },
  {
    id: "jipek",
    name: { ky: "Жибек", ru: "Шёлк" },
    designer: "Meerim Design",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["kyz", "wedding"],
    featured: true,
    style: style(
      "linear-gradient(165deg, #2a2438 0%, #121018 100%)",
      "rgba(250, 246, 252, 0.95)",
      "#c9b48a",
      "#2a2438",
      "#6a6478",
    ),
  },
  {
    id: "tun-almaz",
    name: { ky: "Түн алмаз", ru: "Ночной алмаз" },
    designer: "Amina K.",
    format: "site3d",
    priceSom: 11,
    eventTypes: ["toi", "wedding", "anniversary"],
    featured: true,
    style: style(
      "linear-gradient(165deg, #2c2414 0%, #12100a 100%)",
      "rgba(252, 246, 230, 0.95)",
      "#e0c070",
      "#2c2414",
      "#7a6c48",
      { overlay: "#12100a", pageBg: "#101010", pageLayout: "classic" },
    ),
  },
  {
    id: "toi-kyzyl",
    name: { ky: "Кызыл той", ru: "Алый той" },
    designer: "Studio Nur",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["toi", "wedding"],
    style: style(
      "linear-gradient(165deg, #4e0d11 0%, #2a1210 100%)",
      "rgba(255, 246, 240, 0.95)",
      "#8d0c0c",
      "#3d2314",
      "#8a5a4a",
    ),
  },
  {
    id: "beshik-jyluu",
    name: { ky: "Бешик жылуу", ru: "Тёплая колыбель" },
    designer: "Studio Nur",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["beshik", "birthday"],
    featured: true,
    style: style(
      "linear-gradient(165deg, #4a6a8a 0%, #243848 100%)",
      "rgba(244, 250, 255, 0.95)",
      "#8fd0d8",
      "#16323a",
      "#6a7a88",
    ),
  },
  {
    id: "gul-zar",
    name: { ky: "Гүлзар", ru: "Цветник" },
    designer: "Meerim Design",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["kyz", "wedding", "birthday"],
    style: style(
      "linear-gradient(165deg, #5c2430 0%, #2c1218 100%)",
      "rgba(255, 246, 248, 0.95)",
      "#c45c6a",
      "#4a1c26",
      "#8a5a62",
    ),
  },
  {
    id: "shyrdak",
    name: { ky: "Шырдак", ru: "Шырдак" },
    designer: "Studio Nur",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["toi", "kyz", "anniversary"],
    style: style(
      "linear-gradient(165deg, #3d2a18 0%, #1c140c 100%)",
      "rgba(255, 248, 236, 0.95)",
      "#d4a24a",
      "#3d2a18",
      "#7a6248",
    ),
  },
  {
    id: "rosa",
    name: { ky: "Роза", ru: "Роза" },
    designer: "Amina K.",
    format: "videoVoice",
    priceSom: 1,
    eventTypes: ["wedding", "kyz"],
    style: style(
      "linear-gradient(165deg, #7a3040 0%, #3a181e 100%)",
      "rgba(255, 244, 246, 0.95)",
      "#e8b4bc",
      "#4a1c26",
      "#8a6070",
    ),
  },
  {
    id: "midnight",
    name: { ky: "Түнкү той", ru: "Полночь" },
    designer: "Chakyru Studio",
    format: "videoMusic",
    priceSom: 590,
    eventTypes: ["toi", "wedding", "anniversary"],
    style: style(
      "linear-gradient(165deg, #0d1117 0%, #1b2430 100%)",
      "rgba(236, 240, 246, 0.94)",
      "#7eb6ff",
      "#10161f",
      "#5c6b7a",
    ),
  },
  {
    id: "ala-too",
    name: { ky: "Ала-Тоо", ru: "Ала-Тоо" },
    designer: "Bishkek Type",
    format: "videoMusic",
    priceSom: 590,
    eventTypes: ["toi", "wedding"],
    style: style(
      "linear-gradient(165deg, #1b3a4a 0%, #0c1c24 100%)",
      "rgba(240, 248, 250, 0.95)",
      "#8fd0d8",
      "#16323a",
      "#5a7074",
    ),
  },
  {
    id: "jubilee-gold",
    name: { ky: "Юбилей алтын", ru: "Юбилей золото" },
    designer: "Amina K.",
    format: "videoVoice",
    priceSom: 1,
    eventTypes: ["anniversary"],
    style: style(
      "linear-gradient(165deg, #2c2414 0%, #12100a 100%)",
      "rgba(252, 246, 230, 0.95)",
      "#e0c070",
      "#2c2414",
      "#7a6c48",
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
    id: "shumkar-photo",
    name: { ky: "Шумкар", ru: "Сокол" },
    designer: "Amina K.",
    format: "photo",
    priceSom: 250,
    eventTypes: ["wedding", "toi"],
    style: style(
      "linear-gradient(165deg, #1c3326 0%, #0f1f16 100%)",
      "rgba(250, 246, 240, 0.94)",
      "#c4a35e",
      "#1c3326",
      "#6b5e4a",
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
    id: "iftar-table",
    name: { ky: "Ифтар дасторкону", ru: "Стол ифтара" },
    designer: "Bishkek Type",
    format: "videoVoice",
    priceSom: 1,
    eventTypes: ["iftar"],
    style: style(
      "linear-gradient(165deg, #243028 0%, #101612 100%)",
      "rgba(246, 250, 244, 0.95)",
      "#c6b07a",
      "#1c281e",
      "#607066",
    ),
  },
  {
    id: "polaroid",
    name: { ky: "Полароид", ru: "Полароид" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi"],
    featured: true,
    style: style("#f9f8f6", "rgba(255,255,255,0.96)", "#4a3728", "#4a3728", "#8a7a6a", {
      overlay: "#4a3728",
      pageBg: "#f9f8f6",
      pageLayout: "storybook",
    }),
  },
  {
    id: "mak",
    name: { ky: "Мак", ru: "Мак" },
    designer: "Meerim Design",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "kyz"],
    featured: true,
    style: style("#1a3336", "rgba(247,244,239,0.96)", "#7a2430", "#4a1a1e", "#8a6070", {
      overlay: "#1a3336",
      pageBg: "#f7f4ef",
      pageLayout: "poppy",
    }),
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
  {
    id: "altyn-kun",
    name: { ky: "Алтын күн", ru: "Золотой час" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi"],
    featured: true,
    style: style("#f7f3ee", "rgba(247,243,238,0.96)", "#b8a078", "#3a322c", "#8a8074", {
      overlay: "#2c2620",
      pageBg: "#f7f3ee",
      pageLayout: "watermark",
    }),
  },
  {
    id: "zhai-tokoi",
    name: { ky: "Жай токой", ru: "Олива" },
    designer: "Studio Nur",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi"],
    featured: true,
    style: style("#4a5138", "rgba(250,249,245,0.95)", "#c4b07a", "#faf9f5", "#c8c0a8", {
      overlay: "#4a5138",
      pageBg: "#4a5138",
      pageLayout: "satin",
    }),
  },
  {
    id: "ak-kara",
    name: { ky: "Ак-кара", ru: "Монохром" },
    designer: "Bishkek Type",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "anniversary"],
    featured: true,
    style: style("#ffffff", "rgba(255,255,255,0.96)", "#161616", "#161616", "#888888", {
      overlay: "#2d2d2d",
      pageBg: "#ffffff",
      pageLayout: "archive",
    }),
  },
  {
    id: "atelier",
    name: { ky: "Ателье", ru: "Ателье" },
    designer: "Bishkek Type",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi"],
    featured: true,
    style: style("#ffffff", "rgba(255,255,255,0.96)", "#1a1a1a", "#1a1a1a", "#888888", {
      overlay: "#1a1a1a",
      pageBg: "#ffffff",
      pageLayout: "atelier",
    }),
  },
  {
    id: "komur",
    name: { ky: "Көмүр", ru: "Уголь" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi", "birthday"],
    featured: true,
    style: style("#f4f1ee", "rgba(244,241,238,0.96)", "#2d2d2d", "#2d2d2d", "#8a8680", {
      overlay: "#2d2d2d",
      pageBg: "#f4f1ee",
      pageLayout: "dusk",
    }),
  },
  {
    id: "veil-kun",
    name: { ky: "Нике күнү", ru: "Wedding day" },
    designer: "Chakyru Studio",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi"],
    featured: true,
    style: style("#111111", "rgba(20,16,12,0.9)", "#ffffff", "#ffffff", "#d0d0d0", {
      overlay: "#111111",
      pageBg: "#111111",
      pageLayout: "splash",
    }),
  },
  {
    id: "nishan",
    name: { ky: "Нике той", ru: "Save the Date" },
    designer: "Meerim Design",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi"],
    featured: true,
    style: style("#1c1814", "rgba(28,24,20,0.9)", "#ffffff", "#ffffff", "#d8d0c4", {
      overlay: "#1c1814",
      pageBg: "#1c1814",
      pageLayout: "engage",
    }),
  },
  {
    id: "jeek",
    name: { ky: "Жээк", ru: "Берег" },
    designer: "Bishkek Type",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "toi"],
    featured: true,
    style: style("#f3f1ec", "rgba(243,241,236,0.96)", "#222222", "#222222", "#7a7a7a", {
      overlay: "#eae8e2",
      pageBg: "#f3f1ec",
      pageLayout: "splitbrush",
    }),
  },
  {
    id: "mramor",
    name: { ky: "Мрамор", ru: "Мрамор" },
    designer: "Amina K.",
    format: "site3d",
    priceSom: 1,
    eventTypes: ["wedding", "anniversary"],
    featured: true,
    style: style("#f4f2ee", "rgba(244,242,238,0.96)", "#c4a35e", "#c4a35e", "#b8a878", {
      overlay: "#f4f2ee",
      pageBg: "#f4f2ee",
      pageLayout: "marble",
    }),
  },
];

const FORMAT_PRICE = {
  photo: { priceSom: 250 },
  videoMusic: { priceSom: 590 },
  videoVoice: { priceSom: 590 },
  site3d: { priceSom: 590 },
} as const;

export const FREE_TEMPLATE_IDS = new Set(["klassika"]);

export function isFreeTemplate(templateId: string, basePrice?: number) {
  if (FREE_TEMPLATE_IDS.has(templateId)) return true;
  return typeof basePrice === "number" && Number.isFinite(basePrice) && basePrice <= 0;
}

function applyCatalogPrices(list: InvitationTemplate[]): InvitationTemplate[] {
  return list.map((item) => {
    if (FREE_TEMPLATE_IDS.has(item.id)) return { ...item, priceSom: 0 };
    return { ...item, priceSom: FORMAT_PRICE[item.format].priceSom };
  });
}

export function pickStoredPrice(live: number | undefined, seed: number) {
  if (typeof live !== "number" || !Number.isFinite(live) || live < 0) return seed;
  return live;
}

export const templates = applyCatalogPrices(seedTemplates);

export function mergeCatalogTemplates(live?: InvitationTemplate[] | null): InvitationTemplate[] {
  if (!live?.length) {
    // #region agent log
    if (typeof window !== "undefined") {
      fetch("http://127.0.0.1:7861/ingest/fdb6035a-9503-48b4-894a-ead00d842d89", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c008f9" },
        body: JSON.stringify({
          sessionId: "c008f9",
          hypothesisId: "G",
          location: "lib/templates.ts:mergeCatalogTemplates",
          message: "merge used format seed prices",
          data: {
            liveCount: live?.length ?? 0,
            sample: templates.slice(0, 4).map((item) => ({ id: item.id, priceSom: item.priceSom, format: item.format })),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion
    return templates;
  }
  const seedById = new Map(templates.map((item) => [item.id, item]));
  let usedSeed = 0;
  let usedLive = 0;
  const merged = live.map((item) => {
    const seed = seedById.get(item.id);
    if (!seed) return item;
    const { priceTenge: _tenge, ...liveItem } = item as InvitationTemplate & { priceTenge?: number };
    const picked = pickStoredPrice(liveItem.priceSom, seed.priceSom);
    if (picked === seed.priceSom && liveItem.priceSom !== seed.priceSom) usedSeed += 1;
    else usedLive += 1;
    return {
      ...seed,
      ...liveItem,
      name: {
        ky: liveItem.name?.ky || seed.name.ky,
        ru: liveItem.name?.ru || seed.name.ru,
      },
      style: { ...seed.style, ...liveItem.style },
      format: liveItem.format || seed.format,
      priceSom: picked,
    };
  });
  const seen = new Set(merged.map((item) => item.id));
  const result = [...merged, ...templates.filter((item) => !seen.has(item.id))];
  // #region agent log
  if (typeof window !== "undefined") {
    fetch("http://127.0.0.1:7861/ingest/fdb6035a-9503-48b4-894a-ead00d842d89", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c008f9" },
      body: JSON.stringify({
        sessionId: "c008f9",
        hypothesisId: "G",
        location: "lib/templates.ts:mergeCatalogTemplates",
        message: "merge prices",
        data: {
          liveCount: live.length,
          usedSeed,
          usedLive,
          sample: result.slice(0, 4).map((item, i) => ({
            id: item.id,
            live: live[i]?.priceSom,
            seed: seedById.get(item.id)?.priceSom,
            picked: item.priceSom,
          })),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion
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
