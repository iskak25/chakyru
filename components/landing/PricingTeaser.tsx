"use client";

import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { useCatalog } from "@/lib/useCatalog";
import { PlanBuyButton } from "../PlanBuyButton";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { TextLink } from "../ui/TextLink";

export function PricingTeaser() {
  const { locale, t } = useI18n();
  const { pricing } = useCatalog();

  return (
    <section className="bg-page">
      <Container className="pb-20 sm:pb-28 lg:pb-36">
        <Reveal>
          <p className="label">005</p>
          <h2 className="font-serif mt-5 text-[36px] leading-[1.08] tracking-[-0.025em] sm:text-[52px] lg:text-[60px]">
            {t.pricingTitle}
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-8 text-ink-soft">{t.pricingSub}</p>
        </Reveal>
        <div className="mt-14 grid gap-px bg-ink/10 md:grid-cols-2">
          {(
            [
              ["standard", false],
              ["pro", true],
            ] as const
          ).map(([key], i) => (
            <Reveal key={key} delay={i * 80}>
              <article className={`h-full px-6 py-10 sm:px-10 sm:py-14 ${key === "pro" ? "bg-forest text-gold-bright" : "bg-page"}`}>
                <h3 className="font-serif text-[34px] leading-none tracking-[-0.02em] sm:text-[40px]">
                  {t.plans[key].name}
                </h3>
                <p className="font-serif mt-6 text-[40px] leading-none">
                  {key === "pro" ? formatPrice(locale, pricing.proPriceSom) : t.plans.standard.priceHint}
                </p>
                <p className={`mt-2 text-[10px] uppercase tracking-[0.16em] ${key === "pro" ? "text-gold-bright/55" : "text-meta"}`}>
                  {t.perInvite}
                </p>
                <ul className={`mt-8 space-y-2 text-[15px] leading-8 ${key === "pro" ? "text-gold-bright/75" : "text-ink-soft"}`}>
                  {t.plans[key].feat.map((f) => (
                    <li key={f}>— {f}</li>
                  ))}
                </ul>
                {key === "pro" ? (
                  <PlanBuyButton
                    plan="pro"
                    className="link-edit mt-10 !text-gold-bright"
                  />
                ) : (
                  <TextLink href="/templates" className="mt-10">
                    {t.hero.cta2}
                  </TextLink>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
