"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, Pause, Volume2, VolumeX } from "lucide-react";
import type { Invitation } from "@/lib/types";
import type { EnvelopeVariant } from "@/lib/envelopes";
import { effectiveMusicUrl, youtubeId } from "@/lib/music";
import { loadYoutubePlayer, type YoutubePlayer } from "@/lib/youtubePlayer";
import { startInvitationScroll } from "@/lib/invitationScroll";
import { EnvelopeIntro } from "./EnvelopeIntro";
import css from "./InvitationExperience.module.css";

export function InvitationExperience({ invitation, locale, intro, variant, embedded = false, children }: {
  invitation: Invitation; locale: string; intro: boolean; variant: EnvelopeVariant; embedded?: boolean; children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const youtubeHost = useRef<HTMLDivElement>(null);
  const youtubePlayer = useRef<YoutubePlayer | null>(null);
  const desired = useRef(false);
  const [opened, setOpened] = useState(!intro);
  const [playing, setPlaying] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const src = effectiveMusicUrl(invitation.musicUrl, invitation.music, invitation.eventType);
  const yt = youtubeId(src);
  const trimStart = invitation.musicStart || 0;
  const trimEnd = invitation.musicEnd;
  const ru = locale === "ru";

  const play = useCallback(() => {
    if (!src) return;
    desired.current = true;
    setAudioError(false);
    if (yt) { youtubePlayer.current?.playVideo(); return; }
    // Called synchronously by the envelope click, while user activation is available.
    const attempt = audio.current?.play();
    void attempt?.catch(error => {
      desired.current = false;
      setPlaying(false);
      if (error?.name !== "NotAllowedError" && error?.name !== "AbortError") setAudioError(true);
    });
  }, [src, yt]);
  const pause = useCallback(() => {
    desired.current = false;
    audio.current?.pause();
    youtubePlayer.current?.pauseVideo();
    setPlaying(false);
  }, []);
  const reveal = useCallback(() => {
    setOpened(true);
    setScrolling(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (intro) return;
    // Without an envelope the browser may require the visible music button.
    play(); reveal();
    return pause;
  }, [intro, play, pause, reveal]);

  useEffect(() => {
    if (!yt || !youtubeHost.current) return;
    let disposed = false;
    let player: YoutubePlayer | null = null;
    youtubePlayer.current = null;
    const host = youtubeHost.current;
    const mount = document.createElement("div");
    host.appendChild(mount);
    void loadYoutubePlayer().then(api => {
      if (disposed) return;
      player = new api.Player(mount, {
        videoId: yt, host: "https://www.youtube-nocookie.com", width: 240, height: 200,
        playerVars: trimEnd != null
          ? { autoplay: 0, playsinline: 1, controls: 1, origin: window.location.origin, start: Math.floor(trimStart), end: Math.floor(trimEnd) }
          : { autoplay: 0, playsinline: 1, controls: 1, loop: 1, playlist: yt, origin: window.location.origin },
        events: {
          onReady: event => {
            if (disposed) return;
            youtubePlayer.current = event.target;
            if (desired.current) event.target.playVideo();
          },
          onStateChange: event => {
            if (disposed) return;
            setPlaying(event.data === 1);
            // With a trimmed end, YouTube "ends" the video there instead of looping it.
            if (trimEnd != null && event.data === 0) { youtubePlayer.current?.seekTo(trimStart, true); youtubePlayer.current?.playVideo(); }
          },
          onError: () => { if (!disposed) { setPlaying(false); setAudioError(true); } },
          onAutoplayBlocked: () => { if (!disposed) { desired.current = false; setPlaying(false); } },
        },
      });
    }).catch(() => { if (!disposed) setAudioError(true); });
    return () => { disposed = true; youtubePlayer.current = null; player?.destroy(); host.replaceChildren(); };
  }, [yt, trimStart, trimEnd]);

  // With a trimmed end, native `loop` restarts at 0 instead of `trimStart`, so the
  // range is looped manually via timeupdate instead.
  useEffect(() => {
    if (yt) return;
    const el = audio.current;
    if (!el) return;
    const seek = () => { if (trimStart) el.currentTime = trimStart; };
    if (el.readyState >= 1) seek();
    else el.addEventListener("loadedmetadata", seek, { once: true });
    function onTime() {
      if (trimEnd != null && el!.currentTime >= trimEnd) el!.currentTime = trimStart;
    }
    el.addEventListener("timeupdate", onTime);
    return () => {
      el.removeEventListener("loadedmetadata", seek);
      el.removeEventListener("timeupdate", onTime);
    };
  }, [src, trimStart, trimEnd, yt]);

  useEffect(() => {
    if (!opened || !scrolling || !root.current) return;
    const element = root.current;
    let scroller: HTMLElement | null = embedded ? element : element.parentElement;
    if (!embedded) while (scroller && !(scroller.scrollHeight > scroller.clientHeight && /auto|scroll/.test(getComputedStyle(scroller).overflowY))) scroller = scroller.parentElement;
    const target = scroller;
    const stop = () => setScrolling(false);
    const key = (event: KeyboardEvent) => { if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Tab"].includes(event.key)) stop(); };
    const interaction = (event: Event) => {
      if (event.target instanceof Element && event.target.closest("[data-invitation-controls]")) return;
      stop();
    };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const changedMotion = () => { if (motion.matches) stop(); };
    const surface = target || window;
    surface.addEventListener("wheel", stop, { passive: true });
    element.addEventListener("pointerdown", interaction, { passive: true });
    element.addEventListener("touchstart", interaction, { passive: true });
    element.addEventListener("focusin", interaction);
    window.addEventListener("keydown", key);
    motion.addEventListener("change", changedMotion);
    let cancel = () => {};
    const delay = setTimeout(() => {
      cancel = startInvitationScroll({
        position: () => target ? target.scrollTop : window.scrollY,
        limit: () => target ? target.scrollHeight - target.clientHeight : Math.min(document.documentElement.scrollHeight, element.getBoundingClientRect().bottom + window.scrollY) - window.innerHeight,
        move: top => target ? target.scrollTo({ top, behavior: "instant" }) : window.scrollTo({ top, behavior: "instant" }),
        paused: () => document.hidden,
        frame: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id), done: stop,
      });
    }, 1800);
    return () => {
      clearTimeout(delay); cancel();
      surface.removeEventListener("wheel", stop);
      element.removeEventListener("pointerdown", interaction); element.removeEventListener("touchstart", interaction); element.removeEventListener("focusin", interaction);
      window.removeEventListener("keydown", key); motion.removeEventListener("change", changedMotion);
    };
  }, [opened, scrolling, embedded]);

  return <div ref={root} className={`${css.root} ${embedded ? css.embedded : ""}`} data-invitation-experience>
    {src && !yt && <audio ref={audio} src={src} loop={trimEnd == null} playsInline preload="auto" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setAudioError(true); }} />}
    {yt && <div ref={youtubeHost} className={css.youtube} style={{ visibility: opened ? "visible" : "hidden" }} data-export-hide />}
    {intro ? <EnvelopeIntro variant={variant} names={invitation.names} date={invitation.date} locale={locale} embedded={embedded} onOpen={play} onOpened={reveal}>{children}</EnvelopeIntro> : children}
    {opened && <div className={css.controls} data-invitation-controls data-export-hide>
      {audioError && <span role="status" className={css.error}>{ru ? "Музыка недоступна" : "Музыка жеткиликсиз"}</span>}
      {src && <button type="button" onClick={playing ? pause : play} aria-pressed={playing} aria-label={playing ? (ru ? "Выключить музыку" : "Музыканы өчүрүү") : (ru ? "Включить музыку" : "Музыканы күйгүзүү")} title={playing ? (ru ? "Выключить музыку" : "Музыканы өчүрүү") : (ru ? "Включить музыку" : "Музыканы күйгүзүү")}>
        {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>}
      <button type="button" onClick={() => setScrolling(value => !value)} aria-pressed={scrolling} aria-label={scrolling ? (ru ? "Остановить прокрутку" : "Жылдырууну токтотуу") : (ru ? "Продолжить прокрутку" : "Жылдырууну улантуу")} title={scrolling ? (ru ? "Остановить прокрутку" : "Жылдырууну токтотуу") : (ru ? "Продолжить прокрутку" : "Жылдырууну улантуу")}>
        {scrolling ? <Pause size={18} /> : <ArrowDown size={18} />}
      </button>
    </div>}
  </div>;
}
