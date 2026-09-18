"use client";

import { useEffect, useRef, type RefObject } from "react";
import { youtubeId } from "@/lib/music";

export function InviteAudio({
  src,
  audioRef,
  playing = true,
  start,
  end,
}: {
  src: string;
  audioRef?: RefObject<HTMLAudioElement | null>;
  playing?: boolean;
  start?: number;
  end?: number;
}) {
  const yt = youtubeId(src);
  const inner = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (yt) return;
    const el = audioRef?.current ?? inner.current;
    if (!el) return;
    if (playing) void el.play().catch(() => {});
    else el.pause();
  }, [playing, src, yt, audioRef]);

  // With a trimmed end, native `loop` restarts at 0 instead of `start`, so the
  // range is looped manually via timeupdate instead.
  /* eslint-disable react-hooks/immutability -- react-hooks/immutability: setting currentTime on the audio element is the only way to trim playback */
  useEffect(() => {
    if (yt) return;
    const el = audioRef?.current ?? inner.current;
    if (!el) return;
    const seek = () => { if (start) el.currentTime = start; };
    if (el.readyState >= 1) seek();
    else el.addEventListener("loadedmetadata", seek, { once: true });
    function onTime() {
      if (end != null && el!.currentTime >= end) el!.currentTime = start || 0;
    }
    el.addEventListener("timeupdate", onTime);
    return () => {
      el.removeEventListener("loadedmetadata", seek);
      el.removeEventListener("timeupdate", onTime);
    };
  }, [src, start, end, yt, audioRef]);

  if (yt) {
    if (!playing) return null;
    const startParam = start ? `&start=${Math.floor(start)}` : "";
    const endParam = end ? `&end=${Math.floor(end)}` : "";
    return (
      <iframe
        title="music"
        className="pointer-events-none absolute h-px w-px opacity-0"
        src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&loop=1&playlist=${yt}&controls=0${startParam}${endParam}`}
        allow="autoplay; encrypted-media"
      />
    );
  }
  return (
    <audio
      ref={(node) => {
        inner.current = node;
        if (audioRef) audioRef.current = node;
      }}
      src={src}
      loop={end == null}
      playsInline
      preload="auto"
    />
  );
}
