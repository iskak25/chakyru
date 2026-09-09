"use client";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto, fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, pad, programItems } from "./shared";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

function dressTones(invitation: LayoutKit["invitation"]) {
  const fromCopy = [0, 1, 2]
    .map((i) => invitation.copy?.[`dc${i}`])
    .filter((v): v is string => Boolean(v));
  return fromCopy.length ? fromCopy : ["#efe6d3", "#c9b389", "#7a6a4a"];
}

export function MeadowFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, event, mapHref, mapQuery, venuePhoto } = kit;
  const instant = !!onChange;
  const items = programItems(kit);
  const tones = dressTones(invitation);

  return (
    <div className="overflow-x-hidden bg-[#f7f3ec] text-[#2c261c]">
      <Reveal instant={instant} className="px-6 pb-8 pt-12 text-center">
        <h1 className="font-lux break-words text-[clamp(32px,10vw,44px)] uppercase leading-[1.15] text-[#2c261c]">
          МЫ ЖЕНИМСЯ!
        </h1>
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="hero"
          src={heroPhoto}
          className="mt-4 h-[280px]"
          imgClass="h-full w-full object-cover"
        />
        <h2 className="font-lux mt-6 text-[28px] text-[#2c261c]">
          <CanvasText
            value={coupleNames(invitation, a, b, " & ")}
            placeholder={`${a} & ${b}`}
            onChange={onChange ? (v) => onChange({ names: v }) : undefined}
            className="bg-transparent"
            multiline={false}
          />
        </h2>
        <p className="font-ivory mt-3 text-[14px] tracking-[0.16em] text-[#7a6a4a]">
          {pad(event.getDate())}.{pad(event.getMonth() + 1)}.{event.getFullYear()}
        </p>
      </Reveal>

      <Reveal instant={instant} className="px-6 py-8 text-center">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="mx-auto max-w-[300px] text-[13px] leading-7 text-[#2c261c]"
          multiline
        />
      </Reveal>

      <Reveal instant={instant} className="px-6 py-8">
        <div className="grid grid-cols-2 gap-3">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="col-span-1 row-span-2 h-[280px]" imgClass="h-full w-full object-cover" />
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c1" src={photos[1]} className="mt-6 h-[130px]" imgClass="h-full w-full object-cover" />
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c2" src={photos[2] || heroPhoto} className="h-[130px]" imgClass="h-full w-full object-cover" />
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-8 text-center">
        <p className="text-[13px] uppercase tracking-[0.16em] text-[#7a6a4a]">{labels.location}</p>
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="venue"
          src={venuePhoto || photos[3] || heroPhoto}
          className="mt-5 h-[180px] w-full"
          imgClass="h-full w-full object-cover"
        />
        <p className="mt-4 text-[12px] text-[#2c261c]">
          <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="text-[13px]" />
          <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="text-[11px] text-[#8a7f68]" />
        </p>
        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-none border border-[#7a6a4a] px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-[#7a6a4a]">
          {labels.map}
        </a>
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-4 h-[140px] w-full border-0" loading="lazy" />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10">
        <p className="text-center text-[13px] uppercase tracking-[0.16em] text-[#7a6a4a]">{labels.program}</p>
        <ul className="mt-6 space-y-3 text-[12px]">
          {items.map(([time, title]) => (
            <li key={`${time}-${title}`} className="flex items-start gap-3 text-[#2c261c]">
              <span className="min-w-12 font-medium text-[#7a6a4a]">{time}</span>
              <span>{title}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <p className="text-[13px] uppercase tracking-[0.16em] text-[#7a6a4a]">{labels.dressCode}</p>
        <div className="mt-4 flex justify-center gap-3">
          {tones.map((color) => (
            <span key={color} className="h-8 w-8 rounded-full border border-[#7a6a4a]/30" style={{ background: color }} />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="dc-photo0" src={photos[3] || ""} className="h-[100px]" imgClass="h-full w-full object-cover" />
          <SlotPhoto invitation={invitation} onChange={onChange} slot="dc-photo1" src={photos[4] || ""} className="h-[100px]" imgClass="h-full w-full object-cover" />
          <SlotPhoto invitation={invitation} onChange={onChange} slot="dc-photo2" src={photos[5] || ""} className="h-[100px]" imgClass="h-full w-full object-cover" />
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-8 text-center">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="giftsNote"
          fallback={fieldValue(invitation, "giftsNote", kit.locale === "ru" ? "Пожелания — Подарки: цените внимание, а не упаковку" : "Каалоолор — Белектер: чоо-жайды эмес, көңүл буруусун баалаңыз")}
          className="mx-auto max-w-[300px] text-[12px] leading-6 text-[#2c261c]"
          multiline
        />
        <Field
          invitation={invitation}
          onChange={onChange}
          id="noFlowers"
          fallback={kit.locale === "ru" ? "Без цветов" : "Гүлсүз"}
          className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[#7a6a4a]"
        />
      </Reveal>

      <Reveal instant={instant} className="px-8 py-8 text-center">
        <p className="text-[13px] uppercase tracking-[0.16em] text-[#7a6a4a]">{labels.phoneCta}</p>
        <Field invitation={invitation} onChange={onChange} id="hosts" fallback={invitation.hosts} className="mt-3 text-[14px] leading-7 text-[#2c261c]" />
        <Field invitation={invitation} onChange={onChange} id="phoneA" fallback={fieldValue(invitation, "phoneA", "")} className="text-[13px] text-[#7a6a4a]" />
      </Reveal>

      <WishesCard kit={kit} tone="meadow" />

      <section className="px-8 pb-10">
        <RsvpForm kit={kit} tone="meadow" />
      </section>

      <footer className="px-6 py-8 text-center text-[#7a6a4a]">
        <p className="text-[12px]">С любовью!</p>
      </footer>
    </div>
  );
}
