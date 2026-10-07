"use client";

import { useEffect, useState } from "react";
import type { Invitation, RsvpStatus } from "@/lib/types";
import type { InvitePatch } from "../CanvasEdit";
import { CanvasText } from "../CanvasEdit";
import { Field, SlotPhoto } from "../SiteEdit";
import type { LayoutKit, Site3DLabels } from "../Site3DLayouts";
import { CalendarGrid, KyalRule, MountainSilhouette } from "./Ornaments";
import { addHour, mapsEmbedUrl, monthLabel, pad } from "./shared";
import { Reveal } from "./Reveal";
import { RsvpForm } from "./RsvpForm";
import css from "./TushooNavy.module.css";

const ART = "/images/templates/tushoo-ayat/hero.webp";

type TushooKit = Pick<LayoutKit, "invitation" | "onChange" | "labels" | "event" | "count" | "mapHref" | "mapQuery" | "venuePhoto" | "locale" | "variant" | "rsvp" | "setRsvp" | "rsvpName" | "setRsvpName" | "rsvpDone" | "setRsvpDone" | "onReload">;

export function TushooNavyInvite({ invitation, locale, labels, onChange, onReload, compact }: {
  invitation: Invitation; locale: string; labels: Site3DLabels; onChange?: InvitePatch; onReload?: () => void; compact?: boolean;
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
    rsvp, setRsvp, rsvpName, setRsvpName, rsvpDone, setRsvpDone,
  }} /></div>;
}

export function TushooNavyThumb({ name = "Аят" }: { name?: string }) {
  return <div className={css.thumb}>
    <img src={ART} alt="" className={css.art} />
    <div className={css.thumbText}><span className="font-tra-script">{name}</span><p>ТУШОО ТОЙ</p></div>
  </div>;
}

export function TushooNavyFamily({ kit }: { kit: TushooKit }) {
  const { invitation, onChange, labels, event, count, mapHref, mapQuery, venuePhoto } = kit;
  const ru = kit.locale === "ru";
  const instant = !!onChange;
  const title = invitation.eventType === "birthday" ? (ru ? "День рождения" : "Туулган күн") : "Тушоо той";
  const steps = [
    [invitation.time || "15:00", ru ? "Встречаем дорогих гостей" : "Конокторду тосуп алуу"],
    [addHour(invitation.time, 1), ru ? "Первые шаги — тушоо кесүү" : "Тушоо кесүү"],
    [addHour(invitation.time, 2), ru ? "Праздничный дасторкон" : "Майрамдык дасторкон"],
    [addHour(invitation.time, 3), ru ? "Торт, улыбки и добрые пожелания" : "Торт жана жакшы тилектер"],
  ];
  return <div className={css.root}>
    <section className={css.hero}>
      <img src={ART} alt="" className={css.art} fetchPriority="high" />
      <div className={css.heroText}>
        <p className={css.eyebrow}>{ru ? "Маленькие шаги · большое счастье" : "Кичинекей кадам · чоң бакыт"}</p>
        <h1 className="font-tra-script"><CanvasText value={invitation.names || "Аят"} placeholder="Аят" onChange={onChange ? names => onChange({ names }) : undefined} className="bg-transparent" multiline /></h1>
        <Field invitation={invitation} onChange={onChange} id="eventTitle" fallback={title} className={css.title} />
        <p className={css.date}>{event.getDate()} {monthLabel(kit)} {event.getFullYear()}</p>
        <span className={css.heart} aria-hidden="true">♥</span>
      </div>
    </section>

    <Reveal instant={instant} className={css.section}>
      <p className={css.eyebrow}>{ru ? "Приглашение с любовью" : "Сүйүү менен чакырабыз"}</p>
      <h2 className={css.heading}>{labels.dearGuests}</h2>
      <KyalRule className={css.rule} />
      <Field invitation={invitation} onChange={onChange} id="message" fallback={invitation.message || (ru ? "Приглашаем вас разделить радость первых шагов нашего малыша! Пусть этот день наполнится вашими улыбками, тёплыми словами и добрыми пожеланиями." : "Бөбөгүбүздүн тушоо тоюна келип, кубанычыбызды тең бөлүшүүгө чакырабыз! Ак батаңыздар менен анын алгачкы кадамдарына күбө болуп кетиңиздер.")} className={css.message} multiline />
      <Field invitation={invitation} onChange={onChange} id="hosts" fallback={invitation.hosts} className={css.hosts} />
    </Reveal>

    <Reveal instant={instant} className={css.section}>
      <p className={css.eyebrow}>{ru ? "Отметьте в календаре" : "Календарга белгилеп коюңуз"}</p>
      <h2 className={css.heading}>{event.getDate()} {monthLabel(kit)}</h2>
      <div className={css.calendar}>
        <CalendarGrid
          date={event}
          monthLabel={monthLabel(kit)}
          cellClassName="text-[#102e50]"
          headClassName="text-[#8b6938]"
          highlightClassName="bg-[#102e50] text-[#e6c991] ring-2 ring-[#bd9455] ring-offset-2 ring-offset-[#fff9ef]"
        />
        <p className={css.calendarTime}>♥ {invitation.time || "15:00"}</p>
      </div>
    </Reveal>

    <Reveal instant={instant} className={css.countdown}>
      <p className={css.eyebrow}>{ru ? "До нашего праздника" : "Тойго чейин"}</p>
      {count ? <div className={css.digits}>{[[count.d, labels.days], [count.h, labels.hours], [count.m, labels.mins], [count.s, labels.secs]].map(([value, label]) => <div key={String(label)}><strong>{pad(Number(value))}</strong><span>{label}</span></div>)}</div> : <p className={css.heading}>{labels.started}</p>}
      <KyalRule className={css.rule} />
    </Reveal>

    {(invitation.gallery?.child || onChange) && <Reveal instant={instant} className={css.section}>
      <SlotPhoto invitation={invitation} onChange={onChange} slot="child" src={invitation.gallery?.child || ""} className={css.childPhoto} imgClass="h-full w-full object-cover" />
    </Reveal>}

    <Reveal instant={instant} className={css.section}>
      <p className={css.eyebrow}>{ru ? "Наша маленькая история" : "Биздин кичинекей баян"}</p>
      <h2 className={css.heading}>{ru ? "Как мы росли" : "Кантип чоңойдук"}</h2>
      <KyalRule className={css.rule} />
      <ul className={css.story}>{[
        [ru ? "Первая улыбка" : "Биринчи жылмаюу", ru ? "Она осветила наш дом" : "Үйүбүздү нурга бөгөн"],
        [ru ? "Первое слово" : "Биринчи сөз", ru ? "«Апа» — самое дорогое слово" : "«Апа» — эң кымбат сөз"],
        [ru ? "Первые шаги" : "Алгачкы кадам", ru ? "Сегодня мы делаем их вместе с вами" : "Бүгүн аларды силер менен чогуу жасайбыз"],
      ].map(([head, text], i) => <li key={i}>
        <span className={css.storyDot} aria-hidden="true">{i + 1}</span>
        <div><strong>{head}</strong><p>{text}</p></div>
      </li>)}</ul>
    </Reveal>

    <Reveal instant={instant} className={css.section}>
      <p className={css.eyebrow}>{ru ? "Счастливые моменты" : "Бактылуу көз ирмемдер"}</p>
      <h2 className={css.heading}>{labels.program}</h2>
      <ol className={css.program}>{steps.map(([time, text], i) => <li key={i}>
        <Field invitation={invitation} onChange={onChange} id={`p${i + 1}t`} fallback={time} className={css.programTime} />
        <span className={css.star} aria-hidden="true">✦</span>
        <Field invitation={invitation} onChange={onChange} id={`p${i + 1}`} fallback={text} multiline />
      </li>)}</ol>
    </Reveal>

    <Reveal instant={instant} className={css.section}>
      <p className={css.eyebrow}>{ru ? "Добрые традиции" : "Жакшы салттар"}</p>
      <h2 className={css.heading}>{ru ? "Пожелания малышу" : "Бөбөккө тилек"}</h2>
      <KyalRule className={css.rule} />
      <div className={css.wishes}>{[
        ["✦", ru ? "Ак бата" : "Ак бата", ru ? "Тёплые слова и благословение от родных и близких" : "Жакындардан жылуу сөз жана ак бата"],
        ["♥", ru ? "Тушоо кесүү" : "Тушоо кесүү", ru ? "Малыш сделает первые шаги — пусть дорога будет лёгкой" : "Бөбөктүн алгачкы кадамы — жолу шыдыр болсун"],
        ["❖", ru ? "Дресс-код" : "Кийим стили", ru ? "Нежные оттенки: синий, молочный, золотой" : "Назик түстөр: көк, ак, алтын"],
      ].map(([icon, head, text], i) => <div key={i} className={css.wish}>
        <span className={css.star} aria-hidden="true">{icon}</span>
        <strong>{head}</strong>
        <p>{text}</p>
      </div>)}</div>
    </Reveal>

    <Reveal instant={instant} className={css.venue}>
      <p className={css.eyebrow}>{ru ? "Место нашей встречи" : "Жолугушчу жерибиз"}</p>
      <h2 className={css.heading}>{labels.location}</h2>
      <KyalRule className={css.rule} />
      {(venuePhoto || onChange) && <SlotPhoto invitation={invitation} onChange={onChange} slot="venue" src={venuePhoto || ""} className={css.venuePhoto} imgClass="h-full w-full object-cover" />}
      <Field invitation={invitation} onChange={onChange} id="venue" fallback={invitation.venue} className={css.venueName} />
      <Field invitation={invitation} onChange={onChange} id="address" fallback={invitation.address} className={css.message} />
      <p className={css.message}>{pad(event.getDate())}.{pad(event.getMonth() + 1)}.{event.getFullYear()} · {invitation.time}</p>
      <a href={mapHref} target="_blank" rel="noopener noreferrer" className={css.mapButton}>{labels.map} ↗</a>
      <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className={css.map} loading="lazy" />
    </Reveal>

    <Reveal instant={instant} className={css.section}>
      <p className={css.eyebrow}>{ru ? "Будем ждать вас" : "Сиздерди күтөбүз"}</p>
      <h2 className={css.heading}>{ru ? "Вы придёте?" : "Келесизби?"}</h2>
      <p className={css.message}>{labels.rsvpHint}</p>
      <div className={css.rsvp}><RsvpForm kit={kit} tone="tushooNavy" /></div>
    </Reveal>
    <footer className={css.footer}>
      <span className={css.heart} aria-hidden="true">♥</span>
      <p className="font-tra-script">{invitation.names || "Аят"}</p>
      <p className={css.eyebrow}>{ru ? "Пусть каждый шаг будет счастливым" : "Ар бир кадамың кут болсун"}</p>
      <MountainSilhouette className={css.mountains} />
    </footer>
  </div>;
}
