import type { Invitation, InvitationTemplate } from "./types";

export const anniversaryDesigns = [
  { id: "jubilee-monochrome", key: "monochrome", name: { ru: "Юбилей — Чёрно-белый портрет", ky: "Маараке — Ак-кара портрет" }, hero: "/images/anniversary/portrait.webp", names: "Нурбек", paper: "#0d0d0e", ink: "#f7f5ef", accent: "#b9b9b5", envelope: "blackGold" },
  { id: "jubilee-evening", key: "evening", name: { ru: "Юбилей — Праздничный вечер", ky: "Маараке — Майрамдык кече" }, hero: "/images/anniversary/celebration.webp", names: "Бакыт", paper: "#fffdf8", ink: "#292939", accent: "#85809c", envelope: "midnight" },
] as const;
export type AnniversaryDesign = typeof anniversaryDesigns[number];
export function getAnniversaryDesign(inv: Pick<Invitation, "templateId" | "copy">) {
  return anniversaryDesigns.find(d => d.id === inv.templateId || d.key === inv.copy?.["anniversary.design"]);
}
export const anniversaryTemplates: InvitationTemplate[] = anniversaryDesigns.map(d => ({
  id: d.id, name: d.name, designer: "Toichakyru Studio", format: "site3d", priceSom: 590,
  eventTypes: ["anniversary"], envelope: { enabled: true, variant: d.envelope },
  style: { bg: d.paper, panel: d.paper, pageBg: d.paper, text: d.ink, accent: d.accent, muted: d.accent, ornament: d.accent },
  canvas: { names: d.names, date: "2026-10-24", time: "18:00", venue: "«Ала-Тоо»", address: "Бишкек", city: "Бишкек", message: "", dressCode: "", mapUrl: "", coverImage: "", musicUrl: "", layout: {}, extras: [], gallery: {}, blockColors: {}, copy: { "anniversary.design": d.key, "jubilee-age": "50" } },
}));
