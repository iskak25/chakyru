"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { authHeaders } from "@/lib/accessClient";
import type { CreativeAd } from "@/lib/creativeAds/types";
import { CreativeCanvas } from "@/components/creativeads/CreativeCanvas";
import { useI18n } from "@/lib/locale";
import { getTemplate } from "@/lib/templates";

export default function CreativeAdsMyPage() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState<CreativeAd[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const copy = t.creativeAds.my;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const headers = await authHeaders();
      if (!("authorization" in headers)) {
        router.replace(`/login?google=1&next=${encodeURIComponent("/creativeads/my")}`);
        return;
      }
      const res = await fetch("/api/creativeads", { headers, cache: "no-store" });
      if (!res.ok) {
        if (!cancelled) setLoading(false);
        return;
      }
      const data = (await res.json()) as { items?: CreativeAd[] };
      if (!cancelled) {
        setItems(Array.isArray(data.items) ? data.items : []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filter === "favorites") return item.favorite;
      if (filter === "instagram") return item.format.startsWith("ig");
      if (filter === "stories") return item.format === "igStory" || item.format === "waStatus";
      if (filter === "facebook") return item.format.startsWith("fb");
      if (filter === "telegram") return item.format === "tgPost";
      return true;
    });
  }, [items, filter]);

  return (
    <div className="ca-fade">
      <h1 className="font-serif text-[40px] tracking-[-0.035em] sm:text-[52px]">{copy.title}</h1>
      <p className="mt-3 max-w-[42ch] text-sm leading-7 text-[var(--ca-muted)]">{copy.subtitle}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          ["all", copy.filters.all],
          ["favorites", copy.filters.favorites],
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

      {loading ? (
        <div className="mt-16 text-[var(--ca-muted)]">{copy.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-[var(--ca-line)] bg-white/70 px-6 py-16 text-center">
          <p className="font-serif text-3xl">{copy.empty}</p>
          <Link
            href="/creativeads/templates"
            className="mt-6 inline-flex rounded-full bg-[var(--ca-espresso)] px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-[var(--ca-cream)]"
          >
            {copy.cta}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const variant = item.variants.find((row) => row.id === item.activeVariantId) || item.variants[0];
            if (!variant) return null;
            const template = getTemplate(item.templateId);
            return (
              <Link
                key={item.id}
                href={`/creativeads/results/${item.id}`}
                className="overflow-hidden rounded-[24px] border border-[var(--ca-line)] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,12,10,0.08)]"
              >
                <CreativeCanvas ad={item} variant={variant} />
                <div className="flex items-start justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="font-serif text-xl">{template.name[locale]}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--ca-muted)]">
                      {item.format} · {new Date(item.createdAt).toLocaleDateString(locale === "ky" ? "ky-KG" : "ru-RU")}
                    </p>
                  </div>
                  {item.favorite ? <Heart size={14} fill="currentColor" className="mt-1 text-[var(--ca-gold)]" /> : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
