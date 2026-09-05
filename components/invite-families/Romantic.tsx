"use client";

import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, monthLabel, pad, programItems } from "./shared";
import { WaveEdge } from "./Ornaments";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

export function RomanticFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, count, mapHref, mapQuery, event } = kit;
  const instant = !!onChange;
  const items = programItems(kit);

  return (
    <div className="fam-rom overflow-x-hidden bg-[#fbf7f2] text-[#3f3a36]">
      <section className="relative">
        <div className="fam-rom-arch overflow-hidden">
          <SlotPhoto
            invitation={invitation}
            onChange={onChange}
            slot="hero"
            src={heroPhoto}
            className="h-[min(70svh,540px)] min-h-[380px]"
            imgClass="h-full w-full object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-10 text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
          <p className="text-[10px] uppercase tracking-[0.28em]">{labels.inviteTitle}</p>
          <h1 className="font-rom pointer-events-auto mx-auto mt-2 max-w-[320px] break-words text-[clamp(32px,10vw,44px)] leading-tight">
            <CanvasText
              value={coupleNames(invitation, a, b, " ♥ ")}
              placeholder={`${a} ♥ ${b}`}
              onChange={onChange ? (v) => onChange({ names: v }) : undefined}
              className="bg-transparent text-white"
              multiline
            />
          </h1>
        </div>
      </section>

      <div className="-mt-8">
        <WaveEdge fill="#7d8a6d" />
        <Reveal instant={instant} className="bg-[#7d8a6d] px-8 pb-12 pt-2 text-center text-white">
          <p className="font-rom text-[32px]">{labels.dearGuests}</p>
          <Field
            invitation={invitation}
            onChange={onChange}
            id="message"
            fallback={invitation.message || kit.fallback}
            className="mt-4 text-[15px] leading-8 text-white/92"
            multiline
          />
        </Reveal>
        <WaveEdge fill="#7d8a6d" flip />
      </div>

      <Reveal instant={instant} className="px-6 py-12 text-center">
        <p className="text-[28px] font-medium tracking-wide">
          {pad(event.getDate())}.{pad(event.getMonth() + 1)}.{event.getFullYear()}
        </p>
        <p className="mt-1 text-sm text-[#6d7a5c]">{monthLabel(kit)} · {invitation.time || "17:00"}</p>
        {count ? (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              [pad(count.d), labels.days],
              [pad(count.h), labels.hours],
              [pad(count.m), labels.mins],
              [pad(count.s), labels.secs],
            ].map(([n, lab]) => (
              <div key={String(lab)} className="w-[64px] rounded-[16px] bg-[#1f1c1a] py-3 text-white">
                <p className="text-[18px] font-semibold">{n}</p>
                <p className="text-[8px] uppercase tracking-[0.12em] text-white/60">{lab}</p>
              </div>
            ))}
          </div>
        ) : null}
      </Reveal>

      <Reveal instant={instant} className="fam-rom-wave-photo overflow-hidden">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="h-[240px]" imgClass="h-full w-full object-cover" />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-12">
        <p className="font-rom text-center text-[34px]">{labels.program}</p>
        <ul className="mt-8 space-y-6">
          {items.map(([time, title], i) => (
            <li key={title} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-sm text-[#6d7a5c]">{time}</span>
              <span className="h-px min-w-4 flex-1 bg-[#6d7a5c]/25" />
              <span className="text-right text-sm">{title}</span>
              {i === 0 ? <span className="text-[#6d7a5c]">♡</span> : null}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal instant={instant} className="grid grid-cols-2 gap-3 px-6 pb-2">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c1" src={photos[1]} className="h-[180px] overflow-hidden rounded-[28px]" imgClass="h-full w-full object-cover" />
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c2" src={photos[2]} className="mt-10 h-[180px] overflow-hidden rounded-[28px]" imgClass="h-full w-full object-cover" />
      </Reveal>

      {invitation.dressCode || onChange ? (
        <Reveal instant={instant} className="px-8 py-8 text-center">
          <p className="font-rom text-[28px]">{labels.dressCode}</p>
          <Field invitation={invitation} onChange={onChange} id="dressCode" fallback={invitation.dressCode || labels.dressHint} className="mt-2 text-[14px] leading-7 text-[#5a5348]" multiline />
        </Reveal>
      ) : null}

      <div className="mt-6">
        <WaveEdge fill="#7d8a6d" />
        <Reveal instant={instant} className="bg-[#7d8a6d] px-8 pb-12 pt-2 text-center text-white">
          <p className="font-rom text-[32px]">{labels.location}</p>
          <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="mt-3 text-[18px]" />
          <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="mt-1 text-sm text-white/80" />
          <a href={mapHref} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 text-[12px] text-[#4a5340]">
            {labels.map}
          </a>
        </Reveal>
        <WaveEdge fill="#7d8a6d" flip />
      </div>

      <div className="px-5 py-6">
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="h-[150px] w-full rounded-[24px] border-0" loading="lazy" />
      </div>

      <WishesCard kit={kit} tone="romantic" />

      <section className="px-8 pb-16 pt-2">
        <p className="font-rom mb-5 text-center text-[30px]">{labels.rsvpHint}</p>
        <RsvpForm kit={kit} tone="romantic" />
      </section>
    </div>
  );
}
