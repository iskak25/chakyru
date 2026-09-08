"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  FolderHeart,
  Home,
  LayoutTemplate,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/locale";
import { getUser } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { authHeaders } from "@/lib/accessClient";

const NAV = [
  { href: "/creativeads", key: "home" as const, icon: Home },
  { href: "/creativeads/templates", key: "templates" as const, icon: LayoutTemplate },
  { href: "/creativeads/my", key: "my" as const, icon: FolderHeart },
  { href: "/dashboard", key: "profile" as const, icon: UserRound },
];

export function CreativeAdsShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState<number | null | "∞">(null);
  const isHome = pathname === "/creativeads";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const headers = await authHeaders();
      if (!("authorization" in headers)) {
        if (!cancelled) setCredits(null);
        return;
      }
      const res = await fetch("/api/creativeads/credits", { headers, cache: "no-store" });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { credits?: number | null; unlimited?: boolean };
      if (cancelled) return;
      setCredits(data.unlimited ? "∞" : typeof data.credits === "number" ? data.credits : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const user = getUser();
  const labels = t.creativeAds.nav;

  if (isHome) {
    return <div className="creativeads min-h-screen bg-[#f3efe8] text-[var(--ca-ink)]">{children}</div>;
  }

  return (
    <div className="creativeads min-h-screen bg-[var(--ca-cream)] text-[var(--ca-ink)]">
      <div className="lg:flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[268px] bg-[var(--ca-espresso)] text-[var(--ca-cream)] transition-transform duration-300 lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col px-6 py-7">
            <div className="flex items-center justify-between">
              <Logo tone="cream" className="opacity-90 hover:opacity-100" />
              <button type="button" className="flex min-h-11 min-w-11 items-center justify-center lg:hidden" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="mt-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[var(--ca-gold)]">
              <Sparkles size={12} />
              CreativeAds
            </div>

            <nav className="mt-5 space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/creativeads"
                    ? pathname === "/creativeads"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition ${
                      active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.6} />
                    <span className="flex-1">{labels[item.key]}</span>
                    {item.key === "home" ? (
                      <span className="rounded-full bg-[var(--ca-gold)]/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[var(--ca-gold)]">
                        New
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{labels.credits}</p>
              <p className="mt-1 font-serif text-2xl text-white">{credits ?? "—"}</p>
              <p className="mt-3 truncate text-xs text-white/55">{user?.name || labels.guest}</p>
              <Link href="/templates" className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] text-[var(--ca-gold)]">
                {labels.back}
              </Link>
            </div>
          </div>
        </aside>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--ca-line)] bg-[var(--ca-cream)]/95 px-4 backdrop-blur sm:px-8 lg:hidden">
            <button type="button" className="flex min-h-11 min-w-11 items-center justify-center" onClick={() => setOpen(true)} aria-label="Menu">
              <Menu size={18} />
            </button>
            <span className="font-serif text-lg">CreativeAds</span>
            <span className="text-[11px] text-[var(--ca-muted)]">{credits ?? ""}</span>
          </header>
          <main className="mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
