"use client";

import { useI18n } from "@/lib/locale";
import { media } from "@/lib/media";
import { TextLink } from "../ui/TextLink";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative h-[100svh] min-h-[580px] w-full overflow-hidden bg-forest-mid">
      <img
        src={media.hero}
        alt=""
        className="kenburns absolute inset-0 h-full w-full object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,12,0.42)_0%,rgba(20,16,12,0.18)_38%,rgba(20,16,12,0.5)_78%)]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-page to-transparent" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 pb-16 text-center text-gold-bright sm:px-8">
        <p className="text-[9px] uppercase tracking-[0.42em] text-gold-bright/75 sm:text-[10px]">
          {t.hero.kicker}
        </p>
        <h1 className="font-serif mt-7 max-w-[13ch] text-[44px] font-normal leading-[0.94] tracking-[-0.035em] sm:mt-8 sm:text-[68px] lg:text-[88px] xl:text-[96px]">
          {t.hero.title}
          <br />
          <em className="italic">{t.hero.titleAccent}</em>
        </h1>
        <TextLink href="/templates" className="mt-10 !text-gold-bright sm:mt-12">
          {t.hero.cta}
        </TextLink>
      </div>

      <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-gold-bright/65">
        <span className="h-11 w-px bg-gold-bright/45" />
        <span className="text-[9px] uppercase tracking-[0.32em]">{t.place}</span>
      </div>
    </section>
  );
}
