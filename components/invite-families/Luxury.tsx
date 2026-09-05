"use client";

import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, monthLabel, pad, programItems } from "./shared";
import { GoldFiligree } from "./Ornaments";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

export function LuxuryFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, venuePhoto, count, mapHref, mapQuery, event } = kit;
  const instant = !!onChange;
  const items = programItems(kit);

  return (
    <div className="fam-lux overflow-x-hidden bg-[#120e0c] text-[#f3eadc]">
      <section className="relative min-h-[100svh] overflow-hidden">
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="hero"
          src={heroPhoto}
          className="absolute inset-0"
          imgClass="fam-lux-ken h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-[#120e0c]" />
        <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-end px-6 pb-16 text-center">
          <p className="text-[10px] uppercase tracking-[0.46em] text-[#c4a35e]">{labels.inviteTitle}</p>
          <h1 className="font-lux mt-6 max-w-[340px] break-words text-[clamp(34px,11vw,52px)] leading-[0.95] tracking-[-0.03em] text-[#f7efe3]">
            <CanvasText
              value={coupleNames(invitation, a, b)}
              placeholder={`${a} & ${b}`}
              onChange={onChange ? (v) => onChange({ names: v }) : undefined}
              className="bg-transparent"
              multiline
            />
          </h1>
          <GoldFiligree className="mt-7 h-4 w-44 text-[#c4a35e]" />
          <p className="font-lux mt-5 text-[26px] tracking-[0.22em] text-[#c4a35e]">
            {pad(event.getDate())}.{pad(event.getMonth() + 1)}
            <span className="mx-1 text-[15px]">·</span>
            {event.getFullYear()}
          </p>
        </div>
      </section>

      <Reveal instant={instant} className="px-8 py-16 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#c4a35e]">{labels.dearGuests}</p>
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="mx-auto mt-6 max-w-[290px] text-[15px] leading-8 text-[#e8dcc4]/85"
          multiline
        />
      </Reveal>

      <Reveal instant={instant} className="px-6 pb-12">
        <div className="fam-lux-silk border border-[#c4a35e]/30 px-6 py-11 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c4a35e]">{labels.dateOfEvent}</p>
          <p className="font-lux mt-5 text-[64px] leading-none">{pad(event.getDate())}</p>
          <p className="mt-2 text-[12px] uppercase tracking-[0.24em]">{monthLabel(kit)}</p>
          <p className="mt-5 text-[13px] tracking-[0.22em]">{invitation.time || "17:00"}</p>
        </div>
      </Reveal>

      <Reveal instant={instant} className="grid grid-cols-[1.15fr_0.85fr] gap-2 px-6 pb-12">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="h-[300px]" imgClass="h-full w-full object-cover" />
        <div className="flex flex-col gap-2">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c1" src={photos[1]} className="h-[146px]" imgClass="h-full w-full object-cover" />
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c2" src={photos[2]} className="h-[146px]" imgClass="h-full w-full object-cover" />
        </div>
      </Reveal>

      <Reveal instant={instant} className="fam-lux-silk px-8 py-14">
        <p className="text-center text-[10px] uppercase tracking-[0.32em] text-[#c4a35e]">{labels.program}</p>
        <ol className="mt-8 space-y-5">
          {items.map(([time, title]) => (
            <li key={title} className="flex items-baseline justify-between gap-4 border-b border-[#c4a35e]/15 pb-4">
              <span className="font-lux shrink-0 text-[22px] text-[#c4a35e]">{time}</span>
              <span className="text-right text-[13px] tracking-[0.08em]">{title}</span>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal instant={instant} className="px-6 py-14 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#c4a35e]">{labels.location}</p>
        <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="font-lux mt-4 text-[28px] leading-tight" />
        <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="mt-2 text-[13px] text-[#e8dcc4]/70" />
        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center justify-center border border-[#c4a35e] px-8 text-[11px] uppercase tracking-[0.2em] text-[#c4a35e]">
          {labels.map}
        </a>
        <div className="mt-6 overflow-hidden opacity-80">
          <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="h-[150px] w-full border-0 grayscale" loading="lazy" />
        </div>
      </Reveal>

      {invitation.dressCode || onChange ? (
        <Reveal instant={instant} className="px-8 pb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c4a35e]">{labels.dressCode}</p>
          <Field invitation={invitation} onChange={onChange} id="dressCode" fallback={invitation.dressCode || labels.dressHint} className="mt-3 text-[14px] leading-7 text-[#e8dcc4]/80" multiline />
        </Reveal>
      ) : null}

      {count ? (
        <div className="grid grid-cols-4 gap-px bg-[#c4a35e]/20 text-center">
          {[
            [pad(count.d), labels.days],
            [pad(count.h), labels.hours],
            [pad(count.m), labels.mins],
            [pad(count.s), labels.secs],
          ].map(([n, lab]) => (
            <div key={String(lab)} className="bg-[#120e0c] py-6">
              <p className="font-lux text-[26px] text-[#c4a35e]">{n}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#f3eadc]/50">{lab}</p>
            </div>
          ))}
        </div>
      ) : null}

      <WishesCard kit={kit} tone="luxury" />

      <section className="px-8 py-10">
        <p className="mb-6 text-center text-[10px] uppercase tracking-[0.32em] text-[#c4a35e]">{labels.rsvpHint}</p>
        <RsvpForm kit={kit} tone="luxury" />
      </section>

      <SlotPhoto invitation={invitation} onChange={onChange} slot="venue" src={venuePhoto} className="h-[220px]" imgClass="h-full w-full object-cover opacity-70" />
      <footer className="px-6 py-12 text-center">
        <p className="font-lux text-[22px] text-[#c4a35e]">{labels.withLove}</p>
        <p className="mt-2 text-[12px] tracking-[0.16em]">{a} · {b}</p>
      </footer>
    </div>
  );
}
