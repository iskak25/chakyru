// Готовые сочетания «заголовок + основной текст» (ТЗ §7.1 Д). Меняют только fontFamily текстовых элементов:
// тексты, размеры, цвета и данные гостей не затрагиваются. Все шрифты — с полной поддержкой ң/ө/ү (docs/fonts-audit.md).
import type { Invitation } from "@/lib/types";
import type { WeddingPartInfo } from "@/lib/weddingEditor";
import { FONT_LIBRARY } from "@/lib/fontLibrary";

export type TypePair = { id: string; ru: string; ky: string; heading: string; body: string };

export const TYPE_PAIRS: TypePair[] = [
  { id: "wedding", ru: "Свадьба", ky: "Үйлөнүү той", heading: "playfair", body: "manrope" },
  { id: "kyz", ru: "Кыз узатуу", ky: "Кыз узатуу", heading: "cormorant", body: "montserrat" },
  { id: "beshik", ru: "Бешик той", ky: "Бешик той", heading: "caveat", body: "noto-sans" },
  { id: "tushoo", ru: "Тушоо той", ky: "Тушоо той", heading: "philosopher", body: "noto-serif" },
  { id: "jubilee", ru: "Юбилей", ky: "Юбилей", heading: "noto-serif", body: "montserrat" },
  { id: "minimal", ru: "Минимализм", ky: "Минимализм", heading: "montserrat", body: "noto-sans" },
];

const cssOf = (id: string) => FONT_LIBRARY.find(f => f.id === id)!.css;
export const pairCss = (pair: TypePair) => ({ heading: cssOf(pair.heading), body: cssOf(pair.body) });

/** Заголовок или основной текст — по id элемента: подписи, подсказки и мелкие примечания всегда «основной». */
export function isHeadingPart(id: string): boolean {
  if (/(label|note|hint|overline|copy|thanks|placeholder|submit)/.test(id)) return false;
  return /(name|title|heading|marrying|tagline|the-word|invited|hero-event)/.test(id);
}

function fontKey(id: string) { return `$fontFamily:${id}`; }

/** Патч copy: выставляет fontFamily всем текстовым элементам; `null` вместо пары снимает сочетание. */
export function typePairPatch(inv: Invitation, parts: WeddingPartInfo[], pair: TypePair | null): Partial<Invitation> {
  const copy = { ...inv.copy };
  const css = pair ? pairCss(pair) : null;
  for (const part of parts) {
    if (part.kind !== "text") continue;
    if (css) copy[fontKey(part.id)] = isHeadingPart(part.id) ? css.heading : css.body;
    else delete copy[fontKey(part.id)];
  }
  return { copy };
}
