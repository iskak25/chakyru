"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { addRsvp } from "@/lib/store";
import { Field, SlotPhoto, fieldValue } from "./SiteEdit";
import {
  AddressBlock,
  CountdownBlock,
  FooterBlock,
  MessageBlock,
  MonthCalendar,
  Names,
  RsvpBlock,
  WishesBlock,
  type LayoutKit,
} from "./Site3DLayouts";

const OLIVE = "#4b533c";
const CREAM = "#fdfcf8";
const GOLD = "#c5a059";
const CHAR = "#333333";

function addHour(time: string, hours: number) {
  const [h, m] = (time || "17:00").split(":").map(Number);
  const next = ((h || 17) + hours) % 24;
  return `${String(next).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
}

function program(kit: LayoutKit) {
  const ru = kit.locale === "ru";
  const t = kit.invitation.time || "17:00";
  return [
    [t, ru ? "Сбор гостей" : "Коноктордун чогулушу"],
    [addHour(t, 1), ru ? "Церемония" : "Церемония"],
    [addHour(t, 2), ru ? "Банкет" : "Банкет"],
    [addHour(t, 5), ru ? "Окончание" : "Аяктоо"],
  ] as const;
}

function dateParts(event: Date) {
  const d = String(event.getDate()).padStart(2, "0");
  const m = String(event.getMonth() + 1).padStart(2, "0");
  const y = String(event.getFullYear()).slice(-2);
  return { d, m, y, full: `${d} / ${m} / ${y}` };
}

function SilkWave({ fill, flip }: { fill: string; flip?: boolean }) {
  return (
    <svg className={`silk-wave block w-full ${flip ? "rotate-180" : ""}`} viewBox="0 0 375 72" preserveAspectRatio="none" aria-hidden>
      <path d="M0 28C48 62 96 4 156 32C214 58 268 8 375 40V72H0Z" fill={fill} />
    </svg>
  );
}

function Chandelier() {
  return (
    <svg className="mx-auto" width="72" height="56" viewBox="0 0 72 56" fill="none" aria-hidden>
      <path d="M36 4v10M20 18h32M24 18c0 8-8 12-8 18M36 18c0 10 0 16 0 22M48 18c0 8 8 12 8 18" stroke={GOLD} strokeWidth="1.2" />
      <circle cx="16" cy="38" r="3" fill={GOLD} />
      <circle cx="36" cy="42" r="3" fill={GOLD} />
      <circle cx="56" cy="38" r="3" fill={GOLD} />
      <path d="M28 14h16" stroke={GOLD} strokeWidth="1.2" />
    </svg>
  );
}

function MapMark() {
  return (
    <svg className="mx-auto opacity-70" width="220" height="110" viewBox="0 0 220 110" fill="none" aria-hidden>
      <path d="M18 72c22-28 48-40 78-28 22 8 36-10 58-18 20-8 42 2 58 18" stroke="currentColor" strokeWidth="1.2" />
      <path d="M30 86c28-18 52-8 80 2 26 10 52-8 80-6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="118" cy="48" r="7" fill="currentColor" />
      <path d="M118 41v-10" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function MapBtn({ kit, className }: { kit: LayoutKit; className?: string }) {
  return (
    <a
      href={kit.mapHref}
      target="_blank"
      rel="noopener noreferrer"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        window.open(kit.mapHref, "_blank", "noopener,noreferrer");
      }}
      className={className}
    >
      <Field invitation={kit.invitation} onChange={kit.onChange} id="map" fallback={kit.labels.map} className="bg-transparent text-inherit" />
      <ExternalLink size={14} />
    </a>
  );
}

function PhonePill({ kit }: { kit: LayoutKit }) {
  const phone = fieldValue(kit.invitation, "phone", "+996 700 000 000");
  const href = `tel:${phone.replace(/[^\d+]/g, "")}`;
  return (
    <a
      href={href}
      onPointerDown={(e) => e.stopPropagation()}
      className="mx-auto mt-6 flex h-12 max-w-[280px] items-center justify-center rounded-full bg-white px-8 text-[13px] tracking-[0.08em] text-[#2c2a24] shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
    >
      <Field invitation={kit.invitation} onChange={kit.onChange} id="phone" fallback={phone} className="bg-transparent text-inherit" />
    </a>
  );
}

const TIMELINE_ICONS = [
  "/stickers/wedding-glasses.png",
  "/stickers/wedding-rings-gold.png",
  "/stickers/wedding-couple.png",
  "/stickers/wedding-cake.png",
];

export function LayoutOliveWave({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, photos, heroPhoto, venuePhoto, event, locale } = kit;
  return (
    <div className="bg-[#fdfcf8] text-[#2c2a24]">
      <section className="relative">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[520px] w-full" imgClass="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#4b533c]" />
        <div className="absolute inset-x-0 bottom-16 px-8 text-center text-white">
          <Field invitation={invitation} onChange={onChange} id="saveTheDate" fallback={labels.saveTheDate} className="font-script text-[42px] leading-none" />
          <Names kit={kit} className="mt-3 flex flex-wrap items-end justify-center gap-2 text-[15px] uppercase tracking-[0.22em]" />
        </div>
      </section>

      <section className="relative bg-[#4b533c] px-10 pb-4 pt-10 text-center text-[#fdfcf8]">
        <Chandelier />
        <Field invitation={invitation} onChange={onChange} id="dearGuests" fallback={labels.dearGuests} className="font-script mt-6 text-[40px] leading-none" />
        <MessageBlock kit={kit} className="mt-5 text-[14px] leading-8 tracking-[0.04em] text-[#fdfcf8]" />
        <Field invitation={invitation} onChange={onChange} id="phoneCta" fallback={labels.phoneCta} className="mt-8 text-[11px] uppercase tracking-[0.2em] text-white/70" />
        <PhonePill kit={kit} />
        <img src="/stickers/flora-eucalyptus.png" alt="" className="pointer-events-none mx-auto mt-8 h-16 w-28 object-contain opacity-80" />
      </section>
      <SilkWave fill={CREAM} />

      <section className="relative px-10 py-12 text-center">
        <img src="/stickers/flora-rose.png" alt="" className="pointer-events-none mx-auto mb-4 h-14 w-14 object-contain opacity-80" />
        <Field invitation={invitation} onChange={onChange} id="details" fallback={labels.details} className="font-script text-[44px] leading-none" />
        <Field invitation={invitation} onChange={onChange} id="gifts" fallback={labels.gifts} className="mt-5 text-[14px] leading-7 tracking-[0.04em]" />
        <div className="mt-8 overflow-hidden">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="venue" src={venuePhoto} className="h-[200px] w-full" imgClass="h-full w-full object-cover" />
        </div>
      </section>

      <SilkWave fill={OLIVE} flip />
      <section className="bg-[#4b533c] px-4 pb-6 pt-2 text-[#fdfcf8]">
        <MonthCalendar
          event={event}
          locale={locale}
          time={invitation.time}
          startsLabel={labels.hourWord}
          onChange={onChange}
          dateValue={invitation.date}
          timeValue={invitation.time}
          shown
          instant
          tone="dark"
        />
      </section>
      <SilkWave fill={CREAM} />

      <section className="grid grid-cols-3 gap-1 px-4 py-6">
        {photos.map((src, i) => (
          <SlotPhoto key={src} invitation={invitation} onChange={onChange} slot={`c${i}`} src={src} className="aspect-[3/4]" imgClass="h-full w-full object-cover" />
        ))}
      </section>
      <div id="rsvp">
        <RsvpBlock kit={kit} soft />
      </div>
      <WishesBlock kit={kit} script />
      <FooterBlock kit={kit} withLove />
    </div>
  );
}

export function LayoutMonoInk({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, photos, heroPhoto, venuePhoto, event, locale, a, b } = kit;
  const { d, m, y } = dateParts(event);
  const swatches = ["#ffffff", "#111111"];
  return (
    <div className="invite-mono bg-white text-[#161616]">
      <section className="relative">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[560px] w-full" imgClass="h-full w-full object-cover grayscale" />
        <div className="absolute inset-x-0 top-10 px-5 text-center">
          <Names kit={kit} className="flex flex-wrap items-end justify-center gap-2 font-serif text-[22px] uppercase tracking-[0.18em] text-white" />
        </div>
        <div className="absolute bottom-8 right-4 font-serif text-[28px] leading-[1.05] text-white">
          <p>{d}</p>
          <p className="opacity-70">/</p>
          <p>{m}</p>
          <p className="opacity-70">/</p>
          <p>{y}</p>
        </div>
      </section>

      <section className="px-10 py-12 text-center">
        <Field invitation={invitation} onChange={onChange} id="friends" fallback={labels.friends} className="font-serif text-[28px] uppercase tracking-[0.16em]" />
        <MessageBlock kit={kit} className="mt-5 text-[14px] leading-7 tracking-[0.03em]" />
      </section>

      <section className="px-10 pb-10">
        <div className="invite-blob mx-auto max-w-[280px] overflow-hidden">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="aspect-square" imgClass="h-full w-full object-cover grayscale" />
        </div>
      </section>

      <section className="px-6 pb-10 text-center">
        <Field invitation={invitation} onChange={onChange} id="dateOfEvent" fallback={labels.dateOfEvent} className="text-[11px] uppercase tracking-[0.2em]" />
        <div className="mx-auto mt-5 max-w-[320px] bg-[#2a2a2a] text-white">
          <MonthCalendar
            event={event}
            locale={locale}
            time={invitation.time}
            startsLabel={labels.hourWord}
            onChange={onChange}
            dateValue={invitation.date}
            timeValue={invitation.time}
            shown
            instant
            tone="dark"
          />
        </div>
      </section>

      <section className="px-10 py-8 text-center">
        <Field invitation={invitation} onChange={onChange} id="dressCode" fallback={labels.dressCode} className="font-serif text-[22px] uppercase tracking-[0.16em]" />
        <div className="mt-5 flex justify-center gap-3">
          {swatches.map((c) => (
            <span key={c} className="h-9 w-9 border border-black/30" style={{ background: c }} />
          ))}
        </div>
        <div className="relative mx-auto mt-6 max-w-[280px] overflow-hidden">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c1" src={photos[1]} className="aspect-[4/5]" imgClass="h-full w-full object-cover grayscale" />
        </div>
        <Field invitation={invitation} onChange={onChange} id="dressHint" fallback={invitation.dressCode || labels.dressHint} className="mt-4 text-[13px] leading-6 opacity-70" />
      </section>

      <section className="relative px-8 py-10">
        <div className="invite-blob-alt pointer-events-none absolute inset-x-8 top-8 overflow-hidden opacity-35">
          <img src={venuePhoto} alt="" className="h-[320px] w-full object-cover grayscale" />
        </div>
        <Field invitation={invitation} onChange={onChange} id="program" fallback={labels.program} className="relative font-serif text-[22px] uppercase tracking-[0.14em]" />
        <div className="relative mx-auto mt-8 max-w-[280px] space-y-6">
          {program(kit).map(([time, title], i) => (
            <div key={title} className="grid grid-cols-[40px_1fr] items-center gap-4">
              <img src={TIMELINE_ICONS[i] ?? TIMELINE_ICONS[0]} alt="" className="h-8 w-8 object-contain" />
              <div>
                <p className="font-serif text-[18px]">{time}</p>
                <p className="text-[13px] opacity-70">{title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-8 text-center">
        <Field invitation={invitation} onChange={onChange} id="location" fallback={labels.location} className="font-serif text-[20px] uppercase tracking-[0.12em]" />
        <div className="mt-5 overflow-hidden">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="venue" src={venuePhoto} className="h-[200px] w-full" imgClass="h-full w-full object-cover grayscale" />
        </div>
        <p className="mt-4 font-serif text-[16px]">{invitation.venue || "—"}</p>
        <p className="mt-1 text-[13px] opacity-60">{[invitation.address, invitation.city].filter(Boolean).join(", ")}</p>
        <MapBtn kit={kit} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-black px-8 text-[11px] uppercase tracking-[0.16em] text-white" />
      </section>

      <div className="mx-6 my-6 border border-black/20">
        <div id="rsvp">
          <RsvpBlock kit={kit} soft />
        </div>
      </div>

      <section className="px-8 pb-6">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c2" src={photos[2]} className="aspect-[3/4] overflow-hidden rounded-[28px]" imgClass="h-full w-full object-cover grayscale" />
        <p className="font-script mt-6 text-center text-[42px] leading-none">{labels.withLove}</p>
        <Field invitation={invitation} onChange={onChange} id="seeYou" fallback={labels.seeYou} className="mt-2 text-center font-serif text-[20px] uppercase tracking-[0.16em]" />
        <p className="mt-2 text-center text-[13px] opacity-50">{a} & {b}</p>
      </section>
      <WishesBlock kit={kit} />
    </div>
  );
}

export function LayoutRoundedMono({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, photos, heroPhoto, venuePhoto, a, b } = kit;
  const bars = ["#e8dfd2", "#e3cfc4", "#9aa890", "#5a3d2e"];
  const initials = `${a[0] ?? ""}${b[0] ?? ""}`.toUpperCase();
  return (
    <div className="invite-mono bg-white text-[#1a1a1a]">
      <section className="px-4 pt-4">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[420px] w-full overflow-hidden rounded-t-[40px]" imgClass="h-full w-full object-cover grayscale" />
        <div className="relative -mt-10 px-4 text-center">
          <p className="font-serif text-[72px] leading-none tracking-tight">{initials}</p>
          <Names kit={kit} className="font-script -mt-3 flex flex-wrap items-end justify-center gap-2 text-[34px] leading-none" />
        </div>
      </section>

      <section className="px-10 py-10 text-center">
        <Field invitation={invitation} onChange={onChange} id="dearGuests" fallback={labels.dearGuests} className="font-serif text-[22px] uppercase tracking-[0.14em]" />
        <MessageBlock kit={kit} className="mt-5 text-[14px] leading-7 tracking-[0.04em]" />
      </section>

      <section className="relative px-5 py-6">
        <p className="font-script absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[22px] opacity-50">Love story</p>
        <div className="ml-10 overflow-hidden rounded-[36px_12px_36px_12px]">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="aspect-[4/5]" imgClass="h-full w-full object-cover grayscale" />
        </div>
      </section>

      <CountdownBlock kit={kit} title={labels.untilWedding} />

      <section className="px-10 py-8">
        <Field invitation={invitation} onChange={onChange} id="program" fallback={labels.program} className="text-center font-serif text-[20px] uppercase tracking-[0.16em]" />
        <div className="mt-8 space-y-5">
          {program(kit).map(([time, title]) => (
            <div key={title} className="flex items-center gap-4 text-[14px]">
              <span className="w-14 font-serif text-[18px]">{time}</span>
              <span className="h-px flex-1 bg-black/20" />
              <span className="flex-1 tracking-[0.04em]">{title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-[1fr_140px] items-stretch gap-4 px-5 py-8">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c1" src={photos[1] || venuePhoto} className="min-h-[240px] overflow-hidden rounded-[28px]" imgClass="h-full w-full object-cover grayscale" />
        <div className="flex flex-col justify-center gap-2">
          <Field invitation={invitation} onChange={onChange} id="dressCode" fallback={labels.dressCode} className="font-serif text-[13px] uppercase tracking-[0.12em]" />
          {bars.map((c) => (
            <span key={c} className="h-10 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </section>
      <p className="px-10 pb-6 text-center text-[13px] leading-6 opacity-70">{invitation.dressCode || labels.dressHint}</p>

      <section className="px-8 py-6 text-center">
        <AddressBlock kit={kit} />
      </section>

      <div id="rsvp">
        <RsvpBlock kit={kit} soft />
      </div>
      <section className="px-8 pb-16 pt-4 text-center">
        <Field invitation={invitation} onChange={onChange} id="seeYou" fallback={labels.seeYou} className="font-script text-[40px] leading-none" />
      </section>
      <WishesBlock kit={kit} hideIcon />
    </div>
  );
}

function SoftRsvp({ kit }: { kit: LayoutKit }) {
  const { variant, onChange, labels, invitation, rsvp, setRsvp, rsvpName, setRsvpName, rsvpDone, setRsvpDone, onReload, locale } = kit;
  const ru = locale === "ru";
  const [drinks, setDrinks] = useState<string[]>([]);
  const options = ru
    ? [
        ["wine", "Вино"],
        ["champagne", "Шампанское"],
        ["soft", "Безалкогольное"],
      ]
    : [
        ["wine", "Шарап"],
        ["champagne", "Шампанское"],
        ["soft", "Алкохолсуз"],
      ];
  const yes = fieldValue(invitation, "rsvpYes", labels.rsvpYes);
  const no = fieldValue(invitation, "rsvpNo", labels.rsvpNo);
  if (variant !== "guest" && !onChange) return null;

  return (
    <section className="mx-5 my-8 rounded-[36px] bg-[#333] px-7 py-10 text-center text-white">
      <Field invitation={invitation} onChange={onChange} id="rsvpTitle" fallback="RSVP" className="font-serif text-[42px] italic leading-none" />
      {variant === "guest" ? (
        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rsvpName.trim()) return;
            addRsvp(invitation.id, rsvpName.trim(), rsvp, rsvp === "maybe" ? 1 : 0);
            setRsvpDone(true);
            onReload?.();
          }}
        >
          <input
            required
            value={rsvpName}
            onChange={(e) => setRsvpName(e.target.value)}
            placeholder={labels.yourName}
            className="h-11 w-full border-0 border-b border-white/40 bg-transparent text-center text-sm outline-none placeholder:text-white/40"
          />
          <div className="space-y-3 text-left text-[14px]">
            {(
              [
                ["yes", yes],
                ["no", no],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <input type="radio" name="rsvp" checked={rsvp === key} onChange={() => setRsvp(key)} className="accent-white" />
                {label}
              </label>
            ))}
          </div>
          <div className="space-y-2 text-left text-[13px] text-white/80">
            {options.map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={drinks.includes(key)}
                  onChange={() => setDrinks((cur) => (cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key]))}
                  className="accent-white"
                />
                {label}
              </label>
            ))}
          </div>
          <button type="submit" className="h-12 w-full rounded-full bg-white text-[12px] font-semibold uppercase tracking-[0.16em] text-[#333]">
            {labels.rsvpSend}
          </button>
          {rsvpDone ? <p className="text-sm text-white/70">{labels.rsvpThanks}</p> : null}
        </form>
      ) : (
        <div className="mt-8 space-y-4">
          <Field invitation={invitation} onChange={onChange} id="yourName" fallback={labels.yourName} className="border-b border-white/40 pb-2 text-sm" />
          <Field invitation={invitation} onChange={onChange} id="rsvpYes" fallback={labels.rsvpYes} className="text-left text-[14px]" />
          <Field invitation={invitation} onChange={onChange} id="rsvpNo" fallback={labels.rsvpNo} className="text-left text-[14px]" />
          <div className="rounded-full bg-white py-3 text-[#333]">
            <Field invitation={invitation} onChange={onChange} id="rsvpSend" fallback={labels.rsvpSend} className="text-[12px] uppercase tracking-[0.16em] text-[#333]" />
          </div>
        </div>
      )}
    </section>
  );
}

export function LayoutSoftInvite({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, photos, heroPhoto, venuePhoto, event, locale, a, b } = kit;
  const ru = locale === "ru";
  const monthLabel = event.toLocaleDateString(ru ? "ru-RU" : "ky-KG", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
  const swatches = ["#f3ead2", "#e8d48a", "#8a8b68", "#c4b496", "#4a3728"];
  const initial = (a[0] ?? "D").toUpperCase();
  return (
    <div className="bg-[#f2f2f2] text-[#2c2a24]">
      <section className="relative">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[520px] w-full" imgClass="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50" />
        <div className="absolute inset-x-0 bottom-14 px-8 text-center text-white">
          <p className="text-[12px] uppercase tracking-[0.22em]">{monthLabel}</p>
          <Names kit={kit} className="font-script mt-2 flex flex-wrap items-end justify-center gap-2 text-[42px] leading-none" />
        </div>
      </section>

      <section className="invite-wave-line px-10 py-12 text-center">
        <Field invitation={invitation} onChange={onChange} id="dearGuests" fallback={labels.dearGuests} className="font-serif text-[26px] uppercase tracking-[0.1em]" />
        <MessageBlock kit={kit} className="mt-5 text-[14px] leading-7 tracking-[0.04em]" />
      </section>

      <section className="px-6 py-6 text-center">
        <div className="invite-cal-circle mx-auto flex aspect-square w-[280px] items-center overflow-hidden rounded-full bg-[#333] text-white">
          <MonthCalendar
            event={event}
            locale={locale}
            time={invitation.time}
            startsLabel={labels.hourWord}
            onChange={onChange}
            dateValue={invitation.date}
            timeValue={invitation.time}
            shown
            instant
            tone="dark"
          />
        </div>
        <p className="font-script mt-6 text-[28px] leading-none">{a} & {b}</p>
      </section>

      <section className="px-10 py-10">
        <Field invitation={invitation} onChange={onChange} id="program" fallback={labels.program} className="text-center font-serif text-[22px] uppercase tracking-[0.14em]" />
        <div className="relative mx-auto mt-8 max-w-[300px]">
          <span className="invite-curve-line pointer-events-none absolute left-[58px] top-3 bottom-3 w-px" />
          {program(kit).map(([time, title], i) => (
            <div key={title} className={`mb-8 grid grid-cols-[52px_1fr] items-start gap-5 ${i % 2 ? "pt-2" : ""}`}>
              <span className="font-serif text-[18px]">{time}</span>
              <span className="pt-1 text-[14px] leading-6">{title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-8 text-center">
        <Field invitation={invitation} onChange={onChange} id="location" fallback={labels.location} className="font-serif text-[22px] uppercase tracking-[0.14em]" />
        <div className="mt-6 text-[#8a8680]">
          <MapMark />
        </div>
        <p className="mt-4 font-serif text-[16px]">{invitation.venue || "—"}</p>
        <p className="mt-1 text-[13px] opacity-60">{[invitation.address, invitation.city].filter(Boolean).join(", ")}</p>
        <MapBtn kit={kit} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#333] px-7 text-[11px] uppercase tracking-[0.14em] text-white" />
      </section>

      <section className="mx-5 rounded-[8px] bg-[#333] px-7 py-10 text-center text-white">
        <Field invitation={invitation} onChange={onChange} id="dressCode" fallback={labels.dressCode} className="font-serif text-[22px] uppercase tracking-[0.16em]" />
        <p className="mt-4 text-[13px] leading-6 text-white/70">{invitation.dressCode || labels.dressHint}</p>
        <div className="mt-6 flex justify-center gap-3">
          {swatches.map((c) => (
            <span key={c} className="h-9 w-9 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </section>

      <section className="relative px-8 py-14 text-center">
        <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c2" src={photos[2] || venuePhoto} className="h-16 w-16" imgClass="h-full w-full object-cover" />
        </div>
        <p className="pointer-events-none absolute inset-x-0 top-16 font-serif text-[140px] leading-none text-black/[0.06]">{initial}</p>
        <Field invitation={invitation} onChange={onChange} id="details" fallback={labels.details} className="relative font-serif text-[28px] uppercase tracking-[0.18em]" />
        <Field invitation={invitation} onChange={onChange} id="gifts" fallback={labels.gifts} className="relative mt-5 text-[14px] leading-7" />
      </section>

      <div id="rsvp">
        <SoftRsvp kit={kit} />
      </div>

      <section className="px-6 pb-6">
        <CountdownBlock kit={kit} title={ru ? "Встретимся через" : labels.untilWedding} />
      </section>
      <WishesBlock kit={kit} script />
      <FooterBlock kit={kit} withLove />
    </div>
  );
}

export function inviteLayoutThumb(layout: string, kit: { a: string; b: string; heroPhoto: string }) {
  const { a, b, heroPhoto } = kit;
  if (layout === "oliveWave") {
    return (
      <div className="flex h-full flex-col bg-[#4b533c] text-[#fdfcf8]">
        <img src={heroPhoto} alt="" className="h-[48%] object-cover" />
        <p className="font-script mt-6 text-center text-[28px]">Save the Date</p>
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em]">{a} & {b}</p>
      </div>
    );
  }
  if (layout === "monoInk") {
    return (
      <div className="relative h-full overflow-hidden bg-black text-white">
        <img src={heroPhoto} alt="" className="h-full w-full object-cover grayscale" />
        <p className="absolute inset-x-0 top-8 text-center font-serif text-[13px] uppercase tracking-[0.16em]">{a} & {b}</p>
      </div>
    );
  }
  if (layout === "roundedMono") {
    return (
      <div className="flex h-full flex-col bg-white px-3 pt-6 text-center">
        <img src={heroPhoto} alt="" className="h-[50%] rounded-[22px] object-cover grayscale" />
        <p className="mt-3 font-serif text-[28px]">{`${a[0] ?? ""}${b[0] ?? ""}`}</p>
        <p className="font-script text-[20px]">{a} & {b}</p>
      </div>
    );
  }
  if (layout === "softInvite") {
    return (
      <div className="relative h-full overflow-hidden bg-[#f2f2f2]">
        <img src={heroPhoto} alt="" className="h-[62%] w-full object-cover" />
        <p className="absolute inset-x-0 top-[48%] text-center font-script text-[24px] text-white">{a} & {b}</p>
        <p className="mt-auto px-4 pt-4 text-center font-serif text-[12px] uppercase tracking-[0.14em] text-[#333]">RSVP</p>
      </div>
    );
  }
  return null;
}
