"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import { SiteShell } from "@/components/SiteShell";
import { PageHeader } from "@/components/app/AppShell";
import { fetchTemplateAccess, type TemplateAccessResponse } from "@/lib/accessClient";
import { formatPrice } from "@/lib/i18n";
import { useI18n } from "@/lib/locale";
import { canEditTemplate } from "@/lib/auth";
import { getUser, openPaidInvitation, previewInvitation, pricingHref, startInvitation } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";

export default function TemplatePreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { locale, t } = useI18n();
  const { templates } = useCatalog();
  const id = params.id;
  const template = templates.find((item) => item.id === id);
  const invitation = useMemo(() => (template ? previewInvitation(template.id) : null), [template]);
  const [access, setAccess] = useState<TemplateAccessResponse | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // getUser() reads localStorage, which is unavailable during SSR — gate on
  // `mounted` so the first client render matches the server render exactly
  // and React doesn't report a hydration mismatch.
  const canEdit = mounted && Boolean(
    access?.allowed || canEditTemplate(getUser(), id) || (template && getUser() && template.priceSom <= 0),
  );
  const displayPrice = access?.price ?? template?.priceSom ?? 0;

  async function onEdit() {
    if (!template) return;
    const latest = await fetchTemplateAccess(template.id);
    if (latest?.allowed || canEditTemplate(getUser(), template.id)) {
      const started = latest?.allowed ? openPaidInvitation(template.id) : startInvitation(template.id);
      if ("invitation" in started) router.push(`/create/${started.invitation.id}?setup=1`);
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
        <div className="py-24 text-center">
          <p className="text-sm text-ink-soft">{t.catalogEmpty}</p>
          <Link href="/templates" className="mt-6 inline-block text-[11px] uppercase tracking-[0.16em] underline">
            {t.nav.templates}
          </Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow={t.preview}
        title={template.name[locale]}
        description={canEdit ? t.editor.tapHint : t.templateView.paywall}
      />

      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[var(--radius-xl)] bg-white p-3 sm:p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <TemplateRenderer
            templateId={invitation.templateId}
            data={invitation}
            locale={locale}
            interactive
            startOpen
          />
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-6 sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
            {t.events[template.eventTypes[0] ?? "wedding"]}
          </p>
          <h2 className="font-serif mt-3 text-4xl tracking-[-0.03em]">{template.name[locale]}</h2>
          <p className="mt-4 text-[15px] leading-7 text-ink-soft">
            {canEdit ? t.templateView.purchased : t.templateView.paywall}
          </p>
          <p className="mt-6 font-serif text-3xl">{canEdit ? t.templateView.purchased : formatPrice(locale, displayPrice)}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void onEdit()}
              className="inline-flex h-11 items-center rounded-[12px] bg-espresso px-5 text-[11px] uppercase tracking-[0.14em] text-cream transition hover:opacity-90"
            >
              {canEdit ? t.templateView.edit : t.templateView.pay}
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-[12px] border border-[var(--line)] px-5 text-[11px] uppercase tracking-[0.14em]"
            >
              <Heart size={14} />
              {locale === "ru" ? "В избранное" : "Тандалмаларга"}
            </button>
          </div>

          <div className="mt-10 space-y-3 border-t border-[var(--line)] pt-8">
            {[t.editor.music, t.editor.addGuest, t.editor.images, t.editor.map, "RSVP"].map((label) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-ink">{label}</span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-meta">✓</span>
              </div>
            ))}
          </div>

          <Link href="/templates" className="mt-8 inline-block text-[11px] uppercase tracking-[0.14em] text-meta underline underline-offset-4">
            {t.nav.templates}
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
