import { CUSTOM_DESIGN_WHATSAPP_NUMBER } from "./i18n";
import type { Locale } from "./types";

export const ORDER_EVENTS = [
  { id: "wedding", ru: "Свадьба", ky: "Үйлөнүү той", names: { ru: "Например: Азамат и Айпери", ky: "Мисалы: Азамат жана Айпери" } },
  { id: "kyz", ru: "Кыз узатуу", ky: "Кыз узатуу", names: { ru: "Например: Айпери", ky: "Мисалы: Айпери" } },
  { id: "tushoo", ru: "Тушоо той", ky: "Тушоо той", names: { ru: "Имя ребёнка", ky: "Баланын аты" } },
  { id: "beshik", ru: "Бешик той", ky: "Бешик той", names: { ru: "Имя ребёнка", ky: "Баланын аты" } },
  { id: "jentek", ru: "Жентек той", ky: "Жентек той", names: { ru: "Имя именинника", ky: "Той ээсинин аты" } },
  { id: "uul", ru: "Уул той", ky: "Уул той", names: { ru: "Имя сына", ky: "Уулдун аты" } },
  { id: "jubilee", ru: "Юбилей", ky: "Юбилей", names: { ru: "Имя юбиляра", ky: "Юбилярдын аты" } },
  { id: "birthday", ru: "День рождения", ky: "Туулган күн", names: { ru: "Имя именинника", ky: "Туулган күн ээсинин аты" } },
  { id: "girls", ru: "Девичник", ky: "Кыздар кечеси", names: { ru: "Имя невесты", ky: "Колукталуунун аты" } },
  { id: "corporate", ru: "Корпоратив", ky: "Корпоратив", names: { ru: "Название компании", ky: "Компаниянын аталышы" } },
  { id: "other", ru: "Другое", ky: "Башка", names: { ru: "Имена или название", ky: "Аты-жөнү же аталышы" } },
] as const;

export type OrderEventId = (typeof ORDER_EVENTS)[number]["id"];

export type OrderDraft = {
  event: OrderEventId | "";
  customEvent: string;
  date: string; // YYYY-MM-DD, как отдаёт <input type="date">
  time: string; // HH:mm
  names: string;
  place: string;
  template: string;
};

export const EMPTY_ORDER: OrderDraft = { event: "", customEvent: "", date: "", time: "", names: "", place: "", template: "" };

export type OrderErrors = Partial<Record<keyof OrderDraft, true>>;

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** `2026-12-20` → `20.12.2026`; всё остальное возвращается как есть. */
export function formatOrderDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export function validateOrder(d: OrderDraft): OrderErrors {
  const errors: OrderErrors = {};
  if (!d.event) errors.event = true;
  if (d.event === "other" && !d.customEvent.trim()) errors.customEvent = true;
  if (!d.date) errors.date = true;
  if (!TIME_RE.test(d.time)) errors.time = true;
  if (!d.names.trim()) errors.names = true;
  if (!d.place.trim()) errors.place = true;
  return errors;
}

export function eventLabel(d: OrderDraft, locale: Locale) {
  if (d.event === "other") return d.customEvent.trim() || (locale === "ru" ? "Другое" : "Башка");
  return ORDER_EVENTS.find((e) => e.id === d.event)?.[locale] ?? "";
}

/** `templateUrl` дописывается только пока в поле остался автоподставленный шаблон. */
export function buildOrderMessage(d: OrderDraft, locale: Locale, template?: { name: string; url?: string }) {
  const ru = locale === "ru";
  const keepsPrefill = Boolean(template && d.template.trim() === template.name);
  const tpl = d.template.trim();
  const tplLine = tpl
    ? keepsPrefill && template?.url ? `${tpl} — ${template.url}` : tpl
    : ru ? "Пока не выбран" : "Азырынча тандала элек";
  return [
    ru
      ? "Здравствуйте! Хочу заказать электронное приглашение через «Той Чакыруу»."
      : "Саламатсызбы! «Той Чакыруу» аркылуу электрондук чакыруу жасаткым келет.",
    "",
    `🎉 ${ru ? "Вид мероприятия" : "Тойдун аталышы"}: ${eventLabel(d, locale)}`,
    `📅 ${ru ? "Дата и время" : "Күнү жана убактысы"}: ${formatOrderDate(d.date)}, ${d.time}`,
    `👰🤵 ${ru ? "Имена" : "Той ээлеринин аты-жөнү"}: ${d.names.trim()}`,
    `📍 ${ru ? "Место проведения" : "Тойкана / локация"}: ${d.place.trim()}`,
    `🎨 ${ru ? "Выбранный шаблон" : "Тандаган шаблон"}: ${tplLine}`,
  ].join("\n");
}

export function orderWhatsAppUrl(message: string) {
  return `https://wa.me/${CUSTOM_DESIGN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
