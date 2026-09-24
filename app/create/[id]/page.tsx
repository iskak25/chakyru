"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { ColorBar } from "@/components/ExtraLayer";
import { EditorDock } from "@/components/EditorDock";
import { FormatInvite } from "@/components/FormatInvite";
import { InvitationSetupWizard } from "@/components/InvitationSetupWizard";
import { PhoneFrame } from "@/components/InviteCard";
import { SiteShell } from "@/components/SiteShell";
import { StepArrow } from "@/components/StepArrow";
import { useI18n } from "@/lib/locale";
import { useInviteHistory } from "@/lib/useInviteHistory";
import { formatOf } from "@/lib/templates";
import { downloadInvitation } from "@/lib/exportInvite";
import { canEditInvitation, canEditTemplate, isAdmin, ownsInvitation } from "@/lib/auth";
import { fetchTemplateAccess } from "@/lib/accessClient";
import { confirmLastCheckout, unlockPaidTemplate } from "@/lib/payAccess";
import { ensureInvitationSaved, getUser } from "@/lib/store";
import type { WeddingPartInfo } from "@/lib/weddingEditor";
import { getPinterestDesign } from "@/lib/pinterestTemplates";
import { ShareInvitationDialog } from "@/components/ShareInvitationDialog";

function EditorPageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const { inv, ready, patch, undo, redo, canUndo, canRedo, saveState } = useInviteHistory(params.id);
  const [shareOpen, setShareOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [parts, setParts] = useState<WeddingPartInfo[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [expired, setExpired] = useState(false);
  const [showSetup, setShowSetup] = useState(searchParams.get("setup") === "1");

  function closeSetup() {
    setShowSetup(false);
    router.replace(`/create/${params.id}`);
  }

  useEffect(() => {
    if (ready && !inv) router.replace("/templates");
  }, [ready, inv, router]);

  useEffect(() => {
    if (!inv) return;
    if (inv.id.startsWith("preview-")) {
      router.replace(`/create/new?template=${encodeURIComponent(inv.templateId)}`);
      return;
    }
    let cancelled = false;
    let checking = false;
    const sync = async () => {
      if (checking || cancelled) return;
      checking = true;
      try {
      await confirmLastCheckout().catch(() => false);
      if (cancelled) return;
      const access = await fetchTemplateAccess(inv.templateId).catch(() => null);
      if (cancelled) return;
      if (access?.allowed) {
        unlockPaidTemplate(inv.templateId, access.accessType === "pro" ? "pro" : "standard");
      }
      const user = getUser();
      // Trust a successful server check fully (including a denial) — only fall back to the
      // local/offline heuristic when the network call itself failed (access === null).
      const paid = access ? access.allowed : canEditTemplate(user, inv.templateId);
      const mine = ownsInvitation(user, inv) || isAdmin(user) || canEditInvitation(user, inv);
      setExpired(Boolean(access?.expired));
      setAllowed(Boolean(user?.auth === "google" && paid && mine));
      } finally { checking = false; }
    };
    void sync();
    const onSync = () => void sync();
    window.addEventListener("chakyru-sync", onSync);
    return () => {
      cancelled = true;
      window.removeEventListener("chakyru-sync", onSync);
    };
  }, [inv, router]);

  const onSelect = useCallback((id: string | null) => setSelected(id), []);

  async function openPublished(share: boolean) {
    if (!inv || publishing) return;
    setPublishing(true);
    setPublishError("");
    try {
      if (!await ensureInvitationSaved(inv)) throw new Error("save");
      if (share) setShareOpen(true);
      else router.push(`/i/${inv.id}`);
    } catch {
      setPublishError(locale === "ru"
        ? "Изменения не сохранены на сервере. Проверьте подключение и попробуйте ещё раз."
        : "Өзгөртүүлөр серверде сакталган жок. Интернетти текшерип, кайра аракет кылыңыз.");
    } finally { setPublishing(false); }
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
          <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft">{expired ? t.templateView.editExpired : t.templateView.paywall}</p>
          <Link
            href={`/templates/${encodeURIComponent(inv.templateId)}`}
            className="mt-6 inline-block bg-forest px-5 py-2 text-[11px] uppercase tracking-[0.14em] text-cream"
          >
            {t.templateView.pay}
          </Link>
          {isSite ? (
            <div className="mx-auto mt-12 h-auto w-full max-w-[430px]">
              <FormatInvite invitation={inv} locale={locale} interactive startOpen />
            </div>
          ) : (
            <div className="mt-12 flex justify-center">
              <PhoneFrame large>
                <FormatInvite invitation={inv} locale={locale} compact interactive startOpen />
              </PhoneFrame>
            </div>
          )}
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      {showSetup ? (
        <InvitationSetupWizard
          invitation={inv}
          onComplete={(overrides) => {
            patch(overrides);
            closeSetup();
          }}
          onSkip={closeSetup}
        />
      ) : null}
      <div className="editor-page flex min-h-[calc(100vh-4rem)] pb-20 lg:pb-0">
        <EditorDock
          invitation={inv}
          format={format}
          onChange={patch}
          locale={locale}
          selected={selected}
          onSelect={onSelect}
          parts={isSite || getPinterestDesign(inv) ? parts : undefined}
          hideTemplates
          labels={{
            templates: t.editor.dockTemplates,
            media: t.editor.dockMedia,
            extras: t.editor.dockExtras,
            text: t.editor.dockText,
            element: t.editor.dockElement,
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
            save: t.editor.save,
          }}
        />
        <div className="min-w-0 flex-1 px-4 py-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="label">{t.formats[format]}</p>
              <h1 className="font-serif text-4xl uppercase">{t.editor.title}</h1>
              {saveState === "saving" ? (
                <p className="mt-2 text-xs text-ink-soft">{t.editor.savingRemote}</p>
              ) : saveState === "saved" ? (
                <p className="mt-2 text-xs text-ink-soft">{t.editor.savedRemote}</p>
              ) : saveState === "pending" ? (
                <p className="mt-2 text-xs text-ink-soft">{t.editor.savePending}</p>
              ) : saveState === "forbidden" ? (
                <p className="mt-2 text-xs text-ink-soft">{t.editor.saveForbidden}</p>
              ) : saveState === "expired" ? (
                <p className="mt-2 text-xs text-ink-soft">{t.editor.saveExpired}</p>
              ) : saveState === "error" ? (
                <p className="mt-2 text-xs text-ink-soft">{t.editor.saveError}</p>
              ) : null}
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
                    onClick={() => void openPublished(true)}
                    disabled={publishing}
                    className="h-10 rounded-[12px] border border-[var(--line)] px-4 text-[11px] uppercase tracking-[0.12em]"
                  >
                    {t.editor.share}
                  </button>
                  {shareOpen && <ShareInvitationDialog invitation={inv} locale={locale} onClose={() => setShareOpen(false)} />}
                  <button
                    type="button"
                    onClick={() => void openPublished(false)}
                    disabled={publishing}
                    className="inline-flex h-10 items-center rounded-[12px] bg-espresso px-4 text-[11px] uppercase tracking-[0.12em] text-cream"
                  >
                    {t.editor.openGuest}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={download}
                  disabled={saving}
                  className="flex h-10 items-center gap-1.5 rounded-[12px] bg-espresso px-4 text-[11px] uppercase tracking-[0.12em] text-cream disabled:opacity-60"
                >
                  <Download size={15} />
                  {saving ? t.editor.downloading : t.editor.download}
                </button>
              )}
            </div>
          </div>

          {publishError && <p role="alert" className="mb-4 text-sm text-red-700">{publishError}</p>}
          <p className="mb-6 text-center text-sm text-ink-soft">{t.editor.tapHint}</p>

          <div className={isSite ? "mx-auto w-full" : "mx-auto w-fit"}>
            <p className="mb-3 text-center text-[10px] uppercase tracking-[0.16em] text-meta">
              {t.editor.live}
            </p>
            <div className="flex items-start justify-center gap-1 sm:gap-3">
              <div className="sticky top-[50vh] -translate-y-1/2">
                <StepArrow
                  dir="left"
                  onClick={undo}
                  disabled={!canUndo}
                  label={`${t.editor.undo} · Ctrl+Z`}
                />
              </div>
              {isSite ? (
                <div className="min-w-0 flex-1">
                  <div className="mx-auto h-auto w-full max-w-[430px]">
                    <FormatInvite
                      invitation={inv}
                      locale={locale}
                      onChange={patch}
                      selected={selected}
                      onSelect={onSelect}
                      onPartsChange={setParts}
                    />
                  </div>
                </div>
              ) : (
                <PhoneFrame large capture>
                  <FormatInvite
                    invitation={inv}
                    locale={locale}
                    compact
                    onChange={patch}
                    onSelect={onSelect}
                  />
                </PhoneFrame>
              )}
              <div className="sticky top-[50vh] -translate-y-1/2">
                <StepArrow
                  dir="right"
                  onClick={redo}
                  disabled={!canRedo}
                  label={`${t.editor.redo} · Ctrl+Y`}
                />
              </div>
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

export default function EditorPage() {
  return (
    <Suspense>
      <EditorPageInner />
    </Suspense>
  );
}
