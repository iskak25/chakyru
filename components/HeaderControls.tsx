"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { locales } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { getUser } from "@/lib/store";
import type { User } from "@/lib/types";

/** Язык и профиль для правого угла шапки: видны на любом экране. Гость: вход через Google; вошедший: «Мои приглашения». */
export function HeaderControls({ className = "" }: { className?: string }) {
  const { locale, t, setLocale } = useI18n();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, []);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {locales.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLocale(item.code)}
          aria-pressed={locale === item.code}
          className={`flex h-11 min-w-9 items-center justify-center px-1 text-[11px] uppercase tracking-[0.16em] transition-opacity ${locale === item.code ? "opacity-100" : "opacity-45"}`}
        >
          {item.code}
        </button>
      ))}
      <Link
        href={user ? "/dashboard" : "/login?google=1"}
        aria-label={user ? t.nav.mine : t.nav.login}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 text-[12px] uppercase"
      >
        {user ? user.name.slice(0, 1) : <UserRound size={17} strokeWidth={1.6} />}
      </Link>
    </div>
  );
}
