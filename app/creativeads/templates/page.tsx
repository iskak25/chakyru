"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { getTemplatePhotos } from "@/lib/templatePhotos";
import { useCatalog } from "@/lib/useCatalog";
import type { EventType } from "@/lib/types";

type SortKey = "popular" | "new" | "price";

export default function CreativeAdsTemplatesPage() {
  const { locale, t } = useI18n();
  const { templates } = useCatalog();
  const [q, setQ] = useState("");
  const [event, setEvent] = useState<EventType | "all">("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const copy = t.creativeAds.templates;

  const filtered = useMemo(() => {
    let list = [...templates];
    if (event !== "all") list = list.filter((item) => item.eventTypes.includes(event));
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.name.ky.toLowerCase().includes(needle) ||
          item.name.ru.toLowerCase().includes(needle) ||
          item.id.includes(needle),
      );
    }
    if (sort === "price") list.sort((a, b) => a.priceSom - b.priceSom);
    else if (sort === "new") list.reverse();
    else list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.priceSom - a.priceSom);
    return list;
  }, [templates, event, q, sort]);

  return (
    <div className="ca-fade">
      <h1 className="font-serif text-[40px] leading-[1.02] tracking-[-0.035em] sm:text-[52px]">{copy.title}</h1>
      <p className="mt-4 max-w-[48ch] text-[15px] leading-7 text-[var(--ca-muted)]">{copy.subtitle}</p>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block max-w-md flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ca-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={copy.search}
            className="w-full rounded-full border border-[var(--ca-line)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--ca-gold)]"
          />
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-full border border-[var(--ca-line)] bg-white px-4 py-2.5 text-[11px] uppercase tracking-[0.14em]"
        >
          <option value="popular">{copy.sortPopular}</option>
          <option value="new">{copy.sortNew}</option>
          <option value="price">{copy.sortPrice}</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip active={event === "all"} onClick={() => setEvent("all")} label={copy.all} />
        {(Object.keys(t.events) as EventType[]).map((key) => (
          <FilterChip key={key} active={event === key} onClick={() => setEvent(key)} label={t.events[key]} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-[var(--ca-line)] bg-white/60 px-6 py-16 text-center">
          <p className="font-serif text-3xl">{copy.empty}</p>
          <Link href="/templates" className="mt-6 inline-block text-[11px] uppercase tracking-[0.16em] underline">
            {t.nav.templates}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template, index) => {
            const photo = getTemplatePhotos(template.id).hero;
            const featured = index === 0 || template.featured;
            return (
              <Link
                key={template.id}
                href={`/creativeads/create?template=${encodeURIComponent(template.id)}`}
                className={`group overflow-hidden rounded-[24px] border border-[var(--ca-line)] bg-white transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,12,10,0.08)] ${
                  featured ? "sm:col-span-2" : ""
                }`}
              >
                <div className={`relative overflow-hidden ${featured ? "aspect-[16/10]" : "aspect-[4/5]"}`}>
                  <img
                    src={photo}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80" />
                  {template.featured ? (
                    <span className="absolute left-4 top-4 rounded-full bg-[var(--ca-gold)]/90 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white">
                      {copy.popular}
                    </span>
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 translate-y-2 px-5 pb-5 text-[11px] uppercase tracking-[0.16em] text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {copy.use} →
                  </span>
                </div>
                <div className="flex items-end justify-between gap-3 px-5 py-4">
                  <div>
                    <h2 className="font-serif text-2xl tracking-[-0.02em]">{template.name[locale]}</h2>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--ca-muted)]">
                      {t.events[template.eventTypes[0] ?? "wedding"]}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--ca-ink)]">{formatPrice(locale, template.priceSom)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] transition ${
        active ? "bg-[var(--ca-espresso)] text-[var(--ca-cream)]" : "border border-[var(--ca-line)] text-[var(--ca-muted)]"
      }`}
    >
      {label}
    </button>
  );
}
