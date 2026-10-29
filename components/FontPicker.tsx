"use client";

import { useState } from "react";
import {
  FONT_CATEGORIES, FONT_LIBRARY, fontByCss, loadFavoriteFonts, loadRecentFonts, pushRecentFont, searchFonts,
  toggleFavoriteFont, type FontEntry,
} from "@/lib/fontLibrary";

type Tab = "all" | "recent" | "favorite" | (typeof FONT_CATEGORIES)[number]["id"];

/** Выбор шрифта карточками с живым превью на тексте элемента. Значение — CSS-строка fontFamily, "" = «По шаблону». */
export function FontPicker({ value, sample, ru, onChange }: {
  value: string; sample: string; ru: boolean; onChange: (css: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  // Недоступное хранилище не должно ломать панель: списки читаются один раз при открытии.
  const [recent, setRecent] = useState<string[]>(loadRecentFonts);
  const [favorites, setFavorites] = useState<string[]>(loadFavoriteFonts);
  const current = fontByCss(value);
  const text = sample.trim().slice(0, 40) || (ru ? "Приглашаем вас" : "Чакырабыз");

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: ru ? "Все" : "Баары" },
    ...FONT_CATEGORIES.map(c => ({ id: c.id, label: ru ? c.ru : c.ky })),
    { id: "recent", label: ru ? "Недавние" : "Акыркы" },
    { id: "favorite", label: ru ? "Избранные" : "Тандалмалар" },
  ];

  const byId = (ids: string[]) => ids.map(id => FONT_LIBRARY.find(f => f.id === id)).filter((f): f is FontEntry => !!f);
  const base = tab === "all" ? FONT_LIBRARY
    : tab === "recent" ? byId(recent)
    : tab === "favorite" ? byId(favorites)
    : FONT_LIBRARY.filter(f => f.category === tab);
  const list = searchFonts(base, query);

  function pick(font: FontEntry) {
    onChange(font.css);
    setRecent(pushRecentFont(font.id));
  }

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span>{ru ? "Шрифт" : "Арип"}: <b>{current?.label ?? (value ? (ru ? "свой" : "өзүнүн") : (ru ? "по шаблону" : "шаблон боюнча"))}</b></span>
        <button type="button" disabled={!value} onClick={() => onChange("")} className="min-h-11 rounded-lg border px-3 disabled:opacity-40">
          {ru ? "По шаблону" : "Шаблон боюнча"}
        </button>
      </div>
      <input
        type="search"
        aria-label={ru ? "Поиск шрифта" : "Арип издөө"}
        placeholder={ru ? "Поиск шрифта" : "Арип издөө"}
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full rounded-lg border border-black/15 bg-white px-2 py-1.5 text-base text-[#29251f]"
      />
      <div role="tablist" aria-label={ru ? "Категории шрифтов" : "Арип категориялары"} className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(item => (
          <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}
            className={`min-h-9 shrink-0 rounded-full px-3 ${tab === item.id ? "bg-ink text-cream" : "bg-black/5"}`}>
            {item.label}
          </button>
        ))}
      </div>
      <ul className="max-h-56 space-y-1 overflow-y-auto" aria-label={ru ? "Шрифты" : "Ариптер"}>
        {list.length === 0 ? <li className="py-3 text-center text-black/55">{ru ? "Ничего не найдено" : "Эч нерсе табылган жок"}</li> : null}
        {list.map(font => {
          const active = font.css === value;
          const fav = favorites.includes(font.id);
          return (
            <li key={font.id} className={`flex items-stretch gap-1 rounded-lg border ${active ? "border-ink bg-ink/10" : "border-black/10 bg-white"}`}>
              <button type="button" aria-pressed={active} onClick={() => pick(font)} className="min-h-12 min-w-0 flex-1 px-3 py-1 text-left">
                <span className="block truncate text-lg leading-tight text-[#29251f]" style={{ fontFamily: font.css }}>{text}</span>
                <span className="block text-[11px] text-black/55">
                  {font.label}{font.ky === "partial" ? (ru ? " · ң/ө/ү запасным шрифтом" : " · ң/ө/ү камдык арип менен") : ""}
                </span>
              </button>
              <button type="button" aria-pressed={fav} aria-label={`${fav ? (ru ? "Убрать из избранного" : "Тандалмадан алуу") : (ru ? "В избранное" : "Тандалмага кошуу")}: ${font.label}`}
                onClick={() => setFavorites(toggleFavoriteFont(font.id))} className="min-h-12 w-11 shrink-0 text-lg">
                {fav ? "★" : "☆"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
