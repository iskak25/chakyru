// Библиотека шрифтов редактора (ТЗ §7.1). Значение `css` пишется в fontFamily элемента как есть,
// поэтому три прежних значения (Cormorant, Manrope, Marck Script) остаются без изменений.
// Проверка глифов и лицензии: docs/fonts-audit.md.

export type FontCategory = "elegant" | "modern" | "classic" | "accent";

export type FontEntry = {
  id: string;
  label: string;
  category: FontCategory;
  css: string;
  /** "partial": ң/ө/ү в самом шрифте нет, их рисует запасной шрифт. */
  ky: "full" | "partial";
};

export const FONT_LIBRARY: FontEntry[] = [
  { id: "cormorant", label: "Cormorant Garamond", category: "elegant", css: "var(--font-cormorant), serif", ky: "full" },
  { id: "playfair", label: "Playfair Display", category: "elegant", css: "var(--font-playfair), serif", ky: "full" },
  { id: "philosopher", label: "Philosopher", category: "classic", css: "var(--font-philosopher), serif", ky: "full" },
  { id: "manrope", label: "Manrope", category: "modern", css: "var(--font-manrope), sans-serif", ky: "full" },
  { id: "unbounded", label: "Unbounded", category: "modern", css: "var(--font-unbounded), sans-serif", ky: "partial" },
  { id: "ceremonial", label: "Marck Script", category: "accent", css: "var(--font-ceremonial), cursive", ky: "partial" },
  { id: "caveat", label: "Caveat", category: "accent", css: "var(--font-caveat), cursive", ky: "full" },
  { id: "vibes", label: "Great Vibes", category: "accent", css: "var(--font-vibes), cursive", ky: "partial" },
];

export const FONT_CATEGORIES: { id: FontCategory; ru: string; ky: string }[] = [
  { id: "elegant", ru: "Элегантные", ky: "Элегантдүү" },
  { id: "modern", ru: "Современные", ky: "Заманбап" },
  { id: "classic", ru: "Классические", ky: "Классикалык" },
  { id: "accent", ru: "Акцентные", ky: "Акценттүү" },
];

export function fontByCss(css: string): FontEntry | undefined {
  return FONT_LIBRARY.find(font => font.css === css);
}

/** Поиск по названию без учёта регистра. */
export function searchFonts(list: FontEntry[], query: string): FontEntry[] {
  const q = query.trim().toLowerCase();
  return q ? list.filter(font => font.label.toLowerCase().includes(q)) : list;
}

const RECENT_KEY = "chakyru-recent-fonts";
const FAVORITE_KEY = "chakyru-favorite-fonts";
const RECENT_LIMIT = 5;

function readIds(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : [];
  } catch { return []; }
}

function writeIds(key: string, ids: string[]) {
  try { localStorage.setItem(key, JSON.stringify(ids)); } catch { /* хранилище недоступно: список просто не сохранится */ }
}

export const loadRecentFonts = () => readIds(RECENT_KEY);
export const loadFavoriteFonts = () => readIds(FAVORITE_KEY);

export function pushRecentFont(id: string): string[] {
  const next = [id, ...readIds(RECENT_KEY).filter(item => item !== id)].slice(0, RECENT_LIMIT);
  writeIds(RECENT_KEY, next);
  return next;
}

export function toggleFavoriteFont(id: string): string[] {
  const current = readIds(FAVORITE_KEY);
  const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
  writeIds(FAVORITE_KEY, next);
  return next;
}
