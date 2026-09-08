"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Heart,
  Home,
  LayoutTemplate,
  LogOut,
  MapPin,
  Music2,
  UserRound,
  Images,
  Users,
} from "lucide-react";
import { locales } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { getUser, logout } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { User } from "@/lib/types";
import { Logo } from "@/components/Logo";

const APP_NAV = [
  { href: "/", key: "home", icon: Home },
  { href: "/templates", key: "templates", icon: LayoutTemplate },
  { href: "/dashboard", key: "mine", icon: Heart },
  { href: "/pricing", key: "pricing", icon: MapPin },
  { href: "/learn", key: "learn", icon: Music2 },
] as const;

function navLabel(t: ReturnType<typeof useI18n>["t"], key: (typeof APP_NAV)[number]["key"]) {
  if (key === "home") return t.nav.studio;
  if (key === "templates") return t.nav.templates;
  if (key === "mine") return t.nav.mine;
  if (key === "pricing") return t.nav.pricing;
  return t.nav.learn;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { locale, t, setLocale } = useI18n();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, []);

  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="lg:flex">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] bg-espresso text-cream lg:flex lg:flex-col">
          <div className="flex h-full flex-col px-5 py-7">
            <Logo tone="cream" className="px-2 opacity-95 transition hover:opacity-100" />

            <nav className="mt-10 space-y-1">
              {APP_NAV.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] transition duration-250 ${
                      active
                        ? "bg-[rgba(245,245,245,0.12)] text-cream"
                        : "text-cream/65 hover:bg-white/5 hover:text-cream"
                    }`}
                    style={{ transitionTimingFunction: "var(--ease-premium)" }}
                  >
                    <Icon size={16} strokeWidth={1.6} />
                    <span>{navLabel(t, item.key)}</span>
                  </Link>
                );
              })}
              {isAdmin(user) ? (
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] transition ${
                    pathname.startsWith("/admin")
                      ? "bg-[rgba(245,245,245,0.12)] text-cream"
                      : "text-cream/65 hover:bg-white/5 hover:text-cream"
                  }`}
                >
                  <Images size={16} strokeWidth={1.6} />
                  <span>{t.nav.admin}</span>
                </Link>
              ) : null}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-5">
              <div className="mb-4 flex gap-2 px-1">
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
                    onClick={() => logout()}
                    className="text-cream/45 transition hover:text-cream"
                    aria-label={t.nav.logout}
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login?google=1"
                  className="flex items-center gap-3 rounded-[14px] bg-white/5 px-3 py-3 text-[13px] text-cream/80 transition hover:bg-white/8 hover:text-cream"
                >
                  <UserRound size={16} />
                  {t.nav.login}
                </Link>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 lg:pl-[248px]">
          <main className="mx-auto w-full max-w-[1520px] px-4 pb-24 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pb-12 lg:pt-10">
            {children}
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-page/95 px-2 pt-2 backdrop-blur lg:hidden" style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex min-h-11 max-w-lg items-center justify-between">
          {[
            { href: "/", icon: Home, label: t.nav.studio },
            { href: "/templates", icon: LayoutTemplate, label: t.nav.templates },
            { href: "/dashboard", icon: Heart, label: t.nav.mine },
            { href: user ? "/dashboard" : "/login?google=1", icon: Users, label: t.nav.login },
            { href: "/pricing", icon: UserRound, label: t.nav.pricing },
          ].map((item) => {
            const Icon = item.icon;
            const active = item.href !== "/login?google=1" && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`flex min-h-11 min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[10px] tracking-wide ${
                  active ? "text-ink" : "text-meta"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 1.8 : 1.5} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col items-start gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--gold)]">{eyebrow}</p> : null}
        <h1 className="font-serif mt-3 max-w-[14ch] text-[clamp(2.25rem,10vw,3rem)] font-normal leading-[1.02] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
          {title}
        </h1>
        {description ? <p className="mt-4 max-w-[42ch] text-[15px] leading-7 text-ink-soft">{description}</p> : null}
      </div>
      {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
    </div>
  );
}
