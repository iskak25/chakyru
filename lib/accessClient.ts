"use client";

// Firebase подгружается при первом обращении к токену: статический импорт клал его в первый бандл гостевой страницы приглашения.
const firebase = () => import("./firebase");
import type { Invitation, TemplateAccessType } from "./types";

export async function authHeaders(): Promise<HeadersInit> {
  // Гостю вход не нужен: не ждём Firebase дольше нескольких секунд, иначе приглашение не откроется.
  const { firebaseIdToken } = await firebase();
  const token = await firebaseIdToken();
  return token ? { authorization: `Bearer ${token}`, "content-type": "application/json" } : { "content-type": "application/json" };
}

const editTokenKey = (id: string) => `chakyru-edit-token:${id}`;

/** Токен ссылки для правки, пришедший по адресу `?edit=…`; живёт в браузере, пока сервер его принимает. */
export function rememberEditToken(id: string, token: string) {
  try { localStorage.setItem(editTokenKey(id), token); } catch {}
}
export function editTokenFor(id: string): string {
  try { return localStorage.getItem(editTokenKey(id)) || ""; } catch { return ""; }
}
function withEditToken(headers: HeadersInit, id: string): HeadersInit {
  const token = editTokenFor(id);
  return token ? { ...headers, "x-edit-token": token } : headers;
}

/** Выпускает ссылку для правки на 7 дней (прежняя перестаёт работать). Только для владельца. */
export async function createEditLinkRemote(id: string): Promise<{ token: string; expiresAt: string } | null> {
  const headers = await authHeaders();
  if (!("authorization" in headers)) return null;
  try {
    const res = await fetch(`/api/invitations/${encodeURIComponent(id)}/edit-link`, { method: "POST", headers });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as { token?: string; expiresAt?: string } | null;
    return data?.token && data.expiresAt ? { token: data.token, expiresAt: data.expiresAt } : null;
  } catch {
    return null;
  }
}

export type TemplateAccessResponse = {
  allowed: boolean;
  accessType: TemplateAccessType | null;
  owned: boolean;
  isFree: boolean;
  expired: boolean;
  expiresAt: string | null;
  price: number | null;
};

export type InvitationSaveResult =
  | { ok: true; invitation?: Invitation }
  | { ok: false; error: string; reason?: string; pending?: boolean };

export async function fetchTemplateAccess(templateId: string): Promise<TemplateAccessResponse | null> {
  const { getFirebaseAuth } = await firebase();
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
  const headers = withEditToken(await authHeaders(), invitation.id);
  if (!("authorization" in headers) && !("x-edit-token" in headers)) {
    return { ok: false, error: "auth" };
  }
  try {
    const { persistInvitationImages } = await import("./uploadImage");
    invitation = await persistInvitationImages(invitation);
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

export async function deleteInvitationRemote(id: string): Promise<boolean> {
  const headers = await authHeaders();
  if (!("authorization" in headers)) return false;
  try {
    const res = await fetch(`/api/invitations/${encodeURIComponent(id)}`, { method: "DELETE", headers });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

export async function setInvitationLinkDisabledRemote(id: string, linkDisabled: boolean): Promise<boolean> {
  const headers = await authHeaders();
  if (!("authorization" in headers)) return false;
  try {
    const res = await fetch(`/api/invitations/${encodeURIComponent(id)}`, { method: "PATCH", headers, body: JSON.stringify({ linkDisabled }) });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

export type InvitationRemote = {
  invitation: Invitation;
  /** Server verdict: the owner has paid, so the page is public and carries no «ДЕМО» mark. */
  paid: boolean;
  viewer: "owner" | "public";
};

/**
 * Sends the session token when there is one: before payment the server shows a page only to its
 * owner, so an anonymous request for it gets 404.
 */
export async function fetchInvitationRemoteMeta(id: string): Promise<InvitationRemote | null> {
  const headers = withEditToken(await authHeaders(), id);
  const res = await fetch(`/api/invitations/${encodeURIComponent(id)}`, { cache: "no-store", headers }).catch(() => null);
  if (!res?.ok) return null;
  const data = (await res.json().catch(() => null)) as { invitation?: Invitation; paid?: boolean; viewer?: string } | null;
  if (!data?.invitation) return null;
  return { invitation: data.invitation, paid: data.paid === true, viewer: data.viewer === "owner" ? "owner" : "public" };
}

export async function fetchInvitationRemote(id: string): Promise<Invitation | null> {
  return (await fetchInvitationRemoteMeta(id))?.invitation ?? null;
}

export async function fetchMyInvitationsRemote(): Promise<Invitation[]> {
  const headers = await authHeaders();
  if (!("authorization" in headers)) return [];
  const res = await fetch("/api/invitations", { headers, cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { invitations?: Invitation[] };
  return Array.isArray(data.invitations) ? data.invitations : [];
}

export async function setWishHiddenRemote(invitationId: string, wishId: string, hidden: boolean): Promise<boolean> {
  const headers = await authHeaders();
  if (!("authorization" in headers)) return false;
  const res = await fetch(`/api/invitations/${encodeURIComponent(invitationId)}/wish`, {
    method: "PATCH", headers, body: JSON.stringify({ wishId, hidden }),
  }).catch(() => null);
  return Boolean(res?.ok);
}

export async function deleteWishRemote(invitationId: string, wishId: string): Promise<boolean> {
  const headers = await authHeaders();
  if (!("authorization" in headers)) return false;
  const res = await fetch(`/api/invitations/${encodeURIComponent(invitationId)}/wish`, {
    method: "DELETE", headers, body: JSON.stringify({ wishId }),
  }).catch(() => null);
  return Boolean(res?.ok);
}

/** Секретный токен открытой ссылки на ответы гостей (создаётся при первом запросе). Только для владельца. */
export async function shareLinkToken(invitationId: string): Promise<string | null> {
  const headers = await authHeaders();
  if (!("authorization" in headers)) return null;
  try {
    const res = await fetch(`/api/invitations/${encodeURIComponent(invitationId)}/responses`, { method: "POST", headers });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as { token?: string } | null;
    return data?.token || null;
  } catch {
    return null;
  }
}
