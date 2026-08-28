"use client";

import Link from "next/link";
import { useI18n } from "@/lib/locale";
import { Logo } from "./Logo";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto bg-page">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 sm:grid-cols-4">
        <div>
          <p className="label">{t.footer.product}</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-meta">
            <Link href="/templates" className="transition-colors duration-200 hover:text-ink">
              {t.nav.templates}
            </Link>
            <Link href="/learn" className="transition-colors duration-200 hover:text-ink">
              {t.nav.learn}
            </Link>
            <Link href="/pricing" className="transition-colors duration-200 hover:text-ink">
              {t.nav.pricing}
            </Link>
            <Link href="/dashboard" className="transition-colors duration-200 hover:text-ink">
              {t.nav.mine}
            </Link>
          </div>
        </div>
        <div>
          <p className="label">{t.footer.contacts}</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-meta">
            <a href="https://wa.me/996555000000" className="transition-colors duration-200 hover:text-ink">
              WhatsApp
            </a>
            <a href="https://instagram.com" className="transition-colors duration-200 hover:text-ink">
              Instagram
            </a>
            <a href="mailto:hello@chakyru.app" className="transition-colors duration-200 hover:text-ink">
              hello@chakyru.app
            </a>
          </div>
        </div>
        <div className="flex flex-col items-start sm:col-span-2 sm:items-end">
          <Logo className="h-28 w-auto" />
          <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-meta">{t.tagline}</p>
        </div>
      </div>
      <div className="border-t border-ink/10 py-5 text-center text-[10px] uppercase tracking-[0.16em] text-meta">
        {t.footer.copy}
      </div>
    </footer>
  );
}
