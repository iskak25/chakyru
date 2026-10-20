import { getDict } from "./i18n";
import { getTemplatePhotos } from "./templatePhotos";
import type { Invitation } from "./types";

const KY_MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];

/** «8-ноябрь» — день и месяц без года, как в заголовке превью. */
export function shortInviteDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date?.trim() ?? "");
  if (!match) return "";
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  return `${day}-${KY_MONTHS[month - 1]}`;
}

/** Откуда брать обложку: своя обложка → главное фото → фото шаблона. */
export function inviteCoverSource(inv: Invitation): string {
  return inv.coverImage || inv.gallery?.hero || getTemplatePhotos(inv.templateId).hero || "";
}

/** Названия торжества, которые задаёт сам шаблон, а не тип события (eventType у них общий с другим торжеством). */
const TEMPLATE_KIND: Record<string, string> = { "amir-falcon": "Сүнөт той" };

/** Заголовок, описание и картинка для превью ссылки (WhatsApp, Telegram, Facebook). */
export function inviteShareMeta(inv: Invitation): { title: string; description: string; image: string } {
  const events = getDict("ky").events as Record<string, string>;
  const kind = inv.copy?.eventTitle?.trim() || TEMPLATE_KIND[inv.templateId] || events[inv.eventType] || "Той";
  const date = shortInviteDate(inv.date);
  const title = date ? `${kind} — ${date}` : kind;
  const venue = inv.venue?.trim() ?? "";
  const address = inv.address?.replace(/[​-‍﻿]/g, "").trim() ?? "";
  const city = inv.city?.trim() ?? "";
  // Адрес — то, что гость видит на странице; поле «город» бывает не видно в шаблоне и хранит
  // значение по умолчанию, поэтому город берём только когда адреса нет.
  const where = address || city;
  const place = [venue, where && !venue.toLowerCase().includes(where.toLowerCase()) ? where : ""].filter(Boolean).join(", ");
  const description = place
    ? `${place}. Чакырууну ачып, баарын көрүңүз 💌`
    : "Чакырууну ачып, баарын көрүңүз 💌";
  const hasCover = Boolean(inviteCoverSource(inv));
  return {
    title,
    description,
    image: hasCover ? `/api/og/${encodeURIComponent(inv.id)}` : "/og-image.jpg",
  };
}
