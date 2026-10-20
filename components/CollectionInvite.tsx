"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { Invitation } from "@/lib/types";
import { eventExamples, type CollectionDesign } from "@/lib/collectionTemplates";
import { invitationMapUrl } from "@/lib/defaultVenue";
import { guestFetch, guestFeedback } from "@/lib/guestSubmission";
import { safeWeddingLink, type WeddingPartInfo } from "@/lib/weddingEditor";
import { WeddingEditor, WeddingPart } from "./WeddingEditor";
import { CollectionArt } from "./CollectionArt";
import { PinterestCalendar, PinterestTimer } from "./PinterestInvite";
import { WishesCarousel } from "./WishesCarousel";
import type { InvitePatch } from "./CanvasEdit";
import css from "./CollectionInvite.module.css";
import kyzCss from "./KyzCollection.module.css";
import { KyzCollectionHero } from "./KyzCollectionHero";
import { kyzAsset, kyzDirection } from "@/lib/kyzRedesign";
import { weddingDirection } from "@/lib/weddingRedesign";
import weddingCss from "./WeddingCollection.module.css";
import { WeddingCollectionHero } from "./WeddingCollectionHero";
import { eventPresentation, eventMediaSource } from "@/lib/eventPresentation";
import { eventArt } from "@/lib/eventArt";
import { EventCollectionHero, EventArtwork } from "./EventCollectionHero";
import { EthnoWeddingHero, EthnoWeddingPortrait } from "./EthnoWeddingHero";
import ethnoCss from "./EthnoWedding.module.css";
import { RedEthnoWeddingHero, RedEthnoWeddingPortrait } from "./RedEthnoWedding";
import redEthnoCss from "./RedEthnoWedding.module.css";
import { useEthnoMotion } from "@/lib/useEthnoMotion";
import { useInvitationMotion } from "./InvitationMotion";
import eventCss from "./EventCollection.module.css";


type Props = { invitation: Invitation; design: CollectionDesign; locale: string; onChange?: InvitePatch; selected?: string | null; onSelect?: (id: string | null) => void; onPartsChange?: (parts: WeddingPartInfo[]) => void; preview?: boolean };
const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];

function collectionStyle(d: CollectionDesign, inv: Invitation): CSSProperties {
  const theme = eventPresentation(d.id);
  if (theme) return { "--c-paper": inv.blockColors?.page || theme.paper, "--c-ink": theme.ink, "--c-accent": theme.accent, "--c-wash": theme.wash } as CSSProperties;
  // Each composition uses its catalogue palette, including the wedding collection.
  const borrowed: Record<string, string> = weddingDirection(d.id) ? { "--wd-light": d.paper, "--wd-dark": d.ink, "--wd-mid": d.accent } : {};
  return { "--c-paper": inv.blockColors?.page || d.paper, "--c-ink": d.ink, "--c-accent": d.accent, "--c-wash": d.wash, ...borrowed } as CSSProperties;
}
function DateMark({ invitation: inv, locale }: { invitation: Invitation; locale: string }) {
  const [year, month, day] = inv.date.split("-");
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(inv.date) && Number(month) >= 1 && Number(month) <= 12;
  return <WeddingPart id="event-date" label="Дата и время" kind="date" className={css.date}>
    {valid ? <><b>{day}</b><span>{locale === "ru" ? new Date(`${inv.date}T12:00:00`).toLocaleDateString("ru-RU", { month: "long" }) : MONTHS[Number(month)-1]}<small>{year} · {inv.time}</small></span></> : <span>{inv.date} · {inv.time}</span>}
  </WeddingPart>;
}

function CollectionHero({ invitation: inv, design: d, locale }: Props) {
  if (d.id === "collection-wedding-kyzyl-tunduk") return <RedEthnoWeddingHero invitation={inv} locale={locale}/>;
  if (d.id === "collection-wedding-ak-bosogo") return <EthnoWeddingHero invitation={inv} locale={locale}/>;
  const theme = eventPresentation(d.id);
  if (theme) return <EventCollectionHero invitation={inv} theme={theme} locale={locale} />;
  if (d.event === "kyz") return <KyzCollectionHero id={d.id} invitation={inv} locale={locale} />;
  if (weddingDirection(d.id)) return <WeddingCollectionHero id={d.id} invitation={inv} locale={locale} />;
  const example = eventExamples[d.event];
  const ru = locale === "ru";
  return <div className={`${css.hero} ${css[d.composition]}`} data-collection-hero={d.composition}>
    <WeddingPart id="hero-kicker" kind="text" label="Название события" fallback={example.title[ru ? 1 : 0]} className={css.kicker} />
    <div className={css.art} data-collection-art={d.motif}>
      {d.photo ? <WeddingPart id="photo-hero" label="Фотография" kind="image" slot="hero" fallback={d.photo} className={css.photo} /> : <CollectionArt motif={d.motif} />}
    </div>
    <WeddingPart id="names" label="Имена" kind="text" field="names" fallback={example.names} className={css.names} />
    {d.event === "anniversary" ? <WeddingPart id="collection-age" label="Возраст юбиляра" kind="text" fallback="60" className={css.age} /> : null}
    <WeddingPart id="hero-note" kind="text" label="Подпись обложки" fallback={ru ? "Разделите с нами этот день" : "Кубанычыбызды бирге бөлүшөлү"} className={css.note} />
    <DateMark invitation={inv} locale={locale} />
    <WeddingPart id="hero-venue" label="Место" kind="text" field="venue" fallback="«Ала-Тоо»" className={css.heroVenue} />
    {d.skin === "kyz-wax" ? <div className={css.waxSeal} aria-hidden="true"><CollectionArt motif="waxSeal" /></div> : null}
  </div>;
}

/** Both catalogue cards and the full invitation use this exact hero and live canvas data. */
export function CollectionPreview(props: Props) {
  // Every catalogue card shows the full, scrollable invitation on its own paper colour.
  return <div className={`${css.previewViewport} ${css.previewFullPageViewport}`} style={{ background: props.invitation.blockColors?.page || props.design.paper }}><CollectionInvite {...props} preview /></div>;
}

export function CollectionInvite({ invitation: inv, design: d, locale, onChange, selected, onSelect, onPartsChange, preview = false }: Props) {
  const [reply, setReply] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const sending = useRef(false);
  const ru = locale === "ru", example = eventExamples[d.event];
  const theme = eventPresentation(d.id);
  const weddingDir = weddingDirection(d.id);
  const redEthnoWedding = d.id === "collection-wedding-kyzyl-tunduk";
  const motionRoot = useRef<HTMLDivElement>(null);
  const sharedMotion = useInvitationMotion();
  useEthnoMotion(motionRoot, !sharedMotion && redEthnoWedding && !onChange && !preview);
  const ethnoWedding = d.id === "collection-wedding-ak-bosogo" || redEthnoWedding;
  const direction = d.event === "kyz" ? kyzDirection(d.id) : weddingDir;
  const tr = (ky: string, russian: string) => ru ? russian : ky;
  // Translate only the seed sample. User-entered text is always preserved.
  const displayInv = ru && inv.message === example.message[0] ? { ...inv, message: example.message[1] } : inv;
  const text = (id: string, fallback: string, field?: WeddingPartInfo["field"], className = css.body) => <WeddingPart id={id} label={fallback || id} kind="text" fallback={fallback} field={field} className={className} />;
  const location = <section className={css.location} key="location" data-kyz-section="location">
    {theme ? <WeddingPart id="photo-venue" label="Фото места проведения" kind="image" slot="venue" className={`event-media ${eventCss.venueMedia}`}><div className={eventCss.venuePlaceholder} aria-hidden="true"><CollectionArt motif="house" /></div></WeddingPart> : direction ? <WeddingPart id="photo-venue" label="Фото места проведения" kind="image" slot="venue" fallback={d.event === "wedding" ? "/images/wedding-venue-placeholder.svg" : kyzAsset(weddingDir ? weddingDir.venue : direction.theme === "sapphire" || direction.theme === "heritage" ? "burgundy-venue" : "mountains-venue")} className="kyz-location-photo" /> : null}
    {text("location-title", tr("Жолугушуучу жай", "Место встречи"), undefined, css.heading)}
    {text("venue", inv.venue, "venue", css.venue)}
    {text("city", inv.city, "city")}{text("address", inv.address, "address")}
    <WeddingPart id="map-button" label="Карта" kind="widget">{preview ? <span className={css.button}>{tr("Картадан көрүү", "Посмотреть на карте")} ↗</span> : <a className={css.button} href={safeWeddingLink(invitationMapUrl(inv))} target="_blank" rel="noopener noreferrer" onClick={e => { if(onChange) e.preventDefault(); }}>{tr("Картадан көрүү", "Посмотреть на карте")} ↗</a>}</WeddingPart>
  </section>;
  const calendar = <section className={css.calendar} key="calendar" data-kyz-section="calendar">
    {text("calendar-title", tr("Күндү белгилеп коюңуз", "Сохраните дату"), undefined, css.heading)}
    <PinterestCalendar invitation={inv} locale={locale} />
    <WeddingPart id="event-time" label="Время начала" kind="date" className={css.time}>{tr("Башталышы", "Начало")} · {inv.time}</WeddingPart>
    {d.event === "iftar" ? text("iftar-time-note", tr("Ооз ачуу убактысын иш-чаранын күнүнө жараша тактап коюңуз.", "Уточните время разговения на дату встречи.")) : null}
  </section>;
  const intro = <section className={css.intro} key="intro" data-kyz-section="intro">
    {text("intro-title", tr("Кадырлуу коногубуз болуңуз!", "Будьте нашим дорогим гостем!"), undefined, css.heading)}
    {text("message", example.message[ru ? 1 : 0], "message")}
    {text("hosts", tr("Жылуу тилек менен, той ээлери", "С теплом, хозяева праздника"), "hosts", css.signature)}
  </section>;
  const eventProgramme: Partial<Record<string, string[][]>> = {
    tushoo: [["15:00", tr("Конокторду тосуп алуу", "Встреча гостей")], ["16:00", tr("Тушоо кесүү салты", "Обряд тушоо кесу")], ["17:00", tr("Дасторкон жана тилектер", "Дастархан и пожелания")], ["19:00", tr("Сүрөткө түшүү", "Семейные фото")]],
    anniversary: [["16:00", tr("Конокторду тосуп алуу", "Встреча гостей")], ["17:00", tr("Куттуктоо сөздөрү", "Поздравления")], ["18:00", tr("Майрамдык дасторкон", "Праздничный ужин")], ["20:00", tr("Музыка жана бий", "Музыка и танцы")]],
    beshik: [["15:00", tr("Конокторду тосуп алуу", "Встреча гостей")], ["16:00", tr("Бешик салты", "Обряд бешик той")], ["17:00", tr("Бата жана тилектер", "Благословения")], ["18:00", tr("Дасторкон", "Угощение")]],
    birthday: [["16:00", tr("Конокторду тосуп алуу", "Сбор гостей")], ["17:00", tr("Оюндар жана сюрпризлер", "Игры и сюрпризы")], ["18:00", tr("Торт жана тилек", "Торт и желание")], ["19:00", tr("Музыка жана бий", "Музыка и танцы")]],
    jentek: [["15:00", tr("Конокторду тосуп алуу", "Встреча гостей")], ["16:00", tr("Жентек салты", "Обряд жентек")], ["17:00", tr("Тилектер", "Пожелания")], ["18:00", tr("Дасторкон", "Праздничный стол")]],
    bachelorette: [["17:00", tr("Курбулардын жолугушуусу", "Сбор подруг")], ["18:00", tr("Оюндар жана сюрпризлер", "Игры и сюрпризы")], ["19:00", tr("Кечки тамак", "Ужин")], ["21:00", tr("Бий жана музыка", "Танцы и музыка")]],
    corporate: [["17:00", tr("Конокторду тосуп алуу", "Welcome-кофе")], ["18:00", tr("Салтанаттуу бөлүк", "Торжественная часть")], ["19:00", tr("Банкет", "Банкет")], ["21:00", tr("Музыка жана бий", "Шоу-программа")]],
    iftar: [["17:30", tr("Конокторду тосуп алуу", "Встреча гостей")], ["18:30", tr("Оозачар убактысы", "Время ифтара")], ["19:00", tr("Намаз", "Вечерний намаз")], ["19:30", tr("Дасторкон", "Общая трапеза")]],
  };
  const programme = d.event === "kyz" || weddingDir || ethnoWedding ? <section className={css.programme} key="programme" data-kyz-section="programme">
    {text("programme-title", d.event === "kyz" ? tr("Кыз узатуу күнүнүн программасы", "Программа кыз узатуу") : tr("Той программасы", "Программа дня"), undefined, css.heading)}
    <div className={css.programmeRows}>
      {(weddingDir || ethnoWedding ? (eventProgramme[d.event] ?? [
        ["15:30", tr("Конокторду тосуп алуу, фуршет", "Сбор гостей, фуршет")],
        ["16:00", tr("Нике жана салтанат", "Церемония бракосочетания")],
        ["17:00", tr("Банкет", "Банкет")],
        ["23:00", tr("Майрамдын аякташы", "Завершение вечера")],
      ]) : [
        ["16:00", tr("Конокторду жылуу тосуп алуу", "Тёплая встреча гостей")],
        ["17:00", tr("Ак тилек жана бата", "Добрые пожелания и бата")],
        ["18:00", tr("Кыз узатуу салтанаты", "Торжественная часть")],
        ["19:00", tr("Майрамдык дасторкон", "Праздничный дастархан")],
      ]).map(([time, label], index) => <div className={css.programmeRow} key={index}>
        <WeddingPart id={`programme-time-${index + 1}`} label="Убакыт" kind="text" fallback={time} className={css.programmeTime} />
        <WeddingPart id={`programme-item-${index + 1}`} label="Программа" kind="text" fallback={label} className={css.programmeItem} />
      </div>)}
    </div>
  </section> : null;
  const blocks: Record<string, React.ReactNode> = {intro,programme,location,calendar};
  const order = ethnoWedding ? [intro, calendar, programme, location] : direction ? direction.order.split(',').map(key => blocks[key]) : ["letter", "postcard", "fold", "columns"].includes(d.composition) ? [intro, location, calendar] : ["ticket", "stairs", "type"].includes(d.composition) ? [calendar, intro, location] : [intro, calendar, location];

  return <div ref={motionRoot} data-ethno-motion={redEthnoWedding && !onChange && !preview ? "on" : undefined} className={`${css.root} ${redEthnoWedding ? redEthnoCss.root : d.id === "collection-wedding-ak-bosogo" ? ethnoCss.root : ""} ${theme ? eventCss.root : direction ? kyzCss.root : ""} ${!theme && weddingDir ? weddingCss.root : ""} ${preview ? css.previewFullPage : ""}`} data-collection-design={d.id} data-event={d.event} data-event-family={theme?.family} data-kyz-theme={theme ? undefined : direction?.theme} data-skin={direction ? undefined : d.skin} style={collectionStyle(d, inv)}>
    <WeddingEditor invitation={displayInv} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} locale={locale}>
      <CollectionHero invitation={inv} design={d} locale={locale} />
      {d.id === "collection-wedding-ak-bosogo" && <EthnoWeddingPortrait locale={locale}/>}
      {redEthnoWedding && <RedEthnoWeddingPortrait locale={locale}/>}
      <div className={`${css.sections} ${!direction && ["duet", "columns", "collage"].includes(d.composition) ? css.splitSections : ""}`} data-kyz-sections={direction ? "true" : undefined}>
        {order}
        {direction ? <section data-kyz-section="details">
          {text("details-title", tr("Кеченин маанайы", "Настроение вечера"), undefined, css.heading)}
          <div className="kyz-swatches" aria-hidden="true"><i/><i/><i/><i/></div>
          {text("details-note", tr("Жылуу маанай жана ак тилек менен келиңиздер. Сиздердин катышууңуздар — биз үчүн эң баалуу белек.", "Приходите с добрыми пожеланиями и хорошим настроением. Ваше присутствие — самый дорогой подарок."))}
          {theme ? <WeddingPart id="photo-memory" label="Вторая фотография" kind="image" slot="memory" fallback={eventMediaSource(undefined, theme.hero)} className={eventCss.memory}><EventArtwork theme={theme}/></WeddingPart> : <WeddingPart id="photo-memory" label="Вторая фотография" kind="image" slot="memory" fallback={direction.photo ? kyzAsset(direction.photo) : eventArt(d.id).hero ?? d.photo} className="kyz-memory-photo" />}
        </section> : null}
        {d.event === "tushoo" ? <section data-kyz-section="dress" key="dress">
          {text("dress-title", tr("Кийим-кече", "Дресс-код"), undefined, css.heading)}
          {text("dress-note", tr("Майрамдын түстөрүн колдоп, жумшак пастель түстөгү кийимдерди тандаңыз.", "Будем рады, если вы поддержите палитру праздника нежными пастельными оттенками."))}
          <div className="kyz-swatches" aria-hidden="true"><i/><i/><i/><i/></div>
        </section> : null}
        <section className={css.countdown} data-kyz-section="countdown">
          {text("countdown-title", tr("Жолугушууга чейин", "До нашей встречи"), undefined, css.heading)}
          <PinterestTimer invitation={inv} locale={locale} />
        </section>
        <section className={css.rsvp} data-kyz-section="rsvp">
          {text("rsvp-title", tr("Келериңизди билдирип коюңуз", "Подтвердите участие"), undefined, css.heading)}
          {text("rsvp-note", tr("Сизге орун даярдоо үчүн жообуңузду күтөбүз.", "Ждём вашего ответа, чтобы подготовить для вас место."))}
          {!preview ? <form className={css.form} onSubmit={async e => {
            e.preventDefault();
            if(preview) return;
            if(onChange || sending.current || reply === "sent") return;
            const data = new FormData(e.currentTarget), name = String(data.get("name") || "").trim();
            if (!name) return;
            if(inv.id === "demo" || inv.id.startsWith("preview")) { guestFeedback("preview"); setReply("sent"); return; }
            sending.current = true; setReply("sending");
            try {
              await guestFetch(`/api/invitations/${encodeURIComponent(inv.id)}/rsvp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, rsvp: String(data.get("attendance") || "yes"), plusOne: Math.max(0, Math.min(19, Number(data.get("guests") || 1)-1)), note: String(data.get("note") || "") }) });
              setReply("sent");
            } catch { setReply("error"); } finally { sending.current = false; }
          }}>
            <label>{tr("Атыңыз", "Ваше имя")}<input required name="name" autoComplete="name" maxLength={120} disabled={preview} /></label>
            <fieldset><legend>{tr("Келе аласызбы?", "Сможете прийти?")}</legend>
              <label className={css.radio}><input type="radio" name="attendance" value="yes" defaultChecked disabled={preview} />{tr("Кубаныч менен келем", "С радостью приду")}</label>
              <label className={css.radio}><input type="radio" name="attendance" value="no" disabled={preview} />{tr("Тилекке каршы, келе албайм", "К сожалению, не смогу")}</label>
            </fieldset>
            <label>{tr("Сиз менен кошо коноктордун саны", "Количество гостей, включая вас")}<input required type="number" name="guests" min={1} max={20} defaultValue={1} disabled={preview} /></label>
            <label>{tr("Каалоо же комментарий", "Пожелания или комментарий")}<textarea name="note" maxLength={2000} rows={3} disabled={preview} /></label>
            <button className={css.button} type="submit" disabled={preview || !!onChange || reply === "sending" || reply === "sent"}>{reply === "sending" ? tr("Жөнөтүлүүдө…", "Отправляем…") : tr("Жоопту жөнөтүү", "Отправить ответ")}</button>
            {reply === "sent" ? <p role="status">{inv.id === "demo" || inv.id.startsWith("preview") ? tr("Бул алдын ала көрүү. Жооп жөнөтүлгөн жок.", "Это предпросмотр. Ответ не отправлен.") : tr("Рахмат! Жообуңуз жөнөтүлдү.", "Спасибо! Ваш ответ отправлен.")}</p> : null}
            {reply === "error" ? <p role="alert">{tr("Жооп жөнөтүлгөн жок. Кайра аракет кылыңыз.", "Не удалось отправить ответ. Попробуйте ещё раз.")}</p> : null}
          </form> : <div className={css.form} aria-hidden="true">
            <label>{tr("Атыңыз", "Ваше имя")}<input disabled placeholder={tr("Атыңыз", "Ваше имя")} /></label>
            <fieldset><legend>{tr("Келе аласызбы?", "Сможете прийти?")}</legend>
              <label className={css.radio}><input type="radio" disabled defaultChecked />{tr("Кубаныч менен келем", "С радостью приду")}</label>
              <label className={css.radio}><input type="radio" disabled />{tr("Тилекке каршы, келе албайм", "К сожалению, не смогу")}</label>
            </fieldset>
            <label>{tr("Сиз менен кошо коноктордун саны", "Количество гостей, включая вас")}<input disabled type="number" defaultValue={1} /></label>
            <label>{tr("Каалоо же комментарий", "Пожелания или комментарий")}<textarea disabled rows={3} /></label>
            <button className={css.button} type="button" disabled>{tr("Жоопту жөнөтүү", "Отправить ответ")}</button>
          </div>}
        </section>
        {(onChange || inv.wishes?.some(w => !w.hidden)) ? <section className={css.wishes}><WishesCarousel invitation={inv} ru={ru} editable={!!onChange} onChange={onChange} /></section> : null}
      </div>
      <footer className={css.footer}><CollectionArt motif={d.motif} />{text("footer-note", tr("Келгениңиз — биз үчүн чоң кубаныч!", "Ваше присутствие — наша радость!"), undefined, css.signature)}</footer>
    </WeddingEditor>
  </div>;
}
