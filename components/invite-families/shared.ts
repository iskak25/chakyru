import { fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";

export function addHour(time: string, hours: number) {
  const [h, m] = (time || "17:00").split(":").map(Number);
  const next = ((h || 17) + hours) % 24;
  return `${String(next).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
}

export function programItems(kit: LayoutKit) {
  const ru = kit.locale === "ru";
  const t = kit.invitation.time || "17:00";
  return [
    [fieldValue(kit.invitation, "p1t", t), fieldValue(kit.invitation, "p1", ru ? "Сбор гостей" : "Коноктордун чогулушу")],
    [fieldValue(kit.invitation, "p2t", addHour(t, 1)), fieldValue(kit.invitation, "p2", ru ? "Церемония" : "Церемония")],
    [fieldValue(kit.invitation, "p3t", addHour(t, 2)), fieldValue(kit.invitation, "p3", ru ? "Банкет" : "Банкет")],
    [fieldValue(kit.invitation, "p4t", addHour(t, 5)), fieldValue(kit.invitation, "p4", ru ? "Танцы" : "Бий")],
  ] as [string, string][];
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function monthLabel(kit: LayoutKit) {
  const months =
    kit.locale === "ru"
      ? ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
      : ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
  return months[kit.event.getMonth()] ?? "";
}

export function mapsEmbedUrl(q: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed&hl=ru`;
}

export function coupleNames(invitation: { names?: string }, a: string, b: string, sep = " & ") {
  const names = invitation.names?.trim();
  return names || `${a}${sep}${b}`;
}
