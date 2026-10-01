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
import { EditorSkeleton } from "@/components/Skeleton";
import { StepArrow } from "@/components/StepArrow";
import { ScaledCanvas } from "@/components/ScaledCanvas";
import { EditorTour, TOUR_FLAG } from "@/components/EditorTour";
import { EditorTopBar } from "@/components/EditorTopBar";
import { SectionNavigator } from "@/components/SectionNavigator";
import { DemoWatermark, demoNote } from "@/components/DemoMark";
import { useI18n } from "@/lib/locale";
import { useInviteHistory } from "@/lib/useInviteHistory";
import { formatOf, getTemplate } from "@/lib/templates";
import { downloadInvitation } from "@/lib/exportInvite";
import { canEditInvitation, canEditTemplate, isAdmin, ownsInvitation } from "@/lib/auth";
import { fetchInvitationRemoteMeta, fetchTemplateAccess } from "@/lib/accessClient";
import { confirmLastCheckout, startTemplateCheckout, unlockPaidTemplate } from "@/lib/payAccess";
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
  // Server verdict. Anything but a confirmed `true` keeps the «ДЕМО» mark and the private mode.
  const [paid, setPaid] = useState(false);
  const [payBusy, setPayBusy] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showSetup, setShowSetup] = useState(searchParams.get("setup") === "1");

  const [tourOpen, setTourOpen] = useState(false);

  // Первый вход на телефоне: показать подсказку один раз (флаг в localStorage)
  useEffect(() => {
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    try {
      if (!window.localStorage.getItem(TOUR_FLAG)) setTourOpen(true);
    } catch {}
  }, []);

  function closeTour() {
    setTourOpen(false);
    try {
      window.localStorage.setItem(TOUR_FLAG, "1");
    } catch {}
  }

  function exitEditor() {
    const unsaved = saveState === "saving" || saveState === "pending" || saveState === "error";
    if (unsaved) {
      const msg = locale === "ru" ? "Есть несохранённые изменения. Выйти?" : "Сакталбаган өзгөртүүлөр бар. Чыгасызбы?";
      if (!window.confirm(msg)) return;
    }
    router.push("/dashboard");
  }

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
      const mine = ownsInvitation(user, inv) || isAdmin(user) || canEditInvitation(user, inv);
      setExpired(Boolean(access?.expired));
      // Editing is free; payment only unlocks the public link and removes the demo mark.
      setAllowed(Boolean(user?.auth === "google" && mine && !access?.expired));
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

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void fetchInvitationRemoteMeta(params.id).then((meta) => {
        if (!cancelled) setPaid(meta?.paid === true);
      });
    };
    load();
    window.addEventListener("chakyru-sync", load);
    window.addEventListener("focus", load);
    return () => {
      cancelled = true;
      window.removeEventListener("chakyru-sync", load);
      window.removeEventListener("focus", load);
    };
  }, [params.id]);

  function resetTemplate() {
    if (!inv) return;
    const msg = locale === "ru"
      ? "Сбросить шаблон? Все ваши изменения будут удалены, и вы начнёте с начала."
      : "Шаблонду баштан баштайсызбы? Бардык өзгөртүүлөр өчүрүлөт.";
    if (!window.confirm(msg)) return;
    const c = getTemplate(inv.templateId).canvas;
    setSelected(null);
    patch({
      names: c?.names || "Айбек & Айгүл",
      hosts: "",
      date: c?.date ?? inv.date,
      time: c?.time ?? inv.time,
      venue: c?.venue ?? inv.venue,
      address: c?.address ?? inv.address,
      city: c?.city ?? inv.city,
      message: c?.message ?? "",
      dressCode: c?.dressCode ?? "",
      mapUrl: c?.mapUrl ?? inv.mapUrl,
      coverImage: c?.coverImage ?? "",
      layout: { ...(c?.layout ?? {}) },
      extras: [...(c?.extras ?? [])],
      blockColors: { ...(c?.blockColors ?? {}) },
      copy: { ...(c?.copy ?? {}) },
      gallery: { ...(c?.gallery ?? {}) },
    });
    setShowSetup(true);
  }

  const onSelect = useCallback((id: string | null) => setSelected(id), []);

  async function payNow() {
    if (!inv || payBusy) return;
    setPayBusy(true);
    setPublishError("");
    try {
      // Keep every edit: the checkout is bound to this template and this page.
      await ensureInvitationSaved(inv);
      const result = await startTemplateCheckout(inv.templateId);
      if (!result.ok) {
        if (result.error === "auth") {
          router.push(`/login?google=1&next=${encodeURIComponent(`/create/${inv.id}`)}`);
        } else {
          const detail = result.detail ? ` (${result.detail})` : "";
          setPublishError(result.error === "config" ? t.pay.notConfigured + detail : t.pay.fail + detail);
        }
        return;
      }
      if (result.granted) {
        const meta = await fetchInvitationRemoteMeta(inv.id);
        setPaid(meta?.paid === true);
      }
    } finally { setPayBusy(false); }
  }

  async function copyLink() {
    if (!inv) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/i/${inv.id}`);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setShareOpen(true);
    }
  }

  async function openPublished(share: boolean) {
    if (!inv || publishing) return;
    setPublishing(true);
    setPublishError("");
    try {
      if (!await ensureInvitationSaved(inv)) throw new Error("save");
      if (share && paid) setShareOpen(true);
      else router.push(`/i/${inv.id}`);
    } catch {
      setPublishError(locale === "ru"
        ? "Изменения не сохранены на сервере. Проверьте подключение и попробуйте ещё раз."
        : "Өзгөртүүлөр серверде сакталган жок. Интернетти текшерип, кайра аракет кылыңыз.");
    } finally { setPublishing(false); }
  }

  async function download() {
    if (!inv || saving) return;
    // The exported file would not carry the on-screen demo mark, so export needs payment.
    if (!paid) {
      void payNow();
      return;
    }
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

  if (!inv) return <SiteShell><EditorSkeleton /></SiteShell>;

  const format = formatOf(inv.templateId);
  const isSite = format === "site3d";
  if (allowed === null) return <SiteShell><EditorSkeleton /></SiteShell>;

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
    <SiteShell mobileFullscreen>
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
      {!paid ? <DemoWatermark editor /> : null}
      {tourOpen && !showSetup ? <EditorTour locale={locale} onClose={closeTour} /> : null}
      <EditorTopBar
        locale={locale}
        saveState={saveState}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onExit={exitEditor}
        onPreview={isSite ? () => void openPublished(false) : undefined}
        onShare={isSite && paid ? () => void openPublished(true) : undefined}
        onDownload={isSite ? undefined : download}
        onReset={resetTemplate}
        onHelp={() => setTourOpen(true)}
        onPay={paid ? undefined : () => void payNow()}
        busy={publishing || saving}
      />
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
          onReset={resetTemplate}
          onUndo={undo}
          mobileNavigator={<SectionNavigator parts={parts} locale={locale} />}
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
        <div className="min-w-0 flex-1 px-4 py-6 max-sm:pt-3">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 max-sm:hidden">
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
                  {paid ? (
                    <button
                      type="button"
                      onClick={() => void copyLink()}
                      className="h-10 rounded-[12px] border border-[var(--line)] px-4 text-[11px] uppercase tracking-[0.12em]"
                    >
                      {linkCopied ? (locale === "ru" ? "Скопировано ✓" : "Көчүрүлдү ✓") : (locale === "ru" ? "Скопировать ссылку" : "Шилтемени көчүрүү")}
                    </button>
                  ) : null}
                  {paid ? <button
                    type="button"
                    onClick={() => void openPublished(true)}
                    disabled={publishing}
                    className="h-10 rounded-[12px] border border-[var(--line)] px-4 text-[11px] uppercase tracking-[0.12em]"
                  >
                    {t.editor.share}
                  </button> : null}
                  {shareOpen && paid && <ShareInvitationDialog invitation={inv} locale={locale} onClose={() => setShareOpen(false)} />}
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

          {!paid ? (
            <div className="mx-auto mb-5 flex max-w-[430px] flex-col gap-3 rounded-[12px] border border-[var(--line)] bg-white p-4 text-sm leading-6">
              <p>{demoNote(locale)}</p>
              <button
                type="button"
                onClick={() => void payNow()}
                disabled={payBusy}
                className="h-11 rounded-[12px] bg-espresso px-4 text-[12px] font-medium uppercase tracking-[0.1em] text-cream disabled:opacity-60"
              >
                {payBusy ? t.pay.processing : (locale === "ru" ? "Оплатить и открыть публичный доступ" : "Төлөп, ачык жеткиликтүүлүктү ачуу")}
              </button>
            </div>
          ) : (
            <div className="mx-auto mb-5 flex max-w-[430px] items-center justify-between gap-3 rounded-[12px] border border-[var(--line)] bg-white p-4 text-sm">
              <span>{locale === "ru" ? "Страница опубликована" : "Барак жарыяланды"}</span>
              <button type="button" onClick={() => void copyLink()} className="h-10 rounded-[12px] border border-[var(--line)] px-4 text-[11px] uppercase tracking-[0.1em]">
                {linkCopied ? (locale === "ru" ? "Скопировано ✓" : "Көчүрүлдү ✓") : (locale === "ru" ? "Скопировать ссылку" : "Шилтемени көчүрүү")}
              </button>
            </div>
          )}

          {publishError && <p role="alert" className="mb-4 text-sm text-red-700">{publishError}</p>}
          <p className="mb-6 text-center text-sm text-ink-soft max-sm:hidden">{t.editor.tapHint}</p>

          <div className={isSite ? "mx-auto w-full" : "mx-auto w-fit"}>
            <p className="mb-3 text-center text-[10px] uppercase tracking-[0.16em] text-meta max-sm:hidden">
              {t.editor.live}
            </p>
            <div className="flex items-start justify-center gap-1 sm:gap-3">
              <div className="sticky top-[50vh] hidden -translate-y-1/2 sm:block">
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
                    <ScaledCanvas>
                      <FormatInvite
                        invitation={inv}
                        locale={locale}
                        onChange={patch}
                        selected={selected}
                        onSelect={onSelect}
                        onPartsChange={setParts}
                      />
                    </ScaledCanvas>
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
              <div className="sticky top-[50vh] hidden -translate-y-1/2 sm:block">
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
