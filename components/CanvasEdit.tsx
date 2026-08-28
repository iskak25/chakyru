"use client";

import { useEffect, useRef } from "react";
import { ImagePlus } from "lucide-react";
import type { Invitation } from "@/lib/types";

export type InvitePatch = (partial: Partial<Invitation>) => void;

const editRing =
  "rounded-sm outline-none ring-1 ring-transparent hover:ring-gold/80 focus:ring-gold bg-transparent";

export function CanvasText({
  value,
  placeholder,
  onChange,
  className = "",
  style,
  multiline,
}: {
  value: string;
  placeholder: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}) {
  if (!onChange) {
    return (
      <p className={className} style={style}>
        {value || placeholder}
      </p>
    );
  }

  const shared = {
    className: `${editRing} relative z-20 w-full text-center font-[inherit] ${className}`,
    style,
    value,
    placeholder,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(e.target.value),
  };

  if (multiline) {
    return <GrowTextarea {...shared} />;
  }
  return <input type="text" {...shared} />;
}

function GrowTextarea({
  className = "",
  style,
  value,
  placeholder,
  onChange,
}: {
  className?: string;
  style?: React.CSSProperties;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function fit() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    fit();
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      onInput={fit}
      className={`${className} resize-none overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      style={style}
    />
  );
}

export function CanvasDateTime({
  date,
  time,
  onChange,
  className = "",
  style,
}: {
  date: string;
  time: string;
  onChange?: InvitePatch;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!onChange) {
    return (
      <p className={className} style={style}>
        {date || "—"}
        {time ? ` · ${time}` : ""}
      </p>
    );
  }
  return (
    <div
      className={`relative z-20 flex flex-wrap items-center justify-center gap-1 ${className}`}
      style={style}
    >
      <input
        type="date"
        value={date}
        onChange={(e) => onChange({ date: e.target.value })}
        className={`${editRing} max-w-[58%] bg-transparent text-[11px] [color-scheme:dark]`}
      />
      <input
        type="time"
        value={time}
        onChange={(e) => onChange({ time: e.target.value })}
        className={`${editRing} bg-transparent text-[11px] [color-scheme:dark]`}
      />
    </div>
  );
}

export function PhotoLayer({ onChange }: { onChange?: InvitePatch }) {
  if (!onChange) return null;
  return (
    <label className="group/photo absolute inset-0 z-[1] cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onChange({ coverImage: String(reader.result ?? "") });
          reader.readAsDataURL(file);
        }}
      />
      <span className="pointer-events-none absolute inset-0 flex items-start justify-center pt-16 opacity-0 transition group-hover/photo:opacity-100">
        <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs text-[#161616] shadow">
          <ImagePlus size={14} />
        </span>
      </span>
    </label>
  );
}
