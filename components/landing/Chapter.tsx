"use client";

import { useI18n } from "@/lib/locale";
import { media } from "@/lib/media";
import { Reveal } from "../ui/Reveal";
import Link from "next/link";

export function Chapter() {
  const { t } = useI18n();

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-forest-mid sm:min-h-[80vh]">
      <img
        src={media.chapter}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[58%_38%] sm:object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,12,0.58)_0%,rgba(20,16,12,0.72)_100%)]" />
      <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center text-gold-bright sm:min-h-[80vh] sm:px-10">
        <Reveal>
          <div className="drop-shadow-[0_3px_14px_rgba(0,0,0,0.65)]">
          <p className="text-[9px] uppercase tracking-[0.4em] text-gold-bright">{t.chapterEyebrow}</p>
          <h2 className="font-serif mx-auto mt-8 max-w-[16ch] text-[36px] font-normal italic leading-[1.08] tracking-[-0.03em] text-[#f7e7c8] sm:text-[54px] lg:text-[68px]">
            {t.chapterQuote}
          </h2>
          <p className="mx-auto mt-6 max-w-[25ch] text-[15px] leading-7 text-[#fff8ed] sm:text-[17px]">
            {t.chapterDescription}
          </p>
          <Link
            href="/templates"
            className="mt-8 inline-flex items-center gap-2 border-b border-gold-bright/60 pb-2 text-[11px] uppercase tracking-[0.18em] text-gold-bright transition-opacity hover:opacity-70"
          >
            {t.chapterCta} <span aria-hidden="true">→</span>
          </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
