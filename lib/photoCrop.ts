// Кадрирование и масштаб фото (ТЗ фаза 3). Хранится в уже существующем хранилище стилей элемента:
// copy["$objectPosition:<id>"] — ключевое слово или «X% Y%», copy["$imageZoom:<id>"] — множитель 1–3.
// Новых полей в документе нет; старые значения (center/top/bottom/left/right) продолжают работать.
import type { CSSProperties } from "react";

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 3;

export const POSITION_KEYWORDS: Record<string, { x: number; y: number }> = {
  center: { x: 50, y: 50 },
  top: { x: 50, y: 0 },
  bottom: { x: 50, y: 100 },
  left: { x: 0, y: 50 },
  right: { x: 100, y: 50 },
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Фокус кадра в процентах. Незнакомое или испорченное значение даёт центр. */
export function parsePosition(raw: string | undefined): { x: number; y: number } {
  const value = (raw ?? "").trim().toLowerCase();
  if (POSITION_KEYWORDS[value]) return POSITION_KEYWORDS[value];
  const match = /^(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/.exec(value);
  return match ? { x: clamp(Number(match[1]), 0, 100), y: clamp(Number(match[2]), 0, 100) } : POSITION_KEYWORDS.center;
}

export const formatPosition = (x: number, y: number) => `${Math.round(clamp(x, 0, 100))}% ${Math.round(clamp(y, 0, 100))}%`;

export function safeZoom(raw: string | undefined): number {
  const n = Number((raw ?? "").replace(",", "."));
  return raw && Number.isFinite(n) ? clamp(n, ZOOM_MIN, ZOOM_MAX) : ZOOM_MIN;
}

/** Стиль <img>: object-position по фокусу и увеличение вокруг той же точки. */
export function photoFrameStyle(position: string | undefined, zoom: string | undefined): CSSProperties {
  const { x, y } = parsePosition(position);
  const scale = safeZoom(zoom);
  return {
    objectPosition: `${x}% ${y}%`,
    ...(scale > 1 ? { transform: `scale(${scale})`, transformOrigin: `${x}% ${y}%` } : {}),
  };
}
