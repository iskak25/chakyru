"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Invitation } from "@/lib/types";
import { useI18n } from "@/lib/locale";

const STEPS = [1, 2, 3, 4, 5] as const;

const inputCss =
  "w-full rounded-[12px] border border-ink/15 bg-transparent px-4 py-3 text-sm text-ink outline-none transition focus:border-forest";
const labelCss = "block text-xs font-medium uppercase tracking-[0.08em] text-ink-soft";
const primaryBtn =
  "inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-espresso px-5 text-[11px] uppercase tracking-[0.14em] text-cream transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
const secondaryBtn =
  "inline-flex h-11 w-full items-center justify-center rounded-[12px] border border-ink/15 px-5 text-[11px] uppercase tracking-[0.14em] text-ink transition hover:bg-black/[0.03]";

function splitNames(names: string) {
  const parts = (names || "")
    .split(/\s*[&+/]\s*|\s+менен\s+|\s+жана\s+|\s+и\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  return { groom: parts[0] || "", bride: parts.slice(1).join(" & ") || "" };
}

export function InvitationSetupWizard({
  invitation,
  onComplete,
  onSkip,
}: {
  invitation: Invitation;
  onComplete: (patch: Partial<Invitation>) => void;
  onSkip: () => void;
}) {
  const { t } = useI18n();
  const s = t.setup;
  const [step, setStep] = useState<(typeof STEPS)[number]>(1);
  const [eventTitle, setEventTitle] = useState(invitation.copy?.eventTitle ?? "");
  const initialNames = splitNames(invitation.names);
  const [groom, setGroom] = useState(initialNames.groom);
  const [bride, setBride] = useState(initialNames.bride);
  const [date, setDate] = useState(invitation.date || "");
  const [time, setTime] = useState(invitation.time || "");
  const [city, setCity] = useState(invitation.city || "");
  const [address, setAddress] = useState(invitation.address || "");
  const [mapUrl, setMapUrl] = useState(invitation.mapUrl || "");
  const [hosts, setHosts] = useState(invitation.hosts || "");

  const canNext1 = groom.trim().length > 0 && bride.trim().length > 0;
  const canNext2 = date.trim().length > 0 && time.trim().length > 0;
  const canNext3 = city.trim().length > 0 && address.trim().length > 0;
  const canNext4 = hosts.trim().length > 0;
  const canFinish = canNext1 && canNext2 && canNext3 && canNext4;

  function finish() {
    if (!canFinish) return;
    onComplete({
      names: `${groom.trim()} & ${bride.trim()}`,
      date,
      time,
      city: city.trim(),
      address: address.trim(),
      mapUrl: mapUrl.trim(),
      hosts: hosts.trim(),
      copy: { ...invitation.copy, eventTitle: eventTitle.trim() },
    });
  }

  const previewGreeting = [
    hosts.trim() || s.hostsPh,
    `${groom.trim() || s.groomPh} & ${bride.trim() || s.bridePh}`,
    [city.trim(), address.trim()].filter(Boolean).join(", "),
    [date, time].filter(Boolean).join(" · "),
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[20px] bg-page shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
        <div className="flex shrink-0 items-center gap-2 border-b border-ink/10 px-6 py-5">
          {STEPS.map((n, i) => (
            <div key={n} className="flex flex-1 items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  n < step
                    ? "bg-forest text-cream"
                    : n === step
                      ? "bg-forest text-cream"
                      : "border border-ink/20 text-ink-soft"
                }`}
              >
                {n < step ? "✓" : n}
              </span>
              {i < STEPS.length - 1 ? (
                <span className={`mx-1 h-px flex-1 ${n < step ? "bg-forest" : "bg-ink/15"}`} />
              ) : null}
            </div>
          ))}
          <button type="button" onClick={onSkip} className="ml-2 shrink-0 text-ink-soft transition hover:text-ink" aria-label={s.close}>
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {step === 1 ? (
            <div className="space-y-5">
              <h2 className="font-serif text-xl uppercase text-ink">{s.step1Title}</h2>
              <label className="block space-y-1.5">
                <span className={labelCss}>{s.eventTitleLabel}</span>
                <input className={inputCss} value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder={s.eventTitlePh} />
              </label>
              <label className="block space-y-1.5">
                <span className={labelCss}>{s.groomLabel} *</span>
                <input className={inputCss} value={groom} onChange={(e) => setGroom(e.target.value)} placeholder={s.groomPh} />
              </label>
              <label className="block space-y-1.5">
                <span className={labelCss}>{s.brideLabel} *</span>
                <input className={inputCss} value={bride} onChange={(e) => setBride(e.target.value)} placeholder={s.bridePh} />
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <h2 className="font-serif text-xl uppercase text-ink">{s.step2Title}</h2>
              <label className="block space-y-1.5">
                <span className={labelCss}>{s.dateLabel} *</span>
                <input type="date" className={inputCss} value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="block space-y-1.5">
                <span className={labelCss}>{s.timeLabel} *</span>
                <input type="time" className={inputCss} value={time} onChange={(e) => setTime(e.target.value)} placeholder={s.timePh} />
              </label>
              <div className="rounded-[14px] border border-ink/10 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink">{s.hintTitle}</p>
                <p className="mt-1 text-xs leading-5 text-ink-soft">{s.hintDate}</p>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <h2 className="font-serif text-xl uppercase text-ink">{s.step3Title}</h2>
              <label className="block space-y-1.5">
                <span className={labelCss}>{s.cityLabel} *</span>
                <input className={inputCss} value={city} onChange={(e) => setCity(e.target.value)} placeholder={s.cityPh} />
              </label>
              <label className="block space-y-1.5">
                <span className={labelCss}>{s.addressLabel} *</span>
                <input className={inputCss} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={s.addressPh} />
              </label>
              <label className="block space-y-1.5">
                <span className={labelCss}>
                  {s.mapLabel} <span className="normal-case text-ink-soft">({s.optional})</span>
                </span>
                <input className={inputCss} value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder={s.mapPh} />
              </label>
              <p className="text-xs text-ink-soft">{s.mapHint}</p>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <h2 className="font-serif text-xl uppercase text-ink">{s.step4Title}</h2>
              <label className="block space-y-1.5">
                <span className={labelCss}>{s.hostsLabel} *</span>
                <input className={inputCss} value={hosts} onChange={(e) => setHosts(e.target.value)} placeholder={s.hostsPh} />
              </label>
              <p className="text-xs leading-5 text-ink-soft">{s.hostsHint}</p>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-5">
              <h2 className="font-serif text-xl uppercase text-ink">{s.step5Title}</h2>
              <p className="text-xs leading-5 text-ink-soft">{s.previewHint}</p>
              <div className="space-y-2 rounded-[14px] border border-ink/10 bg-white px-4 py-4">
                {eventTitle.trim() ? <p className="text-sm font-medium text-ink">{eventTitle.trim()}</p> : null}
                {previewGreeting.map((line) => (
                  <p key={line} className="text-sm leading-6 text-ink-soft">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-ink/10 px-6 py-5">
          {step < 5 ? (
            <button
              type="button"
              className={primaryBtn}
              disabled={step === 1 ? !canNext1 : step === 2 ? !canNext2 : step === 3 ? !canNext3 : !canNext4}
              onClick={() => setStep((n) => (Math.min(5, n + 1) as (typeof STEPS)[number]))}
            >
              {s.next}
            </button>
          ) : (
            <button type="button" className={primaryBtn} disabled={!canFinish} onClick={finish}>
              {s.create}
            </button>
          )}
          {step > 1 ? (
            <button type="button" className={secondaryBtn} onClick={() => setStep((n) => (Math.max(1, n - 1) as (typeof STEPS)[number]))}>
              {s.back}
            </button>
          ) : (
            <button type="button" className={secondaryBtn} onClick={onSkip}>
              {s.skip}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
