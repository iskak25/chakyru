"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { CreativeCanvas } from "./CreativeCanvas";
import type { CreativeAd, CreativeVariant } from "@/lib/creativeAds/types";
import { CREATIVE_FORMATS } from "@/lib/creativeAds/types";
import { useI18n } from "@/lib/locale";

export function DownloadModal({
  open,
  onClose,
  ad,
  variant,
}: {
  open: boolean;
  onClose: () => void;
  ad: CreativeAd;
  variant: CreativeVariant;
}) {
  const { t } = useI18n();
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [size, setSize] = useState(ad.format);
  const [busy, setBusy] = useState(false);
  const filename = `chakyru-${ad.templateId}-${variant.style}-01.${format}`;

  useEffect(() => {
    if (open) setSize(ad.format);
  }, [open, ad.format]);

  if (!open) return null;

  async function download() {
    setBusy(true);
    try {
      const node = document.getElementById("ca-download-preview");
      if (!node) return;
      const { toPng, toJpeg } = await import("html-to-image");
      const dataUrl =
        format === "jpg"
          ? await toJpeg(node, { quality: 0.95, pixelRatio: 2, cacheBust: true })
          : await toPng(node, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } finally {
      setBusy(false);
    }
  }

  const sizes = CREATIVE_FORMATS.filter((item, index, all) => all.findIndex((row) => row.ratio === item.ratio) === index);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div className="grid max-h-[94svh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-[var(--ca-cream)] pb-[env(safe-area-inset-bottom)] shadow-2xl sm:rounded-3xl lg:grid-cols-[1fr_1.1fr]">
        <div className="border-b border-[var(--ca-line)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--ca-muted)]">CreativeAds</p>
              <h2 className="font-serif mt-2 text-3xl tracking-[-0.03em]">{t.creativeAds.download.title}</h2>
            </div>
            <button type="button" className="flex min-h-11 min-w-11 items-center justify-center" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-[var(--ca-muted)]">{t.creativeAds.download.format}</p>
          <div className="mt-3 flex gap-2">
            {(["png", "jpg"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFormat(item)}
                className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.14em] ${
                  format === item ? "bg-[var(--ca-espresso)] text-[var(--ca-cream)]" : "border border-[var(--ca-line)]"
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-[var(--ca-muted)]">{t.creativeAds.download.size}</p>
          <div className="mt-3 space-y-2">
            {sizes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSize(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm ${
                  size === item.id ? "border-[var(--ca-gold)] bg-white" : "border-[var(--ca-line)]"
                }`}
              >
                <span>
                  {item.width} × {item.height}
                </span>
                <span className="text-[11px] text-[var(--ca-muted)]">{item.ratio}</span>
              </button>
            ))}
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-[var(--ca-muted)]">{t.creativeAds.download.filename}</p>
          <p className="mt-2 truncate rounded-2xl border border-[var(--ca-line)] bg-white px-4 py-3 text-sm">{filename}</p>

          <button
            type="button"
            disabled={busy}
            onClick={() => void download()}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ca-espresso)] px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-[var(--ca-cream)] disabled:opacity-60"
          >
            <Download size={14} />
            {busy ? t.creativeAds.download.busy : t.creativeAds.download.cta}
          </button>
        </div>

        <div className="flex items-center justify-center bg-[#ebe4da] p-6">
          <div className="w-full max-w-[320px]">
            <CreativeCanvas exportId="ca-download-preview" ad={{ ...ad, format: size }} variant={variant} />
          </div>
        </div>
      </div>
    </div>
  );
}
