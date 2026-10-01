"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Download, Eye, HelpCircle, MoreHorizontal, RotateCcw, Share2, X } from "lucide-react";

type SaveState = "idle" | "saving" | "saved" | "pending" | "forbidden" | "expired" | "error";

const btn = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink disabled:opacity-30";

/** Мобильная верхняя панель редактора (56px): ✕ · ↶ ↷ · статус · ▶ · ⤴ · ⋯ */
export function EditorTopBar({
  locale,
  saveState,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExit,
  onPreview,
  onShare,
  onDownload,
  onReset,
  onHelp,
  onPay,
  busy,
}: {
  /** Нет оплаты: пункт меню «Оплатить и открыть публичный доступ». */
  onPay?: () => void;
  locale: string;
  saveState: SaveState;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExit: () => void;
  onPreview?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onReset: () => void;
  onHelp: () => void;
  busy?: boolean;
}) {
  const ru = locale === "ru";
  const [menu, setMenu] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const status: ReactNode = !online
    ? ru ? "☁ Офлайн" : "☁ Офлайн"
    : saveState === "saving"
      ? ru ? "☁ Сохранение…" : "☁ Сакталууда…"
      : saveState === "pending"
        ? ru ? "☁ Ожидание оплаты" : "☁ Төлөм күтүлүүдө"
        : saveState === "forbidden" || saveState === "expired" || saveState === "error"
          ? ru ? "⚠ Не сохранено" : "⚠ Сакталган жок"
          : ru ? "☁ Сохранено ✓" : "☁ Сакталды ✓";

  return (
    <div className="sticky top-0 z-50 flex h-14 items-center gap-0.5 border-b border-[var(--line)] bg-page px-2 sm:hidden">
      <button type="button" aria-label={ru ? "Выйти" : "Чыгуу"} onClick={onExit} className={btn}>
        <X size={22} />
      </button>
      <button type="button" aria-label={ru ? "Отменить" : "Артка"} onClick={onUndo} disabled={!canUndo} className={btn}>
        <RotateCcw size={20} />
      </button>
      <button type="button" aria-label={ru ? "Повторить" : "Алдыга"} onClick={onRedo} disabled={!canRedo} className={btn}>
        <RotateCcw size={20} className="-scale-x-100" />
      </button>
      <p className="min-w-0 flex-1 truncate px-1 text-center text-[11px] text-ink-soft" role="status">
        {status}
      </p>
      {onPreview ? (
        <button
          type="button"
          aria-label={ru ? "Предпросмотр" : "Алдын ала көрүү"}
          onClick={onPreview}
          disabled={busy}
          className={btn}
        >
          <Eye size={21} />
        </button>
      ) : null}
      {onShare ? (
        <button type="button" aria-label={ru ? "Поделиться" : "Бөлүшүү"} onClick={onShare} disabled={busy} className={btn}>
          <Share2 size={20} />
        </button>
      ) : onDownload ? (
        <button type="button" aria-label={ru ? "Скачать" : "Жүктөп алуу"} onClick={onDownload} disabled={busy} className={btn}>
          <Download size={20} />
        </button>
      ) : null}
      <div className="relative">
        <button type="button" aria-label={ru ? "Ещё" : "Дагы"} onClick={() => setMenu((v) => !v)} className={btn}>
          <MoreHorizontal size={22} />
        </button>
        {menu ? (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
            <ul className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-[var(--line)] bg-page py-1 shadow-lg">
              {onPay ? (
                <li>
                  <button
                    type="button"
                    className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium"
                    onClick={() => {
                      setMenu(false);
                      onPay();
                    }}
                  >
                    💳 {ru ? "Оплатить и открыть публичный доступ" : "Төлөп, ачык жеткиликтүүлүктү ачуу"}
                  </button>
                </li>
              ) : null}
              <li>
                <button
                  type="button"
                  className="flex h-12 w-full items-center gap-3 px-4 text-left text-sm"
                  onClick={() => {
                    setMenu(false);
                    onHelp();
                  }}
                >
                  <HelpCircle size={18} /> {ru ? "Подсказки" : "Жардам"}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="flex h-12 w-full items-center gap-3 px-4 text-left text-sm text-red-700"
                  onClick={() => {
                    setMenu(false);
                    onReset();
                  }}
                >
                  <RotateCcw size={18} /> {ru ? "Сбросить шаблон" : "Баштан баштоо"}
                </button>
              </li>
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
