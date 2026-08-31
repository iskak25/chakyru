"use client";

import type { Guest, Invitation, PlanId, RsvpStatus, User, Wish } from "./types";
import { canCreateInvitation, canEditTemplate, normalizeUser } from "./auth";
import { getTemplate } from "./templates";
import { DEFAULT_MUSIC_URL } from "./music";

const INV_KEY = "chakyru-invitations";
const USER_KEY = "chakyru-user";

function uid() {
  return crypto.randomUUID();
}

export const demoInvitation: Invitation = {
  id: "demo",
  templateId: "ak-shumkar",
  eventType: "toi",
  names: "Манас & Каныкей",
  hosts: "Асанакуновдордун үй-бүлөсү",
  date: "2012-12-12",
  time: "17:00",
  venue: "«Ала-Тоо»",
  address: "Ресторанный комплекс",
  city: "Бишкек",
  message:
    "Сиздерди биз менен бирге үй-бүлө боло турган кубанычтуу күнүбүздү бөлүшүүгө чакырабыз!\n\nБул сыйкырдуу күнү биз бири-бирибизге «Ооба» деп, эң жакын адамдарыбыздын ортосунда жүрөгүбүздү жана тагдырыбызды бириктиребиз.",
  dressCode: "Улуттук / классика",
  adultsOnly: true,
  music: true,
  musicUrl: DEFAULT_MUSIC_URL,
  mapUrl: "https://go.2gis.com/41Efw",
  voiceText: "",
  voiceUrl: "",
  coverImage: "",
  layout: {},
  extras: [],
  blockColors: {},
  createdAt: "2026-08-01T10:00:00.000Z",
  guests: [
    { id: "g1", name: "Айгуль", rsvp: "yes", plusOne: 1 },
    { id: "g2", name: "Даулет", rsvp: "yes", plusOne: 0 },
    { id: "g3", name: "Мадина", rsvp: "maybe", plusOne: 0 },
  ],
  wishes: [
    {
      id: "w1",
      name: "Айгуль",
      text: "Куттуктайбыз! Үй-бүлөңүзгө бакыт тилейбиз.",
      likes: 4,
      createdAt: "2026-08-01T10:00:00.000Z",
    },
    {
      id: "w2",
      name: "Дастан",
      text: "Кармашкан колуңар үзүлбөсүн. Бири-бириңерди түшүнгөн жаштардан болгула.",
      likes: 5,
      createdAt: "2026-08-02T10:00:00.000Z",
    },
    {
      id: "w3",
      name: "Бүбүна",
      text: "Счастья вам!",
      likes: 3,
      createdAt: "2026-08-03T10:00:00.000Z",
    },
  ],
};

function normalize(inv: Invitation): Invitation {
  const base: Invitation = {
    ...inv,
    musicUrl: inv.musicUrl ?? "",
    mapUrl: inv.mapUrl ?? "",
    voiceText: inv.voiceText ?? "",
    voiceUrl: inv.voiceUrl ?? "",
    coverImage: inv.coverImage ?? "",
    layout: inv.layout ?? {},
    extras: inv.extras ?? [],
    blockColors: inv.blockColors ?? {},
    copy: inv.copy ?? {},
    gallery: inv.gallery ?? {},
    ownerId: inv.ownerId,
  };
  if (base.venue === "President city hall") {
    base.venue = "«Ала-Тоо»";
    if (!base.address || base.address === "Банкетный зал") {
      base.address = "Ресторанный комплекс";
    }
  }
  if (getTemplate(base.templateId).format === "photo") {
    base.music = false;
    base.musicUrl = "";
  }
  const blank = !base.names.trim() && !base.venue.trim() && !base.date;
  if (!blank) {
    if (!base.mapUrl) base.mapUrl = "";
    return base;
  }
  return {
    ...base,
    names: "Манас & Каныкей",
    date: "2012-12-12",
    time: base.time || "17:00",
    venue: "«Ала-Тоо»",
    address: base.address || "Ресторанный комплекс",
    city: base.city || "Бишкек",
    mapUrl: base.mapUrl || "https://go.2gis.com/41Efw",
  };
}

function readInvitations(): Invitation[] {
  if (typeof window === "undefined") return [demoInvitation];
  try {
    const raw = localStorage.getItem(INV_KEY);
    if (!raw) {
      localStorage.setItem(INV_KEY, JSON.stringify([demoInvitation]));
      return [demoInvitation];
    }
    const rawList = JSON.parse(raw) as Invitation[];
    const parsed = rawList.map(normalize);
    const migrated = parsed.some(
      (inv, i) => inv.venue !== rawList[i]?.venue || inv.address !== rawList[i]?.address,
    );
    if (!parsed.some((i) => i.id === "demo")) {
      const next = [demoInvitation, ...parsed];
      localStorage.setItem(INV_KEY, JSON.stringify(next));
      return next;
    }
    if (migrated) localStorage.setItem(INV_KEY, JSON.stringify(parsed));
    return parsed;
  } catch {
    return [demoInvitation];
  }
}

function writeInvitations(list: Invitation[]) {
  localStorage.setItem(INV_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("chakyru-sync"));
}

export function getInvitations(): Invitation[] {
  return readInvitations();
}

export function getInvitation(id: string): Invitation | undefined {
  return readInvitations().find((i) => i.id === id);
}

const PENDING_TEMPLATE = "chakyru-edit-template";

export function setPendingTemplate(templateId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_TEMPLATE, templateId);
}

export function takePendingTemplate() {
  if (typeof window === "undefined") return null;
  const id = sessionStorage.getItem(PENDING_TEMPLATE);
  if (id) sessionStorage.removeItem(PENDING_TEMPLATE);
  return id;
}

export function previewInvitation(templateId: string): Invitation {
  const template = getTemplate(templateId);
  const canvas = template.canvas;
  return {
    ...demoInvitation,
    id: `preview-${template.id}`,
    templateId: template.id,
    eventType: template.eventTypes[0],
    names: canvas?.names || demoInvitation.names,
    message: canvas?.message ?? demoInvitation.message,
    musicUrl: template.format === "photo" ? "" : canvas?.musicUrl || DEFAULT_MUSIC_URL,
    music: template.format !== "photo",
    coverImage: canvas?.coverImage ?? "",
    layout: { ...(canvas?.layout ?? {}) },
    extras: [...(canvas?.extras ?? [])],
    blockColors: { ...(canvas?.blockColors ?? {}) },
    copy: { ...(canvas?.copy ?? {}) },
    gallery: { ...(canvas?.gallery ?? {}) },
    ownerId: undefined,
  };
}

export function createStartHref(templateId: string) {
  return `/login?next=${encodeURIComponent(`/create/new?template=${templateId}`)}`;
}

export function pricingHref(templateId: string) {
  setPendingTemplate(templateId);
  return `/pricing?from=${encodeURIComponent(templateId)}`;
}

export function grantLocalTemplate(templateId: string, plan: PlanId = "standard") {
  const user = getUser();
  if (!user || user.auth !== "google" || !templateId) return null;
  const templates = [...new Set([...(user.templates ?? []), templateId].filter(Boolean))];
  const nextPlan: PlanId =
    plan === "pro" || user.plan === "pro" || user.plan === "unlimited" ? "pro" : "standard";
  setUser({ ...user, plan: nextPlan, templates });
  return getUser();
}

export function startInvitation(
  templateId: string,
  opts?: { force?: boolean },
): { invitation: Invitation } | { href: string } {
  if (opts?.force) grantLocalTemplate(templateId);
  const user = getUser();
  if (!user) return { href: createStartHref(templateId) };
  if (!canEditTemplate(user, templateId)) {
    if (opts?.force && user.auth === "google") {
      grantLocalTemplate(templateId);
      try {
        return { invitation: createInvitation(templateId, { force: true }) };
      } catch {
        return { href: pricingHref(templateId) };
      }
    }
    if (user.auth === "name") {
      return { href: `/login?google=1&next=${encodeURIComponent(`/create/new?template=${templateId}`)}` };
    }
    return { href: pricingHref(templateId) };
  }
  try {
    return { invitation: createInvitation(templateId, { force: opts?.force }) };
  } catch {
    return { href: pricingHref(templateId) };
  }
}

export function createInvitation(templateId: string, opts?: { force?: boolean }): Invitation {
  const user = getUser();
  const existing = readInvitations();
  if (!user || (!opts?.force && !canCreateInvitation(user, existing))) {
    throw new Error(user ? "limit" : "login");
  }
  const template = getTemplate(templateId);
  const canvas = template.canvas;
  const invitation: Invitation = {
    id: uid(),
    templateId: template.id,
    eventType: template.eventTypes[0],
    names: canvas?.names || "Манас & Каныкей",
    hosts: "",
    date: "2012-12-12",
    time: "17:00",
    venue: "«Ала-Тоо»",
    address: "Ресторанный комплекс",
    city: "Бишкек",
    message: canvas?.message ?? "",
    dressCode: "",
    adultsOnly: false,
    music: template.format !== "photo",
    musicUrl: template.format === "photo" ? "" : canvas?.musicUrl || DEFAULT_MUSIC_URL,
    mapUrl: "https://go.2gis.com/41Efw",
    voiceText: "",
    voiceUrl: "",
    coverImage: canvas?.coverImage ?? "",
    layout: { ...(canvas?.layout ?? {}) },
    extras: [...(canvas?.extras ?? [])],
    blockColors: { ...(canvas?.blockColors ?? {}) },
    copy: { ...(canvas?.copy ?? {}) },
    gallery: { ...(canvas?.gallery ?? {}) },
    createdAt: new Date().toISOString(),
    guests: [],
    wishes: [],
    ownerId: user.id,
  };
  writeInvitations([invitation, ...readInvitations()]);
  return invitation;
}

export function saveInvitation(next: Invitation) {
  const list = readInvitations();
  const idx = list.findIndex((i) => i.id === next.id);
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  writeInvitations(list);
}

export function addRsvp(
  invitationId: string,
  name: string,
  rsvp: RsvpStatus,
  plusOne: number,
): Guest {
  if (invitationId.startsWith("preview-")) {
    return { id: "preview-rsvp", name, rsvp, plusOne };
  }
  const inv = getInvitation(invitationId);
  if (!inv) throw new Error("not found");
  const existing = inv.guests.find(
    (g) => g.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );
  const guest: Guest = existing
    ? { ...existing, rsvp, plusOne }
    : { id: uid(), name, rsvp, plusOne };
  const guests = existing
    ? inv.guests.map((g) => (g.id === guest.id ? guest : g))
    : [...inv.guests, guest];
  saveInvitation({ ...inv, guests });
  return guest;
}

export function addWish(invitationId: string, name: string, text: string): Wish {
  if (invitationId.startsWith("preview-")) {
    return { id: "preview-wish", name, text, likes: 0, createdAt: new Date().toISOString() };
  }
  const inv = getInvitation(invitationId);
  if (!inv) throw new Error("not found");
  const wish: Wish = {
    id: uid(),
    name,
    text,
    likes: 0,
    createdAt: new Date().toISOString(),
  };
  saveInvitation({ ...inv, wishes: [wish, ...inv.wishes] });
  return wish;
}

export function likeWish(invitationId: string, wishId: string) {
  const inv = getInvitation(invitationId);
  if (!inv) return;
  saveInvitation({
    ...inv,
    wishes: inv.wishes.map((w) =>
      w.id === wishId ? { ...w, likes: w.likes + 1 } : w,
    ),
  });
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<User> & { name: string };
    if (!parsed.name) return null;
    return normalizeUser(parsed);
  } catch {
    return null;
  }
}

export function transferInvitations(fromId: string, toId: string) {
  if (!fromId || !toId || fromId === toId) return;
  writeInvitations(
    readInvitations().map((inv) =>
      inv.ownerId === fromId ? { ...inv, ownerId: toId } : inv,
    ),
  );
}

export function setUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(user)));
  window.dispatchEvent(new Event("chakyru-sync"));
}

export function setUserPlan(plan: PlanId) {
  const user = getUser();
  if (!user || user.auth !== "google") return null;
  const next = { ...user, plan };
  setUser(next);
  return next;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("chakyru-sync"));
}

export async function logout() {
  const { signOutFirebase } = await import("./firebase");
  await signOutFirebase();
  clearUser();
}
