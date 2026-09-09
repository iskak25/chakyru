"use client";
import { useState } from "react";
import { addRsvp, addWish } from "@/lib/store";
import type { RsvpStatus } from "@/lib/types";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto, fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, pad, programItems } from "./shared";
import { KyalRule } from "./Ornaments";
import { Reveal } from "./Reveal";

export function ToiAnketFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, event, mapHref, mapQuery, count } = kit;
  const instant = !!onChange;
  const items = programItems(kit);

  return (
    <div className="overflow-x-hidden bg-[#f3f6f0] text-[#243020]">
      <Reveal instant={instant} className="px-6 pb-4 pt-12 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#7a8a72]">{labels.dearGuests}</p>
        <h1 className="font-tra-script mt-4 break-words text-[clamp(32px,10vw,44px)] leading-[1.15] text-[#243020]">
          <CanvasText
            value={coupleNames(invitation, a, b, "\n&\n")}
            placeholder={`${a} & ${b}`}
            onChange={onChange ? (v) => onChange({ names: v }) : undefined}
            className="bg-transparent"
            multiline
          />
        </h1>
        <KyalRule className="mt-5 text-[#8aa890]" />
        <p className="font-tra-title mt-4 text-[14px] tracking-[0.16em] text-[#4a6a4e]">
          {pad(event.getDate())}.{pad(event.getMonth() + 1)}.{event.getFullYear()}
        </p>
      </Reveal>

      <Reveal instant={instant} className="px-6 pb-2 pt-4 text-center">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#7a8a72]">
          Той иелери: {a} & {b}
        </p>
        <p className="text-[10px] text-[#7a8a72]">
          <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} />
          <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="block" />
        </p>
        <a
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 w-full max-w-[300px] items-center justify-center rounded-[4px] bg-[#4a6a4e] px-6 text-[11px] uppercase tracking-[0.14em] text-[#fdf8ee]"
        >
          {kit.locale === "ru" ? "Смотреть на карте" : "Картаны ачуу"}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mx-auto mt-3 h-[120px] w-full max-w-[300px] rounded-[4px] border-0" loading="lazy" />
      </Reveal>

      <Reveal instant={instant} className="px-0 py-6">
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="hero"
          src={heroPhoto}
          className="h-[280px]"
          imgClass="h-full w-full object-cover"
        />
      </Reveal>

      {count ? (
        <Reveal instant={instant} className="px-5 pb-2 text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#7a8a72]">{fieldValue(invitation, "untilTitle", labels.untilWedding)}</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              [pad(count.d), labels.days],
              [pad(count.h), labels.hours],
              [pad(count.m), labels.mins],
              [pad(count.s), labels.secs],
            ].map(([n, lab]) => (
              <div key={String(lab)} className="rounded-[4px] border border-[#8aa890]/40 bg-white py-3">
                <p className="font-tra-title text-[20px] leading-none text-[#4a6a4e]">{n}</p>
                <p className="mt-2 text-[8px] uppercase tracking-[0.12em] text-[#7a8a72]">{lab}</p>
              </div>
            ))}
          </div>
        </Reveal>
      ) : null}

      <Reveal instant={instant} className="px-8 py-8">
        <div className="mx-auto max-w-[300px] rounded-[4px] border border-[#8aa890]/35 bg-white p-5">
          <p className="font-tra-title text-center text-[16px] uppercase tracking-[0.14em] text-[#4a6a4e]">
            {labels.program}
          </p>
          <ul className="mt-5 space-y-3 text-[12px]">
            {items.map(([time, title]) => (
              <li key={`${time}-${title}`} className="flex items-start gap-2 text-[#243020]">
                <span className="min-w-10 font-medium text-[#4a6a4e]">{time}</span>
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <RSVPSection kit={kit} />

      <footer className="px-6 py-8 text-center text-[#4a6a4e]">
        <p className="text-[12px] uppercase tracking-[0.12em]">Сүйүү түбөлүк</p>
      </footer>
    </div>
  );
}

function RSVPSection({ kit }: { kit: LayoutKit }) {
  const { invitation, labels, variant, rsvp, setRsvp, rsvpName, setRsvpName, rsvpDone, setRsvpDone, onReload } = kit;
  const [guestCount, setGuestCount] = useState("1");
  const [wish, setWish] = useState("");
  const ru = kit.locale === "ru";
  const options: [RsvpStatus, string][] = [
    ["yes", ru ? "Ооба, келем" : "Ооба, келем"],
    ["no", ru ? "Жок, келе албаймын" : "Жок, келе албаймын"],
    ["maybe", ru ? "Жубум менен келемин" : "Жубум менен келемин"],
  ];

  return (
    <section className="px-8 py-8">
      <p className="font-tra-title text-center text-[18px] uppercase tracking-[0.14em] text-[#4a6a4e]">
        {ru ? "Катышуу" : "Катышуу"}
      </p>
      {variant !== "guest" ? (
        <p className="mt-4 text-center text-sm text-[#7a8a72]">{labels.rsvpHint}</p>
      ) : (
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rsvpName.trim()) return;
            addRsvp(invitation.id, rsvpName.trim(), rsvp, rsvp === "maybe" ? 1 : 0);
            addWish(invitation.id, rsvpName.trim(), `${ru ? "Коноктор саны" : "Коноктор саны"}: ${guestCount}${wish.trim() ? `\n${wish.trim()}` : ""}`);
            setRsvpDone(true);
            onReload?.();
          }}
        >
          <div className="space-y-2">
            {options.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRsvp(key)}
                className={`flex h-12 w-full items-center gap-3 rounded-[4px] border px-4 text-left text-sm ${
                  rsvp === key ? "border-[#4a6a4e] bg-[#4a6a4e]/10 text-[#4a6a4e]" : "border-[#8aa890]/35 text-[#243020]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className="h-12 w-full rounded-[4px] border border-[#8aa890]/45 bg-[#fffaf3] px-4 text-sm outline-none"
          >
            <option value="1">1 {ru ? "гость" : "конок"}</option>
            <option value="2">2 {ru ? "гостя" : "конок"}</option>
            <option value="3+">3+ {ru ? "гостей" : "конок"}</option>
          </select>
          <input
            required
            value={rsvpName}
            onChange={(e) => setRsvpName(e.target.value)}
            placeholder={labels.yourName}
            className="h-12 w-full rounded-[4px] border border-[#8aa890]/45 bg-[#fffaf3] px-4 text-sm outline-none"
          />
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            rows={3}
            placeholder={labels.guestWishes}
            className="w-full rounded-[4px] border border-[#8aa890]/45 bg-[#fffaf3] px-4 py-3 text-sm outline-none"
          />
          <button type="submit" className="mt-2 flex h-12 w-full items-center justify-center rounded-[4px] bg-[#2f4a3a] text-[11px] uppercase tracking-[0.18em] text-[#fdf8ee]">
            {ru ? "Жөнөтүү" : "Жөнөтүү"}
          </button>
          {rsvpDone ? <p className="pt-2 text-center text-sm text-[#7a8a72]">{labels.rsvpThanks}</p> : null}
        </form>
      )}
    </section>
  );
}
