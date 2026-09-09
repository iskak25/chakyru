"use client";

import { MapPin } from "lucide-react";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto, fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, pad, programItems } from "./shared";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function CalendarGrid({ date }: { date: Date }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventDay = date.getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="mx-auto mt-6 max-w-[280px] text-center">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a7a7a]">
        {MONTH_NAMES_EN[month]} {year}
      </p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-[12px]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="p-1 text-[10px] font-medium text-[#7a7a7a]">
            {day}
          </div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className={`flex h-7 items-center justify-center text-[11px] ${
              day === eventDay ? "rounded-full bg-[#1a1a1a] text-[#f4f4f2] font-medium" : "text-[#1a1a1a]"
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonoFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, event, mapHref, mapQuery, venuePhoto } = kit;
  const instant = !!onChange;
  const items = programItems(kit);

  return (
    <div className="overflow-x-hidden bg-[#f4f4f2] text-[#1a1a1a]">
      <Reveal instant={instant} className="px-6 pb-4 pt-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a7a7a]">{labels.dearGuests}</p>
        <h1 className="font-mod mt-4 break-words text-[clamp(32px,10vw,44px)] uppercase leading-[1.15] text-[#1a1a1a]">
          <CanvasText
            value={coupleNames(invitation, a, b, " & ")}
            placeholder={`${a} & ${b}`}
            onChange={onChange ? (v) => onChange({ names: v }) : undefined}
            className="bg-transparent"
            multiline={false}
          />
        </h1>
        <p className="mt-4 text-[13px] tracking-[0.12em] text-[#7a7a7a]">
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
          imgClass="h-full w-full object-cover grayscale"
        />
      </Reveal>

      <CalendarGrid date={event} />

      <Reveal instant={instant} className="px-6 py-8 text-center">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="mx-auto max-w-[300px] text-[13px] leading-7 text-[#1a1a1a]"
          multiline
        />
      </Reveal>

      <Reveal instant={instant} className="px-0 py-4">
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="c0"
          src={photos[0]}
          className="h-[280px]"
          imgClass="h-full w-full object-cover grayscale"
        />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10">
        <p className="text-center text-[13px] uppercase tracking-[0.16em] text-[#1a1a1a]">
          {labels.program}
        </p>
        <ul className="mt-6 space-y-4 text-[12px]">
          {items.map(([time, title]) => (
            <li key={`${time}-${title}`} className="flex items-start gap-4 border-b border-[#e0e0e0] pb-3">
              <span className="min-w-12 font-medium text-[#7a7a7a]">{time}</span>
              <span className="text-[#1a1a1a]">{title}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="text-[13px] uppercase tracking-[0.16em] text-[#1a1a1a]">{labels.location}</p>
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="venue"
          src={venuePhoto || photos[2] || heroPhoto}
          className="mt-6 h-[200px] w-full"
          imgClass="h-full w-full object-cover grayscale"
        />
        <p className="mt-5 flex items-start justify-center gap-2 text-[12px] leading-6 text-[#1a1a1a]">
          <MapPin size={14} className="mt-1 shrink-0 text-[#1a1a1a]" />
          <span>
            <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="block text-[13px]" />
            <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="block text-[11px] text-[#7a7a7a]" />
          </span>
        </p>
        <a
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-none border border-[#1a1a1a] px-6 py-2 text-[11px] uppercase tracking-[0.12em] text-[#1a1a1a]"
        >
          {labels.map}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-4 h-[140px] w-full border-0" loading="lazy" />
      </Reveal>

      <WishesCard kit={kit} tone="mono" />

      <section className="px-8 pb-10">
        <RsvpForm kit={kit} tone="mono" />
      </section>

      <footer className="bg-[#ffffff] px-8 py-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#7a7a7a]">
          {a.slice(0, 1).toUpperCase()} + {b.slice(0, 1).toUpperCase()}
        </p>
        <p className="mt-3 text-[10px] text-[#7a7a7a]">{pad(event.getDate())}.{pad(event.getMonth() + 1)}.{event.getFullYear()}</p>
      </footer>
    </div>
  );
}
