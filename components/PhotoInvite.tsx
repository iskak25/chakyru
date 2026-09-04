"use client";

import { ExtraLayer } from "./ExtraLayer";
import { CanvasDateTime, CanvasText, PhotoLayer, type InvitePatch } from "./CanvasEdit";
import { Field } from "./SiteEdit";
import { MoveCanvas } from "./MoveCanvas";
import { addHour, getPhotoLayout, photoDate, splitNames } from "@/lib/photoLooks";
import type { Invitation } from "@/lib/types";

const FALLBACK_COVER = "/images/hero-toi.jpg";
const SWATCHES = ["#f7f3ec", "#efe4d2", "#e8d5c4", "#d8c8b0", "#c5cdd4", "#9aa8b4", "#7a8a96", "#8a9a88", "#6a7358", "#4a5340"];

function Cover({ src, dim }: { src: string; dim?: string }) {
  return (
    <>
      <div className="kenburns absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} />
      <div className={`absolute inset-0 ${dim ?? "bg-gradient-to-b from-black/45 via-black/20 to-black/55"}`} />
    </>
  );
}

export function PhotoInvite({
  invitation,
  locale,
  compact,
  onChange,
  onSelect,
}: {
  invitation: Invitation;
  locale: string;
  compact?: boolean;
  onChange?: InvitePatch;
  onSelect?: (id: string | null) => void;
}) {
  const layout = getPhotoLayout(invitation.templateId);
  const cover = invitation.coverImage || FALLBACK_COVER;
  const names = invitation.names || "Манас & Каныкей";
  const { a, b } = splitNames(names);
  const when = photoDate(invitation.date, locale);
  const ru = locale === "ru";
  const message =
    invitation.message ||
    (ru ? "Приглашаем разделить с нами радость этого дня" : "Бул кубанычты биз менен бөлүшүүгө чакырабыз");
  const time = invitation.time || "18:00";
  const venue = invitation.venue || "«Ала-Тоо»";
  const city = [invitation.city, invitation.address].filter(Boolean).join(" · ") || "Бишкек";

  const frame = compact ? "h-full" : "min-h-full";

  return (
    <div className={`relative overflow-hidden ${frame}`}>
      <MoveCanvas
        editable={!!onChange}
        layout={invitation.layout ?? {}}
        onLayout={onChange ? (next) => onChange({ layout: next }) : undefined}
        onSelect={onSelect}
        onChange={onChange}
        invitation={invitation}
        height="auto"
        className="h-full"
      >
        {layout === "jpgSplash" ? (
          <Splash
            invitation={invitation}
            onChange={onChange}
            cover={cover}
            names={names}
            message={message}
            when={when}
            time={time}
            venue={venue}
            ru={ru}
          />
        ) : null}
        {layout === "jpgEngage" ? (
          <Engage
            invitation={invitation}
            onChange={onChange}
            cover={cover}
            names={names}
            message={message}
            when={when}
            time={time}
            venue={venue}
            city={city}
            ru={ru}
          />
        ) : null}
        {layout === "jpgSplit" ? (
          <Split
            invitation={invitation}
            onChange={onChange}
            cover={cover}
            a={a}
            b={b}
            message={message}
            when={when}
            time={time}
            venue={venue}
            city={city}
            ru={ru}
          />
        ) : null}
        {layout === "jpgMarble" ? (
          <Marble
            invitation={invitation}
            onChange={onChange}
            a={a}
            b={b}
            message={message}
            when={when}
            time={time}
            venue={venue}
            city={city}
            ru={ru}
          />
        ) : null}
        <ExtraLayer invitation={invitation} onChange={onChange} locale={locale} />
      </MoveCanvas>
    </div>
  );
}

function Splash({
  invitation,
  onChange,
  cover,
  names,
  message,
  when,
  time,
  venue,
  ru,
}: {
  invitation: Invitation;
  onChange?: InvitePatch;
  cover: string;
  names: string;
  message: string;
  when: ReturnType<typeof photoDate>;
  time: string;
  venue: string;
  ru: boolean;
}) {
  return (
    <div className="relative flex h-full min-h-full flex-col items-center justify-between px-8 py-12 text-center text-white">
      <Cover src={cover} />
      <PhotoLayer onChange={onChange} />
      <div className="relative z-10">
        <Field invitation={invitation} onChange={onChange} id="weddingDay" fallback="Wedding day" className="font-script text-[28px] leading-none" />
        <div className="mt-6 font-sans text-[42px] font-light leading-[0.95] tracking-[0.08em]">
          <p>{when.day}</p>
          <p className="text-[18px] opacity-70">.</p>
          <p>{when.month}</p>
          <p className="text-[18px] opacity-70">.</p>
          <p>{when.yearShort}</p>
        </div>
      </div>
      <div className="relative z-10 px-2">
        <CanvasText
          value={invitation.names}
          placeholder={names}
          onChange={onChange ? (v) => onChange({ names: v }) : undefined}
          className="font-script text-[48px] leading-none [text-shadow:0_8px_24px_rgba(0,0,0,0.35)]"
        />
        <CanvasText
          multiline
          value={invitation.message}
          placeholder={message}
          onChange={onChange ? (v) => onChange({ message: v }) : undefined}
          className="font-script mt-5 text-[20px] leading-7 [text-shadow:0_6px_18px_rgba(0,0,0,0.35)]"
        />
      </div>
      <div className="relative z-10">
        {onChange ? (
          <CanvasDateTime date={invitation.date} time={invitation.time} onChange={onChange} className="text-[12px] uppercase tracking-[0.18em] text-white/80" />
        ) : (
          <p className="text-[12px] uppercase tracking-[0.18em] text-white/85">
            {venue} / {time}
          </p>
        )}
        {onChange ? (
          <CanvasText
            value={invitation.venue}
            placeholder={ru ? "Место" : "Жай"}
            onChange={(v) => onChange({ venue: v })}
            className="mt-2 text-[12px] uppercase tracking-[0.16em] text-white/80"
          />
        ) : null}
      </div>
    </div>
  );
}

function Engage({
  invitation,
  onChange,
  cover,
  names,
  message,
  when,
  time,
  venue,
  city,
  ru,
}: {
  invitation: Invitation;
  onChange?: InvitePatch;
  cover: string;
  names: string;
  message: string;
  when: ReturnType<typeof photoDate>;
  time: string;
  venue: string;
  city: string;
  ru: boolean;
}) {
  return (
    <div className="relative flex h-full min-h-full flex-col items-center justify-between px-7 py-10 text-center text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
      <Cover src={cover} dim="bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
      <PhotoLayer onChange={onChange} />
      <div className="relative z-10">
        <Field
          invitation={invitation}
          onChange={onChange}
          id="youAreInvited"
          fallback={ru ? "ПРИГЛАШАЕМ НА НИКЕ" : "НИКЕГЕ ЧАКЫРАБЫЗ"}
          className="text-[10px] uppercase tracking-[0.22em]"
        />
        <CanvasText
          value={invitation.names}
          placeholder={names}
          onChange={onChange ? (v) => onChange({ names: v }) : undefined}
          className="font-serif mt-4 text-[36px] italic leading-none"
        />
      </div>
      <div className="relative z-10">
        <p className="font-serif text-[22px]">{when.monthName}</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.12em]">{when.weekday}</span>
          <span className="font-serif text-[64px] leading-none">{when.dayNum}</span>
          <span className="text-[11px] uppercase tracking-[0.12em]">
            {ru ? "в" : ""} {time}
          </span>
        </div>
        <p className="font-serif text-[22px]">{when.year}</p>
        {onChange ? <CanvasDateTime date={invitation.date} time={invitation.time} onChange={onChange} className="mt-3 text-white/80" /> : null}
      </div>
      <div className="relative z-10 space-y-2">
        <CanvasText
          multiline
          value={invitation.message}
          placeholder={message}
          onChange={onChange ? (v) => onChange({ message: v }) : undefined}
          className="text-[11px] uppercase tracking-[0.16em]"
        />
        <CanvasText
          value={invitation.venue}
          placeholder={venue}
          onChange={onChange ? (v) => onChange({ venue: v }) : undefined}
          className="text-[11px] uppercase tracking-[0.12em]"
        />
        <CanvasText
          value={[invitation.city, invitation.address].filter(Boolean).join(" · ")}
          placeholder={city}
          onChange={
            onChange
              ? (v) => {
                  const [nextCity, ...rest] = v.split("·").map((s) => s.trim());
                  onChange({ city: nextCity ?? "", address: rest.join(" · ") });
                }
              : undefined
          }
          className="text-[10px] uppercase tracking-[0.12em] text-white/80"
        />
        <p className="pt-1 text-[12px] tracking-[0.2em]">{when.dottedFull}</p>
        <Field invitation={invitation} onChange={onChange} id="saveTheDate" fallback="SAVE THE DATE" className="font-serif pt-2 text-[16px] uppercase tracking-[0.14em]" />
      </div>
    </div>
  );
}

function Split({
  invitation,
  onChange,
  cover,
  a,
  b,
  message,
  when,
  time,
  venue,
  city,
  ru,
}: {
  invitation: Invitation;
  onChange?: InvitePatch;
  cover: string;
  a: string;
  b: string;
  message: string;
  when: ReturnType<typeof photoDate>;
  time: string;
  venue: string;
  city: string;
  ru: boolean;
}) {
  return (
    <div className="relative h-full min-h-full overflow-hidden bg-[#f3f1ec] text-[#1c1814]">
      <div className="brush-split absolute inset-y-0 right-0 w-[58%]">
        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${cover})` }} />
        <PhotoLayer onChange={onChange} />
      </div>
      <div className="relative z-10 flex h-full min-h-full w-[54%] flex-col items-center justify-center px-4 py-10 text-center">
        <p className="font-serif text-[40px] font-light tracking-[0.08em]">
          {a[0] ?? "A"} / {b[0] ?? "B"}
        </p>
        <Field
          invitation={invitation}
          onChange={onChange}
          id="together"
          fallback={ru ? "ВМЕСТЕ НА ВСЮ ЖИЗНЬ" : "БИРГЕ БИР ӨМҮРГӨ"}
          className="mt-5 text-[9px] uppercase tracking-[0.2em]"
        />
        <Field invitation={invitation} onChange={onChange} id="weSayYes" fallback={ru ? "говорим да." : "ооба дейбиз."} className="font-script mt-1 text-[22px] leading-none" />
        <span className="mt-3 text-lg opacity-40">♡</span>
        <CanvasText
          multiline
          value={invitation.message}
          placeholder={message}
          onChange={onChange ? (v) => onChange({ message: v }) : undefined}
          className="mt-4 max-w-[18ch] font-serif text-[12px] leading-6"
        />
        <div className="mt-6 w-full max-w-[200px] border-y border-black/20 py-3">
          <div className="grid grid-cols-2 divide-x divide-black/20">
            <div>
              <p className="text-[9px] uppercase tracking-[0.14em]">{when.monthName}</p>
              <p className="font-serif text-[36px] leading-none">{when.dayNum}</p>
              <p className="text-[11px]">{when.year}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.12em]">{when.weekday}</p>
              <p className="font-serif text-[28px] leading-none">{time}</p>
              <p className="text-[9px] uppercase tracking-[0.14em]">{ru ? "ЧАС" : "СААТ"}</p>
            </div>
          </div>
          {onChange ? <CanvasDateTime date={invitation.date} time={invitation.time} onChange={onChange} className="mt-2 text-[11px]" /> : null}
        </div>
        <Field invitation={invitation} onChange={onChange} id="youAreInvited" fallback={ru ? "вы приглашены" : "чакырабыз"} className="font-script mt-5 text-[22px] underline decoration-1 underline-offset-4" />
        <CanvasText
          value={invitation.venue}
          placeholder={venue}
          onChange={onChange ? (v) => onChange({ venue: v }) : undefined}
          className="mt-4 text-[10px] uppercase tracking-[0.16em]"
        />
        <CanvasText
          value={invitation.city}
          placeholder={city}
          onChange={onChange ? (v) => onChange({ city: v }) : undefined}
          className="text-[9px] uppercase tracking-[0.12em] opacity-50"
        />
      </div>
    </div>
  );
}

function Marble({
  invitation,
  onChange,
  a,
  b,
  message,
  when,
  time,
  venue,
  city,
  ru,
}: {
  invitation: Invitation;
  onChange?: InvitePatch;
  a: string;
  b: string;
  message: string;
  when: ReturnType<typeof photoDate>;
  time: string;
  venue: string;
  city: string;
  ru: boolean;
}) {
  const gold = "#b59a7a";
  return (
    <div className="marble-bg relative h-full min-h-full px-4 py-6 text-center" style={{ color: gold }}>
      <PhotoLayer onChange={onChange} />
      <div className="gold-arch relative flex h-full min-h-full flex-col justify-between overflow-hidden px-5 py-8">
        <div className="jpg-crystal pointer-events-none absolute -right-6 -top-4 h-32 w-32 opacity-70" />
        <div>
          <p className="font-serif text-[52px] italic leading-none">
            {a[0] ?? "L"} & {b[0] ?? "M"}
          </p>
          <CanvasText
            multiline
            value={invitation.message}
            placeholder={message}
            onChange={onChange ? (v) => onChange({ message: v }) : undefined}
            className="mt-5 font-serif text-[15px] leading-6"
          />
          <p className="mt-5 font-serif text-[28px] italic">{when.dottedLong}</p>
          {onChange ? <CanvasDateTime date={invitation.date} time={invitation.time} onChange={onChange} className="mt-2 text-[11px]" /> : null}
          <div className="gold-flourish mx-auto my-5 h-px w-28" />
        </div>
        <div className="grid grid-cols-2 gap-3 text-[11px] leading-5">
          <div className="border-r pr-3" style={{ borderColor: `${gold}55` }}>
            <p className="font-serif text-[13px]">{ru ? "Регистрация брака" : "Нике"}</p>
            <p className="mt-2 font-serif text-[22px]">{time}</p>
            <CanvasText
              value={invitation.venue}
              placeholder={venue}
              onChange={onChange ? (v) => onChange({ venue: v }) : undefined}
              className="mt-2 font-serif text-[12px]"
            />
          </div>
          <div>
            <p className="font-serif text-[13px]">{ru ? "Свадебный банкет" : "Банкет"}</p>
            <p className="mt-2 font-serif text-[22px]">{addHour(time, 2)}</p>
            <CanvasText
              value={[invitation.city, invitation.address].filter(Boolean).join(", ")}
              placeholder={city}
              onChange={
                onChange
                  ? (v) => {
                      const [nextCity, ...rest] = v.split(",").map((s) => s.trim());
                      onChange({ city: nextCity ?? "", address: rest.join(", ") });
                    }
                  : undefined
              }
              className="mt-2 font-serif text-[12px]"
            />
          </div>
        </div>
        <div className="relative mt-4 flex items-end gap-3">
          <img src="/stickers/wedding-couple.png" alt="" className="h-24 w-20 object-contain" />
          <div className="flex-1 pb-1 text-left">
            <Field
              invitation={invitation}
              onChange={onChange}
              id="dressCode"
              fallback={ru ? "ДРЕСС-КОД: нежные тона" : "ДРЕСС-КОД: жумшак тон"}
              className="text-[10px] uppercase tracking-[0.12em]"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SWATCHES.map((c) => (
                <span key={c} className="h-5 w-5 rounded-full border" style={{ background: c, borderColor: `${gold}55` }} />
              ))}
            </div>
            <p className="mt-3 font-serif text-[12px] leading-5">
              {ru ? "С любовью," : "Сүйүү менен,"} {a} & {b}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
