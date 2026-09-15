"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export function AppDialog({ title, onClose, children, className = "" }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
  return <dialog ref={dialog} aria-labelledby={heading} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) { const box = e.currentTarget.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) onClose(); } }} className={[className, "fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-black/10 bg-[#fffdf8] p-6 text-[#302a25] shadow-2xl backdrop:bg-black/45 sm:p-8"].join(" ")}>
    <div className="flex items-start justify-between gap-4"><h2 id={heading} className="font-serif text-3xl">{title}</h2><button type="button" onClick={onClose} aria-label="Закрыть / Жабуу" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">✕</button></div>
    {children}
  </dialog>;
}
