"use client";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto, fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, monthLabel, pad, programItems } from "./shared";
import { CalendarGrid, DoveOrnament } from "./Ornaments";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

export function NoirFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, event, mapHref, mapQuery, venuePhoto } = kit;
  const instant = !!onChange;
  const items = programItems(kit);

  return (
    <div className="overflow-x-hidden bg-[#f5f0e8] text-[#241612]">
      <Reveal instant={instant} className="bg-[#7a1620] px-8 py-10 text-center text-[#f5f0e8]">
        <p className="font-lux text-[14px] uppercase tracking-[0.16em]">The Wedding Day</p>
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="hero"
          src={heroPhoto}
          className="mt-6 h-[240px]"
          imgClass="h-full w-full object-cover"
        />
        <h1 className="font-ele-script mt-6 text-[32px] text-[#f5f0e8]">
          <CanvasText
            value={coupleNames(invitation, a, b, "\n&\n")}
            placeholder={`${a} & ${b}`}
            onChange={onChange ? (v) => onChange({ names: v }) : undefined}
            className="bg-transparent"
            multiline
          />
        </h1>
      </Reveal>

      <Reveal instant={instant} className="bg-[#7a1620] px-8 py-8 text-center text-[#f5f0e8]">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="mx-auto max-w-[300px] text-[13px] leading-7"
          multiline
        />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="text-[13px] uppercase tracking-[0.16em] text-[#241612]">
          {pad(event.getDate())}.{pad(event.getMonth() + 1)}.{event.getFullYear()}
        </p>
        <CalendarGrid
          date={event}
          monthLabel={monthLabel(kit)}
          className="mt-5"
          headClassName="text-[#8a7468]"
          cellClassName="text-[#241612]"
          highlightClassName="bg-[#7a1620] text-[#f5f0e8]"
        />
      </Reveal>

      <Reveal instant={instant} className="bg-[#7a1620] px-8 py-10 text-[#f5f0e8]">
        <p className="text-center text-[13px] uppercase tracking-[0.16em]">{labels.program}</p>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
          {items.map(([time, title]) => (
            <li key={`${time}-${title}`}>
              <span className="font-medium">{time}</span>
              <br />
              {title}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal instant={instant} className="px-0">
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="venue"
          src={venuePhoto || photos[2] || heroPhoto}
          className="h-[200px]"
          imgClass="h-full w-full object-cover"
        />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-8 text-center">
        <p className="text-[13px] uppercase tracking-[0.12em] text-[#241612]">{labels.location}</p>
        <p className="mt-3 text-[12px] text-[#241612]">
          <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="text-[13px]" />
          <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="text-[11px] text-[#8a7468]" />
        </p>
        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-none bg-[#7a1620] px-6 py-2 text-[11px] uppercase tracking-[0.12em] text-[#f5f0e8]">
          {labels.map}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-4 h-[140px] w-full border-0" loading="lazy" />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="text-[13px] uppercase tracking-[0.16em] text-[#241612]">{labels.dressCode}</p>
        <Field
          invitation={invitation}
          onChange={onChange}
          id="dressCode"
          fallback={invitation.dressCode || labels.dressHint}
          className="mx-auto mt-3 max-w-[280px] text-[12px] leading-6 text-[#241612]"
          multiline
        />
        <div className="mt-5 flex items-center justify-center gap-6">
          <span className="block h-14 w-16 rounded-[62%_38%_55%_45%/48%_42%_58%_52%] bg-[#7a1620]" />
          <span className="block h-12 w-16 rounded-[40%_60%_45%_55%/55%_45%_58%_42%] border border-[#8a7468] bg-[#f5f0e8]" />
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="text-[13px] uppercase tracking-[0.16em] text-[#241612]">{labels.phoneCta}</p>
        <div className="relative mx-auto mt-5 h-[110px] w-[170px]">
          <svg viewBox="0 0 170 110" className="absolute inset-0 h-full w-full text-[#7a1620]" aria-hidden fill="none">
            <rect x="1" y="1" width="168" height="108" rx="3" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1 1l84 60 84-60" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span className="absolute inset-x-0 bottom-4 text-center text-[13px] font-medium text-[#241612]">
            {fieldValue(invitation, "phoneA", "")}
          </span>
        </div>
      </Reveal>

      <WishesCard kit={kit} tone="noir" />

      <section className="bg-[#f5f0e8] px-8 pb-10">
        <RsvpForm kit={kit} tone="noir" />
      </section>

      <footer className="bg-[#7a1620] px-6 py-8 text-center text-[#f5f0e8]">
        <DoveOrnament className="mx-auto h-8 w-14 text-[#f5f0e8]" />
        <p className="mt-3 text-[11px] uppercase tracking-[0.12em]">With love forever</p>
      </footer>
    </div>
  );
}
