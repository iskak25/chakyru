"use client";

import type { CreativeAd, CreativeVariant } from "@/lib/creativeAds/types";
import { formatAspect } from "@/lib/creativeAds/types";

export function CreativeCanvas({
  ad,
  variant,
  exportId,
  className = "",
}: {
  ad: Pick<CreativeAd, "title" | "subtitle" | "cta" | "overlay" | "blur" | "textColor" | "buttonColor" | "align" | "fontSize" | "format">;
  variant: CreativeVariant;
  exportId?: string;
  className?: string;
}) {
  const align =
    ad.align === "left" ? "items-start text-left" : ad.align === "right" ? "items-end text-right" : "items-center text-center";

  return (
    <div
      id={exportId}
      className={`relative overflow-hidden rounded-[22px] bg-[#1a1512] shadow-[0_20px_50px_rgba(15,12,10,0.18)] ${className}`}
      style={{ aspectRatio: formatAspect(ad.format) }}
    >
      <img
        src={variant.sceneUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: ad.blur > 0 ? `blur(${ad.blur}px)` : undefined, transform: "scale(1.04)" }}
      />
      <div className="absolute inset-0" style={{ background: `rgba(15,12,10,${ad.overlay})` }} />

      <div className={`relative z-10 flex h-full flex-col justify-between p-[8%] ${align}`}>
        <div className={align}>
          <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: ad.textColor, opacity: 0.72 }}>
            Chakyru
          </p>
          <h3
            className="font-serif mt-3 max-w-[16ch] leading-[1.05] tracking-[-0.03em]"
            style={{ color: ad.textColor, fontSize: `clamp(22px, ${ad.fontSize * 0.045}vw, ${ad.fontSize}px)` }}
          >
            {ad.title}
          </h3>
          <p className="mt-3 max-w-[28ch] text-[13px] leading-6" style={{ color: ad.textColor, opacity: 0.82 }}>
            {ad.subtitle}
          </p>
        </div>

        <div className={`flex w-full gap-4 ${ad.align === "center" ? "justify-center" : ad.align === "right" ? "justify-end" : "justify-start"}`}>
          <div className="relative w-[38%] max-w-[180px] overflow-hidden rounded-[18px] border border-white/25 bg-black/30 p-1.5 shadow-xl">
            <div className="overflow-hidden rounded-[14px]">
              <img src={variant.inviteUrl} alt="" className="aspect-[9/16] w-full object-cover" />
            </div>
          </div>
        </div>

        <div className={align}>
          <span
            className="inline-flex rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.16em]"
            style={{ background: ad.buttonColor, color: ad.buttonColor === "#F5F1EA" || ad.buttonColor === "#ffffff" ? "#0F0C0A" : "#F5F1EA" }}
          >
            {ad.cta}
          </span>
        </div>
      </div>
    </div>
  );
}
