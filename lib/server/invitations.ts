import { getAdminDb } from "../firebaseAdmin";
import type { Guest, Invitation, RsvpStatus, Wish } from "../types";

function asInvitation(id: string, data: Record<string, unknown>): Invitation | null {
  if (!data || typeof data.templateId !== "string" || !data.templateId) return null;
  return {
    ...(data as unknown as Invitation),
    id,
    templateId: data.templateId,
  };
}

export async function getInvitationDoc(id: string): Promise<Invitation | null> {
  const db = getAdminDb();
  if (!db || !id || id === "demo" || id.startsWith("preview-")) return null;
  const snap = await db.collection("invitations").doc(id).get();
  if (!snap.exists) return null;
  return asInvitation(id, (snap.data() ?? {}) as Record<string, unknown>);
}

export async function listUserInvitations(uid: string, ownerId?: string): Promise<Invitation[]> {
  const db = getAdminDb();
  if (!db || !uid) return [];
  const byUid = await db.collection("invitations").where("ownerUid", "==", uid).get();
  const rows = byUid.docs
    .map((doc) => asInvitation(doc.id, (doc.data() ?? {}) as Record<string, unknown>))
    .filter((item): item is Invitation => Boolean(item));
  if (ownerId) {
    const byOwner = await db.collection("invitations").where("ownerId", "==", ownerId).get();
    for (const doc of byOwner.docs) {
      if (rows.some((item) => item.id === doc.id)) continue;
      const inv = asInvitation(doc.id, (doc.data() ?? {}) as Record<string, unknown>);
      if (inv) rows.push(inv);
    }
  }
  return rows;
}

function forStore(inv: Invitation): Invitation {
  return {
    ...inv,
    coverImage: inv.coverImage?.startsWith("data:") ? "" : inv.coverImage,
    musicUrl: inv.musicUrl?.startsWith("data:") || inv.musicUrl?.startsWith("blob:") ? "" : inv.musicUrl,
    voiceUrl: inv.voiceUrl?.startsWith("data:") || inv.voiceUrl?.startsWith("blob:") ? "" : inv.voiceUrl,
    gallery: Object.fromEntries(
      Object.entries(inv.gallery ?? {}).filter(([, src]) => typeof src === "string" && !src.startsWith("data:") && !src.startsWith("blob:")),
    ),
    extras: (inv.extras ?? []).map((extra) => ({
      ...extra,
      src: extra.src?.startsWith("data:") || extra.src?.startsWith("blob:") ? "" : extra.src,
      url: extra.url?.startsWith("data:") || extra.url?.startsWith("blob:") ? "" : extra.url,
    })),
  };
}

export async function saveInvitationDoc(input: {
  invitation: Invitation;
  ownerUid: string;
  ownerId: string;
}) {
  const db = getAdminDb();
  if (!db) return false;
  const id = input.invitation.id;
  if (!id || id === "demo" || id.startsWith("preview-")) return false;
  const existing = await getInvitationDoc(id);
  if (existing?.ownerUid && existing.ownerUid !== input.ownerUid) return false;
  if (existing?.ownerId && existing.ownerId !== input.ownerId && existing.ownerUid !== input.ownerUid) return false;
  const now = new Date().toISOString();
  const stored = forStore({
    ...input.invitation,
    id,
    ownerId: existing?.ownerId || input.ownerId,
    ownerUid: existing?.ownerUid || input.ownerUid,
    templateId: existing?.templateId || input.invitation.templateId,
    status: input.invitation.status || existing?.status || "published",
    updatedAt: now,
    createdAt: existing?.createdAt || input.invitation.createdAt || now,
  });
  await db.collection("invitations").doc(id).set(stored, { merge: true });
  return true;
}

export async function addInvitationRsvp(input: {
  invitationId: string;
  name: string;
  rsvp: RsvpStatus;
  plusOne: number;
}): Promise<Guest | null> {
  const db = getAdminDb();
  if (!db) return null;
  const ref = db.collection("invitations").doc(input.invitationId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const inv = asInvitation(input.invitationId, (snap.data() ?? {}) as Record<string, unknown>);
  if (!inv) return null;
  const guests = Array.isArray(inv.guests) ? inv.guests : [];
  const existing = guests.find((g) => g.name.trim().toLowerCase() === input.name.trim().toLowerCase());
  const guest: Guest = existing
    ? { ...existing, rsvp: input.rsvp, plusOne: input.plusOne }
    : { id: crypto.randomUUID(), name: input.name, rsvp: input.rsvp, plusOne: input.plusOne };
  const next = existing ? guests.map((g) => (g.id === guest.id ? guest : g)) : [...guests, guest];
  await ref.set({ guests: next, updatedAt: new Date().toISOString() }, { merge: true });
  return guest;
}

export async function addInvitationWish(input: {
  invitationId: string;
  name: string;
  text: string;
}): Promise<Wish | null> {
  const db = getAdminDb();
  if (!db) return null;
  const ref = db.collection("invitations").doc(input.invitationId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const inv = asInvitation(input.invitationId, (snap.data() ?? {}) as Record<string, unknown>);
  if (!inv) return null;
  const wish: Wish = {
    id: crypto.randomUUID(),
    name: input.name,
    text: input.text,
    likes: 0,
    createdAt: new Date().toISOString(),
  };
  await ref.set(
    {
      wishes: [wish, ...(Array.isArray(inv.wishes) ? inv.wishes : [])],
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return wish;
}

export async function likeInvitationWish(invitationId: string, wishId: string) {
  const db = getAdminDb();
  if (!db) return false;
  const ref = db.collection("invitations").doc(invitationId);
  const snap = await ref.get();
  if (!snap.exists) return false;
  const inv = asInvitation(invitationId, (snap.data() ?? {}) as Record<string, unknown>);
  if (!inv) return false;
  await ref.set(
    {
      wishes: (inv.wishes ?? []).map((wish) => (wish.id === wishId ? { ...wish, likes: wish.likes + 1 } : wish)),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return true;
}
