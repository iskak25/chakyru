"use client";

import { useI18n } from "@/lib/locale";
import { media } from "@/lib/media";
import { TextLink } from "../ui/TextLink";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative h-[100svh] min-h-[580px] w-full overflow-hidden bg-[#120e0c]">
      <img
        src={media.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_42%] sm:object-[center_38%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,6,0.55)_0%,rgba(10,8,6,0.08)_24%,rgba(10,8,6,0.05)_52%,rgba(10,8,6,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-page to-transparent" />

      <div className="relative z-10 flex h-full flex-col items-center justify-end px-5 pb-[5.5rem] text-center text-gold-bright sm:px-8 sm:pb-28">
        <p className="text-[9px] uppercase tracking-[0.42em] text-gold-bright/75 sm:text-[10px]">
          {t.hero.kicker}
        </p>
        <h1 className="font-serif mt-4 max-w-[13ch] text-[36px] font-normal leading-[0.94] tracking-[-0.035em] sm:mt-5 sm:text-[56px] lg:text-[72px]">
          {t.hero.title}
          <br />
          <em className="italic">{t.hero.titleAccent}</em>
        </h1>
        <TextLink href="/templates" className="mt-7 !text-gold-bright sm:mt-8">
          {t.hero.cta}
        </TextLink>
      </div>

      <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-gold-bright/65">
        <span className="text-[9px] uppercase tracking-[0.32em]">{t.place}</span>
      </div>
    </section>
  );
}
