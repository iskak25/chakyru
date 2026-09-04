import { formatInviteDate } from "./i18n";
import type { Invitation } from "./types";

function formatDay(date: string, locale: string) {
  return formatInviteDate(date, locale);
}

export function voiceScript(invitation: Invitation, locale: string) {
  const custom = invitation.voiceText.trim();
  if (custom) return custom;
  const names = invitation.names || "Манас жана Каныкей";
  const when = [formatDay(invitation.date, locale), invitation.time].filter(Boolean).join(", ");
  const where = [invitation.venue, invitation.city].filter(Boolean).join(", ");
  if (locale === "ru") {
    return [
      "Дорогие гости!",
      `Приглашаем вас разделить радость ${names}.`,
      when,
      where,
      invitation.message,
    ]
      .filter(Boolean)
      .join(" ");
  }
  return [
    "Урматтуу коноктор!",
    `Сиздерди ${names} тойго чакырабыз.`,
    when,
    where,
    invitation.message,
  ]
    .filter(Boolean)
    .join(" ");
}

export function speakInvite(text: string, onStart?: () => void, onEnd?: () => void) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ru-RU";
  u.rate = 0.9;
  u.onstart = () => onStart?.();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

export function stopSpeech() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}
