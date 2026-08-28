"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Search } from "lucide-react";
import { STOCK_CATEGORIES, type StockPage, type StockPhoto } from "@/lib/stock";

export function StockPhotos({
  locale,
  labels,
  onAdd,
  onCover,
}: {
  locale: string;
  labels: {
    search: string;
    photos: string;
    cover: string;
    empty: string;
    more: string;
    credit: string;
  };
  onAdd: (src: string) => void;
  onCover: (src: string) => void;
}) {
  const [q, setQ] = useState<string>(STOCK_CATEGORIES[0].q);
  const [cat, setCat] = useState<string>(STOCK_CATEGORIES[0].id);
  const [typed, setTyped] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<StockPhoto[]>([]);
  const [source, setSource] = useState<StockPage["source"]>("openverse");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (typed.trim()) {
        setCat("");
        setPage(1);
        setQ(typed.trim());
      }
    }, 420);
    return () => window.clearTimeout(id);
  }, [typed]);

  useEffect(() => {
    let live = true;
    setBusy(true);
    const url = `/api/stock?q=${encodeURIComponent(q)}&page=${page}`;
    fetch(url)
      .then((res) => res.json() as Promise<StockPage>)
      .then((data) => {
        if (!live) return;
        setSource(data.source);
        setItems((was) => (page === 1 ? data.items : [...was, ...data.items]));
      })
      .catch(() => {
        if (page === 1 && live) setItems([]);
      })
      .finally(() => {
        if (live) setBusy(false);
      });
    return () => {
      live = false;
    };
  }, [q, page]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-soft">{labels.photos}</p>
      <label className="flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-2.5 py-2">
        <Search size={14} className="shrink-0 text-ink-soft" />
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={labels.search}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>
      <div className="-mx-0.5 flex flex-wrap gap-1">
        {STOCK_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTyped("");
              setCat(item.id);
              setPage(1);
              setQ(item.q);
            }}
            className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
              cat === item.id ? "bg-ink text-cream" : "bg-black/5 text-ink-soft"
            }`}
          >
            {locale === "ru" ? item.ru : item.ky}
          </button>
        ))}
      </div>
      {items.length ? (
        <div className="grid grid-cols-3 gap-1.5">
          {items.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-black/5">
              <button type="button" onClick={() => onAdd(photo.src)} className="h-full w-full" title={photo.alt}>
                <img src={photo.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
              <button
                type="button"
                title={labels.cover}
                onClick={(e) => {
                  e.stopPropagation();
                  onCover(photo.src);
                }}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <ImagePlus size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-xs text-ink-soft">{busy ? "…" : labels.empty}</p>
      )}
      {items.length ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => setPage((n) => n + 1)}
          className="w-full rounded-xl bg-black/5 py-2 text-xs uppercase tracking-[0.12em] disabled:opacity-50"
        >
          {labels.more}
        </button>
      ) : null}
      <p className="text-[10px] leading-4 text-ink-soft">
        {labels.credit} {source === "pexels" ? "Pexels" : source === "unsplash" ? "Unsplash" : "Openverse"}
      </p>
    </div>
  );
}
