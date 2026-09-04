"use client";

import { getFirebaseAuth } from "./firebase";
import type { Invitation, TemplateAccessType } from "./types";

export async function authHeaders(): Promise<HeadersInit> {
  const token = await getFirebaseAuth()?.currentUser?.getIdToken();
  return token ? { authorization: `Bearer ${token}`, "content-type": "application/json" } : { "content-type": "application/json" };
}

export type TemplateAccessResponse = {
  allowed: boolean;
  accessType: TemplateAccessType | null;
  owned: boolean;
  isFree: boolean;
  price: number | null;
};

export async function fetchTemplateAccess(templateId: string): Promise<TemplateAccessResponse | null> {
  const auth = getFirebaseAuth();
  await auth?.authStateReady();
  const token = await auth?.currentUser?.getIdToken();
  if (!token) return null;
  const res = await fetch(`/api/access?templateId=${encodeURIComponent(templateId)}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as TemplateAccessResponse;
}

export async function pushInvitationRemote(invitation: Invitation) {
  const headers = await authHeaders();
  if (!("authorization" in headers)) return;
  await fetch("/api/invitations", {
    method: "PUT",
    headers,
    body: JSON.stringify({ invitation }),
  }).catch(() => {});
}

export async function fetchInvitationRemote(id: string): Promise<Invitation | null> {
  const res = await fetch(`/api/invitations/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { invitation?: Invitation };
  return data.invitation ?? null;
}

export async function fetchMyInvitationsRemote(): Promise<Invitation[]> {
  const headers = await authHeaders();
  if (!("authorization" in headers)) return [];
  const res = await fetch("/api/invitations", { headers, cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { invitations?: Invitation[] };
  return Array.isArray(data.invitations) ? data.invitations : [];
}
