"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { PageHeader } from "@/components/app/AppShell";
import { canCreateInvitation, myInvitations } from "@/lib/auth";
import { useI18n } from "@/lib/locale";
import { getInvitations, getUser, rememberRemoteInvitation } from "@/lib/store";
import { fetchMyInvitationsRemote, pushInvitationRemote } from "@/lib/accessClient";
import { getTemplatePhotos } from "@/lib/templatePhotos";
import { formatOf, getTemplate } from "@/lib/templates";
import type { Invitation, User } from "@/lib/types";

export default function DashboardPage() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [list, setList] = useState<Invitation[]>([]);

  useEffect(() => {
    const sync = () => {
      const u = getUser();
      setUser(u);
      setList(getInvitations());
      if (!u) router.replace("/login?next=/dashboard");
    };
    sync();
    const localMine = myInvitations(getUser(), getInvitations());
    void Promise.all(localMine.map((inv) => pushInvitationRemote(inv))).then(() =>
      fetchMyInvitationsRemote().then((remote) => {
        remote.forEach(rememberRemoteInvitation);
        setList(getInvitations());
      }),
    );
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, [router]);

  if (!user) {
    return (
      <SiteShell>
        <div className="py-24 text-center text-ink-soft">…</div>
      </SiteShell>
    );
  }

  const shown = myInvitations(user, list);
  const canMake = canCreateInvitation(user, list);
  const createHref = canMake ? "/templates" : user.auth === "google" ? "/pricing" : "/login?google=1";

  return (
    <SiteShell>
      <section className="overflow-hidden rounded-[var(--radius-xl)] bg-espresso px-6 py-10 text-cream sm:px-10 sm:py-12">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--gold)]">{t.nav.mine}</p>
        <h1 className="font-serif mt-4 max-w-[16ch] text-[40px] leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
          {locale === "ru" ? `Добро пожаловать, ${user.name}` : `Кош келиңиз, ${user.name}`}
        </h1>
        <p className="mt-4 max-w-[40ch] text-[15px] leading-7 text-cream/70">{t.templatesSub}</p>
        <Link
          href={createHref}
          className="mt-8 inline-flex h-11 items-center rounded-[12px] bg-cream px-5 text-[11px] uppercase tracking-[0.14em] text-espresso transition hover:bg-white"
        >
          {canMake ? t.dash.create : t.dash.upgrade}
        </Link>
      </section>

      <div className="mt-12">
        <PageHeader
          title={t.dash.title}
          description={shown.length === 0 ? t.dash.empty : undefined}
          action={
            <Link
              href={createHref}
              className="inline-flex h-11 items-center rounded-[12px] border border-[var(--line)] bg-white px-5 text-[11px] uppercase tracking-[0.14em]"
            >
              {canMake ? t.dash.create : t.dash.upgrade}
            </Link>
          }
        />

        {shown.length === 0 ? (
          <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white px-6 py-20 text-center">
            <p className="font-serif text-3xl">{t.dash.empty}</p>
            <Link
              href={createHref}
              className="mt-8 inline-flex h-11 items-center rounded-[12px] bg-espresso px-5 text-[11px] uppercase tracking-[0.14em] text-cream"
            >
              {t.dash.create}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((inv) => {
              const yes = inv.guests.filter((g) => g.rsvp === "yes").length;
              const no = inv.guests.filter((g) => g.rsvp === "no").length;
              const photo = getTemplatePhotos(inv.templateId).hero;
              const template = getTemplate(inv.templateId);
              return (
                <Link
                  key={inv.id}
                  href={`/create/${inv.id}`}
                  className="group overflow-hidden rounded-[var(--radius-xl)] bg-white transition duration-300 hover:-translate-y-1"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={photo}
                      alt=""
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[0.14em]">
                      {t.formats[formatOf(inv.templateId)]}
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <h2 className="font-serif text-2xl tracking-[-0.02em]">{inv.names || template.name[locale]}</h2>
                    <p className="mt-2 text-[12px] text-ink-soft">
                      {inv.date || "—"} · {yes}/{yes + no} RSVP
                    </p>
                    <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-meta transition group-hover:text-ink">
                      {t.templateView.edit} →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
