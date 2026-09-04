"use client";

import { ExternalLink } from "lucide-react";
import { Field, SlotPhoto } from "./SiteEdit";
import {
  AddressBlock,
  CountdownBlock,
  FooterBlock,
  MessageBlock,
  MonthCalendar,
  Names,
  RsvpBlock,
  WishesBlock,
  type LayoutKit,
} from "./Site3DLayouts";

function addHour(time: string, hours: number) {
  const [h, m] = (time || "17:00").split(":").map(Number);
  const next = ((h || 17) + hours) % 24;
  return `${String(next).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
}

function program(kit: LayoutKit) {
  const ru = kit.locale === "ru";
  const t = kit.invitation.time || "17:00";
  return [
    [t, ru ? "Сбор гостей" : "Коноктордун чогулушу"],
    [addHour(t, 1), ru ? "Церемония" : "Церемония"],
    [addHour(t, 2), ru ? "Ужин" : "Кечки тамак"],
    [addHour(t, 5), ru ? "Танцы" : "Бий"],
  ] as const;
}

function dressSwatches(look: LayoutKit["look"]) {
  if (look.id === "cocoa") return ["#f3ead9", "#e4d2b0", "#c9b48a", "#4a3728", "#c4a35e"];
  if (look.id === "velvet" || look.id === "poppy") return ["#f6f1e8", "#e8d5c4", "#c4a090", "#7a2430", "#1a1214"];
  if (look.id === "moss") return ["#efe6d4", "#c4b496", "#8a8b68", "#4a5138", "#2c2418"];
  if (look.id === "atelier") return ["#f4efe6", "#e3cfc4", "#9aa890", "#4a3728"];
  return ["#ffffff", "#e8e0d4", "#c4b8a4", "#2d2d2d", "#111111"];
}

function MapBtn({ kit, className }: { kit: LayoutKit; className?: string }) {
  return (
    <a
      href={kit.mapHref}
      target="_blank"
      rel="noopener noreferrer"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        window.open(kit.mapHref, "_blank", "noopener,noreferrer");
      }}
      className={className}
    >
      <Field invitation={kit.invitation} onChange={kit.onChange} id="map" fallback={kit.labels.map} className="bg-transparent text-inherit" />
      <ExternalLink size={14} />
    </a>
  );
}

function Timeline({ kit, line }: { kit: LayoutKit; line?: boolean }) {
  const ru = kit.locale === "ru";
  return (
    <div className="mx-auto mt-8 max-w-[320px] space-y-5 text-left">
      {program(kit).map(([time, title]) => (
        <div key={title} className="grid grid-cols-[68px_1fr] items-baseline gap-3">
          <span className="font-serif text-[20px] leading-none">{time}</span>
          {line ? <span className="col-span-2 -mt-3 mb-1 h-px bg-current/15" /> : null}
          <span className="text-[14px] leading-6">{title}</span>
        </div>
      ))}
      <p className="pt-1 text-center text-[10px] uppercase tracking-[0.18em] opacity-45">
        {ru ? "Программа дня" : "Күн программасы"}
      </p>
    </div>
  );
}

export function LayoutStorybook({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, photos, heroPhoto, venuePhoto, look } = kit;
  const ru = kit.locale === "ru";
  const brown = look.accent;
  return (
    <>
      <section className="px-5 pb-8 pt-10">
        <div className="rounded-[18px] bg-white px-6 py-10 text-center shadow-[0_16px_40px_rgba(74,55,40,0.1)]">
          <p className="text-[11px] uppercase tracking-[0.22em] opacity-50">{invitation.date || "12.12.2012"}</p>
          <Names kit={kit} className="font-ceremonial mt-3 flex flex-wrap items-end justify-center gap-2 text-[42px] leading-none" />
          <MessageBlock kit={kit} className="mt-5 text-[14px] leading-7" />
          <a href="#rsvp" className="mt-7 inline-flex h-12 items-center px-7 text-[11px] uppercase tracking-[0.16em] text-white" style={{ background: brown }}>
            {ru ? "Подтвердить присутствие" : "Катышууну ырастоо"}
          </a>
        </div>
      </section>

      <section className="px-6 py-8 text-center">
        <p className="font-ceremonial text-[36px] leading-none">{ru ? "Наша история" : "Биздин окуя"}</p>
        <div className="mt-8 space-y-8">
          {photos.slice(0, 3).map((src, i) => (
            <figure key={src} className={`flex items-center gap-4 ${i % 2 ? "flex-row-reverse" : ""}`}>
              <div className={`w-[46%] bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ${i % 2 ? "rotate-2" : "-rotate-2"}`}>
                <SlotPhoto invitation={invitation} onChange={onChange} slot={`c${i}`} src={src} className="aspect-[3/4]" imgClass="h-full w-full object-cover" />
              </div>
              <figcaption className="flex-1 text-left">
                <p className="font-serif text-xl">{2018 + i * 2}</p>
                <p className="mt-1 text-[13px] leading-6 opacity-70">{invitation.dressCode || labels.loveQuote}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="px-8 py-10 text-center">
        <p className="font-ceremonial text-[36px] leading-none">{ru ? "Тайминг дня" : "Күндүн тартиби"}</p>
        <Timeline kit={kit} />
      </section>

      <section className="px-8 py-8 text-center">
        <p className="font-ceremonial text-[34px]">{ru ? "Дресс-код" : "Дресс-код"}</p>
        <div className="mt-6 space-y-3">
          {dressSwatches(look).map((c) => (
            <div key={c} className="flex items-center gap-3">
              <span className="h-14 w-14 rounded-md shadow-sm" style={{ background: c }} />
              <span className="text-[11px] uppercase tracking-[0.16em]">{c}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-8">
        <p className="font-ceremonial mb-5 text-center text-[36px]">{ru ? "Галерея" : "Галерея"}</p>
        <div className="grid grid-cols-2 gap-2">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="col-span-1 aspect-[3/4]" imgClass="h-full w-full object-cover" />
          <SlotPhoto invitation={invitation} onChange={onChange} slot="venue" src={venuePhoto} className="aspect-[3/4]" imgClass="h-full w-full object-cover" />
          {photos.slice(0, 2).map((src, i) => (
            <SlotPhoto key={src} invitation={invitation} onChange={onChange} slot={`g${i}`} src={src} className={i === 1 ? "col-span-2 aspect-[16/9]" : "aspect-square"} imgClass="h-full w-full object-cover" />
          ))}
        </div>
      </section>

      <div id="rsvp">
        <RsvpBlock kit={kit} soft />
      </div>
      <section className="bg-[#4a3728] text-[#f6f1e8]">
        <CountdownBlock kit={kit} light title={labels.untilWedding} />
      </section>
      <FooterBlock kit={kit} withLove />
    </>
  );
}

export function LayoutPoppy({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, heroPhoto, look, a, b } = kit;
  const ru = kit.locale === "ru";
  return (
    <>
      <header className="relative overflow-hidden px-6 pb-10 pt-12 text-center text-[#fff8f2]" style={{ background: look.overlay }}>
        {look.floras.map((f) => (
          <img key={f.src + f.className} src={f.src} alt="" className={`${f.className} ${f.spin ?? ""} pointer-events-none`} />
        ))}
        <p className="relative text-[11px] uppercase tracking-[0.2em] opacity-70">{labels.inviteLine}</p>
        <Names kit={kit} className="relative mt-4 flex flex-wrap justify-center gap-2 font-serif text-[34px] italic leading-none" />
        <div className="relative mx-auto mt-6 w-[78%] overflow-hidden">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="aspect-[3/4]" imgClass="h-full w-full object-cover" />
        </div>
      </header>
      <section className="site3d-torn-y bg-white px-7 py-12 text-center">
        <Field invitation={invitation} onChange={onChange} id="dearGuests" fallback={labels.dearGuests} className="font-serif text-[30px]" />
        <MessageBlock kit={kit} />
        <div className="mt-8 flex items-end justify-center gap-5 font-serif">
          <span className="text-2xl opacity-30">25</span>
          <span className="flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white" style={{ background: look.accent }}>
            {(invitation.date || "26").slice(-2)}
          </span>
          <span className="text-2xl opacity-30">27</span>
        </div>
        <p className="mt-3 text-[13px] uppercase tracking-[0.16em] opacity-60">{invitation.date || "2026"}</p>
      </section>
      <section className="site3d-torn-y bg-[#d7e4ea] px-7 py-12 text-center">
        <Field invitation={invitation} onChange={onChange} id="location" fallback={labels.location} className="font-serif text-[28px]" />
        <p className="mt-4 text-[15px] leading-7">{[invitation.venue, invitation.address, invitation.city].filter(Boolean).join(", ")}</p>
        <MapBtn kit={kit} className="mt-6 inline-flex h-11 items-center gap-2 border px-6 text-[12px] uppercase tracking-[0.14em]" />
      </section>
      <section className="bg-white px-7 py-10 text-center">
        <p className="font-serif text-[28px]">{ru ? "Программа" : "Программа"}</p>
        <div className="mt-6 space-y-3 text-left">
          {program(kit).map(([time, title]) => (
            <div key={title} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full" style={{ background: look.accent }} />
              <span className="w-14 font-serif">{time}</span>
              <span className="text-sm">{title}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="site3d-torn-y px-7 py-12 text-center text-white" style={{ background: look.accent }}>
        <p className="font-serif text-[30px]">{ru ? "Дресс-код" : "Дресс-код"}</p>
        <p className="mt-4 text-[14px] leading-7 opacity-85">{invitation.dressCode || labels.inviteLine}</p>
        <div className="mt-6 flex justify-center gap-3">
          {dressSwatches(look).slice(0, 3).map((c) => (
            <span key={c} className="h-8 w-8 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </section>
      <div className="bg-white">
        <RsvpBlock kit={kit} soft />
      </div>
      <section className="site3d-torn-y bg-[#d7e4ea] px-6 py-12 text-center">
        <Field invitation={invitation} onChange={onChange} id="withLove" fallback={labels.withLove} className="font-serif text-[22px]" />
        <p className="font-ceremonial mt-3 text-[34px]">{a} & {b}</p>
      </section>
    </>
  );
}

export function LayoutVelvet({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, heroPhoto, look, editing } = kit;
  const ru = kit.locale === "ru";
  return (
    <div className="text-[#f6f1e8]">
      <section className="px-6 pb-6 pt-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] opacity-70">{labels.inviteTitle}</p>
        <div className="relative mx-auto mt-6 overflow-hidden">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="aspect-[3/4]" imgClass="h-full w-full object-cover" />
        </div>
        <Names kit={kit} className="mt-8 flex flex-col font-serif text-[42px] font-light uppercase leading-[0.95] tracking-[0.08em]" />
      </section>
      <section className="px-4">
        <p className="mb-2 text-center text-[11px] uppercase tracking-[0.2em] opacity-70">{ru ? "Друзья и родные" : "Достор жана туугандар"}</p>
        <MonthCalendar
          event={kit.event}
          locale={kit.locale}
          time={invitation.time}
          startsLabel={labels.hourWord}
          onChange={onChange}
          dateValue={invitation.date}
          timeValue={invitation.time}
          shown
          instant={editing}
          tone="dark"
        />
      </section>
      <section className="px-8 py-8 text-center">
        <p className="text-[12px] uppercase tracking-[0.22em]">{ru ? "Дресс-код" : "Дресс-код"}</p>
        <div className="mt-5 flex justify-center gap-2">
          {dressSwatches(look).map((c) => (
            <span key={c} className="h-9 w-9 rounded-full border border-white/20" style={{ background: c }} />
          ))}
        </div>
      </section>
      <section className="px-8 pb-4">
        <div className="invite-oval mx-auto max-w-[280px] overflow-hidden">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="venue" src={kit.venuePhoto} className="h-full w-full" imgClass="h-full w-full object-cover" />
        </div>
      </section>
      <RsvpBlock kit={kit} soft />
      <CountdownBlock kit={kit} light title={labels.untilWedding} />
      <WishesBlock kit={kit} hideIcon />
    </div>
  );
}

export function LayoutWatermark({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, heroPhoto, look } = kit;
  const ru = kit.locale === "ru";
  return (
    <>
      <section className="relative min-h-[560px] overflow-hidden">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="absolute inset-0" imgClass="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />
        <div className="relative z-10 flex min-h-[560px] flex-col items-center justify-end px-6 pb-12 text-center text-white">
          <Names kit={kit} className="flex flex-col font-serif text-[36px] uppercase tracking-[0.16em]" />
          <p className="mt-3 max-w-[28ch] text-[13px] leading-6">{labels.weInvite}</p>
          <span className="mt-6 inline-flex h-10 items-center rounded-full bg-white px-5 text-[10px] uppercase tracking-[0.16em] text-[#3a322c]">
            {labels.music}
          </span>
        </div>
      </section>
      <section className="relative px-7 py-14 text-center">
        <p className="pointer-events-none absolute inset-x-0 top-8 text-center font-serif text-[56px] uppercase tracking-[0.12em] text-black/[0.06]">WEDDING</p>
        <Field invitation={invitation} onChange={onChange} id="dearGuests" fallback={labels.dearGuests} className="relative font-serif text-[32px]" />
        <MessageBlock kit={kit} />
      </section>
      <section className="relative px-7 py-10 text-center">
        <p className="pointer-events-none absolute inset-x-0 top-4 text-center font-serif text-[52px] uppercase text-black/[0.06]">LOCATION</p>
        <Field invitation={invitation} onChange={onChange} id="location" fallback={labels.location} className="relative font-serif text-[30px]" />
        <p className="relative mt-4 text-[15px] leading-7">{[invitation.venue, invitation.city].filter(Boolean).join(" · ")}</p>
        <MapBtn kit={kit} className="relative mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] underline underline-offset-4" />
      </section>
      <section className="relative px-7 py-10">
        <p className="pointer-events-none absolute inset-x-0 top-2 text-center font-serif text-[52px] uppercase text-black/[0.06]">TIMING</p>
        <p className="relative text-center font-serif text-[30px]">{ru ? "Тайминг" : "Тайминг"}</p>
        <Timeline kit={kit} />
      </section>
      <section className="relative px-7 py-10 text-center">
        <p className="pointer-events-none absolute inset-x-0 top-2 text-center font-serif text-[48px] uppercase text-black/[0.06]">DRESS</p>
        <p className="relative font-serif text-[30px]">{ru ? "Дресс-код" : "Дресс-код"}</p>
        <div className="mt-5 flex justify-center gap-2">
          {dressSwatches(look).map((c) => (
            <span key={c} className="h-8 w-8 rounded-full border border-black/10" style={{ background: c }} />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          {kit.photos.slice(0, 2).map((src, i) => (
            <SlotPhoto key={src} invitation={invitation} onChange={onChange} slot={`c${i}`} src={src} className="aspect-[3/4]" imgClass="h-full w-full object-cover" />
          ))}
        </div>
      </section>
      <RsvpBlock kit={kit} soft />
      <CountdownBlock kit={kit} title={labels.untilWedding} />
      <FooterBlock kit={kit} withLove />
    </>
  );
}

export function LayoutSatin({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, heroPhoto } = kit;
  const ru = kit.locale === "ru";
  return (
    <div className="text-[#faf9f5]">
      <section className="relative">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[420px]" imgClass="h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-8 text-center">
          <p className="font-ceremonial text-[34px] leading-none">Save the Date</p>
          <Names kit={kit} className="mt-2 flex justify-center gap-2 text-[15px] uppercase tracking-[0.18em]" />
        </div>
      </section>
      <div className="h-10 bg-[radial-gradient(120%_80%_at_50%_-20%,#6a7350_0%,#4a5138_70%)]" />
      <section className="px-8 py-12 text-center">
        <p className="font-ceremonial text-[36px] leading-tight">{ru ? "День, о котором мы мечтали" : "Биз кыялданган күн"}</p>
        <MessageBlock kit={kit} className="mt-5 text-[14px] leading-7 text-[#faf9f5]/85" />
      </section>
      <section className="px-5 py-8">
        <div className="flex gap-2 overflow-hidden">
          {kit.photos.slice(0, 4).map((src, i) => (
            <SlotPhoto key={src} invitation={invitation} onChange={onChange} slot={`c${i}`} src={src} className="h-36 w-24 shrink-0" imgClass="h-full w-full object-cover object-top" />
          ))}
        </div>
      </section>
      <section className="bg-[#faf9f5] px-7 py-12 text-center text-[#2c2820]">
        <p className="font-ceremonial text-[40px]">{ru ? "Детали" : "Деталдар"}</p>
        <p className="mt-4 text-[15px] leading-7">{invitation.dressCode || labels.inviteFallback.split("\n")[0]}</p>
        <MapBtn kit={kit} className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[13px] text-[#2c2820] shadow-sm" />
      </section>
      <RsvpBlock kit={kit} soft />
      <CountdownBlock kit={kit} light />
    </div>
  );
}

export function LayoutArchive({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, heroPhoto, photos, editing } = kit;
  const ru = kit.locale === "ru";
  return (
    <>
      <section className="px-6 pb-4 pt-8 text-center">
        <div className="photo-arch relative mx-auto h-[420px] w-full">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-full" imgClass="h-full w-full object-cover grayscale" />
          <div className="absolute inset-x-0 bottom-8 text-white">
            <Names kit={kit} className="flex flex-col font-serif text-[28px] uppercase tracking-[0.14em]" />
          </div>
        </div>
      </section>
      <section className="grid grid-cols-[1.2fr_0.8fr] items-end gap-3 px-6 py-8">
        <div>
          <p className="font-serif text-[34px] leading-none">{ru ? "Друзья!" : "Достор!"}</p>
          <MessageBlock kit={kit} className="mt-3 text-left text-[13px] leading-6" />
        </div>
        <p className="font-serif text-right text-[28px] leading-[0.95]">
          {(invitation.date || "25.08.25").replaceAll("-", ".")}
        </p>
      </section>
      <section className="px-10 pb-6">
        <div className="overflow-hidden" style={{ borderRadius: "46% 54% 42% 58% / 40% 44% 56% 60%" }}>
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="aspect-square" imgClass="h-full w-full object-cover grayscale" />
        </div>
      </section>
      <section className="mx-5 rounded-[22px] bg-[#2d2d2d] py-2 text-white">
        <MonthCalendar
          event={kit.event}
          locale={kit.locale}
          time={invitation.time}
          startsLabel={labels.eventDay}
          onChange={onChange}
          dateValue={invitation.date}
          timeValue={invitation.time}
          shown
          instant={editing}
          tone="dark"
        />
      </section>
      <section className="px-7 py-10 text-center">
        <p className="font-serif text-[28px] uppercase tracking-[0.12em]">{ru ? "Дресс-код" : "Дресс-код"}</p>
        <div className="mt-5 flex justify-center gap-2">
          {["#fff", "#111", "#d8cfc2"].map((c) => (
            <span key={c} className="h-8 w-8 rounded-sm border border-black/15" style={{ background: c }} />
          ))}
        </div>
      </section>
      <section className="px-7 py-6">
        <p className="text-center font-serif text-[28px] uppercase tracking-[0.12em]">{ru ? "Тайминг" : "Тайминг"}</p>
        <Timeline kit={kit} />
      </section>
      <AddressBlock kit={kit} />
      <RsvpBlock kit={kit} />
      <section className="px-6 pb-10">
        <div className="photo-arch h-[280px]">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="venue" src={kit.venuePhoto} className="h-full" imgClass="h-full w-full object-cover grayscale" />
        </div>
        <p className="mt-6 text-center font-serif text-[26px] uppercase tracking-[0.14em]">{labels.seeYouSoon}</p>
      </section>
    </>
  );
}

export function LayoutAtelier({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, heroPhoto, photos, a, b } = kit;
  const ru = kit.locale === "ru";
  const mono = `${a[0] ?? ""}${b[0] ?? ""}`.toUpperCase();
  return (
    <>
      <section className="px-5 pt-8">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="aspect-[4/5] overflow-hidden rounded-[22px]" imgClass="h-full w-full object-cover grayscale" />
        <p className="mt-6 text-center font-serif text-[42px] tracking-[0.08em]">{mono}</p>
        <Names kit={kit} className="font-ceremonial mt-1 flex justify-center gap-2 text-[28px]" />
        <MessageBlock kit={kit} />
        <p className="mt-4 text-center text-[12px] uppercase tracking-[0.18em] opacity-50">{invitation.date}</p>
      </section>
      <section className="grid grid-cols-2 gap-4 px-5 py-10">
        {photos.slice(0, 2).map((src, i) => (
          <figure key={src} className={i ? "mt-8" : ""}>
            <SlotPhoto invitation={invitation} onChange={onChange} slot={`c${i}`} src={src} className="aspect-[3/4] overflow-hidden rounded-[18px]" imgClass="h-full w-full object-cover grayscale" />
            <p className="font-script mt-2 text-[18px]">{i ? "Wedding" : "Love story"}</p>
          </figure>
        ))}
      </section>
      <CountdownBlock kit={kit} />
      <section className="px-5 py-6 text-center">
        <p className="font-serif text-[13px] uppercase tracking-[0.22em]">{ru ? "Место проведения" : "Өтө турган жер"}</p>
        <SlotPhoto invitation={invitation} onChange={onChange} slot="venue" src={kit.venuePhoto} className="mt-4 aspect-[16/9] overflow-hidden rounded-[16px]" imgClass="h-full w-full object-cover grayscale" />
        <p className="mt-3 text-[14px]">{invitation.venue}</p>
      </section>
      <section className="px-7 py-8">
        <p className="text-center font-serif text-[13px] uppercase tracking-[0.22em]">{ru ? "Программа дня" : "Күн программасы"}</p>
        <Timeline kit={kit} line />
      </section>
      <section className="grid grid-cols-2 gap-4 px-5 py-6">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="c2" src={photos[2] || heroPhoto} className="aspect-[3/4] overflow-hidden rounded-[16px]" imgClass="h-full w-full object-cover grayscale" />
        <div className="space-y-2 self-center">
          {dressSwatches(kit.look).map((c) => (
            <div key={c} className="h-8 rounded-lg" style={{ background: c }} />
          ))}
        </div>
      </section>
      <div className="px-8 pb-8 text-center">
        <RsvpBlock kit={kit} soft />
        <MapBtn kit={kit} className="inline-flex h-11 items-center gap-2 border border-black px-8 text-[11px] uppercase tracking-[0.16em]" />
      </div>
      <FooterBlock kit={kit} withLove />
    </>
  );
}

export function LayoutDusk({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, heroPhoto, look, editing } = kit;
  const ru = kit.locale === "ru";
  return (
    <>
      <section className="relative">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-[520px]" imgClass="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-10 text-center text-white">
          <p className="text-[11px] uppercase tracking-[0.22em]">{invitation.date}</p>
          <Names kit={kit} className="font-ceremonial mt-2 flex justify-center gap-2 text-[36px]" />
        </div>
      </section>
      <section className="px-7 py-12 text-center">
        <Field invitation={invitation} onChange={onChange} id="dearGuests" fallback={labels.dearGuests} className="font-serif text-[13px] uppercase tracking-[0.2em]" />
        <MessageBlock kit={kit} />
      </section>
      <section className="mx-5 overflow-hidden rounded-t-[180px] bg-[#2d2d2d] pb-4 pt-10 text-white">
        <MonthCalendar
          event={kit.event}
          locale={kit.locale}
          time={invitation.time}
          startsLabel={labels.hourWord}
          onChange={onChange}
          dateValue={invitation.date}
          timeValue={invitation.time}
          shown
          instant={editing}
          tone="dark"
        />
      </section>
      <section className="px-8 py-12">
        <p className="text-center font-serif text-[12px] uppercase tracking-[0.22em]">{ru ? "Программа дня" : "Күн программасы"}</p>
        <Timeline kit={kit} />
        <div className="mt-8 text-center">
          <MapBtn kit={kit} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#2d2d2d] px-7 text-[11px] uppercase tracking-[0.16em] text-white" />
        </div>
      </section>
      <section className="mx-5 rounded-[28px] bg-[#2d2d2d] px-6 py-8 text-center text-white">
        <p className="font-ceremonial text-[34px]">{ru ? "Дресс-код" : "Дресс-код"}</p>
        <div className="mt-5 flex justify-center gap-2">
          {dressSwatches(look).map((c) => (
            <span key={c} className="h-10 w-10 rounded-xl" style={{ background: c }} />
          ))}
        </div>
      </section>
      <div className="mx-5 my-6 rounded-[28px] bg-[#2d2d2d] text-white">
        <RsvpBlock kit={kit} soft />
      </div>
      <CountdownBlock kit={kit} title={labels.untilWedding} />
      <FooterBlock kit={kit} withLove />
    </>
  );
}

function dateParts(iso: string) {
  const d = iso ? new Date(`${iso}T12:00:00`) : new Date(2012, 11, 12);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return { day, month, year, monthName: months[d.getMonth()], weekDay: days[d.getDay()], fullYear: d.getFullYear() };
}

export function LayoutSplash({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, heroPhoto } = kit;
  const { day, month, year } = dateParts(invitation.date);
  return (
    <>
      <section className="relative min-h-[720px] overflow-hidden text-white">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="absolute inset-0" imgClass="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10 flex min-h-[720px] flex-col items-center px-6 py-12 text-center">
          <Field invitation={invitation} onChange={onChange} id="weddingDay" fallback="Wedding day" className="font-script text-[28px] leading-none" />
          <p className="mt-8 font-sans text-[56px] font-light leading-[0.9] tracking-[0.08em]">
            {day}
            <span className="block text-[18px] leading-none">.</span>
            {month}
            <span className="block text-[18px] leading-none">.</span>
            {year}
          </p>
          <Names kit={kit} className="font-ceremonial mt-10 flex flex-wrap justify-center gap-2 text-[40px] leading-none" />
          <MessageBlock kit={kit} className="font-script mt-6 max-w-[22ch] text-[18px] leading-7" />
          <p className="mt-auto pt-10 text-[11px] uppercase tracking-[0.2em] opacity-85">
            {[invitation.venue, invitation.time].filter(Boolean).join(" / ")}
          </p>
        </div>
      </section>
      <div className="bg-white text-[#111]">
        <AddressBlock kit={kit} />
        <RsvpBlock kit={kit} soft />
        <CountdownBlock kit={kit} title={labels.untilWedding} />
        <FooterBlock kit={kit} withLove />
      </div>
    </>
  );
}

export function LayoutEngage({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, heroPhoto } = kit;
  const { day, monthName, weekDay, fullYear } = dateParts(invitation.date);
  return (
    <>
      <section className="relative min-h-[720px] overflow-hidden rounded-[28px] text-white">
        <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="absolute inset-0" imgClass="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex min-h-[720px] flex-col items-center justify-between px-7 py-14 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em]">{labels.weInvite}</p>
          <div>
            <Names kit={kit} className="flex justify-center gap-2 font-serif text-[42px] italic leading-none" />
            <p className="mt-10 font-serif text-[22px]">{monthName}</p>
            <div className="mt-2 flex items-end justify-center gap-3">
              <span className="font-serif text-[13px]">{weekDay}</span>
              <span className="font-serif text-[72px] leading-none">{Number(day)}</span>
              <span className="text-[10px] uppercase tracking-[0.14em]">{invitation.time || "18:00"}</span>
            </div>
            <p className="mt-1 font-serif text-[20px]">{fullYear}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase leading-5 tracking-[0.18em]">{labels.seeYouSoon}</p>
            <p className="mt-4 text-[10px] uppercase tracking-[0.16em] opacity-80">
              {[invitation.venue, invitation.city].filter(Boolean).join(" — ")}
            </p>
            <p className="mt-6 text-[12px] uppercase tracking-[0.32em]">Save the Date</p>
          </div>
        </div>
      </section>
      <div className="bg-white text-[#1c1814]">
        <RsvpBlock kit={kit} soft />
        <AddressBlock kit={kit} />
        <CountdownBlock kit={kit} />
      </div>
    </>
  );
}

export function LayoutSplitBrush({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, heroPhoto, a, b } = kit;
  const ru = kit.locale === "ru";
  const { day, monthName, fullYear } = dateParts(invitation.date);
  const mono = `${a[0] ?? "A"} / ${b[0] ?? "B"}`;
  return (
    <>
      <section className="relative min-h-[740px] overflow-hidden bg-[#f3f1ec]">
        <div className="brush-split absolute inset-y-0 right-0 w-[58%]">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="hero" src={heroPhoto} className="h-full" imgClass="h-full w-full object-cover" />
        </div>
        <div className="relative z-10 flex min-h-[740px] w-[54%] flex-col items-center justify-center px-4 py-10 text-center">
          <p className="font-serif text-[42px] font-light tracking-[0.08em]">{mono}</p>
          <p className="mt-5 text-[10px] uppercase tracking-[0.22em]">{ru ? "Вместе на всю жизнь" : "Бирге бир өмүргө"}</p>
          <p className="font-script mt-2 text-[22px]">{ru ? "говорим да." : "ооба дейбиз."}</p>
          <span className="mt-4 text-lg opacity-50">♡</span>
          <MessageBlock kit={kit} className="mt-4 max-w-[18ch] text-[12px] leading-6" />
          <div className="mt-6 w-full max-w-[200px] border-y border-black/20 py-3">
            <div className="grid grid-cols-2 divide-x divide-black/20">
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em]">{monthName}</p>
                <p className="font-serif text-[36px] leading-none">{Number(day)}</p>
                <p className="text-[11px]">{fullYear}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em]">{ru ? "Суббота" : "Күн"}</p>
                <p className="font-serif text-[28px] leading-none">{invitation.time || "19:00"}</p>
                <p className="text-[9px] uppercase tracking-[0.14em]">{labels.hourWord}</p>
              </div>
            </div>
          </div>
          <p className="font-script mt-5 text-[22px] underline decoration-1 underline-offset-4">{ru ? "вы приглашены" : "чакырабыз"}</p>
          <p className="mt-4 text-[10px] uppercase tracking-[0.16em]">{invitation.venue}</p>
          <p className="text-[9px] uppercase tracking-[0.14em] opacity-50">{invitation.city}</p>
        </div>
      </section>
      <AddressBlock kit={kit} />
      <RsvpBlock kit={kit} soft />
      <CountdownBlock kit={kit} />
      <FooterBlock kit={kit} withLove />
    </>
  );
}

export function LayoutMarble({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, onChange, a, b, look } = kit;
  const ru = kit.locale === "ru";
  const gold = look.accent;
  const swatches = ["#f4f1ec", "#efe6d4", "#d8c8b0", "#c4b08c", "#c5cdd4", "#8a9aaa", "#6a7a82", "#6a7358"];
  return (
    <div className="marble-bg px-4 py-6">
      <section className="gold-arch px-5 py-10 text-center" style={{ color: gold }}>
        <p className="font-serif text-[48px] italic leading-none">
          {a[0] ?? "L"} & {b[0] ?? "M"}
        </p>
        <Field invitation={invitation} onChange={onChange} id="dearGuests" fallback={labels.dearGuests} className="mt-5 font-serif text-[18px]" />
        <p className="mt-4 font-serif text-[28px]">{invitation.date || "19.09.2026"}</p>
        <div className="mx-auto my-6 h-px w-24" style={{ background: gold }} />
        <div className="grid grid-cols-2 gap-3 text-[12px] leading-5">
          <div className="border-r pr-3" style={{ borderColor: `${gold}55` }}>
            <p className="font-serif text-[14px]">{ru ? "Регистрация" : "Нике"}</p>
            <p className="mt-2 font-serif text-[22px]">{invitation.time || "14:30"}</p>
            <p className="mt-2">{invitation.venue}</p>
            <p className="opacity-70">{invitation.address}</p>
          </div>
          <div>
            <p className="font-serif text-[14px]">{ru ? "Банкет" : "Банкет"}</p>
            <p className="mt-2 font-serif text-[22px]">{invitation.time || "16:00"}</p>
            <p className="mt-2">{invitation.city}</p>
            <p className="opacity-70">{invitation.address}</p>
          </div>
        </div>
        <p className="mt-8 text-[11px] uppercase tracking-[0.18em]">{ru ? "Дресс-код" : "Дресс-код"}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {swatches.map((c) => (
            <span key={c} className="h-6 w-6 rounded-full border" style={{ background: c, borderColor: `${gold}66` }} />
          ))}
        </div>
        <p className="mt-6 font-serif text-[14px]">{labels.withLove}, {a} & {b}</p>
      </section>
      <div className="text-[#3a3228]">
        <RsvpBlock kit={kit} soft />
        <CountdownBlock kit={kit} gold />
        <AddressBlock kit={kit} />
      </div>
    </div>
  );
}

export function moreLayoutThumb(layout: string, kit: { a: string; b: string; heroPhoto: string; look: LayoutKit["look"] }) {
  const { a, b, heroPhoto, look } = kit;
  if (layout === "storybook") {
    return (
      <div className="flex h-full flex-col bg-[#f9f8f6] px-4 pt-10 text-center text-[#4a3728]">
        <p className="font-ceremonial text-[28px]">{a}</p>
        <p className="font-ceremonial text-[28px]">{b}</p>
        <div className="mt-auto h-[46%] bg-white p-2 shadow-md">
          <img src={heroPhoto} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }
  if (layout === "poppy") {
    return (
      <div className="flex h-full flex-col bg-[#1a3336] px-3 pt-8 text-center text-white">
        <p className="font-serif italic text-[20px]">{a} & {b}</p>
        <img src={heroPhoto} alt="" className="mt-4 min-h-0 flex-1 object-cover" />
      </div>
    );
  }
  if (layout === "velvet") {
    return (
      <div className="flex h-full flex-col bg-[#4a1a1e] px-4 pt-10 text-center text-[#f6f1e8]">
        <img src={heroPhoto} alt="" className="h-[48%] object-cover" />
        <p className="mt-4 font-serif text-[22px] uppercase tracking-[0.12em]">{a}</p>
        <p className="font-serif text-[22px] uppercase tracking-[0.12em]">{b}</p>
      </div>
    );
  }
  if (layout === "watermark") {
    return (
      <div className="relative h-full overflow-hidden bg-black">
        <img src={heroPhoto} alt="" className="h-full w-full object-cover" />
        <p className="absolute inset-x-0 bottom-10 text-center font-serif text-[16px] uppercase tracking-[0.16em] text-white">
          {a} {b}
        </p>
      </div>
    );
  }
  if (layout === "satin") {
    return (
      <div className="flex h-full flex-col bg-[#4a5138] text-[#faf9f5]">
        <img src={heroPhoto} alt="" className="h-[52%] object-cover" />
        <p className="font-ceremonial mt-6 text-center text-[24px]">Save the Date</p>
      </div>
    );
  }
  if (layout === "archive") {
    return (
      <div className="flex h-full flex-col bg-white px-4 pt-8">
        <div className="photo-arch min-h-0 flex-1">
          <img src={heroPhoto} alt="" className="h-full w-full object-cover grayscale" />
        </div>
        <p className="py-4 text-center font-serif text-[14px] uppercase tracking-[0.14em]">{a} & {b}</p>
      </div>
    );
  }
  if (layout === "atelier") {
    return (
      <div className="flex h-full flex-col bg-white px-4 pt-8 text-center">
        <img src={heroPhoto} alt="" className="h-[46%] rounded-[18px] object-cover grayscale" />
        <p className="mt-4 font-serif text-[28px]">{`${a[0] ?? ""}${b[0] ?? ""}`}</p>
        <p className="font-ceremonial text-[20px]">{a} & {b}</p>
      </div>
    );
  }
  if (layout === "dusk") {
    return (
      <div className="relative h-full overflow-hidden bg-[#f4f1ee]">
        <img src={heroPhoto} alt="" className="h-[70%] w-full object-cover" />
        <p className="absolute inset-x-0 top-[52%] text-center font-ceremonial text-[22px] text-white">{a} & {b}</p>
      </div>
    );
  }
  if (layout === "splash") {
    return (
      <div className="relative h-full overflow-hidden bg-black text-white">
        <img src={heroPhoto} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 text-center">
          <p className="font-script text-[16px]">Wedding day</p>
          <p className="font-ceremonial mt-3 text-[22px]">{a} & {b}</p>
        </div>
      </div>
    );
  }
  if (layout === "engage") {
    return (
      <div className="relative h-full overflow-hidden rounded-[18px] bg-black text-white">
        <img src={heroPhoto} alt="" className="h-full w-full object-cover" />
        <p className="absolute inset-x-0 top-[40%] text-center font-serif text-[20px] italic">{a} & {b}</p>
        <p className="absolute inset-x-0 bottom-8 text-center text-[9px] uppercase tracking-[0.28em]">Save the Date</p>
      </div>
    );
  }
  if (layout === "splitbrush") {
    return (
      <div className="relative h-full overflow-hidden bg-[#f3f1ec]">
        <img src={heroPhoto} alt="" className="brush-split absolute inset-y-0 right-0 h-full w-[58%] object-cover" />
        <p className="absolute left-3 top-10 font-serif text-[22px]">{`${a[0] ?? "A"} / ${b[0] ?? "B"}`}</p>
      </div>
    );
  }
  if (layout === "marble") {
    return (
      <div className="marble-bg flex h-full flex-col items-center justify-center px-4 text-center text-[#c4a35e]">
        <p className="font-serif text-[32px] italic">{`${a[0] ?? "L"} & ${b[0] ?? "M"}`}</p>
        <p className="mt-3 font-serif text-[14px]">{a} & {b}</p>
      </div>
    );
  }
  return null;
}
