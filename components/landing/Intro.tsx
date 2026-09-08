"use client";

import Link from "next/link";
import { useI18n } from "@/lib/locale";
import { media } from "@/lib/media";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";

const FEATURE_IMAGES = [media.portraitA, media.portraitB, media.portraitC] as const;

export function Intro() {
  const { t } = useI18n();
  const highlights = t.features.slice(0, 3);
  const titleParts = t.featuresTitle.trim().split(/\s+/);
  const brand = titleParts[titleParts.length - 1] ?? "Chakyru";
  const lead = titleParts.slice(0, -1).join(" ");

  return (
    <section className="bg-[#f7f4ef]">
      <Container className="py-16 sm:py-24 lg:py-28">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 xl:gap-24">
          <Reveal>
            <h2 className="font-serif max-w-[12ch] text-[40px] font-normal leading-[1.02] tracking-[-0.03em] text-ink sm:text-[56px] lg:text-[68px]">
              {lead} <em className="italic">{brand}</em>
            </h2>
          </Reveal>

          <Reveal delay={80} className="lg:pt-3">
            <p className="max-w-[38ch] text-[15px] leading-[1.9] text-ink-soft sm:text-[16px]">{t.hero.desc}</p>
            <p className="mt-5 max-w-[38ch] text-[15px] leading-[1.9] text-ink-soft sm:text-[16px]">{t.featuresSub}</p>
            <Link
              href="/templates"
              className="mt-10 inline-block text-[11px] uppercase tracking-[0.22em] text-ink underline underline-offset-[6px] transition hover:opacity-60"
            >
              {t.hero.cta}
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-3 sm:gap-6 lg:mt-20 lg:gap-8">
          {highlights.map((item, i) => (
            <Reveal key={item.t} delay={100 + i * 70}>
              <figure>
                <div className="overflow-hidden bg-[#ddd4c8]">
                  <img
                    src={FEATURE_IMAGES[i]}
                    alt=""
                    className="aspect-[3/4] w-full object-cover transition duration-700 hover:scale-[1.03]"
                    style={{ transitionTimingFunction: "var(--ease-premium)" }}
                  />
                </div>
                <figcaption className="mt-4 text-[11px] uppercase tracking-[0.22em] text-ink sm:mt-5">
                  {item.t}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
