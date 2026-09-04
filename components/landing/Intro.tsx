"use client";

import { useI18n } from "@/lib/locale";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { TextLink } from "../ui/TextLink";

export function Intro() {
  const { t } = useI18n();

  return (
    <section className="bg-page">
      <Container className="grid items-start gap-10 py-16 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24 lg:py-32">
        <Reveal>
          <h2 className="font-serif max-w-[12ch] text-[34px] font-normal leading-[1.04] tracking-[-0.03em] sm:text-[50px] lg:text-[68px]">
            {t.featuresTitle.split(" ").slice(0, -1).join(" ")}{" "}
            <em className="italic">{t.featuresTitle.split(" ").slice(-1)}</em>
          </h2>
        </Reveal>
        <Reveal delay={90} className="lg:pt-4">
          <p className="max-w-[36ch] text-[15px] leading-[1.9] text-ink-soft sm:text-[16px]">
            {t.hero.desc}
          </p>
          <p className="mt-6 max-w-[36ch] text-[15px] leading-[1.9] text-ink-soft sm:text-[16px]">
            {t.featuresSub}
          </p>
          <TextLink href="/templates" className="mt-10">
            {t.hero.cta}
          </TextLink>
        </Reveal>
      </Container>
    </section>
  );
}
