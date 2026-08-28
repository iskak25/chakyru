import type { CanvasItem, LayoutBox } from "./types";

export type PendingPlace = {
  item: Omit<CanvasItem, "id">;
  w: number;
  h: number;
  z: number;
};

let hover = { x: 50, y: 38 };
let rest = { x: 50, y: 38, t: 0 };
let dwell = 0;
const trail: { x: number; y: number; t: number }[] = [];
let pending: PendingPlace | null = null;
const pendingSubs = new Set<() => void>();

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function rememberCanvasPointer(clientX: number, clientY: number, canvas: HTMLElement) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 4 || rect.height < 4) return;
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  if (x < -2 || x > 102 || y < -2 || y > 102) return;
  hover = { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
  trail.push({ ...hover, t: Date.now() });
  if (trail.length > 32) trail.shift();
  if (dwell) window.clearTimeout(dwell);
  dwell = window.setTimeout(() => {
    rest = { x: hover.x, y: hover.y, t: Date.now() };
  }, 80);
}

export function hasCanvasPoint() {
  const now = Date.now();
  return now - rest.t < 20000 || trail.some((p) => now - p.t < 20000);
}

export function dropBox(w: number, h: number, z: number, at?: { x: number; y: number }): LayoutBox {
  const now = Date.now();
  const aged = [...trail].reverse().find((p) => now - p.t >= 280 && now - p.t < 20000);
  const src = at ?? aged ?? (now - rest.t < 20000 ? rest : { x: 50, y: 38 });
  return {
    x: clamp(src.x - w / 2, 0, Math.max(0, 100 - w)),
    y: clamp(src.y - h / 2, 0, Math.max(0, 100 - h)),
    w,
    h,
    z,
  };
}

export function pointOnCanvas(clientX: number, clientY: number, canvas: HTMLElement) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clamp(((clientX - rect.left) / Math.max(rect.width, 1)) * 100, 0, 100),
    y: clamp(((clientY - rect.top) / Math.max(rect.height, 1)) * 100, 0, 100),
  };
}

export function setPendingPlace(next: PendingPlace | null) {
  pending = next;
  pendingSubs.forEach((fn) => fn());
}

export function getPendingPlace() {
  return pending;
}

export function subscribePendingPlace(fn: () => void) {
  pendingSubs.add(fn);
  return () => {
    pendingSubs.delete(fn);
  };
}
