"use client";

import Link from "next/link";

/** Плашка предпросмотра для владельца: возврат в редактор. Гостю не показывается (см. GuestInvite). */
export function PreviewBackBar({ id, locale, belowBand = false }: { id: string; locale: string; belowBand?: boolean }) {
  const ru = locale === "ru";
  return (
    <Link
      href={`/create/${encodeURIComponent(id)}`}
      data-export-hide
      className={`fixed left-3 z-[60] flex min-h-11 items-center gap-2 rounded-full bg-espresso/90 px-4 text-sm text-cream shadow-lg backdrop-blur ${belowBand ? "top-[calc(3.25rem+env(safe-area-inset-top))]" : "top-[calc(0.75rem+env(safe-area-inset-top))]"}`}
    >
      <span aria-hidden>←</span>
      {ru ? "Назад к редактированию" : "Оңдоого кайтуу"}
    </Link>
  );
}
