"use client";

import { MapPin } from "lucide-react";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto, fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { mapsEmbedUrl, pad, programItems } from "./shared";
import { GoldFlourish, IVORY_ICONS, IvoryCornerBloom } from "./florals";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

function dressSwatches(invitation: LayoutKit["invitation"]) {
  const fromCopy = [0, 1, 2, 3, 4]
    .map((i) => invitation.copy?.[`dc${i}`])
    .filter((v): v is string => Boolean(v && /^#|rgb|hsl|[a-z]/i.test(v)));
  return fromCopy.length ? fromCopy : ["#1a1a1a", "#c4a484", "#e2c2b9", "#d8c4b8", "#f3ebe4"];
}

export function IvoryFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, count, mapHref, mapQuery, event } = kit;
  const instant = !!onChange;
  const items = programItems(kit);
  const greeting = fieldValue(invitation, "greeting", labels.friends);
  const swatches = dressSwatches(invitation);

  return (
    <div className="fam-ivory overflow-x-hidden bg-[#fcfaf9] text-[#1a1a1a]">
      <HeroSection kit={kit} heroPhoto={heroPhoto} instant={instant} />
      <CoupleNames kit={kit} a={a} b={b} />
      <InvitationText kit={kit} greeting={greeting} instant={instant} />
      <WeddingDate kit={kit} event={event} instant={instant} />
      <VenueSection kit={kit} mapHref={mapHref} photos={photos} instant={instant} />
      <ProgramSection kit={kit} items={items} instant={instant} />
      <DressCodeSection kit={kit} swatches={swatches} instant={instant} />
      <Reveal instant={instant}>
        <WishesCard kit={kit} tone="elegant" />
      </Reveal>
      <section className="px-8 pb-8">
        <RsvpForm kit={kit} tone="ivory" />
      </section>
      <FooterSection kit={kit} count={count} mapQuery={mapQuery} />
    </div>
  );
}

function HeroSection({
  kit,
  heroPhoto,
  instant,
}: {
  kit: LayoutKit;
  heroPhoto: string;
  instant: boolean;
}) {
  return (
    <Reveal instant={instant} className="fam-ivory-hero relative overflow-hidden">
      <SlotPhoto
        invitation={kit.invitation}
        onChange={kit.onChange}
        slot="hero"
        src={heroPhoto}
        className="h-[min(62svh,520px)] min-h-[360px]"
        imgClass="fam-ivory-ken h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-transparent to-[#fcfaf9]" />
    </Reveal>
  );
}

function CoupleNames({ kit, a, b }: { kit: LayoutKit; a: string; b: string }) {
  return (
    <section className="relative px-6 pb-2 pt-2 text-center">
      <span className="font-ivory pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 text-[86px] leading-none text-[#e2c2b9]">
        &
      </span>
      <div className="relative flex items-end justify-center gap-5">
        <h1 className="font-ivory min-w-0 break-words text-[clamp(34px,11vw,46px)] uppercase leading-none tracking-[0.04em]">
          <CanvasText
            value={a}
            placeholder={a}
            onChange={kit.onChange ? (v) => kit.onChange?.({ names: `${v} & ${b}` }) : undefined}
            className="bg-transparent"
          />
        </h1>
        <h1 className="font-ivory min-w-0 break-words text-[clamp(34px,11vw,46px)] uppercase leading-none tracking-[0.04em]">
          <CanvasText
            value={b}
            placeholder={b}
            onChange={kit.onChange ? (v) => kit.onChange?.({ names: `${a} & ${v}` }) : undefined}
            className="bg-transparent"
          />
        </h1>
      </div>
    </section>
  );
}

function InvitationText({
  kit,
  greeting,
  instant,
}: {
  kit: LayoutKit;
  greeting: string;
  instant: boolean;
}) {
  return (
    <Reveal instant={instant} className="px-8 pb-4 pt-8 text-center">
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="greeting"
        fallback={greeting}
        className="fam-ivory-drop mx-auto max-w-[300px] text-[15px] leading-7 text-[#2a2a2a]"
      />
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="message"
        fallback={kit.invitation.message || kit.fallback}
        className="mx-auto mt-5 max-w-[320px] text-[14px] leading-7 text-[#4a4a4a]"
        multiline
      />
    </Reveal>
  );
}

function WeddingDate({
  kit,
  event,
  instant,
}: {
  kit: LayoutKit;
  event: Date;
  instant: boolean;
}) {
  return (
    <Reveal instant={instant} className="px-6 py-8 text-center">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#7a7a7a]">{kit.labels.dateOfEvent}</p>
      <p className="font-ivory mt-3 text-[28px] tracking-[0.16em]">
        {pad(event.getDate())}/{pad(event.getMonth() + 1)}/{event.getFullYear()}
      </p>
      <p className="mt-2 text-[13px] tracking-[0.18em] text-[#5a5a5a]">{kit.invitation.time || "17:00"}</p>
    </Reveal>
  );
}

function VenueSection({
  kit,
  mapHref,
  photos,
  instant,
}: {
  kit: LayoutKit;
  mapHref: string;
  photos: string[];
  instant: boolean;
}) {
  return (
    <Reveal instant={instant} className="relative px-8 pb-6 pt-4 text-center">
      <p className="text-[13px] leading-6 text-[#5a5a5a]">{kit.labels.location}</p>
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="address"
        fallback={kit.invitation.address}
        className="mt-2 text-[14px] leading-6 text-[#3a3a3a]"
      />
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="venue"
        fallback={kit.invitation.venue}
        className="font-ivory mt-1 text-[20px]"
      />
      <a
        href={mapHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fam-ivory-btn mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#e2c2b9] px-8 text-[11px] font-medium uppercase tracking-[0.14em] text-[#2a1f1c]"
      >
        <MapPin size={14} className="mr-2" />
        {kit.labels.map}
      </a>
      <div className="relative mt-10 h-[92px]">
        <SlotPhoto
          invitation={kit.invitation}
          onChange={kit.onChange}
          slot="c1"
          src={photos[1]}
          className="absolute right-[-8px] h-[92px] w-[62%] overflow-hidden rounded-l-full"
          imgClass="h-full w-full object-cover"
        />
      </div>
    </Reveal>
  );
}

function ProgramSection({
  kit,
  items,
  instant,
}: {
  kit: LayoutKit;
  items: [string, string][];
  instant: boolean;
}) {
  return (
    <Reveal instant={instant} className="relative z-[1] -mt-6 px-8 pb-10 pt-2">
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="program"
        fallback={kit.locale === "ru" ? "Программа" : kit.labels.program}
        className="font-ivory-script text-left text-[42px] leading-none text-[#1a1a1a]"
      />
      <ul className="mt-8 space-y-5">
        {items.map(([time, title], i) => {
          const Icon = IVORY_ICONS[i % IVORY_ICONS.length]!;
          return (
            <li key={`${time}-${title}`} className="grid grid-cols-[64px_40px_1fr] items-center gap-2">
              <span className="font-ivory text-[20px]">{time}</span>
              <span className="flex justify-center text-[#8a8a8a]">
                <Icon className="h-7 w-7" />
              </span>
              <span className="text-[14px] lowercase leading-5 text-[#3a3a3a]">{title}</span>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}

function DressCodeSection({
  kit,
  swatches,
  instant,
}: {
  kit: LayoutKit;
  swatches: string[];
  instant: boolean;
}) {
  return (
    <Reveal instant={instant} className="px-8 py-8 text-center">
      <p className="font-ivory text-[18px] uppercase tracking-[0.18em]">{kit.labels.dressCode}</p>
      <Field
        invitation={kit.invitation}
        onChange={kit.onChange}
        id="dressCode"
        fallback={kit.invitation.dressCode || kit.labels.dressHint}
        className="mt-3 text-[13px] leading-6 text-[#5a5a5a]"
        multiline
      />
      <div className="mt-5 flex justify-center gap-3">
        {swatches.map((color) => (
          <span key={color} className="h-8 w-8 rounded-full border border-black/10" style={{ background: color }} />
        ))}
      </div>
    </Reveal>
  );
}

function FooterSection({
  kit,
  count,
  mapQuery,
}: {
  kit: LayoutKit;
  count: LayoutKit["count"];
  mapQuery: string;
}) {
  return (
    <footer className="relative overflow-hidden px-6 pb-16 pt-4 text-center">
      <IvoryCornerBloom className="pointer-events-none absolute -bottom-4 -left-6 h-32 w-36" />
      <IvoryCornerBloom className="pointer-events-none absolute -bottom-6 -right-8 h-36 w-40 scale-x-[-1]" />
      {count ? (
        <p className="relative text-[12px] tracking-[0.16em] text-[#7a7a7a]">
          {kit.labels.countdown}: {pad(count.d)}:{pad(count.h)}:{pad(count.m)}:{pad(count.s)}
        </p>
      ) : null}
      <GoldFlourish className="relative mx-auto mt-6 h-4 w-36" />
      <p className="font-ivory-script relative mt-4 text-[28px]">{kit.labels.withLove}</p>
      <iframe title={kit.labels.map} src={mapsEmbedUrl(mapQuery)} className="relative mt-6 h-[140px] w-full rounded-[20px] border-0" loading="lazy" />
    </footer>
  );
}
