"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import { PhoneFrame } from "@/components/InviteCard";
import { SiteShell } from "@/components/SiteShell";
import { fetchTemplateAccess, type TemplateAccessResponse } from "@/lib/accessClient";
import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { formatOf } from "@/lib/templates";
import { getUser, previewInvitation, pricingHref, startInvitation } from "@/lib/store";
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
  const [access, setAccess] = useState<TemplateAccessResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void fetchTemplateAccess(id).then((next) => {
        if (!cancelled) setAccess(next);
      });
    };
    load();
    window.addEventListener("chakyru-sync", load);
    return () => {
      cancelled = true;
      window.removeEventListener("chakyru-sync", load);
    };
  }, [id]);

  const canEdit = Boolean(access?.allowed || (template && getUser() && template.priceSom <= 0));
  const displayPrice = access?.price ?? template?.priceSom ?? 0;

  async function onEdit() {
    if (!template) return;
    const latest = await fetchTemplateAccess(template.id);
    if (latest?.allowed) {
      const started = startInvitation(template.id);
      if ("invitation" in started) router.push(`/create/${started.invitation.id}`);
      else router.push(started.href);
      return;
    }
    const user = getUser();
    if (!user || user.auth !== "google") {
      router.push(`/login?google=1&next=${encodeURIComponent(`/templates/${template.id}`)}`);
      return;
    }
    router.push(pricingHref(template.id));
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
        <p className="label">{t.preview}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-[40px] leading-[1.05] tracking-[-0.025em] sm:text-[52px]">{template.name[locale]}</h1>
            <p className="mt-3 max-w-md text-sm leading-7 text-ink-soft">
              {canEdit ? t.editor.tapHint : t.templateView.paywall}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-meta">
              {canEdit ? t.templateView.purchased : formatPrice(locale, displayPrice)}
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
              onClick={() => void onEdit()}
              className="bg-forest px-5 py-2 text-[11px] uppercase tracking-[0.14em] text-cream"
            >
              {canEdit ? t.templateView.edit : t.templateView.pay}
            </button>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <PhoneFrame large scroll={format === "site3d"}>
            <TemplateRenderer
              templateId={invitation.templateId}
              data={invitation}
              locale={locale}
              compact
              interactive
              startOpen
            />
          </PhoneFrame>
        </div>
      </div>
    </SiteShell>
  );
}
