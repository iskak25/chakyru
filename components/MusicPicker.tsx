"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Cloud, Pause, Play, Search, Smartphone, Trash2 } from "lucide-react";
import { musicLabel, ONLINE_TRACKS, searchOnlineMusic, type SearchTrack } from "@/lib/music";

function fileToData(file: File, cb: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = () => cb(String(reader.result ?? ""));
  reader.readAsDataURL(file);
}

function isLink(q: string) {
  return /^https?:\/\//i.test(q.trim());
}

export function MusicPicker({
  value,
  onChange,
  locale,
  labels,
}: {
  value: string;
  onChange: (url: string) => void;
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

  const current = useMemo(() => musicLabel(value, locale), [value, locale]);

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
    if (previewing === url && !el.paused) {
      el.pause();
      setPreviewing(null);
      return;
    }
    el.src = url;
    void el.play();
    setPreviewing(url);
  }

  return (
    <div className="space-y-2">
      <audio ref={preview} onEnded={() => setPreviewing(null)} />
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
          <button type="button" onClick={() => onChange("")} className="shrink-0 text-rose">
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
                  if (e.key === "Enter" && isLink(query)) onChange(query.trim());
                }}
                placeholder={labels.link}
                className="w-full rounded-lg border border-ink/10 py-2 pl-7 pr-2 text-xs"
              />
            </div>
            {isLink(query) ? (
              <button
                type="button"
                onClick={() => onChange(query.trim())}
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
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {ONLINE_TRACKS.map((track) => {
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
                    onClick={() => onChange(track.url)}
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
                    onClick={() => onChange(track.url)}
                    className="min-w-0 flex-1 py-1 text-left"
                  >
                    <span className="block truncate text-xs">{track.title}</span>
                    <span className="block truncate text-[10px] text-ink-soft">{track.artist}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 px-3 py-4 text-xs">
          <Smartphone size={14} />
          {labels.pickFile}
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) fileToData(file, onChange);
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
  onChange: (url: string) => void;
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
        className="max-h-[80vh] w-full max-w-sm overflow-y-auto bg-page p-4"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-medium">{L.title}</p>
          <button type="button" onClick={onClose} className="text-ink-soft">
            ✕
          </button>
        </div>
        <MusicPicker value={value} locale={locale} onChange={onChange} labels={L} />
      </div>
    </div>
  );
}
