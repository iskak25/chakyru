"use client";

import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, monthLabel, pad, programItems } from "./shared";
import { HeartRule } from "./Ornaments";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

export function ElegantFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, count, mapHref, mapQuery, event } = kit;
  const instant = !!onChange;
  const items = programItems(kit);

  return (
    <div className="fam-ele overflow-x-hidden bg-[#f7f1e8] text-[#3a2c20]">
      <header className="px-8 pb-2 pt-16 text-center">
        <p className="text-[10px] uppercase tracking-[0.38em] text-[#8b5e34]">{labels.friends}</p>
        <HeartRule className="py-6 text-[#8b5e34]" />
        <h1 className="font-ele-script max-w-[320px] break-words text-[clamp(34px,11vw,48px)] leading-[1.1] text-[#4a3424]">
          <CanvasText
            value={coupleNames(invitation, a, b, " и ")}
            placeholder={`${a} и ${b}`}
            onChange={onChange ? (v) => onChange({ names: v }) : undefined}
            className="bg-transparent"
            multiline
          />
        </h1>
        <p className="mt-6 text-[11px] uppercase tracking-[0.28em]">{labels.weInvite}</p>
      </header>

      <Reveal instant={instant} className="px-10 pt-4">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="text-center text-[15px] leading-8 text-[#5a4a3a]"
          multiline
        />
      </Reveal>

      <Reveal instant={instant} className="mt-12 px-5">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[360px]" imgClass="h-full w-full object-cover" />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-16 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em]">{labels.dateOfEvent}</p>
        <p className="font-serif mt-4 text-[22px] tracking-[0.14em]">
          {pad(event.getDate())} {monthLabel(kit).toUpperCase()} {event.getFullYear()}
        </p>
        <p className="mt-2 text-[13px] tracking-[0.18em]">{invitation.time || "17:00"}</p>
        <HeartRule className="py-8 text-[#8b5e34]" />
        <p className="text-[10px] uppercase tracking-[0.32em]">{labels.location}</p>
        <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="font-serif mt-3 text-[26px] italic leading-tight" />
        <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="mt-2 text-[13px] leading-6 text-[#6a5a4a]" />
      </Reveal>

      <Reveal instant={instant} className="grid grid-cols-3 gap-4 px-5 pb-14 text-center">
        {items.slice(0, 3).map(([time, title]) => (
          <div key={title} className="min-w-0">
            <p className="font-serif text-[18px]">{time}</p>
            <p className="mt-2 text-[10px] uppercase leading-4 tracking-[0.1em] text-[#6a5a4a]">{title}</p>
          </div>
        ))}
      </Reveal>

      <Reveal instant={instant} className="flex items-end justify-center gap-2 px-5 pb-14">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="h-[148px] w-[31%]" imgClass="h-full w-full object-cover" />
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c1" src={photos[1]} className="h-[220px] w-[36%]" imgClass="h-full w-full object-cover" />
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c2" src={photos[2]} className="h-[148px] w-[31%]" imgClass="h-full w-full object-cover" />
      </Reveal>

      {count ? (
        <Reveal instant={instant} className="px-8 pb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.24em]">{labels.countdown}</p>
          <p className="font-serif mt-4 text-[28px] tracking-[0.1em]">
            {pad(count.d)} : {pad(count.h)} : {pad(count.m)} : {pad(count.s)}
          </p>
        </Reveal>
      ) : null}

      {invitation.dressCode || onChange ? (
        <Reveal instant={instant} className="px-10 pb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em]">{labels.dressCode}</p>
          <Field invitation={invitation} onChange={onChange} id="dressCode" fallback={invitation.dressCode || labels.dressHint} className="mt-3 text-[14px] leading-7 text-[#5a4a3a]" multiline />
        </Reveal>
      ) : null}

      <Reveal instant={instant} className="px-6 pb-12">
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="h-[160px] w-full border-0" loading="lazy" />
        <a href={mapHref} className="mt-4 flex min-h-12 items-center justify-center border border-[#3a2c20] text-[11px] uppercase tracking-[0.18em]">
          {labels.map}
        </a>
      </Reveal>

      <WishesCard kit={kit} tone="elegant" />

      <section className="px-8 pb-8">
        <p className="mb-6 text-center text-[10px] uppercase tracking-[0.28em]">{labels.rsvpHint}</p>
        <RsvpForm kit={kit} tone="elegant" />
      </section>

      <footer className="px-8 pb-16 text-center">
        <HeartRule className="pb-6 text-[#8b5e34]" />
        <p className="font-ele-script text-[28px]">{labels.withLove}</p>
      </footer>
    </div>
  );
}
