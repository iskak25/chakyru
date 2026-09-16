import { templateImageSource } from "./templateImageSources";

export type TemplatePhotoSet = {
  hero: string;
  c0: string;
  c1: string;
  c2: string;
  venue: string;
};

// Only templates that are actually in the live catalog (or, for "klassika",
// hardcoded as the fallback default in CreativeAds pages) keep an entry here.
// Everything else was part of an older "family" template system that's no
// longer offered -- their photo folders were removed together with this.
const SETS: Record<string, TemplatePhotoSet> = {
  "klassika": { hero: "/images/templates/klassika/hero.jpg", c0: "/images/templates/klassika/c0.jpg", c1: "/images/templates/klassika/c1.jpg", c2: "/images/templates/klassika/c2.jpg", venue: "" },
  "baxmal": { hero: "/images/hero.jpg", c0: "/images/templates/baxmal/c0.jpg", c1: "/images/templates/baxmal/c1.jpg", c2: "/images/templates/baxmal/c2.jpg", venue: "" },
  "beshik-nur": { hero: "/images/templates/beshik-nur/hero-wedding.webp", c0: "", c1: "", c2: "", venue: "" },
  "balalyk": { hero: "/images/templates/balalyk/hero-nike.webp", c0: "", c1: "", c2: "", venue: "" },
  "ak-jooluk": { hero: "/images/templates/ak-jooluk/hero-themed.webp", c0: "", c1: "", c2: "", venue: "" },
  "minimal-white": { hero: "/images/templates/minimal-white/hero.jpg", c0: "", c1: "", c2: "", venue: "" },
  "kyz-uzatuu-photo": { hero: "/images/templates/kyz-uzatuu-photo/hero-themed.webp", c0: "", c1: "", c2: "", venue: "" },
};

const resolvedSets = Object.fromEntries(Object.entries(SETS).map(([id, photos]) => [id, Object.fromEntries(Object.entries(photos).map(([slot, source]) => [slot, templateImageSource(source)])) as TemplatePhotoSet]));
export function getTemplatePhotos(templateId: string): TemplatePhotoSet {
  return resolvedSets[templateId] ?? resolvedSets.klassika!;
}

export function allTemplatePhotoSets() {
  return SETS;
}
