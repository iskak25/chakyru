"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Heart, Music } from "lucide-react";
import { addWish, likeWish } from "@/lib/store";
import type { Invitation, RsvpStatus } from "@/lib/types";
import { ExtraLayer, paint } from "./ExtraLayer";
import type { InvitePatch } from "./CanvasEdit";
import { MoveCanvas, Selectable } from "./MoveCanvas";
import { InviteAudio } from "./InviteAudio";
import { MusicPickModal } from "./MusicPicker";
import { effectiveMusicUrl, youtubeId } from "@/lib/music";
import { resolveInviteFamily } from "@/lib/inviteFamilies";
import { getTemplatePhotos } from "@/lib/templatePhotos";
import { getSiteLook } from "@/lib/siteLooks";
import type { LayoutKit, Site3DLabels } from "./Site3DLayouts";
import { Site3DInner, Site3DThumb } from "./Site3DResolve";

export type { Site3DLabels };

const SAMPLE_PLACE = "Ала-Тоо, Бишкек";
const PAGE = "#ffffff";

function paperCopy(overlay: string) {
  const match = overlay.match(/#([0-9a-f]{3,8})/i);
  if (!match) return "#F5F5F5";
  let hex = match[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  hex = hex.slice(0, 6);
  const n = Number.parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#8a7040" : "#F5F5F5";
}

function venueSearch(invitation: Invitation) {
  const q = [invitation.venue, invitation.address, invitation.city]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(", ");
  return q || SAMPLE_PLACE;
}

function gisUrl(q: string) {
  return `https://2gis.kg/search/${encodeURIComponent(q)}`;
}

function mapLink(invitation: Invitation) {
  const url = (invitation.mapUrl ?? "").trim();
  if (/^https?:\/\//i.test(url)) return url;
  return gisUrl(venueSearch(invitation));
}

function splitNames(names: string) {
  const parts = names
    .split(/\s*[&+/]| менен | жана | и /i)
    .map((s) => s.trim())
    .filter(Boolean);
  const a = parts[0] || "Манас";
  const b = parts[1] || "Каныкей";
  return { a, b };
}

function useCountdown(date: string, time: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    if (!date || now === null) return null;
    const target = new Date(`${date}T${time || "18:00"}:00`).getTime();
    const diff = target - now;
    if (diff <= 0) return { done: true as const, d: 0, h: 0, m: 0, s: 0 };
    return {
      done: false as const,
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [date, time, now]);
}


const WAX_SCALLOP = (() => {
  const n = 20;
  const outer = 48;
  const inner = 44.4;
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const ang = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(`${(50 + r * Math.cos(ang)).toFixed(2)},${(50 + r * Math.sin(ang)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

function WaxSeal({ label }: { label: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <span className="wax-seal relative flex h-[128px] w-[128px] items-center justify-center">
      <svg className="absolute inset-0 h-full w-full drop-shadow-[0_16px_24px_rgba(0,0,0,0.4)]" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <radialGradient id={uid} cx="34%" cy="28%">
            <stop offset="0%" stopColor="#f3e6d2" />
            <stop offset="38%" stopColor="#c4a57a" />
            <stop offset="72%" stopColor="#a88e6e" />
            <stop offset="100%" stopColor="#6a543c" />
          </radialGradient>
        </defs>
        <path d={WAX_SCALLOP} fill={`url(#${uid})`} />
        <circle cx="50" cy="50" r="29" fill="none" stroke="#3d3226" strokeWidth="0.7" opacity="0.35" />
      </svg>
      <span className="relative z-[1] max-w-[92px] px-1 text-center font-serif text-[14px] font-semibold uppercase leading-tight tracking-[0.18em] text-[#0F0C0A]">
        {label}
      </span>
    </span>
  );
}

function KyrgyzOrnament({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <pattern id="kyrgyz-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="2" fill="currentColor" opacity="0.3" />
          <line x1="15" y1="5" x2="15" y2="25" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          <line x1="5" y1="15" x2="25" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        </pattern>
      </defs>
      <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <g stroke="currentColor" strokeWidth="0.8" fill="none">
        <path d="M 30,60 Q 60,30 90,60 Q 60,90 30,60" opacity="0.25" />
        <path d="M 60,30 L 90,60 L 60,90 L 30,60 Z" opacity="0.2" />
      </g>
    </svg>
  );
}

function PremiumWaxSeal({ label, opening }: { label: string; opening?: boolean }) {
  const uid = useId().replace(/:/g, "");
  return (
    <button
      type="button"
      className={`wax-seal-premium relative inline-flex h-20 w-20 items-center justify-center transition-all duration-300 sm:h-24 sm:w-24 ${
        opening ? "is-opening" : ""
      }`}
      aria-hidden="true"
      disabled
    >
      <svg
        className="absolute inset-0 h-full w-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <defs>
          <radialGradient id={`seal-${uid}`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#f5e6d3" />
            <stop offset="30%" stopColor="#d4a574" />
            <stop offset="65%" stopColor="#b8935d" />
            <stop offset="100%" stopColor="#7a5c3e" />
          </radialGradient>
          <filter id={`seal-glow-${uid}`}>
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main seal circle */}
        <circle cx="50" cy="50" r="45" fill={`url(#seal-${uid})`} filter={`url(#seal-glow-${uid})`} />

        {/* Inner rings */}
        <circle cx="50" cy="50" r="41" fill="none" stroke="#3d2f1f" strokeWidth="0.5" opacity="0.4" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#c9a076" strokeWidth="0.3" opacity="0.3" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#3d2f1f" strokeWidth="0.4" opacity="0.2" />

        {/* Kyrgyz-inspired ornament center */}
        <g stroke="#3d2f1f" strokeWidth="0.6" fill="none" opacity="0.5">
          <circle cx="50" cy="50" r="18" />
          <path d="M 50,32 L 62,50 L 50,68 L 38,50 Z" />
          <circle cx="50" cy="50" r="12" />
          <circle cx="50" cy="50" r="8" />
        </g>

        {/* Wax texture lines */}
        <g stroke="#6a5438" strokeWidth="0.2" opacity="0.15">
          <path d="M 35,40 Q 50,35 65,40" />
          <path d="M 32,50 Q 50,45 68,50" />
          <path d="M 35,60 Q 50,65 65,60" />
        </g>
      </svg>

      <span className="relative z-10 text-center font-serif text-[11px] font-bold uppercase tracking-wide leading-tight text-[#3d2f1f] sm:text-[12px]">
        {label}
      </span>
    </button>
  );
}

function Cover({
  overlay,
  ticket,
  inviteTitle,
  openLabel,
  hint,
  fill,
  onOpen,
  opening,
}: {
  overlay: string;
  ticket: string;
  inviteTitle: string;
  openLabel: string;
  hint: string;
  fill?: boolean;
  onOpen?: () => void;
  opening?: boolean;
}) {
  const copy = paperCopy(overlay);
  return (
    <div
      className={`kyrgyz-envelope-stage relative overflow-hidden ${fill ? "h-full min-h-full" : "min-h-[100svh]"} ${opening ? "is-opening" : ""} ${onOpen ? "cursor-pointer" : ""}`}
      style={{
        ["--paper" as string]: overlay || "#0F0C0A",
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /></filter><rect fill="%23241c16" width="100" height="100" /><rect fill="%23332b21" width="100" height="100" opacity="0.6" filter="url(%23n)" /></svg>')`,
        backgroundColor: "#241c16",
      }}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? openLabel : undefined}
      onClick={onOpen && !opening ? onOpen : undefined}
      onKeyDown={
        onOpen && !opening
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
    >
      {/* Top ornament */}
      <div className="absolute left-1/2 top-8 z-5 -translate-x-1/2 text-[#b79b79] opacity-60 sm:top-12">
        <KyrgyzOrnament className="h-6 w-6 sm:h-8 sm:w-8" />
      </div>

      {/* Envelope body */}
      <div className="kyrgyz-envelope absolute left-1/2 top-1/2 w-[min(88vw,_520px)] -translate-x-1/2 -translate-y-1/2 transform">
        {/* Envelope shell */}
        <div className="kyrgyz-envelope-shell relative aspect-[3/4]">
          {/* Paper background */}
          <div
            className="kyrgyz-envelope-body absolute inset-0 rounded-lg shadow-2xl"
            style={{
              backgroundColor: "#efe5d6",
              backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" /></filter><rect fill="%23efe5d6" width="200" height="200" /><rect width="200" height="200" fill="%23e4d5c1" opacity="0.08" filter="url(%23paper)" /></svg>')`,
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Envelope border */}
            <div className="absolute inset-0 rounded-lg border border-[#d4a574] border-opacity-30" />

            {/* Top flap */}
            <div
              className="kyrgyz-envelope-flap-top absolute left-0 right-0 top-0 h-1/2 origin-top transform-gpu transition-transform duration-1000 ease-out"
              style={{
                backgroundColor: "#f3ebdd",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transform: opening ? "rotateX(180deg) rotateZ(0deg)" : "rotateX(0deg) rotateZ(0deg)",
                transformStyle: "preserve-3d" as any,
                backfaceVisibility: "hidden" as any,
                boxShadow: "inset 0 -1px 3px rgba(0,0,0,0.08)",
              }}
            />

            {/* Bottom flap */}
            <div
              className="kyrgyz-envelope-flap-bottom absolute bottom-0 left-0 right-0 h-1/2 origin-bottom"
              style={{
                backgroundColor: "#e4d5c1",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />
          </div>

          {/* Wax seal - centered */}
          <div className="kyrgyz-envelope-seal absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform-gpu">
            <PremiumWaxSeal label={openLabel} opening={opening} />
          </div>

          {/* Envelope ornament inside */}
          <div className="kyrgyz-envelope-ornament absolute left-1/2 top-1/4 z-5 -translate-x-1/2 text-[#c4a574] opacity-20">
            <KyrgyzOrnament className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Top text */}
      <div className="kyrgyz-envelope-copy absolute left-0 right-0 top-0 z-10 px-6 pt-16 text-center sm:pt-20">
        <div className="text-[#b79b79] opacity-70 mb-2">
          <KyrgyzOrnament className="mx-auto h-4 w-4" />
        </div>
        <p className="font-serif text-[11px] uppercase tracking-[0.3em]" style={{ color: "#b79b79" }}>
          Сүйүү
        </p>
        <p className="font-serif text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: "#b79b79", opacity: 0.8 }}>
          Жаңы бир окуя
        </p>
      </div>

      {/* Bottom text */}
      <p className="kyrgyz-envelope-hint absolute inset-x-0 bottom-0 z-10 px-8 pb-12 text-center font-serif text-[11px] leading-5" style={{ color: "#b79b79", opacity: 0.75 }}>
        {hint}
      </p>
    </div>
  );
}

export function Site3D({
  invitation,
  locale,
  onChange,
  variant = "guest",
  onReload,
  labels,
  onSelect,
  startOpen,
  framed,
}: {
  invitation: Invitation;
  locale: string;
  onChange?: InvitePatch;
  variant?: "guest" | "editor" | "preview";
  onReload?: () => void;
  labels: Site3DLabels;
  onSelect?: (id: string | null) => void;
  startOpen?: boolean;
  framed?: boolean;
}) {
  const { a, b } = splitNames(invitation.names || "Манас & Каныкей");
  const [open, setOpen] = useState(variant === "editor" || !!startOpen);
  const [opening, setOpening] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pickOpen, setPickOpen] = useState(false);
  const [wishName, setWishName] = useState("");
  const [wishText, setWishText] = useState("");
  const [wishOpen, setWishOpen] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvp, setRsvp] = useState<RsvpStatus>("yes");
  const [rsvpDone, setRsvpDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicSrc = effectiveMusicUrl(invitation.musicUrl, invitation.music);
  const count = useCountdown(invitation.date, invitation.time);
  const editing = !!onChange;

  const event = invitation.date
    ? new Date(`${invitation.date}T${invitation.time || "17:00"}:00`)
    : new Date("2012-12-12T17:00:00");

  const mapQuery = venueSearch(invitation);
  const mapHref = mapLink(invitation);
  const wishes = invitation.wishes;
  const activeWish = wishes[slide % Math.max(wishes.length, 1)];
  const fallback = labels.inviteFallback.replace("{a}", a).replace("{b}", b);
  const look = getSiteLook(invitation.templateId);
  const wine = paint(invitation, "invite", look.accent);
  const overlay = look.overlay;
  const cover = invitation.coverImage;
  const gallery = invitation.gallery ?? {};
  const pack = getTemplatePhotos(invitation.templateId);
  const photos = [
    gallery.c0 || cover || pack.c0,
    gallery.c1 || pack.c1,
    gallery.c2 || pack.c2,
  ];
  const heroPhoto = gallery.hero || cover || pack.hero;
  const venuePhoto = gallery.venue || pack.venue;

  useEffect(() => {
    if (wishes.length < 2) return;
    const id = setInterval(() => setSlide((s) => s + 1), 3500);
    return () => clearInterval(id);
  }, [wishes.length]);

  function playMusic() {
    const el = audioRef.current;
    if (el && musicSrc && !youtubeId(musicSrc)) void el.play().catch(() => {});
  }

  function toggleMusic() {
    if (onChange) {
      setPickOpen(true);
      return;
    }
    if (!musicSrc) return;
    setPlaying((was) => {
      const next = !was;
      if (!youtubeId(musicSrc)) {
        const el = audioRef.current;
        if (el) {
          if (next) void el.play().catch(() => {});
          else el.pause();
        }
      }
      return next;
    });
  }

  function openInvite() {
    if (opening || open) return;
    setOpening(true);
    setPlaying(true);
    playMusic();
  }

  useEffect(() => {
    if (!opening) return;
    const id = window.setTimeout(() => {
      setOpen(true);
      setOpening(false);
    }, 920);
    return () => window.clearTimeout(id);
  }, [opening]);

  useEffect(() => {
    setOpen(variant === "editor" || !!startOpen);
    setOpening(false);
  }, [invitation.templateId, variant, startOpen]);

  const coverProps = {
    overlay,
    ticket: labels.ticket,
    inviteTitle: labels.inviteTitle,
    openLabel: labels.open,
    hint: labels.hint,
  };

  if (variant === "preview") {
    return (
      <Site3DThumb look={look} labels={labels} a={a} b={b} photos={photos} heroPhoto={heroPhoto} />
    );
  }

  const kit: LayoutKit = {
    invitation,
    look,
    locale,
    labels,
    onChange,
    onSelect,
    variant,
    editing,
    a,
    b,
    photos,
    heroPhoto,
    venuePhoto,
    fallback,
    event,
    mapHref,
    mapQuery,
    count,
    wishes,
    activeWish,
    slide,
    setSlide,
    setAllOpen,
    rsvp,
    setRsvp,
    rsvpName,
    setRsvpName,
    rsvpDone,
    setRsvpDone,
    onReload,
  };

  const showCover = !open || opening;
  const closedBox = framed
    ? "h-full min-h-full overflow-hidden"
    : "h-[100svh] min-h-[100svh] overflow-hidden";
  const openBox = framed ? "min-h-full overflow-x-clip" : "h-auto overflow-visible";

  return (
    <div
      className={`relative mx-auto w-full max-w-[430px] ${open && !opening ? openBox : closedBox}`}
      data-family={resolveInviteFamily(invitation.templateId, look.pageLayout)}
      style={{ color: look.ink }}
    >
      {musicSrc ? (
        <InviteAudio src={musicSrc} audioRef={audioRef} playing={playing} />
      ) : null}

      {showCover ? (
        <div className="absolute inset-0 z-40">
          <Cover {...coverProps} fill onOpen={openInvite} opening={opening} />
        </div>
      ) : null}

      <div
        className={`${open && !opening ? "block" : "invisible h-0 overflow-hidden"} relative`}
        onPointerDown={() => {
          if (variant !== "guest" || playing || !musicSrc) return;
          setPlaying(true);
          playMusic();
        }}
      >
        <MoveCanvas
          editable={!!onChange}
          layout={invitation.layout ?? {}}
          onLayout={onChange ? (layout) => onChange({ layout }) : undefined}
          onSelect={onSelect}
          onChange={onChange}
          invitation={invitation}
          height="auto"
          background={look.pageBg || PAGE}
          className="site3d-page"
        >
          <Site3DInner kit={kit} />
          <div className="site3d-sticky sticky bottom-3 z-30 flex justify-between gap-3 px-3 pb-2">
            <Selectable id="musicBtn">
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                if (onChange) {
                  e.preventDefault();
                  setPickOpen(true);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onChange) {
                  setPickOpen(true);
                  return;
                }
                toggleMusic();
              }}
              className="flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 text-[15px] text-white shadow-lg sm:min-w-[110px] sm:flex-none sm:px-5"
              style={{ background: playing && !onChange ? "#111" : wine }}
            >
              <Music size={16} />
              {labels.music}
            </button>
            </Selectable>
            <Selectable id="wishBtn">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (variant === "guest") setWishOpen(true);
                else onSelect?.("wishes");
              }}
              className="flex min-h-[48px] min-w-0 flex-1 items-center justify-center rounded-full bg-black px-3 text-[15px] text-white shadow-lg sm:min-w-[110px] sm:flex-none sm:px-5"
            >
              {labels.writeWish}
            </button>
            </Selectable>
          </div>

          <ExtraLayer invitation={invitation} onChange={onChange} locale={locale} />
        </MoveCanvas>
      </div>

      {wishOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <form
            className="w-full max-w-[400px] rounded-3xl bg-white p-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!wishName.trim() || !wishText.trim()) return;
              addWish(invitation.id, wishName.trim(), wishText.trim());
              setWishText("");
              setWishOpen(false);
              onReload?.();
            }}
          >
            <p className="font-ceremonial text-3xl">{labels.writeWish}</p>
            <input
              required
              value={wishName}
              onChange={(e) => setWishName(e.target.value)}
              placeholder={labels.yourName}
              className="mt-4 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
            />
            <textarea
              required
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
            />
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setWishOpen(false)} className="flex-1 rounded-full border py-2.5 text-sm">
                ✕
              </button>
              <button type="submit" className="flex-1 rounded-full bg-black py-2.5 text-sm text-white">
                {locale === "ru" ? "Отправить" : "Жөнөтүү"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {onChange ? (
        <MusicPickModal
          open={pickOpen}
          locale={locale}
          value={invitation.musicUrl}
          onClose={() => setPickOpen(false)}
          onChange={(musicUrl) => {
            onChange({ musicUrl, music: Boolean(musicUrl) });
            if (musicUrl) {
              setPlaying(true);
              setPickOpen(false);
            }
          }}
        />
      ) : null}

      {allOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-5">
          <button type="button" onClick={() => setAllOpen(false)} className="mb-4 text-sm">
            ←
          </button>
          <p className="font-ceremonial text-3xl">{labels.wishes}</p>
          <ul className="mt-5 space-y-3">
            {wishes.map((w) => (
              <li key={w.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <p className="text-sm leading-6">{w.text}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-medium">{w.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      likeWish(invitation.id, w.id);
                      onReload?.();
                    }}
                    className="text-xs"
                  >
                    <Heart size={12} className="mr-1 inline" /> {w.likes}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
