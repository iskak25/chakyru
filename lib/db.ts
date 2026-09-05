"use client";

import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { isAdminEmail } from "./auth";
import { getFirebaseApp, getFirebaseAuth, profileFromFirebase } from "./firebase";
import type { Lesson } from "./lessons";
import type { AccountRole, InvitationTemplate, PlanId, SiteSettings } from "./types";
import type { PublicPricing } from "./settings";
import { mergeSettings, publicPricing } from "./settings";

export type RemoteUser = {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  picture?: string;
  accountRole: AccountRole;
  plan: PlanId;
  templates?: string[];
  createdAt?: string;
};

function parseRole(value: unknown): AccountRole {
  if (value === "admin" || value === "vip") return value;
  return "user";
}

function parseTemplates(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && id.length > 0);
}

function parsePlan(value: unknown): PlanId {
  if (value === "standard" || value === "pro" || value === "unlimited") return value;
  return "free";
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  return getFirestore(app);
}

export async function upsertGoogleUser(input: {
  firebaseUid: string;
  id: string;
  name: string;
  email: string;
  picture?: string;
  plan?: PlanId;
}): Promise<RemoteUser | null> {
  const db = getFirebaseDb();
  if (!db || !input.firebaseUid) return null;
  try {
    const ref = doc(db, "users", input.firebaseUid);
    const snap = await getDoc(ref);
    const now = new Date().toISOString();
    const asAdmin = isAdminEmail(input.email);
    if (snap.exists()) {
      const data = snap.data();
      const next: RemoteUser = {
        id: input.id,
        firebaseUid: input.firebaseUid,
        name: input.name,
        email: input.email,
        picture: input.picture,
        accountRole: asAdmin ? "admin" : parseRole(data.accountRole),
        plan: parsePlan(data.plan) || input.plan || "free",
        templates: parseTemplates(data.templates),
        createdAt: typeof data.createdAt === "string" ? data.createdAt : now,
      };
      await setDoc(
        ref,
        {
          id: next.id,
          firebaseUid: next.firebaseUid,
          name: next.name,
          email: next.email,
          picture: next.picture ?? null,
          updatedAt: now,
        },
        { merge: true },
      );
      if (asAdmin && parseRole(data.accountRole) !== "admin") {
        try {
          await setDoc(ref, { accountRole: "admin", updatedAt: now }, { merge: true });
          next.accountRole = "admin";
        } catch {
          /* bootstrap rule may deny; user row still exists */
        }
      }
      return next;
    }
    const created: RemoteUser = {
      id: input.id,
      firebaseUid: input.firebaseUid,
      name: input.name,
      email: input.email,
      picture: input.picture,
      accountRole: "user",
      plan: input.plan ?? "free",
      templates: [],
      createdAt: now,
    };
    await setDoc(ref, { ...created, picture: created.picture ?? null, updatedAt: now });
    if (asAdmin) {
      try {
        await setDoc(ref, { accountRole: "admin", updatedAt: now }, { merge: true });
        created.accountRole = "admin";
      } catch {
        /* listed as user until an admin upgrades the role */
      }
    }
    return created;
  } catch {
    return null;
  }
}

export async function syncCurrentGoogleUser(): Promise<RemoteUser | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  await auth.authStateReady();
  const fb = auth.currentUser;
  if (!fb) return null;
  const profile = profileFromFirebase(fb);
  if (!profile.email) return null;
  return upsertGoogleUser({
    firebaseUid: fb.uid,
    id: profile.id,
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
  });
}

export function watchMe(uid: string, onUser: (user: RemoteUser | null) => void): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db || !uid) return null;
  return onSnapshot(doc(db, "users", uid), (snap) => {
    if (!snap.exists()) {
      onUser(null);
      return;
    }
    const data = snap.data();
    onUser({
      id: String(data.id ?? `google:${uid}`),
      firebaseUid: uid,
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      picture: data.picture ? String(data.picture) : undefined,
      accountRole: parseRole(data.accountRole),
      plan: parsePlan(data.plan),
      templates: parseTemplates(data.templates),
      createdAt: typeof data.createdAt === "string" ? data.createdAt : undefined,
    });
  });
}

export function watchUsers(onUsers: (users: RemoteUser[]) => void, onError?: (err: unknown) => void): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;
  return onSnapshot(
    collection(db, "users"),
    (snap) => {
      const users = snap.docs.map((item) => {
        const data = item.data();
        return {
          id: String(data.id ?? `google:${item.id}`),
          firebaseUid: item.id,
          name: String(data.name ?? ""),
          email: String(data.email ?? ""),
          picture: data.picture ? String(data.picture) : undefined,
          accountRole: parseRole(data.accountRole),
          plan: parsePlan(data.plan),
          templates: parseTemplates(data.templates),
          createdAt: typeof data.createdAt === "string" ? data.createdAt : undefined,
        } satisfies RemoteUser;
      });
      users.sort((a, b) => a.email.localeCompare(b.email));
      onUsers(users);
    },
    (err) => onError?.(err),
  );
}

export async function setUserRole(uid: string, accountRole: AccountRole) {
  const db = getFirebaseDb();
  if (!db) throw new Error("firestore");
  await setDoc(
    doc(db, "users", uid),
    { accountRole, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

export async function setUserPlan(uid: string, plan: PlanId) {
  const db = getFirebaseDb();
  if (!db) throw new Error("firestore");
  await setDoc(
    doc(db, "users", uid),
    { plan, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

const TEMPLATES_KEY = "chakyru-catalog-templates";
const LESSONS_KEY = "chakyru-catalog-lessons";

function writeBundle<T>(key: string, items: T[], updatedAt: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify({ items, updatedAt }));
}

export function watchCatalogTemplates(
  onItems: (items: InvitationTemplate[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;
  return onSnapshot(
    doc(db, "catalog", "templates"),
    (snap) => {
      const data = snap.data();
      const items = data?.items;
      const local = readLocalTemplates();
      if (!Array.isArray(items) || items.length === 0) {
        return;
      }
      const remoteAt = Number(data?.updatedAt) || Date.parse(String(data?.updatedAtIso ?? data?.updatedAt ?? "")) || 0;
      const localAt = local?.updatedAt || 0;
      if (local?.items?.length && localAt > remoteAt) {
        onItems(local.items);
        return;
      }
      writeBundle(TEMPLATES_KEY, items as InvitationTemplate[], remoteAt || Date.now());
      onItems(items as InvitationTemplate[]);
    },
    (err) => onError?.(err),
  );
}

export function watchCatalogLessons(
  onItems: (items: Lesson[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;
  return onSnapshot(
    doc(db, "catalog", "lessons"),
    (snap) => {
      const data = snap.data();
      const items = data?.items;
      if (!Array.isArray(items)) return;
      const remoteAt = Number(data?.updatedAt) || Date.parse(String(data?.updatedAtIso ?? data?.updatedAt ?? "")) || 0;
      const local = readLocalLessons();
      if (local?.items?.length && local.updatedAt > remoteAt) {
        onItems(local.items);
        return;
      }
      writeBundle(LESSONS_KEY, items as Lesson[], remoteAt || Date.now());
      onItems(items as Lesson[]);
    },
    (err) => onError?.(err),
  );
}

type CatalogBundle<T> = { items: T[]; updatedAt: number };

function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readBundle<T>(key: string): CatalogBundle<T> | null {
  const parsed = readLocal<unknown>(key);
  if (!parsed) return null;
  if (Array.isArray(parsed)) {
    return { items: parsed as T[], updatedAt: 0 };
  }
  if (typeof parsed === "object" && parsed && "items" in parsed && Array.isArray((parsed as CatalogBundle<T>).items)) {
    const bundle = parsed as CatalogBundle<T>;
    return { items: bundle.items, updatedAt: Number(bundle.updatedAt) || 0 };
  }
  return null;
}

export function readLocalTemplates() {
  return readBundle<InvitationTemplate>(TEMPLATES_KEY);
}

export function readLocalLessons() {
  return readBundle<Lesson>(LESSONS_KEY);
}

function jsonBytes(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

function dropInline(value?: string) {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("blob:")) return "";
  return value;
}

function forFirestore(items: InvitationTemplate[]): InvitationTemplate[] {
  return items.map((item) => {
    const canvas = item.canvas;
    if (!canvas) return item;
    const gallery: Record<string, string> = {};
    for (const [key, src] of Object.entries(canvas.gallery ?? {})) {
      const next = dropInline(src);
      if (next) gallery[key] = next;
    }
    return {
      ...item,
      canvas: {
        ...canvas,
        coverImage: dropInline(canvas.coverImage),
        musicUrl: dropInline(canvas.musicUrl),
        gallery,
        extras: (canvas.extras ?? []).map((extra) => ({
          ...extra,
          src: dropInline(extra.src),
          url: dropInline(extra.url),
        })),
      },
    };
  });
}

export async function saveCatalogTemplates(items: InvitationTemplate[]) {
  let remoteItems = forFirestore(items);
  let remoteBytes = jsonBytes(remoteItems);
  if (remoteBytes > 900_000) {
    remoteItems = remoteItems.map(({ canvas: _canvas, ...rest }) => rest);
    remoteBytes = jsonBytes(remoteItems);
  }
  const updatedAt = Date.now();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify({ items: remoteItems, updatedAt }));
    } catch {
      /* quota */
    }
  }
  const db = getFirebaseDb();
  if (!db) return { remote: false as const };
  await setDoc(doc(db, "catalog", "templates"), {
    items: remoteItems,
    updatedAt,
    updatedAtIso: new Date(updatedAt).toISOString(),
  });
  return { remote: true as const };
}

export async function saveCatalogLessons(items: Lesson[]) {
  const updatedAt = Date.now();
  if (typeof window !== "undefined") {
    localStorage.setItem(LESSONS_KEY, JSON.stringify({ items, updatedAt }));
  }
  const db = getFirebaseDb();
  if (!db) return { remote: false as const };
  await setDoc(doc(db, "catalog", "lessons"), { items, updatedAt, updatedAtIso: new Date(updatedAt).toISOString() });
  return { remote: true as const };
}

const SETTINGS_KEY = "chakyru-site-settings";

export function readLocalSettings(): SiteSettings {
  return mergeSettings(readLocal<SiteSettings>(SETTINGS_KEY));
}

export function watchPublicPricing(
  onPricing: (pricing: PublicPricing) => void,
  onError?: (err: unknown) => void,
): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;
  return onSnapshot(
    doc(db, "catalog", "pricing"),
    (snap) => {
      const data = snap.data();
      if (!data) return;
      onPricing(publicPricing(mergeSettings(data)));
    },
    (err) => onError?.(err),
  );
}

export function watchSiteSettings(
  onSettings: (settings: SiteSettings) => void,
  onError?: (err: unknown) => void,
): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;
  let pricing: Record<string, unknown> = {};
  let payments: Record<string, unknown> = {};
  const emit = () => onSettings(mergeSettings({ ...pricing, ...payments }));
  const stopP = onSnapshot(doc(db, "catalog", "pricing"), (snap) => {
    pricing = snap.data() ?? {};
    emit();
  }, (err) => onError?.(err));
  const stopPay = onSnapshot(doc(db, "catalog", "payments"), (snap) => {
    payments = snap.data() ?? {};
    emit();
  }, (err) => onError?.(err));
  return () => {
    stopP();
    stopPay();
  };
}

export async function saveSiteSettings(input: SiteSettings) {
  const settings = mergeSettings(input);
  if (typeof window !== "undefined") {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
  const db = getFirebaseDb();
  if (!db) return { remote: false as const };
  const updatedAt = Date.now();
  const iso = new Date(updatedAt).toISOString();
  await Promise.all([
    setDoc(
      doc(db, "catalog", "pricing"),
      {
        proPriceSom: settings.proPriceSom,
        updatedAt,
        updatedAtIso: iso,
      },
      { merge: true },
    ),
    setDoc(
      doc(db, "catalog", "payments"),
      {
        finikApiKey: settings.finikApiKey,
        finikAccountId: settings.finikAccountId,
        finikPrivateKey: settings.finikPrivateKey,
        finikMcc: settings.finikMcc,
        finikBeta: settings.finikBeta,
        siteUrl: settings.siteUrl,
        updatedAt,
        updatedAtIso: iso,
      },
      { merge: true },
    ),
  ]);
  return { remote: true as const };
}
