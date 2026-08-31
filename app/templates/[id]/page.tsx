"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormatInvite } from "@/components/FormatInvite";
import { PhoneFrame } from "@/components/InviteCard";
import { SiteShell } from "@/components/SiteShell";
import { canEditTemplate } from "@/lib/auth";
import { useI18n } from "@/lib/locale";
import { lastCheckout, paidTemplateId, restorePaidTemplate, unlockPaidTemplate } from "@/lib/payAccess";
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
  const opening = useRef(false);

  useEffect(() => {
    const sync = () => {
      if (paidTemplateId() === id || lastCheckout()?.templateId === id) unlockPaidTemplate(id);
      setCanEdit(canEditTemplate(getUser(), id) || paidTemplateId() === id || lastCheckout()?.templateId === id);
    };
    sync();
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, [id]);

  useEffect(() => {
    if (!template || opening.current) return;
    let cancelled = false;
    void restorePaidTemplate(id).then((restored) => {
      if (cancelled || opening.current) return;
      const last = lastCheckout();
      const paid = restored || paidTemplateId() === id || last?.templateId === id;
      if (!paid) return;
      opening.current = true;
      unlockPaidTemplate(id, last?.plan);
      const started = startInvitation(id, { force: true });
      if ("invitation" in started) router.replace(`/create/${started.invitation.id}`);
    });
    return () => {
      cancelled = true;
    };
  }, [id, template, router]);

  async function onEdit() {
    if (!template) return;
    const restored = await restorePaidTemplate(id);
    const paid = restored || canEdit || paidTemplateId() === id || lastCheckout()?.templateId === id;
    if (paid) unlockPaidTemplate(id);
    const started = startInvitation(template.id, { force: paid });
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
            <p className="mt-3 max-w-md text-sm leading-7 text-ink-soft">
              {canEdit ? t.editor.tapHint : t.templateView.paywall}
            </p>
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
