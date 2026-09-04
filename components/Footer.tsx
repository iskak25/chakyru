"use client";

import Link from "next/link";
import { useI18n } from "@/lib/locale";
import { Logo } from "./Logo";
import { Container } from "./ui/Container";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto bg-page">
      <div className="h-px bg-ink/10" />
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col items-center text-center">
          <Logo href="/" />
          <p className="font-serif mx-auto mt-8 max-w-[22ch] text-[28px] leading-[1.15] tracking-[-0.02em] text-ink sm:text-[36px]">
            <em className="italic">{t.tagline}</em>
          </p>
          <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-meta">{t.place}</p>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          <Link href="/templates" className="transition-opacity duration-200 hover:opacity-50">
            {t.nav.templates}
          </Link>
          <Link href="/learn" className="transition-opacity duration-200 hover:opacity-50">
            {t.nav.learn}
          </Link>
          <Link href="/pricing" className="transition-opacity duration-200 hover:opacity-50">
            {t.nav.pricing}
          </Link>
          <Link href="/dashboard" className="transition-opacity duration-200 hover:opacity-50">
            {t.nav.mine}
          </Link>
          <a href="https://wa.me/996555000000" className="transition-opacity duration-200 hover:opacity-50">
            WhatsApp
          </a>
          <a href="https://instagram.com" className="transition-opacity duration-200 hover:opacity-50">
            Instagram
          </a>
        </div>
      </Container>
      <div className="border-t border-ink/10 py-5 text-center text-[10px] uppercase tracking-[0.22em] text-meta">
        {t.footer.copy}
      </div>
    </footer>
  );
}
