"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { PageHeader } from "@/components/app/AppShell";
import { TemplateCard } from "@/components/TemplateCard";
import { useI18n } from "@/lib/locale";
import { eventTypes } from "@/lib/templates";
import { useCatalog } from "@/lib/useCatalog";
import type { EventType } from "@/lib/types";

export default function TemplatesPage() {
  const { t, locale } = useI18n();
  const PAGE = 12;
  const [shown, setShown] = useState(PAGE);
  const { templates } = useCatalog();
  const [category, setCategory] = useState<EventType | "all">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"popular" | "new" | "price">("popular");

  const list = useMemo(() => {
    let next = templates.filter((tpl) => {
      if (tpl.priceSom === 199) return false;
      const catOk = category === "all" || tpl.eventTypes.includes(category);
      const needle = q.trim().toLowerCase();
      const qOk =
        !needle ||
        tpl.name.ky.toLowerCase().includes(needle) ||
        tpl.name.ru.toLowerCase().includes(needle) ||
        tpl.id.includes(needle);
      return catOk && qOk;
    });
    if (sort === "price") next = [...next].sort((a, b) => a.priceSom - b.priceSom);
    else if (sort === "new") next = [...next].reverse();
    else next = [...next].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    return next;
  }, [category, q, sort, templates]);
  // Keep filters, "show more" depth and scroll position when returning from a template.
  const KEY = "chakyru-templates-view";
  const restored = useRef(false);
  const scrollTo = useRef<number | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (saved) {
        setCategory(saved.category ?? "all");
        setQ(saved.q ?? "");
        setSort(saved.sort ?? "popular");
        setShown(Math.max(PAGE, Number(saved.shown) || PAGE));
        const y = Number(saved.scrollY) || 0;
        scrollTo.current = y;
        setTimeout(() => requestAnimationFrame(() => { window.scrollTo(0, y); scrollTo.current = null; }), 60);
      }
    } catch {}
    restored.current = true;
  }, []);
  useEffect(() => {
    if (!restored.current) return;
    if (scrollTo.current !== null) return; // restoring: keep the saved depth
    setShown(PAGE);
  }, [category, q, sort]);
  const stateRef = useRef({ category, q, sort, shown });
  stateRef.current = { category, q, sort, shown };
  useEffect(() => {
    const save = () => {
      if (!restored.current) return;
      try { sessionStorage.setItem(KEY, JSON.stringify({ ...stateRef.current, scrollY: window.scrollY })); } catch {}
    };
    document.addEventListener("click", save, true); // before navigation resets the scroll
    window.addEventListener("pagehide", save);
    return () => { document.removeEventListener("click", save, true); window.removeEventListener("pagehide", save); };
  }, []);

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-3.5 py-2 text-[11px] uppercase tracking-[0.14em] transition duration-250 ${
      active
        ? "bg-espresso text-cream"
        : "border border-[var(--line)] text-meta hover:border-ink/25 hover:text-ink"
    }`;

  return (
    <SiteShell>
      <PageHeader
        eyebrow={t.nav.studio}
        title={t.templatesTitle}
        description={t.templatesSub}
        action={
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-[12px] border border-[var(--line)] bg-white px-5 text-[11px] uppercase tracking-[0.14em] transition hover:border-ink/30"
          >
            {t.nav.mine}
          </Link>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block max-w-md flex-1">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-meta" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.nav.templates}
            className="h-12 w-full rounded-[12px] border border-[var(--line)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--gold)]"
          />
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="h-12 w-full rounded-[12px] border border-[var(--line)] bg-white px-4 text-[11px] uppercase tracking-[0.14em] lg:w-auto"
        >
          <option value="popular">{t.popular}</option>
          <option value="new">{t.templatesTitle}</option>
          <option value="price">{t.nav.pricing}</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setCategory("all")} className={chip(category === "all")}>
          {t.allTemplates}
        </button>
        {eventTypes.map((type) => (
          <button key={type} type="button" onClick={() => setCategory(type)} className={chip(category === type)}>
            {t.events[type]}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-16 rounded-[var(--radius-xl)] border border-[var(--line)] bg-white px-6 py-20 text-center">
          <p className="font-serif text-3xl">{t.catalogEmpty}</p>
        </div>
      ) : (
        <div className="mt-8 grid auto-rows-[minmax(280px,auto)] grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 xl:grid-cols-4">
          {list.slice(0, shown).map((tpl, index) => {
            const featured = index === 0 || (tpl.featured && index < 3);
            return (
              <div
                key={tpl.id}
                className={
                  featured && index === 0
                    ? "sm:col-span-2 sm:row-span-2"
                    : featured && index === 1
                      ? "xl:col-span-2"
                      : ""
                }
              >
                <TemplateCard template={tpl} featured={featured && index === 0} eager={index < 4} />
              </div>
            );
          })}
        </div>
      )}
      {list.length > shown ? (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className="inline-flex h-12 items-center rounded-[12px] border border-[var(--line)] bg-white px-8 text-[11px] uppercase tracking-[0.14em] transition hover:border-ink/30">
            {locale === "ru" ? "Показать ещё" : "Дагы көрсөтүү"} ({list.length - shown})
          </button>
        </div>
      ) : null}
    </SiteShell>
  );
}
