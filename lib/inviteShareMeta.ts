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

/** Заголовок, описание и картинка для превью ссылки (WhatsApp, Telegram, Facebook). */
export function inviteShareMeta(inv: Invitation): { title: string; description: string; image: string } {
  const events = getDict("ky").events as Record<string, string>;
  const kind = events[inv.eventType] || "Той";
  const date = shortInviteDate(inv.date);
  const title = date ? `${kind} — ${date}` : kind;
  const place = [inv.venue, inv.city].map((x) => x?.trim()).filter(Boolean).join(", ");
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
