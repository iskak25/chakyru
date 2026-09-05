"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { addRsvp, addWish } from "@/lib/store";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto, fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { mapsEmbedUrl, pad, programItems } from "./shared";
import { GoldFlourish, MAUVE_ICONS, MauveCornerBloom } from "./florals";
import { Reveal } from "./Reveal";

function dressSwatches(invitation: LayoutKit["invitation"]) {
  const fromCopy = [0, 1, 2, 3, 4]
    .map((i) => invitation.copy?.[`dc${i}`])
    .filter((v): v is string => Boolean(v));
  return fromCopy.length ? fromCopy : ["#3d322e", "#9f7e7e", "#c4a090", "#d8c4b0", "#efe4d6"];
}

export function MauveFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, count, mapHref, mapQuery, event } = kit;
  const instant = !!onChange;
  const items = programItems(kit);
  const swatches = dressSwatches(invitation);

  return (
    <div className="fam-mauve overflow-x-hidden bg-[#fdf8f5] text-[#2b2624]">
      <HeroSection kit={kit} a={a} b={b} event={event} instant={instant} />
      <CountdownSection kit={kit} count={count} instant={instant} />
      <GallerySection kit={kit} heroPhoto={heroPhoto} photos={photos} instant={instant} />
      <ProgramTimeline kit={kit} items={items} instant={instant} />
      <VenueSection kit={kit} mapHref={mapHref} instant={instant} />
      <DressCodeSection kit={kit} swatches={swatches} instant={instant} />
      <RSVPSection kit={kit} />
      <ContactsSection kit={kit} instant={instant} />
      <FooterSection kit={kit} mapQuery={mapQuery} />
    </div>
  );
}

function HeroSection({
  kit,
  a,
  b,
  event,
  instant,
}: {
  kit: LayoutKit;
  a: string;
  b: string;
  event: Date;
  instant: boolean;
}) {
  return (
    <section className="relative overflow-hidden px-6 pb-6 pt-14 text-center">
      <MauveCornerBloom className="pointer-events-none absolute -right-6 -top-4 h-40 w-44" />
      <h1 className="font-mauve relative break-words text-[clamp(34px,10vw,44px)] uppercase leading-none tracking-[0.06em]">
        <CanvasText
          value={a}
          placeholder={a}
          onChange={kit.onChange ? (v) => kit.onChange?.({ names: `${v} & ${b}` }) : undefined}
          className="bg-transparent"
        />
      </h1>
      <div className="my-3 flex items-center justify-center gap-3 text-[#9f7e7e]">
        <span className="h-px w-10 bg-[#c8b2aa]" />
        <span className="font-ivory-script text-[22px] italic leading-none">и</span>
        <span className="h-px w-10 bg-[#c8b2aa]" />
      </div>
      <h1 className="font-mauve relative break-words text-[clamp(34px,10vw,44px)] uppercase leading-none tracking-[0.06em]">
        <CanvasText
          value={b}
          placeholder={b}
          onChange={kit.onChange ? (v) => kit.onChange?.({ names: `${a} & ${v}` }) : undefined}
          className="bg-transparent"
        />
      </h1>
      <p className="font-mauve mt-6 text-[18px] tracking-[0.18em]">
        {pad(event.getDate())} . {pad(event.getMonth() + 1)} . {event.getFullYear()}
      </p>
      <Reveal instant={instant} className="mt-6">
        <Field
          invitation={kit.invitation}
          onChange={kit.onChange}
          id="message"
          fallback={kit.invitation.message || kit.fallback}
          className="mx-auto max-w-[300px] text-[14px] leading-7 text-[#5a534e]"
          multiline
        />
      </Reveal>
    </section>
  );
}

function CountdownSection({
  kit,
  count,
  instant,
}: {
  kit: LayoutKit;
  count: LayoutKit["count"];
  instant: boolean;
}) {
  if (!count) return null;
  const ru = kit.locale === "ru";
  const boxes = [
    [pad(count.d), fieldValue(kit.invitation, "cdDays", ru ? "ДНЕЙ" : kit.labels.days)],
    [pad(count.h), fieldValue(kit.invitation, "cdHours", ru ? "ЧАСОВ" : kit.labels.hours)],
    [pad(count.m), fieldValue(kit.invitation, "cdMins", ru ? "МИНУТ" : kit.labels.mins)],
    [pad(count.s), fieldValue(kit.invitation, "cdSecs", ru ? "СЕКУНД" : kit.labels.secs)],
  ];
  return (
    <Reveal instant={instant} className="px-5 pb-8 text-center">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7068]">
        {fieldValue(kit.invitation, "untilTitle", kit.labels.untilWedding)}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {boxes.map(([n, lab]) => (
          <div key={String(lab)} className="rounded-[10px] border border-[#e4d9d2] bg-white py-3">
            <p className="font-mauve text-[22px] leading-none">{n}</p>
            <p className="mt-2 text-[8px] uppercase tracking-[0.12em] text-[#8a8078]">{lab}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

function GallerySection({
  kit,
  heroPhoto,
  photos,
  instant,
}: {
  kit: LayoutKit;
  heroPhoto: string;
  photos: string[];
  instant: boolean;
}) {
  return (
    <Reveal instant={instant} className="px-0 pb-2">
      <SlotPhoto
        invitation={kit.invitation}
        onChange={kit.onChange}
        slot="hero"
        src={heroPhoto}
        className="h-[240px]"
        imgClass="h-full w-full object-cover"
      />
      <div className="mt-2 grid grid-cols-2 gap-2 px-5">
        <SlotPhoto invitation={kit.invitation} onChange={kit.onChange} slot="c0" src={photos[0]} className="h-[140px]" imgClass="h-full w-full object-cover" />
        <SlotPhoto invitation={kit.invitation} onChange={kit.onChange} slot="c2" src={photos[2]} className="h-[140px]" imgClass="h-full w-full object-cover" />
      </div>
    </Reveal>
  );
}

function ProgramTimeline({
  kit,
  items,
  instant,
}: {
  kit: LayoutKit;
  items: [string, string][];
  instant: boolean;
}) {
  return (
    <Reveal instant={instant} className="px-8 py-12">
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="program"
        fallback={kit.labels.program}
        className="font-mauve text-center text-[20px] uppercase tracking-[0.18em]"
      />
      <GoldFlourish className="mx-auto mt-3 h-4 w-32" />
      <ul className="relative mt-8 space-y-7 pl-2">
        <span className="absolute bottom-3 left-[21px] top-3 w-px bg-[#e0d0c8]" />
        {items.map(([time, title], i) => {
          const Icon = MAUVE_ICONS[i % MAUVE_ICONS.length]!;
          return (
            <li key={`${time}-${title}`} className="relative grid grid-cols-[42px_1fr] items-center gap-4">
              <span className="relative z-[1] flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#9f7e7e] text-white">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-[15px] leading-6">
                <span className="font-medium">{time}</span> {title}
              </p>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}

function VenueSection({
  kit,
  mapHref,
  instant,
}: {
  kit: LayoutKit;
  mapHref: string;
  instant: boolean;
}) {
  return (
    <Reveal instant={instant} className="px-8 py-8 text-center">
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="venueTitle"
        fallback={kit.locale === "ru" ? "МЕСТО ПРОВЕДЕНИЯ" : kit.labels.location}
        className="font-mauve text-[18px] uppercase tracking-[0.16em]"
      />
      <GoldFlourish className="mx-auto mt-3 h-4 w-32" />
      <p className="mt-5 flex items-start justify-center gap-2 text-[14px] leading-6 text-[#4a433e]">
        <MapPin size={16} className="mt-1 shrink-0 text-[#9f7e7e]" />
        <span>
          <Field invitation={kit.invitation} onChange={kit.onChange} id="venue" fallback={kit.invitation.venue} className="text-[15px]" />
          <Field invitation={kit.invitation} onChange={kit.onChange} id="address" fallback={kit.invitation.address} className="text-[13px] text-[#6a625c]" />
        </span>
      </p>
      <a
        href={mapHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fam-ivory-btn mt-6 inline-flex min-h-12 w-full max-w-[320px] items-center justify-center rounded-full bg-[#9f7e7e] px-6 text-[11px] uppercase tracking-[0.16em] text-white"
      >
        {kit.labels.map}
      </a>
    </Reveal>
  );
}

function DressCodeSection({
  kit,
  swatches,
  instant,
}: {
  kit: LayoutKit;
  swatches: string[];
  instant: boolean;
}) {
  return (
    <Reveal instant={instant} className="px-8 py-8 text-center">
      <p className="font-mauve text-[18px] uppercase tracking-[0.16em]">{kit.labels.dressCode}</p>
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="dressCode"
        fallback={kit.invitation.dressCode || kit.labels.dressHint}
        className="mt-3 text-[13px] leading-6 text-[#5a534e]"
        multiline
      />
      <div className="mt-5 flex justify-center gap-3">
        {swatches.map((color) => (
          <span key={color} className="h-8 w-8 rounded-full border border-[#d8ccc4]" style={{ background: color }} />
        ))}
      </div>
    </Reveal>
  );
}

function RSVPSection({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, labels, variant, rsvp, setRsvp, rsvpName, setRsvpName, rsvpDone, setRsvpDone, onReload } = kit;
  const [drink, setDrink] = useState(fieldValue(invitation, "drink1", kit.locale === "ru" ? "Вино (белое / красное)" : "Вино"));
  const [wish, setWish] = useState("");
  const drinks = [
    fieldValue(invitation, "drink1", kit.locale === "ru" ? "Вино (белое / красное)" : "Вино (ак / кызыл)"),
    fieldValue(invitation, "drink2", kit.locale === "ru" ? "Шампанское" : "Шампанское"),
    fieldValue(invitation, "drink3", kit.locale === "ru" ? "Без алкоголя" : "Алкоголсуз"),
  ];

  return (
    <section className="px-8 py-8">
      <Field
        invitation={invitation}
        onChange={onChange}
        id="drinksTitle"
        fallback={kit.locale === "ru" ? "НАПИТКИ" : "СУУСУНДУКТАР"}
        className="font-mauve text-center text-[20px] uppercase tracking-[0.16em]"
      />
      <Field
        invitation={invitation}
        onChange={onChange}
        id="drinksHint"
        fallback={kit.locale === "ru" ? "Что бы вы предпочли?" : "Эмне ичүүнү каалайсыз?"}
        className="mt-2 text-center text-[13px] text-[#6a625c]"
      />
      {variant !== "guest" ? (
        <div className="mt-5 space-y-3 text-sm text-[#6a625c]">
          {drinks.map((label) => (
            <p key={label} className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full border border-[#c8b2aa]" />
              {label}
            </p>
          ))}
          <p className="pt-4 text-center">{labels.rsvpHint}</p>
        </div>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rsvpName.trim()) return;
            addRsvp(invitation.id, rsvpName.trim(), rsvp, rsvp === "maybe" ? 1 : 0);
            if (wish.trim()) addWish(invitation.id, rsvpName.trim(), `${wish.trim()}\n${drink}`);
            setRsvpDone(true);
            onReload?.();
          }}
        >
          <input
            required
            value={rsvpName}
            onChange={(e) => setRsvpName(e.target.value)}
            placeholder={labels.yourName}
            className="h-12 w-full rounded-[12px] border border-[#e4d9d2] bg-white px-4 text-sm outline-none"
          />
          <div className="space-y-2">
            {(
              [
                ["yes", fieldValue(invitation, "rsvpYes", labels.rsvpYes)],
                ["no", fieldValue(invitation, "rsvpNo", labels.rsvpNo)],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRsvp(key)}
                className="flex w-full items-center gap-3 text-left text-sm"
              >
                <span className={`h-4 w-4 rounded-full border ${rsvp === key ? "border-[#9f7e7e] bg-[#9f7e7e]" : "border-[#c8b2aa]"}`} />
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            {drinks.map((label) => (
              <button key={label} type="button" onClick={() => setDrink(label)} className="flex w-full items-center gap-3 text-left text-sm">
                <span className={`h-4 w-4 rounded-full border ${drink === label ? "border-[#9f7e7e] bg-[#9f7e7e]" : "border-[#c8b2aa]"}`} />
                {label}
              </button>
            ))}
          </div>
          <Field
            invitation={invitation}
            onChange={onChange}
            id="wishesTitle"
            fallback={kit.locale === "ru" ? "ВАШИ ПОЖЕЛАНИЯ" : "КААЛООЛОРУҢУЗ"}
            className="font-mauve pt-4 text-center text-[18px] uppercase tracking-[0.14em]"
          />
          <p className="text-center text-[13px] text-[#6a625c]">
            {fieldValue(invitation, "wishesHint", kit.locale === "ru" ? "Напишите несколько тёплых слов" : "Бир нече жылуу сөз жазыңыз")}
          </p>
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            rows={4}
            placeholder={kit.locale === "ru" ? "Введите текст" : "Текст жазыңыз"}
            className="w-full rounded-[12px] border border-[#e4d9d2] bg-[#faf6f2] px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            className="fam-ivory-btn flex min-h-12 w-full items-center justify-center rounded-full bg-[#9f7e7e] text-[11px] uppercase tracking-[0.16em] text-white"
          >
            {fieldValue(invitation, "rsvpSend", labels.rsvpSend)}
          </button>
          {rsvpDone ? <p className="text-center text-sm text-[#6a625c]">{labels.rsvpThanks}</p> : null}
        </form>
      )}
    </section>
  );
}

function ContactsSection({ kit, instant }: { kit: LayoutKit; instant: boolean }) {
  return (
    <Reveal instant={instant} className="px-8 py-8 text-center">
      <p className="font-mauve text-[16px] uppercase tracking-[0.16em]">{kit.labels.phoneCta}</p>
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="hosts"
        fallback={kit.invitation.hosts}
        className="mt-3 text-[15px] leading-7"
      />
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="phoneA"
        fallback={fieldValue(kit.invitation, "phoneA", "")}
        className="text-[14px] text-[#6a625c]"
      />
    </Reveal>
  );
}

function FooterSection({ kit, mapQuery }: { kit: LayoutKit; mapQuery: string }) {
  return (
    <footer className="relative overflow-hidden px-6 pb-16 pt-4 text-center">
      <MauveCornerBloom className="pointer-events-none absolute -bottom-8 -left-10 h-36 w-40 rotate-180" />
      <p className="font-ivory-script relative text-[28px] text-[#9f7e7e]">{kit.labels.withLove}</p>
      <iframe title={kit.labels.map} src={mapsEmbedUrl(mapQuery)} className="relative mt-6 h-[140px] w-full rounded-[20px] border-0" loading="lazy" />
    </footer>
  );
}
