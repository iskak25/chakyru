"use client";

import { invitationMapUrl, DEFAULT_VENUE } from "@/lib/defaultVenue";

import { useState, type CSSProperties, type ReactNode } from "react";
import { MapPin, Volume2, VolumeX } from "lucide-react";
import type { Invitation } from "@/lib/types";
import type { AnniversaryDesign } from "@/lib/anniversaryTemplates";
import { safeWeddingLink, type WeddingPartInfo } from "@/lib/weddingEditor";
import { effectiveMusicUrl } from "@/lib/music";
import { WeddingEditor, WeddingPart } from "./WeddingEditor";
import { PinterestCalendar, PinterestTimer } from "./PinterestInvite";
import { AnniversaryHero } from "./AnniversaryHero";
import { InviteAudio } from "./InviteAudio";
import type { InvitePatch } from "./CanvasEdit";
import css from "./AnniversaryInvite.module.css";

type Props = { invitation: Invitation; design: AnniversaryDesign; locale: string; onChange?: InvitePatch; selected?: string | null; onSelect?: (id: string | null) => void; onPartsChange?: (parts: WeddingPartInfo[]) => void };
export function AnniversaryInvite({ invitation: inv, design, locale, onChange, selected, onSelect, onPartsChange }: Props) {
  const [reply, setReply] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [playing, setPlaying] = useState(false);
  const ky = locale === "ky", mono = design.key === "monochrome";
  const tr = (ru: string, kg: string) => ky ? kg : ru;
  const preview = inv.id === "demo" || inv.id.startsWith("preview");
  const music = effectiveMusicUrl(inv.musicUrl, inv.music);
  const text = (id: string, fallback: string, className = css.body, field?: WeddingPartInfo["field"]) => <WeddingPart id={id} label={fallback || id} kind="text" fallback={fallback} className={className} field={field} />;
  const section = (id: string, label: string, children: ReactNode, extra = "") => <WeddingPart id={`section-${id}`} label={label} kind="block" className={`${css.section} ${extra}`}>{children}</WeddingPart>;
  const title = (id: string, ru: string, kg: string) => text(`${id}-title`, tr(ru, kg), css.title);
  const map = safeWeddingLink(invitationMapUrl(inv));
  const program = [tr("Встреча гостей", "Конокторду тосуу"), tr("Поздравления и праздничный ужин", "Куттуктоолор жана майрамдык дасторкон"), tr("Музыка, танцы и тёплые встречи", "Музыка, бий жана жылуу жолугушуулар")];
  const timeAt = (offset: number) => {
    const [h, m] = (inv.time || "18:00").split(":").map(Number);
    const total = ((Number.isFinite(h) ? h : 18) * 60 + (Number.isFinite(m) ? m : 0) + offset) % 1440;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };
  return <div className={`${css.root} ${css[design.key]}`} data-anniversary-design={design.key} style={{ "--jubilee-paper": inv.blockColors?.page || design.paper, "--jubilee-ink": design.ink } as CSSProperties}>
    <WeddingEditor invitation={inv} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} locale={locale}>
      <WeddingPart id="section-hero" label="Обложка юбилея" kind="block"><AnniversaryHero invitation={inv} design={design} locale={locale} /></WeddingPart>
      {section("intro", "Приглашение", <>
        {text("intro-overline", tr("ОСОБЕННЫЙ ДЕНЬ · БЛИЗКИЕ ЛЮДИ", "ӨЗГӨЧӨ КҮН · ЖАКЫН АДАМДАР"), css.overline)}
        {title("intro", "Дорогие родные и друзья!", "Урматтуу туугандар жана достор!")}
        {text("message", tr("С радостью приглашаю вас на мой юбилей. Хочу провести этот вечер в кругу самых близких людей — с добрыми словами, любимой музыкой и воспоминаниями, которые согревают сердце.\n\nБуду счастлив разделить с вами этот особенный день!", "Сиздерди мааракеме кубаныч менен чакырам! Бул кечени эң жакын адамдарым менен жылуу сөздөргө, сүйүктүү музыкага жана жагымдуу эскерүүлөргө бөлөп өткөргүм келет.\n\nКубанычымды тең бөлүшүп, кадырлуу коногум болуңуздар!"), css.body, "message")}
        {text("intro-signature", design.names, css.signature, "names")}
      </>)}
      {section("calendar", "Дата праздника", <>{title("calendar", "Сохраните дату", "Күндү белгилеп коюңуз")}
        <div className={css.calendar}><PinterestCalendar invitation={inv} locale={locale} /></div>
        <WeddingPart id="arrival-time" label="Время начала" kind="date" className={css.arrival}>{tr("Сбор гостей в", "Конокторду тосуу")} {inv.time}</WeddingPart>
      </>)}
      {section("location", "Место проведения", <>
        <MapPin className={css.mark} strokeWidth={1} />{title("location", "Место проведения", "Өтүүчү жай")}
        {text("venue", "«Ала-Тоо»", css.venue, "venue")}{text("address", "Бишкек", css.body, "address")}
        {inv.gallery?.venue ? <WeddingPart id="photo-venue" label="Фото места" kind="image" slot="venue" className={css.venuePhoto} /> : onChange ? <WeddingPart id="photo-venue" label="Добавить фото места" kind="image" slot="venue" fallback={design.hero} className={css.venuePhoto} /> : null}
        <WeddingPart id="map-button" label="Карта" kind="widget"><a href={map} target="_blank" rel="noopener noreferrer" className={css.button} onClick={e => { if (onChange) e.preventDefault(); }}>{tr("Посмотреть на карте", "Картадан көрүү")}</a></WeddingPart>
      </>)}
      {section("program", "Программа вечера", <>{title("program", "Этот вечер для нас", "Бул кече биз үчүн")}
        <div className={css.program}>{program.map((item, i) => <WeddingPart id={`program-row-${i}`} key={i} label={item} kind="block" className={css.programRow}>
          {text(`program-time-${i}`, timeAt([0, 30, 120][i]), css.programTime)}{text(`program-title-${i}`, item, css.body)}
        </WeddingPart>)}</div>
      </>)}
      {section("dress", "Дресс-код", <>{title("dress", "Дресс-код", "Кийим үлгүсү")}
        {text("dressCode", mono ? tr("Буду рад, если вы поддержите чёрно-белую палитру вечера. Выбирайте наряд, в котором вам удобно праздновать!", "Кеченин ак-кара түстөрүн колдосоңуздар кубанам. Майрамга ыңгайлуу кийим тандаңыздар!") : tr("Элегантные вечерние образы: глубокий синий, графит, шампань и светлые оттенки. Главное — ваше хорошее настроение.", "Кечки жарашыктуу кийим: кочкул көк, боз, каймак жана ачык түстөр. Эң башкысы — жакшы маанайыңыздар."), css.body, "dressCode")}
        <div className={css.swatches} aria-hidden="true">{(mono ? ["#121212", "#858585", "#fff"] : ["#292939", "#666573", "#d8c8ab", "#f7f4eb"]).map(color => <span key={color} style={{ background: color }} />)}</div>
      </>)}
      {section("rsvp", "Ответ гостя", <>{title("rsvp", "Буду вас ждать", "Сиздерди күтөм")}
        {text("rsvp-intro", tr("Пожалуйста, подтвердите участие, чтобы я мог подготовить место для каждого гостя.", "Ар бир конокко орун даярдоо үчүн келериңизди билдирип коюңуз."))}
        <form className={css.form} onSubmit={async e => {
          e.preventDefault(); if (onChange || reply === "sending" || reply === "sent") return;
          const data = new FormData(e.currentTarget), name = String(data.get("name") || "").trim();
          if (!name) return;
          if (preview) { setReply("sent"); return; }
          setReply("sending");
          try {
            const response = await fetch(`/api/invitations/${encodeURIComponent(inv.id)}/rsvp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, rsvp: String(data.get("attendance") || "yes"), plusOne: Math.max(0, Math.min(19, Number(data.get("guests") || 1) - 1)), note: String(data.get("note") || "") }) });
            if (!response.ok) throw new Error("rsvp"); setReply("sent");
          } catch { setReply("error"); }
        }}>
          <label>{tr("Ваше имя", "Атыңыз")}<input name="name" autoComplete="name" maxLength={120} required /></label>
          <fieldset><legend>{tr("Сможете прийти?", "Келе аласызбы?")}</legend>
            <label className={css.radio}><input type="radio" name="attendance" value="yes" defaultChecked />{tr("С радостью приду", "Кубаныч менен келем")}</label>
            <label className={css.radio}><input type="radio" name="attendance" value="no" />{tr("К сожалению, не смогу", "Тилекке каршы, келе албайм")}</label>
          </fieldset>
          <label>{tr("Количество гостей, включая вас", "Сиз менен кошо коноктордун саны")}<input type="number" name="guests" min={1} max={20} defaultValue={1} required /></label>
          <label>{tr("Пожелания по меню или комментарий", "Тамак-аш боюнча каалоо же комментарий")}<textarea name="note" rows={3} maxLength={2000} /></label>
          <button className={css.button} type="submit" disabled={!!onChange || reply === "sending" || reply === "sent"}>{reply === "sending" ? tr("Отправляем…", "Жөнөтүлүүдө…") : tr("Отправить ответ", "Жоопту жөнөтүү")}</button>
          {reply === "sent" && <p role="status">{preview ? tr("Это предпросмотр. Ответ не отправлен.", "Бул алдын ала көрүү. Жооп жөнөтүлгөн жок.") : tr("Спасибо! Ваш ответ отправлен.", "Рахмат! Жообуңуз жөнөтүлдү.")}</p>}
          {reply === "error" && <p role="alert">{tr("Не удалось отправить ответ. Попробуйте ещё раз.", "Жооп жөнөтүлгөн жок. Кайра аракет кылыңыз.")}</p>}
        </form>
      </>)}
      {section("countdown", "До праздника", <>{text("countdown-label", tr("ДО НАШЕЙ ВСТРЕЧИ", "ЖОЛУГУШУУГА ЧЕЙИН"), css.overline)}<div className={css.timer}><PinterestTimer invitation={inv} locale={locale} /></div></>)}
      {section("footer", "Завершение", <>{title("footer", "Жду встречи!", "Жолугушууну күтөм!")}{text("footer-note", tr("С теплом и благодарностью", "Жылуу сезим жана ыраазычылык менен"))}{text("footer-name", design.names, css.signature, "names")}</>, css.footer)}
    </WeddingEditor>
    {music && <><InviteAudio src={music} playing={playing} /><button type="button" data-export-hide className={css.music} aria-label={playing ? tr("Выключить музыку", "Музыканы өчүрүү") : tr("Включить музыку", "Музыканы күйгүзүү")} onClick={() => setPlaying(value => !value)}>{playing ? <Volume2 size={18} /> : <VolumeX size={18} />}</button></>}
  </div>;
}
