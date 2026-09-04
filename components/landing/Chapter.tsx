"use client";

import { useI18n } from "@/lib/locale";
import { media } from "@/lib/media";
import { Reveal } from "../ui/Reveal";

export function Chapter() {
  const { t } = useI18n();

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-forest-mid sm:min-h-[80vh]">
      <img
        src={media.chapter}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,12,0.35)_0%,rgba(20,16,12,0.45)_100%)]" />
      <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center text-gold-bright sm:min-h-[80vh] sm:px-10">
        <Reveal>
          <p className="text-[9px] uppercase tracking-[0.4em] text-gold-bright/70">{t.place}</p>
          <h2 className="font-serif mx-auto mt-8 max-w-[16ch] text-[36px] font-normal italic leading-[1.08] tracking-[-0.03em] sm:text-[54px] lg:text-[68px]">
            {t.chapterQuote}
          </h2>
        </Reveal>
      </div>
    </section>
  );
}
