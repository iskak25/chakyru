"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FloatingMusicButton } from "../FloatingMusicButton";
import { effectiveMusicUrl } from "@/lib/music";
import { InviteAudio } from "../InviteAudio";
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
import { FalconMountains } from "./FalconMountains";

const FALCON_ART = "/images/templates/amir-falcon/hero.webp";
const FALCON_SCENE = "/images/templates/amir-falcon/landscape.webp";
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
  const [playing, setPlaying] = useState(false);
  const musicSrc = effectiveMusicUrl(invitation.musicUrl, invitation.music, invitation.eventType);
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
  if (compact && !onChange) return <TushooNavyThumb name={invitation.names} falcon={invitation.templateId === "amir-falcon"} locale={locale} />;
  const mapQuery = [invitation.venue, invitation.address, invitation.city].filter(Boolean).join(", ");
  const mapHref = /^https?:\/\//i.test(invitation.mapUrl || "") ? invitation.mapUrl! : `https://2gis.kg/search/${encodeURIComponent(mapQuery)}`;
  const musicLabel = locale === "ru" ? (playing ? "Выключить музыку" : "Включить музыку") : (playing ? "Музыканы өчүрүү" : "Музыканы күйгүзүү");
  return <div className="mx-auto w-full max-w-[430px]" data-family="tushooNavy"><TushooNavyFamily kit={{
    invitation, locale, labels, onChange, onReload, event: new Date(target), count, mapQuery, mapHref,
    venuePhoto: invitation.gallery?.venue || "", variant: onChange ? "editor" : "guest",
    rsvp, setRsvp, rsvpName, setRsvpName, rsvpDone, setRsvpDone, selected, onSelect, onPartsChange,
  }} />
    {musicSrc ? <>
      <InviteAudio src={musicSrc} playing={playing} start={invitation.musicStart} end={invitation.musicEnd} />
      <FloatingMusicButton playing={playing} onToggle={() => setPlaying(p => !p)} label={musicLabel} />
    </> : null}
  </div>;
}

export function TushooNavyThumb({ name = "Аят", falcon = false, locale = "ru" }: { name?: string; falcon?: boolean; locale?: string }) {
  return <div className={`${css.thumb} ${falcon ? css.falconThumb : ""}`}>
    <img src={falcon ? FALCON_ART : ART} alt="" className={css.art} />
    <div className={css.thumbText}><span className="font-tra-script">{name}</span><p>{falcon ? "СҮННӨТ ТОЙ" : "ТУШОО ТОЙ"}</p></div>
  </div>;
}

export function TushooNavyFamily({ kit }: { kit: TushooKit }) {
  const { invitation, onChange, labels, event, count, mapHref, mapQuery, selected, onSelect, onPartsChange } = kit;
  const ru = kit.locale === "ru";
  const editing = !!onChange;
  const falcon = invitation.templateId === "amir-falcon";
  const title = falcon ? "Сүннөт той" : invitation.eventType === "birthday" ? (ru ? "День рождения" : "Туулган күн") : "Тушоо той";
  const tr = (a: string, b: string) => (ru ? a : b);
  const text = (id: string, fallback: string, className = "", field?: WeddingPartInfo["field"], label?: string) =>
    <WeddingPart id={id} label={label || fallback || id} kind="text" fallback={fallback} className={className} field={field} />;
  const block = (id: string, label: string, className: string, children: ReactNode) =>
    <WeddingPart id={`section-${id}`} label={label} kind="block" className={className}>{children}</WeddingPart>;
  const photo = (slot: string, label: string, className: string, fallback = "") =>
    (editing || invitation.gallery?.[slot] || fallback) ? <WeddingPart id={`photo-${slot}`} label={label} kind="image" slot={slot} fallback={fallback} className={className} /> : null;
  const steps = [
    [invitation.time || "15:00", tr("Встречаем дорогих гостей", "Конокторду тосуп алуу")],
    [addHour(invitation.time, 1), falcon ? tr("Ак бата — благословение нашему сыну", "Уулубузга ак бата") : tr("Первые шаги — тушоо кесүү", "Тушоо кесүү")],
    [addHour(invitation.time, 2), tr("Праздничный дасторкон", "Майрамдык дасторкон")],
    [addHour(invitation.time, 3), tr("Торт, улыбки и добрые пожелания", "Торт жана жакшы тилектер")],
  ];
  const story = falcon ? [
    [tr("Ты появился на свет", "Сен жарык дүйнөгө келдиң"), tr("И наполнил наш дом счастьем", "Үйүбүздү бакытка бөлөдүң")],
    [tr("Наш сын растёт", "Уулубуз чоңоюп жатат"), tr("Сегодня празднуем твой сүннөт той", "Бүгүн сенин сүннөт тоюңду белгилеп жатабыз")],
    [tr("Рядом самые близкие", "Жакындарыбыз жаныбызда"), tr("Разделим эту радость вместе", "Кубанычыбызды чогуу бөлүшөлү")],
  ] : [
    [tr("Первая улыбка", "Биринчи жылмаюу"), tr("Она осветила наш дом", "Үйүбүздү нурга бөгөн")],
    [tr("Первое слово", "Биринчи сөз"), tr("«Апа» — самое дорогое слово", "«Апа» — эң кымбат сөз")],
    [tr("Первые шаги", "Алгачкы кадам"), tr("Сегодня мы делаем их вместе с вами", "Бүгүн аларды силер менен чогуу жасайбыз")],
  ];
  const wishes = [
    ["✦", "Ак бата", tr("Тёплые слова и благословение от родных и близких", "Жакындардан жылуу сөз жана ак бата")],
    ["♥", falcon ? tr("Расти счастливым", "Бактылуу чоңой") : "Тушоо кесүү", falcon ? tr("Будь смелым, как сокол, и сильным, как барс", "Шумкардай эр жүрөк, барстай күчтүү бол") : tr("Малыш сделает первые шаги — пусть дорога будет лёгкой", "Бөбөктүн алгачкы кадамы — жолу шыдыр болсун")],
    ["❖", tr("Дресс-код", "Кийим стили"), falcon ? tr("Оттенки неба: синий, белый, серебристый", "Асман түстөрү: көк, ак, күмүш") : tr("Нежные оттенки: синий, молочный, золотой", "Назик түстөр: көк, ак, алтын")],
  ];
  return <div className={`${css.root} ${falcon ? css.falcon : ""}`}>
    <WeddingEditor invitation={invitation} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} locale={kit.locale}>
      {block("hero", "Обложка", css.hero, <>
        <WeddingPart id="photo-hero" label="Иллюстрация обложки" kind="image" slot="hero" fallback={falcon ? FALCON_ART : ART} className={css.art} style={{ position: "absolute", inset: 0 }} />
        <div className={css.heroText}>
          {text("hero-overline", falcon ? tr("Наш сын · наша гордость", "Уулубуз · сыймыгыбыз") : tr("Маленькие шаги · большое счастье", "Кичинекей кадам · чоң бакыт"), css.eyebrow)}
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
        {text("message", falcon ? tr("Приглашаем вас на сүннөт той нашего сына! Разделите с нами радость этого особенного дня и подарите ему ваши добрые пожелания и благословение.", "Уулубуздун сүннөт тоюна чакырабыз! Кубанычыбызды тең бөлүшүп, уулубузга ак батаңызды берип кетиңиздер.") : tr("Приглашаем вас разделить радость первых шагов нашего малыша! Пусть этот день наполнится вашими улыбками, тёплыми словами и добрыми пожеланиями.", "Бөбөгүбүздүн тушоо тоюна келип, кубанычыбызды тең бөлүшүүгө чакырабыз! Ак батаңыздар менен анын алгачкы кадамдарына күбө болуп кетиңиздер."), css.message, "message", "Текст приглашения")}
        {(editing || invitation.hosts) ? text("hosts", invitation.hosts || "С любовью, родители", css.hosts, "hosts", "Хозяева праздника") : null}
      </>)}

      {block("calendar", "Календарь", css.section, <>
        {text("calendar-overline", tr("Отметьте в календаре", "Календарга белгилеп коюңуз"), css.eyebrow)}
        {text("calendar-title", `${event.getDate()} ${monthLabel(kit)}`, css.heading, undefined, "Заголовок календаря")}
        <WeddingPart id="calendar-widget" label="Календарь" kind="widget" className={css.calendar}>
          <CalendarGrid
            date={event}
            monthLabel={monthLabel(kit)}
            cellClassName={falcon ? "text-[#29589e]" : "text-[#102e50]"}
            headClassName="text-[#8b6938]"
            highlightClassName={`${falcon ? "bg-[#29589e]" : "bg-[#102e50]"} text-[#e6c991] ring-2 ring-[#bd9455] ring-offset-2 ring-offset-[#fff9ef]`}
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

      {falcon ? (editing || invitation.gallery?.child || invitation.gallery?.child2) ? block("child", "Фотографии мальчика", css.section, <>
        {text("photos-title", tr("Наш любимый сын", "Сүйүктүү уулубуз"), css.heading)}
        <div className={css.childGallery}>
          {["child", "child2"].map((slot, i) => (editing || invitation.gallery?.[slot]) ? <WeddingPart key={slot} id={`photo-${slot}`} label={tr(`Фото мальчика ${i + 1}`, `Уулубуздун сүрөтү ${i + 1}`)} kind="image" slot={slot} className={css.childPortrait}>
            <div className={css.photoPlaceholder}>{tr(`Добавить фото ${i + 1}`, `${i + 1}-сүрөттү кошуу`)}</div>
          </WeddingPart> : null)}
        </div>
      </>) : null : (editing || invitation.gallery?.child) ? block("child", "Фото малыша", css.section, photo("child", "Фото малыша", css.childPhoto)) : null}

      {falcon ? block("landscape", "Сокол и барс", css.illustration, photo("landscape", "Сокол, горы и барс", css.landscape, FALCON_SCENE)) : null}

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
        {text("footer-wish", falcon ? tr("Расти счастливым, наш сын", "Бактылуу чоңой, уулубуз") : tr("Пусть каждый шаг будет счастливым", "Ар бир кадамың кут болсун"), css.eyebrow)}
        {falcon ? <FalconMountains /> : <MountainSilhouette className={css.mountains} />}
      </>)}
    </WeddingEditor>
  </div>;
}
