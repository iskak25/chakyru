"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Calendar,
  Mail,
  CloudUpload,
  Image as ImageIcon,
  LayoutGrid,
  MapPin,
  Minus,
  Music,
  PenLine,
  Plus,
  Timer,
  Type,
  X,
} from "lucide-react";
import type { CanvasItem, Invitation, InviteFormat, LayoutBox, ShapeKind } from "@/lib/types";
import { extraBox } from "./ExtraLayer";
import { dropBox } from "@/lib/canvasPointer";
import { STICKERS, STICKER_GROUPS, StickerGlyph } from "@/lib/stickers";
import { CLIPART, CLIPART_GROUPS } from "@/lib/clipart";
import { useCatalog } from "@/lib/useCatalog";
import type { InvitePatch } from "./CanvasEdit";
import { CLOSE_EDIT_EVENT, EDIT_EVENT } from "./MoveCanvas";
import { useIsMobile } from "@/lib/useIsMobile";
import { MobileSheet } from "./MobileSheet";
import { ElementInspector } from "./ElementInspector";
import { EnvelopeEditor } from "./EnvelopeEditor";
import { MusicPicker } from "./MusicPicker";
import { StockPhotos } from "./StockPhotos";
import { uploadInvitationImage } from "@/lib/uploadImage";
import { defaultMusicForEvent, effectiveMusicUrl, templateMusicUrl } from "@/lib/music";
import type { WeddingPartInfo } from "@/lib/weddingEditor";

type Tab = "templates" | "media" | "music" | "extras" | "text" | "element" | "envelope";

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



export function EditorDock({
  invitation,
  format,
  onChange,
  locale,
  labels,
  selected,
  onSelect,
  parts,
  hideTemplates,
  onReset,
  stickyClass,
  templatesPanel,
  templatesDetail,
  templatesDetailTitle,
  onCloseTemplatesDetail,
  onUndo,
  mobileNavigator,
}: {
  onUndo?: () => void;
  /** Телефон: навигатор секций над вкладками (когда лист закрыт). */
  mobileNavigator?: ReactNode;
  invitation: Invitation;
  format: InviteFormat;
  onChange: InvitePatch;
  locale: string;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  parts?: WeddingPartInfo[];
  hideTemplates?: boolean;
  onReset?: () => void;
  stickyClass?: string;
  templatesPanel?: ReactNode;
  templatesDetail?: ReactNode;
  templatesDetailTitle?: string;
  onCloseTemplatesDetail?: () => void;
  labels: {
    media: string;
    extras: string;
    text: string;
    element: string;
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
    save: string;
  };
  speak?: (text: string) => void;
}) {
  const [tab, setTab] = useState<Tab | null>(hideTemplates || templatesPanel ? "media" : "templates");
  const extras = invitation.extras ?? [];
  const { templates } = useCatalog();

  function add(item: Omit<CanvasItem, "id">, box: LayoutBox) {
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
    ...(parts ? [{ id: "element" as const, label: labels.element, icon: <PenLine size={19} strokeWidth={1.6} /> }] : []),
    { id: "media", label: labels.media, icon: format === "photo" ? <ImageIcon size={18} strokeWidth={1.6} /> : <MediaGlyph /> },
    ...(format === "site3d" ? [{ id: "music" as const, label: labels.music, icon: <Music size={20} strokeWidth={1.6} /> }] : []),
    { id: "extras", label: labels.extras, icon: <ExtrasGlyph /> },
    { id: "text", label: labels.text, icon: <Type size={22} strokeWidth={1.6} /> },
    ...(format === "site3d" ? [{ id: "envelope" as const, label: "Конверт", icon: <Mail size={20} strokeWidth={1.6} /> }] : []),
  ];
  const tabs: { id: Tab; label: string; icon: ReactNode }[] = templatesPanel
    ? [...mainTabs, templateTab]
    : hideTemplates
      ? mainTabs
      : [templateTab, ...mainTabs];

  const mobile = useIsMobile();
  const mobileEditing = mobile && tab === "element";
  const sheetOpen = mobile && tab !== null;
  const invRef = useRef(invitation);
  invRef.current = invitation;

  // Десктоп: выбор элемента сразу открывает панель. Телефон: только явное намерение
  // (плашка «Өзгөртүү» или второй тап) — иначе случайный тап при скролле открывал бы редактор.
  useEffect(() => {
    if (selected && parts && !window.matchMedia("(max-width: 639px)").matches) setTab("element");
  }, [selected, parts]);

  useEffect(() => {
    const onEdit = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id) onSelect?.(id);
      if (parts) setTab("element");
    };
    const onClose = () => setTab(null);
    window.addEventListener(EDIT_EVENT, onEdit);
    window.addEventListener(CLOSE_EDIT_EVENT, onClose);
    return () => {
      window.removeEventListener(EDIT_EVENT, onEdit);
      window.removeEventListener(CLOSE_EDIT_EVENT, onClose);
    };
  }, [onSelect, parts]);

  // Телефон: скролл пальцем снимает выделение (если панель закрыта).
  useEffect(() => {
    if (!mobile || mobileEditing || !selected) return;
    let touching = false;
    const down = () => { touching = true; };
    const up = () => { touching = false; };
    const scroll = () => { if (touching) onSelect?.(null); };
    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchend", up, { passive: true });
    window.addEventListener("touchcancel", up, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("touchstart", down);
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchcancel", up);
      window.removeEventListener("scroll", scroll);
    };
  }, [mobile, mobileEditing, selected, onSelect]);

  // Затемнение холста (globals.css: [data-editing]).
  useEffect(() => {
    if (!mobileEditing) return;
    document.documentElement.dataset.editing = "1";
    return () => { delete document.documentElement.dataset.editing; };
  }, [mobileEditing]);

  // Лист открыт: тап по пустому холсту закрывает его (см. MoveCanvas).
  useEffect(() => {
    if (!sheetOpen) return;
    document.documentElement.dataset.sheet = "1";
    return () => { delete document.documentElement.dataset.sheet; };
  }, [sheetOpen]);

  // На телефоне лист не открывается сам при загрузке страницы.
  useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setTab(null);
  }, []);

  // Прокрутка выбранного элемента над панелью.
  useEffect(() => {
    if (!mobileEditing || !selected) return;
    const timer = window.setTimeout(() => {
      const el = document.querySelector(`[data-box="${CSS.escape(selected)}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const visibleBottom = window.innerHeight * 0.55; // панель занимает нижние ~45%
      if (r.bottom > visibleBottom || r.top < 0) {
        window.scrollBy({ top: Math.min(r.top - 16, r.bottom - visibleBottom + 16), behavior: "smooth" });
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [mobileEditing, selected]);

  // Системная «Назад» на телефоне закрывает лист, а не уходит со страницы.
  useEffect(() => {
    if (!sheetOpen) return;
    let pushed = true;
    window.history.pushState({ ...(window.history.state ?? {}), chakyruPanel: true }, "");
    const onPop = () => {
      pushed = false;
      setTab(null);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      // закрыли кнопкой/свайпом: убираем нашу запись из истории
      if (pushed && window.history.state?.chakyruPanel) window.history.back();
    };
  }, [sheetOpen]);

  // Закрытие: без изменений — молча; с изменениями — тост с отменой.
  const [toast, setToast] = useState(false);
  const openSnap = useRef<string | null>(null);
  useEffect(() => {
    if (mobileEditing) {
      openSnap.current = JSON.stringify(invRef.current);
      setToast(false);
      return;
    }
    if (openSnap.current === null) return;
    const changed = JSON.stringify(invRef.current) !== openSnap.current;
    openSnap.current = null;
    if (changed) setToast(true);
  }, [mobileEditing]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedPart = selected ? parts?.find((p) => p.id === selected) : undefined;
  const elementTitle = selectedPart
    ? `${locale === "ru" ? "Правка" : "Түзөтүү"}: ${selectedPart.label}`
    : labels.element;

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
    <div className={`editor-dock ${stickyClass ?? "relative sticky top-16 z-[45] flex h-[calc(100vh-4rem)] shrink-0 self-start"}`}>
      <nav className="editor-dock-tabs z-20 flex w-[84px] shrink-0 flex-col gap-0.5 border-r border-ink/10 bg-page py-2">
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
      {mobile && !tab ? mobileNavigator : null}

      {((panelNode) =>
        mobile ? (
          <MobileSheet open={tab !== null} onClose={() => setTab(null)} title={elementTitle}>
            {panelNode}
          </MobileSheet>
        ) : (
          panelNode
        ))(tab ? (
        <>
        <div className={`editor-dock-panel absolute left-[84px] top-0 z-10 flex h-full flex-col overflow-hidden border-r border-ink/10 bg-page p-3 md:static ${
          templatesPanel && tab === "templates"
            ? "w-[min(320px,calc(100vw-84px))] md:w-[320px]"
            : "w-[min(288px,calc(100vw-84px))] md:w-[288px]"
        }`}
        >
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <p className="min-w-0 truncate font-medium">
              {tab === "envelope" ? "Конверт" : tab === "templates"
                ? labels.templates
                : tab === "music" ? labels.music : tab === "media"
                  ? labels.media
                  : tab === "extras"
                    ? labels.extrasTitle
                    : tab === "element"
                      ? elementTitle
                      : labels.text}
            </p>
            <button
              type="button"
              aria-label="close"
              onClick={() => setTab(null)}
              className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-soft max-sm:-mr-2"
            >
              <X size={20} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
          {tab === "envelope" && <EnvelopeEditor invitation={invitation} onChange={onChange} locale={locale} />}
          {tab === "music" && format === "site3d" && <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={invitation.music} onChange={e => onChange({ music: e.target.checked, musicUrl: effectiveMusicUrl(invitation.musicUrl, true, invitation.eventType), musicTitle: undefined, musicStart: undefined, musicEnd: undefined })} />
              {locale === "ru" ? "Музыка при открытии" : "Ачылганда музыка ойнотуу"}
            </label>
            <p className="text-xs leading-5 text-ink-soft">{locale === "ru" ? "Выберите композицию, вставьте ссылку на аудио или YouTube, либо загрузите свой файл. Музыка начнёт играть при открытии конверта." : "Музыка тандаңыз, аудио же YouTube шилтемесин коюңуз же өз файлыңызды жүктөңүз. Конверт ачылганда музыка ойнойт."}</p>
            <button type="button" className="text-sm text-forest underline underline-offset-4" onClick={() => onChange({ music: true, musicUrl: defaultMusicForEvent(invitation.eventType), musicTitle: undefined, musicStart: undefined, musicEnd: undefined })}>{locale === "ru" ? "Музыка по теме шаблона" : "Шаблондун темасына ылайык музыка"}</button>
            <MusicPicker eventType={invitation.eventType} value={effectiveMusicUrl(invitation.musicUrl, invitation.music, invitation.eventType)} title={invitation.musicTitle} onChange={(musicUrl, trim, title) => onChange({ musicUrl, music: Boolean(musicUrl), musicTitle: title, musicStart: trim?.start, musicEnd: trim?.end })} locale={locale} labels={{ online: labels.musicOnline, device: labels.musicDevice, link: labels.musicLink, apply: labels.musicApply, clear: labels.music, pickFile: labels.musicPickFile }} />
          </div>}
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
                        eventType: tpl.eventTypes[0],
                        blockColors: {},
                        music: !photo,
                        musicUrl: templateMusicUrl(tpl),
                        musicTitle: undefined,
                        musicStart: undefined,
                        musicEnd: undefined,
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
                    if (format === "site3d") {
                      void uploadInvitationImage(file).then(src => applyPhoto(src)).catch(error => window.alert(error instanceof Error ? error.message : "Не удалось загрузить фотографию"));
                      return;
                    }
                    void uploadInvitationImage(file).then((src) => {
                      if (selected?.startsWith("photo-") || invitation.coverImage) applyPhoto(src);
                      else
                        onChange({
                          coverImage: src,
                          gallery: { ...(invitation.gallery ?? {}), hero: src },
                        });
                    }).catch(error => window.alert(error instanceof Error ? error.message : "Image upload failed"));
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

          {tab === "element" && parts ? (
            <ElementInspector
              invitation={invitation}
              onChange={onChange}
              selected={selected ?? null}
              select={onSelect ?? (() => {})}
              parts={parts}
              locale={locale}
            />
          ) : null}
          </div>

          <div className="mt-3 flex shrink-0 gap-2">
            {onReset && !mobileEditing ? (
              <button
                type="button"
                onClick={onReset}
                className="shrink-0 rounded-xl border border-ink/20 px-3 py-2.5 text-[11px] uppercase tracking-[0.12em] text-ink transition hover:bg-black/[0.04]"
              >
                {locale === "ru" ? "Сбросить" : "Баштан"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setTab(null)}
              className={`w-full rounded-xl bg-espresso px-4 text-cream ${
                mobileEditing ? "h-12 text-sm font-medium" : "py-2.5 text-[11px] uppercase tracking-[0.12em]"
              }`}
            >
              {mobileEditing ? (locale === "ru" ? "Готово ✓" : "Даяр ✓") : labels.save}
            </button>
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
      ) : null)}
      {toast ? (
        <div
          role="status"
          className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[70] flex items-center justify-between gap-3 rounded-xl bg-espresso px-4 py-2 text-sm text-cream shadow-lg sm:hidden"
        >
          <span>{locale === "ru" ? "Изменения сохранены" : "Өзгөртүү сакталды"}</span>
          <button
            type="button"
            onClick={() => {
              onUndo?.();
              setToast(false);
            }}
            className="h-10 shrink-0 px-1 font-medium text-gold underline underline-offset-4"
          >
            {locale === "ru" ? "Отменить" : "Артка кайтаруу"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
