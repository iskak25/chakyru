import type { Invitation, User, Wish } from "@/lib/types";

export function makeInvitation(over: Partial<Invitation> = {}): Invitation {
  return {
    id: "inv1",
    templateId: "tpl1",
    eventType: "wedding",
    names: "Айбек & Айгүл",
    hosts: "",
    date: "2026-06-06",
    time: "16:00",
    venue: "Ресторан",
    address: "ул. Ауэзова 24",
    city: "Бишкек",
    message: "",
    dressCode: "",
    adultsOnly: false,
    music: false,
    musicUrl: "",
    mapUrl: "",
    coverImage: "",
    layout: {},
    extras: [],
    blockColors: {},
    copy: {},
    gallery: {},
    createdAt: "2026-01-01T00:00:00.000Z",
    guests: [],
    wishes: [],
    ...over,
  };
}

export function makeUser(over: Partial<User> = {}): User {
  return {
    id: "google:uid1",
    name: "Test",
    role: "host",
    auth: "google",
    email: "user@example.com",
    plan: "free",
    accountRole: "guest",
    proStartedAt: null,
    proExpiresAt: null,
    templates: [],
    ...over,
  };
}

export function makeWish(over: Partial<Wish> = {}): Wish {
  return { id: "w1", name: "Гость", text: "Бактылуу болунуздар!", likes: 0, createdAt: "2026-02-01T00:00:00.000Z", ...over };
}

export const DAY = 24 * 60 * 60 * 1000;
export const inFuture = (ms = 30 * DAY) => new Date(Date.now() + ms).toISOString();
export const inPast = (ms = 30 * DAY) => new Date(Date.now() - ms).toISOString();
