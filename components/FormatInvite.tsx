"use client";

import { useState } from "react";
import { ImagePlus, Mic, Music } from "lucide-react";
import { formatOf, getTemplate } from "@/lib/templates";
import { useCatalog } from "@/lib/useCatalog";
import { useI18n } from "@/lib/locale";
import type { Invitation, InviteFormat } from "@/lib/types";
import { ExtraLayer } from "./ExtraLayer";
import { CanvasDateTime, CanvasText, PhotoLayer, type InvitePatch } from "./CanvasEdit";
import { FreeMove, MoveCanvas } from "./MoveCanvas";
import { Site3D } from "./Site3D";
import { MusicPickModal } from "./MusicPicker";
import { VideoInvite } from "./VideoInvite";

function speak(text: string) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ru-RU";
  u.rate = 0.92;
  window.speechSynthesis.speak(u);
}

export function MediaStage({
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
  useCatalog();
  const template = getTemplate(invitation.templateId);
  const names = invitation.names || "Манас & Каныкей";
  const text =
    invitation.message ||
    (locale === "ru"
      ? "Приглашаем разделить с нами радость этого дня"
      : "Бул кубанычты биз менен бөлүшүүгө чакырабыз");

  return (
    <div className={`relative overflow-hidden ${compact ? "h-full" : "min-h-[560px]"}`}>
        <div
          className="kenburns absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: invitation.coverImage
              ? `url(${invitation.coverImage})`
              : template.style.bg,
            backgroundColor: template.style.text,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/35" />
        <PhotoLayer onChange={onChange} />
        <MoveCanvas
          editable={!!onChange}
          layout={invitation.layout ?? {}}
          onLayout={onChange ? (layout) => onChange({ layout }) : undefined}
          onSelect={onSelect}
          onChange={onChange}
          invitation={invitation}
        >
          <FreeMove id="names" defaults={{ x: 8, y: 58, w: 84, h: 14, z: 5 }}>
            <div className="flex h-full items-center justify-center">
              <CanvasText
                value={invitation.names}
                placeholder={names}
                onChange={onChange ? (v) => onChange({ names: v }) : undefined}
                className="font-serif text-4xl italic leading-none text-white"
              />
            </div>
          </FreeMove>
          <FreeMove id="message" defaults={{ x: 8, y: 73, w: 84, h: 12, z: 5 }}>
            <div className="flex h-full items-center justify-center">
              <CanvasText
                multiline
                value={invitation.message}
                placeholder={text}
                onChange={onChange ? (v) => onChange({ message: v }) : undefined}
                className="max-w-xs text-sm leading-6 text-white/85"
              />
            </div>
          </FreeMove>
          <FreeMove id="date" defaults={{ x: 18, y: 88, w: 64, h: 7, z: 5 }}>
            <div className="flex h-full items-center justify-center">
              {onChange ? (
                <CanvasDateTime
                  date={invitation.date}
                  time={invitation.time}
                  onChange={onChange}
                  className="text-white/80"
                />
              ) : invitation.date ? (
                <p className="text-xs tracking-[0.2em] text-white/70">
                  {invitation.date} · {invitation.time}
                </p>
              ) : null}
            </div>
          </FreeMove>
          <ExtraLayer invitation={invitation} onChange={onChange} locale={locale} />
        </MoveCanvas>
    </div>
  );
}

export function FormatInvite({
  invitation,
  locale,
  compact,
  interactive,
  onChange,
  onReload,
  onSelect,
  startOpen,
}: {
  invitation: Invitation;
  locale: string;
  compact?: boolean;
  interactive?: boolean;
  onChange?: InvitePatch;
  onReload?: () => void;
  onSelect?: (id: string | null) => void;
  startOpen?: boolean;
}) {
  const { t } = useI18n();
  useCatalog();
  const format = formatOf(invitation.templateId);
  const [pickOpen, setPickOpen] = useState(false);

  if (format === "site3d") {
    const variant = onChange ? "editor" : compact && !interactive ? "preview" : "guest";
    return (
      <div className={compact && !onChange ? "h-full" : "min-h-full"}>
        <Site3D
          invitation={invitation}
          locale={locale}
          onChange={onChange}
          onReload={onReload}
          variant={variant}
          labels={t.site3d}
          onSelect={onSelect}
          startOpen={startOpen}
          framed={!!compact}
        />
      </div>
    );
  }

  if (format === "videoMusic" || format === "videoVoice") {
    return (
      <div className="relative h-full">
        <VideoInvite
          invitation={invitation}
          locale={locale}
          format={format}
          compact={compact}
          interactive={interactive}
          onChange={onChange}
          onSelect={onSelect}
          onMusicClick={onChange ? () => setPickOpen(true) : undefined}
        />
        {onChange ? (
          <MusicPickModal
            open={pickOpen}
            locale={locale}
            value={invitation.musicUrl}
            onClose={() => setPickOpen(false)}
            onChange={(musicUrl) => {
              onChange({ musicUrl, music: Boolean(musicUrl) });
              if (musicUrl) setPickOpen(false);
            }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <MediaStage
        invitation={invitation}
        locale={locale}
        compact={compact}
        onChange={onChange}
        onSelect={onSelect}
      />
    </div>
  );
}

export function EditorToolbar({
  format,
  invitation,
  onChange,
  labels,
}: {
  format: InviteFormat;
  invitation: Invitation;
  onChange: InvitePatch;
  labels: { photo: string; music: string; voice: string; voicePlay: string };
}) {
  function load(key: "coverImage" | "musicUrl", file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ [key]: String(reader.result ?? "") });
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      <label className="flex cursor-pointer items-center gap-2 bg-forest px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-cream">
        <ImagePlus size={15} />
        {labels.photo}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => load("coverImage", e.target.files?.[0])}
        />
      </label>
      {format === "videoMusic" || format === "videoVoice" || format === "site3d" ? (
        <label className="flex cursor-pointer items-center gap-2 border border-ink/15 px-4 py-2 text-[11px] uppercase tracking-[0.12em]">
          <Music size={15} />
          {labels.music}
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => load("musicUrl", e.target.files?.[0])}
          />
        </label>
      ) : null}
      {format === "videoVoice" ? (
        <button
          type="button"
          className="flex items-center gap-2 border border-ink/15 px-4 py-2 text-[11px] uppercase tracking-[0.12em]"
          onClick={() => {
            const next = window.prompt(labels.voice, invitation.voiceText || invitation.message);
            if (next !== null) onChange({ voiceText: next });
          }}
        >
          <Mic size={15} />
          {labels.voice}
        </button>
      ) : null}
      {format === "videoVoice" ? (
        <button
          type="button"
          className="flex items-center gap-2 border border-ink/15 px-4 py-2 text-[11px] uppercase tracking-[0.12em]"
          onClick={() => speak(invitation.voiceText || invitation.message)}
        >
          {labels.voicePlay}
        </button>
      ) : null}
    </div>
  );
}
