"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import type { InvitationTemplate } from "@/lib/types";
import { FormatInvite } from "./FormatInvite";

const previewBase = {
  id: "preview",
  eventType: "toi" as const,
  names: "Манас & Каныкей",
  hosts: "",
  date: "2012-12-12",
  time: "17:00",
  venue: "«Ала-Тоо»",
  address: "Ресторанный комплекс",
  city: "Бишкек",
  message: "",
  dressCode: "",
  adultsOnly: false,
  music: true,
  musicUrl: "",
  mapUrl: "https://go.2gis.com/41Efw",
  voiceText: "",
  voiceUrl: "",
  coverImage: "",
  layout: {},
  extras: [],
  blockColors: {},
  createdAt: "",
  guests: [],
  wishes: [],
};

export function TemplateCard({
  template,
  onUse,
}: {
  template: InvitationTemplate;
  onUse?: (id: string) => void;
}) {
  const { locale, t } = useI18n();
  const price = formatPrice(locale, template.priceSom);
  const name = template.name[locale];

  const action = (
    <>
      <div className="relative mx-auto w-full max-w-[240px]">
        <div className="overflow-hidden border-[8px] border-[#161616] bg-black">
          <div className="absolute left-1/2 top-1.5 z-20 h-3 w-16 -translate-x-1/2 rounded-full bg-[#161616]" />
          <div className="relative aspect-[9/16] overflow-hidden">
            <FormatInvite
              compact
              locale={locale}
              invitation={{
                ...previewBase,
                templateId: template.id,
                music: template.format !== "photo",
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 pt-5">
              <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                18:00
              </span>
              <span className="rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold text-[#161616]">
                {price}
              </span>
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3">
              <span className="rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                {t.formats[template.format]}
              </span>
            </div>
            {template.format === "videoMusic" || template.format === "videoVoice" ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#161616] shadow-lg">
                  <Play size={18} fill="currentColor" />
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <h3 className="font-serif text-xl uppercase leading-tight">{name}</h3>
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-meta">{t.preview}</p>
      </div>
    </>
  );

  if (onUse) {
    return (
      <button
        type="button"
        onClick={() => onUse(template.id)}
        className="group w-full text-left"
      >
        {action}
      </button>
    );
  }

  return (
    <Link href={`/templates/${template.id}`} className="group block">
      {action}
    </Link>
  );
}
