"use client";

import type { Guest, Invitation, PlanId, RsvpStatus, User, Wish } from "./types";
import { canCreateInvitation, canEditTemplate, normalizeUser, ownsInvitation } from "./auth";
import { getTemplate } from "./templates";
import { DEFAULT_MUSIC_URL, templateMusicUrl } from "./music";
import { DEFAULT_VENUE } from "./defaultVenue";

const INV_KEY = "chakyru-invitations";
const USER_KEY = "chakyru-user";

function uid() {
  return crypto.randomUUID();
}

export const demoInvitation: Invitation = {
  id: "demo",
  templateId: "ak-shumkar",
  eventType: "toi",
  names: "Айбек & Айгүл",
  hosts: "Асанакуновдордун үй-бүлөсү",
  date: "2012-12-12",
  time: "17:00",
  venue: DEFAULT_VENUE.venue,
  address: DEFAULT_VENUE.address,
  city: "Бишкек",
  message:
    "Сиздерди биз менен бирге үй-бүлө боло турган кубанычтуу күнүбүздү бөлүшүүгө чакырабыз!\n\nБул сыйкырдуу күнү биз бири-бирибизге «Ооба» деп, эң жакын адамдарыбыздын ортосунда жүрөгүбүздү жана тагдырыбызды бириктиребиз.",
  dressCode: "Улуттук / классика",
  adultsOnly: true,
  music: true,
  musicUrl: DEFAULT_MUSIC_URL,
  mapUrl: DEFAULT_VENUE.mapUrl,
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
    coverImage: inv.coverImage ?? "",
    layout: inv.layout ?? {},
    extras: inv.extras ?? [],
    blockColors: inv.blockColors ?? {},
    copy: inv.copy ?? {},
    gallery: inv.gallery ?? {},
    ownerId: inv.ownerId,
  };
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
    names: "Айбек & Айгүл",
    date: "2012-12-12",
    time: base.time || "17:00",
    venue: DEFAULT_VENUE.venue,
    address: base.address || DEFAULT_VENUE.address,
    city: base.city || "Бишкек",
    mapUrl: base.mapUrl || DEFAULT_VENUE.mapUrl,
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

type SyncEntry = {
  pending: Invitation | null;
  timer?: number;
  running?: Promise<boolean>;
};
const invitationSync = new Map<string, SyncEntry>();
const dirtyKey = (id: string) => `chakyru-unsaved:${id}`;

export function hasUnsavedInvitation(id: string) {
  return typeof window !== "undefined" && localStorage.getItem(dirtyKey(id)) === "1";
}

function saveEvent(id: string, state: string) {
  window.dispatchEvent(new CustomEvent("chakyru-save", { detail: { id, state } }));
}

function queueInvitationSync(invitation: Invitation) {
  if (typeof window === "undefined" || invitation.id === "demo" || invitation.id.startsWith("preview-")) return;
  localStorage.setItem(dirtyKey(invitation.id), "1");
  const entry = invitationSync.get(invitation.id) ?? { pending: null };
  invitationSync.set(invitation.id, entry);
  entry.pending = invitation;
  saveEvent(invitation.id, "saving");
  if (entry.timer) window.clearTimeout(entry.timer);
  entry.timer = window.setTimeout(() => { void flushInvitationSync(invitation.id); }, 700);
}

// Drain edits in order; an older response must never overwrite a newer draft.
export async function flushInvitationSync(id: string): Promise<boolean> {
  const entry = invitationSync.get(id);
  if (!entry) return !hasUnsavedInvitation(id);
  if (entry.timer) window.clearTimeout(entry.timer);
  entry.timer = undefined;
  if (entry.running) return entry.running;
  entry.running = (async () => {
    while (entry.pending) {
      const next = entry.pending;
      entry.pending = null;
      try {
        const { pushInvitationRemote } = await import("./accessClient");
        const result = await pushInvitationRemote(next);
        if (!result.ok) {
          entry.pending ??= next;
          saveEvent(id, result.pending ? "pending" : result.reason === "owner" ? "forbidden" : result.reason === "expired" ? "expired" : "error");
          return false;
        }
        if (!entry.pending) {
          if (result.invitation) mergeInvitation(result.invitation);
          localStorage.removeItem(dirtyKey(id));
          saveEvent(id, "saved");
        }
      } catch {
        entry.pending ??= next;
        saveEvent(id, "error");
        return false;
      }
    }
    return true;
  })();
  try { return await entry.running; }
  finally { entry.running = undefined; }
}

export async function ensureInvitationSaved(invitation: Invitation) {
  queueInvitationSync(invitation);
  return flushInvitationSync(invitation.id);
}

function mergeInvitation(inv: Invitation) {
  const list = readInvitations();
  const idx = list.findIndex((item) => item.id === inv.id);
  if (idx >= 0) list[idx] = inv;
  else list.unshift(inv);
  writeInvitations(list);
}

export function rememberRemoteInvitation(inv: Invitation) {
  if (hasUnsavedInvitation(inv.id)) return;
  mergeInvitation(inv);
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

  // Custom preview data for ak-kyoshok template
  const isAkKyoshok = templateId === "ak-kyoshok";

  return {
    ...demoInvitation,
    id: `preview-${template.id}`,
    templateId: template.id,
    eventType: template.eventTypes[0],
    date: canvas?.date ?? demoInvitation.date,
    time: canvas?.time ?? demoInvitation.time,
    venue: canvas?.venue ?? demoInvitation.venue,
    address: canvas?.address ?? demoInvitation.address,
    city: canvas?.city ?? demoInvitation.city,
    dressCode: canvas?.dressCode ?? demoInvitation.dressCode,
    mapUrl: canvas?.mapUrl ?? demoInvitation.mapUrl,
    names: canvas?.names ?? (isAkKyoshok ? "Айбек & Айгул" : demoInvitation.names),
    message: canvas?.message ?? demoInvitation.message,
    musicUrl: templateMusicUrl(template),
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
  // A Pro subscription does not grant permanent ownership of its templates.
  if (plan === "pro" || plan === "unlimited") return user;
  const templates = [...new Set([...(user.templates ?? []), templateId].filter(Boolean))];
  const nextPlan: PlanId =
    user.plan === "pro" || user.plan === "unlimited" ? "pro" : "standard";
  setUser({ ...user, plan: nextPlan, templates });
  return getUser();
}

export function startInvitation(
  templateId: string,
): { invitation: Invitation; created: boolean } | { href: string } {
  const user = getUser();
  if (!user) return { href: createStartHref(templateId) };
  if (!canEditTemplate(user, templateId)) {
    if (user.auth === "name") {
      return { href: `/login?google=1&next=${encodeURIComponent(`/create/new?template=${templateId}`)}` };
    }
    return { href: pricingHref(templateId) };
  }
  try {
    return { invitation: createInvitation(templateId), created: true };
  } catch {
    return { href: pricingHref(templateId) };
  }
}

export function openPaidInvitation(templateId: string): { invitation: Invitation; created: boolean } | { href: string } {
  const user = getUser();
  if (!user) return { href: createStartHref(templateId) };
  if (user.auth !== "google") {
    return { href: `/login?google=1&next=${encodeURIComponent(`/create/new?template=${templateId}&paid=1`)}` };
  }
  grantLocalTemplate(templateId);
  const host = getUser();
  const mine = readInvitations().find(
    (inv) =>
      inv.id !== "demo" &&
      !inv.id.startsWith("preview-") &&
      inv.templateId === templateId &&
      ownsInvitation(host, inv),
  );
  if (mine) return { invitation: mine, created: false };
  try {
    return { invitation: createInvitation(templateId, { force: true }), created: true };
  } catch {
    return startInvitation(templateId);
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
    names: canvas?.names || "Айбек & Айгүл",
    hosts: "",
    date: canvas?.date ?? "2012-12-12",
    time: canvas?.time ?? "17:00",
    venue: canvas?.venue ?? DEFAULT_VENUE.venue,
    address: canvas?.address ?? DEFAULT_VENUE.address,
    city: canvas?.city ?? "Бишкек",
    message: canvas?.message ?? "",
    dressCode: canvas?.dressCode ?? "",
    adultsOnly: false,
    music: template.format !== "photo",
    musicUrl: templateMusicUrl(template),
    mapUrl: canvas?.mapUrl ?? DEFAULT_VENUE.mapUrl,
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
    ownerUid: user.id.startsWith("google:") ? user.id.slice("google:".length) : user.id,
    status: "published",
    updatedAt: new Date().toISOString(),
  };
  writeInvitations([invitation, ...readInvitations()]);
  queueInvitationSync(invitation);
  return invitation;
}

export function saveInvitation(next: Invitation) {
  const list = readInvitations();
  const idx = list.findIndex((i) => i.id === next.id);
  const stored = { ...next, updatedAt: new Date().toISOString() };
  if (idx >= 0) list[idx] = stored;
  else list.unshift(stored);
  writeInvitations(list);
  queueInvitationSync(stored);
}

export async function addRsvp(
  invitationId: string,
  name: string,
  rsvp: RsvpStatus,
  plusOne: number,
  details: { drinks?: string; note?: string; wish?: string } = {},
): Promise<Guest> {
  const { guestFetch } = await import("./guestSubmission");
  const response = await guestFetch(`/api/invitations/${encodeURIComponent(invitationId)}/rsvp`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, rsvp, plusOne, ...details }),
  });
  const { guest } = await response.json() as { guest: Guest };
  const inv = getInvitation(invitationId);
  if (inv) rememberRemoteInvitation({ ...inv, guests: [...(inv.guests || []).filter(g => g.id !== guest.id && g.name.trim().toLowerCase() !== name.trim().toLowerCase()), guest] });
  return guest;
}

export async function addWish(invitationId: string, name: string, text: string): Promise<Wish> {
  const { guestFetch } = await import("./guestSubmission");
  const response = await guestFetch(`/api/invitations/${encodeURIComponent(invitationId)}/wish`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, text }),
  });
  const { wish } = await response.json() as { wish: Wish };
  const inv = getInvitation(invitationId);
  if (inv) rememberRemoteInvitation({ ...inv, wishes: [wish, ...(inv.wishes || [])] });
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
  void fetch(`/api/invitations/${encodeURIComponent(invitationId)}/like`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ wishId }),
  }).catch(() => {});
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
