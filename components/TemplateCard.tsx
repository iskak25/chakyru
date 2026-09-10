"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { getTemplatePhotos } from "@/lib/templatePhotos";
import type { InvitationTemplate } from "@/lib/types";
import { referenceWedding } from "@/lib/referenceWeddings";
import { getPinterestDesign } from "@/lib/pinterestTemplates";

export function TemplateCard({
  template,
  onUse,
  featured = false,
}: {
  template: InvitationTemplate;
  onUse?: (id: string) => void;
  featured?: boolean;
}) {
  const { locale, t } = useI18n();
  const price = formatPrice(locale, template.priceSom);
  const name = template.name[locale];
  const photo = getTemplatePhotos(template.id).hero;
  const reference = referenceWedding({ templateId: template.id, copy: template.canvas?.copy });
  const pinterest = getPinterestDesign({ templateId: template.id, copy: template.canvas?.copy });
  const crop = pinterest?.photos.hero || reference?.photos.hero;
  const event = t.events[template.eventTypes[0] ?? "wedding"];

  const body = (
    <article
      className={`group relative overflow-hidden rounded-[var(--radius-xl)] bg-white transition duration-300 hover:-translate-y-1 ${
        featured ? "h-full min-h-[420px]" : ""
      }`}
      style={{ boxShadow: "var(--shadow-soft)", transitionTimingFunction: "var(--ease-premium)" }}
    >
      <div className={`relative overflow-hidden ${featured ? "h-full min-h-[420px]" : "aspect-[4/5]"}`}>
        <img
          src={crop?.source || photo}
          alt=""
          className={`h-full w-full object-cover transition duration-700 ${crop ? "" : "group-hover:scale-[1.04]"}`}
          style={crop ? { position: "absolute", maxWidth: "none", width: `${crop.width / crop.w * 100}%`, height: `${crop.height / crop.h * 100}%`, left: `${-crop.x / crop.w * 100}%`, top: `${-crop.y / crop.h * 100}%`, objectFit: "fill", transitionTimingFunction: "var(--ease-premium)" } : { transitionTimingFunction: "var(--ease-premium)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <button
          type="button"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink/70 opacity-100 transition sm:right-4 sm:top-4 sm:h-9 sm:w-9 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Favorite"
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={15} />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-5">
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
