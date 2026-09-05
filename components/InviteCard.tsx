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
  const names = invitation.names || "Манас & Каныкей";
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
      <div className="relative overflow-hidden border-[10px] border-[#1a1c19] bg-black">
        <div className="absolute left-1/2 top-2 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-[#1a1c19]" />
        <div
          id={capture ? INVITE_EXPORT_ID : undefined}
          className={`phone-frame-scroll aspect-[9/19] ${scroll ? "overflow-x-hidden overflow-y-auto bg-[#f6efe4]" : "overflow-hidden bg-[#fafafa]"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
