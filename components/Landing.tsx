"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { demoInvitation, getInvitation } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";
import { FormatInvite } from "./FormatInvite";
import { PlanBuyButton } from "./PlanBuyButton";
import type { Invitation } from "@/lib/types";

const HERO_WIDE = "/images/hero-toi.jpg";
const SHOWCASE_ID = "47cbb465-dc98-482a-b025-a0f4b04688fd";

function loadShowcase(): Invitation {
  return getInvitation(SHOWCASE_ID) ?? { ...demoInvitation, templateId: "ak-shumkar" };
}

export function Landing() {
  const { locale, t } = useI18n();
  const { pricing } = useCatalog();
  const [inv, setInv] = useState<Invitation | null>(null);

  function reload() {
    setInv(loadShowcase());
  }

  useEffect(() => {
    reload();
    window.addEventListener("chakyru-sync", reload);
    return () => window.removeEventListener("chakyru-sync", reload);
  }, []);

  return (
    <article className="bg-page">
      <div className="h-[42vh] min-h-[240px] w-full overflow-hidden sm:h-[56vh]">
        <img
          src={HERO_WIDE}
          alt=""
          className="h-full w-full object-cover object-[center_42%]"
        />
      </div>

      <div className="mx-auto grid max-w-[1400px] items-start gap-10 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <h2 className="font-serif max-w-xl text-4xl uppercase leading-[1.05] sm:text-6xl">
          {t.featuresTitle}
        </h2>
        <div className="relative lg:pt-4">
          <Link
            href="/templates"
            className="absolute -top-6 right-0 flex h-16 w-16 items-center justify-center rounded-full bg-menu text-gold-bright transition-transform duration-200 hover:scale-105 lg:-top-10"
            aria-label={t.nav.templates}
          >
            <Camera size={20} strokeWidth={1.4} />
          </Link>
          <p className="max-w-sm text-[11px] uppercase leading-7 tracking-[0.14em] text-ink-soft">
            {t.hero.desc}
          </p>
          <p className="mt-6 max-w-sm text-[11px] uppercase leading-7 tracking-[0.14em] text-ink-soft">
            {t.featuresSub}
          </p>
          <Link
            href="/templates"
            className="mt-8 inline-block text-[11px] uppercase tracking-[0.16em] text-meta underline underline-offset-4 transition-colors duration-200 hover:text-ink"
          >
            {t.hero.cta}
          </Link>
        </div>
      </div>

      <p className="mx-auto max-w-[1400px] px-5 pb-24 text-right font-serif text-3xl uppercase leading-[1.08] sm:text-5xl">
        {t.learn.title}
      </p>

      <section className="bg-page px-4 py-12 sm:px-5 sm:py-16">
        <div className="relative mx-auto w-full max-w-[390px] rounded-[2.75rem] border-[11px] border-[#1c1c1c] bg-white shadow-[0_28px_80px_rgba(0,0,0,0.5)]">
          <div className="pointer-events-none absolute left-1/2 top-0 z-20 flex h-[26px] w-[118px] -translate-x-1/2 items-center justify-center rounded-b-[14px] bg-[#1c1c1c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2e2e2e]" />
          </div>
          <div className="overflow-hidden rounded-[1.95rem] bg-white">
            {inv ? (
              <FormatInvite invitation={inv} locale={locale} onReload={reload} />
            ) : (
              <div className="min-h-[480px] bg-white" />
            )}
          </div>
        </div>
        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.28em] text-meta">
          42.87°N — 74.59°E
        </p>
      </section>

      <section id="how" className="mx-auto max-w-[1400px] px-5 py-28">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <h2 className="font-serif max-w-md text-4xl uppercase leading-[1.05] sm:text-6xl">{t.howTitle}</h2>
          <div>
            {t.how.map((step, i) => (
              <article key={step.n} className="flex gap-6 border-b border-ink/10 py-8 first:pt-0">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/30 text-[11px]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[12px] uppercase tracking-[0.16em]">{step.t}</h3>
                  <p className="mt-3 max-w-md text-[11px] uppercase leading-7 tracking-[0.12em] text-ink-soft">{step.d}</p>
                  <Link
                    href="/templates"
                    className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] text-meta underline underline-offset-4 transition-colors duration-200 hover:text-ink"
                  >
                    {t.hero.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-28">
        <p className="eyebrow">005</p>
        <h2 className="font-serif mt-6 text-center text-4xl uppercase sm:text-6xl">{t.pricingTitle}</h2>
        <p className="mx-auto mt-4 max-w-md text-center text-[11px] uppercase leading-7 tracking-[0.14em] text-ink-soft">
          {t.pricingSub}
        </p>
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          {(
            [
              ["standard", false],
              ["pro", true],
            ] as const
          ).map(([key]) => (
            <article key={key} className="py-4">
              <h3 className="font-serif text-3xl uppercase">{t.plans[key].name}</h3>
              <p className="font-serif mt-4 text-4xl">
                {key === "pro" ? formatPrice(locale, pricing.proPriceSom) : t.plans.standard.priceHint}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-meta">{t.perInvite}</p>
              <ul className="mt-8 space-y-2 text-[11px] uppercase leading-7 tracking-[0.08em] text-ink-soft">
                {t.plans[key].feat.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
              {key === "pro" ? (
                <PlanBuyButton
                  plan="pro"
                  className="mt-10 text-left text-[11px] uppercase tracking-[0.16em] underline decoration-ink/20 underline-offset-4"
                />
              ) : (
                <Link
                  href="/templates"
                  className="mt-10 inline-block text-left text-[11px] uppercase tracking-[0.16em] underline decoration-ink/20 underline-offset-4"
                >
                  {t.hero.cta2}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-28">
        <p className="eyebrow">006</p>
        <h2 className="font-serif mt-6 text-center text-4xl uppercase sm:text-5xl">{t.faqTitle}</h2>
        <div className="mt-12">
          {t.faq.map((item) => (
            <details key={item.q} className="border-b border-ink/10 py-5">
              <summary className="font-serif cursor-pointer text-xl uppercase">{item.q}</summary>
              <p className="mt-3 max-w-md text-[11px] uppercase leading-7 tracking-[0.12em] text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </article>
  );
}
