"use client";

import { MapPin } from "lucide-react";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto, fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, pad, programItems } from "./shared";
import { KyalRule, MountainSilhouette } from "./Ornaments";
import { IconCake, IconGlasses, IconMusic, IconPlate, IconRings } from "./Icons";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

const PROGRAM_ICONS = [IconRings, IconGlasses, IconPlate, IconMusic, IconCake];

function dressSwatches(invitation: LayoutKit["invitation"]) {
  const fromCopy = [0, 1, 2, 3, 4]
    .map((i) => invitation.copy?.[`dc${i}`])
    .filter((v): v is string => Boolean(v));
  return fromCopy.length ? fromCopy : ["#efe6d3", "#c9b389", "#6b7d54", "#7a3a3a", "#2b2620"];
}

export function KyrgyzFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, count, mapHref, mapQuery, event, venuePhoto } = kit;
  const instant = !!onChange;
  const items = programItems(kit);
  const swatches = dressSwatches(invitation);

  return (
    <div className="fam-kyrgyz overflow-x-hidden bg-[#f6efe2] text-[#3d2f22]">
      <HeroSection kit={kit} a={a} b={b} event={event} instant={instant} />
      <CountdownSection kit={kit} count={count} instant={instant} />
      <Reveal instant={instant} className="px-6 pb-2 text-center">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="mx-auto max-w-[320px] text-[14px] leading-7 text-[#5a4c3a]"
          multiline
        />
      </Reveal>

      <Reveal instant={instant} className="mt-6 px-0 pb-2">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[280px]" imgClass="h-full w-full object-cover" />
        <div className="mt-2 grid grid-cols-2 gap-2 px-5">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="h-[150px]" imgClass="h-full w-full object-cover" />
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c1" src={photos[1]} className="h-[150px]" imgClass="h-full w-full object-cover" />
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="program"
          fallback={labels.program}
          className="font-tra-title text-center text-[20px] uppercase tracking-[0.18em] text-[#8a6a35]"
        />
        <KyalRule className="mt-3 text-[#b8925a]" />
        <ul className="relative mt-8 space-y-7 pl-2">
          <span className="absolute bottom-3 left-[21px] top-3 w-px bg-[#b8925a]/30" />
          {items.map(([time, title], i) => {
            const Icon = PROGRAM_ICONS[i % PROGRAM_ICONS.length]!;
            return (
              <li key={`${time}-${title}`} className="relative grid grid-cols-[42px_1fr] items-center gap-4">
                <span className="relative z-[1] flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#2f4a3a] text-[#f0d9a8]">
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

      <Reveal instant={instant} className="px-8 py-8 text-center">
        <p className="font-tra-title text-[18px] uppercase tracking-[0.16em] text-[#8a6a35]">{labels.location}</p>
        <KyalRule className="mt-3 text-[#b8925a]" />
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="venue"
          src={venuePhoto || photos[2] || heroPhoto}
          className="mt-6 h-[180px] w-full"
          imgClass="h-full w-full object-cover"
        />
        <p className="mt-5 flex items-start justify-center gap-2 text-[14px] leading-6 text-[#5a4c3a]">
          <MapPin size={16} className="mt-1 shrink-0 text-[#b8925a]" />
          <span>
            <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="text-[15px]" />
            <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="text-[13px] text-[#8a7a64]" />
          </span>
        </p>

        <a
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-12 w-full max-w-[320px] items-center justify-center rounded-[4px] bg-[#2f4a3a] px-6 text-[11px] uppercase tracking-[0.16em] text-[#fdf8ee]"
        >
          {labels.map}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-4 h-[150px] w-full rounded-[4px] border-0" loading="lazy" />
      </Reveal>

      {invitation.dressCode || onChange ? (
        <Reveal instant={instant} className="px-8 py-8 text-center">
          <p className="font-tra-title text-[18px] uppercase tracking-[0.16em] text-[#8a6a35]">{labels.dressCode}</p>
          <Field
            invitation={invitation}
            onChange={onChange}
            id="dressCode"
            fallback={invitation.dressCode || labels.dressHint}
            className="mt-3 text-[13px] leading-6 text-[#5a4c3a]"
            multiline
          />
          <div className="mt-5 flex justify-center gap-3">
            {swatches.map((color) => (
              <span key={color} className="h-8 w-8 rounded-full border border-[#b8925a]/40" style={{ background: color }} />
            ))}
          </div>
        </Reveal>
      ) : null}

      <WishesCard kit={kit} tone="kyrgyz" />

      <section className="px-8 pb-10">
        <p className="mb-5 text-center text-[11px] uppercase tracking-[0.2em] text-[#8a7a64]">{labels.rsvpHint}</p>
        <RsvpForm kit={kit} tone="kyrgyz" />
      </section>

      <footer className="relative overflow-hidden px-6 pb-4 pt-2 text-center text-[#f6efe2]">
        <p className="font-tra-script relative text-[26px] text-[#8a6a35]">{labels.withLove}</p>
        <MountainSilhouette className="mx-auto mt-6 h-12 w-full max-w-[340px] text-[#2f4a3a]" />
      </footer>
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
  const { invitation, onChange, labels } = kit;
  return (
    <section className="relative overflow-hidden px-6 pb-4 pt-14 text-center">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a7a64]">{labels.dearGuests}</p>
      <h1 className="font-tra-script mt-4 break-words text-[clamp(32px,10vw,44px)] leading-[1.15] text-[#3d2f22]">
        <CanvasText
          value={coupleNames(invitation, a, b, "\n&\n")}
          placeholder={`${a} & ${b}`}
          onChange={onChange ? (v) => onChange({ names: v }) : undefined}
          className="bg-transparent"
          multiline
        />
      </h1>
      <KyalRule className="mt-5 text-[#b8925a]" />
      <p className="font-tra-title mt-4 text-[16px] tracking-[0.18em] text-[#8a6a35]">
        {pad(event.getDate())} . {pad(event.getMonth() + 1)} . {event.getFullYear()}
      </p>
      <Reveal instant={instant} className="mt-3">
        <p className="mx-auto max-w-[280px] text-[13px] leading-6 text-[#8a7a64]">{invitation.time || "18:00"}</p>
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
  const boxes = [
    [pad(count.d), fieldValue(kit.invitation, "cdDays", kit.labels.days)],
    [pad(count.h), fieldValue(kit.invitation, "cdHours", kit.labels.hours)],
    [pad(count.m), fieldValue(kit.invitation, "cdMins", kit.labels.mins)],
    [pad(count.s), fieldValue(kit.invitation, "cdSecs", kit.labels.secs)],
  ];
  return (
    <Reveal instant={instant} className="px-5 pb-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#8a7a64]">
        {fieldValue(kit.invitation, "untilTitle", kit.labels.untilWedding)}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {boxes.map(([n, lab]) => (
          <div key={String(lab)} className="rounded-[4px] border border-[#b8925a]/35 bg-[#fffaf3] py-3">
            <p className="font-tra-title text-[22px] leading-none text-[#2f4a3a]">{n}</p>
            <p className="mt-2 text-[8px] uppercase tracking-[0.12em] text-[#8a7a64]">{lab}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
