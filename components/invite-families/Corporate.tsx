"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Invitation, RsvpStatus } from "@/lib/types";
import type { WeddingPartInfo } from "@/lib/weddingEditor";
import type { InvitePatch } from "../CanvasEdit";
import { WeddingEditor, WeddingPart } from "../WeddingEditor";
import type { LayoutKit, Site3DLabels } from "../Site3DLayouts";
import { addHour, mapsEmbedUrl, monthLabel, pad } from "./shared";
import { RsvpForm } from "./RsvpForm";
import css from "./Corporate.module.css";

/** Четыре оформления корпоративного приглашения: общая структура, разные палитры и декор. */
export type CorporateTheme = "velvet" | "emerald" | "winter" | "noir";

const THEME_BY_TEMPLATE: Record<string, CorporateTheme> = {
  "corp-velvet": "velvet",
  "corp-emerald": "emerald",
  "corp-winter": "winter",
  "corp-noir": "noir",
};

function themeOf(invitation: Pick<Invitation, "templateId" | "copy">): CorporateTheme {
  const saved = invitation.copy?.["corp.theme"] as CorporateTheme | undefined;
  if (saved && saved in THEME_COPY) return saved;
  return THEME_BY_TEMPLATE[invitation.templateId] ?? "velvet";
}

// Тексты по умолчанию для каждой темы: [русский, кыргызский].
const THEME_COPY: Record<CorporateTheme, {
  overline: [string, string]; tagline: [string, string]; intro: [string, string]; dress: [string, string];
  swatches: string[]; ornament: string;
}> = {
  velvet: {
    overline: ["Вечер, который мы запомним", "Эсте каларлык кече"],
    tagline: ["новогодний корпоратив", "жаңы жылдык корпоратив"],
    intro: ["Пусть этот год завершится красиво. Приглашаем вас на новогодний вечер — с тёплыми встречами, звоном бокалов и танцами до полуночи. Самые прекрасные моменты мы создаём вместе!", "Бул жылды сонун маанайда узаталы. Сизди жылуу жолугушуулар, жакшы тилектер жана бий менен коштолгон жаңы жылдык кечеге чакырабыз. Эң сонун көз ирмемдерди бирге жаратабыз!"],
    dress: ["Красный, чёрный и золотой — поддержите стиль вечера", "Кызыл, кара жана алтын — кеченин стилин колдоңуз"],
    swatches: ["#a3122b", "#1a1214", "#c9a45c"], ornament: "♦",
  },
  emerald: {
    overline: ["Новый год", "Жаңы жыл"],
    tagline: ["приглашение на корпоратив", "корпоративге чакыруу"],
    intro: ["С удовольствием приглашаем вас на новогодний торжественный вечер! Давайте соберёмся вместе, чтобы отпраздновать наши достижения и заглянуть в будущее с новыми силами и идеями!", "Жаңы жылдык салтанаттуу кечеге чакырабыз! Жетишкендиктерибизди бирге белгилеп, келечекке жаңы күч жана идеялар менен карайлы!"],
    dress: ["Вечерний стиль с каплей новогоднего волшебства", "Кечки стиль жана Жаңы жылдын сыйкыры"],
    swatches: ["#1d4a38", "#e6dcc0", "#c9a45c"], ornament: "✦",
  },
  winter: {
    overline: ["Save the date", "Датаны белгилеңиз"],
    tagline: ["Сказочная страна по ту сторону зеркала", "Күзгүнүн ары жагындагы жомок өлкөсү"],
    intro: ["За окнами кружится снег, а впереди — вечер, полный чудес. Приглашаем вас в нашу зимнюю сказку: проводить уходящий год, загадать желания и встретить новую главу вместе!", "Терезе сыртында кар жаап, алдыда кереметтерге толгон кече күтөт. Кышкы жомогубузга чакырабыз: өтүп бараткан жылды узатып, тилек айтып, жаңы баракты бирге ачалы!"],
    dress: ["Вечерний стиль и капелька новогоднего волшебства", "Кечки стиль жана Жаңы жылдын кичине сыйкыры"],
    swatches: ["#9aa0a6", "#f1ecea", "#b3202f"], ornament: "❄",
  },
  noir: {
    overline: ["Приглашение на", "Чакыруу"],
    tagline: ["новогодний вечер в кругу коллег", "кесиптештер менен жаңы жылдык кече"],
    intro: ["Приглашаем вас окунуться в магию предстоящих праздников. Атмосфера, где каждая деталь, мелодия и встреча превращаются в акт искусства!", "Алдыдагы майрамдардын сыйкырына сүңгүүгө чакырабыз. Ар бир деталь, обон жана жолугушуу искусствого айланган атмосфера!"],
    dress: ["Black Tie с ноткой загадочности. Добавьте немного таинственности с помощью масок и мехов", "Black Tie жана табышмактуулук. Маска жана жүн менен сырдуулук кошуңуз"],
    swatches: ["#0b0b0b", "#d9b877", "#7a1020"], ornament: "✦",
  },
};

type CorporateKit = Pick<LayoutKit, "invitation" | "onChange" | "labels" | "event" | "count" | "mapHref" | "mapQuery" | "venuePhoto" | "locale" | "variant" | "rsvp" | "setRsvp" | "rsvpName" | "setRsvpName" | "rsvpDone" | "setRsvpDone" | "onReload"> & {
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  onPartsChange?: (parts: WeddingPartInfo[]) => void;
};

export function CorporateInvite({ invitation, locale, labels, onChange, onReload, compact, selected, onSelect, onPartsChange }: {
  invitation: Invitation; locale: string; labels: Site3DLabels; onChange?: InvitePatch; onReload?: () => void; compact?: boolean;
  selected?: string | null; onSelect?: (id: string | null) => void; onPartsChange?: (parts: WeddingPartInfo[]) => void;
}) {
  const [count, setCount] = useState<LayoutKit["count"]>(null);
  const [rsvp, setRsvp] = useState<RsvpStatus>("yes");
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpDone, setRsvpDone] = useState(false);
  const target = new Date(`${invitation.date}T${invitation.time || "18:00"}:00`).getTime();
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
  if (compact && !onChange) return <CorporateThumb name={invitation.names} theme={themeOf(invitation)} />;
  const mapQuery = [invitation.venue, invitation.address, invitation.city].filter(Boolean).join(", ");
  const mapHref = /^https?:\/\//i.test(invitation.mapUrl || "") ? invitation.mapUrl! : `https://2gis.kg/search/${encodeURIComponent(mapQuery)}`;
  return <div className="mx-auto w-full max-w-[430px]" data-family="corporate"><CorporateFamily kit={{
    invitation, locale, labels, onChange, onReload, event: new Date(target), count, mapQuery, mapHref,
    venuePhoto: invitation.gallery?.venue || "", variant: onChange ? "editor" : "guest",
    rsvp, setRsvp, rsvpName, setRsvpName, rsvpDone, setRsvpDone, selected, onSelect, onPartsChange,
  }} /></div>;
}

export function CorporateThumb({ name = "", theme }: { name?: string; theme?: string }) {
  const key = (theme && theme in THEME_COPY ? theme : "velvet") as CorporateTheme;
  return <div className={css.thumb} data-theme={key}>
    <div className={css.thumbHero}><small>NEW YEAR CELEBRATION</small><span className="font-tra-script">{name || "Новый год"}</span><i>{THEME_COPY[key].ornament}</i></div>
    <div className={css.thumbCard}><span className="font-tra-script">Дорогие коллеги!</span><p>Время чудес и тёплых встреч</p><b /></div>
  </div>;
}

function Mask({ className }: { className?: string }) {
  return <svg viewBox="0 0 220 90" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M10 40c30-24 70-26 100-8 30-18 70-16 100 8-6 30-34 46-62 34-14-6-26-18-38-18s-24 12-38 18C44 86 16 70 10 40Z" />
    <path d="M52 44c10-8 24-8 32 2-8 10-24 10-32-2ZM136 46c8-10 22-10 32-2-8 12-24 12-32 2Z" />
    <path d="M110 32v-16M96 22l14-10 14 10" />
  </svg>;
}

export function CorporateFamily({ kit }: { kit: CorporateKit }) {
  const { invitation, onChange, labels, event, count, mapHref, mapQuery, selected, onSelect, onPartsChange } = kit;
  const ru = kit.locale === "ru";
  const editing = !!onChange;
  const theme = themeOf(invitation);
  const copy = THEME_COPY[theme];
  const tr = (a: string, b: string) => (ru ? a : b);
  const pick = (pair: [string, string]) => (ru ? pair[0] : pair[1]);
  const text = (id: string, fallback: string, className = "", field?: WeddingPartInfo["field"], label?: string) =>
    <WeddingPart id={id} label={label || fallback || id} kind="text" fallback={fallback} className={className} field={field} />;
  const block = (id: string, label: string, className: string, children: ReactNode) =>
    <WeddingPart id={`section-${id}`} label={label} kind="block" className={className}>{children}</WeddingPart>;
  const time = invitation.time || "18:00";
  const steps: [string, string, string][] = [
    [time, tr("Сбор гостей", "Конокторду тосуп алуу"), tr("Просим взять с собой хорошее настроение — этот вечер обещает быть особенным", "Жакшы маанай алып келиңиз — бул кеч өзгөчө болот")],
    [addHour(time, 1), tr("Праздничный ужин", "Майрамдык кечки тамак"), tr("Время насладиться изысканными блюдами и тёплыми тостами", "Даамдуу тамак жана жылуу тостторду сезүү убактысы")],
    [addHour(time, 3), tr("Развлекательная программа", "Көңүл ачуу программасы"), tr("Конкурсы, музыка и сюрпризы от организаторов", "Сынактар, музыка жана уюштуруучулардан сюрприздер")],
    [addHour(time, 5), tr("Завершение вечера", "Кечени аяктоо"), tr("Время насладиться танцами и приятным общением", "Бий жана жагымдуу баарлашуу убактысы")],
  ];
  const deadline = new Date(event.getTime() - 7 * 86400000);
  const deadlineText = Number.isFinite(deadline.getTime()) ? `${pad(deadline.getDate())}.${pad(deadline.getMonth() + 1)}.${deadline.getFullYear()}` : "";
  const dateLong = Number.isFinite(event.getTime()) ? `${event.getDate()} ${monthLabel(kit)} ${event.getFullYear()}` : invitation.date;
  const dateShort = Number.isFinite(event.getTime()) ? `${pad(event.getDate())}.${pad(event.getMonth() + 1)}.${event.getFullYear()}` : invitation.date;

  return <div className={css.root} data-theme={theme}>
    <WeddingEditor invitation={invitation} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} locale={kit.locale}>
      {block("hero", "Обложка", css.hero, <>
        <WeddingPart id="photo-hero" label="Фото обложки" kind="image" slot="hero" fallback={`/images/corporate/${theme}.webp`} className={css.heroPhoto} />
        <div className={css.heroShade} aria-hidden="true" />
        <div className={css.heroTop}>{text("hero-edition", "NEW YEAR CELEBRATION", css.micro)}<span aria-hidden="true">✧</span></div>
        <div className={css.heroFrame}>
          {text("hero-overline", pick(copy.overline), css.eyebrow)}
          <WeddingPart id="names" label="Название мероприятия" kind="text" field="names" fallback={pick(copy.tagline)} className={`${css.title} font-tra-script`} />
          {text("hero-tagline", pick(copy.tagline), css.tagline, undefined, "Подзаголовок")}
          <WeddingPart id="event-date" label="Дата" kind="date" className={css.date}>{dateShort}</WeddingPart>
          <WeddingPart id="hero-ornament" label="Украшение" kind="decoration" className={css.ornament}>{copy.ornament}</WeddingPart>
        </div>
        <div className={css.heroBottom}>{text("hero-note", tr("Время быть вместе", "Бирге болчу убакыт"), css.micro)}<span aria-hidden="true">↓</span></div>
      </>)}

      {block("intro", "Приглашение", css.section, <>
        <div className={css.flourish} aria-hidden="true">✧</div>
        {text("intro-title", tr("Дорогие коллеги!", "Урматтуу кесиптештер!"), `${css.script} font-tra-script`)}
        {text("message", pick(copy.intro), css.message, "message", "Текст приглашения")}
        {(editing || invitation.hosts) ? text("hosts", invitation.hosts || tr("Организаторы мероприятия", "Иш-чара уюштуруучулары"), css.hosts, "hosts", "Организаторы") : null}
      </>)}

      {block("when", "Дата и время", css.panelSection, <>
        {text("when-title", tr("Дата и время", "Күнү жана убактысы"), `${css.script} font-tra-script`)}
        <WeddingPart id="when-date" label="Дата проведения" kind="date" className={css.bigDate}>{dateLong}</WeddingPart>
        {text("when-time", `${tr("Начало в", "Башталышы")} ${time}`, css.message, undefined, "Время начала")}
        <WeddingPart id="when-music" label="Подсказка про музыку" kind="text" className={css.hint}>{tr("Включите музыку для праздничного настроения", "Майрамдык маанай үчүн музыканы коңуз")}</WeddingPart>
      </>)}

      {block("program", "Программа", css.section, <>
        <div className={css.sectionLabel} aria-hidden="true">THE EVENING</div>
        {text("program-title", tr("Программа вечера", "Кечеңин программасы"), `${css.script} font-tra-script`)}
        <div className={css.timing}>{steps.map(([t, head, note], i) => <div key={i} className={css.timingItem}>
          <span className={css.stepNumber} aria-hidden="true">0{i + 1}</span>
          {text(`p${i + 1}t`, t, css.timingTime, undefined, `Время ${i + 1}`)}
          {text(`p${i + 1}`, head, css.timingHead, undefined, `Пункт программы ${i + 1}`)}
          {text(`p${i + 1}d`, note, css.timingNote, undefined, `Описание пункта ${i + 1}`)}
        </div>)}</div>
      </>)}

      {block("dress", "Дресс-код", css.panelSection, <>
        {theme === "noir" ? <Mask className={css.mask} /> : <div className={css.flourish} aria-hidden="true">✧</div>}
        {text("dress-title", "Dress code", `${css.script} font-tra-script`)}
        {text("dress-text", pick(copy.dress), css.message, "dressCode", "Описание дресс-кода")}
        <div className={css.swatches} aria-hidden="true">{copy.swatches.map(color => <span key={color} style={{ background: color }} />)}</div>
      </>)}

      {block("countdown", "Обратный отсчёт", css.countdown, <>
        {text("countdown-title", tr("До нашей вечеринки", "Кечеге чейин"), `${css.script} font-tra-script`)}
        <WeddingPart id="countdown-widget" label="Таймер" kind="widget">
          {count?.done ? <p className={css.message}>{labels.started}</p> : <div className={css.digits}>{[[count?.d, labels.days], [count?.h, labels.hours], [count?.m, labels.mins], [count?.s, labels.secs]].map(([value, label]) => <div key={String(label)}><strong>{value === undefined ? "—" : pad(Number(value))}</strong><span>{label}</span></div>)}</div>}
        </WeddingPart>
      </>)}

      {block("venue", "Место проведения", css.section, <>
        {text("venue-title", tr("Место и время", "Өтүүчү жер"), `${css.script} font-tra-script`)}
        {(editing || invitation.gallery?.venue) ? <WeddingPart id="photo-venue" label="Фото места" kind="image" slot="venue" fallback="" className={css.venuePhoto} /> : null}
        {text("venue", invitation.venue || tr("Место проведения", "Өтүүчү жер"), css.venueName, "venue", "Название места")}
        {text("address", invitation.address || tr("Адрес", "Дареги"), css.message, "address", "Адрес")}
        <WeddingPart id="map-button" label="Кнопка карты" kind="widget">
          <a href={mapHref} target="_blank" rel="noopener noreferrer" onClick={e => { if (editing) e.preventDefault(); }} className={css.button}>{labels.map} ↗</a>
        </WeddingPart>
        <WeddingPart id="map-embed" label="Карта" kind="widget">
          <iframe title={labels.map} src={mapsEmbedUrl(mapQuery)} className={css.map} loading="lazy" style={editing ? { pointerEvents: "none" } : undefined} />
        </WeddingPart>
      </>)}

      {block("rsvp", "Анкета гостя", css.panelSection, <>
        {text("rsvp-title", tr("Анкета", "Анкета"), `${css.script} font-tra-script`)}
        {text("rsvp-hint", `${tr("Дорогие коллеги, просим вас подтвердить своё присутствие до", "Урматтуу кесиптештер, катышуңузду төмөнкү күнгө чейин ырастаңыз:")} ${deadlineText}`, css.message, undefined, "Просьба подтвердить участие")}
        <WeddingPart id="rsvp-form" label="Форма ответа" kind="widget" className={css.rsvp}><RsvpForm kit={kit} tone="corporate" /></WeddingPart>
      </>)}

      {block("footer", "Подвал", css.footer, <>
        {text("footer-note", tr("Самое ценное — наши люди", "Эң баалуусу — биздин адамдар"), css.eyebrow)}
        {text("footer-title", tr("До встречи!", "Жолугушканга чейин!"), `${css.script} font-tra-script`)}
        <WeddingPart id="footer-ornament" label="Украшение" kind="decoration" className={css.ornament}>{copy.ornament}</WeddingPart>
      </>)}
    </WeddingEditor>
  </div>;
}
