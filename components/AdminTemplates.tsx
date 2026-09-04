"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ColorBar } from "@/components/ExtraLayer";
import { EditorDock } from "@/components/EditorDock";
import { FormatInvite } from "@/components/FormatInvite";
import { PhoneFrame } from "@/components/InviteCard";
import { StepArrow } from "@/components/StepArrow";
import { saveCatalogTemplates } from "@/lib/db";
import { setLiveTemplates, setPreviewTemplate } from "@/lib/catalogStore";
import { useI18n } from "@/lib/locale";
import { eventTypes, formats } from "@/lib/templates";
import { PREVIEW_INVITE, canvasFromInvite, inviteFromTemplate } from "@/lib/templateCanvas";
import { PAGE_LAYOUTS, type SitePageLayout } from "@/lib/siteLooks";
import { useCatalog } from "@/lib/useCatalog";
import type { EventType, Invitation, InvitationTemplate, InviteFormat, TemplateStyle } from "@/lib/types";

const blankStyle: TemplateStyle = {
  bg: "#0F0C0A",
  panel: "#F5F5F5",
  accent: "#A88E6E",
  text: "#0F0C0A",
  muted: "#737373",
  ornament: "#A88E6E",
  overlay: "#0F0C0A",
  pageBg: "#ffffff",
};

function blankTemplate(): InvitationTemplate {
  return {
    id: `tpl-${crypto.randomUUID().slice(0, 8)}`,
    name: { ky: "Жаңы шаблон", ru: "Новый шаблон" },
    designer: "Chakyru",
    format: "site3d",
    priceSom: 0,
    eventTypes: ["toi"],
    featured: false,
    style: { ...blankStyle },
  };
}

function hexOr(value: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim() : fallback;
}

export function AdminTemplates() {
  const { locale, t } = useI18n();
  const { templates: catalog } = useCatalog();
  const [list, setList] = useState<InvitationTemplate[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const dirty = useRef(false);
  const loaded = useRef(false);
  const listRef = useRef(list);
  const draftRef = useRef<InvitationTemplate | null>(null);
  const past = useRef<InvitationTemplate[]>([]);
  const future = useRef<InvitationTemplate[]>([]);
  const burst = useRef<number | null>(null);

  listRef.current = list;

  useEffect(() => {
    if (dirty.current) return;
    if (!catalog.length) return;
    loaded.current = true;
    setList(catalog.map((item) => structuredClone(item)));
    setSelectedId((id) => id || catalog[0].id);
  }, [catalog]);

  const draft = list.find((item) => item.id === selectedId) ?? null;
  draftRef.current = draft;

  useEffect(() => {
    past.current = [];
    future.current = [];
    setCanUndo(false);
    setCanRedo(false);
    setSelected(null);
  }, [selectedId]);

  useEffect(() => {
    setPreviewTemplate(draft);
    return () => setPreviewTemplate(null);
  }, [draft]);

  function flags() {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }

  function mark(next: InvitationTemplate[], record = true) {
    if (record) {
      const current = draftRef.current;
      if (current && burst.current == null) {
        past.current = [...past.current, structuredClone(current)].slice(-40);
        future.current = [];
      }
      if (burst.current) window.clearTimeout(burst.current);
      burst.current = window.setTimeout(() => {
        burst.current = null;
      }, 500);
    }
    dirty.current = true;
    setList(next);
    setStatus("");
    setError("");
    setLiveTemplates(next);
    flags();
  }

  function patch(partial: Partial<InvitationTemplate>) {
    if (!draft) return;
    mark(listRef.current.map((item) => (item.id === draft.id ? { ...item, ...partial } : item)));
  }

  function patchStyle(partial: Partial<TemplateStyle>) {
    if (!draft) return;
    mark(
      listRef.current.map((item) =>
        item.id === draft.id ? { ...item, style: { ...item.style, ...partial } } : item,
      ),
    );
  }

  function patchInvite(partial: Partial<Invitation>) {
    if (!draft) return;
    if (partial.templateId && partial.templateId !== draft.id) return;
    const nextInvite = { ...inviteFromTemplate(draft), ...partial };
    patch({ canvas: canvasFromInvite(nextInvite) });
  }

  function undo() {
    const current = draftRef.current;
    if (!current || past.current.length === 0) return;
    if (burst.current) {
      window.clearTimeout(burst.current);
      burst.current = null;
    }
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [structuredClone(current), ...future.current].slice(0, 40);
    const next = listRef.current.map((item) => (item.id === prev.id ? prev : item));
    dirty.current = true;
    setList(next);
    setLiveTemplates(next);
    flags();
  }

  function redo() {
    const current = draftRef.current;
    if (!current || future.current.length === 0) return;
    if (burst.current) {
      window.clearTimeout(burst.current);
      burst.current = null;
    }
    const nxt = future.current[0];
    future.current = future.current.slice(1);
    past.current = [...past.current, structuredClone(current)].slice(-40);
    const next = listRef.current.map((item) => (item.id === nxt.id ? nxt : item));
    dirty.current = true;
    setList(next);
    setLiveTemplates(next);
    flags();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (!(e.ctrlKey || e.metaKey)) return;
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleEvent(type: EventType) {
    if (!draft) return;
    const has = draft.eventTypes.includes(type);
    const eventTypesNext = has
      ? draft.eventTypes.filter((item) => item !== type)
      : [...draft.eventTypes, type];
    patch({ eventTypes: eventTypesNext.length ? eventTypesNext : [type] });
  }

  async function persist(next: InvitationTemplate[]) {
    setBusy(true);
    setError("");
    try {
      const result = await saveCatalogTemplates(next);
      setLiveTemplates(next);
      dirty.current = true;
      setStatus(result.remote ? t.admin.saved : t.admin.savedLocal);
      // #region agent log
      fetch("http://127.0.0.1:7861/ingest/fdb6035a-9503-48b4-894a-ead00d842d89", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c008f9" },
        body: JSON.stringify({
          sessionId: "c008f9",
          hypothesisId: "H",
          location: "AdminTemplates.tsx:persist",
          message: "template catalog saved",
          data: { remote: result.remote, count: next.length, selectedId },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    } catch {
      setError(t.admin.error);
      setStatus(t.admin.savedLocal);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!draft) return;
    await persist(listRef.current);
    setSelectedId(draft.id);
  }

  function createNew() {
    const created = blankTemplate();
    mark([...listRef.current, created], false);
    setSelectedId(created.id);
  }

  function cloneCurrent() {
    if (!draft) return;
    const cloned: InvitationTemplate = {
      ...structuredClone(draft),
      id: `tpl-${crypto.randomUUID().slice(0, 8)}`,
      name: { ky: `${draft.name.ky} copy`, ru: `${draft.name.ru} copy` },
      featured: false,
    };
    mark([...listRef.current, cloned], false);
    setSelectedId(cloned.id);
  }

  async function remove() {
    if (!draft) return;
    if (!window.confirm(t.admin.confirmDelete)) return;
    const next = listRef.current.filter((item) => item.id !== draft.id);
    mark(next, false);
    setSelectedId(next[0]?.id ?? "");
    await persist(next);
  }

  const onSelect = useCallback((id: string | null) => setSelected(id), []);
  const input = "w-full border border-ink/15 bg-transparent px-3 py-2 text-sm";
  const invite = draft ? inviteFromTemplate(draft) : null;

  const dockLabels = {
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
  };

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      <div className="sticky top-36 z-40 flex h-12 flex-wrap items-center gap-2 border-b border-ink/10 bg-page px-5">
        <button
          type="button"
          disabled={busy || !draft}
          onClick={() => void save()}
          className="bg-forest px-5 py-2 text-[11px] uppercase tracking-[0.14em] text-cream disabled:opacity-50"
        >
          {busy ? t.admin.saving : t.admin.save}
        </button>
        <button type="button" onClick={cloneCurrent} disabled={!draft} className="border border-ink/15 px-4 py-2 text-[11px] uppercase tracking-[0.14em] disabled:opacity-40">
          {t.admin.clone}
        </button>
        <button type="button" onClick={() => void remove()} disabled={!draft} className="px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-rose disabled:opacity-40">
          {t.admin.delete}
        </button>
        <StepArrow dir="left" size="sm" onClick={undo} disabled={!canUndo} label={`${t.editor.undo} · Ctrl+Z`} />
        <StepArrow dir="right" size="sm" onClick={redo} disabled={!canRedo} label={`${t.editor.redo} · Ctrl+Y`} />
        {error ? <p className="text-sm text-rose">{error}</p> : null}
        {status ? <p className="text-sm text-forest">{status}</p> : null}
      </div>

      <div className="flex min-h-0 flex-1">
        <EditorDock
          invitation={invite ?? PREVIEW_INVITE}
          format={draft?.format ?? "site3d"}
          onChange={patchInvite}
          locale={locale}
          selected={selected}
          stickyClass="relative sticky top-48 z-30 flex h-[calc(100vh-12rem)] shrink-0 self-start"
          labels={dockLabels}
          templatesPanel={
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  createNew();
                  setStyleOpen(true);
                }}
                className="w-full bg-forest px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-cream"
              >
                {t.admin.newTemplate}
              </button>
              <div className="flex flex-col gap-1">
                {list.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(tpl.id);
                      setStyleOpen(true);
                    }}
                    className={`px-3 py-2 text-left text-sm ${
                      tpl.id === selectedId ? "bg-forest text-cream" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {tpl.name[locale] || t.admin.newTemplate}
                  </button>
                ))}
              </div>
            </div>
          }
          templatesDetail={
            styleOpen && draft ? (
              <FormFields
                draft={draft}
                input={input}
                locale={locale}
                t={t}
                patch={patch}
                patchStyle={patchStyle}
                toggleEvent={toggleEvent}
              />
            ) : null
          }
          templatesDetailTitle={styleOpen && draft ? draft.name[locale] || t.admin.newTemplate : undefined}
          onCloseTemplatesDetail={() => setStyleOpen(false)}
        />
        {draft && invite ? (
          <div className="min-w-0 flex-1 px-4 py-6">
            <p className="mb-4 text-center text-sm text-ink-soft">{t.admin.editHint}</p>
            <div className="mx-auto w-fit">
              <div className="flex items-center gap-1 sm:gap-3">
                <StepArrow dir="left" onClick={undo} disabled={!canUndo} label={`${t.editor.undo} · Ctrl+Z`} />
                <PhoneFrame large scroll={draft.format === "site3d"} capture>
                  <FormatInvite
                    invitation={invite}
                    locale={locale}
                    compact
                    onChange={patchInvite}
                    onSelect={onSelect}
                  />
                </PhoneFrame>
                <StepArrow dir="right" onClick={redo} disabled={!canRedo} label={`${t.editor.redo} · Ctrl+Y`} />
              </div>
              <ColorBar selected={selected} invitation={invite} onChange={patchInvite} locale={locale} />
            </div>
          </div>
        ) : (
          <p className="p-8 text-sm text-ink-soft">{t.admin.emptyTemplates}</p>
        )}
      </div>
    </div>
  );
}

function FormFields({
  draft,
  input,
  locale,
  t,
  patch,
  patchStyle,
  toggleEvent,
}: {
  draft: InvitationTemplate;
  input: string;
  locale: string;
  t: ReturnType<typeof useI18n>["t"];
  patch: (partial: Partial<InvitationTemplate>) => void;
  patchStyle: (partial: Partial<TemplateStyle>) => void;
  toggleEvent: (type: EventType) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-ink-soft">{t.admin.events}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {eventTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleEvent(type)}
              className={`px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${
                draft.eventTypes.includes(type) ? "bg-forest text-cream" : "border border-ink/15 text-meta"
              }`}
            >
              {t.events[type]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-soft">{t.admin.colors}</p>
        <label className="mt-2 block text-xs text-ink-soft">
          {t.admin.bg}
          <input className={`${input} mt-1 font-mono text-[12px]`} value={draft.style.bg} onChange={(e) => patchStyle({ bg: e.target.value })} />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(
            [
              ["overlay", t.admin.overlay],
              ["pageBg", t.admin.pageBg],
              ["panel", t.admin.panel],
              ["accent", t.admin.accent],
              ["text", t.admin.text],
              ["muted", t.admin.muted],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-xs text-ink-soft">
              {label}
              <input
                type="color"
                className="mt-1 h-10 w-full cursor-pointer border border-ink/10 bg-transparent p-1"
                value={hexOr(draft.style[key] ?? "", key === "pageBg" ? "#ffffff" : "#0f0c0a")}
                onChange={(e) =>
                  patchStyle({
                    [key]: e.target.value,
                    ornament: key === "accent" ? e.target.value : draft.style.ornament,
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-3 border-t border-ink/10 pt-4">
        <label className="text-xs text-ink-soft">
          {t.admin.nameKy}
          <input className={`${input} mt-1`} value={draft.name.ky} onChange={(e) => patch({ name: { ...draft.name, ky: e.target.value } })} />
        </label>
        <label className="text-xs text-ink-soft">
          {t.admin.nameRu}
          <input className={`${input} mt-1`} value={draft.name.ru} onChange={(e) => patch({ name: { ...draft.name, ru: e.target.value } })} />
        </label>
        <label className="text-xs text-ink-soft">
          {t.admin.designer}
          <input className={`${input} mt-1`} value={draft.designer} onChange={(e) => patch({ designer: e.target.value })} />
        </label>
        <label className="text-xs text-ink-soft">
          {t.admin.format}
          <select className={`${input} mt-1`} value={draft.format} onChange={(e) => patch({ format: e.target.value as InviteFormat })}>
            {formats.map((format) => (
              <option key={format} value={format}>
                {t.formats[format]}
              </option>
            ))}
          </select>
        </label>
        {draft.format === "site3d" ? (
          <label className="text-xs text-ink-soft">
            {t.admin.layout}
            <select
              className={`${input} mt-1`}
              value={draft.style.pageLayout ?? ""}
              onChange={(e) =>
                patch({
                  style: {
                    ...draft.style,
                    pageLayout: (e.target.value || undefined) as SitePageLayout | undefined,
                  },
                })
              }
            >
              <option value="">—</option>
              {PAGE_LAYOUTS.map((layout) => (
                <option key={layout} value={layout}>
                  {t.admin.layouts[layout]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="text-xs text-ink-soft">
          {t.admin.priceSom}
          <input
            type="number"
            className={`${input} mt-1`}
            value={draft.priceSom}
            onChange={(e) => {
              const value = Number(e.target.value) || 0;
              patch({ priceSom: value });
              // #region agent log
              fetch("http://127.0.0.1:7861/ingest/fdb6035a-9503-48b4-894a-ead00d842d89", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c008f9" },
                body: JSON.stringify({
                  sessionId: "c008f9",
                  hypothesisId: "I",
                  location: "AdminTemplates.tsx:price",
                  message: "template editor price changed",
                  data: { id: draft.id, value, format: draft.format },
                  timestamp: Date.now(),
                }),
              }).catch(() => {});
              // #endregion
            }}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => patch({ featured: e.target.checked })} />
          {t.admin.featured}
        </label>
      </div>
      <p className="hidden">{locale}</p>
    </div>
  );
}
