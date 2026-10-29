"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { Invitation } from "@/lib/types";
import type { WeddingPartInfo } from "@/lib/weddingEditor";
import { useI18n } from "@/lib/locale";
import { uploadInvitationImage } from "@/lib/uploadImage";
import { TYPE_PAIRS, pairCss, typePairPatch } from "@/lib/typePairs";
import { photoPatch, photoSlots, supportsEventTitle, supportsField, wizardSteps, type WizardStepId } from "@/lib/wizardSteps";

// Крупные поля: 16px (iOS не зумит при фокусе), высота 56px под палец.
const inputCss =
  "h-14 w-full rounded-[14px] border border-ink/15 bg-white px-4 text-base text-ink outline-none transition focus:border-forest";
const areaCss = "min-h-32 w-full rounded-[14px] border border-ink/15 bg-white px-4 py-3 text-base leading-6 text-ink outline-none transition focus:border-forest";
const labelCss = "block text-sm font-medium text-ink";
const primaryBtn =
  "inline-flex h-14 w-full items-center justify-center rounded-[14px] bg-espresso px-5 text-sm font-medium uppercase tracking-[0.1em] text-cream transition active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";
const secondaryBtn =
  "inline-flex h-12 w-full items-center justify-center rounded-[14px] border border-ink/15 px-5 text-sm text-ink transition active:bg-black/[0.04]";

function splitNames(names: string) {
  const parts = (names || "")
    .split(/\s*[&+/]\s*|\s+менен\s+|\s+жана\s+|\s+и\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  return { groom: parts[0] || "", bride: parts.slice(1).join(" & ") || "" };
}

/**
 * Пошаговое заполнение. Необязательный экран поверх редактора: каждое изменение сразу уходит в черновик
 * через `onChange`, по завершении вызывается `onFinish` и открывается обычный редактор. Новых полей в документе нет.
 */
export function InvitationSetupWizard({
  invitation,
  parts,
  onChange,
  onFinish,
}: {
  invitation: Invitation;
  parts: WeddingPartInfo[];
  onChange: (patch: Partial<Invitation>) => void;
  onFinish: () => void;
}) {
  const { t, locale } = useI18n();
  const ru = locale === "ru";
  const s = t.setup;
  const isWedding = invitation.eventType === "wedding";
  const steps = wizardSteps(parts);
  // Шаг запоминается по id: набор шагов меняется, пока шаблон регистрирует свои части.
  const [stepId, setStepId] = useState<WizardStepId>("about");
  const index = Math.max(0, steps.indexOf(stepId));
  const current = steps[index] ?? "when";
  const last = index === steps.length - 1;

  const initialNames = splitNames(invitation.names);
  const [groom, setGroom] = useState(initialNames.groom);
  const [bride, setBride] = useState(initialNames.bride);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const slotRef = useRef<string | null>(null);

  const slots = photoSlots(parts);
  const hasName = (isWedding ? groom.trim() && bride.trim() : invitation.names.trim()).length > 0;
  const canNext = current === "about" ? !supportsField(parts, "names") || hasName : current === "when" ? invitation.date.trim().length > 0 : true;

  const go = (delta: number) => {
    const next = steps[Math.min(steps.length - 1, Math.max(0, index + delta))];
    if (next) { setError(""); setStepId(next); }
  };
  const enterNext = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement) && canNext && !last) { e.preventDefault(); go(1); }
  };
  const setNames = (g: string, b: string) => onChange({ names: g.trim() || b.trim() ? `${g.trim()} & ${b.trim()}`.replace(/ & $/, "") : "" });
  const setVenue = (value: string) => onChange({ venue: value, copy: { ...invitation.copy, venue: value } });

  async function upload(file: File, slot: string | null) {
    setError(""); setUploading(slot ?? "cover");
    try { onChange(photoPatch(invitation, parts, slot, await uploadInvitationImage(file))); }
    catch (err) { setError(err instanceof Error ? err.message : ru ? "Не удалось загрузить фотографию" : "Сүрөттү жүктөө мүмкүн болгон жок"); }
    finally { setUploading(null); }
  }

  const photoOf = (slot: string | null) => (slot && slots.length ? invitation.gallery?.[slot] : invitation.coverImage) || "";
  const optional = <span className="font-normal text-ink-soft"> ({s.optional})</span>;

  return (
    <div className="fixed inset-0 z-[200] flex items-stretch justify-center bg-black/45 sm:items-center sm:p-4" onKeyDown={enterNext}>
      <div className="flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-page sm:h-auto sm:max-h-[90vh] sm:rounded-[20px] sm:shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
        <div className="shrink-0 border-b border-ink/10 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink" aria-live="polite">
              {ru ? `Шаг ${index + 1} из ${steps.length}` : `${index + 1}-кадам / ${steps.length}`}
            </p>
            <button type="button" onClick={onFinish} className="-mr-2 flex size-11 items-center justify-center text-ink-soft" aria-label={s.close}>
              <X size={20} />
            </button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index + 1}>
            <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6">
          {current === "about" ? (
            <>
              <h2 className="font-serif text-2xl text-ink">{s.step1Title}</h2>
              {supportsEventTitle(parts) ? (
                <label className="block space-y-2">
                  <span className={labelCss}>{s.eventTitleLabel}{optional}</span>
                  <input className={inputCss} enterKeyHint="next" value={invitation.copy?.eventTitle ?? ""} placeholder={s.eventTitlePh}
                    onChange={(e) => onChange({ copy: { ...invitation.copy, eventTitle: e.target.value } })} />
                </label>
              ) : null}
              {supportsField(parts, "names") ? (isWedding ? (
                <>
                  <label className="block space-y-2">
                    <span className={labelCss}>{s.groomLabel} *</span>
                    <input className={inputCss} enterKeyHint="next" autoComplete="off" value={groom} placeholder={s.groomPh}
                      onChange={(e) => { setGroom(e.target.value); setNames(e.target.value, bride); }} />
                  </label>
                  <label className="block space-y-2">
                    <span className={labelCss}>{s.brideLabel} *</span>
                    <input className={inputCss} enterKeyHint="next" autoComplete="off" value={bride} placeholder={s.bridePh}
                      onChange={(e) => { setBride(e.target.value); setNames(groom, e.target.value); }} />
                  </label>
                </>
              ) : (
                <label className="block space-y-2">
                  <span className={labelCss}>{s.singleNameLabel[invitation.eventType]} *</span>
                  <input className={inputCss} enterKeyHint="next" autoComplete="off" value={invitation.names} placeholder={s.singleNamePh[invitation.eventType]}
                    onChange={(e) => onChange({ names: e.target.value })} />
                </label>
              )) : null}
            </>
          ) : null}

          {current === "when" ? (
            <>
              <h2 className="font-serif text-2xl text-ink">{s.step2Title}</h2>
              <label className="block space-y-2">
                <span className={labelCss}>{s.dateLabel} *</span>
                <input type="date" className={inputCss} value={invitation.date} onChange={(e) => onChange({ date: e.target.value })} />
              </label>
              <label className="block space-y-2">
                <span className={labelCss}>{s.timeLabel}{optional}</span>
                <input type="time" className={inputCss} value={invitation.time} onChange={(e) => onChange({ time: e.target.value })} />
              </label>
              <p className="rounded-[14px] border border-ink/10 bg-white px-4 py-3 text-sm leading-5 text-ink-soft">{s.hintDate}</p>
            </>
          ) : null}

          {current === "where" ? (
            <>
              <h2 className="font-serif text-2xl text-ink">{s.step3Title}</h2>
              {supportsField(parts, "venue") ? (
                <label className="block space-y-2">
                  <span className={labelCss}>{s.venueLabel}{optional}</span>
                  <input className={inputCss} enterKeyHint="next" value={invitation.venue} placeholder={s.venuePh} onChange={(e) => setVenue(e.target.value)} />
                </label>
              ) : null}
              {supportsField(parts, "city") ? (
                <label className="block space-y-2">
                  <span className={labelCss}>{s.cityLabel}{optional}</span>
                  <input className={inputCss} enterKeyHint="next" autoComplete="address-level2" value={invitation.city} placeholder={s.cityPh} onChange={(e) => onChange({ city: e.target.value })} />
                </label>
              ) : null}
              {supportsField(parts, "address") ? (
                <label className="block space-y-2">
                  <span className={labelCss}>{s.addressLabel}{optional}</span>
                  <input className={inputCss} enterKeyHint="next" autoComplete="street-address" value={invitation.address} placeholder={s.addressPh} onChange={(e) => onChange({ address: e.target.value })} />
                </label>
              ) : null}
              <label className="block space-y-2">
                <span className={labelCss}>{s.mapLabel}{optional}</span>
                <input className={inputCss} type="url" inputMode="url" enterKeyHint="done" autoCapitalize="off" value={invitation.mapUrl} placeholder={s.mapPh} onChange={(e) => onChange({ mapUrl: e.target.value })} />
              </label>
              <p className="text-sm text-ink-soft">{s.mapHint}</p>
            </>
          ) : null}

          {current === "message" ? (
            <>
              <h2 className="font-serif text-2xl text-ink">{ru ? "Текст приглашения" : "Чакыруунун тексти"}</h2>
              <label className="block space-y-2">
                <span className={labelCss}>{ru ? "Что вы хотите сказать гостям" : "Коноктор үчүн сөзүңүз"}{optional}</span>
                <textarea className={areaCss} rows={5} value={invitation.message} onChange={(e) => onChange({ message: e.target.value })}
                  placeholder={ru ? "Например: Дорогие друзья и родные, приглашаем вас разделить с нами радость этого дня." : "Мисалы: Урматтуу достор жана тууган-уруктар, бул кубанычка биз менен кошулууга чакырабыз."} />
              </label>
              <p className="text-sm text-ink-soft">{ru ? "Можно пропустить: в шаблоне уже есть готовый текст." : "Өткөрүп жибергенге болот: шаблондо даяр текст бар."}</p>
            </>
          ) : null}

          {current === "hosts" ? (
            <>
              <h2 className="font-serif text-2xl text-ink">{s.step4Title}</h2>
              <label className="block space-y-2">
                <span className={labelCss}>{s.hostsLabel}{optional}</span>
                <input className={inputCss} enterKeyHint="done" value={invitation.hosts} placeholder={s.hostsPh} onChange={(e) => onChange({ hosts: e.target.value })} />
              </label>
              <p className="text-sm leading-5 text-ink-soft">{s.hostsHint}</p>
            </>
          ) : null}

          {current === "photos" ? (
            <>
              <h2 className="font-serif text-2xl text-ink">{ru ? "Фотографии" : "Сүрөттөр"}</h2>
              <p className="text-sm text-ink-soft">{ru ? "Добавьте фото с телефона. Позже их можно будет обрезать и переставить в редакторе." : "Телефондон сүрөт кошуңуз. Кийин аны редакторго кыркып, жылдырсаңыз болот."}</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label={ru ? "Выбрать фотографию" : "Сүрөттү тандоо"}
                onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void upload(file, slotRef.current); }} />
              <div className="space-y-3">
                {(slots.length ? slots : [{ key: "", label: ru ? "Главное фото" : "Башкы сүрөт" }]).map((slot) => {
                  const key = slot.key || null;
                  const src = photoOf(key);
                  const busy = uploading === (key ?? "cover");
                  return (
                    <button key={slot.key || "cover"} type="button" disabled={uploading !== null}
                      onClick={() => { slotRef.current = key; fileRef.current?.click(); }}
                      className="flex min-h-20 w-full items-center gap-3 rounded-[14px] border border-dashed border-ink/25 bg-white p-3 text-left disabled:opacity-60">
                      {src ? <img src={src} alt="" className="size-16 shrink-0 rounded-lg object-cover" /> : <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] text-ink-soft"><ImagePlus size={22} /></span>}
                      <span className="min-w-0 text-sm text-ink">
                        <span className="block truncate font-medium">{slot.label}</span>
                        <span className="block text-ink-soft">{busy ? (ru ? "Загрузка…" : "Жүктөлүүдө…") : src ? (ru ? "Нажмите, чтобы заменить" : "Алмаштыруу үчүн басыңыз") : (ru ? "Нажмите, чтобы выбрать фото" : "Сүрөттү тандоо үчүн басыңыз")}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
            </>
          ) : null}

          {current === "design" ? (
            <>
              <h2 className="font-serif text-2xl text-ink">{ru ? "Оформление" : "Жасалгалоо"}</h2>
              <p className="text-sm text-ink-soft">{ru ? "Выберите сочетание шрифтов. Тексты и данные не изменятся, шрифты можно поменять позже." : "Арип айкалышын тандаңыз. Тексттер өзгөрбөйт, арипти кийин алмаштырсаңыз болот."}</p>
              <div className="grid grid-cols-2 gap-3">
                {TYPE_PAIRS.map((pair) => {
                  const css = pairCss(pair);
                  return (
                    <button key={pair.id} type="button" onClick={() => onChange(typePairPatch(invitation, parts, pair))}
                      className="min-h-20 rounded-[14px] border border-ink/15 bg-white px-3 py-2 text-left text-ink active:bg-black/[0.04]">
                      <span className="block truncate text-lg leading-tight" style={{ fontFamily: css.heading }}>{ru ? pair.ru : pair.ky}</span>
                      <span className="block truncate text-xs" style={{ fontFamily: css.body }}>{ru ? "Приглашаем вас" : "Чакырабыз"}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-ink/10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <button type="button" className={primaryBtn} disabled={!canNext} onClick={() => (last ? onFinish() : go(1))}>
            {last ? (ru ? "Открыть редактор" : "Редакторду ачуу") : s.next}
          </button>
          <div className="flex gap-2">
            {index > 0 ? <button type="button" className={secondaryBtn} onClick={() => go(-1)}>{s.back}</button> : null}
            {!last && current !== "about" && current !== "when" ? <button type="button" className={secondaryBtn} onClick={() => go(1)}>{ru ? "Пропустить" : "Өткөрүп жиберүү"}</button> : null}
            {index === 0 ? <button type="button" className={secondaryBtn} onClick={onFinish}>{s.skip}</button> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
