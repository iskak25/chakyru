"use client";

import { getFirebaseAuth } from "./firebase";
import type { Invitation } from "./types";

// Recover photos from drafts made by older editors that stored data URLs.
export async function persistInvitationImages(invitation: Invitation): Promise<Invitation> {
  const uploads = new Map<string, Promise<string>>();
  function persist(src: string): Promise<string> {
    if (!/^(data:|blob:)/.test(src)) return Promise.resolve(src);
    let upload = uploads.get(src);
    if (!upload) {
      upload = (async () => {
        const blob = await (await fetch(src)).blob();
        return uploadInvitationImage(new File([blob], "invitation-photo", { type: blob.type }));
      })();
      uploads.set(src, upload);
    }
    return upload;
  }
  const coverImage = await persist(invitation.coverImage || "");
  const gallery = Object.fromEntries(await Promise.all(Object.entries(invitation.gallery ?? {}).map(async ([slot, src]) => [slot, await persist(src)])));
  const extras = await Promise.all((invitation.extras ?? []).map(async item => item.src ? { ...item, src: await persist(item.src) } : item));
  return { ...invitation, coverImage, gallery, extras };
}

export async function uploadInvitationImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
    throw new Error("Выберите JPG, PNG или WebP размером до 8 МБ.");
  }
  const auth = getFirebaseAuth();
  await auth?.authStateReady();
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new Error("Войдите в аккаунт, чтобы загрузить фотографию.");
  const data = new FormData();
  data.append("file", file);
  const response = await fetch("/api/uploads/images", { method: "POST", headers: { authorization: `Bearer ${token}` }, body: data });
  const result = await response.json().catch(() => null) as { url?: string; error?: string } | null;
  if (!response.ok || !result?.url) throw new Error(result?.error || "Не удалось загрузить фотографию. Попробуйте ещё раз.");
  return result.url;
}
