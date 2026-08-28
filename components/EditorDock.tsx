"use client";

import { useState, type ReactNode } from "react";
import {
  Calendar,
  CloudUpload,
  Image as ImageIcon,
  LayoutGrid,
  MapPin,
  Mic,
  Minus,
  Music,
  Plus,
  Timer,
  Type,
  X,
} from "lucide-react";
import type { CanvasItem, Invitation, InviteFormat, LayoutBox, ShapeKind } from "@/lib/types";
import { extraBox } from "./ExtraLayer";
import { dropBox, hasCanvasPoint, setPendingPlace } from "@/lib/canvasPointer";
import { STICKERS, STICKER_GROUPS, StickerGlyph } from "@/lib/stickers";
import { CLIPART, CLIPART_GROUPS } from "@/lib/clipart";
import { useCatalog } from "@/lib/useCatalog";
import type { InvitePatch } from "./CanvasEdit";
import { MusicPicker } from "./MusicPicker";
import { speakInvite, voiceScript } from "@/lib/voice";
import { StockPhotos } from "./StockPhotos";
import { DEFAULT_MUSIC_URL } from "@/lib/music";

type Tab = "templates" | "media" | "extras" | "text";

function MediaGlyph() {
  return (
    <span className="relative inline-block h-[22px] w-[22px]">
      <ImageIcon size={18} strokeWidth={1.6} className="absolute left-0 top-0.5" />
      <Music size={12} strokeWidth={2} className="absolute -bottom-0.5 -right-0.5" />
    </span>
  );
}

function ExtrasGlyph() {
  return (
    <span className="relative inline-block h-[22px] w-[22px]">
      <svg viewBox="0 0 22 22" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="1.5" y="11.5" width="8" height="8" rx="0.5" />
        <circle cx="16" cy="16" r="4" />
        <path d="M6.5 1.8 10.2 9.2H2.8Z" />
      </svg>
      <Plus size={9} strokeWidth={2.4} className="absolute -right-0.5 top-0" />
    </span>
  );
}

function newId() {
  return crypto.randomUUID();
}

function fileToData(file: File, cb: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = () => cb(String(reader.result ?? ""));
  reader.readAsDataURL(file);
}

export function EditorDock({
  invitation,
  format,
  onChange,
  locale,
  labels,
  selected,
  hideTemplates,
  stickyClass,
  templatesPanel,
  templatesDetail,
  templatesDetailTitle,
  onCloseTemplatesDetail,
}: {
  invitation: Invitation;
  format: InviteFormat;
  onChange: InvitePatch;
  locale: string;
  selected?: string | null;
  hideTemplates?: boolean;
  stickyClass?: string;
  templatesPanel?: ReactNode;
  templatesDetail?: ReactNode;
  templatesDetailTitle?: string;
  onCloseTemplatesDetail?: () => void;
  labels: {
    media: string;
    extras: string;
    text: string;
    extrasTitle: string;
    templates: string;
    upload: string;
    uploaded: string;
    images: string;
    music: string;
    musicOnline: string;
    musicDevice: string;
    musicLink: string;
    musicApply: string;
    musicPickFile: string;
    voice: string;
    voicePlay: string;
    voiceFile: string;
    addLarge: string;
    addMedium: string;
    addSmall: string;
    addGuest: string;
    guestHint: string;
    divider: string;
    map: string;
    calendar: string;
    countdown: string;
    addButton: string;
    toiTexts: string;
    kyzTexts: string;
    bdayTexts: string;
    library: string;
    stockSearch: string;
    stockPhotos: string;
    stockCover: string;
    stockEmpty: string;
    stockMore: string;
    stockCredit: string;
    anim: string;
  };
  speak?: (text: string) => void;
}) {
  const [tab, setTab] = useState<Tab | null>(hideTemplates || templatesPanel ? "media" : "templates");
  const extras = invitation.extras ?? [];
  const { templates } = useCatalog();

  function add(item: Omit<CanvasItem, "id">, box: LayoutBox) {
    if (!hasCanvasPoint()) {
      setPendingPlace({ item, w: box.w, h: box.h, z: box.z ?? 30 });
      return;
    }
    const id = newId();
    onChange({
      extras: [...extras, { ...item, id }],
      layout: { ...(invitation.layout ?? {}), [id]: dropBox(box.w, box.h, box.z ?? 30) },
    });
  }

  function applyPhoto(src: string, asCover = false) {
    if (asCover) {
      onChange({
        coverImage: src,
        gallery: { ...(invitation.gallery ?? {}), hero: src },
      });
      return;
    }
    if (selected?.startsWith("photo-")) {
      const slot = selected.slice("photo-".length);
      onChange({ gallery: { ...(invitation.gallery ?? {}), [slot]: src } });
      return;
    }
    add(
      { kind: "image", src, color: "#ffffff" },
      { x: 8, y: 10 + (extras.length % 4) * 8, w: 84, h: 54, z: 18 },
    );
  }

  function addShape(shape: ShapeKind) {
    add(
      { kind: "shape", shape, color: "#1a1a1a" },
      extraBox(extras.length, "shape"),
    );
  }

  function addSticker(id: string, group: (typeof STICKERS)[number]["group"]) {
    const large = group === "wreath" || group === "frame";
    add(
      { kind: "sticker", sticker: id, color: "#1a1a1a" },
      large
        ? { x: 12, y: 8 + (extras.length % 5) * 6, w: 76, h: 28, z: 25 }
        : extraBox(extras.length, "sticker"),
    );
  }

  function addClipart(item: (typeof CLIPART)[number]) {
    const n = extras.length;
    const box =
      item.group === "frame"
        ? { x: 8, y: 4 + (n % 4) * 3, w: 84, h: 46, z: 22 }
        : item.group === "ornament"
          ? { x: 10, y: 22 + (n % 5) * 4, w: 80, h: 16, z: 28 }
          : { x: 34 + (n % 3) * 4, y: 18 + (n % 4) * 4, w: 32, h: 28, z: 32 };
    add({ kind: "clipart", src: item.src, color: "#ffffff" }, box);
  }

  const uploadedImages = extras.filter((item) => item.kind === "image" && item.src);

  function addText(size: "lg" | "md" | "sm", text = "") {
    const fontSize = size === "lg" ? 32 : size === "md" ? 22 : 16;
    add(
      { kind: "text", text, color: "#1a1a1a", fontSize },
      extraBox(extras.length, size),
    );
  }

  const templateTab = {
    id: "templates" as const,
    label: labels.templates,
    icon: <LayoutGrid size={20} strokeWidth={1.6} />,
  };
  const mainTabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "media", label: labels.media, icon: format === "photo" ? <ImageIcon size={18} strokeWidth={1.6} /> : <MediaGlyph /> },
    { id: "extras", label: labels.extras, icon: <ExtrasGlyph /> },
    { id: "text", label: labels.text, icon: <Type size={22} strokeWidth={1.6} /> },
  ];
  const tabs: { id: Tab; label: string; icon: ReactNode }[] = templatesPanel
    ? [...mainTabs, templateTab]
    : hideTemplates
      ? mainTabs
      : [templateTab, ...mainTabs];

  const snippets = {
    toi: [
      locale === "ru"
        ? "Приглашаем разделить с нами радость этого дня."
        : "Сиздерди уулубуз менен келинибиздин тоюна чын жүрөктөн чакырабыз.",
      locale === "ru"
        ? "Ваше присутствие — лучший подарок."
        : "Сиздин катышууңуз — биз үчүн эң чоң белек.",
    ],
    kyz: [
      locale === "ru"
        ? "Приглашаем на кыз узатуу."
        : "Кыз узатуу тоюна чын жүрөктөн чакырабыз.",
    ],
    bday: [
      locale === "ru"
        ? "Приглашаем на день рождения!"
        : "Туулган күнгө чакырабыз!",
    ],
  };

  return (
    <div className={stickyClass ?? "relative sticky top-16 z-30 flex h-[calc(100vh-4rem)] shrink-0 self-start"}>
      <nav className="z-20 flex w-[84px] shrink-0 flex-col gap-0.5 border-r border-ink/10 bg-page py-2">
        {tabs.map((item) => {
          const on = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(on ? null : item.id)}
              className={`flex min-h-[72px] w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] leading-tight ${
                on
                  ? "border-l-[3px] border-gold bg-black/[0.04] text-ink"
                  : "border-l-[3px] border-transparent text-ink-soft"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {tab ? (
        <>
        <div className={`absolute left-[84px] top-0 z-10 flex h-full flex-col overflow-hidden border-r border-ink/10 bg-page p-3 md:static ${
          templatesPanel && tab === "templates"
            ? "w-[min(320px,calc(100vw-84px))] md:w-[320px]"
            : "w-[min(288px,calc(100vw-84px))] md:w-[288px]"
        }`}>
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <p className="font-medium">
              {tab === "templates"
                ? labels.templates
                : tab === "media"
                  ? labels.media
                  : tab === "extras"
                    ? labels.extrasTitle
                    : labels.text}
            </p>
            <button type="button" onClick={() => setTab(null)} className="text-ink-soft">
              <X size={16} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
          {tab === "templates" ? (
            templatesPanel ? (
              templatesPanel
            ) : (
            <div className="grid grid-cols-2 gap-2">
              {templates.map((tpl) => {
                const on = invitation.templateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      const photo = tpl.format === "photo";
                      onChange({
                        templateId: tpl.id,
                        blockColors: {},
                        music: !photo,
                        musicUrl: photo ? "" : invitation.musicUrl || DEFAULT_MUSIC_URL,
                      });
                    }}
                    className={`overflow-hidden rounded-xl text-left ${
                      on ? "ring-2 ring-gold" : "ring-1 ring-ink/10"
                    }`}
                  >
                    <div
                      className="flex aspect-[3/4] flex-col items-center justify-center px-2"
                      style={{ background: tpl.style.bg, color: tpl.style.accent }}
                    >
                      <p className="font-serif text-sm italic leading-tight">Aa</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] opacity-80">
                        {tpl.format === "site3d" ? "3D" : tpl.format === "photo" ? "JPG" : "Video"}
                      </p>
                    </div>
                    <p className="truncate px-1.5 py-1.5 text-[11px] leading-tight">
                      {locale === "ru" ? tpl.name.ru : tpl.name.ky}
                    </p>
                  </button>
                );
              })}
            </div>
            )
          ) : null}

          {tab === "media" ? (
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-ink/15 px-3 py-3 text-sm">
                <CloudUpload size={16} />
                {labels.upload}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    fileToData(file, (src) => {
                      if (selected?.startsWith("photo-") || invitation.coverImage) applyPhoto(src);
                      else
                        onChange({
                          coverImage: src,
                          gallery: { ...(invitation.gallery ?? {}), hero: src },
                        });
                    });
                  }}
                />
              </label>
              <p className="text-xs text-ink-soft">{labels.uploaded}</p>
              {invitation.coverImage || uploadedImages.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {invitation.coverImage ? (
                    <div
                      className="aspect-square rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url(${invitation.coverImage})` }}
                    />
                  ) : null}
                  {uploadedImages.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.src})` }}
                    />
                  ))}
                </div>
              ) : null}
              <StockPhotos
                locale={locale}
                labels={{
                  search: labels.stockSearch,
                  photos: labels.stockPhotos,
                  cover: labels.stockCover,
                  empty: labels.stockEmpty,
                  more: labels.stockMore,
                  credit: labels.stockCredit,
                }}
                onAdd={(src) => applyPhoto(src)}
                onCover={(src) => applyPhoto(src, true)}
              />
              <div className="flex gap-2">
                <span className="rounded-full bg-forest px-3 py-1 text-xs text-cream">
                  {labels.images}
                </span>
              </div>
              {format !== "photo" ? (
              <div className="space-y-1.5">
                <p className="text-xs text-ink-soft">{labels.music}</p>
                <MusicPicker
                  value={invitation.musicUrl}
                  onChange={(musicUrl) => onChange({ musicUrl, music: Boolean(musicUrl) })}
                  locale={locale}
                  labels={{
                    online: labels.musicOnline,
                    device: labels.musicDevice,
                    link: labels.musicLink,
                    apply: labels.musicApply,
                    clear: labels.music,
                    pickFile: labels.musicPickFile,
                  }}
                />
              </div>
              ) : null}
              {format === "videoVoice" ? (
                <div className="space-y-2">
                  <p className="text-xs text-ink-soft">{labels.voice}</p>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                    value={invitation.voiceText}
                    placeholder={invitation.message || labels.voice}
                    onChange={(e) => onChange({ voiceText: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs">
                      <Mic size={14} /> {labels.voiceFile}
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => onChange({ voiceUrl: String(reader.result ?? "") });
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="rounded-xl border px-3 py-2 text-xs"
                      onClick={() => {
                        if (invitation.voiceUrl) {
                          const a = new Audio(invitation.voiceUrl);
                          void a.play();
                          return;
                        }
                        speakInvite(voiceScript(invitation, locale));
                      }}
                    >
                      {labels.voicePlay}
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="space-y-3 pt-1">
                {CLIPART_GROUPS.map((group) => (
                  <div key={group.id}>
                    <p className="mb-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                      {locale === "ru" ? group.ru : group.ky}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {CLIPART.filter((item) => item.group === group.id).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addClipart(item)}
                          className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#f4eee4] p-1 hover:bg-[#ebe4d8]"
                          title={item.id}
                        >
                          <img
                            src={item.src}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-ink-soft">
                  {labels.library} ({STICKERS.length})
                </p>
                {STICKER_GROUPS.map((group) => (
                  <div key={group.id}>
                    <p className="mb-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                      {locale === "ru" ? group.ru : group.ky}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {STICKERS.filter((item) => item.group === group.id).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addSticker(item.id, item.group)}
                          className="flex aspect-square items-center justify-center rounded-xl bg-black/5 p-2 hover:bg-black/10"
                          title={item.id}
                        >
                          <StickerGlyph id={item.id} color="#1a1a1a" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "extras" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {(["square", "circle", "triangle", "star"] as ShapeKind[]).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => addShape(shape)}
                    className="flex aspect-square items-center justify-center rounded-xl bg-black/5 text-lg"
                    title={shape}
                  >
                    {shape === "square"
                      ? "■"
                      : shape === "circle"
                        ? "●"
                        : shape === "triangle"
                          ? "▲"
                          : "★"}
                  </button>
                ))}
              </div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">{labels.anim}</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { sticker: "heart", anim: "pulse" as const, ky: "Жүрөк", ru: "Сердце" },
                    { sticker: "wreath-flower", anim: "spin" as const, ky: "Венок", ru: "Венок" },
                    { sticker: "hearts-3", anim: "float" as const, ky: "Калуу", ru: "Парение" },
                    { sticker: "wreath-leaf", anim: "sway" as const, ky: "Жалбырак", ru: "Листья" },
                  ] as const
                ).map((item) => (
                  <button
                    key={`${item.sticker}-${item.anim}`}
                    type="button"
                    onClick={() =>
                      add(
                        { kind: "sticker", sticker: item.sticker, color: "#c4a35e", anim: item.anim },
                        extraBox(extras.length, "sticker"),
                      )
                    }
                    className="rounded-xl bg-black/5 px-3 py-2 text-left text-xs"
                  >
                    {locale === "ru" ? item.ru : item.ky}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() =>
                    add({ kind: "divider", color: "#1a1a1a" }, extraBox(extras.length, "sm"))
                  }
                  className="flex w-full items-center gap-2 rounded-xl bg-black/5 px-3 py-2 text-left text-sm"
                >
                  <Minus size={16} /> {labels.divider}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    add({ kind: "map", color: "#7d8c6e" }, extraBox(extras.length, "sm"))
                  }
                  className="flex w-full items-center gap-2 rounded-xl bg-black/5 px-3 py-2 text-left text-sm"
                >
                  <MapPin size={16} /> {labels.map}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    add(
                      { kind: "countdown", color: "#1c3326" },
                      extraBox(extras.length, "md"),
                    )
                  }
                  className="flex w-full items-center gap-2 rounded-xl bg-black/5 px-3 py-2 text-left text-sm"
                >
                  <Timer size={16} /> {labels.countdown}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    add(
                      {
                        kind: "button",
                        text: locale === "ru" ? "Кнопка" : "Баскыч",
                        color: "#1c3326",
                        url: "https://2gis.kg",
                      },
                      extraBox(extras.length, "sm"),
                    )
                  }
                  className="flex w-full items-center gap-2 rounded-xl bg-black/5 px-3 py-2 text-left text-sm"
                >
                  <LayoutGrid size={16} /> {labels.addButton}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    add(
                      {
                        kind: "text",
                        text: invitation.date || "12.09.2026",
                        color: "#065f46",
                        fontSize: 22,
                      },
                      extraBox(extras.length, "md"),
                    )
                  }
                  className="flex w-full items-center gap-2 rounded-xl bg-black/5 px-3 py-2 text-left text-sm"
                >
                  <Calendar size={16} /> {labels.calendar}
                </button>
              </div>
            </div>
          ) : null}

          {tab === "text" ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => addText("lg")}
                className="w-full rounded-xl bg-black/5 px-3 py-2.5 text-left text-lg"
              >
                Т {labels.addLarge}
              </button>
              <button
                type="button"
                onClick={() => addText("md")}
                className="w-full rounded-xl bg-black/5 px-3 py-2.5 text-left"
              >
                Т {labels.addMedium}
              </button>
              <button
                type="button"
                onClick={() => addText("sm")}
                className="w-full rounded-xl bg-black/5 px-3 py-2.5 text-left text-sm"
              >
                Т {labels.addSmall}
              </button>
              <button
                type="button"
                onClick={() =>
                  add(
                    {
                      kind: "guestName",
                      text: locale === "ru" ? "Дорогой гость" : "Урматтуу конок",
                      color: "#1a1a1a",
                      fontSize: 22,
                    },
                    extraBox(extras.length, "md"),
                  )
                }
                className="w-full rounded-xl bg-forest px-3 py-2.5 text-left text-sm text-cream"
              >
                {labels.addGuest}
              </button>
              <p className="text-xs leading-5 text-ink-soft">{labels.guestHint}</p>
              {[
                { t: labels.toiTexts, list: snippets.toi },
                { t: labels.kyzTexts, list: snippets.kyz },
                { t: labels.bdayTexts, list: snippets.bday },
              ].map((group) => (
                <details key={group.t} className="rounded-xl bg-black/5 px-3 py-2">
                  <summary className="cursor-pointer text-sm">{group.t} +</summary>
                  <div className="mt-2 space-y-1">
                    {group.list.map((line) => (
                      <button
                        key={line}
                        type="button"
                        onClick={() => addText("md", line)}
                        className="block w-full rounded-lg px-2 py-1.5 text-left text-xs leading-5 hover:bg-white"
                      >
                        {line}
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          ) : null}
          </div>
        </div>
        {tab === "templates" && templatesDetail ? (
          <div className="absolute inset-y-0 left-[84px] z-20 flex w-[min(320px,calc(100vw-84px))] flex-col overflow-hidden border-r border-ink/10 bg-page p-3 md:static md:w-[320px]">
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <p className="truncate font-medium">{templatesDetailTitle ?? labels.templates}</p>
              <button
                type="button"
                onClick={() => onCloseTemplatesDetail?.()}
                className="text-ink-soft"
              >
                <X size={16} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">{templatesDetail}</div>
          </div>
        ) : null}
      </>
      ) : null}
    </div>
  );
}
