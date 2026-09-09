"use client";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto, fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";
import { coupleNames, mapsEmbedUrl, pad, programItems } from "./shared";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import { WishesCard } from "./Wishes";

function storyChapters(ru: boolean) {
  return [
    {
      id: "story1",
      title: ru ? "Глава 01 — Как всё началось" : "1-глава — Баары ушундан башталды",
      fallback: ru ? "Мы встретились случайно, а расстаться уже не смогли." : "Биз кокустан жолуктук, бирок ажырай алган жокпуз.",
    },
    {
      id: "story2",
      title: ru ? "Глава 02 — Первое свидание" : "2-глава — Биринчи жолугушуу",
      fallback: ru ? "Один вечер — и мы поняли, что хотим больше таких." : "Бир кечки убакыт — ошондо биз мындай учурлар дагы болушун каалап калдык.",
    },
    {
      id: "story3",
      title: ru ? "Глава 03 — Предложение" : "3-глава — Сунуш",
      fallback: ru ? "Под звёздным небом он задал главный вопрос." : "Жылдыздуу асман алдында ал эң башкы суроону берди.",
    },
  ];
}

function weddingPartySlots(ru: boolean) {
  return [
    { id: "wpBestMan", role: ru ? "Свидетель" : "Күбө", fallback: ru ? "Руслан" : "Руслан" },
    { id: "wpGroomsman", role: ru ? "Друг жениха" : "Күйөөнүн досу", fallback: ru ? "Азамат" : "Азамат" },
    { id: "wpMaidOfHonor", role: ru ? "Свидетельница" : "Күбө", fallback: ru ? "Айгерим" : "Айгерим" },
    { id: "wpBridesmaid", role: ru ? "Подруга невесты" : "Колуктунун досу", fallback: ru ? "Нурай" : "Нурай" },
  ];
}

function faqItems(ru: boolean) {
  return [
    {
      q: ru ? "Что надеть?" : "Эмне кийим кийсем болот?",
      a: ru ? "Нарядный вечерний стиль, избегайте белого и цветов невесты." : "Кооз кечки стиль, ак жана колукту түсүн кийбеңиз.",
    },
    {
      q: ru ? "Будет ли трансфер?" : "Трансфер болобу?",
      a: ru ? "Да, автобус будет ждать у входа за час до начала." : "Ооба, автобус башталганга бир саат калганда кире беришинде күтөт.",
    },
    {
      q: ru ? "Можно ли прийти с парой?" : "Жубу менен келсе болобу?",
      a: ru ? "Пожалуйста, уточните это в форме подтверждения ниже." : "Төмөндөгү форма аркылуу тактап коюңуз.",
    },
  ];
}

export function StarsFamily({ kit }: { kit: LayoutKit }) {
  const { invitation, onChange, a, b, labels, heroPhoto, photos, event, mapHref, mapQuery, venuePhoto, count } = kit;
  const instant = !!onChange;
  const items = programItems(kit);
  const ru = kit.locale === "ru";
  const hasParty = !!onChange || weddingPartySlots(ru).some((s) => invitation.copy?.[`${s.id}Name`] || invitation.gallery?.[s.id]);

  return (
    <div className="overflow-x-hidden bg-[#0d1224] text-[#eef0f6]">
      <Reveal instant={instant} className="relative px-6 pb-4 pt-12 text-center">
        <SlotPhoto
          invitation={invitation}
          onChange={onChange}
          slot="hero"
          src={heroPhoto}
          className="absolute inset-0 h-[400px]"
          imgClass="h-full w-full object-cover opacity-30"
        />
        <div className="relative z-10">
          <h1 className="font-lux text-[48px] uppercase leading-[0.9] text-[#d4af67]">
            {pad(event.getDate())}
          </h1>
          <p className="font-mod mt-2 text-[16px] uppercase tracking-[0.16em] text-[#d4af67]">
            {pad(event.getMonth() + 1)}.{event.getFullYear()}
          </p>
          <h2 className="font-lux mt-4 text-[28px] text-[#eef0f6]">
            <CanvasText
              value={coupleNames(invitation, a, b, " & ")}
              placeholder={`${a} & ${b}`}
              onChange={onChange ? (v) => onChange({ names: v }) : undefined}
              className="bg-transparent"
              multiline={false}
            />
          </h2>
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10 text-center">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="message"
          fallback={invitation.message || kit.fallback}
          className="mx-auto max-w-[320px] font-mod text-[12px] leading-6 text-[#8892ac]"
          multiline
        />
      </Reveal>

      {count ? (
        <Reveal instant={instant} className="px-5 pb-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#8892ac]">
            {fieldValue(invitation, "untilTitle", labels.untilWedding)}
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              [pad(count.d), labels.days],
              [pad(count.h), labels.hours],
              [pad(count.m), labels.mins],
              [pad(count.s), labels.secs],
            ].map(([n, lab]) => (
              <div key={String(lab)} className="rounded-[10px] border border-[#d4af67]/25 bg-[#161c34] py-3">
                <p className="font-lux text-[22px] leading-none text-[#d4af67]">{n}</p>
                <p className="mt-2 text-[8px] uppercase tracking-[0.12em] text-[#8892ac]">{lab}</p>
              </div>
            ))}
          </div>
        </Reveal>
      ) : null}

      <Reveal instant={instant} className="px-8 py-10">
        <div className="space-y-4">
          {storyChapters(ru).map((c) => (
            <div key={c.id} className="rounded-[10px] border border-[#d4af67]/20 bg-[#161c34] p-5">
              <p className="font-mod text-[11px] uppercase tracking-[0.14em] text-[#d4af67]">{c.title}</p>
              <Field
                invitation={invitation}
                onChange={onChange}
                id={c.id}
                fallback={c.fallback}
                className="mt-2 text-[13px] leading-6 text-[#eef0f6]"
                multiline
              />
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-8">
        <div className="grid grid-cols-2 gap-3">
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c0" src={photos[0]} className="h-[150px]" imgClass="h-full w-full object-cover" />
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c1" src={photos[1]} className="h-[150px]" imgClass="h-full w-full object-cover" />
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c2" src={photos[2] || heroPhoto} className="h-[150px]" imgClass="h-full w-full object-cover" />
          <SlotPhoto invitation={invitation} onChange={onChange} slot="c3" src={photos[3] || heroPhoto} className="h-[150px]" imgClass="h-full w-full object-cover" />
        </div>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-10">
        <p className="font-mod text-center text-[12px] uppercase tracking-[0.16em] text-[#d4af67]">
          {labels.program}
        </p>
        <ul className="relative mt-8 space-y-6 pl-6">
          <span className="absolute bottom-1 left-[3px] top-1 w-px bg-[#d4af67]/30" />
          {items.map(([time, title]) => (
            <li key={`${time}-${title}`} className="relative text-[12px] text-[#eef0f6]">
              <span className="absolute -left-6 top-1 h-2 w-2 rounded-full bg-[#d4af67]" />
              <span className="font-medium text-[#d4af67]">{time}</span> {title}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-8 text-center">
        <p className="font-mod text-[12px] uppercase tracking-[0.16em] text-[#d4af67]">
          {ru ? "Церемония" : "Церемония"}
        </p>
        <SlotPhoto invitation={invitation} onChange={onChange} slot="venue" src={venuePhoto || photos[2] || heroPhoto} className="mt-4 h-[160px] w-full rounded-[10px] overflow-hidden" imgClass="h-full w-full object-cover" />
        <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className="mt-3 text-[13px] text-[#eef0f6]" />
        <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className="text-[11px] text-[#8892ac]" />
        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-[#d4af67] px-5 py-2 text-[11px] uppercase tracking-[0.14em] text-[#0d1224]">
          {ru ? "Как добраться" : "Жол көрсөтүү"}
        </a>
      </Reveal>

      <Reveal instant={instant} className="px-8 py-8 text-center">
        <p className="font-mod text-[12px] uppercase tracking-[0.16em] text-[#d4af67]">
          {ru ? "Банкет" : "Банкет"}
        </p>
        <SlotPhoto invitation={invitation} onChange={onChange} slot="venue2" src={photos[4] || photos[1] || heroPhoto} className="mt-4 h-[160px] w-full rounded-[10px] overflow-hidden" imgClass="h-full w-full object-cover" />
        <Field invitation={invitation} onChange={onChange} id="venue2" fallback={fieldValue(invitation, "venue2", invitation.venue)} className="mt-3 text-[13px] text-[#eef0f6]" />
        <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className="mt-4 h-[140px] w-full rounded-[10px] border-0" loading="lazy" />
      </Reveal>

      {hasParty ? (
        <Reveal instant={instant} className="px-8 py-10 text-center">
          <p className="font-mod text-[12px] uppercase tracking-[0.16em] text-[#d4af67]">
            {ru ? "Свадебная свита" : "Той чоролору"}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-6">
            {weddingPartySlots(ru).map((slot) => (
              <div key={slot.id} className="text-center">
                <SlotPhoto invitation={invitation} onChange={onChange} slot={slot.id} src="" className="mx-auto h-16 w-16 rounded-full" imgClass="h-full w-full rounded-full object-cover" />
                <Field invitation={invitation} onChange={onChange} id={`${slot.id}Name`} fallback={slot.fallback} className="mt-2 text-[13px] text-[#eef0f6]" />
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#8892ac]">{slot.role}</p>
              </div>
            ))}
          </div>
        </Reveal>
      ) : null}

      <WishesCard kit={kit} tone="stars" />

      <section className="px-8 pb-10">
        <RsvpForm kit={kit} tone="stars" />
      </section>

      <Reveal instant={instant} className="px-8 pb-10">
        <p className="font-mod text-center text-[12px] uppercase tracking-[0.16em] text-[#d4af67]">FAQ</p>
        <div className="mt-5 space-y-2">
          {faqItems(ru).map((item) => (
            <details key={item.q} className="rounded-[10px] border border-[#d4af67]/20 bg-[#161c34] px-4 py-3">
              <summary className="cursor-pointer text-[13px] text-[#eef0f6]">{item.q}</summary>
              <p className="mt-2 text-[12px] leading-6 text-[#8892ac]">{item.a}</p>
            </details>
          ))}
        </div>
      </Reveal>

      <footer className="px-6 py-8 text-center">
        <p className="font-mod text-[11px] uppercase tracking-[0.12em] text-[#d4af67]">Under the stars</p>
      </footer>
    </div>
  );
}
