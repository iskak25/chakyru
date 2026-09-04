"use client";

import { useEffect, useState } from "react";
import { PlanBuyButton } from "@/components/PlanBuyButton";
import { SiteShell } from "@/components/SiteShell";
import { fetchTemplateAccess } from "@/lib/accessClient";
import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { setPendingTemplate } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";

export default function PricingPage() {
  const { locale, t } = useI18n();
  const { templates, pricing } = useCatalog();
  const [from, setFrom] = useState("");
  const [userPrice, setUserPrice] = useState<number | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("from") || "";
    if (id) setPendingTemplate(id);
    setFrom(id);
    if (!id) return;
    void fetchTemplateAccess(id).then((access) => {
      if (typeof access?.price === "number") setUserPrice(access.price);
    });
  }, []);

  const template = templates.find((item) => item.id === from);

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:px-12 xl:px-16">
        <p className="label">005</p>
        <h1 className="font-serif mt-5 text-[40px] leading-[1.05] tracking-[-0.025em] sm:text-[60px]">{t.pricingTitle}</h1>
        <p className="mt-5 max-w-md text-[15px] leading-8 text-ink-soft">{t.pricingSub}</p>
        <div className="mt-14 grid gap-px bg-ink/10 md:grid-cols-2">
          <article className="bg-page px-6 py-10 sm:px-10 sm:py-14">
            <h2 className="font-serif text-[34px] leading-none tracking-[-0.02em] sm:text-[40px]">{t.plans.standard.name}</h2>
            <p className="font-serif mt-6 text-[40px] leading-none">
              {template ? formatPrice(locale, userPrice ?? template.priceSom) : t.plans.standard.priceHint}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-meta">{t.perInvite}</p>
            {template ? (
              <p className="mt-3 text-[15px] text-ink-soft">{template.name[locale]}</p>
            ) : null}
            <ul className="mt-8 space-y-2 text-[15px] leading-8 text-ink-soft">
              {t.plans.standard.feat.map((f) => (
                <li key={f}>— {f}</li>
              ))}
            </ul>
            <PlanBuyButton
              plan="standard"
              templateId={template?.id}
              className="link-edit mt-10"
            />
          </article>
          <article className="bg-forest px-6 py-10 text-gold-bright sm:px-10 sm:py-14">
            <p className="text-[10px] uppercase tracking-[0.16em] text-gold-bright/55">{t.popular}</p>
            <h2 className="font-serif mt-3 text-[34px] leading-none tracking-[-0.02em] sm:text-[40px]">{t.plans.pro.name}</h2>
            <p className="font-serif mt-6 text-[40px] leading-none">{formatPrice(locale, pricing.proPriceSom)}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-gold-bright/55">{t.perInvite}</p>
            <ul className="mt-8 space-y-2 text-[15px] leading-8 text-gold-bright/75">
              {t.plans.pro.feat.map((f) => (
                <li key={f}>— {f}</li>
              ))}
            </ul>
            <PlanBuyButton
              plan="pro"
              templateId={template?.id}
              className="link-edit mt-10 !text-gold-bright"
            />
          </article>
        </div>
      </div>
    </SiteShell>
  );
}
