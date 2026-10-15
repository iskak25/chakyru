"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { getTemplatePhotos } from "@/lib/templatePhotos";
import type { InvitationTemplate } from "@/lib/types";
import { referenceWedding } from "@/lib/referenceWeddings";
import { getPinterestDesign } from "@/lib/pinterestTemplates";
import { restoredTemplateImage, templateImageSource } from "@/lib/templateImageSources";
import { TemplatePaperPreview } from "@/components/TemplatePaperPreview";
import { getAnniversaryDesign } from "@/lib/anniversaryTemplates";
import { inviteFromTemplate } from "@/lib/templateCanvas";
import { AnniversaryHero } from "./AnniversaryHero";
import anniversaryCss from "./AnniversaryInvite.module.css";
import { TushooNavyThumb } from "./invite-families/TushooNavy";
import { CorporateThumb } from "./invite-families/Corporate";
import { getCollectionDesign } from "@/lib/collectionTemplates";
import { CollectionPreview } from "./CollectionInvite";

const LiveRenderer = dynamic(() => import("./TemplateRenderer").then(m => m.TemplateRenderer), { ssr: false });

/** Static (non-scrolling) full-invitation card as the collection previews, mounted only once the card is near the viewport. */
function LivePreview({ template, locale }: { template: InvitationTemplate; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { setNear(e.isIntersecting); }, { rootMargin: "250px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden bg-white" style={{ containerType: "inline-size" }}>
    {near ? <div style={{ width: 480, transformOrigin: "top left", transform: "scale(calc(100cqw / 480px))" }}>
      <LiveRenderer templateId={template.id} data={inviteFromTemplate(template)} locale={locale} startOpen />
    </div> : null}
  </div>;
}

/** Mounts children only while near the viewport. */
function InView({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "250px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className="aspect-[4/5] w-full">{near ? children : null}</div>;
}

export function TemplateCard({
  template,
  onUse,
  featured = false,
  eager = false,
}: {
  template: InvitationTemplate;
  onUse?: (id: string) => void;
  featured?: boolean;
  eager?: boolean;
}) {
  const { locale, t } = useI18n();
  const price = formatPrice(locale, template.priceSom);
  const name = template.name[locale];
  const photo = template.canvas?.gallery?.hero || template.canvas?.coverImage || getTemplatePhotos(template.id).hero;
  const reference = referenceWedding({ templateId: template.id, copy: template.canvas?.copy });
  const pinterest = getPinterestDesign({ templateId: template.id, copy: template.canvas?.copy });
  const crop = pinterest?.photos.hero || reference?.photos.hero;
  const restored = restoredTemplateImage(crop);
  const anniversary = getAnniversaryDesign({ templateId: template.id, copy: template.canvas?.copy });
  const event = t.events[template.eventTypes[0] ?? "wedding"];
  const collection = getCollectionDesign({ templateId: template.id, copy: template.canvas?.copy });

  const body = (
    <article
      className={`group relative overflow-hidden rounded-[var(--radius-xl)] bg-white transition duration-300 hover:-translate-y-1 ${
        featured ? "h-full min-h-[420px]" : ""
      }`}
      style={{ boxShadow: "var(--shadow-soft)", transitionTimingFunction: "var(--ease-premium)" }}
    >
      <div className={`relative overflow-hidden ${collection ? "" : featured ? "h-full min-h-[420px]" : "aspect-[4/5]"}`}>
        {collection ? <InView><CollectionPreview invitation={inviteFromTemplate(template)} design={collection} locale={locale} /></InView> : template.style.pageLayout === "corporate" ? <CorporateThumb name={template.canvas?.names || ""} theme={template.canvas?.copy?.["corp.theme"]} /> : template.style.pageLayout === "tushooNavy" ? <TushooNavyThumb name={template.canvas?.names || "Аят"} /> : anniversary ? <div className={`${anniversaryCss.root} ${anniversaryCss[anniversary.key]} ${anniversaryCss.preview}`} aria-hidden="true"><AnniversaryHero invitation={inviteFromTemplate(template)} design={anniversary} locale={locale} preview eager={eager} /></div> : template.id === "minimal-white" || pinterest?.key === "pearl" ? (
          <TemplatePaperPreview template={template} locale={locale} eager={eager} />
        ) : <img
          src={restored?.source || templateImageSource(crop?.source || photo)}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${crop ? "" : "group-hover:scale-[1.04]"}`}
          style={crop && !restored ? { position: "absolute", maxWidth: "none", width: `${crop.width / crop.w * 100}%`, height: `${crop.height / crop.h * 100}%`, left: `${-crop.x / crop.w * 100}%`, top: `${-crop.y / crop.h * 100}%`, objectFit: "fill", transitionTimingFunction: "var(--ease-premium)" } : { transitionTimingFunction: "var(--ease-premium)" }}
        />}
        {!collection && !onUse && <LivePreview template={template} locale={locale} />}
        {!collection && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />}
        <button
          type="button"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink/70 opacity-100 transition sm:right-4 sm:top-4 sm:h-9 sm:w-9 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={locale === "ru" ? "В избранное" : "Тандалмаларга"}
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={15} />
        </button>
        <div className={collection ? "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent p-5 pt-14" : "pointer-events-none absolute inset-x-0 bottom-0 p-5"}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">{event}</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <h3 className="font-serif text-[26px] leading-none tracking-[-0.02em] text-white">{name}</h3>
            <p className="text-[12px] text-white/90">{price}</p>
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/85 transition duration-300 sm:translate-y-2 sm:text-white/0 sm:group-hover:translate-y-0 sm:group-hover:text-white/85">
            {t.preview} →
          </p>
        </div>
      </div>
    </article>
  );

  if (onUse) {
    return (
      <button type="button" onClick={() => onUse(template.id)} className="block w-full text-left">
        {body}
      </button>
    );
  }

  return (
    <Link href={`/templates/${template.id}`} className="block">
      {body}
    </Link>
  );
}
