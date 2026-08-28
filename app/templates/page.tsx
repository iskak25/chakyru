"use client";

import { useMemo, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { TemplateCard } from "@/components/TemplateCard";
import { useI18n } from "@/lib/locale";
import { eventTypes, formats } from "@/lib/templates";
import { useCatalog } from "@/lib/useCatalog";
import type { EventType, InviteFormat } from "@/lib/types";

export default function TemplatesPage() {
  const { t } = useI18n();
  const { templates } = useCatalog();
  const [category, setCategory] = useState<EventType | "all">("wedding");
  const [format, setFormat] = useState<InviteFormat | "all">("all");

  const list = useMemo(
    () =>
      templates.filter((tpl) => {
        const catOk = category === "all" || tpl.eventTypes.includes(category);
        const fmtOk = format === "all" || tpl.format === format;
        return catOk && fmtOk;
      }),
    [category, format, templates],
  );

  const chip = (active: boolean) =>
    `shrink-0 px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors duration-200 ${
      active ? "text-ink underline underline-offset-4" : "text-meta hover:text-ink"
    }`;

  return (
    <SiteShell>
      <div className="min-h-[70vh] bg-page">
        <div className="mx-auto max-w-[1400px] px-5 py-16">
          <p className="eyebrow text-left">{t.nav.studio}</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-serif text-4xl uppercase sm:text-6xl">{t.templatesTitle}</h1>
            <p className="text-[10px] uppercase tracking-[0.16em] text-meta">
              {list.length} {t.catalogCount}
            </p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 tracking-wide text-ink-soft">{t.templatesSub}</p>

          <div className="-mx-5 mt-10 overflow-x-auto px-5">
            <div className="flex gap-1 pb-1">
              <button type="button" onClick={() => setCategory("all")} className={chip(category === "all")}>
                {t.allTemplates}
              </button>
              {eventTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCategory(type)}
                  className={chip(category === type)}
                >
                  {t.events[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
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
            <p className="py-24 text-center text-sm text-ink-soft">{t.catalogEmpty}</p>
          ) : (
            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
              {list.map((tpl) => (
                <TemplateCard key={tpl.id} template={tpl} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
