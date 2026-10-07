"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Invitation, RsvpStatus } from "@/lib/types";
import type { WeddingPartInfo } from "@/lib/weddingEditor";
import type { InvitePatch } from "../CanvasEdit";
import { WeddingEditor, WeddingPart } from "../WeddingEditor";
import type { LayoutKit, Site3DLabels } from "../Site3DLayouts";
import { CalendarGrid, KyalRule, MountainSilhouette } from "./Ornaments";
import { addHour, mapsEmbedUrl, monthLabel, pad } from "./shared";
import { RsvpForm } from "./RsvpForm";
import { WishesCarousel } from "../WishesCarousel";
import css from "./TushooNavy.module.css";

const ART = "/images/templates/tushoo-ayat/hero.webp";

type TushooKit = Pick<LayoutKit, "invitation" | "onChange" | "labels" | "event" | "count" | "mapHref" | "mapQuery" | "venuePhoto" | "locale" | "variant" | "rsvp" | "setRsvp" | "rsvpName" | "setRsvpName" | "rsvpDone" | "setRsvpDone" | "onReload"> & {
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  onPartsChange?: (parts: WeddingPartInfo[]) => void;
};

export function TushooNavyInvite({ invitation, locale, labels, onChange, onReload, compact, selected, onSelect, onPartsChange }: {
  invitation: Invitation; locale: string; labels: Site3DLabels; onChange?: InvitePatch; onReload?: () => void; compact?: boolean;
  selected?: string | null; onSelect?: (id: string | null) => void; onPartsChange?: (parts: WeddingPartInfo[]) => void;
}) {
  const [count, setCount] = useState<LayoutKit["count"]>(null);
  const [rsvp, setRsvp] = useState<RsvpStatus>("yes");
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpDone, setRsvpDone] = useState(false);
  const target = new Date(`${invitation.date}T${invitation.time || "15:00"}:00`).getTime();
  useEffect(() => {
    const update = () => {
      if (!Number.isFinite(target)) return;
      const diff = Math.max(0, target - Date.now());
      setCount({ done: diff === 0, d: Math.floor(diff / 86400000), h: Math.floor(diff / 3600000) % 24, m: Math.floor(diff / 60000) % 60, s: Math.floor(diff / 1000) % 60 });
    };
    const first = setTimeout(update, 0);
    const timer = setInterval(update, 1000);
    return () => { clearTimeout(first); clearInterval(timer); };
  }, [target]);
  if (compact && !onChange) return <TushooNavyThumb name={invitation.names} />;
  const mapQuery = [invitation.venue, invitation.address, invitation.city].filter(Boolean).join(", ");
  const mapHref = /^https?:\/\//i.test(invitation.mapUrl || "") ? invitation.mapUrl! : `https://2gis.kg/search/${encodeURIComponent(mapQuery)}`;
  return <div className="mx-auto w-full max-w-[430px]" data-family="tushooNavy"><TushooNavyFamily kit={{
    invitation, locale, labels, onChange, onReload, event: new Date(target), count, mapQuery, mapHref,
    venuePhoto: invitation.gallery?.venue || "", variant: onChange ? "editor" : "guest",
    rsvp, setRsvp, rsvpName, setRsvpName, rsvpDone, setRsvpDone, selected, onSelect, onPartsChange,
  }} /></div>;
}

export function TushooNavyThumb({ name = "Аят" }: { name?: string }) {
  return <div className={css.thumb}>
    <img src={ART} alt="" className={css.art} />
    <div className={css.thumbText}><span className="font-tra-script">{name}</span><p>ТУШОО ТОЙ</p></div>
  </div>;
}

export function TushooNavyFamily({ kit }: { kit: TushooKit }) {
  const { invitation, onChange, labels, event, count, mapHref, mapQuery, selected, onSelect, onPartsChange } = kit;
  const ru = kit.locale === "ru";
  const editing = !!onChange;
  const title = invitation.eventType === "birthday" ? (ru ? "День рождения" : "Туулган күн") : "Тушоо той";
  const tr = (a: string, b: string) => (ru ? a : b);
  const text = (id: string, fallback: string, className = "", field?: WeddingPartInfo["field"], label?: string) =>
    <WeddingPart id={id} label={label || fallback || id} kind="text" fallback={fallback} className={className} field={field} />;
  const block = (id: string, label: string, className: string, children: ReactNode) =>
    <WeddingPart id={`section-${id}`} label={label} kind="block" className={className}>{children}</WeddingPart>;
  const photo = (slot: string, label: string, className: string, fallback = "") =>
    (editing || invitation.gallery?.[slot] || fallback) ? <WeddingPart id={`photo-${slot}`} label={label} kind="image" slot={slot} fallback={fallback} className={className} /> : null;
  const steps = [
    [invitation.time || "15:00", tr("Встречаем дорогих гостей", "Конокторду тосуп алуу")],
    [addHour(invitation.time, 1), tr("Первые шаги — тушоо кесүү", "Тушоо кесүү")],
    [addHour(invitation.time, 2), tr("Праздничный дасторкон", "Майрамдык дасторкон")],
    [addHour(invitation.time, 3), tr("Торт, улыбки и добрые пожелания", "Торт жана жакшы тилектер")],
  ];
  const story = [
    [tr("Первая улыбка", "Биринчи жылмаюу"), tr("Она осветила наш дом", "Үйүбүздү нурга бөгөн")],
    [tr("Первое слово", "Биринчи сөз"), tr("«Апа» — самое дорогое слово", "«Апа» — эң кымбат сөз")],
    [tr("Первые шаги", "Алгачкы кадам"), tr("Сегодня мы делаем их вместе с вами", "Бүгүн аларды силер менен чогуу жасайбыз")],
  ];
  const wishes = [
    ["✦", "Ак бата", tr("Тёплые слова и благословение от родных и близких", "Жакындардан жылуу сөз жана ак бата")],
    ["♥", "Тушоо кесүү", tr("Малыш сделает первые шаги — пусть дорога будет лёгкой", "Бөбөктүн алгачкы кадамы — жолу шыдыр болсун")],
    ["❖", tr("Дресс-код", "Кийим стили"), tr("Нежные оттенки: синий, молочный, золотой", "Назик түстөр: көк, ак, алтын")],
  ];
  return <div className={css.root}>
    <WeddingEditor invitation={invitation} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} locale={kit.locale}>
      {block("hero", "Обложка", css.hero, <>
        <WeddingPart id="photo-hero" label="Иллюстрация обложки" kind="image" slot="hero" fallback={ART} className={css.art} style={{ position: "absolute", inset: 0 }} />
        <div className={css.heroText}>
          {text("hero-overline", tr("Маленькие шаги · большое счастье", "Кичинекей кадам · чоң бакыт"), css.eyebrow)}
          <WeddingPart id="names" label="Имя ребёнка" kind="text" field="names" fallback="Аят" className={`${css.name} font-tra-script`} />
          {text("eventTitle", title, css.title, undefined, "Название праздника")}
          <WeddingPart id="event-date" label="Дата праздника" kind="date" className={css.date}>{event.getDate()} {monthLabel(kit)} {event.getFullYear()}</WeddingPart>
          <WeddingPart id="hero-heart" label="Сердечко" kind="decoration" className={css.heart}>♥</WeddingPart>
        </div>
      </>)}

      {block("intro", "Приглашение", css.section, <>
        {text("intro-overline", tr("Приглашение с любовью", "Сүйүү менен чакырабыз"), css.eyebrow)}
        {text("intro-title", labels.dearGuests, css.heading)}
        <KyalRule className={css.rule} />
        {text("message", tr("Приглашаем вас разделить радость первых шагов нашего малыша! Пусть этот день наполнится вашими улыбками, тёплыми словами и добрыми пожеланиями.", "Бөбөгүбүздүн тушоо тоюна келип, кубанычыбызды тең бөлүшүүгө чакырабыз! Ак батаңыздар менен анын алгачкы кадамдарына күбө болуп кетиңиздер."), css.message, "message", "Текст приглашения")}
        {(editing || invitation.hosts) ? text("hosts", invitation.hosts || "С любовью, родители", css.hosts, "hosts", "Хозяева праздника") : null}
      </>)}

      {block("calendar", "Календарь", css.section, <>
        {text("calendar-overline", tr("Отметьте в календаре", "Календарга белгилеп коюңуз"), css.eyebrow)}
        {text("calendar-title", `${event.getDate()} ${monthLabel(kit)}`, css.heading, undefined, "Заголовок календаря")}
        <WeddingPart id="calendar-widget" label="Календарь" kind="widget" className={css.calendar}>
          <CalendarGrid
            date={event}
            monthLabel={monthLabel(kit)}
            cellClassName="text-[#102e50]"
            headClassName="text-[#8b6938]"
            highlightClassName="bg-[#102e50] text-[#e6c991] ring-2 ring-[#bd9455] ring-offset-2 ring-offset-[#fff9ef]"
          />
          <p className={css.calendarTime}>♥ {invitation.time || "15:00"}</p>
        </WeddingPart>
      </>)}

      {block("countdown", "Обратный отсчёт", css.countdown, <>
        {text("countdown-overline", tr("До нашего праздника", "Тойго чейин"), css.eyebrow)}
        <WeddingPart id="countdown-widget" label="Таймер" kind="widget">
          {count ? <div className={css.digits}>{[[count.d, labels.days], [count.h, labels.hours], [count.m, labels.mins], [count.s, labels.secs]].map(([value, label]) => <div key={String(label)}><strong>{pad(Number(value))}</strong><span>{label}</span></div>)}</div> : <p className={css.heading}>{labels.started}</p>}
        </WeddingPart>
        <KyalRule className={css.rule} />
      </>)}

      {(editing || invitation.gallery?.child) ? block("child", "Фото малыша", css.section, photo("child", "Фото малыша", css.childPhoto)) : null}

      {block("story", "Наша история", css.section, <>
        {text("story-overline", tr("Наша маленькая история", "Биздин кичинекей баян"), css.eyebrow)}
        {text("story-title", tr("Как мы росли", "Кантип чоңойдук"), css.heading)}
        <KyalRule className={css.rule} />
        <div className={css.story}>{story.map(([head, note], i) => <div key={i} className={css.storyItem}>
          <span className={css.storyDot} aria-hidden="true">{i + 1}</span>
          <div>{text(`story-${i}-title`, head, css.storyHead)}{text(`story-${i}-text`, note, css.storyText)}</div>
        </div>)}</div>
      </>)}

      {block("program", "Программа дня", css.section, <>
        {text("program-overline", tr("Счастливые моменты", "Бактылуу көз ирмемдер"), css.eyebrow)}
        {text("program-title", labels.program, css.heading)}
        <div className={css.program}>{steps.map(([time, note], i) => <div key={i} className={css.programRow}>
          {text(`p${i + 1}t`, time, css.programTime, undefined, `Время ${i + 1}`)}
          <span className={css.star} aria-hidden="true">✦</span>
          {text(`p${i + 1}`, note, "", undefined, `Пункт программы ${i + 1}`)}
        </div>)}</div>
      </>)}

      {block("wishes", "Пожелания", css.section, <>
        {text("wishes-overline", tr("Добрые традиции", "Жакшы салттар"), css.eyebrow)}
        {text("wishes-title", tr("Пожелания малышу", "Бөбөккө тилек"), css.heading)}
        <KyalRule className={css.rule} />
        <div className={css.wishes}>{wishes.map(([icon, head, note], i) => <WeddingPart key={i} id={`wish-${i}`} label={`Карточка: ${head}`} kind="block" className={css.wish}>
          <span className={css.star} aria-hidden="true">{icon}</span>
          {text(`wish-${i}-title`, head, css.wishHead)}
          {text(`wish-${i}-text`, note, css.wishText)}
        </WeddingPart>)}</div>
      </>)}

      {block("venue", "Место проведения", css.venue, <>
        {text("venue-overline", tr("Место нашей встречи", "Жолугушчу жерибиз"), css.eyebrow)}
        {text("venue-title", labels.location, css.heading)}
        <KyalRule className={css.rule} />
        {photo("venue", "Фото места", css.venuePhoto)}
        {text("venue", invitation.venue || "Место проведения", css.venueName, "venue", "Название места")}
        {text("address", invitation.address || "Адрес", css.message, "address", "Адрес")}
        <WeddingPart id="venue-date" label="Дата и время" kind="date" className={css.message}>{pad(event.getDate())}.{pad(event.getMonth() + 1)}.{event.getFullYear()} · {invitation.time}</WeddingPart>
        <WeddingPart id="map-button" label="Кнопка карты" kind="widget">
          <a href={mapHref} target="_blank" rel="noopener noreferrer" onClick={e => { if (editing) e.preventDefault(); }} className={css.mapButton}>{labels.map} ↗</a>
        </WeddingPart>
        <WeddingPart id="map-embed" label="Карта" kind="widget">
          <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className={css.map} loading="lazy" style={editing ? { pointerEvents: "none" } : undefined} />
        </WeddingPart>
      </>)}

      {block("rsvp", "Ответ гостя", css.section, <>
        {text("rsvp-overline", tr("Будем ждать вас", "Сиздерди күтөбүз"), css.eyebrow)}
        {text("rsvp-title", tr("Вы придёте?", "Келесизби?"), css.heading)}
        {text("rsvp-hint", labels.rsvpHint, css.message)}
        <WeddingPart id="rsvp-form" label="Форма ответа" kind="widget" className={css.rsvp}><RsvpForm kit={kit} tone="tushooNavy" /></WeddingPart>
      </>)}

      {(editing || (invitation.wishes || []).some(w => !w.hidden)) ? block("guest-wishes", "Пожелания гостей", css.section, <>
        {text("guest-wishes-overline", tr("Тёплые слова", "Жылуу сөздөр"), css.eyebrow)}
        {text("guest-wishes-title", tr("Пожелания гостей", "Коноктордун каалоолору"), css.heading)}
        <KyalRule className={css.rule} />
        <WeddingPart id="guest-wishes-widget" label="Пожелания гостей" kind="widget" className={css.guestWishes}>
          <WishesCarousel invitation={invitation} ru={ru} editable={editing} onChange={onChange} />
        </WeddingPart>
      </>) : null}

      {block("footer", "Подвал", css.footer, <>
        <WeddingPart id="footer-heart" label="Сердечко" kind="decoration" className={css.heart}>♥</WeddingPart>
        <WeddingPart id="footer-names" label="Имя в подвале" kind="text" field="names" fallback="Аят" className={`${css.footerName} font-tra-script`} />
        {text("footer-wish", tr("Пусть каждый шаг будет счастливым", "Ар бир кадамың кут болсун"), css.eyebrow)}
        <MountainSilhouette className={css.mountains} />
      </>)}
    </WeddingEditor>
  </div>;
}
