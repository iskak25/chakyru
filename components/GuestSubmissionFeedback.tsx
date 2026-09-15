"use client";

import { useEffect, useState } from "react";
import { GUEST_FEEDBACK_EVENT, type GuestFeedbackKind } from "@/lib/guestSubmission";
import { useI18n } from "@/lib/locale";
import { AppDialog } from "./AppDialog";

export function GuestSubmissionFeedback() {
  const { locale } = useI18n();
  const ru = locale === "ru";
  const [kind, setKind] = useState<GuestFeedbackKind | null>(null);
  useEffect(() => {
    const show = (event: Event) => setKind((event as CustomEvent<GuestFeedbackKind>).detail);
    window.addEventListener(GUEST_FEEDBACK_EVENT, show);
    return () => window.removeEventListener(GUEST_FEEDBACK_EVENT, show);
  }, []);
  if (!kind) return null;
  const messages = {
    rsvp: ["Ваш ответ отправлен хозяевам праздника.", "Жообуңуз той ээлерине жөнөтүлдү."],
    wish: ["Ваше пожелание отправлено хозяевам праздника.", "Каалооңуз той ээлерине жөнөтүлдү."],
    both: ["Ваш ответ и пожелание отправлены хозяевам праздника.", "Жообуңуз жана каалооңуз той ээлерине жөнөтүлдү."],
    error: ["Не удалось отправить. Проверьте соединение и попробуйте ещё раз. Заполненные поля сохранены в форме.", "Жөнөтүлгөн жок. Байланышты текшерип, кайра аракет кылыңыз. Толтурулган маалыматтар формада калды."],
    preview: ["Это предпросмотр. Ответы и пожелания не отправляются.", "Бул алдын ала көрүү. Жооптор жана каалоолор жөнөтүлбөйт."],
  };
  return <AppDialog title={kind === "error" ? (ru ? "Не отправлено" : "Жөнөтүлгөн жок") : kind === "preview" ? (ru ? "Предпросмотр" : "Алдын ала көрүү") : (ru ? "Спасибо!" : "Рахмат!")} onClose={() => setKind(null)}>
    <p role="status" className="my-6 text-base leading-7">{messages[kind][ru ? 0 : 1]}</p>
    <button type="button" onClick={() => setKind(null)} className="w-full rounded-xl bg-[#302a25] p-3 text-white">{ru ? "Понятно" : "Түшүнүктүү"}</button>
  </AppDialog>;
}
