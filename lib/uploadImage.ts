"use client";

import { getFirebaseAuth } from "./firebase";

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
