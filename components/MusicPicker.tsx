"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Check, Cloud, Pause, Play, Search, Smartphone, Trash2, X } from "lucide-react";
import { formatDuration, loadAudioDuration, musicLabel, ONLINE_TRACKS, searchOnlineMusic, youtubeId, type SearchTrack } from "@/lib/music";
import { uploadInvitationAudio } from "@/lib/uploadAudio";
import { loadYoutubePlayer, type YoutubePlayer } from "@/lib/youtubePlayer";
import type { EventType } from "@/lib/types";

function isLink(q: string) {
  return /^https?:\/\//i.test(q.trim());
}

function hashSeed(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function barHeight(i: number, seed: number) {
  const x = Math.sin(i * 12.9898 + seed * 0.001) * 43758.5453;
  return 18 + (x - Math.floor(x)) * 72;
}

function TrimBar({
  duration,
  start,
  end,
  onDrag,
  seed,
  playhead,
}: {
  duration: number;
  start: number;
  end: number;
  onDrag: (start: number, end: number) => void;
  seed: number;
  playhead: number | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: "start" | "end" | "window"; startX: number; startRange: [number, number] } | null>(null);

  function beginDrag(mode: "start" | "end" | "window", e: ReactPointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, startX: e.clientX, startRange: [start, end] };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el) return;
    const rect = el.getBoundingClientRect();
    const dt = ((e.clientX - d.startX) / rect.width) * duration;
    const minGap = Math.min(3, duration);
    if (d.mode === "start") {
      onDrag(Math.max(0, Math.min(d.startRange[0] + dt, end - minGap)), end);
    } else if (d.mode === "end") {
      onDrag(start, Math.min(duration, Math.max(d.startRange[1] + dt, start + minGap)));
    } else {
      const span = d.startRange[1] - d.startRange[0];
      const next = Math.max(0, Math.min(duration - span, d.startRange[0] + dt));
      onDrag(next, next + span);
    }
  }

  function endDrag() {
    drag.current = null;
  }

  const bars = useMemo(() => Array.from({ length: 56 }), []);

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="relative h-16 touch-none select-none rounded-lg bg-black/5"
    >
      <div className="absolute inset-0 flex items-center gap-0.5 px-1.5">
        {bars.map((_, i) => {
          const t = (i / bars.length) * duration;
          const inRange = t >= start && t <= end;
          return (
            <span
              key={i}
              className={`w-full rounded-full ${inRange ? "bg-forest" : "bg-ink/15"}`}
              style={{ height: `${barHeight(i, seed)}%` }}
            />
          );
        })}
      </div>
      <div
        className="absolute inset-y-0 border-y-2 border-forest/60 bg-forest/10"
        style={{ left: `${(start / duration) * 100}%`, right: `${100 - (end / duration) * 100}%` }}
        onPointerDown={(e) => beginDrag("window", e)}
      />
      {playhead != null && playhead >= start && playhead <= end ? (
        <div className="pointer-events-none absolute inset-y-1 w-0.5 rounded bg-gold" style={{ left: `${(playhead / duration) * 100}%` }} />
      ) : null}
      <div
        className="absolute -inset-y-2 z-10 -ml-4 flex w-8 cursor-ew-resize touch-none items-center justify-center rounded-full bg-forest"
        style={{ left: `${(start / duration) * 100}%` }}
        onPointerDown={(e) => beginDrag("start", e)}
      >
        <span className="h-6 w-0.5 rounded-full bg-cream" />
      </div>
      <div
        className="absolute -inset-y-2 z-10 -ml-4 flex w-8 cursor-ew-resize touch-none items-center justify-center rounded-full bg-forest"
        style={{ left: `${(end / duration) * 100}%` }}
        onPointerDown={(e) => beginDrag("end", e)}
      >
        <span className="h-6 w-0.5 rounded-full bg-cream" />
      </div>
    </div>
  );
}

type Staged = { url: string; label: string; cover?: string; knownDuration?: number; persistLabel: boolean };

export function MusicPicker({
  value,
  title,
  onChange,
  locale,
  labels,
  eventType,
}: {
  eventType?: EventType;
  value: string;
  title?: string;
  onChange: (url: string, trim?: { start: number; end: number }, title?: string) => void;
  locale: string;
  labels: {
    online: string;
    device: string;
    link: string;
    apply: string;
    clear: string;
    pickFile: string;
  };
}) {
  const fromFile = value.startsWith("data:");
  const [mode, setMode] = useState<"online" | "device">(fromFile ? "device" : "online");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const preview = useRef<HTMLAudioElement>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [staged, setStaged] = useState<Staged | null>(null);
  const [trimDuration, setTrimDuration] = useState<number | null>(null);
  const [trimLoading, setTrimLoading] = useState(false);
  const [trimError, setTrimError] = useState("");
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
  const [trimPlaying, setTrimPlaying] = useState(false);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const trimRangeRef = useRef(trimRange);
  const ytHost = useRef<HTMLDivElement>(null);
  const ytPlayer = useRef<YoutubePlayer | null>(null);
  const ytPoll = useRef<number | null>(null);

  useEffect(() => {
    trimRangeRef.current = trimRange;
  }, [trimRange]);

  const current = useMemo(() => title || musicLabel(value, locale), [title, value, locale]);
  const searching = mode === "online" && query.trim().length >= 2 && !isLink(query);
  const stagedYt = staged ? youtubeId(staged.url) : null;

  function stopPreview() {
    preview.current?.pause();
    setPreviewing(null);
  }

  function stopTrimPlayback() {
    preview.current?.pause();
    ytPlayer.current?.pauseVideo();
    setTrimPlaying(false);
    if (ytPoll.current != null) {
      window.clearInterval(ytPoll.current);
      ytPoll.current = null;
    }
  }

  function openTrim(track: Staged) {
    stopPreview();
    setError("");
    setStaged(track);
    setTrimDuration(null);
    setTrimError("");
    setTrimPlaying(false);
    setPlayhead(null);
    if (youtubeId(track.url)) return; // duration/loading is handled by the YouTube mount effect below
    if (track.knownDuration && track.knownDuration > 0) {
      setTrimDuration(track.knownDuration);
      setTrimRange([0, Math.min(track.knownDuration, 60)]);
      return;
    }
    setTrimLoading(true);
    void loadAudioDuration(track.url)
      .then((d) => {
        setTrimDuration(d);
        setTrimRange([0, Math.min(d, 60)]);
      })
      .catch(() => {
        setTrimError(locale === "ru" ? "Не удалось определить длительность. Будет использован трек целиком." : "Узундугун аныктоо мүмкүн болбоду. Ыр толугу менен колдонулат.");
      })
      .finally(() => setTrimLoading(false));
  }

  // Mount a hidden YouTube player just to read its duration and drive trim preview/looping.
  useEffect(() => {
    if (!stagedYt) return;
    const yt = stagedYt;
    const host = ytHost.current;
    if (!host) return;
    let disposed = false;
    setTrimLoading(true);
    const mount = document.createElement("div");
    host.appendChild(mount);
    void loadYoutubePlayer()
      .then((api) => {
        if (disposed) return;
        new api.Player(mount, {
          videoId: yt,
          host: "https://www.youtube-nocookie.com",
          width: 1,
          height: 1,
          playerVars: { autoplay: 0, playsinline: 1, controls: 0, origin: window.location.origin },
          events: {
            onReady: (event) => {
              if (disposed) return;
              ytPlayer.current = event.target;
              setTrimLoading(false);
              const d = event.target.getDuration();
              if (d > 0) {
                setTrimDuration(d);
                setTrimRange([0, Math.min(d, 60)]);
              } else {
                setTrimError(locale === "ru" ? "Не удалось определить длительность. Будет использован ролик целиком." : "Узундугун аныктоо мүмкүн болбоду. Видео толугу менен колдонулат.");
              }
            },
            onStateChange: () => {},
            onError: () => {
              if (disposed) return;
              setTrimLoading(false);
              setTrimError(locale === "ru" ? "Не удалось загрузить видео." : "Видеону жүктөө мүмкүн болбоду.");
            },
            onAutoplayBlocked: () => {},
          },
        });
      })
      .catch(() => {
        if (disposed) return;
        setTrimLoading(false);
        setTrimError(locale === "ru" ? "Не удалось загрузить видео." : "Видеону жүктөө мүмкүн болбоду.");
      });
    return () => {
      disposed = true;
      if (ytPoll.current != null) {
        window.clearInterval(ytPoll.current);
        ytPoll.current = null;
      }
      ytPlayer.current?.destroy();
      ytPlayer.current = null;
      host.replaceChildren();
    };
  }, [stagedYt, locale]);

  function cancelTrim() {
    stopTrimPlayback();
    setStaged(null);
    setTrimDuration(null);
  }

  function confirmTrim() {
    if (!staged) return;
    stopTrimPlayback();
    const trim = trimDuration ? { start: trimRange[0], end: trimRange[1] } : undefined;
    onChange(staged.url, trim, staged.persistLabel ? staged.label : undefined);
    setStaged(null);
    setTrimDuration(null);
  }

  function toggleTrimPlay() {
    if (!staged) return;
    if (stagedYt) {
      const player = ytPlayer.current;
      if (!player) return;
      if (trimPlaying) {
        stopTrimPlayback();
        return;
      }
      player.seekTo(trimRangeRef.current[0], true);
      player.playVideo();
      setTrimPlaying(true);
      ytPoll.current = window.setInterval(() => {
        const p = ytPlayer.current;
        if (!p) return;
        const t = p.getCurrentTime();
        setPlayhead(t);
        if (t >= trimRangeRef.current[1]) p.seekTo(trimRangeRef.current[0], true);
      }, 200);
      return;
    }
    const el = preview.current;
    if (!el) return;
    if (trimPlaying) {
      el.pause();
      setTrimPlaying(false);
      return;
    }
    if (el.src !== staged.url) el.src = staged.url;
    el.currentTime = trimRange[0];
    setError("");
    void el
      .play()
      .then(() => setTrimPlaying(true))
      .catch(() => {
        setTrimPlaying(false);
        setError(locale === "ru" ? "Не удалось воспроизвести композицию." : "Музыка ойнотулган жок.");
      });
  }

  useEffect(() => {
    const el = preview.current;
    if (!el || !staged) return;
    function onTime() {
      if (!el) return;
      setPlayhead(el.currentTime);
      if (el.currentTime >= trimRange[1]) el.currentTime = trimRange[0];
    }
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [staged, trimRange]);

  function chooseTrack(url: string, extra?: { label?: string; cover?: string; duration?: number; persistLabel?: boolean }) {
    openTrim({
      url,
      label: extra?.label ?? musicLabel(url, locale),
      cover: extra?.cover,
      knownDuration: extra?.duration,
      persistLabel: Boolean(extra?.persistLabel && extra.label),
    });
  }

  useEffect(() => {
    if (mode !== "online") return;
    const q = query.trim();
    if (q.length < 2 || isLink(q)) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = window.setTimeout(() => {
      void searchOnlineMusic(q)
        .then((rows) => setHits(rows))
        .catch(() => setHits([]))
        .finally(() => setLoading(false));
    }, 280);
    return () => window.clearTimeout(t);
  }, [query, mode]);

  function togglePreview(url: string) {
    const el = preview.current;
    if (!el) return;
    if (youtubeId(url)) {
      el.pause();
      setError("");
      setPreviewing(previewing === url ? null : url);
      return;
    }
    if (previewing === url && !el.paused) {
      el.pause();
      setPreviewing(null);
      return;
    }
    el.src = url;
    setError("");
    void el.play().then(() => setPreviewing(url)).catch(() => {
      setPreviewing(null);
      setError(locale === "ru" ? "Не удалось воспроизвести композицию." : "Музыка ойнотулган жок.");
    });
  }

  if (staged) {
    return (
      <div className="space-y-3">
        {error && <p role="alert" className="text-xs text-rose">{error}</p>}
        <audio ref={preview} onEnded={() => setTrimPlaying(false)} />
        {stagedYt ? <div ref={ytHost} className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0" /> : null}
        <div className="flex items-center gap-2">
          {staged.cover ? (
            <img src={staged.cover} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/5 text-ink-soft">♪</span>
          )}
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{staged.label}</p>
        </div>

        {trimLoading ? (
          <p className="text-[11px] text-ink-soft">{locale === "ru" ? "Загрузка дорожки…" : "Ырды жүктөө…"}</p>
        ) : trimDuration ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-ink-soft">
              <span>{locale === "ru" ? "Урезать" : "Кесүү"}</span>
              <span className="tabular-nums">
                {formatDuration(trimRange[0])} – {formatDuration(trimRange[1])}
              </span>
            </div>
            <TrimBar
              duration={trimDuration}
              start={trimRange[0]}
              end={trimRange[1]}
              onDrag={(s, e) => setTrimRange([s, e])}
              seed={hashSeed(staged.url)}
              playhead={playhead}
            />
          </div>
        ) : (
          <p className="text-[11px] text-ink-soft">{trimError}</p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={cancelTrim}
            aria-label={locale === "ru" ? "Отмена" : "Жокко чыгаруу"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-ink-soft"
          >
            <X size={16} />
          </button>
          {trimDuration ? (
            <button
              type="button"
              onClick={toggleTrimPlay}
              aria-label={trimPlaying ? (locale === "ru" ? "Пауза" : "Тыныгуу") : (locale === "ru" ? "Слушать" : "Угуу")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5"
            >
              {trimPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={confirmTrim}
            aria-label={locale === "ru" ? "Сохранить" : "Сактоо"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-cream"
          >
            <Check size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p role="alert" className="text-xs text-rose">{error}</p>}
      <audio ref={preview} onEnded={() => setPreviewing(null)} />
      {previewing && youtubeId(previewing) ? (
        <iframe
          key={previewing}
          title={musicLabel(previewing, locale)}
          src={`https://www.youtube.com/embed/${encodeURIComponent(youtubeId(previewing)!)}?autoplay=1`}
          allow="autoplay; encrypted-media; picture-in-picture"
          className="h-[200px] w-full rounded-lg border-0"
          allowFullScreen
        />
      ) : null}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/5 p-1">
        <button
          type="button"
          onClick={() => setMode("online")}
          className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs ${
            mode === "online" ? "bg-forest text-cream" : "text-ink-soft"
          }`}
        >
          <Cloud size={12} /> {labels.online}
        </button>
        <button
          type="button"
          onClick={() => setMode("device")}
          className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs ${
            mode === "device" ? "bg-forest text-cream" : "text-ink-soft"
          }`}
        >
          <Smartphone size={12} /> {labels.device}
        </button>
      </div>

      {current ? (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-black/5 px-2 py-1.5 text-[11px]">
          <span className="truncate">{current}</span>
          <button type="button" aria-label={locale === "ru" ? "Удалить музыку" : "Музыканы өчүрүү"} onClick={() => { preview.current?.pause(); setPreviewing(null); onChange(""); }} className="shrink-0 text-rose">
            <Trash2 size={12} />
          </button>
        </div>
      ) : null}

      {mode === "online" ? (
        <div className="space-y-2">
          <div className="flex gap-1">
            <div className="relative min-w-0 flex-1">
              <Search size={14} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isLink(query)) chooseTrack(query.trim());
                }}
                placeholder={labels.link}
                className="w-full rounded-lg border border-ink/10 py-2 pl-7 pr-2 text-xs"
              />
            </div>
            {isLink(query) ? (
              <button
                type="button"
                onClick={() => chooseTrack(query.trim())}
                className="rounded-lg bg-forest px-2 py-1.5 text-[11px] text-cream"
              >
                {labels.apply}
              </button>
            ) : null}
          </div>
          {loading ? (
            <p className="text-[11px] text-ink-soft">
              {locale === "ru" ? "Поиск…" : "Издөө…"}
            </p>
          ) : null}
          {searching && !loading && hits.length === 0 ? (
            <p className="text-[11px] text-ink-soft">
              {locale === "ru" ? "Ничего не найдено." : "Эч нерсе табылган жок."}
            </p>
          ) : null}
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {searching ? null : [...ONLINE_TRACKS].sort((a, b) => Number(!!eventType && !!b.events?.includes(eventType)) - Number(!!eventType && !!a.events?.includes(eventType))).map((track) => {
              const on = value === track.url;
              const name = locale === "ru" ? track.ru : track.ky;
              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-1 rounded-lg px-1.5 py-1 ${
                    on ? "bg-forest/10 ring-1 ring-forest/30" : "hover:bg-black/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePreview(track.url);
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5"
                  >
                    {previewing === track.url ? <Pause size={11} /> : <Play size={11} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseTrack(track.url, { label: name })}
                    className="min-w-0 flex-1 truncate py-1.5 text-left text-xs"
                  >
                    {name}
                  </button>
                </div>
              );
            })}
            {hits.map((track) => {
              const on = value === track.url;
              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-2 rounded-lg px-1.5 py-1 ${
                    on ? "bg-forest/10 ring-1 ring-forest/30" : "hover:bg-black/5"
                  }`}
                >
                  {track.cover ? (
                    <img src={track.cover} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-black/5 text-ink-soft">♪</span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePreview(track.url);
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5"
                  >
                    {previewing === track.url ? <Pause size={11} /> : <Play size={11} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseTrack(track.url, { label: `${track.title} · ${track.artist}`, cover: track.cover, duration: track.duration, persistLabel: true })}
                    className="min-w-0 flex-1 py-1 text-left"
                  >
                    <span className="block truncate text-xs">{track.title}</span>
                    <span className="block truncate text-[10px] text-ink-soft">
                      {track.artist}
                      {track.duration ? ` · ${formatDuration(track.duration)}` : ""}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 px-3 py-4 text-xs">
          <Smartphone size={14} />
          {uploading ? (locale === "ru" ? "Загрузка…" : "Жүктөлүүдө…") : `${labels.pickFile} (MP3, M4A, OGG, WAV · 10 МБ)`}
          <input
            type="file"
            accept=".mp3,.m4a,.ogg,.wav,audio/*"
            disabled={uploading}
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setUploading(true); setError("");
              try {
                const url = await uploadInvitationAudio(file, locale);
                chooseTrack(url, { label: file.name.replace(/\.[^.]+$/, "") || (locale === "ru" ? "С устройства" : "Түзмөктөн"), persistLabel: true });
              }
              catch (error) { setError(error instanceof Error ? error.message : "Upload error"); }
              finally { setUploading(false); }
            }}
          />
        </label>
      )}
    </div>
  );
}

const PICKER_LABELS = {
  ky: {
    online: "Онлайн",
    device: "Түзмөктөн",
    link: "Ырдын атын жазыңыз",
    apply: "Коюу",
    clear: "Өчүрүү",
    pickFile: "Файл тандоо",
    title: "Музыка",
  },
  ru: {
    online: "Онлайн",
    device: "С устройства",
    link: "Название песни",
    apply: "ОК",
    clear: "Удалить",
    pickFile: "Выбрать файл",
    title: "Музыка",
  },
};

export function MusicPickModal({
  open,
  locale,
  value,
  onChange,
  onClose,
}: {
  open: boolean;
  locale: string;
  value: string;
  onChange: (url: string, trim?: { start: number; end: number }, title?: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  const L = locale === "ru" ? PICKER_LABELS.ru : PICKER_LABELS.ky;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div
        className="max-h-[82svh] w-full max-w-sm overflow-y-auto bg-page p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-medium">{L.title}</p>
          <button type="button" onClick={onClose} className="flex min-h-11 min-w-11 items-center justify-center text-ink-soft">
            ✕
          </button>
        </div>
        <MusicPicker value={value} locale={locale} onChange={onChange} labels={L} />
      </div>
    </div>
  );
}
