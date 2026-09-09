"use client";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, pad, programItems } from "./shared";
import { IconDressOutline, IconSuitOutline } from "./Icons";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

function dressTones(invitation: LayoutKit["invitation"]) {
  const fromCopy = [0, 1, 2, 3]
    .map((i) => invitation.copy?.[`dc${i}`])
    .filter((v): v is string => Boolean(v));
  return fromCopy.length ? fromCopy : ["#eef2f6", "#c3d2e0", "#5f7a94", "#2c3a48"];
}

export function FrostFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, event, mapHref, mapQuery, venuePhoto } = kit;
  const instant = !!onChange;
  const items = programItems(kit);
  const tones = dressTones(invitation);

  return (
    <div className="overflow-x-hidden bg-[#eef2f6] text-[#2c3a48]">
      <Reveal instant={instant} className="px-6 pb-4 pt-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#7f93a4]">{labels.dearGuests}</p>
        <h1 className="font-tra-script mt-4 break-words text-[clamp(32px,10vw,44px)] leading-[1.15] text-[#2c3a48]">
          <CanvasText
            value={coupleNames(invitation, a, b, "\n&\n")}
            placeholder={`${a} & ${b}`}
            onChange={onChange ? (v) => onChange({ names: v }) : undefined}
            className="bg-transparent"
            multiline
          />
        </h1>
        <p className="font-tra-title mt-4 text-[16px] tracking-[0.16em] text-[#5f7a94]">
          {pad(event.getDate())}.{pad(event.getMonth() + 1)}.{event.getFullYear()}
        </p>
      </Reveal>

      <Reveal instant={instant} className="px-6 py-8">
        <div className="fam-rom-arch h-[300px] overflow-hidden">
          <SlotPhoto
            invitation={invitation}
            onChange={onChange}
            slot="hero"
            src={heroPhoto}
            className="h-full"
            imgClass="h-full w-full object-cover"
          />
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-6 py-8 text-center">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="mx-auto max-w-[300px] text-[13px] leading-7 text-[#2c3a48]"
          multiline
        />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10">
        <div className="mx-auto max-w-[320px] rounded-lg border border-[#5f7a94]/20 bg-white p-6">
          <p className="font-tra-title text-center text-[16px] uppercase tracking-[0.16em] text-[#5f7a94]">
            {labels.program}
          </p>
          <ul className="mt-5 space-y-3 text-[12px]">
            {items.map(([time, title]) => (
              <li key={`${time}-${title}`} className="flex items-start gap-3 text-[#2c3a48]">
                <span className="min-w-12 font-medium">{time}</span>
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="font-tra-title text-[18px] uppercase tracking-[0.16em] text-[#5f7a94]">{labels.dressCode}</p>
        <Field
          invitation={invitation}
          onChange={onChange}
          id="dressCode"
          fallback={invitation.dressCode || labels.dressHint}
          className="mx-auto mt-3 max-w-[280px] text-[13px] leading-6 text-[#2c3a48]"
          multiline
        />
        <div className="mt-5 flex items-center justify-center gap-3">
          {tones.map((color) => (
            <span key={color} className="h-6 w-6 rotate-45 border border-[#5f7a94]/40" style={{ background: color }} />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-6 text-[#5f7a94]">
          <IconDressOutline className="h-9 w-9" />
          <IconSuitOutline className="h-9 w-9" />
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="font-tra-title text-[18px] uppercase tracking-[0.16em] text-[#5f7a94]">{labels.location}</p>
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="venue"
          src={venuePhoto || photos[2] || heroPhoto}
          className="fam-rom-arch mt-6 h-[180px]"
          imgClass="h-full w-full object-cover"
        />
        <p className="mt-4 text-[12px] text-[#2c3a48]">
          <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="text-[13px]" />
          <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="text-[11px] text-[#7f93a4]" />
        </p>
        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-[4px] border border-[#5f7a94] px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-[#5f7a94]">
          {labels.map}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-4 h-[140px] w-full border-0 rounded-[4px]" loading="lazy" />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-8 text-center">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="giftsNote"
          fallback={kit.locale === "ru" ? "Пожалуйста, не дарите цветы — предложите что-то на память" : "Гүл белек кылбаңыз — эстелик кылып башка нерсе тартуулаңыз"}
          className="mx-auto max-w-[280px] text-[12px] leading-6 text-[#2c3a48]"
          multiline
        />
        <a href="#frost-rsvp" className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] text-[#5f7a94] underline underline-offset-4">
          {kit.locale === "ru" ? "Вопросы" : "Суроолор"}
        </a>
      </Reveal>

      <WishesCard kit={kit} tone="frost" />

      <section id="frost-rsvp" className="px-8 pb-10">
        <RsvpForm kit={kit} tone="frost" />
      </section>

      <footer className="px-6 py-8 text-center text-[#5f7a94]">
        <svg viewBox="0 0 100 20" className="mx-auto h-4 w-24" aria-hidden fill="none">
          <path d="M2 10h30M68 10h30M50 3v14M43 10h14M46 6l8 8M54 6l-8 8" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        </svg>
        <p className="mt-3 text-[12px] uppercase tracking-[0.12em]">{a} & {b}</p>
      </footer>
    </div>
  );
}
