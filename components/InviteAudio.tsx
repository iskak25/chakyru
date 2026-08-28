"use client";

import { useEffect, useRef, type RefObject } from "react";
import { youtubeId } from "@/lib/music";

export function InviteAudio({
  src,
  audioRef,
  playing = true,
}: {
  src: string;
  audioRef?: RefObject<HTMLAudioElement | null>;
  playing?: boolean;
}) {
  const yt = youtubeId(src);
  const inner = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (yt) return;
    const el = audioRef?.current ?? inner.current;
    if (!el) return;
    el.loop = true;
    if (playing) void el.play().catch(() => {});
    else el.pause();
  }, [playing, src, yt, audioRef]);

  if (yt) {
    if (!playing) return null;
    return (
      <iframe
        title="music"
        className="pointer-events-none absolute h-px w-px opacity-0"
        src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&loop=1&playlist=${yt}&controls=0`}
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
      loop
      playsInline
      preload="auto"
    />
  );
}
