"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { locales } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { logout, getUser } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { User } from "@/lib/types";
import { Logo } from "./Logo";

export function Header() {
  const { locale, t, setLocale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const isHome = pathname === "/";
  const overHero = isHome && !scrolled && !open;
  const tone = overHero ? "cream" : "ink";

  useEffect(() => {
    const sync = () => setUserState(getUser());
    sync();
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = [
    { href: "/#how", label: t.nav.how },
    { href: "/templates", label: t.nav.templates },
    { href: "/learn", label: t.nav.learn },
    { href: "/pricing", label: t.nav.pricing },
    ...(isAdmin(user) ? [{ href: "/admin", label: t.nav.admin }] : []),
  ];

  return (
    <>
      <header
        className={`z-50 transition-colors duration-500 ${
          isHome ? "fixed inset-x-0 top-0" : "sticky top-0"
        } ${overHero ? "over-hero bg-transparent text-gold-bright" : "bg-page/95 text-ink"}`}
      >
        <div className="relative mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:h-[88px] sm:px-8 lg:px-12 xl:px-16">
          <button
            type="button"
            className={`text-[10px] uppercase tracking-[0.32em] transition-opacity duration-200 hover:opacity-50 ${
              overHero ? "text-gold-bright" : ""
            }`}
            onClick={() => setOpen(true)}
          >
            Menu
          </button>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Logo tone={tone} />
          </div>

          <div className="flex items-center gap-5 sm:gap-7">
            <div className="hidden gap-3 sm:flex">
              {locales.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLocale(item.code)}
                  className={`label transition-opacity duration-200 hover:opacity-55 ${
                    locale === item.code ? "opacity-100" : "opacity-50"
                  } ${overHero ? "text-gold-bright" : ""}`}
                >
                  {item.code}
                </button>
              ))}
            </div>
            <Link
              href="/templates"
              className={`hidden text-[10px] uppercase tracking-[0.32em] transition-opacity duration-200 hover:opacity-50 md:inline ${
                overHero ? "text-gold-bright" : ""
              }`}
            >
              Book
            </Link>
          </div>
        </div>
        {!overHero ? <div className="h-px bg-ink/10" /> : null}
      </header>

      {open ? (
        <div className="menu-fade fixed inset-0 z-[80] flex flex-col bg-page text-ink">
          <div className="relative mx-auto flex h-[76px] w-full max-w-[1320px] items-center justify-between px-5 sm:h-[88px] sm:px-8 lg:px-12 xl:px-16">
            <button
              type="button"
              className="label hover:opacity-55"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
            <Logo onClick={() => setOpen(false)} />
            <span className="label w-10" />
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-serif py-2 text-center text-[40px] italic leading-none tracking-[-0.02em] transition-opacity duration-300 hover:opacity-40 sm:text-[56px] lg:text-[64px]"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="font-serif py-2 text-center text-[40px] italic leading-none tracking-[-0.02em] transition-opacity duration-300 hover:opacity-40 sm:text-[56px]"
                >
                  {t.nav.mine}
                </Link>
                <button
                  type="button"
                  className="font-serif py-2 text-center text-[40px] italic leading-none tracking-[-0.02em] transition-opacity duration-300 hover:opacity-40 sm:text-[56px]"
                  onClick={() => {
                    void logout();
                    setOpen(false);
                  }}
                >
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="font-serif py-2 text-center text-[40px] italic leading-none tracking-[-0.02em] transition-opacity duration-300 hover:opacity-40 sm:text-[56px]"
              >
                {t.nav.login}
              </Link>
            )}
            <div className="mt-12 flex justify-center gap-6">
              {locales.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLocale(item.code)}
                  className={`label ${locale === item.code ? "text-ink" : "text-meta"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
