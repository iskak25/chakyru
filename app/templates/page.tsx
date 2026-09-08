"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { PageHeader } from "@/components/app/AppShell";
import { TemplateCard } from "@/components/TemplateCard";
import { useI18n } from "@/lib/locale";
import { eventTypes, formats } from "@/lib/templates";
import { useCatalog } from "@/lib/useCatalog";
import type { EventType, InviteFormat } from "@/lib/types";

export default function TemplatesPage() {
  const { t } = useI18n();
  const { templates } = useCatalog();
  const [category, setCategory] = useState<EventType | "all">("all");
  const [format, setFormat] = useState<InviteFormat | "all">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"popular" | "new" | "price">("popular");

  const list = useMemo(() => {
    let next = templates.filter((tpl) => {
      const catOk = category === "all" || tpl.eventTypes.includes(category);
      const fmtOk = format === "all" || tpl.format === format;
      const needle = q.trim().toLowerCase();
      const qOk =
        !needle ||
        tpl.name.ky.toLowerCase().includes(needle) ||
        tpl.name.ru.toLowerCase().includes(needle) ||
        tpl.id.includes(needle);
      return catOk && fmtOk && qOk;
    });
    if (sort === "price") next = [...next].sort((a, b) => a.priceSom - b.priceSom);
    else if (sort === "new") next = [...next].reverse();
    else next = [...next].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    return next;
  }, [category, format, q, sort, templates]);

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

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setFormat("all")} className={chip(format === "all")}>
          {t.allTemplates}
        </button>
        {formats.map((f) => (
          <button key={f} type="button" onClick={() => setFormat(f)} className={chip(format === f)}>
            {t.formats[f]}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-16 rounded-[var(--radius-xl)] border border-[var(--line)] bg-white px-6 py-20 text-center">
          <p className="font-serif text-3xl">{t.catalogEmpty}</p>
        </div>
      ) : (
        <div className="mt-8 grid auto-rows-[minmax(280px,auto)] grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((tpl, index) => {
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
                <TemplateCard template={tpl} featured={featured && index === 0} />
              </div>
            );
          })}
        </div>
      )}
    </SiteShell>
  );
}
