"use client";

import { useI18n } from "@/lib/locale";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";

export function Features() {
  const { t } = useI18n();

  return (
    <section className="bg-page">
      <Container className="grid gap-x-16 gap-y-14 py-20 sm:grid-cols-2 sm:py-28 lg:grid-cols-3 lg:py-32">
        {t.features.map((item, i) => (
          <Reveal key={item.t} delay={i * 50}>
            <p className="text-[10px] uppercase tracking-[0.26em] text-meta">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="font-serif mt-4 text-[26px] leading-[1.15] tracking-[-0.025em] sm:text-[30px]">
              {item.t}
            </h3>
            <p className="mt-4 max-w-[32ch] text-[15px] leading-[1.9] text-ink-soft">{item.d}</p>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
