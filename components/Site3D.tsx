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
        background: "radial-gradient(circle at 18% 18%, rgba(201, 181, 153, .34), transparent 25%), radial-gradient(circle at 82% 18%, rgba(186, 159, 127, .18), transparent 28%), linear-gradient(180deg, #5c5147 0%, #383128 35%, #29251f 66%, #4a4034 100%)",
        color: "#eee6da",
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
      {/* Soft lighting overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 22% 13%, rgba(244, 222, 190, .22), transparent 16%), radial-gradient(ellipse at 75% 7%, rgba(236, 210, 176, .16), transparent 18%), radial-gradient(ellipse at 10% 48%, rgba(0,0,0,.38), transparent 27%), radial-gradient(ellipse at 92% 48%, rgba(0,0,0,.34), transparent 28%)",
        filter: "blur(10px)",
      }} />

      {/* Shadow leaves */}
      <div className="absolute top-2 left-0 w-[45px] h-[140px] bg-[#090806] rounded-full opacity-[0.22] blur-[7px]" style={{ transform: "rotate(-37deg)" }} />
      <div className="absolute top-4 right-0 w-[50px] h-[145px] bg-[#090806] rounded-full opacity-[0.22] blur-[7px]" style={{ transform: "rotate(31deg)" }} />
      <div className="absolute bottom-0 right-0 w-[50px] h-[170px] bg-[#090806] rounded-full opacity-[0.22] blur-[7px]" style={{ transform: "rotate(40deg)" }} />

      {/* Top text */}
      <header className="absolute z-10 top-[8.5%] left-1/2 w-full -translate-x-1/2 text-center">
        <div className="w-[27px] h-[27px] mx-auto mb-4 opacity-95">
          <KyrgyzOrnament />
        </div>
        <h1 className="m-0 text-[#f3eadf] text-[clamp(12px,3.4vw,17px)] font-normal leading-[1.42] tracking-[0.19em] uppercase" style={{ textShadow: "0 1px 3px rgba(0,0,0,.4)" }}>
          Сүйүү<br />Жаңы бир окуя
        </h1>
      </header>

      {/* Envelope */}
      <section className="absolute z-5 top-[30.8%] left-1/2 w-[88%] -translate-x-1/2" style={{
        aspectRatio: "1.08 / 1",
        filter: "drop-shadow(0 17px 13px rgba(0,0,0,.33)) drop-shadow(0 4px 4px rgba(0,0,0,.22))",
      }}>
        <div className="absolute inset-0">
          {/* Envelope back */}
          <div className="absolute inset-0 border border-[rgba(152,123,84,.24)]" style={{
            backgroundColor: "#efe5d5",
            backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.8) 0 1px, transparent 1.2px), radial-gradient(circle at 80% 60%, rgba(132,99,57,.10) 0 1px, transparent 1.2px), repeating-linear-gradient(30deg, rgba(127,91,49,.025) 0 1px, transparent 1px 8px)",
            backgroundSize: "12px 12px, 17px 17px, 100% 100%",
          }}>
            <div className="absolute top-[18%] left-[-10%] w-[120%] text-[rgba(160,128,85,.12)] text-[60px] leading-none tracking-[-18px] opacity-75" style={{ transform: "rotate(-8deg)" }}>
              ❧   ❧   ❧   ❧   ❧
            </div>
          </div>

          {/* Flap left */}
          <div className="absolute left-0 bottom-0 z-3" style={{
            width: "51%",
            height: "78%",
            clipPath: "polygon(0 0, 100% 51%, 100% 100%, 0 100%)",
            background: "linear-gradient(135deg, #f4eadb, #e8ddcb)",
            backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.8) 0 1px, transparent 1.2px), radial-gradient(circle at 80% 60%, rgba(132,99,57,.10) 0 1px, transparent 1.2px), repeating-linear-gradient(30deg, rgba(127,91,49,.025) 0 1px, transparent 1px 8px)",
            backgroundSize: "12px 12px, 17px 17px, 100% 100%",
          }}>
            <div className="absolute inset-0" style={{
              background: "repeating-radial-gradient(ellipse at 30% 60%, transparent 0 15px, rgba(152,117,73,.07) 16px 17px)",
            }} />
          </div>

          {/* Flap right */}
          <div className="absolute right-0 bottom-0 z-3" style={{
            width: "51%",
            height: "78%",
            clipPath: "polygon(0 51%, 100% 0, 100% 100%, 0 100%)",
            background: "linear-gradient(225deg, #f4eadb, #e8ddcb)",
            backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.8) 0 1px, transparent 1.2px), radial-gradient(circle at 80% 60%, rgba(132,99,57,.10) 0 1px, transparent 1.2px), repeating-linear-gradient(30deg, rgba(127,91,49,.025) 0 1px, transparent 1px 8px)",
            backgroundSize: "12px 12px, 17px 17px, 100% 100%",
          }}>
            <div className="absolute inset-0" style={{
              background: "repeating-radial-gradient(ellipse at 80% 65%, transparent 0 15px, rgba(152,117,73,.07) 16px 17px)",
            }} />
          </div>

          {/* Flap bottom */}
          <div className="absolute left-0 bottom-0 z-4 w-full" style={{
            height: "53%",
            clipPath: "polygon(0 100%, 50% 12%, 100% 100%)",
            background: "linear-gradient(180deg, #eee3d2, #e1d4c0)",
            backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.8) 0 1px, transparent 1.2px), radial-gradient(circle at 80% 60%, rgba(132,99,57,.10) 0 1px, transparent 1.2px), repeating-linear-gradient(30deg, rgba(127,91,49,.025) 0 1px, transparent 1px 8px)",
            backgroundSize: "12px 12px, 17px 17px, 100% 100%",
          }} />

          {/* Flap top */}
          <div className="kyrgyz-envelope-flap-top absolute top-0 left-0 z-5 w-full transform-gpu" style={{
            height: "50%",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            background: "linear-gradient(180deg, #f7eee0, #e7dac5)",
            backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.8) 0 1px, transparent 1.2px), radial-gradient(circle at 80% 60%, rgba(132,99,57,.10) 0 1px, transparent 1.2px), repeating-linear-gradient(30deg, rgba(127,91,49,.025) 0 1px, transparent 1px 8px)",
            backgroundSize: "12px 12px, 17px 17px, 100% 100%",
            filter: "drop-shadow(0 2px 1px rgba(78,53,28,.22))",
            transformOrigin: "top",
            transformStyle: "preserve-3d" as any,
          }}>
            {/* Gold line */}
            <div className="absolute inset-0" style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "linear-gradient(135deg, transparent 49.45%, #ae7734 49.7%, #c59a5f 50.05%, transparent 50.3%), linear-gradient(225deg, transparent 49.45%, #ae7734 49.7%, #c59a5f 50.05%, transparent 50.3%)",
            }} />
          </div>

          {/* Gold lines */}
          <div className="absolute z-6 h-[1.4px] bottom-[4%] left-0" style={{
            width: "64%",
            background: "linear-gradient(90deg, #876026, #c69d63, #9b6a2c)",
            transform: "rotate(-42deg)",
            opacity: 0.9,
          }} />
          <div className="absolute z-6 h-[1.4px] top-1/2 left-1/2" style={{
            width: "64%",
            background: "linear-gradient(90deg, #876026, #c69d63, #9b6a2c)",
            transform: "rotate(42deg)",
            opacity: 0.9,
          }} />
        </div>
      </section>

      {/* Seal */}
      <div className="absolute z-20 left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute w-[62px] h-[62px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(38,20,8,.35)] blur-[5px]" />
        <div className="relative flex items-center justify-center w-[clamp(45px,18vw,63px)] aspect-square rounded-[48%_52%_51%_49%_/_54%_47%_53%_46%] border-2 border-[#b16e2a]" style={{
          background: "radial-gradient(circle at 37% 30%, #a65e20, #794014 42%, #54290c 70%, #381806 100%)",
          boxShadow: "inset 0 0 0 3px #56280d, inset 0 0 0 5px #a66a28, inset 0 -8px 10px rgba(38,14,1,.55), 0 2px 7px rgba(0,0,0,.5)",
        }}>
          <svg className="w-[53%] h-[53%] opacity-90" viewBox="0 0 40 40">
            <path d="M20 7 C18 12 15 14 11 15 C14 18 16 20 16 24 C19 22 21 19 20 15 M20 7 C22 12 25 14 29 15 C26 18 24 20 24 24 C21 22 19 19 20 15 M20 18 C15 21 13 25 12 30 M20 18 C25 21 27 25 28 30 M20 18 L20 33" fill="none" stroke="#d39a4c" strokeWidth="1.8" />
          </svg>
        </div>
      </div>

      {/* Tassel */}
      <div className="absolute z-18 left-1/2 -translate-x-1/2" style={{ top: "calc(48% + 25px)", width: "24px", height: "102px" }}>
        <div className="absolute w-[3px] h-[43px] left-1/2 top-0 -translate-x-1/2 rounded-[4px]" style={{
          background: "linear-gradient(90deg, #81551f, #dfb362, #72451b)",
        }} />
        <div className="absolute left-1/2 top-[35px] w-[10px] h-[13px] -translate-x-1/2 rounded-[45%]" style={{
          background: "linear-gradient(90deg, #704319, #d5a34d, #81531e)",
          transform: "translateX(-50%) rotate(4deg)",
        }} />
        <div className="absolute top-[45px] left-1/2 w-[17px] h-[16px] -translate-x-1/2" style={{
          background: "linear-gradient(90deg, #775022, #c79849, #795021)",
          clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)",
        }} />
        <div className="absolute left-1/2 top-[56px] w-[26px] h-[44px] -translate-x-1/2" style={{
          background: "repeating-linear-gradient(93deg, #80551d 0 1px, #c39443 1px 2px, #e0b866 2px 3px, #744719 3px 4px)",
          clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)",
        }} />
      </div>

      {/* Bottom text */}
      <footer className="absolute z-10 left-1/2 bottom-[9.5%] w-full -translate-x-1/2 text-center">
        <p className="m-0 text-[#eee1d2] text-[clamp(13px,4.1vw,18px)] font-normal leading-[1.45] tracking-[0.055em]" style={{ textShadow: "0 1px 4px rgba(0,0,0,.5)" }}>
          {hint}
        </p>
        <div className="w-[25px] h-[25px] mx-auto mt-3 opacity-95">
          <KyrgyzOrnament />
        </div>
      </footer>

      {/* Fabric */}
      <div className="absolute z-3 bottom-[-25px] left-[-35px] w-[155px] h-[70px] rounded-[50%_30%_0_0]" style={{
        background: "repeating-linear-gradient(35deg, #cab698 0 3px, #dfceb2 3px 6px, #b7a383 6px 8px)",
        filter: "blur(.35px) drop-shadow(0 -3px 6px rgba(0,0,0,.2))",
        transform: "rotate(13deg)",
      }} />
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
