"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Images, LogOut, UserRound, X } from "lucide-react";
import { locales } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { logout, getUser } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { User } from "@/lib/types";
import { APP_NAV, navLabel } from "./app/AppShell";
import { Logo } from "./Logo";

const menuRow = "flex items-center gap-3 rounded-[12px] px-3 py-3 text-[14px] transition";
const menuRowActive = "bg-[rgba(245,245,245,0.12)] text-cream";
const menuRowIdle = "text-cream/65 hover:bg-white/5 hover:text-cream";

export function Header() {
  const { locale, t, setLocale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const isHome = pathname === "/";
  const overHero = isHome && !scrolled && !open;
  const tone = "ink";

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

  return (
    <>
      <header
        className={`z-50 transition-colors duration-500 ${
          isHome ? "fixed inset-x-0 top-0" : "sticky top-0"
        } ${overHero ? "over-hero bg-transparent text-ink" : "bg-page/95 text-ink"}`}
      >
        <div className="relative mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:h-[88px] sm:px-8 lg:px-12 xl:px-16">
          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-start text-[10px] uppercase tracking-[0.32em] transition-opacity duration-200 hover:opacity-50"
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
                  }`}
                >
                  {item.code}
                </button>
              ))}
            </div>
            <Link
              href="/templates"
              className="hidden text-[10px] uppercase tracking-[0.32em] transition-opacity duration-200 hover:opacity-50 md:inline"
            >
              Book
            </Link>
          </div>
        </div>
        {!overHero ? <div className="h-px bg-ink/10" /> : null}
      </header>

      {open ? (
        <>
          <div
            className="menu-fade fixed inset-0 z-80 bg-black/45"
            onClick={() => setOpen(false)}
          />
          <div className="menu-drawer fixed inset-y-0 left-0 z-85 flex w-1/5 min-w-65 max-w-[320px] flex-col overflow-y-auto bg-espresso pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-cream">
          <div className="flex items-center justify-between px-5 py-5">
            <Logo tone="cream" onClick={() => setOpen(false)} />
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center text-cream/70 transition hover:text-cream"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="mt-4 flex flex-1 flex-col gap-1 px-4">
            {APP_NAV.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`${menuRow} ${active ? menuRowActive : menuRowIdle}`}
                >
                  <Icon size={17} strokeWidth={1.6} />
                  <span>{navLabel(t, item.key)}</span>
                </Link>
              );
            })}
            {isAdmin(user) ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={`${menuRow} ${pathname.startsWith("/admin") ? menuRowActive : menuRowIdle}`}
              >
                <Images size={17} strokeWidth={1.6} />
                <span>{t.nav.admin}</span>
              </Link>
            ) : null}
          </nav>

          <div className="mx-auto w-full max-w-sm px-6 pb-8">
            <div className="mb-4 flex gap-3">
              {locales.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLocale(item.code)}
                  className={`text-[10px] uppercase tracking-[0.18em] ${
                    locale === item.code ? "text-[var(--gold)]" : "text-cream/40 hover:text-cream/70"
                  }`}
                >
                  {item.code}
                </button>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4">
              {user ? (
                <div className="flex items-center gap-3 rounded-[14px] bg-white/5 px-3 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gold)]/25 text-[11px] uppercase tracking-wide text-[var(--gold)]">
                    {user.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-cream">{user.name}</p>
                    <p className="truncate text-[11px] text-cream/45">{user.email || t.nav.mine}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void logout();
                      setOpen(false);
                    }}
                    className="text-cream/45 transition hover:text-cream"
                    aria-label={t.nav.logout}
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login?google=1"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-[14px] bg-white/5 px-3 py-3 text-[13px] text-cream/80 transition hover:bg-white/8 hover:text-cream"
                >
                  <UserRound size={16} />
                  {t.nav.login}
                </Link>
              )}
            </div>
          </div>
          </div>
        </>
      ) : null}
    </>
  );
}
