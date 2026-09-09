"use client";
import { useState } from "react";
import { addRsvp, addWish } from "@/lib/store";
import type { RsvpStatus } from "@/lib/types";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto, fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, pad, programItems } from "./shared";
import { IconDressOutline, IconSuitOutline } from "./Icons";
import { LaurelMonogram } from "./Ornaments";
import { Reveal } from "./Reveal";

function dressTones(invitation: LayoutKit["invitation"]) {
  const fromCopy = [0, 1, 2, 3]
    .map((i) => invitation.copy?.[`dc${i}`])
    .filter((v): v is string => Boolean(v));
  return fromCopy.length ? fromCopy : ["#f7f2e8", "#c9b389", "#8b5e34", "#3a2c1c"];
}

export function TuscanyFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, event, mapHref, mapQuery, venuePhoto } = kit;
  const instant = !!onChange;
  const items = programItems(kit);
  const tones = dressTones(invitation);

  return (
    <div className="overflow-x-hidden bg-[#f7f2e8] text-[#3a2c1c]">
      <Reveal instant={instant} className="bg-[#2c2016] px-8 py-12 text-center text-[#f7f2e8]">
        <LaurelMonogram initials={`${a.slice(0, 1)}${b.slice(0, 1)}`} className="mx-auto h-16 w-24 text-[#c9b389]" />
        <p className="mt-4 text-[12px] uppercase tracking-[0.16em]">{labels.dearGuests}</p>
        <div className="fam-rom-arch mt-6 h-[240px] overflow-hidden">
          <SlotPhoto
            invitation={invitation}
            onChange={onChange}
            slot="hero"
            src={heroPhoto}
            className="h-full"
            imgClass="h-full w-full object-cover"
          />
        </div>
        <p className="font-ele-script mt-6 text-[28px]">
          <CanvasText
            value={coupleNames(invitation, a, b, " & ")}
            placeholder={`${a} & ${b}`}
            onChange={onChange ? (v) => onChange({ names: v }) : undefined}
            className="bg-transparent"
            multiline={false}
          />
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#c9b389]">
          Save the Date · {pad(event.getDate())}.{pad(event.getMonth() + 1)}.{event.getFullYear()}
        </p>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10">
        <p className="font-tra-title text-center text-[14px] uppercase tracking-[0.16em] text-[#3a2c1c]">
          {labels.program}
        </p>
        <ul className="mt-6 space-y-2 text-[12px] text-[#3a2c1c]">
          {items.map(([time, title]) => (
            <li key={`${time}-${title}`} className="flex items-start gap-3">
              <span className="min-w-12 font-medium text-[#8b5e34]">{time}</span>
              <span>{title}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <div className="mx-auto w-[220px] rotate-[-4deg] border-8 border-white bg-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="polaroid" src={photos[0] || heroPhoto} className="h-[220px] w-full" imgClass="h-full w-full object-cover" />
          <p className="font-ele-script py-3 text-center text-[16px] text-[#3a2c1c]">
            {fieldValue(invitation, "polaroidCaption", "Everything began with a look")}
          </p>
        </div>
        <Field
          invitation={invitation}
          onChange={onChange}
          id="ourStory"
          fallback={invitation.message || kit.fallback}
          className="mx-auto mt-6 max-w-[300px] text-[13px] leading-7 text-[#3a2c1c]"
          multiline
        />
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

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="font-tra-title text-[14px] uppercase tracking-[0.16em] text-[#3a2c1c]">{labels.location}</p>
        <p className="mt-4 text-[12px] text-[#3a2c1c]">
          <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="text-[13px]" />
          <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="text-[11px] text-[#8a7a64]" />
        </p>
        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-none border border-[#8b5e34] px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-[#8b5e34]">
          {labels.map}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-4 h-[140px] w-full border-0" loading="lazy" />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="font-tra-title text-[14px] uppercase tracking-[0.16em] text-[#3a2c1c]">
          {kit.locale === "ru" ? "Проживание" : "Жашоо-жай"}
        </p>
        <SlotPhoto invitation={invitation} onChange={onChange} slot="stay" src={photos[3] || photos[1] || heroPhoto} className="mt-5 h-[160px] w-full" imgClass="h-full w-full object-cover" />
        <Field
          invitation={invitation}
          onChange={onChange}
          id="stayNote"
          fallback={kit.locale === "ru" ? "Для гостей издалека забронирован отель рядом с площадкой" : "Алыстан келген коноктор үчүн жайдын жанынан мейманкана даярдалды"}
          className="mx-auto mt-4 max-w-[280px] text-[12px] leading-6 text-[#3a2c1c]"
          multiline
        />
        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-none border border-[#8b5e34] px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-[#8b5e34]">
          {kit.locale === "ru" ? "Забронировать" : "Брондоо"}
        </a>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="font-tra-title text-[14px] uppercase tracking-[0.16em] text-[#3a2c1c]">{labels.dressCode}</p>
        <div className="mt-4 flex justify-center gap-3">
          {tones.map((color) => (
            <span key={color} className="h-7 w-7 rounded-full border border-[#8b5e34]/35" style={{ background: color }} />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-6 text-[#8b5e34]">
          <IconDressOutline className="h-9 w-9" />
          <IconSuitOutline className="h-9 w-9" />
        </div>
        <p className="font-ele-script mt-4 text-[16px] text-[#8b5e34]">Grazie di cuore</p>
      </Reveal>

      <RSVPSection kit={kit} />

      <footer className="px-6 py-8 text-center text-[#8b5e34]">
        <p className="font-ele-script text-[18px]">Amore</p>
      </footer>
    </div>
  );
}

function RSVPSection({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, labels, variant, rsvp, setRsvp, rsvpName, setRsvpName, rsvpDone, setRsvpDone, onReload, a, b } = kit;
  const [guestCount, setGuestCount] = useState("1");
  const [wish, setWish] = useState("");
  const ru = kit.locale === "ru";

  return (
    <section className="px-8 py-10">
      <Field
        invitation={invitation}
        onChange={onChange}
        id="rsvpTitle"
        fallback={ru ? "Подтверждение присутствия" : "Катышууну ырастоо"}
        className="font-tra-title text-center text-[16px] uppercase tracking-[0.14em] text-[#3a2c1c]"
      />
      {variant !== "guest" ? (
        <p className="mt-4 text-center text-sm text-[#8a7a64]">{labels.rsvpHint}</p>
      ) : (
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rsvpName.trim()) return;
            addRsvp(invitation.id, rsvpName.trim(), rsvp, rsvp === "maybe" ? 1 : 0);
            addWish(invitation.id, rsvpName.trim(), `${ru ? "Гостей" : "Коноктор"}: ${guestCount}${wish.trim() ? `\n${wish.trim()}` : ""}`);
            setRsvpDone(true);
            onReload?.();
          }}
        >
          <div className="space-y-2">
            {(
              [
                ["yes", fieldValue(invitation, "rsvpYes", labels.rsvpYes)],
                ["no", fieldValue(invitation, "rsvpNo", labels.rsvpNo)],
              ] as [RsvpStatus, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRsvp(key)}
                className={`flex h-12 w-full items-center gap-3 border px-4 text-left text-sm ${
                  rsvp === key ? "border-[#8b5e34] bg-[#8b5e34]/10 text-[#8b5e34]" : "border-[#8b5e34]/30 text-[#3a2c1c]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className="h-12 w-full border border-[#8b5e34]/35 bg-white px-4 text-sm outline-none"
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
            className="h-12 w-full border border-[#8b5e34]/35 bg-white px-4 text-sm outline-none"
          />
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            rows={3}
            placeholder={labels.guestWishes}
            className="w-full border border-[#8b5e34]/35 bg-white px-4 py-3 text-sm outline-none"
          />
          <button type="submit" className="mt-2 flex h-12 w-full items-center justify-center bg-[#8b5e34] text-[11px] uppercase tracking-[0.16em] text-[#fff8ec]">
            {fieldValue(invitation, "rsvpSend", labels.rsvpSend)}
          </button>
          {rsvpDone ? <p className="pt-2 text-center text-sm text-[#8a7a64]">{labels.rsvpThanks}</p> : null}
        </form>
      )}
      <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b5e34] text-[9px] uppercase tracking-[0.1em] text-[#fff8ec] shadow-[0_6px_14px_rgba(0,0,0,0.25)]">
        {a.slice(0, 1)}&{b.slice(0, 1)}
      </div>
    </section>
  );
}
