import type { Invitation, InvitationTemplate } from "./types";

export const DEFAULT_VENUE = {
  venue: "РЕСТОРАН «President city hall»",
  address: "Бишкек, улица Ауэзова, 24/3",
  city: "Бишкек",
  mapUrl: "https://2gis.kg/bishkek/geo/15763234351156369",
} as const;

export function withDefaultVenue(template: InvitationTemplate): InvitationTemplate {
  return {
    ...template,
    canvas: {
      layout: {}, extras: [], copy: {}, gallery: {}, blockColors: {}, coverImage: "",
      ...template.canvas,
      ...DEFAULT_VENUE,
    },
  };
}

export function invitationMapUrl(inv: Pick<Invitation, "venue" | "address" | "city" | "mapUrl">): string {
  if (inv.mapUrl) return inv.mapUrl;
  if (!inv.venue || inv.venue === DEFAULT_VENUE.venue) return DEFAULT_VENUE.mapUrl;
  return `https://2gis.kg/search/${encodeURIComponent([inv.venue, inv.address, inv.city].filter(Boolean).join(", "))}`;
}
