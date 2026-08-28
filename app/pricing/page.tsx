"use client";

import { useEffect, useState } from "react";
import { PlanBuyButton } from "@/components/PlanBuyButton";
import { SiteShell } from "@/components/SiteShell";
import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { setPendingTemplate } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";

export default function PricingPage() {
  const { locale, t } = useI18n();
  const { templates, pricing } = useCatalog();
  const [from, setFrom] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("from") || "";
    if (id) setPendingTemplate(id);
    setFrom(id);
  }, []);

  const template = templates.find((item) => item.id === from);

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1400px] px-5 py-20">
        <p className="eyebrow">005</p>
        <h1 className="font-serif mt-6 text-center text-5xl uppercase sm:text-6xl">{t.pricingTitle}</h1>
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-7 tracking-wide text-ink-soft">{t.pricingSub}</p>
        <div className="mt-16 grid gap-10 md:grid-cols-2">
          <article className="py-10">
            <p className="text-[10px] uppercase tracking-[0.16em] text-meta">&nbsp;</p>
            <h2 className="font-serif mt-3 text-3xl uppercase">{t.plans.standard.name}</h2>
            <p className="font-serif mt-4 text-4xl">
              {template ? formatPrice(locale, template.priceSom) : t.plans.standard.priceHint}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-meta">{t.perInvite}</p>
            {template ? (
              <p className="mt-3 text-sm text-ink-soft">{template.name[locale]}</p>
            ) : null}
            <ul className="mt-8 space-y-2 text-sm leading-7 text-ink-soft">
              {t.plans.standard.feat.map((f) => (
                <li key={f}>— {f}</li>
              ))}
            </ul>
            <PlanBuyButton
              plan="standard"
              templateId={template?.id}
              className="mt-10 w-full py-3 text-center text-[11px] uppercase tracking-[0.16em] underline decoration-ink/20 underline-offset-4"
            />
          </article>
          <article className="bg-forest px-8 py-10 text-gold-bright">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#3f3833]">{t.popular}</p>
            <h2 className="font-serif mt-3 text-3xl uppercase">{t.plans.pro.name}</h2>
            <p className="font-serif mt-4 text-4xl">{formatPrice(locale, pricing.proPriceSom)}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#3f3833]">{t.perInvite}</p>
            <ul className="mt-8 space-y-2 text-sm leading-7 text-[#3f3833]">
              {t.plans.pro.feat.map((f) => (
                <li key={f}>— {f}</li>
              ))}
            </ul>
            <PlanBuyButton
              plan="pro"
              templateId={template?.id}
              className="mt-10 w-full bg-page py-3 text-center text-[11px] uppercase tracking-[0.16em] text-ink"
            />
          </article>
        </div>
      </div>
    </SiteShell>
  );
}
