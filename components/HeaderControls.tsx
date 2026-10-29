"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronDown, UserRound } from "lucide-react";
import { locales } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { getUser } from "@/lib/store";
import type { User } from "@/lib/types";

/** Язык и профиль для правого угла шапки: видны на любом экране. Гость: вход через Google; вошедший: «Мои приглашения». */
export function HeaderControls({ className = "" }: { className?: string }) {
  const { locale, t, setLocale } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="relative">
        <button
          type="button"
          aria-label={locale === "ru" ? "Язык" : "Тил"}
          aria-haspopup="listbox"
          aria-expanded={menu}
          onClick={() => setMenu(v => !v)}
          className="flex h-11 items-center gap-1 rounded-full px-3 text-[12px] font-medium uppercase tracking-[0.12em] text-ink transition active:bg-ink/5"
        >
          {locale}
          <ChevronDown size={13} strokeWidth={2} className={`opacity-50 transition-transform ${menu ? "rotate-180" : ""}`} />
        </button>
        {menu ? (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
            <ul role="listbox" className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-2xl bg-white py-1 text-ink shadow-[0_12px_32px_rgba(15,12,10,0.16)] ring-1 ring-black/5">
              {locales.map(item => (
                <li key={item.code} role="option" aria-selected={locale === item.code}>
                  <button
                    type="button"
                    onClick={() => { setLocale(item.code); setMenu(false); }}
                    className={`flex h-11 w-full items-center gap-2 px-4 text-left text-sm ${locale === item.code ? "font-medium" : "text-ink-soft"}`}
                  >
                    <span aria-hidden>{item.flag}</span>
                    <span className="flex-1">{item.label}</span>
                    {locale === item.code ? <Check size={15} strokeWidth={2} /> : null}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
      <Link
        href={user ? "/dashboard" : "/login?google=1"}
        aria-label={user ? t.nav.mine : t.nav.login}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/[0.07] text-[13px] font-medium uppercase text-ink transition active:bg-ink/15"
      >
        {user ? user.name.slice(0, 1) : <UserRound size={18} strokeWidth={1.7} />}
      </Link>
    </div>
  );
}
