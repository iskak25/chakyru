"use client";

import { useI18n } from "@/lib/locale";
import { media } from "@/lib/media";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { TextLink } from "../ui/TextLink";

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section id="how" className="bg-page">
      <Container className="grid items-start gap-14 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:py-36">
        <Reveal>
          <h2 className="font-serif max-w-[10ch] text-[36px] leading-[1.04] tracking-[-0.03em] sm:text-[52px] lg:text-[64px]">
            {t.howTitle}
          </h2>
          <div className="img-crop mt-10 hidden aspect-[4/5] lg:block">
            <img src={media.pool} alt="" />
          </div>
        </Reveal>
        <div>
          {t.how.map((step, i) => (
            <Reveal key={step.n} delay={i * 70}>
              <article className="flex gap-6 border-b border-ink/10 py-8 first:pt-0 last:border-0">
                <span className="font-serif mt-0.5 w-10 shrink-0 text-[22px] italic text-gold">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-serif text-[26px] leading-tight tracking-[-0.02em] sm:text-[30px]">
                    {step.t}
                  </h3>
                  <p className="mt-3 max-w-md text-[15px] leading-8 text-ink-soft">{step.d}</p>
                  <TextLink href="/templates" className="mt-5">
                    {t.hero.cta}
                  </TextLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
