"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { locales } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { logout, getUser } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { User } from "@/lib/types";
import { Logo } from "./Logo";

export function Header() {
  const { locale, t, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const sync = () => setUserState(getUser());
    sync();
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
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
      <header className="sticky top-0 z-50 bg-page/80">
        <div className="relative mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5">
          <button
            type="button"
            className="label transition-colors duration-200 hover:text-ink"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Logo className="h-16 w-auto" />
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden gap-3 sm:flex">
              {locales.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLocale(item.code)}
                  className={`label transition-colors duration-200 ${locale === item.code ? "text-ink" : "hover:text-ink"}`}
                >
                  {item.code}
                </button>
              ))}
            </div>
            {user ? (
              <Link href="/dashboard" className="label hidden transition-colors duration-200 hover:text-ink md:inline">
                {t.nav.mine}
              </Link>
            ) : (
              <Link href="/login" className="label hidden transition-colors duration-200 hover:text-ink md:inline">
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="menu-drawer relative flex h-full w-[30vw] min-w-[17rem] flex-col bg-menu text-gold-bright shadow-[8px_0_40px_rgba(0,0,0,0.28)]">
            <div className="flex h-20 shrink-0 items-center px-6">
              <button
                type="button"
                className="text-[10px] uppercase tracking-[0.14em] text-[#5c5148] transition-colors duration-200 hover:text-gold-bright"
                onClick={() => setOpen(false)}
              >
                Menu
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center px-6 pb-10">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-serif border-b border-[#8c7b6c] py-4 text-center text-[22px] uppercase leading-tight tracking-[0.08em] sm:text-[26px]"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <button
                  type="button"
                  className="font-serif border-b border-[#8c7b6c] py-4 text-center text-[22px] uppercase leading-tight tracking-[0.08em] sm:text-[26px]"
                  onClick={() => {
                    void logout();
                    setOpen(false);
                  }}
                >
                  {t.nav.logout}
                </button>
              ) : null}
              <div className="mt-8 flex justify-center gap-5">
                {locales.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLocale(item.code)}
                    className={`text-[10px] uppercase tracking-[0.16em] ${locale === item.code ? "text-gold-bright" : "text-[#5c5148]"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
