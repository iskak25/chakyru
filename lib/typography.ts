// Безопасные пределы межстрочного и межбуквенного интервала (ТЗ §7.1 Г). Применяются при отрисовке,
// поэтому испорченное или вручную записанное значение не может сломать вёрстку приглашения.
export const LINE_HEIGHT_MIN = 0.9;
export const LINE_HEIGHT_MAX = 2.5;
export const LETTER_SPACING_MIN = -1;
export const LETTER_SPACING_MAX = 12;

function finite(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Множитель высоты строки или null, если значения нет/оно не число. */
export function safeLineHeight(raw: string | undefined): number | null {
  const n = finite(raw);
  return n === null ? null : clamp(n, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX);
}

/** Межбуквенное расстояние в px или null. */
export function safeLetterSpacing(raw: string | undefined): number | null {
  const n = finite(raw);
  return n === null ? null : clamp(n, LETTER_SPACING_MIN, LETTER_SPACING_MAX);
}
