"use client";

import { useState } from "react";

const SLIDES = {
  ky: [
    { icon: "👆", text: "Листаңыз — чакырууну карап чыгыңыз" },
    { icon: "✏️", text: "Текстти бир басыңыз → ✏️ Өзгөртүү" },
    { icon: "✓", text: "Бүткөндө — Даяр ✓ же Артка баскычы" },
  ],
  ru: [
    { icon: "👆", text: "Листайте — просматривайте приглашение" },
    { icon: "✏️", text: "Нажмите на текст → ✏️ Изменить" },
    { icon: "✓", text: "Когда закончите — Готово ✓ или кнопка «Назад»" },
  ],
};

export const TOUR_FLAG = "chakyru:editor-tour-seen";

/** Подсказка из 3 слайдов при первом входе в редактор на телефоне. */
export function EditorTour({ locale, onClose }: { locale: string; onClose: () => void }) {
  const slides = locale === "ru" ? SLIDES.ru : SLIDES.ky;
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;
  const ru = locale === "ru";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:hidden"
      onClick={onClose}
    >
      <div
        className="mb-[env(safe-area-inset-bottom)] w-full max-w-sm rounded-2xl bg-page p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-5xl" aria-hidden>{slides[i].icon}</p>
        <p className="mt-4 min-h-[3.5rem] text-base leading-7">{slides[i].text}</p>
        <div className="mt-2 flex justify-center gap-2" aria-hidden>
          {slides.map((_, n) => (
            <span key={n} className={`h-2 w-2 rounded-full ${n === i ? "bg-gold" : "bg-ink/20"}`} />
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          {!last ? (
            <button type="button" onClick={onClose} className="h-12 shrink-0 px-4 text-sm text-ink-soft">
              {ru ? "Пропустить" : "Өткөрүп жиберүү"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => (last ? onClose() : setI(i + 1))}
            className="h-12 w-full rounded-xl bg-espresso text-sm font-medium text-cream"
          >
            {last ? (ru ? "Понятно" : "Түшүндүм") : ru ? "Далее" : "Кийинки"}
          </button>
        </div>
      </div>
    </div>
  );
}
