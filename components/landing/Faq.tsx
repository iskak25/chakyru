"use client";

import { useI18n } from "@/lib/locale";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";

export function Faq() {
  const { t } = useI18n();

  return (
    <section className="bg-page">
      <Container className="max-w-3xl pb-24 sm:pb-32">
        <Reveal>
          <p className="label">006</p>
          <h2 className="font-serif mt-5 text-[36px] leading-[1.08] tracking-[-0.025em] sm:text-[48px]">
            {t.faqTitle}
          </h2>
        </Reveal>
        <div className="mt-10">
          {t.faq.map((item, i) => (
            <Reveal key={item.q} delay={i * 40}>
              <details className="group border-b border-ink/10 py-6">
                <summary className="font-serif cursor-pointer list-none text-[22px] leading-snug tracking-[-0.02em] sm:text-[26px] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-6">
                    {item.q}
                    <span className="mt-1 text-[18px] font-normal text-meta transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 max-w-md text-[15px] leading-8 text-ink-soft">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
