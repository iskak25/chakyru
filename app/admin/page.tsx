"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Banknote, LayoutGrid, PlayCircle, Settings, Users } from "lucide-react";
import { AdminLessons } from "@/components/AdminLessons";
import { AdminPrices } from "@/components/AdminPrices";
import { AdminSettings } from "@/components/AdminSettings";
import { AdminTemplates } from "@/components/AdminTemplates";
import { AdminUsers } from "@/components/AdminUsers";
import { SiteShell } from "@/components/SiteShell";
import { isAdmin } from "@/lib/auth";
import { useI18n } from "@/lib/locale";
import { getUser } from "@/lib/store";
import type { User } from "@/lib/types";

type Tab = "users" | "templates" | "lessons" | "prices" | "settings";

export default function AdminPage() {
  const { t } = useI18n();
  const [user, setUserState] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("users");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUserState(getUser());
    sync();
    setReady(true);
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, []);

  const allowed = isAdmin(user);
  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "users", label: t.admin.users, icon: <Users size={20} strokeWidth={1.6} /> },
    { id: "templates", label: t.admin.templates, icon: <LayoutGrid size={20} strokeWidth={1.6} /> },
    { id: "lessons", label: t.admin.lessons, icon: <PlayCircle size={20} strokeWidth={1.6} /> },
    { id: "prices", label: t.admin.prices, icon: <Banknote size={20} strokeWidth={1.6} /> },
    { id: "settings", label: t.admin.settings, icon: <Settings size={20} strokeWidth={1.6} /> },
  ];
  const current = tabs.find((item) => item.id === tab);

  return (
    <SiteShell footer={false}>
      {!ready ? null : !user ? (
        <div className="mx-auto max-w-[1400px] px-5 py-16">
          <p className="eyebrow text-left">{t.admin.kicker}</p>
          <h1 className="font-serif mt-4 text-4xl uppercase">{t.admin.title}</h1>
          <p className="mt-10 text-sm">
            {t.admin.login}{" "}
            <Link href="/login?next=/admin&google=1" className="text-ink underline underline-offset-4">
              {t.nav.login}
            </Link>
          </p>
        </div>
      ) : !allowed ? (
        <div className="mx-auto max-w-[1400px] px-5 py-16">
          <p className="eyebrow text-left">{t.admin.kicker}</p>
          <h1 className="font-serif mt-4 text-4xl uppercase">{t.admin.title}</h1>
          <p className="mt-10 text-sm text-rose">{t.admin.denied}</p>
        </div>
      ) : (
        <div className="min-h-[calc(100vh-5rem)]">
          <header className="sticky top-20 z-40 h-16 border-b border-ink/10 bg-page/95">
            <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-4 px-5 md:px-10">
              <div className="min-w-0 shrink-0">
                <p className="label hidden sm:block">{t.admin.kicker}</p>
                <p className="font-serif text-lg uppercase leading-none md:text-xl">{t.admin.title}</p>
              </div>
              <nav className="flex h-full items-stretch overflow-x-auto">
                {tabs.map((item) => {
                  const on = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`flex items-center gap-2 whitespace-nowrap px-4 text-[11px] uppercase tracking-[0.14em] ${
                        on
                          ? "border-b-[3px] border-gold text-ink"
                          : "border-b-[3px] border-transparent text-meta hover:text-ink"
                      }`}
                    >
                      <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </header>
          {tab === "templates" ? (
            <AdminTemplates />
          ) : (
            <div className="px-5 py-8 md:px-10">
              <h1 className="font-serif text-3xl uppercase md:text-5xl">{current?.label}</h1>
              <p className="mt-1 mb-8 text-sm text-ink-soft">{t.admin.sub}</p>
              {tab === "users" ? <AdminUsers /> : null}
              {tab === "lessons" ? <AdminLessons /> : null}
              {tab === "prices" ? <AdminPrices /> : null}
              {tab === "settings" ? <AdminSettings /> : null}
            </div>
          )}
        </div>
      )}
    </SiteShell>
  );
}
