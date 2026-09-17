"use client";
import { firebaseIdToken } from "./firebase";

export async function uploadInvitationAudio(file: File, locale: string): Promise<string> {
  const ru = locale === "ru";
  if (!file.size || file.size > 10 * 1024 * 1024 || !/\.(mp3|m4a|ogg|wav)$/i.test(file.name)) {
    throw new Error(ru ? "Выберите MP3, M4A, OGG или WAV размером до 10 МБ." : "10 МБ чейин MP3, M4A, OGG же WAV файлын тандаңыз.");
  }
  const token = await firebaseIdToken();
  if (!token) throw new Error(ru ? "Войдите в аккаунт, чтобы загрузить музыку." : "Музыка жүктөө үчүн аккаунтка кириңиз.");
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/uploads/audio", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.url) throw new Error(ru ? "Не удалось загрузить музыку. Проверьте подключение и настройки хранилища или используйте ссылку на аудио." : "Музыка жүктөлгөн жок. Байланышты жана сактагычты текшериңиз же аудио шилтемесин колдонуңуз.");
  return result.url;
}
