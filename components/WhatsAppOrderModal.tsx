"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import {
  EMPTY_ORDER,
  ORDER_EVENTS,
  TIME_RE,
  buildOrderMessage,
  formatOrderDate,
  orderWhatsAppUrl,
  validateOrder,
  type OrderDraft,
  type OrderErrors,
} from "@/lib/whatsappOrder";
import type { Locale } from "@/lib/types";

const DRAFT_KEY = "chakyru-wa-order";
const QUICK_TIMES = ["12:00", "16:00", "17:00", "18:00"];

const TEXT = {
  ru: {
    title: "Заявка на приглашение",
    close: "Закрыть",
    language: "Язык формы",
    event: "Вид мероприятия",
    eventPlaceholder: "Выберите мероприятие",
    customEvent: "Название мероприятия",
    date: "Дата мероприятия",
    datePlaceholder: "Выберите дату",
    time: "Время",
    timeCustom: "Другое время",
    names: "Имена",
    place: "Место проведения",
    placePlaceholder: "Ресторан, адрес",
    template: "Выбранный шаблон",
    templatePlaceholder: "Номер или ссылка на шаблон",
    optional: "необязательно",
    send: "Отправить в WhatsApp",
    required: "Заполните это поле",
    badTime: "Укажите время, например 17:00",
  },
  ky: {
    title: "Чакыруу үчүн заявка",
    close: "Жабуу",
    language: "Форманын тили",
    event: "Тойдун аталышы",
    eventPlaceholder: "Тойдун түрүн тандаңыз",
    customEvent: "Иш-чаранын аталышы",
    date: "Тойдун күнү",
    datePlaceholder: "Күндү тандаңыз",
    time: "Убактысы",
    timeCustom: "Башка убакыт",
    names: "Той ээлеринин аты-жөнү",
    place: "Тойкана / локация",
    placePlaceholder: "Ресторан, дареги",
    template: "Тандаган шаблон",
    templatePlaceholder: "Шаблондун номери же шилтемеси",
    optional: "милдеттүү эмес",
    send: "WhatsApp аркылуу жөнөтүү",
    required: "Бул талааны толтуруңуз",
    badTime: "Убакытты жазыңыз, мисалы 17:00",
  },
} satisfies Record<Locale, Record<string, string>>;

const fieldClass = (invalid?: boolean) =>
  `block min-h-[52px] w-full rounded-2xl border bg-white px-4 text-[16px] text-ink outline-none transition-colors placeholder:text-[#b3aca5] focus:border-ink ${invalid ? "border-[#c0392b]" : "border-[#dcd7d1]"}`;

function readDraft(): OrderDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) return { ...EMPTY_ORDER, ...JSON.parse(raw) };
  } catch { /* Черновик не критичен — начинаем с пустой формы. */ }
  return EMPTY_ORDER;
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[15px] font-medium text-ink">
        {label}
        {hint ? <span className="ml-2 text-[13px] font-normal text-meta">{hint}</span> : null}
      </label>
      {children}
      {error ? <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] text-[#c0392b]">{error}</p> : null}
    </div>
  );
}

export type WhatsAppOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  templateName?: string;
  templateUrl?: string;
  initialLanguage: Locale;
};

export function WhatsAppOrderModal(props: WhatsAppOrderModalProps) {
  if (!props.isOpen) return null;
  return <OrderForm {...props} />;
}

function OrderForm({ onClose, templateId, templateName, templateUrl, initialLanguage }: WhatsAppOrderModalProps) {
  const ids = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [lang, setLang] = useState<Locale>(initialLanguage);
  const [draft, setDraft] = useState<OrderDraft>(() => {
    const saved = readDraft();
    return { ...saved, template: saved.template || templateName || (templateId ? `№${templateId}` : "") };
  });
  const [errors, setErrors] = useState<OrderErrors>({});
  const t = TEXT[lang];
  const [today] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });

  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    // Нативный модал не блокирует прокрутку страницы под собой — блокируем сами и возвращаем как было.
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevOverflow;
      node?.close();
    };
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* sessionStorage недоступен */ }
  }, [draft]);

  function update<K extends keyof OrderDraft>(key: K, value: OrderDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  const fieldId = (key: string) => `${ids}-${key}`;
  const eventMeta = ORDER_EVENTS.find((e) => e.id === draft.event);
  const prefill = templateName || (templateId ? `№${templateId}` : "");
  const template = prefill ? { name: prefill, url: templateUrl } : undefined;

  function submit() {
    const found = validateOrder(draft);
    setErrors(found);
    const first = (["event", "customEvent", "date", "time", "names", "place"] as const).find((k) => found[k]);
    if (first) {
      const target = document.getElementById(first === "time" ? fieldId("time-custom") : fieldId(first));
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.focus({ preventScroll: true });
      return;
    }
    window.open(orderWhatsAppUrl(buildOrderMessage(draft, lang, template)), "_blank", "noopener,noreferrer");
    onClose();
  }

  const timeIsQuick = QUICK_TIMES.includes(draft.time);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={fieldId("title")}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 m-auto h-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[560px] flex-col overflow-hidden rounded-3xl bg-white p-0 text-ink shadow-2xl open:flex backdrop:bg-black/50 sm:max-h-[calc(100dvh-3rem)]"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3 pt-5 sm:px-7 sm:pt-6">
        <div className="min-w-0">
          <h2 id={fieldId("title")} className="text-[20px] font-semibold leading-tight sm:text-[22px]">{t.title}</h2>
          <div role="group" aria-label={t.language} className="mt-3 inline-flex rounded-full bg-[#f1efec] p-1">
            {([["ru", "Русский"], ["ky", "Кыргызча"]] as const).map(([code, name]) => (
              <button
                key={code}
                type="button"
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
                className={`min-h-9 rounded-full px-4 text-[14px] transition-colors ${lang === code ? "bg-white font-medium text-ink shadow-sm" : "text-meta"}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t.close} className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-[#f1efec]">
          <X className="size-5" aria-hidden />
        </button>
      </header>

      <form
        noValidate
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-4 pt-2 sm:px-7">
          <Field id={fieldId("event")} label={`🎉 ${t.event}`} error={errors.event ? t.required : undefined}>
            <div className="relative">
              <select
                id={fieldId("event")}
                value={draft.event}
                aria-invalid={errors.event || undefined}
                onChange={(e) => update("event", e.target.value as OrderDraft["event"])}
                className={`${fieldClass(errors.event)} appearance-none pr-11 ${draft.event ? "" : "text-[#b3aca5]"}`}
              >
                <option value="" disabled>{t.eventPlaceholder}</option>
                {ORDER_EVENTS.map((ev) => <option key={ev.id} value={ev.id}>{ev[lang]}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-meta" aria-hidden />
            </div>
            {draft.event === "other" ? (
              <input
                id={fieldId("customEvent")}
                type="text"
                value={draft.customEvent}
                aria-label={t.customEvent}
                aria-invalid={errors.customEvent || undefined}
                placeholder={t.customEvent}
                onChange={(e) => update("customEvent", e.target.value)}
                className={`${fieldClass(errors.customEvent)} mt-2`}
              />
            ) : null}
            {errors.customEvent ? <p role="alert" className="mt-1.5 text-[13px] text-[#c0392b]">{t.required}</p> : null}
          </Field>

          <Field id={fieldId("date")} label={`📅 ${t.date}`} error={errors.date ? t.required : undefined}>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-meta" aria-hidden />
              <div className={`${fieldClass(errors.date)} flex items-center pl-12 pr-11 ${draft.date ? "" : "text-[#b3aca5]"}`} aria-hidden>
                {draft.date ? formatOrderDate(draft.date) : t.datePlaceholder}
              </div>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-meta" aria-hidden />
              {/* Прозрачный нативный календарь поверх поля: на телефоне открывается системный выбор даты. */}
              <input
                id={fieldId("date")}
                type="date"
                min={today}
                value={draft.date}
                lang={lang}
                aria-invalid={errors.date || undefined}
                aria-describedby={errors.date ? `${fieldId("date")}-error` : undefined}
                onChange={(e) => update("date", e.target.value)}
                onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch { /* showPicker недоступен */ } }}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </div>
          </Field>

          <div>
            <p id={fieldId("time-label")} className="mb-2 text-[15px] font-medium text-ink">🕒 {t.time}</p>
            <div role="radiogroup" aria-labelledby={fieldId("time-label")} className="grid grid-cols-4 gap-2">
              {QUICK_TIMES.map((time) => {
                const active = draft.time === time;
                return (
                  <button
                    key={time}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => update("time", time)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-2xl text-[15px] text-ink"
                  >
                    <span className={`flex size-5 items-center justify-center rounded-full border-2 ${active ? "border-ink" : "border-[#c9c3bc]"}`} aria-hidden>
                      {active ? <span className="size-2.5 rounded-full bg-ink" /> : null}
                    </span>
                    {time}
                  </button>
                );
              })}
            </div>
            <input
              id={fieldId("time-custom")}
              type="time"
              value={TIME_RE.test(draft.time) || draft.time === "" ? draft.time : ""}
              aria-label={t.timeCustom}
              aria-invalid={errors.time || undefined}
              aria-describedby={errors.time ? `${fieldId("time")}-error` : undefined}
              onChange={(e) => update("time", e.target.value)}
              className={`${fieldClass(errors.time)} mt-1 ${timeIsQuick ? "" : draft.time ? "" : "text-[#b3aca5]"}`}
            />
            {errors.time ? <p id={`${fieldId("time")}-error`} role="alert" className="mt-1.5 text-[13px] text-[#c0392b]">{t.badTime}</p> : null}
          </div>

          <Field id={fieldId("names")} label={`👰🤵 ${t.names}`} error={errors.names ? t.required : undefined}>
            <input
              id={fieldId("names")}
              type="text"
              value={draft.names}
              autoComplete="off"
              aria-invalid={errors.names || undefined}
              aria-describedby={errors.names ? `${fieldId("names")}-error` : undefined}
              placeholder={eventMeta ? eventMeta.names[lang] : ORDER_EVENTS[0].names[lang]}
              onChange={(e) => update("names", e.target.value)}
              className={fieldClass(errors.names)}
            />
          </Field>

          <Field id={fieldId("place")} label={`📍 ${t.place}`} error={errors.place ? t.required : undefined}>
            <input
              id={fieldId("place")}
              type="text"
              value={draft.place}
              autoComplete="off"
              aria-invalid={errors.place || undefined}
              aria-describedby={errors.place ? `${fieldId("place")}-error` : undefined}
              placeholder={t.placePlaceholder}
              onChange={(e) => update("place", e.target.value)}
              className={fieldClass(errors.place)}
            />
          </Field>

          <Field id={fieldId("template")} label={`🎨 ${t.template}`} hint={t.optional}>
            <input
              id={fieldId("template")}
              type="text"
              value={draft.template}
              autoComplete="off"
              placeholder={t.templatePlaceholder}
              onChange={(e) => update("template", e.target.value)}
              className={fieldClass()}
            />
          </Field>
        </div>

        <div className="shrink-0 border-t border-[#eeeae5] bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7">
          <button type="submit" className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-ink px-5 text-[16px] font-medium text-white transition-opacity hover:opacity-90">
            <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
              <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.46 0 .1 5.35.1 11.93c0 2.1.55 4.16 1.6 5.97L0 24l6.25-1.64a11.94 11.94 0 0 0 5.78 1.47h.01C18.62 23.83 24 18.48 24 11.9c0-3.19-1.24-6.18-3.48-8.42ZM12.04 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.46 4.44-9.9 9.91-9.9a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c0 5.45-4.45 9.87-9.93 9.87Zm5.44-7.4c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.77-1.65-2.07-.18-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.53.07-.8.37-.28.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.48 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
            </svg>
            {t.send}
          </button>
        </div>
      </form>
    </dialog>
  );
}
