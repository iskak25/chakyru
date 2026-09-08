"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Heart, Pencil, Trash2 } from "lucide-react";
import { authHeaders } from "@/lib/accessClient";
import type { CreativeAd } from "@/lib/creativeAds/types";
import { CreativeCanvas } from "@/components/creativeads/CreativeCanvas";
import { CreativeCoverflow } from "@/components/creativeads/CreativeCoverflow";
import { DownloadModal } from "@/components/creativeads/DownloadModal";
import { useI18n } from "@/lib/locale";

export default function CreativeAdsResultsPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const [ad, setAd] = useState<CreativeAd | null>(null);
  const [filter, setFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const copy = t.creativeAds.results;
  const styleLabels = t.creativeAds.styles;
  const formatLabels = t.creativeAds.formats;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const headers = await authHeaders();
      if (!("authorization" in headers)) {
        router.replace(`/login?google=1&next=${encodeURIComponent(`/creativeads/results/${params.jobId}`)}`);
        return;
      }
      const res = await fetch(`/api/creativeads/${params.jobId}`, { headers, cache: "no-store" });
      if (!res.ok) {
        if (!cancelled) setAd(null);
        return;
      }
      const data = (await res.json()) as { item: CreativeAd };
      if (!cancelled) setAd(data.item);
    })();
    return () => {
      cancelled = true;
    };
  }, [params.jobId, router]);

  const variants = useMemo(() => {
    if (!ad) return [];
    if (filter === "all") return ad.variants;
    if (filter === "instagram") return ad.format.startsWith("ig") ? ad.variants : [];
    if (filter === "stories") return ad.format === "igStory" || ad.format === "waStatus" ? ad.variants : [];
    if (filter === "facebook") return ad.format.startsWith("fb") ? ad.variants : [];
    if (filter === "telegram") return ad.format === "tgPost" ? ad.variants : [];
    return ad.variants;
  }, [ad, filter]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filter, ad?.id]);

  async function toggleFavorite() {
    if (!ad) return;
    const headers = await authHeaders();
    const res = await fetch(`/api/creativeads/${ad.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ favorite: !ad.favorite }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { item: CreativeAd };
    setAd(data.item);
  }

  async function remove() {
    if (!ad) return;
    const headers = await authHeaders();
    const res = await fetch(`/api/creativeads/${ad.id}`, { method: "DELETE", headers });
    if (res.ok) router.push("/creativeads/my");
  }

  if (!ad) {
    return <div className="py-24 text-center text-[var(--ca-muted)]">{copy.loading}</div>;
  }

  const current = variants[activeIndex] || variants[0];
  const downloadVariant = ad.variants.find((item) => item.id === downloadId) || current;

  return (
    <div className="ca-fade">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[40px] tracking-[-0.035em] sm:text-[52px]">{copy.title}</h1>
          <p className="mt-3 max-w-[40ch] text-sm leading-7 text-[var(--ca-muted)]">{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void toggleFavorite()}
            className="rounded-full border border-[var(--ca-line)] px-4 py-2 text-[11px] uppercase tracking-[0.14em]"
          >
            {ad.favorite ? copy.unfav : copy.fav}
          </button>
          <button
            type="button"
            onClick={() => setDownloadId(current?.id || ad.variants[0]?.id || null)}
            className="rounded-full bg-[var(--ca-espresso)] px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[var(--ca-cream)]"
          >
            {copy.downloadAll}
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          ["all", copy.filters.all],
          ["instagram", copy.filters.instagram],
          ["stories", copy.filters.stories],
          ["facebook", copy.filters.facebook],
          ["telegram", copy.filters.telegram],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] ${
              filter === id ? "bg-[var(--ca-espresso)] text-[var(--ca-cream)]" : "border border-[var(--ca-line)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {variants.length === 0 ? (
        <p className="mt-16 text-center text-[var(--ca-muted)]">{copy.loading}</p>
      ) : (
        <>
          <div className="mt-10">
            <CreativeCoverflow
              onActiveChange={setActiveIndex}
              items={variants.map((variant, index) => ({
                id: variant.id,
                node: (
                  <article className="overflow-hidden rounded-[24px] border border-[var(--ca-line)] bg-white shadow-[0_18px_40px_rgba(15,12,10,0.1)]">
                    <CreativeCanvas ad={ad} variant={variant} />
                    <div className="px-4 py-3">
                      <p className="font-serif text-lg">
                        {String(index + 1).padStart(2, "0")}. {styleLabels[variant.style]}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--ca-muted)]">
                        {formatLabels[ad.format]}
                      </p>
                    </div>
                  </article>
                ),
              }))}
            />
          </div>

          {current ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void toggleFavorite()}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--ca-line)] px-4 py-2.5 text-[11px] uppercase tracking-[0.14em]"
              >
                <Heart size={14} fill={ad.favorite ? "currentColor" : "none"} />
                {ad.favorite ? copy.unfav : copy.fav}
              </button>
              <Link
                href={`/creativeads/editor/${ad.id}?v=${current.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--ca-line)] px-4 py-2.5 text-[11px] uppercase tracking-[0.14em]"
              >
                <Pencil size={14} />
                {copy.edit}
              </Link>
              <button
                type="button"
                onClick={() => setDownloadId(current.id)}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--ca-espresso)] px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[var(--ca-cream)]"
              >
                <Download size={14} />
                {copy.downloadAll}
              </button>
              <button
                type="button"
                onClick={() => void remove()}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--ca-line)] px-4 py-2.5 text-[11px] uppercase tracking-[0.14em]"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : null}
        </>
      )}

      {downloadVariant ? (
        <DownloadModal open={Boolean(downloadId)} onClose={() => setDownloadId(null)} ad={ad} variant={downloadVariant} />
      ) : null}
    </div>
  );
}
