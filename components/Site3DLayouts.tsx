"use client";

import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { ExternalLink, Heart } from "lucide-react";
import { formatInviteDay } from "@/lib/i18n";
import { addRsvp, likeWish } from "@/lib/store";
import type { SiteLook, SitePageLayout } from "@/lib/siteLooks";
import type { Invitation, RsvpStatus, Wish } from "@/lib/types";
import { CanvasText, type InvitePatch } from "./CanvasEdit";
import { paint } from "./ExtraLayer";
import { Selectable } from "./MoveCanvas";
import { Field, SlotPhoto, fieldValue, patchCopy } from "./SiteEdit";

const WEEKDAYS = {
  ky: ["Дш", "Шш", "Шр", "Бш", "Жм", "Иш", "Жк"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
};

const MONTHS = {
  ky: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

const SAMPLE_PLACE = "Ала-Тоо, Бишкек";
const COLLAGE_FRAMES = ["left-3 top-0 h-[168px] w-[168px]", "left-0 top-[118px] h-[176px] w-[176px]", "left-6 top-[248px] h-[168px] w-[168px]"];
const COLLAGE_ROTATE = ["-rotate-[8deg]", "rotate-[6deg]", "-rotate-[5deg]"];

export type Site3DLabels = {
  ticket: string;
  inviteTitle: string;
  coverWord: string;
  open: string;
  hint: string;
  dearGuests: string;
  loveQuote: string;
  weddingDay: string;
  address: string;
  map: string;
  countdown: string;
  started: string;
  days: string;
  hours: string;
  mins: string;
  secs: string;
  hourWord: string;
  wishes: string;
  respect: string;
  allWishes: string;
  writeWish: string;
  music: string;
  inviteFallback: string;
  eventDay: string;
  respectShort: string;
  rsvpHint: string;
  rsvpYes: string;
  rsvpPlus: string;
  rsvpNo: string;
  rsvpSend: string;
  yourName: string;
  rsvpThanks: string;
  becomeFamily: string;
  weWait: string;
  youWord: string;
  location: string;
  untilWedding: string;
  seeYouSoon: string;
  withLove: string;
  inviteLine: string;
  weInvite: string;
  guestWishes: string;
  guestsWord: string;
  saveTheDate: string;
  details: string;
  dressCode: string;
  dressHint: string;
  program: string;
  gifts: string;
  phoneCta: string;
  seeYou: string;
  friends: string;
  dateOfEvent: string;
};

export type LayoutKit = {
  invitation: Invitation;
  look: SiteLook;
  locale: string;
  labels: Site3DLabels;
  onChange?: InvitePatch;
  onSelect?: (id: string | null) => void;
  variant: "guest" | "editor" | "preview";
  editing: boolean;
  a: string;
  b: string;
  photos: string[];
  heroPhoto: string;
  venuePhoto: string;
  fallback: string;
  event: Date;
  mapHref: string;
  mapQuery: string;
  count: { done: boolean; d: number; h: number; m: number; s: number } | null;
  wishes: Wish[];
  activeWish?: Wish;
  slide: number;
  setSlide: Dispatch<SetStateAction<number>>;
  setAllOpen: (v: boolean) => void;
  rsvp: RsvpStatus;
  setRsvp: Dispatch<SetStateAction<RsvpStatus>>;
  rsvpName: string;
  setRsvpName: Dispatch<SetStateAction<string>>;
  rsvpDone: boolean;
  setRsvpDone: Dispatch<SetStateAction<boolean>>;
  onReload?: () => void;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function wishDate(iso: string) {
  return formatInviteDay(iso);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  return letters || name.slice(0, 2).toUpperCase();
}

function mapsEmbedUrl(q: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed&hl=ru`;
}

function useInViewOnce<T extends HTMLElement = HTMLDivElement>(instant?: boolean) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(!!instant);

  useEffect(() => {
    if (instant) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold: 0.28, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [instant]);

  return { ref, inView, shown: instant || inView };
}

function revealClass(shown: boolean, instant?: boolean) {
  return `reveal-item ${instant ? "is-static" : shown ? "is-in" : ""}`;
}

function HeartMark({ drawn, instant, stroke = "#111" }: { drawn?: boolean; instant?: boolean; stroke?: string }) {
  return (
    <svg
      className={`heart-draw pointer-events-none absolute left-1/2 top-1/2 h-[62px] w-[62px] -translate-x-1/2 -translate-y-1/2 ${instant ? "is-static" : drawn ? "is-in" : ""}`}
      viewBox="0 0 100 100"
      aria-hidden
    >
      <path
        pathLength={1}
        d="M 50,90 C 49,89 6,65 6,34 C 6,16 21,6 35,10 C 43,12 48,20 50,30 C 52,20 57,12 65,10 C 79,6 94,16 94,34 C 94,65 51,89 50,90 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="56" height="48" viewBox="0 0 56 48" fill="none" aria-hidden className="mx-auto">
      <path d="M6 16.5 28 30l22-13.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="6" y="10" width="44" height="28" stroke="currentColor" strokeWidth="1.4" />
      <path d="M28 6.5c1.4 1.8 1.4 3.8 0 5.2-1.4-1.4-1.4-3.4 0-5.2Z" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function MonthCalendar({
  event,
  locale,
  time,
  startsLabel,
  onChange,
  dateValue,
  timeValue,
  shown,
  instant,
  tone = "light",
}: {
  event: Date;
  locale: string;
  time: string;
  startsLabel: string;
  onChange?: InvitePatch;
  dateValue: string;
  timeValue: string;
  shown: boolean;
  instant?: boolean;
  tone?: "light" | "dark";
}) {
  const year = event.getFullYear();
  const month = event.getMonth();
  const selected = event.getDate();
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array.from({ length: startPad }, () => 0), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(0);
  const days = WEEKDAYS[locale === "ru" ? "ru" : "ky"];
  const monthName = MONTHS[locale === "ru" ? "ru" : "ky"][month];
  const item = revealClass(shown, instant);
  const muted = tone === "dark" ? "text-white/55" : "text-black/40";
  const bar = tone === "dark" ? "bg-white/10" : "bg-black/[0.07]";

  return (
    <Selectable id="calendar">
    <section className="px-7 py-4">
      <div className={`mb-5 flex items-baseline justify-between px-1 ${item}`} style={{ animationDelay: "80ms" }}>
        <span className="font-serif text-2xl uppercase tracking-[0.08em]">{monthName}</span>
        <span className="font-serif text-2xl uppercase tracking-[0.08em]">{year}</span>
      </div>
      <div className={`grid grid-cols-7 text-[11px] uppercase tracking-[0.08em] ${muted}`}>
        {days.map((d, i) => (
          <span key={d} className={`py-2 text-center ${item}`} style={{ animationDelay: `${160 + i * 40}ms` }}>
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((n, i) => (
          <span
            key={`${n}-${i}`}
            className={`relative flex h-12 items-center justify-center font-serif text-[15px] ${n ? item : ""}`}
            style={n ? { animationDelay: `${280 + i * 22}ms` } : undefined}
          >
            {n === selected ? <HeartMark drawn={shown} instant={instant} stroke={tone === "dark" ? "#fff" : "#111"} /> : null}
            <span className={n === selected ? "relative z-[1] font-semibold" : ""}>{n || ""}</span>
          </span>
        ))}
      </div>
      {onChange ? (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          <input type="date" value={dateValue} onChange={(e) => onChange({ date: e.target.value })} className="bg-transparent" />
          <input type="time" value={timeValue} onChange={(e) => onChange({ time: e.target.value })} className="bg-transparent" />
        </div>
      ) : (
        <div className={`mt-6 flex items-center justify-between rounded-2xl px-5 py-4 ${bar} ${item}`} style={{ animationDelay: "920ms" }}>
          <span className="font-serif text-lg uppercase tracking-[0.08em]">{startsLabel}</span>
          <span className="font-serif text-[22px] font-semibold">{time || "17:00"}</span>
        </div>
      )}
    </section>
    </Selectable>
  );
}

function CollageStack({
  photos,
  instant,
  invitation,
  onChange,
}: {
  photos: string[];
  instant?: boolean;
  invitation: Invitation;
  onChange?: InvitePatch;
}) {
  const { ref, inView } = useInViewOnce(instant);
  return (
    <div ref={ref} className="relative mx-auto h-[420px] w-[230px]">
      {photos.map((src, i) => (
        <div key={`${src}-${i}`} className={`absolute ${COLLAGE_FRAMES[i]}`}>
          <div className={`collage-card h-full w-full ${instant ? "is-static" : inView ? "is-in" : ""}`} style={instant ? undefined : { animationDelay: `${i * 340}ms` }}>
            <SlotPhoto
              invitation={invitation}
              onChange={onChange}
              slot={`c${i}`}
              src={src}
              className="h-full w-full"
              imgClass={`h-full w-full object-cover grayscale ${COLLAGE_ROTATE[i]}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Names({ kit, className }: { kit: LayoutKit; className?: string }) {
  const { a, b, onChange, invitation } = kit;
  const color = paint(invitation, "names", "inherit");
  return (
    <Selectable id="names">
      <div className={className} style={{ color }}>
        <CanvasText value={a} placeholder={a} onChange={onChange ? (v) => onChange({ names: `${v} & ${b}` }) : undefined} className="bg-transparent" />
        <span className="px-1">&</span>
        <CanvasText value={b} placeholder={b} onChange={onChange ? (v) => onChange({ names: `${a} & ${v}` }) : undefined} className="bg-transparent" />
      </div>
    </Selectable>
  );
}

function LoveMark({ kit }: { kit: LayoutKit }) {
  const word = fieldValue(kit.invitation, "loveWord", "LOVE");
  const chars = Array.from(word.replace(/\s/g, "")).slice(0, 4);
  while (chars.length < 4) chars.push("");
  const color = paint(kit.invitation, "loveWord", "inherit");
  return (
    <Selectable id="loveWord">
      <div className="relative mx-auto h-[250px] max-w-[280px] font-serif font-light leading-none" style={{ color }}>
        <span className="absolute left-0 top-0 text-[108px]">{chars[0]}</span>
        <span className="absolute right-1 top-3 text-[118px]">{chars[1]}</span>
        <span className="absolute left-1 top-[46%] text-[108px]">{chars[2]}</span>
        <span className="absolute right-4 bottom-[-8px] text-[108px]">{chars[3]}</span>
      </div>
      {kit.onChange ? (
        <CanvasText
          value={word}
          placeholder="LOVE"
          onChange={(v) => kit.onChange?.(patchCopy(kit.invitation, "loveWord", v.toUpperCase()))}
          className="mt-2 font-serif text-[11px] uppercase tracking-[0.28em] opacity-70"
        />
      ) : null}
    </Selectable>
  );
}

export function MessageBlock({ kit, className }: { kit: LayoutKit; className?: string }) {
  const { invitation, fallback, onChange, editing } = kit;
  const greet = useInViewOnce(editing);
  const color = paint(invitation, "message", "inherit");
  return (
    <Selectable id="message">
      {onChange ? (
        <CanvasText
          multiline
          value={invitation.message}
          placeholder={fallback}
          onChange={(v) => onChange({ message: v })}
          className={className ?? "mt-5 text-center text-[14px] leading-7"}
          style={{ color }}
        />
      ) : (
        <div className="mt-5 space-y-5" style={{ color }}>
          {(invitation.message.trim() || fallback)
            .split(/\n+/)
            .filter(Boolean)
            .map((line, i) => (
              <p key={`${i}-${line.slice(0, 12)}`} className={`text-center text-[14px] leading-7 ${className ?? ""} ${revealClass(greet.shown)}`} style={{ animationDelay: `${220 + i * 200}ms` }}>
                {line}
              </p>
            ))}
        </div>
      )}
    </Selectable>
  );
}

export function AddressBlock({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, venuePhoto, mapHref, mapQuery } = kit;
  return (
    <section className="relative px-8 py-8 text-center">
      <Field invitation={invitation} onChange={onChange} id="address" fallback={labels.address} className="font-ceremonial text-[44px] leading-tight" />
      <div className="relative mx-auto mt-5 overflow-hidden">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="venue" src={venuePhoto} className="h-[240px] w-full" imgClass="h-[240px] w-full object-cover object-center" />
      </div>
      <Selectable id="city">
        <CanvasText
          value={invitation.city}
          placeholder="Бишкек"
          onChange={onChange ? (v) => onChange({ city: v }) : undefined}
          className="mt-6 font-serif text-lg uppercase tracking-[0.14em]"
          style={{ color: paint(invitation, "city", "inherit") }}
        />
      </Selectable>
      <Selectable id="venue">
        <CanvasText
          multiline
          value={[invitation.venue, invitation.address].filter(Boolean).join("\n")}
          placeholder={'«Ала-Тоо»\nРесторанный комплекс'}
          onChange={
            onChange
              ? (v) => {
                  const [venue, ...rest] = v.split("\n");
                  onChange({ venue: venue ?? "", address: rest.join(" ") });
                }
              : undefined
          }
          className="mt-2 font-serif text-[17px] leading-7"
          style={{ color: paint(invitation, "venue", "inherit") }}
        />
      </Selectable>
      <a
        href={mapHref}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          window.open(mapHref, "_blank", "noopener,noreferrer");
        }}
        className="relative z-20 mt-6 inline-flex h-12 w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-black text-[13px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_12px_24px_rgba(0,0,0,0.28)]"
      >
        <Field invitation={invitation} onChange={onChange} id="map" fallback={labels.map} className="bg-transparent text-inherit" />
        <ExternalLink size={14} />
      </a>
      <div className="relative z-20 mx-auto mt-5 overflow-hidden rounded-2xl">
        <Selectable id="mapEmbed">
        <iframe
          title={labels.map}
          src={mapsEmbedUrl(mapHref.includes("41Efw") ? SAMPLE_PLACE : mapQuery)}
          className="h-[160px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        </Selectable>
      </div>
    </section>
  );
}

export function RsvpBlock({ kit, soft }: { kit: LayoutKit; soft?: boolean }) {
  const { variant, onChange, labels, invitation, rsvp, setRsvp, rsvpName, setRsvpName, rsvpDone, setRsvpDone, onReload } = kit;
  if (variant !== "guest" && !onChange) return null;
  const yes = fieldValue(invitation, "rsvpYes", labels.rsvpYes);
  const no = fieldValue(invitation, "rsvpNo", labels.rsvpNo);
  const plus = fieldValue(invitation, "rsvpPlus", labels.rsvpPlus);
  const send = fieldValue(invitation, "rsvpSend", labels.rsvpSend);
  const accent = soft ? kit.look.accent : "#111";
  return (
    <section className="px-8 py-10 text-center">
      <Field invitation={invitation} onChange={onChange} id="rsvpHint" fallback={labels.rsvpHint} className="mb-6 font-serif text-[13px] uppercase leading-6 tracking-[0.12em]" />
      {variant === "guest" ? (
        <form
          className="space-y-3"
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
            className="h-12 w-full rounded-full border border-black/15 bg-white px-4 text-sm outline-none"
          />
          {(
            (soft
              ? [
                  ["yes", yes],
                  ["no", no],
                ]
              : [
                  ["yes", yes],
                  ["no", no],
                  ["maybe", plus],
                ]) as [RsvpStatus, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setRsvp(key)}
              className="flex h-14 w-full items-center gap-3 rounded-full border px-5 text-left text-[15px]"
              style={{
                borderColor: rsvp === key ? accent : "rgba(0,0,0,0.18)",
                background: rsvp === key ? `${accent}22` : "#fff",
                color: rsvp === key ? accent : "inherit",
              }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: accent }}>
                {rsvp === key ? <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} /> : null}
              </span>
              {label}
            </button>
          ))}
          <button type="submit" className="flex h-14 w-full items-center justify-center rounded-full text-sm font-semibold tracking-[0.16em] text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)]" style={{ background: accent }}>
            {send}
          </button>
          {rsvpDone ? <p className="text-sm opacity-80">{labels.rsvpThanks}</p> : null}
        </form>
      ) : (
        <div className="space-y-3">
          <Field invitation={invitation} onChange={onChange} id="rsvpYes" fallback={labels.rsvpYes} className="flex h-14 items-center rounded-full border px-5 text-left text-[15px]" />
          <Field invitation={invitation} onChange={onChange} id="rsvpNo" fallback={labels.rsvpNo} className="flex h-14 items-center rounded-full border border-black/20 px-5 text-left text-[15px]" />
          {soft ? null : (
            <Field invitation={invitation} onChange={onChange} id="rsvpPlus" fallback={labels.rsvpPlus} className="flex h-14 items-center rounded-full border border-black/20 px-5 text-left text-[15px]" />
          )}
          <div className="overflow-hidden rounded-full" style={{ background: accent }}>
            <Field invitation={invitation} onChange={onChange} id="rsvpSend" fallback={labels.rsvpSend} className="flex h-14 items-center justify-center text-sm tracking-[0.16em] text-white" />
          </div>
        </div>
      )}
    </section>
  );
}

export function CountdownBlock({ kit, light, gold, title }: { kit: LayoutKit; light?: boolean; gold?: boolean; title?: string }) {
  const { count, labels, invitation, onChange } = kit;
  return (
    <Selectable id="timer">
    <section className="px-4 py-8 text-center">
      {count?.done ? (
        <Field invitation={invitation} onChange={onChange} id="started" fallback={labels.started} className="font-serif text-2xl" />
      ) : (
        <>
          <Field
            invitation={invitation}
            onChange={onChange}
            id="countdown"
            fallback={title ?? labels.countdown}
            className={`text-[13px] uppercase tracking-[0.16em] ${light ? "text-white/80" : ""}`}
          />
          <div className={`mt-5 flex justify-center gap-6 font-serif text-[28px] leading-none ${light ? "text-white" : ""}`}>
            {[
              [pad(count?.d ?? 0), labels.days],
              [pad(count?.h ?? 0), labels.hours],
              [pad(count?.m ?? 0), labels.mins],
              [pad(count?.s ?? 0), labels.secs],
            ].map(([n, lab]) => (
              <div key={String(lab)}>
                {n}
                <p className={`mt-2 text-[10px] uppercase tracking-widest ${light ? "text-white/70" : gold ? "opacity-70" : "text-black/40"}`}>{lab}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
    </Selectable>
  );
}

export function WishesBlock({ kit, script, hideIcon }: { kit: LayoutKit; script?: boolean; hideIcon?: boolean }) {
  const { labels, activeWish, wishes, slide, setSlide, setAllOpen, invitation, onReload, onChange } = kit;
  return (
    <section className="px-5 pb-8 pt-6">
      {hideIcon ? null : (
        <Selectable id="envelopeIcon" className="mx-auto w-fit">
          <EnvelopeIcon />
        </Selectable>
      )}
      {hideIcon ? (
        <Field invitation={invitation} onChange={onChange} id="wishes" fallback={labels.wishes} className="font-script text-center text-[36px] leading-tight" />
      ) : script ? (
        <div className="relative mt-3 text-center">
          <Field invitation={invitation} onChange={onChange} id="guestWishes" fallback={labels.guestWishes.split(" ")[0] || labels.wishes} className="font-ceremonial text-[42px] leading-none" />
          <Field invitation={invitation} onChange={onChange} id="guestsWord" fallback={labels.guestsWord} className="font-script -mt-2 text-[48px] leading-none" />
        </div>
      ) : (
        <Field invitation={invitation} onChange={onChange} id="wishes" fallback={labels.wishes} className="font-ceremonial mt-3 text-center text-[42px] leading-tight" />
      )}
      {activeWish ? (
        <article className="relative mx-auto mt-6 max-w-[340px] rounded-2xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <p className="absolute left-5 top-2 font-serif text-5xl text-black/10">“</p>
          <p className="pt-6 text-[15px] leading-7 text-[#2d2d35]">{activeWish.text}</p>
          <div className="mt-5 flex items-center gap-3 border-t border-black/10 pt-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d2d35] text-[11px] text-white">{initials(activeWish.name)}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-[#2d2d35]">{activeWish.name}</p>
              <p className="text-[11px] text-black/40">{wishDate(activeWish.createdAt)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                likeWish(invitation.id, activeWish.id);
                onReload?.();
              }}
              className="rounded-full bg-black/[0.06] px-3 py-1 text-xs text-[#2d2d35]"
            >
              <Heart size={12} className="mr-1 inline" /> {activeWish.likes}
            </button>
          </div>
        </article>
      ) : (
        <p className="mt-4 text-center text-sm opacity-40">—</p>
      )}
      {wishes.length > 1 ? (
        <div className="mt-4 flex justify-center gap-1.5">
          {wishes.map((w, i) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSlide(i)}
              className="h-2 w-2 rounded-full"
              style={{ background: i === slide % wishes.length ? "#2d2d35" : "rgba(45,45,53,0.18)" }}
            />
          ))}
        </div>
      ) : null}
      {wishes.length > 0 ? (
        <button type="button" onClick={() => setAllOpen(true)} className="mx-auto mt-5 flex items-center gap-2 border-b border-current pb-0.5 text-[12px] uppercase tracking-[0.12em]">
          <Field invitation={invitation} onChange={onChange} id="allWishes" fallback={labels.allWishes} className="bg-transparent text-inherit" />
          <span aria-hidden>→</span>
        </button>
      ) : null}
    </section>
  );
}

export function FooterBlock({ kit, withLove }: { kit: LayoutKit; withLove?: boolean }) {
  const { invitation, labels, a, b, onChange } = kit;
  return (
    <>
      <section className="site3d-rip px-6 pb-16 pt-8 text-center">
        <Field invitation={invitation} onChange={onChange} id={withLove ? "seeYouSoon" : "respectShort"} fallback={withLove ? labels.seeYouSoon : labels.respectShort} className="font-serif text-xl uppercase tracking-[0.18em]" />
      </section>
      <section className="bg-[#f1eee9] px-6 pb-28 pt-14 text-center">
        {withLove ? (
          <Field invitation={invitation} onChange={onChange} id="withLove" fallback={labels.withLove} className="font-script mb-3 text-4xl" />
        ) : null}
        <Selectable id="hosts">
          <CanvasText
            value={invitation.hosts || `${a} & ${b}`}
            placeholder={`${a} & ${b}`}
            onChange={onChange ? (v) => onChange({ hosts: v }) : undefined}
            className="font-ceremonial text-[40px] leading-tight text-black"
            style={{ color: paint(invitation, "hosts", "#000") }}
          />
        </Selectable>
      </section>
    </>
  );
}

function LayoutClassic({ kit }: { kit: LayoutKit }) {
  const { labels, onChange, editing, photos, invitation } = kit;
  const greet = useInViewOnce<HTMLElement>(editing);
  const cal = useInViewOnce(editing);
  return (
    <>
      <header className="relative px-6 pb-4 pt-10 text-center">
        <Names kit={kit} className="flex items-end justify-center gap-3 font-serif text-[22px] uppercase tracking-[0.12em]" />
        <Field invitation={invitation} onChange={onChange} id="weddingDay" fallback={labels.weddingDay} className="mt-3 text-[11px] tracking-[0.28em] opacity-45" />
        <div className="mt-8">
          <LoveMark kit={kit} />
        </div>
        <div className="font-script pointer-events-auto absolute left-[-18px] top-[46%] origin-center -rotate-90 text-[17px] whitespace-nowrap opacity-80">
          <Field invitation={invitation} onChange={onChange} id="loveQuote" fallback={labels.loveQuote} className="bg-transparent" />
        </div>
      </header>
      <section ref={greet.ref} className="relative px-8 pb-4 pt-10 text-center">
        <Field invitation={invitation} onChange={onChange} id="dearGuests" fallback={labels.dearGuests} className={`font-ceremonial text-[42px] leading-tight ${revealClass(greet.shown, editing)}`} />
        <MessageBlock kit={kit} />
      </section>
      <div ref={cal.ref} className="relative">
        <Field invitation={invitation} onChange={onChange} id="eventDay" fallback={labels.eventDay} className={`font-ceremonial px-6 pt-10 text-center text-[40px] leading-tight ${revealClass(cal.shown, editing)}`} />
        <MonthCalendar
          event={kit.event}
          locale={kit.locale}
          time={invitation.time}
          startsLabel={fieldValue(invitation, "hourWord", labels.hourWord)}
          onChange={onChange}
          dateValue={invitation.date}
          timeValue={invitation.time}
          shown={cal.shown}
          instant={editing}
        />
      </div>
      <section className="relative overflow-hidden px-8 py-12">
        <CollageStack photos={photos} instant={!!onChange} invitation={invitation} onChange={onChange} />
        <div className="font-script pointer-events-auto absolute right-[-4px] top-1/2 origin-center rotate-90 text-[16px] whitespace-nowrap opacity-75">
          <Field invitation={invitation} onChange={onChange} id="loveQuote2" fallback={labels.loveQuote} className="bg-transparent" />
        </div>
      </section>
      <AddressBlock kit={kit} />
      <RsvpBlock kit={kit} />
      <CountdownBlock kit={kit} />
      <WishesBlock kit={kit} />
      <FooterBlock kit={kit} />
    </>
  );
}

function LayoutEditorial({ kit }: { kit: LayoutKit }) {
  const { labels, onChange, editing, heroPhoto, photos, invitation } = kit;
  const greet = useInViewOnce<HTMLElement>(editing);
  const cal = useInViewOnce(editing);
  return (
    <>
      <header className="px-6 pb-2 pt-12 text-center">
        <Field invitation={invitation} onChange={onChange} id="weddingDay" fallback={labels.weddingDay} className="font-serif text-[13px] uppercase tracking-[0.28em]" />
        <Names kit={kit} className="mt-3 flex items-center justify-center gap-2 font-ceremonial text-[48px] leading-none" />
        <Selectable id="nameLine" className="mx-auto mt-5">
          <div className="mx-auto h-px w-24 bg-current" />
        </Selectable>
      </header>
      <section className="px-0 pt-4">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[420px] w-full" imgClass="h-[420px] w-full object-cover grayscale" />
      </section>
      <section className="px-8 py-10 text-center">
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="rings"
          src="/stickers/wedding-rings-gold.png"
          className="mx-auto h-16 w-16"
          imgClass="h-16 w-16 object-contain"
        />
        <Field invitation={invitation} onChange={onChange} id="inviteLine" fallback={labels.inviteLine} className="mt-4 font-serif text-[13px] uppercase leading-6 tracking-[0.2em]" />
      </section>
      <Selectable id="blockFamily">
      <section ref={greet.ref} className="bg-[#f3eadc] px-8 py-12 text-center">
        <Field invitation={invitation} onChange={onChange} id="becomeFamily" fallback={labels.becomeFamily} className={`font-ceremonial text-[40px] leading-tight ${revealClass(greet.shown, editing)}`} />
        <div className="mx-auto mt-8 h-[180px] w-[180px] overflow-hidden rounded-full">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="circle" src={photos[1] || heroPhoto} className="h-full w-full" imgClass="h-full w-full rounded-full object-cover grayscale" />
        </div>
        <MessageBlock kit={kit} className="text-[#333]" />
      </section>
      </Selectable>
      <Selectable id="blockWait">
      <section className="relative px-8 py-12 text-center">
        <Field invitation={invitation} onChange={onChange} id="weWait" fallback={labels.weWait} className="font-serif text-2xl uppercase tracking-[0.16em]" />
        <Field invitation={invitation} onChange={onChange} id="youWord" fallback={labels.youWord} fallbackColor={kit.look.accent} className="font-script -mt-2 text-[72px] leading-none" />
      </section>
      </Selectable>
      <section className="relative overflow-hidden">
        <Selectable id="photo-calbg" className="absolute inset-0">
          <img src={invitation.gallery?.hero || heroPhoto} alt="" className="h-full w-full object-cover grayscale blur-[8px]" />
        </Selectable>
        <div className="absolute inset-0 bg-black/55" />
        <div ref={cal.ref} className="cal-on-photo relative py-8">
          <Field invitation={invitation} onChange={onChange} id="eventDay" fallback={labels.eventDay} className={`px-6 pt-2 text-center font-serif text-sm uppercase tracking-[0.16em] ${revealClass(cal.shown, editing)}`} />
          <MonthCalendar
            event={kit.event}
            locale={kit.locale}
            time={invitation.time}
            startsLabel={fieldValue(invitation, "hourWord", labels.hourWord)}
            onChange={onChange}
            dateValue={invitation.date}
            timeValue={invitation.time}
            shown={cal.shown}
            instant={editing}
            tone="dark"
          />
        </div>
      </section>
      <section className="px-8 py-10 text-center">
        <Field invitation={invitation} onChange={onChange} id="location" fallback={labels.location} className="font-ceremonial text-[52px] leading-tight" />
      </section>
      <AddressBlock kit={kit} />
      <RsvpBlock kit={kit} />
      <CountdownBlock kit={kit} title={labels.untilWedding} />
      <WishesBlock kit={kit} script />
      <FooterBlock kit={kit} withLove />
    </>
  );
}

function LayoutArches({ kit }: { kit: LayoutKit }) {
  const { labels, onChange, editing, photos, invitation } = kit;
  const greet = useInViewOnce<HTMLElement>(editing);
  const cal = useInViewOnce(editing);
  return (
    <>
      <header className="px-6 pb-4 pt-12 text-center">
        <Field invitation={invitation} onChange={onChange} id="inviteTitle" fallback={labels.inviteTitle} className="font-script text-[34px] leading-tight" />
      </header>
      <section className="flex items-end justify-center gap-2 px-4 pb-4">
        {[photos[0], photos[1], photos[2]].map((src, i) => (
          <SlotPhoto
            key={`arch-${i}`}
            invitation={invitation}
            onChange={onChange}
            slot={`c${i}`}
            src={src}
            className={`photo-arch w-[30%] ${i === 1 ? "h-[210px]" : "h-[170px]"}`}
            imgClass="h-full w-full object-cover"
          />
        ))}
      </section>
      <section ref={greet.ref} className="px-8 pt-6 text-center">
        <Field invitation={invitation} onChange={onChange} id="weInvite" fallback={labels.weInvite} className={`font-script text-[30px] ${revealClass(greet.shown, editing)}`} />
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="flora"
          src="/stickers/flora-rose.png"
          className="mx-auto mt-6 h-16 w-40"
          imgClass="h-16 w-40 object-contain"
        />
        <div className="invite-oval mx-auto mt-6 max-w-[300px] overflow-hidden px-8">
          <MessageBlock kit={kit} className="line-clamp-6 font-script text-[18px] leading-7 text-white" />
        </div>
      </section>
      <div ref={cal.ref} className="relative pt-6">
        <Field invitation={invitation} onChange={onChange} id="eventDay" fallback={labels.eventDay} className={`font-script px-6 text-center text-[28px] ${revealClass(cal.shown, editing)}`} />
        <MonthCalendar
          event={kit.event}
          locale={kit.locale}
          time={invitation.time}
          startsLabel={fieldValue(invitation, "hourWord", labels.hourWord)}
          onChange={onChange}
          dateValue={invitation.date}
          timeValue={invitation.time}
          shown={cal.shown}
          instant={editing}
        />
      </div>
      <CountdownBlock kit={kit} title={labels.untilWedding} />
      <AddressBlock kit={kit} />
      <RsvpBlock kit={kit} />
      <WishesBlock kit={kit} />
      <FooterBlock kit={kit} withLove />
    </>
  );
}

function LayoutHeroTimer({ kit }: { kit: LayoutKit }) {
  const { labels, onChange, heroPhoto, look, invitation } = kit;
  return (
    <>
      <section className="hero-photo-fade relative h-[560px] overflow-hidden" style={{ ["--hero-fade" as string]: look.pageBg || "#fff" }}>
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-full w-full" imgClass="h-full w-full object-cover grayscale" />
        <div className="absolute inset-x-0 bottom-6 z-10 text-center">
          <CountdownBlock kit={kit} title={labels.untilWedding} />
        </div>
      </section>
      <section className="px-8 py-10 text-center">
        <Names kit={kit} className="flex items-center justify-center gap-2 font-ceremonial text-[44px] leading-none" />
        <MessageBlock kit={kit} />
      </section>
      <AddressBlock kit={kit} />
      <RsvpBlock kit={kit} />
      <WishesBlock kit={kit} script />
      <FooterBlock kit={kit} withLove />
    </>
  );
}

function DaisyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse
          key={i}
          cx="32"
          cy="14"
          rx="6"
          ry="13"
          fill="#fff"
          stroke="#ead9a8"
          strokeWidth="0.6"
          transform={`rotate(${i * 30} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="8" fill="#f0c94a" />
      <circle cx="32" cy="32" r="4.5" fill="#e2a82a" />
    </svg>
  );
}

function WeekStrip({
  event,
  locale,
  time,
  shown,
  instant,
  stroke,
}: {
  event: Date;
  locale: string;
  time: string;
  shown: boolean;
  instant?: boolean;
  stroke: string;
}) {
  const selected = event.getDate();
  const monthName = MONTHS[locale === "ru" ? "ru" : "ky"][event.getMonth()];
  const days = [-2, -1, 0, 1, 2].map((offset) => {
    const next = new Date(event);
    next.setDate(selected + offset);
    return next.getDate();
  });
  const item = revealClass(shown, instant);
  return (
    <div className="px-8 py-6 text-center">
      <p className={`font-serif text-[12px] uppercase tracking-[0.28em] ${item}`}>{monthName}</p>
      <div className="mt-5 flex items-center justify-center gap-4 font-serif text-[22px]">
        {days.map((n, i) => (
          <span key={`${n}-${i}`} className={`relative flex h-12 w-12 items-center justify-center ${item}`}>
            {i === 2 ? <HeartMark drawn={shown} instant={instant} stroke={stroke} /> : null}
            <span className={i === 2 ? "relative z-[1] font-semibold" : "opacity-55"}>{n}</span>
          </span>
        ))}
      </div>
      <p className={`mt-4 font-serif text-[13px] uppercase tracking-[0.18em] opacity-70 ${item}`}>
        {locale === "ru" ? "в" : ""} {time || "12:00"}
      </p>
    </div>
  );
}

function LayoutBloom({ kit }: { kit: LayoutKit }) {
  const { invitation, look, labels, onChange, a, b, heroPhoto, editing, locale } = kit;
  const gold = look.accent;
  const cal = useInViewOnce(editing);
  return (
    <>
      <section className="relative overflow-hidden px-8 pb-16 pt-10 text-center" style={{ color: gold }}>
        {look.floras.map((item) => (
          <img key={item.src} src={item.src} alt="" className={`pointer-events-none ${item.className} object-contain`} />
        ))}
        <Selectable id="photo-rings">
          <img src="/stickers/wedding-rings-gold.png" alt="" className="relative z-[1] mx-auto mt-10 h-14 w-14 object-contain" />
        </Selectable>
        <Field
          invitation={invitation}
          onChange={onChange}
          id="inviteTitle"
          fallback={labels.ticket}
          className="font-script relative z-[1] mt-4 text-[28px] leading-tight"
        />
        <Selectable id="names">
          <div className="relative z-[1] mt-6 font-ceremonial text-[52px] leading-none">
            <CanvasText
              value={a}
              placeholder={a}
              onChange={onChange ? (v) => onChange({ names: `${v} & ${b}` }) : undefined}
              className="bg-transparent"
            />
            <DaisyMark className="mx-auto my-3 h-12 w-12 drop-shadow-sm" />
            <CanvasText
              value={b}
              placeholder={b}
              onChange={onChange ? (v) => onChange({ names: `${a} & ${v}` }) : undefined}
              className="bg-transparent"
            />
          </div>
        </Selectable>
        <div className="relative z-[1] mx-auto mt-8 max-w-[280px]">
          <MessageBlock kit={kit} className="text-center text-[13px] uppercase leading-7 tracking-[0.08em]" />
        </div>
        <img src="/stickers/frame-bottom-flowers.png" alt="" className="pointer-events-none absolute -bottom-4 left-1/2 h-28 w-40 -translate-x-1/2 object-contain opacity-85" />
      </section>

      <div ref={cal.ref} className="relative overflow-hidden text-center" style={{ color: gold }}>
        <DaisyMark className="pointer-events-none absolute -left-8 top-16 h-28 w-28 rotate-[-18deg] drop-shadow-md" />
        <Field
          invitation={invitation}
          onChange={onChange}
          id="eventDay"
          fallback={labels.eventDay}
          className={`font-script px-6 pt-8 text-[36px] leading-tight ${revealClass(cal.shown, editing)}`}
        />
        <WeekStrip
          event={kit.event}
          locale={locale}
          time={invitation.time}
          shown={cal.shown}
          instant={editing}
          stroke={gold}
        />
        {onChange ? (
          <div className="mb-4 flex justify-center gap-2 text-sm">
            <input type="date" value={invitation.date} onChange={(e) => onChange({ date: e.target.value })} className="bg-transparent" />
            <input type="time" value={invitation.time} onChange={(e) => onChange({ time: e.target.value })} className="bg-transparent" />
          </div>
        ) : null}
      </div>

      <section className="px-8 py-6 text-center" style={{ color: gold }}>
        <Selectable id="photo-hands">
          <img src="/stickers/wedding-couple.png" alt="" className="mx-auto h-28 w-28 object-contain" />
        </Selectable>
        <Field invitation={invitation} onChange={onChange} id="location" fallback={labels.location} className="font-script mt-6 text-[32px] leading-tight" />
        <Selectable id="city">
          <CanvasText
            value={invitation.city}
            placeholder="Алматы"
            onChange={onChange ? (v) => onChange({ city: v }) : undefined}
            className="mt-5 font-serif text-lg uppercase tracking-[0.18em]"
          />
        </Selectable>
        <Selectable id="venue">
          <CanvasText
            multiline
            value={[invitation.venue, invitation.address].filter(Boolean).join("\n")}
            placeholder={'«Villa Borghese»\nРесторанный комплекс'}
            onChange={
              onChange
                ? (v) => {
                    const [venue, ...rest] = v.split("\n");
                    onChange({ venue: venue ?? "", address: rest.join(" ") });
                  }
                : undefined
            }
            className="mt-3 font-serif text-[15px] uppercase leading-7 tracking-[0.08em]"
          />
        </Selectable>
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
          className="mt-8 inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-full px-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_rgba(196,163,94,0.35)]"
          style={{ background: gold }}
        >
          <Field invitation={invitation} onChange={onChange} id="map" fallback={labels.map} className="bg-transparent text-inherit" />
          <ExternalLink size={14} />
        </a>
      </section>

      <div className="relative z-10 mx-3 -mb-10 rounded-[36px] bg-white px-1 pb-4 pt-2 shadow-[0_18px_40px_rgba(80,60,20,0.12)]" style={{ color: gold }}>
        <RsvpBlock kit={kit} soft />
      </div>

      <section className="relative overflow-hidden">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[460px] w-full" imgClass="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/85 via-white/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-8 z-10" style={{ color: gold }}>
          <CountdownBlock kit={kit} gold title={labels.countdown} />
        </div>
      </section>

      <WishesBlock kit={kit} hideIcon />
      <FooterBlock kit={kit} withLove />
    </>
  );
}

export const BASE_LAYOUTS: Partial<Record<SitePageLayout, (kit: LayoutKit) => ReactNode>> = {
  classic: (kit) => <LayoutClassic kit={kit} />,
  editorial: (kit) => <LayoutEditorial kit={kit} />,
  arches: (kit) => <LayoutArches kit={kit} />,
  heroTimer: (kit) => <LayoutHeroTimer kit={kit} />,
  bloom: (kit) => <LayoutBloom kit={kit} />,
};

export function Site3DInner({ kit }: { kit: LayoutKit }) {
  return (BASE_LAYOUTS[kit.look.pageLayout] ?? BASE_LAYOUTS.classic)!(kit);
}

export function Site3DThumb({
  look,
  labels,
  a,
  b,
  photos,
  heroPhoto,
}: {
  look: SiteLook;
  labels: Site3DLabels;
  a: string;
  b: string;
  photos: string[];
  heroPhoto: string;
}) {
  const layout = look.pageLayout;
  if (layout === "editorial") {
    return (
      <div className="flex h-full flex-col bg-white text-[#2d2d35]">
        <div className="px-4 pb-2 pt-8 text-center">
          <p className="font-serif text-[9px] uppercase tracking-[0.22em]">{labels.weddingDay}</p>
          <p className="font-ceremonial mt-1 text-[28px] leading-none">
            {a} <span className="text-lg">&</span> {b}
          </p>
        </div>
        <img src={heroPhoto} alt="" className="min-h-0 flex-1 object-cover grayscale" />
      </div>
    );
  }
  if (layout === "arches") {
    return (
      <div className="flex h-full flex-col bg-white px-3 pt-8 text-[#2d2d35]">
        <p className="font-script text-center text-[22px] leading-tight">{labels.inviteTitle}</p>
        <div className="mt-4 flex flex-1 items-end justify-center gap-1.5 pb-8">
          {photos.slice(0, 3).map((src, i) => (
            <div key={src} className={`photo-arch w-[32%] ${i === 1 ? "h-[58%]" : "h-[46%]"}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (layout === "bloom") {
    return (
      <div className="flex h-full flex-col items-center bg-white px-4 pt-10 text-center" style={{ background: look.pageBg, color: look.accent }}>
        <img src={look.previewFlora.src} alt="" className="h-16 w-16 object-contain opacity-90" />
        <p className="font-script mt-2 text-[18px] leading-tight">{labels.inviteTitle}</p>
        <p className="font-ceremonial mt-3 text-[26px] leading-none">{a}</p>
        <p className="font-ceremonial mt-1 text-[26px] leading-none">{b}</p>
        <img src={heroPhoto} alt="" className="mt-auto h-[38%] w-full object-cover" />
      </div>
    );
  }
  if (layout === "heroTimer") {
    return (
      <div className="relative h-full overflow-hidden bg-black">
        <img src={heroPhoto} alt="" className="h-full w-full object-cover grayscale" />
        <div className="absolute inset-x-0 bottom-10 text-center text-white">
          <p className="font-serif text-[9px] uppercase tracking-[0.2em]">{labels.untilWedding}</p>
          <p className="mt-2 font-serif text-3xl">16 21 57</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col items-center bg-white px-4 pt-8 text-[#2d2d35]" style={{ background: look.pageBg }}>
      <p className="font-serif text-[11px] uppercase tracking-[0.16em]">
        {a} & {b}
      </p>
      <div className="relative mt-6 h-[42%] w-[70%] font-serif font-light leading-none">
        <span className="absolute left-0 top-0 text-[64px]">L</span>
        <span className="absolute right-0 top-1 text-[70px]">O</span>
        <span className="absolute left-1 top-[48%] text-[64px]">V</span>
        <span className="absolute right-2 bottom-0 text-[64px]">E</span>
      </div>
      <img src={photos[0]} alt="" className="mt-4 h-24 w-24 rotate-[-8deg] object-cover grayscale" />
    </div>
  );
}
