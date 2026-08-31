"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { ColorBar } from "@/components/ExtraLayer";
import { EditorDock } from "@/components/EditorDock";
import { FormatInvite } from "@/components/FormatInvite";
import { PhoneFrame } from "@/components/InviteCard";
import { SiteShell } from "@/components/SiteShell";
import { StepArrow } from "@/components/StepArrow";
import { useI18n } from "@/lib/locale";
import { useInviteHistory } from "@/lib/useInviteHistory";
import { formatOf } from "@/lib/templates";
import { downloadInvitation } from "@/lib/exportInvite";
import { canEditTemplate } from "@/lib/auth";
import { paidTemplateId, unlockPaidTemplate } from "@/lib/payAccess";
import { getUser } from "@/lib/store";

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { locale, t } = useI18n();
  const { inv, ready, patch, undo, redo, canUndo, canRedo } = useInviteHistory(params.id);
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (ready && !inv) router.replace("/templates");
  }, [ready, inv, router]);

  useEffect(() => {
    const sync = () => {
      const templateId = inv?.templateId;
      if (templateId && paidTemplateId() === templateId) unlockPaidTemplate(templateId);
      setAllowed(canEditTemplate(getUser(), templateId));
    };
    sync();
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, [inv?.templateId]);

  const onSelect = useCallback((id: string | null) => setSelected(id), []);

  async function copyLink() {
    if (!inv) return;
    const url = `${window.location.origin}/i/${inv.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function download() {
    if (!inv || saving) return;
    setSelected(null);
    setSaving(true);
    try {
      await new Promise((r) => window.setTimeout(r, 80));
      await downloadInvitation({
        format: formatOf(inv.templateId),
        names: inv.names,
        musicUrl: inv.musicUrl,
      });
    } catch (err) {
      console.error(err);
      window.alert(locale === "ru" ? "Не удалось скачать" : "Жүктөп алуу оңунан чыккан жок");
    } finally {
      setSaving(false);
    }
  }

  if (!inv) return null;

  const format = formatOf(inv.templateId);
  const isSite = format === "site3d";
  if (allowed === null) return null;

  if (!allowed) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-[1400px] px-5 py-12">
          <p className="label">{t.formats[format]}</p>
          <h1 className="font-serif mt-2 text-4xl uppercase">{t.editor.title}</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft">{t.templateView.paywall}</p>
          <Link
            href={`/pricing?from=${encodeURIComponent(inv.templateId)}`}
            className="mt-6 inline-block bg-forest px-5 py-2 text-[11px] uppercase tracking-[0.14em] text-cream"
          >
            {t.templateView.pay}
          </Link>
          <div className="mt-12 flex justify-center">
            <PhoneFrame large scroll={format === "site3d"}>
              <FormatInvite invitation={inv} locale={locale} compact interactive startOpen />
            </PhoneFrame>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <EditorDock
          invitation={inv}
          format={format}
          onChange={patch}
          locale={locale}
          selected={selected}
          labels={{
            templates: t.editor.dockTemplates,
            media: t.editor.dockMedia,
            extras: t.editor.dockExtras,
            text: t.editor.dockText,
            extrasTitle: t.editor.extrasTitle,
            upload: t.editor.upload,
            uploaded: t.editor.uploaded,
            images: t.editor.images,
              music: t.editor.music,
              musicOnline: t.editor.musicOnline,
              musicDevice: t.editor.musicDevice,
              musicLink: t.editor.musicLink,
              musicApply: t.editor.musicApply,
              musicPickFile: t.editor.musicPickFile,
            voice: t.editor.voice,
            voicePlay: t.editor.voicePlay,
            voiceFile: t.editor.voiceFile,
            addLarge: t.editor.addLarge,
            addMedium: t.editor.addMedium,
            addSmall: t.editor.addSmall,
            addGuest: t.editor.addGuest,
            guestHint: t.editor.guestHint,
            divider: t.editor.divider,
            map: t.editor.map,
            calendar: t.editor.calendar,
            countdown: t.editor.countdown,
            addButton: t.editor.addButton,
            toiTexts: t.editor.toiTexts,
            kyzTexts: t.editor.kyzTexts,
            bdayTexts: t.editor.bdayTexts,
            library: t.editor.library,
            stockSearch: t.editor.stockSearch,
            stockPhotos: t.editor.stockPhotos,
            stockCover: t.editor.stockCover,
            stockEmpty: t.editor.stockEmpty,
            stockMore: t.editor.stockMore,
            stockCredit: t.editor.stockCredit,
            anim: t.editor.anim,
          }}
        />
        <div className="min-w-0 flex-1 px-4 py-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="label">{t.formats[format]}</p>
              <h1 className="font-serif text-4xl uppercase">{t.editor.title}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <StepArrow
                dir="left"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                label={`${t.editor.undo} · Ctrl+Z`}
              />
              <StepArrow
                dir="right"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                label={`${t.editor.redo} · Ctrl+Y`}
              />
              {isSite ? (
                <>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="border border-ink/15 px-4 py-2 text-[11px] uppercase tracking-[0.12em]"
                  >
                    {copied ? t.editor.copied : t.editor.share}
                  </button>
                  <Link
                    href={`/i/${inv.id}`}
                    className="bg-forest px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-cream"
                  >
                    {t.editor.openGuest}
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={download}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-forest px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-cream disabled:opacity-60"
                >
                  <Download size={15} />
                  {saving ? t.editor.downloading : t.editor.download}
                </button>
              )}
            </div>
          </div>

          <p className="mb-6 text-center text-sm text-ink-soft">{t.editor.tapHint}</p>

          <div className="mx-auto w-fit">
            <p className="mb-3 text-center text-[10px] uppercase tracking-[0.16em] text-meta">
              {t.editor.live}
            </p>
            <div className="flex items-center gap-1 sm:gap-3">
              <StepArrow
                dir="left"
                onClick={undo}
                disabled={!canUndo}
                label={`${t.editor.undo} · Ctrl+Z`}
              />
              <PhoneFrame large scroll={format === "site3d"} capture>
                <FormatInvite
                  invitation={inv}
                  locale={locale}
                  compact
                  onChange={patch}
                  onSelect={onSelect}
                />
              </PhoneFrame>
              <StepArrow
                dir="right"
                onClick={redo}
                disabled={!canRedo}
                label={`${t.editor.redo} · Ctrl+Y`}
              />
            </div>
            <ColorBar
              selected={selected}
              invitation={inv}
              onChange={patch}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
