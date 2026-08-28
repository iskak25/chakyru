"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormatInvite } from "@/components/FormatInvite";
import { PhoneFrame } from "@/components/InviteCard";
import { SiteShell } from "@/components/SiteShell";
import { canEditTemplate } from "@/lib/auth";
import { useI18n } from "@/lib/locale";
import { formatOf } from "@/lib/templates";
import { getUser, previewInvitation, startInvitation } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";

export default function TemplatePreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { locale, t } = useI18n();
  const { templates } = useCatalog();
  const id = params.id;
  const template = templates.find((item) => item.id === id);
  const invitation = useMemo(() => (template ? previewInvitation(template.id) : null), [template]);
  const format = template ? formatOf(template.id) : "site3d";
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const sync = () => setCanEdit(canEditTemplate(getUser(), id));
    sync();
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, [id]);

  function onEdit() {
    if (!template) return;
    const started = startInvitation(template.id);
    if ("invitation" in started) router.push(`/create/${started.invitation.id}`);
    else router.push(started.href);
  }

  if (!template || !invitation) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-[1400px] px-5 py-24 text-center">
          <p className="text-sm text-ink-soft">{t.catalogEmpty}</p>
          <Link href="/templates" className="mt-6 inline-block text-[11px] uppercase tracking-[0.16em] underline underline-offset-4">
            {t.nav.templates}
          </Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1400px] px-5 py-12">
        <p className="eyebrow text-left">{t.preview}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl uppercase sm:text-5xl">{template.name[locale]}</h1>
            <p className="mt-3 max-w-md text-sm leading-7 text-ink-soft">{t.templateView.paywall}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/templates"
              className="border border-ink/15 px-4 py-2 text-[11px] uppercase tracking-[0.14em]"
            >
              {t.nav.templates}
            </Link>
            <button
              type="button"
              onClick={onEdit}
              className="bg-forest px-5 py-2 text-[11px] uppercase tracking-[0.14em] text-cream"
            >
              {canEdit ? t.templateView.edit : t.templateView.pay}
            </button>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <PhoneFrame large scroll={format === "site3d"}>
            <FormatInvite invitation={invitation} locale={locale} compact interactive startOpen />
          </PhoneFrame>
        </div>
      </div>
    </SiteShell>
  );
}
