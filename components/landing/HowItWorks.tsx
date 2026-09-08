"use client";

import { useI18n } from "@/lib/locale";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { TextLink } from "../ui/TextLink";

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section id="how" className="bg-[#f3ece2]">
      <Container className="grid items-start gap-10 py-16 sm:gap-14 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:py-36">
        <Reveal>
          <h2 className="font-serif max-w-[10ch] text-[36px] leading-[1.04] tracking-[-0.03em] sm:text-[52px] lg:text-[64px]">
            {t.howTitle}
          </h2>
          <div className="img-crop mt-10 hidden aspect-[4/5] lg:block">
            <img src="/images/how-chakyru-phone.jpg" alt="Chakyru" className="h-full w-full object-cover object-top" />
          </div>
        </Reveal>
        <div>
          {t.how.map((step, i) => (
            <Reveal key={step.n} delay={i * 70}>
              <article className="flex gap-4 border-b border-ink/10 py-7 first:pt-0 last:border-0 sm:gap-6 sm:py-8">
                <span className="font-serif mt-0.5 w-10 shrink-0 text-[22px] italic text-gold">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-serif text-[22px] leading-tight tracking-[-0.02em] sm:text-[30px]">
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
