import { getDict } from "./i18n";
import { allTemplatePhotoSets } from "./templatePhotos";
import { getCollectionDesign } from "./collectionTemplates";
import { eventArt } from "./eventArt";
import { getPinterestDesign } from "./pinterestTemplates";
import { referenceWedding } from "./referenceWeddings";
import { restoredTemplateImage, templateImageSource } from "./templateImageSources";
import { templates } from "./templates";
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

/** Собственная картинка шаблона для превью: обложка коллекции, главное фото шаблона или восстановленный кадр. Пусто, если у шаблона нет своей картинки. */
export function templateCoverSource(inv: Pick<Invitation, "templateId" | "copy">): string {
  const collection = getCollectionDesign(inv);
  const art = collection && eventArt(collection.id).hero;
  if (art) return art;
  const own = templates.find((t) => t.id === inv.templateId)?.canvas?.gallery?.hero;
  if (own) return own;
  const crop = (getPinterestDesign(inv) ?? referenceWedding(inv))?.photos.hero;
  const restored = restoredTemplateImage(crop)?.source;
  if (restored) return restored;
  if (crop?.source.startsWith("/images/")) return crop.source;
  const set = allTemplatePhotoSets()[inv.templateId];
  return set ? templateImageSource(set.hero) : "";
}

/** Откуда брать обложку: своя обложка → главное фото → картинка самого шаблона. Чужой «шаблон по умолчанию» не подставляем: лучше общая карточка сайта. */
export function inviteCoverSource(inv: Invitation): string {
  return inv.coverImage || inv.gallery?.hero || templateCoverSource(inv);
}

/** Цвета шаблона для карточки превью, когда у него нет растровой картинки. */
export function templateCardColors(inv: Pick<Invitation, "templateId" | "copy">): { paper: string; ink: string; accent: string } {
  const design = getCollectionDesign(inv) ?? getPinterestDesign(inv);
  return { paper: design?.paper ?? "#f6efe4", ink: design?.ink ?? "#2f3a2f", accent: design?.accent ?? "#a8793a" };
}

/** Названия торжества, которые задаёт сам шаблон, а не тип события (eventType у них общий с другим торжеством). */
const TEMPLATE_KIND: Record<string, string> = {
  "amir-falcon": "Сүннөт той",
  "corp-energy": "Энергетиктер күнү",
  "corp-police": "Милиция кызматкерлеринин күнү",
};

/** Поздравительные шаблоны: ресторана и программы нет, в превью — только праздник и дата. */
const CONGRATS = new Set(["corp-energy", "corp-police"]);

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
  const description = CONGRATS.has(inv.templateId)
    ? "Куттуктоону ачып, окуңуз 💌"
    : place
    ?`${place}. Чакырууну ачып, баарын көрүңүз 💌`
    : "Чакырууну ачып, баарын көрүңүз 💌";
  return { title, description, image: `/api/og/${encodeURIComponent(inv.id)}` };
}
