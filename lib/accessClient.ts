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

export type InvitationSaveResult =
  | { ok: true; invitation?: Invitation }
  | { ok: false; error: string; reason?: string; pending?: boolean };

export async function fetchTemplateAccess(templateId: string): Promise<TemplateAccessResponse | null> {
  const auth = getFirebaseAuth();
  await auth?.authStateReady();
  let token = await auth?.currentUser?.getIdToken();
  if (!token) {
    const waitUntil = Date.now() + 4000;
    while (!token && Date.now() < waitUntil) {
      await new Promise((r) => window.setTimeout(r, 200));
      await auth?.authStateReady();
      token = await auth?.currentUser?.getIdToken();
    }
  }
  if (!token) return null;
  const res = await fetch(`/api/access?templateId=${encodeURIComponent(templateId)}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as TemplateAccessResponse;
}

export async function pushInvitationRemote(invitation: Invitation): Promise<InvitationSaveResult> {
  const headers = await authHeaders();
  if (!("authorization" in headers)) {
    return { ok: false, error: "auth" };
  }
  try {
    const res = await fetch("/api/invitations", {
      method: "PUT",
      headers,
      body: JSON.stringify({ invitation }),
    });
    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      ok?: boolean;
      invitation?: Invitation;
      error?: string;
      reason?: string;
    } | null;
    if (res.ok && (data?.success || data?.ok)) {
      return { ok: true, invitation: data.invitation };
    }
    const reason = data?.reason || data?.error || "save";
    return {
      ok: false,
      error: reason,
      reason,
      pending: reason === "access" || reason === "pending",
    };
  } catch {
    return { ok: false, error: "network" };
  }
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
