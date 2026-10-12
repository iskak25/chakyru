"use client";

import { useEffect, useState } from "react";
import { PlanBuyButton } from "@/components/PlanBuyButton";
import { SiteShell } from "@/components/SiteShell";
import { PageHeader } from "@/components/app/AppShell";
import { fetchTemplateAccess } from "@/lib/accessClient";
import { buildCustomOfferMessage, CUSTOM_DESIGN_PRICE_SOM, CUSTOM_DESIGN_WHATSAPP_NUMBER, formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { setPendingTemplate } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";

export default function PricingPage() {
  const { locale, t } = useI18n();
  const { templates, pricing } = useCatalog();
  const [from, setFrom] = useState("");
  const [userPrice, setUserPrice] = useState<number | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("from") || "";
    setOrigin(window.location.origin);
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
      <PageHeader eyebrow="005" title={t.pricingTitle} description={t.pricingSub} />

      <div className="grid gap-5">
        <article className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-7 sm:p-10" style={{ boxShadow: "var(--shadow-soft)" }}>
          <h2 className="font-serif text-[34px] tracking-[-0.02em] sm:text-[40px]">{t.plans.standard.name}</h2>
          <p className="font-serif mt-6 text-[40px] leading-none">
            {template ? formatPrice(locale, userPrice ?? template.priceSom) : t.plans.standard.priceHint}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-meta">{t.perInvite}</p>
          {template ? <p className="mt-3 text-[15px] text-ink-soft">{template.name[locale]}</p> : null}
          <ul className="mt-8 space-y-2 text-[15px] leading-8 text-ink-soft">
            {t.plans.standard.feat.map((f) => (
              <li key={f}>— {f}</li>
            ))}
          </ul>
          <PlanBuyButton plan="standard" templateId={template?.id} className="mt-10 inline-flex min-h-12 w-full items-center justify-center rounded-[12px] bg-espresso px-5 text-[11px] uppercase tracking-[0.14em] text-cream" />
        </article>
      </div>

      <article className="mt-5 rounded-[var(--radius-xl)] border border-[var(--gold)]/40 bg-white p-7 sm:p-10" style={{ boxShadow: "var(--shadow-soft)" }}>
        <h2 className="font-serif text-[26px] tracking-[-0.02em] sm:text-[30px]">{t.customOffer.title}</h2>
        <p className="mt-4 text-[15px] leading-7 text-ink-soft">{t.customOffer.desc}</p>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">{t.customOffer.descMore}</p>
        <p className="mt-5 text-[15px] text-ink-soft">
          {t.customOffer.priceLabel} <span className="font-serif text-[20px] text-ink">{formatPrice(locale, CUSTOM_DESIGN_PRICE_SOM)}</span>
        </p>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">{t.customOffer.after}</p>
        <a
          href={`https://wa.me/${CUSTOM_DESIGN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
            buildCustomOfferMessage(
              locale,
              template?.name[locale],
              template ? `${origin}/templates/${template.id}` : undefined
            )
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-[12px] bg-espresso px-5 text-center text-[11px] uppercase tracking-[0.14em] text-cream sm:w-auto"
        >
          {t.customOffer.cta} — {formatPrice(locale, CUSTOM_DESIGN_PRICE_SOM)}
        </a>
      </article>
    </SiteShell>
  );
}
