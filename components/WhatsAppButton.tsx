"use client";

import { CUSTOM_DESIGN_WHATSAPP_NUMBER } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";

export function WhatsAppButton({ aboveNavigation = false }: { aboveNavigation?: boolean }) {
  const { locale } = useI18n();
  const label = locale === "ru" ? "Написать нам в WhatsApp" : "WhatsApp аркылуу жазыңыз";
  return (
    <a
      href={`https://wa.me/${CUSTOM_DESIGN_WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      data-export-hide
      className={`fixed right-[max(1rem,env(safe-area-inset-right))] z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_24px_#128c7e40] transition-colors hover:bg-[#1eae54] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#128C7E] print:hidden ${aboveNavigation ? "bottom-[calc(6rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]" : "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"}`}
    >
      <svg viewBox="0 0 24 24" className="size-8" fill="currentColor" aria-hidden="true">
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.46 0 .1 5.35.1 11.93c0 2.1.55 4.16 1.6 5.97L0 24l6.25-1.64a11.94 11.94 0 0 0 5.78 1.47h.01C18.62 23.83 24 18.48 24 11.9c0-3.19-1.24-6.18-3.48-8.42ZM12.04 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.46 4.44-9.9 9.91-9.9a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c0 5.45-4.45 9.87-9.93 9.87Zm5.44-7.4c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.77-1.65-2.07-.18-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.53.07-.8.37-.28.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.48 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
