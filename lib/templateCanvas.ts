import type { Invitation, InvitationTemplate, TemplateCanvas } from "@/lib/types";
import { DEFAULT_MUSIC_URL } from "@/lib/music";

export const PREVIEW_INVITE: Invitation = {
  id: "preview",
  templateId: "",
  eventType: "toi",
  names: "Манас & Каныкей",
  hosts: "Асанакуновдордун үй-бүлөсү",
  date: "2012-12-12",
  time: "17:00",
  venue: "«Ала-Тоо»",
  address: "Ресторанный комплекс",
  city: "Бишкек",
  message: "",
  dressCode: "",
  adultsOnly: false,
  music: true,
  musicUrl: DEFAULT_MUSIC_URL,
  mapUrl: "",
  voiceText: "",
  voiceUrl: "",
  coverImage: "",
  layout: {},
  extras: [],
  blockColors: {},
  copy: {},
  gallery: {},
  createdAt: "",
  guests: [],
  wishes: [],
};

export function emptyCanvas(): TemplateCanvas {
  return {
    layout: {},
    extras: [],
    copy: {},
    gallery: {},
    blockColors: {},
    coverImage: "",
    names: "",
    message: "",
    musicUrl: "",
  };
}

export function canvasFromInvite(inv: Invitation): TemplateCanvas {
  return {
    layout: inv.layout ?? {},
    extras: inv.extras ?? [],
    copy: inv.copy ?? {},
    gallery: inv.gallery ?? {},
    blockColors: inv.blockColors ?? {},
    coverImage: inv.coverImage ?? "",
    names: inv.names,
    message: inv.message,
    musicUrl: inv.musicUrl ?? "",
  };
}

export function inviteFromTemplate(tpl: InvitationTemplate): Invitation {
  const c = tpl.canvas ?? emptyCanvas();
  return {
    ...PREVIEW_INVITE,
    templateId: tpl.id,
    names: c.names || PREVIEW_INVITE.names,
    message: c.message ?? "",
    coverImage: c.coverImage ?? "",
    layout: { ...(c.layout ?? {}) },
    extras: [...(c.extras ?? [])],
    blockColors: { ...(c.blockColors ?? {}) },
    copy: { ...(c.copy ?? {}) },
    gallery: { ...(c.gallery ?? {}) },
    musicUrl: tpl.format === "photo" ? "" : c.musicUrl || DEFAULT_MUSIC_URL,
    music: tpl.format !== "photo",
  };
}
