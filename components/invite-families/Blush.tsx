"use client";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, pad, programItems } from "./shared";
import { BlushCornerBloom } from "./florals";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

function dressTones(invitation: LayoutKit["invitation"]) {
  const fromCopy = [0, 1, 2]
    .map((i) => invitation.copy?.[`dc${i}`])
    .filter((v): v is string => Boolean(v));
  return fromCopy.length ? fromCopy : ["#f6ece7", "#e2b8ae", "#c98a86"];
}

export function BlushFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, event, mapHref, mapQuery, venuePhoto } = kit;
  const instant = !!onChange;
  const items = programItems(kit);
  const tones = dressTones(invitation);

  return (
    <div className="overflow-x-hidden bg-[#fdf6f2] text-[#3a2c28]">
      <Reveal instant={instant} className="relative px-6 pb-4 pt-12 text-center">
        <BlushCornerBloom className="pointer-events-none absolute -right-4 -top-2 h-32 w-36 text-[#c98a86]" />
        <p className="relative text-[10px] uppercase tracking-[0.22em] text-[#a5877f]">{labels.dearGuests}</p>
        <h1 className="font-ele-script mt-4 break-words text-[clamp(32px,10vw,44px)] leading-[1.15] text-[#3a2c28]">
          <CanvasText
            value={coupleNames(invitation, a, b, "\n&\n")}
            placeholder={`${a} & ${b}`}
            onChange={onChange ? (v) => onChange({ names: v }) : undefined}
            className="bg-transparent"
            multiline
          />
        </h1>
        <p className="font-tra-title mt-4 text-[16px] tracking-[0.16em] text-[#c98a86]">
          {pad(event.getDate())}.{pad(event.getMonth() + 1)}.{event.getFullYear()}
        </p>
      </Reveal>

      <Reveal instant={instant} className="px-0 py-8">
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="hero"
          src={heroPhoto}
          className="h-[300px]"
          imgClass="h-full w-full object-cover"
        />
      </Reveal>

      <Reveal instant={instant} className="px-6 py-8 text-center">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="mx-auto max-w-[300px] text-[13px] leading-7 text-[#3a2c28]"
          multiline
        />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10">
        <p className="font-tra-title text-center text-[18px] uppercase tracking-[0.16em] text-[#c98a86]">
          {labels.program}
        </p>
        <ul className="mt-6 space-y-3 text-[12px]">
          {items.map(([time, title]) => (
            <li key={`${time}-${title}`} className="flex items-start gap-3">
              <span className="min-w-12 font-medium text-[#a5877f]">{time}</span>
              <span className="text-[#3a2c28]">{title}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="font-tra-title text-[18px] uppercase tracking-[0.16em] text-[#c98a86]">{labels.location}</p>
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="venue"
          src={venuePhoto || photos[2] || heroPhoto}
          className="mt-6 h-[180px] w-full"
          imgClass="h-full w-full object-cover"
        />
        <p className="mt-4 text-[12px] text-[#3a2c28]">
          <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="text-[13px]" />
          <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="text-[11px] text-[#a5877f]" />
        </p>
        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full border border-[#c98a86] px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-[#c98a86]">
          {labels.map}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-4 h-[140px] w-full border-0" loading="lazy" />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="font-tra-title text-[18px] uppercase tracking-[0.16em] text-[#c98a86]">{labels.dressCode}</p>
        <Field
          invitation={invitation}
          onChange={onChange}
          id="dressCode"
          fallback={invitation.dressCode || (kit.locale === "ru" ? "Молочный, айвори, бежевый" : kit.locale === "ky" ? "Сүт түс, айвори, күрөң" : labels.dressHint)}
          className="mx-auto mt-3 max-w-[280px] text-[13px] leading-6 text-[#3a2c28]"
          multiline
        />
        <div className="mt-5 flex justify-center gap-3">
          {tones.map((color) => (
            <span key={color} className="h-8 w-8 rounded-full border border-[#c98a86]/40" style={{ background: color }} />
          ))}
        </div>
      </Reveal>

      <WishesCard kit={kit} tone="blush" />

      <section className="px-8 pb-10">
        <RsvpForm kit={kit} tone="blush" />
      </section>

      <footer className="relative overflow-hidden px-6 py-8 text-center text-[#c98a86]">
        <BlushCornerBloom className="pointer-events-none absolute -bottom-6 -left-8 h-28 w-32 rotate-180 text-[#c98a86]" />
        <p className="relative font-ele-script text-[20px]">With love</p>
      </footer>
    </div>
  );
}
