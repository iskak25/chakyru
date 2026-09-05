import { getAdminDb } from "../firebaseAdmin";
import { isFreeTemplate, pickStoredPrice, templates as seedTemplates } from "../templates";
import type { InvitationTemplate } from "../types";

export async function loadCatalogTemplates(): Promise<InvitationTemplate[]> {
  const db = getAdminDb();
  if (db) {
    try {
      const snap = await db.collection("catalog").doc("templates").get();
      const items = snap.data()?.items;
      if (Array.isArray(items) && items.length) {
        return items as InvitationTemplate[];
      }
    } catch {
      /* seed */
    }
  }
  return seedTemplates;
}

export async function getCatalogTemplate(templateId: string): Promise<InvitationTemplate | null> {
  const list = await loadCatalogTemplates();
  const live = list.find((item) => item.id === templateId);
  const seed = seedTemplates.find((item) => item.id === templateId);
  if (!live && !seed) return null;
  const base = seed ?? live;
  if (!base) return null;
  const priceSom = pickStoredPrice(
    live?.priceSom,
    seed?.priceSom ?? live?.priceSom ?? 0,
    templateId,
    (seed ?? live)?.format,
  );
  return { ...base, ...live, priceSom };
}

export async function getCatalogBasePrice(templateId: string): Promise<number | null> {
  const template = await getCatalogTemplate(templateId);
  if (!template) return null;
  if (isFreeTemplate(template.id, template.priceSom)) return 0;
  return template.priceSom;
}

function firestoreSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function patchCatalogBasePrices(prices: Record<string, number>) {
  const db = getAdminDb();
  if (!db) throw new Error("firestore");
  const ref = db.collection("catalog").doc("templates");
  const snap = await ref.get();
  const existing = Array.isArray(snap.data()?.items) ? (snap.data()?.items as InvitationTemplate[]) : [];
  const base = existing.length ? existing : seedTemplates;
  const items = firestoreSafe(
    base.map((item) => {
      const next = prices[item.id];
      if (typeof next !== "number" || !Number.isFinite(next) || next < 0) return item;
      return { ...item, priceSom: next };
    }),
  );
  const updatedAt = Date.now();
  await ref.set(
    {
      items,
      updatedAt,
      updatedAtIso: new Date(updatedAt).toISOString(),
    },
    { merge: true },
  );
  return items;
}

export async function setProPriceSom(proPriceSom: number) {
  const db = getAdminDb();
  if (!db) throw new Error("firestore");
  const updatedAt = Date.now();
  await db.collection("catalog").doc("pricing").set(
    {
      proPriceSom,
      updatedAt,
      updatedAtIso: new Date(updatedAt).toISOString(),
    },
    { merge: true },
  );
}
