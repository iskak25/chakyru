"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Music, Pause, Play } from "lucide-react";
import { effectiveMusicUrl } from "@/lib/music";
import { getTemplate } from "@/lib/templates";
import { stopSpeech, speakInvite, voiceScript } from "@/lib/voice";
import type { Invitation, InviteFormat } from "@/lib/types";
import { CanvasDateTime, CanvasText, PhotoLayer, type InvitePatch } from "./CanvasEdit";
import { ExtraLayer } from "./ExtraLayer";
import { InviteAudio } from "./InviteAudio";
import { FreeMove, MoveCanvas } from "./MoveCanvas";

const FALLBACKS = ["/images/hero-toi.jpg", "/images/collage-1.jpg", "/images/collage-2.jpg"];
const SCENE_MS = 3400;

function splitNames(names: string) {
  const parts = names
    .split(/\s*[&+/]| менен | жана | и /i)
    .map((s) => s.trim())
    .filter(Boolean);
  return { a: parts[0] || "Манас", b: parts[1] || "Каныкей" };
}

function prettyDate(date: string, locale: string) {
  if (!date) return "";
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString(locale === "ru" ? "ru-RU" : "ky-KG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function slidesOf(invitation: Invitation) {
  const raw = [
    invitation.coverImage,
    invitation.gallery?.hero,
    invitation.gallery?.c0,
    invitation.gallery?.c1,
    invitation.gallery?.c2,
    ...FALLBACKS,
  ].filter(Boolean) as string[];
  return raw.filter((src, i, all) => all.indexOf(src) === i).slice(0, 4);
}

const PETALS = [
  { left: "8%", delay: "0s", dur: "7s" },
  { left: "22%", delay: "1.4s", dur: "8.2s" },
  { left: "38%", delay: "0.6s", dur: "6.6s" },
  { left: "54%", delay: "2.1s", dur: "7.8s" },
  { left: "70%", delay: "0.9s", dur: "9s" },
  { left: "86%", delay: "1.8s", dur: "7.2s" },
];

const SPARKS = [
  { left: "12%", top: "18%", delay: "0s" },
  { left: "78%", top: "22%", delay: "0.7s" },
  { left: "18%", top: "62%", delay: "1.2s" },
  { left: "84%", top: "70%", delay: "0.4s" },
  { left: "48%", top: "12%", delay: "1.6s" },
];

export function VideoInvite({
  invitation,
  locale,
  format,
  compact,
  interactive,
  onChange,
  onSelect,
  onMusicClick,
}: {
  invitation: Invitation;
  locale: string;
  format: InviteFormat;
  compact?: boolean;
  interactive?: boolean;
  onChange?: InvitePatch;
  onSelect?: (id: string | null) => void;
  onMusicClick?: () => void;
}) {
  const template = getTemplate(invitation.templateId);
  const musicRef = useRef<HTMLAudioElement>(null);
  const voiceRef = useRef<HTMLAudioElement>(null);
  const musicSrc = effectiveMusicUrl(invitation.musicUrl, invitation.music);
  const voiceSrc = invitation.voiceUrl?.trim() || "";
  const script = voiceScript(invitation, locale);
  const live = Boolean(interactive || onChange);
  const preview = compact && !interactive && !onChange;
  const withVoice = format === "videoVoice";
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(0);
  const [scene, setScene] = useState(0);
  const slides = useMemo(() => slidesOf(invitation), [invitation]);
  const photo = slides[scene % slides.length] || FALLBACKS[0];
  const names = invitation.names || "Манас & Каныкей";
  const { a, b } = splitNames(names);
  const kicker = locale === "ru" ? "Приглашение на той" : "Тойго чакыруу";
  const text =
    invitation.message ||
    (locale === "ru"
      ? "Приглашаем разделить с нами радость этого дня"
      : "Бул кубанычты биз менен бөлүшүүгө чакырабыз");
  const day = prettyDate(invitation.date, locale);
  const moving = playing || preview;

  const timer = useRef<number>(0);

  function duck(on: boolean) {
    const el = musicRef.current;
    if (el) el.volume = on ? 0.22 : 0.85;
  }

  function startVoice() {
    if (!withVoice) return;
    if (voiceSrc && voiceRef.current) {
      duck(true);
      voiceRef.current.currentTime = 0;
      void voiceRef.current.play().catch(() => duck(false));
      return;
    }
    speakInvite(script, () => duck(true), () => duck(false));
  }

  function stopAll() {
    window.clearTimeout(timer.current);
    setPlaying(false);
    stopSpeech();
    duck(false);
    musicRef.current?.pause();
    if (voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current.currentTime = 0;
    }
  }

  function playAll() {
    setPlaying(true);
    setRun((n) => n + 1);
    setScene(0);
    const music = musicRef.current;
    if (music && musicSrc) {
      music.volume = 0.85;
      void music.play().catch(() => {});
    }
    timer.current = window.setTimeout(startVoice, withVoice ? 900 : 0);
  }

  function toggle() {
    if (playing) stopAll();
    else playAll();
  }

  useEffect(() => {
    if (!moving) return;
    const id = window.setInterval(() => setScene((s) => s + 1), SCENE_MS);
    return () => window.clearInterval(id);
  }, [moving, run]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      stopSpeech();
      musicRef.current?.pause();
      voiceRef.current?.pause();
    },
    [],
  );

  const showGate = live && !playing && !onChange;
  const showEditorPlay = live && !!onChange;
  const sceneI = scene % 4;

  return (
    <div className={`relative overflow-hidden bg-[#1a120e] ${compact ? "h-full" : "min-h-[560px]"}`}>
      <div key={`${photo}-${scene}`} className="absolute inset-0 overflow-hidden">
        <div
          className="kenburns absolute inset-[-10%] bg-cover bg-center"
          style={{ backgroundImage: `url(${photo})`, backgroundColor: template.style.text }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/45" />
      <img src="/stickers/frame-peony-wreath.png" alt="" className="el-float pointer-events-none absolute -left-10 -top-6 h-40 w-40 opacity-90" />
      <img src="/stickers/flora-rose.png" alt="" className="el-sway pointer-events-none absolute -right-4 top-16 h-20 w-20 opacity-90" />
      <img src="/stickers/frame-wreath-leaves.png" alt="" className="el-spin pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 opacity-70" />
      {PETALS.map((p, i) => (
        <span key={i} className="reel-petal" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }} />
      ))}
      {SPARKS.map((s, i) => (
        <span key={i} className="reel-spark" style={{ left: s.left, top: s.top, animationDelay: s.delay }} />
      ))}
      <PhotoLayer onChange={onChange} />
      <MoveCanvas
        editable={!!onChange}
        layout={invitation.layout ?? {}}
        onLayout={onChange ? (layout) => onChange({ layout }) : undefined}
        onSelect={onSelect}
        onChange={onChange}
        invitation={invitation}
      >
        <FreeMove id="badge" defaults={{ x: 18, y: 8, w: 64, h: 7, z: 6 }}>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (onChange) onMusicClick?.();
              else toggle();
            }}
            className="relative z-[1] flex h-full w-full items-center justify-center gap-1 rounded-full border border-white/25 bg-black/25 text-[10px] uppercase tracking-[0.22em] text-[#f3e6c8]"
          >
            {withVoice ? <Mic size={12} /> : <Music size={12} />}
            {kicker}
          </button>
        </FreeMove>
        <FreeMove id="names" defaults={{ x: 8, y: 42, w: 84, h: 22, z: 5 }}>
          <div
            className={`flex h-full flex-col items-center justify-center text-center ${moving && sceneI === 1 ? "reel-in" : ""}`}
            style={{ opacity: !moving || sceneI === 0 || sceneI === 1 ? 1 : 0.35 }}
          >
            {onChange ? (
              <CanvasText
                value={invitation.names}
                placeholder={names}
                onChange={(v) => onChange({ names: v })}
                className="font-serif text-4xl italic leading-none text-[#f7efe3]"
              />
            ) : (
              <>
                <p className="font-serif text-4xl italic leading-none text-[#f7efe3]">{a}</p>
                <span className="my-1 text-[11px] tracking-[0.4em] text-[#d4b06a]">&</span>
                <p className="font-serif text-4xl italic leading-none text-[#f7efe3]">{b}</p>
              </>
            )}
          </div>
        </FreeMove>
        <FreeMove id="message" defaults={{ x: 10, y: 66, w: 80, h: 12, z: 5 }}>
          <div
            className={`flex h-full items-center justify-center ${moving && sceneI === 3 ? "reel-in" : ""}`}
            style={{ opacity: !moving || sceneI === 3 ? 1 : 0.4 }}
          >
            <CanvasText
              multiline
              value={invitation.message}
              placeholder={text}
              onChange={onChange ? (v) => onChange({ message: v }) : undefined}
              className="max-w-xs text-sm leading-6 text-white/88"
            />
          </div>
        </FreeMove>
        <FreeMove id="date" defaults={{ x: 14, y: 80, w: 72, h: 12, z: 5 }}>
          <div
            className={`flex h-full flex-col items-center justify-center ${moving && sceneI === 2 ? "reel-in" : ""}`}
            style={{ opacity: !moving || sceneI === 2 ? 1 : 0.4 }}
          >
            {onChange ? (
              <CanvasDateTime date={invitation.date} time={invitation.time} onChange={onChange} className="text-[#f3e6c8]" />
            ) : (
              <>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4b06a]">{day || invitation.date}</p>
                <p className="mt-1 font-serif text-2xl text-white">{invitation.time}</p>
                <p className="mt-1 text-xs tracking-wide text-white/75">{invitation.venue}</p>
              </>
            )}
          </div>
        </FreeMove>
        <ExtraLayer invitation={invitation} onChange={onChange} locale={locale} />
      </MoveCanvas>

      {showGate ? (
        <button type="button" onClick={toggle} className="absolute inset-0 z-30 flex items-center justify-center bg-black/20" aria-label="Play">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/92 text-[#161616] shadow-lg">
            <Play size={22} fill="currentColor" className="ml-0.5" />
          </span>
        </button>
      ) : null}

      {showEditorPlay ? (
        <button
          type="button"
          data-export-hide
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="absolute bottom-3 right-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-[#161616] shadow"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
      ) : null}

      {live && playing && !onChange ? (
        <button type="button" onClick={toggle} className="absolute bottom-3 right-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-[#161616] shadow">
          <Pause size={16} fill="currentColor" />
        </button>
      ) : null}

      {live && musicSrc ? <InviteAudio src={musicSrc} audioRef={musicRef} playing={playing} /> : null}
      {live && withVoice && voiceSrc ? (
        <audio ref={voiceRef} src={voiceSrc} onEnded={() => duck(false)} className="hidden" />
      ) : null}
    </div>
  );
}
