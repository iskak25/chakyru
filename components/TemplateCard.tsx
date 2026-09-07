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
  date: "2026-10-06",
  time: "18:00",
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
        {/* side buttons */}
        <span className="pointer-events-none absolute -left-[2px] top-[18%] z-10 h-6 w-[2px] rounded-l-sm bg-[#2a2a2c]" />
        <span className="pointer-events-none absolute -left-[2px] top-[28%] z-10 h-10 w-[2px] rounded-l-sm bg-[#2a2a2c]" />
        <span className="pointer-events-none absolute -left-[2px] top-[42%] z-10 h-10 w-[2px] rounded-l-sm bg-[#2a2a2c]" />
        <span className="pointer-events-none absolute -right-[2px] top-[32%] z-10 h-14 w-[2px] rounded-r-sm bg-[#2a2a2c]" />

        <div className="relative rounded-[1.85rem] bg-gradient-to-b from-[#3a3a3c] via-[#1c1c1e] to-[#0b0b0c] p-[1.5px] shadow-[0_14px_32px_rgba(26,28,25,0.2)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_40px_rgba(26,28,25,0.28)]">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-black p-[5px]">
            {/* Dynamic Island */}
            <div className="pointer-events-none absolute left-1/2 top-[8px] z-30 flex h-[17px] w-[72px] -translate-x-1/2 items-center justify-center rounded-full bg-black">
              <span className="absolute right-[14px] h-[6px] w-[6px] rounded-full bg-[#1a1a1c] ring-1 ring-[#2c2c2e]" />
            </div>

            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.45rem] bg-[#fafafa]">
              <FormatInvite
                compact
                locale={locale}
                invitation={{
                  ...previewBase,
                  templateId: template.id,
                  music: template.format !== "photo",
                }}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 pt-7">
                <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  18:00
                </span>
                <span className="rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold text-[#161616]">
                  {price}
                </span>
              </div>
              <div className="pointer-events-none absolute bottom-5 left-3">
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

            {/* home indicator */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[5px] z-30 flex justify-center">
              <span className="h-[3px] w-[32%] max-w-[88px] rounded-full bg-white/35" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <h3 className="font-serif text-[22px] leading-tight tracking-[-0.02em]">{name}</h3>
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
