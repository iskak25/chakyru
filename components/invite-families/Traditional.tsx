"use client";

import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, pad, programItems } from "./shared";
import { TraBand, TraHorn } from "./Ornaments";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

export function TraditionalFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, count, mapHref, mapQuery, event } = kit;
  const instant = !!onChange;
  const items = programItems(kit);

  return (
    <div className="fam-tra overflow-x-hidden bg-[#f4efe4] text-[#3d2a18]">
      <div className="fam-tra-border mx-3 mt-3 px-5 pb-10 pt-8">
        <TraBand />
        <p className="font-tra-script mt-4 text-center text-[34px] text-[#8a6230]">{labels.ticket}</p>
        <TraHorn className="mx-auto mt-2 h-6 w-16 text-[#b08948]" />
        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.28em]">{labels.weInvite}</p>
        <h1 className="font-tra-script mt-5 break-words text-center text-[clamp(32px,10vw,42px)] leading-[1.2] text-[#6a441c]">
          <CanvasText
            value={coupleNames(invitation, a, b, "\n&\n")}
            placeholder={`${a} & ${b}`}
            onChange={onChange ? (v) => onChange({ names: v }) : undefined}
            className="bg-transparent"
            multiline
          />
        </h1>
        <div className="mt-8 flex items-center justify-center gap-2 text-[#8a6230] sm:gap-3">
          <span className="h-px w-8 bg-[#b08948]/50" />
          <p className="font-tra-title text-[22px] tracking-[0.16em]">{pad(event.getDate())}</p>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b08948] text-[13px]">
            {pad(event.getMonth() + 1)}
          </span>
          <p className="font-tra-title text-[22px] tracking-[0.16em]">{String(event.getFullYear()).slice(2)}</p>
          <span className="h-px w-8 bg-[#b08948]/50" />
        </div>
        <p className="mt-3 text-center text-[15px] tracking-[0.2em]">{invitation.time || "17:00"}</p>
        <TraBand />
      </div>

      <Reveal instant={instant} className="px-6 py-8">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[300px]" imgClass="h-full w-full object-cover" />
      </Reveal>

      <Reveal instant={instant} className="px-8 pb-10 text-center">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="text-[15px] leading-8"
          multiline
        />
      </Reveal>

      <Reveal instant={instant} className="mx-5 mb-8 bg-[#efe4cf] px-5 py-8">
        <p className="font-tra-title text-center text-[11px] uppercase tracking-[0.24em] text-[#8a6230]">{labels.program}</p>
        <ul className="mt-6 space-y-4">
          {items.map(([time, title]) => (
            <li key={title} className="grid grid-cols-[72px_1fr] items-center gap-3 text-sm">
              <span className="border border-[#b08948]/40 py-1 text-center text-[12px]">{time}</span>
              <span>{title}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal instant={instant} className="grid grid-cols-2 gap-2 px-5 pb-8">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="h-[160px]" imgClass="h-full w-full object-cover" />
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c1" src={photos[1]} className="h-[160px]" imgClass="h-full w-full object-cover" />
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c2" src={photos[2]} className="col-span-2 h-[140px]" imgClass="h-full w-full object-cover" />
      </Reveal>

      {count ? (
        <p className="px-6 pb-6 text-center text-[13px] tracking-[0.14em] text-[#8a6230]">
          {labels.countdown}: {pad(count.d)} {labels.days} {pad(count.h)}:{pad(count.m)}:{pad(count.s)}
        </p>
      ) : null}

      {invitation.dressCode || onChange ? (
        <Reveal instant={instant} className="px-8 pb-8 text-center">
          <p className="font-tra-title text-[20px] text-[#8a6230]">{labels.dressCode}</p>
          <Field invitation={invitation} onChange={onChange} id="dressCode" fallback={invitation.dressCode || labels.dressHint} className="mt-2 text-[14px] leading-7" multiline />
        </Reveal>
      ) : null}

      <Reveal instant={instant} className="px-6 pb-8 text-center">
        <p className="font-tra-script text-[30px] text-[#8a6230]">{labels.location}</p>
        <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="font-tra-title mt-2 text-[20px]" />
        <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="mt-1 text-sm" />
        <a href={mapHref} className="mt-5 inline-flex min-h-12 items-center justify-center bg-[#8a6230] px-7 text-[11px] uppercase tracking-[0.16em] text-[#fff8ec]">
          {labels.map}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-4 h-[150px] w-full border-0" loading="lazy" />
      </Reveal>

      <WishesCard kit={kit} tone="traditional" />

      <section className="px-8 pb-16">
        <p className="mb-5 text-center text-[11px] uppercase tracking-[0.2em]">{labels.rsvpHint}</p>
        <RsvpForm kit={kit} tone="traditional" />
      </section>
    </div>
  );
}
