import type { Invitation, LayoutBox } from "./types";

export type WeddingPartKind = "text" | "image" | "block" | "decoration" | "date" | "widget";
export type WeddingPartInfo = {
  id: string;
  label: string;
  kind: WeddingPartKind;
  fallback?: string;
  field?: "names" | "message" | "venue" | "address" | "city" | "dressCode";
  slot?: string;
};

export function weddingValue(inv: Invitation, part: WeddingPartInfo): string {
  if (part.field && inv[part.field]) return inv[part.field];
  return inv.copy?.[part.id] ?? part.fallback ?? "";
}

export function weddingTextPatch(inv: Invitation, part: WeddingPartInfo, value: string): Partial<Invitation> {
  return {
    copy: { ...inv.copy, [part.id]: value },
    ...(part.field ? { [part.field]: value } : {}),
  };
}

export function weddingStylePatch(inv: Invitation, id: string, property: string, value: string): Partial<Invitation> {
  return { copy: { ...inv.copy, [`$${property}:${id}`]: value } };
}

export function weddingStyle(inv: Invitation, id: string, property: string): string | undefined {
  return inv.copy?.[`$${property}:${id}`];
}

export function restoreWeddingPart(inv: Invitation, id: string): Partial<Invitation> {
  const box: LayoutBox = inv.layout?.[id] ?? { x: 0, y: 0, w: 100, h: 0 };
  return { layout: { ...inv.layout, [id]: { ...box, hidden: false } } };
}

export function safeWeddingLink(value: string): string {
  return /^(https?:\/\/|tel:|mailto:|\/[^/]|#)/i.test(value.trim()) ? value.trim() : "#";
}

export type WeddingProgramItem = { id: string; time: string; title: string; subtitle: string; icon: string };
export const DEFAULT_WEDDING_PROGRAM: WeddingProgramItem[] = [
  { id: "welcome", time: "15:00", title: "Конокторду тосуу", subtitle: "Welcome-фуршет", icon: "coffee" },
  { id: "ceremony", time: "15:30", title: "Нике кыюу", subtitle: "", icon: "gem" },
  { id: "photos", time: "16:10", title: "Куттуктоолор", subtitle: "жана сүрөткө түшүү", icon: "camera" },
  { id: "dinner", time: "17:00", title: "Той ашы", subtitle: "", icon: "utensils" },
  { id: "party", time: "20:00", title: "Маданий программа", subtitle: "Бий, оюн-зоок", icon: "music" },
  { id: "end", time: "23:00", title: "Кеченин жыйынтыгы", subtitle: "", icon: "sparkles" },
];

export function weddingProgram(inv: Invitation): WeddingProgramItem[] {
  const raw = inv.copy?.["wedding.program"];
  if (!raw) return DEFAULT_WEDDING_PROGRAM;
  try {
    const items: unknown = JSON.parse(raw);
    if (Array.isArray(items) && items.every(item => item && typeof item.id === "string" && typeof item.time === "string" && typeof item.title === "string")) {
      return items.slice(0, 40);
    }
  } catch { /* Older invitations use the default programme. */ }
  return DEFAULT_WEDDING_PROGRAM;
}
