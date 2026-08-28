import { peekPreview, peekTemplates } from "./catalogStore";

export type SiteLookId =
  | "wine"
  | "forest"
  | "ivory"
  | "navy"
  | "blush"
  | "emerald"
  | "sand"
  | "copper"
  | "snow"
  | "sky"
  | "lilac"
  | "ink"
  | "daisy"
  | "linen"
  | "mist"
  | "peach"
  | "porcelain";

export type FloraItem = {
  src: string;
  className: string;
  spin?: "flora-spin" | "flora-spin-slow";
};

export const PAGE_LAYOUTS = ["classic", "editorial", "arches", "heroTimer", "bloom"] as const;

export type SitePageLayout = (typeof PAGE_LAYOUTS)[number];

export type SiteLook = {
  id: SiteLookId;
  pageLayout: SitePageLayout;
  pageBg: string;
  pageCss?: string;
  ink: string;
  accent: string;
  mark: string;
  overlay: string;
  cover: string;
  namesColor: string;
  namesFont: string;
  hero: "torn" | "round" | "sharp";
  panel: "torn" | "round" | "sharp";
  button: string;
  previewFlora: FloraItem;
  floras: FloraItem[];
};

const looks: Record<SiteLookId, SiteLook> = {
  wine: {
    id: "wine",
    pageLayout: "heroTimer",
    pageBg: "#f6efe4",
    ink: "#3d2314",
    accent: "#8d0c0c",
    mark: "#ba4545",
    overlay: "#4e0d11",
    cover: "linear-gradient(165deg,#4e0d11 0%,#8d0c0c 48%,#2a1210 100%)",
    namesColor: "#ffffff",
    namesFont: "font-ceremonial",
    hero: "torn",
    panel: "torn",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-peony-wreath.png",
      className: "absolute -left-10 top-8 h-40 w-40 opacity-80",
      spin: "flora-spin-slow",
    },
    floras: [
      { src: "/stickers/frame-circle-flowers.png", className: "absolute -left-[28%] top-[42%] h-[240px] w-[240px] opacity-80", spin: "flora-spin-slow" },
      { src: "/stickers/flora-rose.png", className: "absolute -left-4 top-[58%] h-16 w-16 opacity-90" },
    ],
  },
  forest: {
    id: "forest",
    pageLayout: "classic",
    pageBg: "#ffffff",
    ink: "#2d2d35",
    accent: "#c5a059",
    mark: "#111111",
    overlay: "#0f2a1c",
    cover: "#0f2a1c",
    namesColor: "#e4c97a",
    namesFont: "font-serif italic",
    hero: "round",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-laurel.png",
      className: "absolute -right-8 top-10 h-36 w-36 opacity-80",
      spin: "flora-spin-slow",
    },
    floras: [
      { src: "/stickers/frame-wreath-leaves.png", className: "absolute -right-[20%] top-[8%] h-[200px] w-[200px] opacity-70", spin: "flora-spin-slow" },
      { src: "/stickers/frame-laurel.png", className: "absolute -left-[18%] top-[48%] h-[180px] w-[180px] opacity-75" },
    ],
  },
  ivory: {
    id: "ivory",
    pageLayout: "editorial",
    pageBg: "#faf6ef",
    ink: "#3a2c20",
    accent: "#8b5e34",
    mark: "#8b5e34",
    overlay: "#4a3b2c",
    cover: "linear-gradient(165deg,#4a3b2c 0%,#2a2118 100%)",
    namesColor: "#f7efe3",
    namesFont: "font-serif italic",
    hero: "sharp",
    panel: "round",
    button: "rounded-xl",
    previewFlora: {
      src: "/stickers/ornament-flourish.png",
      className: "absolute left-1/2 top-16 h-12 w-40 -translate-x-1/2 opacity-80",
    },
    floras: [
      { src: "/stickers/ornament-flourish.png", className: "absolute left-1/2 top-[4%] h-12 w-36 -translate-x-1/2 opacity-60" },
      { src: "/stickers/frame-gold-baroque.png", className: "absolute -right-[24%] top-[40%] h-[220px] w-[220px] opacity-50" },
    ],
  },
  navy: {
    id: "navy",
    pageLayout: "heroTimer",
    pageBg: "#10182a",
    pageCss: "radial-gradient(ellipse at 50% 0%, #1a2744 0%, #0c1220 70%)",
    ink: "#f7f2e8",
    accent: "#d4af67",
    mark: "#d4af67",
    overlay: "#0c1220",
    cover: "linear-gradient(165deg,#1a2744 0%,#0c1220 100%)",
    namesColor: "#d4af67",
    namesFont: "font-serif italic",
    hero: "round",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-gold-baroque.png",
      className: "absolute -left-8 top-6 h-40 w-40 opacity-70",
      spin: "flora-spin-slow",
    },
    floras: [
      { src: "/stickers/frame-gold-baroque.png", className: "absolute -left-[22%] top-[6%] h-[220px] w-[220px] opacity-55", spin: "flora-spin-slow" },
      { src: "/stickers/frame-diamond-floral.png", className: "absolute -right-[18%] top-[52%] h-[180px] w-[180px] opacity-50" },
    ],
  },
  blush: {
    id: "blush",
    pageLayout: "arches",
    pageBg: "#fff6f8",
    ink: "#4a1c26",
    accent: "#c45c6a",
    mark: "#c45c6a",
    overlay: "#5c2430",
    cover: "linear-gradient(165deg,#5c2430 0%,#2c1218 100%)",
    namesColor: "#ffe4ea",
    namesFont: "font-ceremonial",
    hero: "torn",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/flora-rose.png",
      className: "absolute -right-6 top-12 h-32 w-32 opacity-90",
      spin: "flora-spin",
    },
    floras: [
      { src: "/stickers/flora-rose.png", className: "absolute -right-[8%] top-[10%] h-24 w-24 opacity-90", spin: "flora-spin" },
      { src: "/stickers/frame-peony-wreath.png", className: "absolute -left-[30%] top-[38%] h-[260px] w-[260px] opacity-75", spin: "flora-spin-slow" },
    ],
  },
  emerald: {
    id: "emerald",
    pageLayout: "classic",
    pageBg: "#0d1f1b",
    ink: "#f5faf6",
    accent: "#b7a06a",
    mark: "#b7a06a",
    overlay: "#16332c",
    cover: "linear-gradient(165deg,#1e3a34 0%,#0d1f1b 100%)",
    namesColor: "#e4d5a8",
    namesFont: "font-serif italic",
    hero: "round",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-crescent-flora.png",
      className: "absolute left-1/2 top-8 h-36 w-36 -translate-x-1/2 opacity-80",
      spin: "flora-spin-slow",
    },
    floras: [
      { src: "/stickers/frame-crescent-flora.png", className: "absolute left-1/2 top-[2%] h-[200px] w-[200px] -translate-x-1/2 opacity-70", spin: "flora-spin-slow" },
      { src: "/stickers/frame-ornate-round.png", className: "absolute -right-[22%] top-[46%] h-[200px] w-[200px] opacity-55" },
    ],
  },
  sand: {
    id: "sand",
    pageLayout: "editorial",
    pageBg: "#efe4d2",
    ink: "#2a4a36",
    accent: "#2a4a36",
    mark: "#2a4a36",
    overlay: "#3d5346",
    cover: "linear-gradient(165deg,#e8dcc8 0%,#cbbba0 100%)",
    namesColor: "#1c3326",
    namesFont: "font-serif italic",
    hero: "sharp",
    panel: "sharp",
    button: "rounded-xl",
    previewFlora: {
      src: "/stickers/frame-pampas-oval.png",
      className: "absolute -right-10 bottom-10 h-40 w-40 opacity-60",
    },
    floras: [
      { src: "/stickers/frame-pampas-oval.png", className: "absolute -right-[16%] top-[12%] h-[180px] w-[180px] opacity-45" },
    ],
  },
  copper: {
    id: "copper",
    pageLayout: "arches",
    pageBg: "#fff8ec",
    ink: "#3d2a18",
    accent: "#c48a2a",
    mark: "#c48a2a",
    overlay: "#3d2a18",
    cover: "linear-gradient(165deg,#3d2a18 0%,#1c140c 100%)",
    namesColor: "#e4c97a",
    namesFont: "font-ceremonial",
    hero: "round",
    panel: "torn",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-gold-baroque.png",
      className: "absolute -left-8 top-8 h-40 w-40 opacity-75",
      spin: "flora-spin-slow",
    },
    floras: [
      { src: "/stickers/frame-gold-baroque.png", className: "absolute -left-[24%] top-[6%] h-[230px] w-[230px] opacity-65", spin: "flora-spin-slow" },
      { src: "/stickers/ornament-flourish.png", className: "absolute left-1/2 top-[36%] h-14 w-32 -translate-x-1/2 opacity-70" },
    ],
  },
  snow: {
    id: "snow",
    pageLayout: "editorial",
    pageBg: "#f7f5f2",
    ink: "#2a2a2a",
    accent: "#4a4a4a",
    mark: "#2a2a2a",
    overlay: "#3a3a3a",
    cover: "linear-gradient(165deg,#f3e6d8 0%,#c9b49a 100%)",
    namesColor: "#ffffff",
    namesFont: "font-serif italic",
    hero: "round",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-wreath-leaves.png",
      className: "absolute left-1/2 top-10 h-36 w-36 -translate-x-1/2 opacity-50",
    },
    floras: [
      { src: "/stickers/frame-wreath-leaves.png", className: "absolute left-1/2 top-[4%] h-[160px] w-[160px] -translate-x-1/2 opacity-45" },
    ],
  },
  sky: {
    id: "sky",
    pageLayout: "heroTimer",
    pageBg: "#eaf4f6",
    ink: "#16323a",
    accent: "#2a7a86",
    mark: "#2a7a86",
    overlay: "#1b3a4a",
    cover: "linear-gradient(165deg,#1b3a4a 0%,#0c1c24 100%)",
    namesColor: "#8fd0d8",
    namesFont: "font-serif italic",
    hero: "round",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-pampas-oval.png",
      className: "absolute -right-8 top-8 h-36 w-36 opacity-70",
    },
    floras: [
      { src: "/stickers/frame-oval-botanical.png", className: "absolute -right-[20%] top-[8%] h-[200px] w-[200px] opacity-55" },
      { src: "/stickers/flora-eucalyptus.png", className: "absolute -left-[12%] top-[50%] h-28 w-28 opacity-70" },
    ],
  },
  lilac: {
    id: "lilac",
    pageLayout: "arches",
    pageBg: "#f6f0f8",
    ink: "#3a2450",
    accent: "#7a5a9a",
    mark: "#7a5a9a",
    overlay: "#2a2438",
    cover: "linear-gradient(165deg,#2a2438 0%,#121018 100%)",
    namesColor: "#e8d5f0",
    namesFont: "font-ceremonial",
    hero: "torn",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-heart-wreath.png",
      className: "absolute -left-8 top-10 h-36 w-36 opacity-80",
      spin: "flora-spin-slow",
    },
    floras: [
      { src: "/stickers/frame-heart-wreath.png", className: "absolute -left-[22%] top-[8%] h-[210px] w-[210px] opacity-70", spin: "flora-spin-slow" },
      { src: "/stickers/frame-peony-wreath.png", className: "absolute -right-[28%] top-[44%] h-[240px] w-[240px] opacity-60" },
    ],
  },
  ink: {
    id: "ink",
    pageLayout: "classic",
    pageBg: "#121212",
    ink: "#f5f0e6",
    accent: "#e0c070",
    mark: "#e0c070",
    overlay: "#12100a",
    cover: "linear-gradient(165deg,#2c2414 0%,#12100a 100%)",
    namesColor: "#e0c070",
    namesFont: "font-serif italic",
    hero: "sharp",
    panel: "sharp",
    button: "rounded-xl",
    previewFlora: {
      src: "/stickers/frame-gold-baroque.png",
      className: "absolute right-[-20px] top-8 h-36 w-36 opacity-60",
    },
    floras: [
      { src: "/stickers/frame-gold-baroque.png", className: "absolute -right-[20%] top-[6%] h-[200px] w-[200px] opacity-45" },
    ],
  },
  daisy: {
    id: "daisy",
    pageLayout: "bloom",
    pageBg: "#ffffff",
    ink: "#c4a35e",
    accent: "#c4a35e",
    mark: "#c4a35e",
    overlay: "#f7efe3",
    cover: "linear-gradient(180deg,#fffdf8 0%,#f3ead8 100%)",
    namesColor: "#c4a35e",
    namesFont: "font-ceremonial",
    hero: "round",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-arch-flowers.png",
      className: "absolute -left-8 top-4 h-36 w-36 opacity-90",
    },
    floras: [
      { src: "/stickers/frame-arch-flowers.png", className: "absolute -left-[18%] -top-[2%] h-[200px] w-[200px] opacity-90" },
      { src: "/stickers/frame-bottom-flowers.png", className: "absolute -right-[12%] top-[8%] h-[160px] w-[160px] opacity-85" },
    ],
  },
  linen: {
    id: "linen",
    pageLayout: "bloom",
    pageBg: "#fbf7f0",
    ink: "#b8924a",
    accent: "#b8924a",
    mark: "#b8924a",
    overlay: "#f3e6d4",
    cover: "linear-gradient(180deg,#fffaf3 0%,#eadcc6 100%)",
    namesColor: "#b8924a",
    namesFont: "font-serif italic",
    hero: "round",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-pampas-oval.png",
      className: "absolute -right-8 top-8 h-36 w-36 opacity-80",
    },
    floras: [
      { src: "/stickers/frame-pampas-oval.png", className: "absolute -right-[16%] top-[4%] h-[190px] w-[190px] opacity-70" },
      { src: "/stickers/flora-eucalyptus.png", className: "absolute -left-[10%] top-[42%] h-28 w-28 opacity-75" },
    ],
  },
  mist: {
    id: "mist",
    pageLayout: "editorial",
    pageBg: "#f6f8f5",
    ink: "#6a8a72",
    accent: "#8aa890",
    mark: "#6a8a72",
    overlay: "#e8efe6",
    cover: "linear-gradient(180deg,#f7faf6 0%,#dce8dc 100%)",
    namesColor: "#5a7a62",
    namesFont: "font-serif italic",
    hero: "round",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/flora-eucalyptus.png",
      className: "absolute -left-6 top-10 h-32 w-32 opacity-85",
    },
    floras: [
      { src: "/stickers/flora-eucalyptus.png", className: "absolute -left-[8%] top-[6%] h-28 w-28 opacity-80" },
      { src: "/stickers/frame-wreath-leaves.png", className: "absolute -right-[18%] top-[40%] h-[180px] w-[180px] opacity-55" },
    ],
  },
  peach: {
    id: "peach",
    pageLayout: "bloom",
    pageBg: "#fff8f4",
    ink: "#c4897a",
    accent: "#d4a090",
    mark: "#c4897a",
    overlay: "#f8ebe4",
    cover: "linear-gradient(180deg,#fff8f4 0%,#f0d8ce 100%)",
    namesColor: "#c4897a",
    namesFont: "font-ceremonial",
    hero: "round",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/flora-rose.png",
      className: "absolute -right-6 top-10 h-32 w-32 opacity-90",
    },
    floras: [
      { src: "/stickers/flora-rose.png", className: "absolute -right-[6%] top-[8%] h-24 w-24 opacity-90" },
      { src: "/stickers/frame-peony-wreath.png", className: "absolute -left-[28%] top-[36%] h-[240px] w-[240px] opacity-70" },
    ],
  },
  porcelain: {
    id: "porcelain",
    pageLayout: "bloom",
    pageBg: "#ffffff",
    ink: "#9a8b6a",
    accent: "#c5b48a",
    mark: "#9a8b6a",
    overlay: "#f4f0e8",
    cover: "linear-gradient(180deg,#ffffff 0%,#ebe4d6 100%)",
    namesColor: "#9a8b6a",
    namesFont: "font-ceremonial",
    hero: "round",
    panel: "round",
    button: "rounded-full",
    previewFlora: {
      src: "/stickers/frame-circle-flowers.png",
      className: "absolute left-1/2 top-6 h-32 w-32 -translate-x-1/2 opacity-80",
    },
    floras: [
      { src: "/stickers/frame-circle-flowers.png", className: "absolute left-1/2 top-[2%] h-[170px] w-[170px] -translate-x-1/2 opacity-70" },
      { src: "/stickers/frame-bottom-flowers.png", className: "absolute -right-[14%] top-[48%] h-[150px] w-[150px] opacity-80" },
    ],
  },
};

const byTemplate: Record<string, SiteLookId> = {
  "ak-shumkar": "forest",
  klassika: "ivory",
  elegant: "wine",
  salt: "copper",
  "modern-cream": "sand",
  "kyz-gulu": "blush",
  "altin-jildiz": "navy",
  "ramadan-nur": "emerald",
  "ak-kyoshok": "snow",
  "kok-too": "sky",
  jipek: "lilac",
  "tun-almaz": "ink",
  "toi-kyzyl": "wine",
  "beshik-jyluu": "sky",
  "gul-zar": "blush",
  shyrdak: "copper",
  romashka: "daisy",
  "ak-bilet": "porcelain",
  "shai-gul": "peach",
  "zhas-shamal": "linen",
  "tan-tuman": "mist",
};

const layoutByTemplate: Record<string, SitePageLayout> = {
  "ak-shumkar": "classic",
  klassika: "editorial",
  elegant: "heroTimer",
  salt: "arches",
  "modern-cream": "editorial",
  "kyz-gulu": "arches",
  "altin-jildiz": "heroTimer",
  "ramadan-nur": "classic",
  "ak-kyoshok": "editorial",
  "kok-too": "heroTimer",
  jipek: "arches",
  "tun-almaz": "classic",
  "toi-kyzyl": "heroTimer",
  "beshik-jyluu": "editorial",
  "gul-zar": "arches",
  shyrdak: "classic",
  romashka: "bloom",
  "ak-bilet": "bloom",
  "shai-gul": "bloom",
  "zhas-shamal": "bloom",
  "tan-tuman": "editorial",
};

function solidFrom(bg: string) {
  const value = bg.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) return value;
  const match = value.match(/#([0-9a-f]{6})/i);
  return match ? `#${match[1]}` : "";
}

export function getSiteLook(templateId: string): SiteLook {
  const id = byTemplate[templateId] ?? "wine";
  const base = looks[id] ?? looks.wine;
  const preview = peekPreview();
  const tpl =
    preview?.id === templateId ? preview : peekTemplates()?.find((item) => item.id === templateId);
  const mappedLayout = layoutByTemplate[templateId] ?? base.pageLayout;
  if (!tpl) return { ...base, pageLayout: mappedLayout };
  const customLayout = PAGE_LAYOUTS.includes(tpl.style.pageLayout as SitePageLayout)
    ? (tpl.style.pageLayout as SitePageLayout)
    : mappedLayout;
  return {
    ...base,
    pageLayout: customLayout,
    accent: tpl.style.accent || base.accent,
    overlay: tpl.style.overlay || solidFrom(tpl.style.bg) || base.overlay,
    pageBg: tpl.style.pageBg || base.pageBg,
    namesColor: tpl.style.text === "#ffffff" || tpl.style.text === "#F5F5F5" ? tpl.style.text : base.namesColor,
  };
}

export function clipClass(kind: SiteLook["hero"]) {
  if (kind === "torn") return "site3d-torn";
  if (kind === "round") return "overflow-hidden rounded-[36px]";
  return "overflow-hidden";
}

export function panelClass(kind: SiteLook["panel"]) {
  if (kind === "torn") return "site3d-torn-y";
  if (kind === "round") return "overflow-hidden rounded-[32px]";
  return "overflow-hidden";
}
