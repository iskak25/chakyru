"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { canCreateInvitation, myInvitations } from "@/lib/auth";
import { useI18n } from "@/lib/locale";
import { getInvitations, getUser, rememberRemoteInvitation } from "@/lib/store";
import { fetchMyInvitationsRemote, pushInvitationRemote } from "@/lib/accessClient";
import { formatOf } from "@/lib/templates";
import type { Invitation, User } from "@/lib/types";

export default function DashboardPage() {
  const { t } = useI18n();
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
        <div className="mx-auto max-w-[1320px] px-5 py-24 text-center text-ink-soft">…</div>
      </SiteShell>
    );
  }

  const shown = myInvitations(user, list);
  const canMake = canCreateInvitation(user, list);
  const createHref = canMake ? "/templates" : user.auth === "name" ? "/login?google=1" : "/pricing";
  const planLabel =
    user.plan === "free"
      ? t.dash.planFree
      : t.plans[user.plan].name;

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label">{t.nav.mine}</p>
            <h1 className="font-serif mt-4 text-[40px] leading-[1.05] tracking-[-0.025em] sm:text-[56px]">{t.dash.title}</h1>
            <p className="mt-3 text-sm tracking-wide text-ink-soft">
              {user.name} · {user.auth === "google" ? t.dash.viaGoogle : t.dash.viaName} · {planLabel}
            </p>
            {!canMake ? <p className="mt-2 text-sm text-rose">{t.login.limit}</p> : null}
          </div>
          <Link
            href={createHref}
            className="text-[11px] uppercase tracking-[0.16em] text-meta underline underline-offset-4 transition-colors duration-200 hover:text-ink"
          >
            {canMake ? t.dash.create : t.dash.upgrade}
          </Link>
        </div>

        {shown.length === 0 ? (
          <p className="mt-16 text-center text-sm text-ink-soft">{t.dash.empty}</p>
        ) : (
          <div className="mt-12">
            {shown.map((inv) => {
              const yes = inv.guests.filter((g) => g.rsvp === "yes").length;
              const maybe = inv.guests.filter((g) => g.rsvp === "maybe").length;
              const isSite = formatOf(inv.templateId) === "site3d";
              return (
                <article
                  key={inv.id}
                  className="flex flex-col justify-between gap-4 border-b border-ink/10 py-6 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-serif text-[26px] tracking-[-0.02em]">{inv.names || "—"}</p>
                    <p className="mt-1 text-sm tracking-wide text-ink-soft">
                      {t.events[inv.eventType]} · {inv.date || "—"} · {inv.venue || "—"}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-meta">
                      {yes} {t.dash.coming} · {maybe} {t.dash.maybe} · {inv.guests.length}{" "}
                      {t.dash.guests}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <Link
                      href={`/create/${inv.id}`}
                      className="text-[11px] uppercase tracking-[0.14em] text-meta transition-colors duration-200 hover:text-ink"
                    >
                      {t.editor.title.split(" ")[0]}
                    </Link>
                    {isSite ? (
                      <Link
                        href={`/i/${inv.id}`}
                        className="text-[11px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
                      >
                        {t.editor.share}
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
