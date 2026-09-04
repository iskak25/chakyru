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
      className={`envelope-stage relative overflow-hidden ${fill ? "h-full min-h-full" : "min-h-[100svh]"} ${opening ? "is-opening" : ""} ${onOpen ? "cursor-pointer" : ""}`}
      style={{ ["--paper" as string]: overlay || "#0F0C0A" }}
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
      <div className="envelope-flap envelope-flap-left" />
      <div className="envelope-flap envelope-flap-right" />
      <div className="envelope-flap envelope-flap-bottom" />
      <div className="envelope-flap envelope-flap-top" />

      <div className="envelope-copy pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-10 text-center">
        <p className="font-script text-[28px] leading-none" style={{ color: copy }}>{ticket}</p>
        <p className="mt-3 font-serif text-[12px] uppercase tracking-[0.22em]" style={{ color: copy, opacity: 0.9 }}>{inviteTitle}</p>
      </div>

      <div className="envelope-seal-wrap pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <WaxSeal label={openLabel} />
      </div>

      <p className="envelope-copy pointer-events-none absolute inset-x-0 bottom-0 z-10 px-8 pb-10 text-center font-serif text-[12px] leading-5" style={{ color: copy, opacity: 0.85 }}>
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
  const photos = [
    gallery.c0 || cover || "/images/collage-1.jpg",
    gallery.c1 || "/images/collage-2.jpg",
    gallery.c2 || "/images/collage-3.jpg",
  ];
  const heroPhoto = gallery.hero || cover || "/images/hero-toi.jpg";
  const venuePhoto = gallery.venue || "/images/venue-table.jpg";

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
  const openBox = framed ? "h-full overflow-y-auto" : "min-h-full";

  return (
    <div
      className={`relative mx-auto w-full max-w-[430px] ${open && !opening ? openBox : closedBox}`}
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
          <div className="sticky bottom-3 z-30 flex justify-between px-3 pb-2">
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
              className="flex h-[48px] min-w-[110px] items-center justify-center gap-2 rounded-full px-5 text-[15px] text-white shadow-lg"
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
              className="flex h-[48px] min-w-[110px] items-center justify-center rounded-full bg-black px-5 text-[15px] text-white shadow-lg"
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
