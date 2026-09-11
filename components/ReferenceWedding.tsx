"use client";

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { Camera, Gem, Heart, Music2, Sparkles, Utensils, Volume2, VolumeX, Wine } from "lucide-react";
import type { Invitation, RsvpStatus } from "@/lib/types";
import type { ReferenceWedding as Design } from "@/lib/referenceWeddings";
import { effectiveMusicUrl } from "@/lib/music";
import { safeWeddingLink, weddingProgram, weddingStyle, type WeddingPartInfo } from "@/lib/weddingEditor";
import { InviteAudio } from "./InviteAudio";
import { WeddingEditor, WeddingPart } from "./WeddingEditor";
import { invitationText, invitationDateLocale } from "@/lib/inviteTranslations";
import type { InvitePatch } from "./CanvasEdit";
import css from "./ReferenceWedding.module.css";

type Props = { invitation: Invitation; design: Design; locale: string; onChange?: InvitePatch; selected?: string | null; onSelect?: (id: string | null) => void; onPartsChange?: (parts: WeddingPartInfo[]) => void };
type TextProps = { id: string; text: string; className?: string; field?: WeddingPartInfo["field"] };
function Text({ id, text, className = "", field }: TextProps) {
  return <WeddingPart id={id} label={text || id} kind="text" fallback={text.replaceAll("\\n", "\n")} field={field} className={className} />;
}
function Flourish() { return <div className={css.flourish} aria-hidden="true">❧</div>; }
function Calendar({ invitation, locale }: { invitation: Invitation; locale: string }) {
  const parsed = new Date(`${invitation.date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear(), m = parsed.getMonth(), day = parsed.getDate();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const count = new Date(y, m + 1, 0).getDate();
  return <WeddingPart id="calendar" label="Календарь — дата свадьбы" kind="date" className={css.calendar}>
    <div className={css.month}>{parsed.toLocaleDateString(invitationDateLocale(locale), { month: "long", year: "numeric" })}</div>
    <div className={css.calendarGrid}>{(locale === "ky" ? ["ДҮЙ", "ШЕЙ", "ШАР", "БЕЙ", "ЖУМ", "ИШЕ", "ЖЕК"] : ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]).map((d, i) => <small key={`day-${i}`}>{d}</small>)}
      {Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} />)}
      {Array.from({ length: count }, (_, i) => <span key={i} className={i + 1 === day ? css.chosenDay : ""}>{i + 1 === day ? <Heart aria-hidden="true" /> : null}{i + 1}</span>)}
    </div>
  </WeddingPart>;
}
function Countdown({ invitation, locale }: { invitation: Invitation; locale: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const target = Date.parse(`${invitation.date}T${invitation.time || "17:00"}:00`);
  const diff = now === null || !Number.isFinite(target) ? 0 : Math.max(0, target - now);
  const values = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60];
  return <WeddingPart id="countdown" label="Обратный отсчёт" kind="date" className={css.countdown}>
    {values.map((n, i) => <div key={i}><strong>{now === null ? "—" : String(n).padStart(2, "0")}</strong><small>{(locale === "ky" ? ["КҮН", "СААТ", "МҮНӨТ", "СЕКУНД"] : ["ДНЕЙ", "ЧАСОВ", "МИНУТ", "СЕКУНД"])[i]}</small></div>)}
  </WeddingPart>;
}

export function ReferenceWedding({ invitation, design, locale, onChange, selected, onSelect, onPartsChange }: Props) {
  const tr = (value: string) => invitationText(value, locale);
  const d = design.id, english = d === "stars", kazakh = d === "sage";
  const formId = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const musicSrc = effectiveMusicUrl(invitation.musicUrl, invitation.music);
  const [playing, setPlaying] = useState(false);
  const date = new Date(`${invitation.date}T12:00:00`);
  const formattedDate = Number.isNaN(date.getTime()) ? invitation.date : date.toLocaleDateString("ru-RU").replaceAll(".", " · ");
  const heading = (id: string, text: string, script = false) => <Text id={`${id}-heading`} text={text} className={`${css.heading} ${script ? css.script : ""}`} />;
  const photo = (slot: string, className = "", id = `photo-${slot}`) => {
    const source = design.photos[slot];
    if (!source && !invitation.gallery?.[slot]) return null;
    return <WeddingPart key={id} id={id} label={`Фото: ${slot}`} kind="image" slot={slot} fallback={source?.source} crop={source} className={`${css.photo} ${className}`} style={{ aspectRatio: source ? `${source.w}/${source.h}` : "4/3" }} />;
  };
  const section = (id: string, children: ReactNode, className = "") => <WeddingPart id={`section-${id}`} label={`Блок: ${id}`} kind="block" className={`${css.section} ${className}`}>{children}</WeddingPart>;
  const names = (className = "") => <Text id="names" text={design.names} field="names" className={`${css.names} ${className}`} />;
  const eventDate = (id = "event-date") => <WeddingPart id={id} label="Дата мероприятия" kind="date" className={css.date}>{formattedDate}</WeddingPart>;
  const intro = (title = "Дорогие родные и близкие!", text = "Мы будем счастливы разделить этот особенный день вместе с вами.\n\nС большой любовью приглашаем вас на нашу свадьбу!") => section("intro", <>{heading("intro", title)}<Text id="intro-message" text={text} field="message" className={css.body} /></>);
  const map = () => <WeddingPart id="map-button" label="Кнопка карты" kind="widget"><a className={css.button} href={safeWeddingLink(invitation.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${invitation.venue} ${invitation.address} ${invitation.city}`)}`)} target="_blank" rel="noopener noreferrer" onClick={e => { if (onChange) e.preventDefault(); }}><Text id="map-label" text={english ? "GET DIRECTIONS" : kazakh ? "КАРТАНЫ АШУ" : "ПОСМОТРЕТЬ НА КАРТЕ"} /></a></WeddingPart>;
  const venue = () => section("venue", <>{heading("venue", english ? "The Griffith Observatory" : kazakh ? "МЕКЕН-ЖАЙЫМЫЗ" : d === "tuscany" ? "ЛОКАЦИЯ" : d === "calligraphy" ? "Место" : "Место проведения", d === "calligraphy")}{d === "tuscany" ? photo("villa") : null}{["burgundy", "mountains", "winter"].includes(d) ? photo("venue") : null}<Text id="venue-name" text={design.venue} field="venue" className={css.venueName} /><Text id="venue-address" text={design.address} field="address" className={css.body} />{map()}{d === "rose" ? photo("venue", css.wavePhoto) : null}</>, css.venue);
  const program = () => {
    const fallback = d === "calligraphy" ? [["15:00", "Сбор гостей"], ["16:00", "Торжественная церемония"], ["17:00", "Начало банкета"], ["21:00", "Праздничный торт"]] : d === "mountains" ? [["14:30", "Сбор гостей"], ["17:00", "Выездная церемония"], ["18:00", "Банкет"]] : d === "silk" ? [["13:30", "Сбор гостей"], ["14:00", "Трансфер"], ["15:30", "Свадебная церемония"], ["18:00", "Праздничный банкет"], ["23:00", "Завершение вечера"]] : d === "tuscany" ? [["16:30", "СБОР ГОСТЕЙ"], ["17:00", "ЦЕРЕМОНИЯ"], ["17:30", "ФОТОСЕССИЯ"], ["19:00", "УЖИН И ТОРЖЕСТВО"]] : d === "burgundy" ? [["17:00", "Торжественная церемония"], ["18:00", "Праздничный банкет"], ["17:30", "Фотосессия"], ["23:00", "Завершение вечера"]] : english ? [["17:30", "Ceremony"], ["18:15", "Sunset Cocktails"], ["19:00", "Shuttle Departs"], ["19:30", "Reception Dinner"], ["22:00", "Dancing Under the Stars"]] : kazakh ? [["18:30", "ҚОНАҚТАРДЫ ҚАРСЫ АЛУ"]] : [["15:00", "Сбор гостей\nWelcome-фуршет"], ["15:30", "Церемония\nрегистрации"], ["16:10", "Поздравления\nи фуршет"], ["17:00", "Банкет"], ["22:00", "Танцы\nи веселье"], ["23:30", "Завершение\nвечера"]];
    const entries = invitation.copy?.["wedding.program"] ? weddingProgram(invitation).map(p => [p.time, `${p.title}${p.subtitle ? `\n${p.subtitle}` : ""}`]) : fallback;
    const icons = [Wine, Gem, Camera, Utensils, Music2, Sparkles];
    return section("program", <>{heading("program", english ? "Evening Details" : kazakh ? "Той бағдарламасы" : d === "burgundy" ? "Timing" : d === "tuscany" ? "НАШ ДЕНЬ" : d === "mountains" ? "ТАЙМИНГ" : "Программа дня", ["burgundy", "sage", "calligraphy"].includes(d))}{d === "rose" ? <Flourish /> : null}{d === "mountains" ? photo("table", css.tablePhoto) : null}<div className={css.timeline}>{entries.map(([time, title], i) => {
      const iconChoice = weddingStyle(invitation, `program-icon-${i}`, "icon");
      const Icon = ({ coffee: Wine, gem: Gem, camera: Camera, utensils: Utensils, music: Music2, sparkles: Sparkles })[iconChoice as "coffee"] || icons[i % icons.length];
      return <WeddingPart id={`program-row-${i}`} label={`Программа: ${time}`} kind="block" key={i} className={css.programRow}><WeddingPart id={`program-icon-${i}`} label="Иконка программы" kind="decoration" className={css.programIcon}><Icon strokeWidth={1} /></WeddingPart><div><Text id={`program-time-${i}`} text={time} className={css.programTime} /><Text id={`program-title-${i}`} text={title} className={css.programTitle} /></div></WeddingPart>;
    })}</div>{d === "tuscany" ? photo("landscape") : null}</>, css.program);
  };
  const dress = () => section("dress", <>{heading("dress", d === "burgundy" ? "Dress-code" : "Дресс-код", ["burgundy", "calligraphy", "winter"].includes(d))}<Text id="dress-description" field="dressCode" text="Мы будем рады, если вы поддержите цветовую гамму нашей свадьбы." className={css.body} /><div className={css.swatches}>{design.colors.map((color, i) => <WeddingPart key={i} id={`dress-color-${i}`} label={`Цвет дресс-кода ${i + 1}`} kind="block" style={{ backgroundColor: color }} className={css.swatch}><span /></WeddingPart>)}</div>{photo("fashion")}{d === "calligraphy" ? <Text id="dress-note" text="Белый — цвет невесты.\nПредпочтительны пастельные цвета." className={css.body} /> : null}</>, css.dress);
  const wishes = () => section("wishes", <>{heading("wishes", "Пожелания", d === "winter")}<Text id="wishes-gifts-title" text="ПОДАРКИ" className={css.smallTitle} /><Text id="wishes-gifts" text="Ваше присутствие в день нашей свадьбы — самый значимый подарок для нас! Если вы хотите сделать нам комплимент, мы будем благодарны за вклад в нашу мечту." className={css.body} /><Text id="wishes-flowers-title" text="БЕЗ ЦВЕТОВ" className={css.smallTitle} /><Text id="wishes-flowers" text="Просим вас не дарить цветы. Поверьте, их будет достаточно на торжестве." className={css.body} /></>);
  const contact = () => section("contacts", <>{heading("contacts", d === "burgundy" ? "Contacts" : english ? "Questions?" : "Контакты", d === "burgundy")}<Text id="contacts-description" text={english ? "Please contact us with any questions about our wedding." : "Если у вас возникнут вопросы,\nмы всегда на связи!"} className={css.body} /><Text id="contact-details" text={english ? "Ethan & Olivia" : "По всем вопросам обращайтесь к молодожёнам"} className={css.body} /></>);
  const rsvp = () => section("rsvp", <>{heading("rsvp", english ? "Will you be there?" : kazakh ? "Тойға келесіз бе?" : d === "tuscany" ? "Подтверждение присутствия" : "Анкета гостя")}{d === "rose" ? <Flourish /> : null}<Text id="rsvp-description" text={english ? "Kindly respond so we can finalize our preparations for this magical evening." : kazakh ? "Аты-жөніңізді жазыңыз" : "Подтвердите, пожалуйста,\nваше присутствие"} className={css.body} />
    <form id={formId} className={css.form} onSubmit={async e => {
      e.preventDefault(); if (onChange || status === "sending") return;
      const data = new FormData(e.currentTarget); const name = String(data.get("name") || "").trim();
      if (!name) return;
      if (invitation.id === "preview" || invitation.id === "demo" || invitation.id.startsWith("preview-")) { setStatus("sent"); return; }
      setStatus("sending"); setError("");
      try {
        const response = await fetch(`/api/invitations/${encodeURIComponent(invitation.id)}/rsvp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, rsvp: String(data.get("attendance") || "yes") as RsvpStatus, plusOne: Math.max(0, Number(data.get("guests") || 1) - 1), ...(data.has("drinks") ? { drinks: String(data.get("drinks") || "") } : {}), ...(data.has("note") ? { note: String(data.get("note") || "") } : {}) }) });
        if (!response.ok) throw new Error(tr("Не удалось отправить ответ. Попробуйте ещё раз."));
        setStatus("sent");
      } catch (err) { setStatus("error"); setError(err instanceof Error ? err.message : "Ошибка отправки"); }
    }}>
      <WeddingPart id="rsvp-attendance" label="Варианты присутствия" kind="widget"><fieldset><legend className={css.srOnly}>{tr("Присутствие")}</legend>{(["yes", "no", "maybe"] as const).slice(0, d === "sage" ? 3 : 2).map((value, i) => <label className={css.radio} key={value}><input type="radio" name="attendance" value={value} defaultChecked={i === 0} /><Text id={`rsvp-option-${value}`} text={(english ? ["Joyfully accept", "Regretfully decline", "Maybe"] : kazakh ? ["Иә, келемін", "Жоқ, келе алмаймын", "Жұбыммен келемін"] : ["С радостью приду", "К сожалению, не смогу", "Пока не знаю"])[i]} /></label>)}</fieldset></WeddingPart>
      <label><Text id="rsvp-name-label" text={english ? "Your name" : "Ваше имя и фамилия"} className={css.formLabel} /><WeddingPart id="rsvp-name" label="Поле имени" kind="widget" fallback="Введите имя"><input name="name" aria-label={tr(english ? "Your name" : "Ваше имя и фамилия")} autoComplete="name" required maxLength={120} placeholder={tr(weddingStyle(invitation, "rsvp-name", "placeholder") || (english ? "Your name" : "Введите имя"))} /></WeddingPart></label>
      <label><Text id="rsvp-guests-label" text={english ? "Number of guests" : "Количество гостей"} className={css.formLabel} /><WeddingPart id="rsvp-guests" label="Количество гостей" kind="widget"><input name="guests" aria-label={tr("Количество гостей")} type="number" min="1" max="20" defaultValue="1" required /></WeddingPart></label>
      {d === "rose" ? <WeddingPart id="rsvp-drinks" label="Предпочтения по напиткам" kind="widget"><fieldset><legend className={css.formLabel}><Text id="rsvp-drinks-label" text="Напитки" /></legend><Text id="rsvp-drinks-hint" text="Что бы вы предпочли?" className={css.body} />{["Вино (белое / красное)", "Шампанское", "Без алкоголя"].map((drink, i) => <label key={drink} className={css.radio}><input type="radio" name="drinks" value={drink} /><Text id={`rsvp-drink-${i}`} text={drink} /></label>)}</fieldset></WeddingPart> : null}
      {d === "rose" || d === "tuscany" ? <label><Text id="rsvp-note-label" text="Ваши пожелания" className={css.formLabel} /><WeddingPart id="rsvp-note" label="Поле пожеланий" kind="widget" fallback="Напишите несколько тёплых слов"><textarea name="note" aria-label={tr("Ваши пожелания")} maxLength={2000} placeholder={tr(weddingStyle(invitation, "rsvp-note", "placeholder") || "Напишите несколько тёплых слов")} /></WeddingPart></label> : null}
      <WeddingPart id="rsvp-submit" label="Кнопка отправки" kind="widget"><button type="submit" className={css.button} disabled={!!onChange || status === "sending" || status === "sent"}><Text id="rsvp-submit-label" text={status === "sending" ? (english ? "Sending…" : "Отправка…") : english ? "RSVP" : kazakh ? "Жауапты жіберемін" : "ОТПРАВИТЬ ОТВЕТ"} /></button></WeddingPart>
      {status === "sent" ? <p role="status" className={css.feedback}>{invitation.id.startsWith("preview") || invitation.id === "demo" ? (english ? tr("Это предпросмотр. Ответ не отправлен.") : tr("Это предпросмотр. Ответ не отправлен.")) : english ? tr("Спасибо! Ваш ответ отправлен.") : tr("Спасибо! Ваш ответ отправлен.")}</p> : null}{status === "error" ? <p role="alert" className={css.feedback}>{tr(error)}</p> : null}
    </form></>, css.rsvp);

  let content: ReactNode;
  if (d === "rose") content = <>
    {section("hero", <>{heading("hero", "Наша свадьба")}{photo("hero", css.wavePhoto)}{names()}{eventDate()}<Text id="hero-welcome" text="С нетерпением ждём\nвстречи с вами!" className={css.body} /><Text id="timer-title" text="ДО СВАДЬБЫ ОСТАЛОСЬ:" className={css.smallTitle} /><Countdown invitation={invitation} locale={locale} /></>, css.hero)}
    {photo("hands", css.wavePhoto)}{intro("Дорогие друзья!")}{photo("flowers")}{program()}{venue()}{dress()}{rsvp()}{contact()}{section("thanks", <><Text id="thanks" text="Спасибо, что будете\nс нами в этот\nособенный день!" className={css.script} /><Heart className={css.heart} fill="currentColor" /></>)}{photo("footer")}
  </>;
  else if (d === "silk") content = <>
    {section("hero", <>{eventDate()}{heading("hero", "Наша Свадьба", true)}{names()}{photo("hero", css.wavePhoto)}</>, css.hero)}{intro("Родные и близкие!", "6 сентября состоится долгожданное и радостное событие — наша свадьба!\n\nЭтот тёплый день мы будем счастливы провести в кругу самых близких и родных людей, в праздничной и душевной атмосфере.")}{photo("bottom")}{photo("couple")}<Calendar invitation={invitation} locale={locale} />{photo("flowers")}{venue()}{program()}{rsvp()}
  </>;
  else if (d === "calligraphy") content = <>
    {section("hero", <>{photo("hero")}{names()}</>, css.hero)}{intro("Дорогие наши родные и друзья!", "В нашей жизни скоро состоится важное событие — наша свадьба!\nМы с удовольствием хотим разделить нашу радость с вами!")}{eventDate()}{photo("flowers", css.flowerPill)}{venue()}{photo("flowers", css.flowerPill, "photo-flower-divider")}{program()}{dress()}{rsvp()}{contact()}
  </>;
  else if (d === "mountains") content = <>
    {section("hero", <>{heading("hero", "Мы женимся!")}{photo("hero")}{names(css.script)}{eventDate()}</>, css.hero)}{intro("Родные и близкие", "С большой радостью приглашаем вас на празднование самого важного события в нашей жизни — дня свадьбы!")}{eventDate("intro-date")}{photo("collage")}{venue()}{program()}{dress()}{wishes()}{photo("couple")}{contact()}{rsvp()}{section("footer", <>{heading("footer", "С любовью!")}{photo("footer")}</>)}
  </>;
  else if (d === "sage") content = <>
    {section("hero", <>{names(css.script)}{photo("hero", css.archPhoto)}</>, css.hero)}{intro("Құрметті ағайын-туыс!", "Бауырлар, құда-жекжат, нағашы-жиен, бөлелер, дос-жарандар, көршілер және әріптестер!\n\nСіздерді балаларымыздың үйлену тойына арналған салтанатты ақ дастарханымыздың қадірлі қонағы болуға шақырамыз!")}{photo("couple", css.wavePhoto)}{section("date", <>{heading("date", "Той салтанаты:", true)}{eventDate()}<Text id="event-time" text={`${tr("Начало в")} ${invitation.time}`} className={css.body} /></>)}{section("hosts", <><Text id="hosts" text="ТОЙ ИЕЛЕРІ:\nАРМАН–АЙЗАДА" className={css.heading} /></>)}{venue()}{photo("hands")}<Countdown invitation={invitation} locale={locale} />{program()}{rsvp()}{photo("footer")}
  </>;
  else if (d === "burgundy") content = <>
    {section("hero", <><Text id="hero-the" text="Наш" className={css.script} /><Text id="hero-wedding" text="Свадебный" className={css.weddingWord} /><Text id="hero-day" text="day" className={css.script} />{photo("hero")}{names(css.script)}<Text id="hero-quote" text="Любовь — это выбор, который мы делаем каждый день.\nИз этого соединения времени складывается дорога вперёд." className={css.tiny} /></>, css.hero)}{photo("doors")}{intro("Два сердца. Один день.", "И те, кто делает нашу жизнь светлее — Вы.\nС любовью приглашаем разделить этот миг.")}<Calendar invitation={invitation} locale={locale} />{photo("birds", css.birds)}{program()}{venue()}{dress()}{rsvp()}{contact()}{photo("envelope", css.envelope)}
  </>;
  else if (d === "tuscany") content = <>
    {section("monogram", <><div className={css.monogram}><Text id="monogram" text="А\nК" /></div><Text id="invitation-label" text="ДОРОГИЕ\nАЛЕКСЕЙ И МАРИНА!" className={css.smallTitle} /><Text id="invitation-note" text="Приглашаем вас разделить\nс нами радость нашего\nсвадебного дня" className={css.body} /></>)}{section("hero", <>{names(css.script)}{photo("hero")}</>, css.hero)}{section("save-date", <><Text id="save-date" text="SAVE the DATE" className={css.heading} />{eventDate()}<Text id="country" text="Тоскана, Италия" className={css.body} /><Flourish /></>, css.darkSection)}{program()}{section("story", <>{heading("story", "Наша история")}<Flourish />{photo("story", css.polaroid)}<Text id="story-script" text="Everything\nbegan with\na look" className={css.script} /><Text id="story-text" text="Одна встреча, один взгляд\nи много мгновений\nмы шли по жизни вместе.\nСпасибо, что вы рядом\nв этот важный для нас день!" className={css.body} /></>, css.story)}{venue()}{section("hotel", <>{heading("hotel", "Проживание")}<Text id="hotel-description" text="Мы забронировали номера\nдля наших гостей в отеле\nрядом с площадкой." className={css.body} /><Text id="hotel-name" text="VILLA DI LUSSO HOTEL" className={css.smallTitle} />{photo("hotel")}</>, css.darkSection)}{dress()}{section("seal", <div className={css.waxSeal}>А К</div>, css.ribbon)}{rsvp()}<Flourish />
  </>;
  else if (d === "winter") content = <>
    {section("hero", <>{names(css.script)}{photo("hero")}{eventDate()}<Text id="magic" text="✦ ВОЛШЕБСТВО ✦\nНАЧИНАЕТСЯ!" className={css.heading} /></>, css.hero)}{intro("Дорогие Гости!", "С огромным счастьем приглашаем вас разделить этот зимний сказочный день вместе с нами!")}{photo("chandelier", css.chandelier)}{venue()}{photo("bow")}{program()}{dress()}{wishes()}{section("questions", <>{heading("questions", "Вопросы", true)}<Text id="questions-description" text="Пожалуйста, заполните анкету, чтобы мы могли сделать этот день незабываемым." className={css.body} /></>)}{rsvp()}{photo("arch")}{photo("flowers")}
  </>;
  else content = <>
    {section("hero", <>{photo("hero")}<div className={css.starHeroCopy}><Text id="hero-invited" text="You’re invited" className={css.script} /><WeddingPart id="event-date" label="Дата свадьбы" kind="date" className={css.starDate}>{Number.isNaN(date.getTime()) ? invitation.date : <>{date.toLocaleDateString(invitationDateLocale(locale), { month: "short" }).toUpperCase()}<br />{date.getDate()}<br />{date.getFullYear()}</>}</WeddingPart></div>{names()}<Text id="hero-location" text={design.venue} field="venue" className={css.tiny} /></>, css.hero)}{intro("Under the Stars", "From a chance encounter on a campus trail to an evening under the observatory dome, our story has always been written in golden light. We invite you to celebrate the next chapter with us.")}<Calendar invitation={invitation} locale={locale} /><Countdown invitation={invitation} locale={locale} />{section("story", <><Text id="story-overline" text="OUR JOURNEY" className={css.tiny} />{heading("story", "How It All Began")}<Text id="story-text" text="Some say it was fate, we just know it was the best accident ever. Here is a little glimpse into our journey together." className={css.body} /><div className={css.card}><Text id="story-chapter" text="CHAPTER 01" className={css.tiny} /><Text id="story-chapter-title" text="Strangers on the Trail" className={css.body} /><Text id="story-chapter-copy" text="Ethan, a software engineer who codes by day and hikes by weekend, crossed paths with Olivia, a documentary filmmaker, on a foggy morning." className={css.body} /></div></>)}{photo("collage", css.starCollage)}{program()}{venue()}{section("reception", <>{heading("reception", "The NoMad Hotel Los Angeles")}<Text id="reception-address" text="649 S Olive St, Los Angeles, CA 90014\n19:00" className={css.body} /></>, css.card)}{section("party", <><Text id="party-overline" text="OUR FAVORITE PEOPLE" className={css.tiny} />{heading("party", "The Wedding Party")}<Text id="party-text" text="We couldn’t do this without the love and support of our closest friends. Meet the amazing people standing by our side." className={css.body} />{photo("party")}</>)}{photo("hands")}{rsvp()}{section("faq", <>{["What should I wear?", "Will there be a shuttle between venues?", "Can I bring a plus-one?"].map((q, i) => <details key={q} className={css.faq}><summary><Text id={`faq-question-${i}`} text={q} /></summary><Text id={`faq-answer-${i}`} text={["We would love to see you in formal evening attire.", "Transportation will be provided between the ceremony and reception.", "Please include your guest in your RSVP so we can prepare a place for everyone."][i]} className={css.body} /></details>)}</>)}{photo("footer")}{section("footer", <Text id="footer-text" text="ETHAN & OLIVIA\nWITH LOVE" className={css.tiny} />)}
  </>;

  return <div className={`${css.root} ${css[d]}`} style={{ "--ref-paper": invitation.blockColors?.page || design.paper, "--ref-ink": design.ink, "--ref-accent": design.accent } as CSSProperties} data-reference-design={d}>
    <WeddingEditor invitation={invitation} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} locale={locale}>{content}</WeddingEditor>
    {musicSrc ? <>
      <InviteAudio src={musicSrc} playing={playing} />
      <button
        type="button"
        onClick={() => setPlaying(p => !p)}
        aria-label={tr(playing ? (english ? "Mute music" : "Выключить музыку") : (english ? "Play music" : "Включить музыку"))}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition hover:bg-black/45"
      >
        {playing ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </> : null}
  </div>;
}
