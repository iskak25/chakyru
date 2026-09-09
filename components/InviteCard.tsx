"use client";

import { formatInviteDate } from "@/lib/i18n";
import { getTemplate } from "@/lib/templates";
import { useCatalog } from "@/lib/useCatalog";
import type { Invitation } from "@/lib/types";
import { ExtraLayer, paint } from "./ExtraLayer";
import { CanvasDateTime, CanvasText, PhotoLayer, type InvitePatch } from "./CanvasEdit";
import { FreeMove, MoveCanvas } from "./MoveCanvas";
import { CornerFrame, Ornament } from "./Ornament";
import { INVITE_EXPORT_ID } from "@/lib/exportInvite";

function formatDate(date: string, locale: string) {
  return formatInviteDate(date, locale) || "—";
}

export function InviteCard({
  invitation,
  guestName,
  compact = false,
  locale = "ky",
  onChange,
  onSelect,
}: {
  invitation: Invitation;
  guestName?: string;
  compact?: boolean;
  locale?: string;
  onChange?: InvitePatch;
  onSelect?: (id: string | null) => void;
}) {
  useCatalog();
  const template = getTemplate(invitation.templateId);
  const { style } = template;
  const names = invitation.names || "Айбек & Айгүл";
  const round = ["rosa", "kyz-uzatuu-photo", "balalyk", "ak-jooluk"].includes(template.id);
  const noFrame = template.id === "minimal-white";
  const message =
    invitation.message ||
    (locale === "ru"
      ? "Приглашаем разделить с нами радость этого дня"
      : "Бул кубанычты биз менен бөлүшүүгө чакырабыз");

  return (
    <div
      className={`relative overflow-hidden ${compact ? "h-full" : "min-h-[560px]"}`}
      style={{ background: paint(invitation, "page", style.bg), color: style.accent }}
    >
      <PhotoLayer onChange={onChange} />
      {noFrame ? null : <CornerFrame className="text-current opacity-70" />}
      <MoveCanvas
        editable={!!onChange}
        layout={invitation.layout ?? {}}
        onLayout={onChange ? (layout) => onChange({ layout }) : undefined}
        onSelect={onSelect}
        onChange={onChange}
        invitation={invitation}
      >
        <FreeMove id="ornament" defaults={{ x: 22, y: 4, w: 56, h: 6, z: 2 }}>
          <Ornament className="h-full w-full text-current" />
        </FreeMove>
        <FreeMove id="names" defaults={{ x: 8, y: 12, w: 84, h: 16, z: 5 }}>
          <div className="flex h-full flex-col items-center justify-center text-center">
            {guestName ? (
              <p className="mb-1 text-[10px] uppercase tracking-[0.35em] opacity-80">{guestName}</p>
            ) : null}
            <CanvasText
              value={invitation.names}
              placeholder={names}
              onChange={onChange ? (v) => onChange({ names: v }) : undefined}
              className={`font-serif italic leading-none ${compact ? "text-4xl" : "text-5xl"}`}
              style={{ color: paint(invitation, "names", style.accent) }}
            />
          </div>
        </FreeMove>
        <FreeMove id="panel" defaults={{ x: 7, y: 32, w: 86, h: 46, z: 4 }}>
          <div
            className={`flex h-full flex-col items-center justify-center overflow-auto px-4 py-4 text-center ${round ? "rounded-3xl" : "rounded-sm"}`}
            style={{
              background: paint(invitation, "panel", style.panel),
              color: paint(invitation, "message", style.text),
            }}
          >
            {invitation.coverImage ? (
              <div
                className="mb-3 h-28 w-full rounded-sm bg-cover bg-center"
                style={{ backgroundImage: `url(${invitation.coverImage})` }}
              />
            ) : null}
            <CanvasText
              multiline
              value={invitation.message}
              placeholder={message}
              onChange={onChange ? (v) => onChange({ message: v }) : undefined}
              className="font-serif text-lg leading-snug"
              style={{ color: style.text }}
            />
            {onChange ? (
              <CanvasDateTime
                date={invitation.date}
                time={invitation.time}
                onChange={onChange}
                className="mt-4 uppercase tracking-[0.12em]"
                style={{ color: style.muted }}
              />
            ) : (
              <p className="mt-4 text-[11px] uppercase tracking-[0.22em]" style={{ color: style.muted }}>
                {formatDate(invitation.date, locale)}
                {invitation.time ? ` · ${invitation.time}` : ""}
              </p>
            )}
            <CanvasText
              value={invitation.venue}
              placeholder="«Ала-Тоо» рестораны"
              onChange={onChange ? (v) => onChange({ venue: v }) : undefined}
              className="mt-1 font-serif text-base"
              style={{ color: style.text }}
            />
            <CanvasText
              value={[invitation.city, invitation.address].filter(Boolean).join(" · ")}
              placeholder="Бишкек"
              onChange={
                onChange
                  ? (v) => {
                      const [city, ...rest] = v.split("·").map((s) => s.trim());
                      onChange({ city: city ?? "", address: rest.join(" · ") });
                    }
                  : undefined
              }
              className="text-xs"
              style={{ color: style.muted }}
            />
            {invitation.adultsOnly ? (
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em]" style={{ color: style.accent }}>
                {locale === "ru" ? "Только взрослые" : "Чоңдор гана"}
              </p>
            ) : null}
          </div>
        </FreeMove>
        <FreeMove id="hosts" defaults={{ x: 10, y: 82, w: 80, h: 10, z: 5 }}>
          <div className="flex h-full items-center justify-center">
            <CanvasText
              value={invitation.hosts}
              placeholder={onChange ? (locale === "ru" ? "Кто приглашает" : "Чакыруучулар") : ""}
              onChange={onChange ? (v) => onChange({ hosts: v }) : undefined}
              className="text-center text-[11px] tracking-wide opacity-80"
            />
          </div>
        </FreeMove>
        <ExtraLayer
          invitation={invitation}
          onChange={onChange}
          guestName={guestName}
          locale={locale}
        />
      </MoveCanvas>
    </div>
  );
}

export function PhoneFrame({
  children,
  large,
  scroll,
  capture,
}: {
  children: React.ReactNode;
  large?: boolean;
  scroll?: boolean;
  capture?: boolean;
}) {
  return (
    <div className={`relative mx-auto shrink-0 ${large ? "w-[320px] sm:w-[360px]" : "w-[280px]"}`}>
      {/* side buttons */}
      <span className="pointer-events-none absolute -left-[3px] top-[18%] z-10 h-8 w-[3px] rounded-l-sm bg-[#2a2a2c]" />
      <span className="pointer-events-none absolute -left-[3px] top-[28%] z-10 h-14 w-[3px] rounded-l-sm bg-[#2a2a2c]" />
      <span className="pointer-events-none absolute -left-[3px] top-[42%] z-10 h-14 w-[3px] rounded-l-sm bg-[#2a2a2c]" />
      <span className="pointer-events-none absolute -right-[3px] top-[32%] z-10 h-20 w-[3px] rounded-r-sm bg-[#2a2a2c]" />

      <div className="relative rounded-[2.35rem] bg-gradient-to-b from-[#3a3a3c] via-[#1c1c1e] to-[#0b0b0c] p-[2px] shadow-[0_18px_40px_rgba(26,28,25,0.22)] sm:rounded-[2.6rem]">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-black p-[7px] sm:rounded-[2.45rem] sm:p-[8px]">
          {/* Dynamic Island */}
          <div className="pointer-events-none absolute left-1/2 top-[11px] z-30 flex h-[22px] w-[92px] -translate-x-1/2 items-center justify-center rounded-full bg-black sm:top-[12px] sm:h-[24px] sm:w-[100px]">
            <span className="absolute right-[18px] h-[8px] w-[8px] rounded-full bg-[#1a1a1c] ring-1 ring-[#2c2c2e]" />
          </div>

          <div
            id={capture ? INVITE_EXPORT_ID : undefined}
            className={`phone-frame-scroll aspect-[9/19.5] overflow-hidden rounded-[1.85rem] sm:rounded-[2.05rem] ${
              scroll ? "overflow-x-hidden overflow-y-auto bg-[#f6efe4]" : "bg-[#fafafa]"
            }`}
          >
            {children}
          </div>

          {/* home indicator */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[7px] z-30 flex justify-center sm:bottom-[8px]">
            <span className="h-[4px] w-[34%] max-w-[110px] rounded-full bg-white/35" />
          </div>
        </div>
      </div>
    </div>
  );
}
