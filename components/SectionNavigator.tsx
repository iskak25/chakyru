"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeddingPartInfo } from "@/lib/weddingEditor";

const TOP_OFFSET = 64; // верхняя панель 56px + отступ

type Section = { id: string; label: string };

function sectionEl(id: string) {
  return document.querySelector<HTMLElement>(`[data-box="${CSS.escape(id)}"]`);
}

/**
 * Навигатор секций шаблона: точки + «2 / 8», тап по счётчику открывает список секций.
 * Секции берутся из частей шаблона `section-*`; у шаблонов без секций ничего не рисуется.
 */
export function SectionNavigator({ parts, locale }: { parts: WeddingPartInfo[]; locale: string }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [current, setCurrent] = useState(0);
  const [listOpen, setListOpen] = useState(false);

  // Только секции, реально присутствующие на холсте (скрытые не рендерятся).
  useEffect(() => {
    const next = parts
      .filter((p) => p.id.startsWith("section-"))
      .filter((p) => sectionEl(p.id))
      .map((p) => ({ id: p.id, label: p.label }));
    setSections((prev) =>
      prev.length === next.length && prev.every((s, i) => s.id === next[i].id && s.label === next[i].label)
        ? prev
        : next,
    );
  }, [parts]);

  useEffect(() => {
    if (!sections.length) return;
    const onScroll = () => {
      let idx = 0;
      sections.forEach((s, i) => {
        const el = sectionEl(s.id);
        if (el && el.getBoundingClientRect().top <= TOP_OFFSET + window.innerHeight * 0.25) idx = i;
      });
      setCurrent(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  const goTo = useCallback(
    (i: number) => {
      const s = sections[Math.max(0, Math.min(sections.length - 1, i))];
      const el = s && sectionEl(s.id);
      if (!el) return;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - TOP_OFFSET, behavior: "smooth" });
    },
    [sections],
  );

  if (sections.length < 2) return null;

  return (
    <>
      <div className="editor-section-nav order-1 flex h-10 w-full items-center justify-center gap-3 border-t border-[var(--line)] bg-page px-3">
        <button
          type="button"
          aria-label={locale === "ru" ? "Предыдущая секция" : "Мурунку бөлүм"}
          disabled={current === 0}
          onClick={() => goTo(current - 1)}
          className="flex h-10 w-10 items-center justify-center text-lg disabled:opacity-25"
        >
          ‹
        </button>
        <div className="flex min-w-0 items-center gap-1.5" aria-hidden>
          {sections.length <= 12
            ? sections.map((s, i) => (
                <span key={s.id} className={`h-2 w-2 rounded-full ${i === current ? "bg-gold" : "bg-ink/20"}`} />
              ))
            : null}
        </div>
        <button
          type="button"
          onClick={() => setListOpen(true)}
          className="h-10 min-w-[3.5rem] px-2 text-xs tabular-nums text-ink-soft"
        >
          {current + 1} / {sections.length}
        </button>
        <button
          type="button"
          aria-label={locale === "ru" ? "Следующая секция" : "Кийинки бөлүм"}
          disabled={current === sections.length - 1}
          onClick={() => goTo(current + 1)}
          className="flex h-10 w-10 items-center justify-center text-lg disabled:opacity-25"
        >
          ›
        </button>
      </div>

      {listOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end bg-black/40" onClick={() => setListOpen(false)}>
          <ul
            className="max-h-[60svh] w-full overflow-y-auto rounded-t-2xl bg-page p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            {sections.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setListOpen(false);
                    goTo(i);
                  }}
                  className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm ${
                    i === current ? "bg-black/[0.05] font-medium" : ""
                  }`}
                >
                  <span className="w-5 text-xs tabular-nums text-ink-soft">{i + 1}</span>
                  <span className="truncate">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
