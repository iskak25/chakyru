"use client";

import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, monthLabel, pad, programItems } from "./shared";
import { HeartRule } from "./Ornaments";
import { HeartOutline, IconCake, IconGlasses, IconRings } from "./Icons";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

export function CeremonyFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, count, mapHref, mapQuery, event } = kit;
  const instant = !!onChange;
  const items = programItems(kit).slice(0, 3);
  const ru = kit.locale === "ru";
  const icons = [IconRings, IconGlasses, IconCake];

  return (
    <div className="fam-cer relative overflow-x-hidden bg-[#f6f3ee] text-[#4a433c]">
      <div className="pointer-events-none absolute left-0 top-0 w-[42%] opacity-70">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[220px]" imgClass="h-full w-full object-cover" />
      </div>

      <header className="relative z-[1] px-8 pb-4 pt-16 text-center">
        <p className="text-[12px] uppercase tracking-[0.28em]">{ru ? "Мы женимся!" : "Биз үйлөнөбүз!"}</p>
        <HeartOutline className="mx-auto mt-3 h-4 w-4" />
        <p className="mt-5 text-[10px] uppercase leading-5 tracking-[0.16em] text-[#6a635c]">
          {ru
            ? "И с радостью приглашаем вас разделить с нами этот важный и счастливый день"
            : "Жана бул маанилүү, бактылуу күндү сиздер менен бөлүшүүгө чакырабыз"}
        </p>
        <h1 className="font-ele-script mt-8 break-words text-[clamp(34px,11vw,48px)] leading-[1.15] text-[#5a4a40]">
          <CanvasText
            value={coupleNames(invitation, a, b, ru ? " и " : " жана ")}
            placeholder={`${a} ${ru ? "и" : "жана"} ${b}`}
            onChange={onChange ? (v) => onChange({ names: v }) : undefined}
            className="bg-transparent"
            multiline
          />
        </h1>
        <HeartRule className="py-7" />
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || (ru ? "Любовь создаёт семью и мы будем счастливы разделить наше счастье с вами!" : kit.fallback)}
          className="text-[11px] uppercase leading-6 tracking-[0.12em]"
          multiline
        />
      </header>

      <Reveal instant={instant} className="px-8 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.24em]">{ru ? "Дата" : labels.dateOfEvent}</p>
        <p className="mt-2 text-[16px] font-medium uppercase tracking-[0.12em]">
          {pad(event.getDate())} {monthLabel(kit)} {event.getFullYear()}
        </p>
        <p className="mt-8 text-[10px] uppercase tracking-[0.24em]">{ru ? "Место" : labels.location}</p>
        <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="mt-2 text-[15px] font-medium uppercase tracking-[0.1em]" />
        <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="mt-1 text-[11px] uppercase tracking-[0.1em] text-[#6a635c]" />
      </Reveal>

      <Reveal instant={instant} className="grid grid-cols-3 gap-2 px-4 py-8 text-center">
        {items.map(([time, title], i) => {
          const Icon = icons[i] ?? IconRings;
          return (
            <div key={`${time}-${title}`} className="min-w-0 px-1">
              <Icon className="mx-auto h-8 w-8" />
              <p className="mt-3 text-[12px] font-medium">{time}</p>
              <p className="mt-1 text-[9px] uppercase leading-4 tracking-[0.08em] text-[#6a635c]">{title}</p>
            </div>
          );
        })}
      </Reveal>

      {count ? (
        <p className="px-8 pb-4 text-center text-[12px] tracking-[0.14em]">
          {pad(count.d)} : {pad(count.h)} : {pad(count.m)} : {pad(count.s)}
        </p>
      ) : null}

      <Reveal instant={instant} className="px-8 pb-6 text-center">
        <p className="text-[10px] uppercase leading-5 tracking-[0.14em]">
          {ru ? "Будем рады видеть вас на нашем празднике!" : labels.seeYou}
        </p>
        <HeartOutline className="mx-auto mt-3 h-4 w-4" />
        <p className="font-ele-script mt-4 text-[26px]">{ru ? "С любовью," : labels.withLove}</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.16em]">{a} {ru ? "и" : "жана"} {b}</p>
      </Reveal>

      <div className="pointer-events-none px-0 pb-2">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="h-[120px] w-[55%] opacity-80" imgClass="h-full w-full object-cover" />
      </div>

      {invitation.dressCode || onChange ? (
        <Reveal instant={instant} className="px-8 pb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em]">{labels.dressCode}</p>
          <Field invitation={invitation} onChange={onChange} id="dressCode" fallback={invitation.dressCode || labels.dressHint} className="mt-2 text-[13px] leading-7" multiline />
        </Reveal>
      ) : null}

      <Reveal instant={instant} className="px-8 pb-8 text-center">
        <a href={mapHref} className="inline-flex min-h-12 items-center justify-center border border-[#4a433c]/30 px-7 text-[10px] uppercase tracking-[0.16em]">
          {labels.map}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-4 h-[140px] w-full border-0" loading="lazy" />
      </Reveal>

      <WishesCard kit={kit} tone="elegant" />
      <section className="px-8 pb-16">
        <RsvpForm kit={kit} tone="elegant" />
      </section>
    </div>
  );
}
