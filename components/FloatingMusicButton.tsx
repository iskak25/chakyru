"use client";

import { Volume2, VolumeX } from "lucide-react";

/** Кнопка музыки в углу приглашения: зона нажатия 44 px, отступы с учётом выреза и нижней полосы телефона. */
export function FloatingMusicButton({ playing, onToggle, label }: { playing: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      data-export-hide
      onClick={onToggle}
      aria-label={label}
      aria-pressed={playing}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex size-11 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition hover:bg-black/45"
    >
      {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
