"use client";

import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { mapsEmbedUrl, pad, programItems } from "./shared";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

export function ModernFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, count, mapHref, mapQuery, event } = kit;
  const instant = !!onChange;
  const items = programItems(kit);

  return (
    <div className="fam-mod overflow-x-hidden bg-white text-black">
      <section className="grid min-h-[86svh] grid-rows-[auto_1fr]">
        <div className="flex items-start justify-between gap-3 px-5 pt-8">
          <p className="text-[10px] uppercase tracking-[0.22em]">{labels.saveTheDate}</p>
          <p className="text-[10px] uppercase tracking-[0.22em]">{event.getFullYear()}</p>
        </div>
        <div className="flex flex-col justify-end px-5 pb-8">
          <h1 className="font-mod break-words text-[clamp(40px,16vw,72px)] uppercase leading-[0.82] tracking-[-0.06em]">
            <CanvasText
              value={a}
              placeholder={a}
              onChange={onChange ? (v) => onChange({ names: `${v} & ${b}` }) : undefined}
              className="bg-transparent"
            />
          </h1>
          <p className="font-mod my-1 text-[20px] tracking-[0.45em] text-black/35">/</p>
          <h1 className="font-mod break-words text-[clamp(40px,16vw,72px)] uppercase leading-[0.82] tracking-[-0.06em]">
            <CanvasText
              value={b}
              placeholder={b}
              onChange={onChange ? (v) => onChange({ names: `${a} & ${v}` }) : undefined}
              className="bg-transparent"
            />
          </h1>
        </div>
      </section>

      <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[52vh] min-h-[260px]" imgClass="h-full w-full object-cover" />

      <Reveal instant={instant} className="grid grid-cols-2 gap-px bg-black">
        <div className="min-w-0 bg-white px-5 py-8">
          <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">{labels.dateOfEvent}</p>
          <p className="font-mod mt-3 text-[clamp(28px,10vw,42px)] leading-none">{pad(event.getDate())}.{pad(event.getMonth() + 1)}</p>
          <p className="mt-2 text-sm">{invitation.time || "17:00"}</p>
        </div>
        <div className="min-w-0 bg-white px-5 py-8">
          <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">{labels.location}</p>
          <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="mt-3 text-[17px] leading-6" />
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-5 py-12">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="text-[17px] leading-8"
          multiline
        />
      </Reveal>

      <Reveal instant={instant} className="grid grid-cols-2 gap-2 px-5 pb-10">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="col-span-2 h-[220px]" imgClass="h-full w-full object-cover" />
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c1" src={photos[1]} className="h-[160px]" imgClass="h-full w-full object-cover" />
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c2" src={photos[2]} className="h-[160px]" imgClass="h-full w-full object-cover" />
      </Reveal>

      <Reveal instant={instant} className="bg-black px-5 py-12 text-white">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">{labels.program}</p>
        <ul className="mt-6">
          {items.map(([time, title]) => (
            <li key={title} className="flex items-center justify-between gap-3 border-t border-white/15 py-4">
              <span className="font-mod shrink-0 text-[20px]">{time}</span>
              <span className="text-right text-[11px] uppercase tracking-[0.12em]">{title}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      {count ? (
        <div className="grid grid-cols-4 text-center">
          {[
            [pad(count.d), labels.days],
            [pad(count.h), labels.hours],
            [pad(count.m), labels.mins],
            [pad(count.s), labels.secs],
          ].map(([n, lab]) => (
            <div key={String(lab)} className="border-t border-black py-5">
              <p className="font-mod text-[24px]">{n}</p>
              <p className="text-[9px] uppercase tracking-[0.14em] text-black/40">{lab}</p>
            </div>
          ))}
        </div>
      ) : null}

      {invitation.dressCode || onChange ? (
        <Reveal instant={instant} className="px-5 py-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">{labels.dressCode}</p>
          <Field invitation={invitation} onChange={onChange} id="dressCode" fallback={invitation.dressCode || labels.dressHint} className="mt-2 text-[15px] leading-7" multiline />
        </Reveal>
      ) : null}

      <Reveal instant={instant} className="px-5 py-10">
        <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="text-sm leading-6" />
        <a href={mapHref} className="mt-5 flex min-h-14 items-center justify-center bg-black text-[12px] uppercase tracking-[0.16em] text-white">
          {labels.map}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-3 h-[140px] w-full border-0" loading="lazy" />
      </Reveal>

      <WishesCard kit={kit} tone="modern" />

      <section className="px-5 pb-16">
        <p className="mb-5 text-[10px] uppercase tracking-[0.2em]">{labels.rsvpHint}</p>
        <RsvpForm kit={kit} tone="modern" />
      </section>
    </div>
  );
}
