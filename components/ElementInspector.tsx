"use client";

/* eslint-disable @next/next/no-img-element -- User-selected media is displayed directly, including Firebase download URLs. */

import { useEffect, useRef, useState } from "react";
import { Cloud, Smartphone } from "lucide-react";
import { StockPhotos } from "./StockPhotos";
import { useI18n } from "@/lib/locale";
import type { Invitation } from "@/lib/types";
import { deleteCanvasId } from "@/lib/canvasOps";
import { LETTER_SPACING_MAX, LETTER_SPACING_MIN, LINE_HEIGHT_MAX, LINE_HEIGHT_MIN } from "@/lib/typography";
import { FontPicker } from "@/components/FontPicker";
import { restoreWeddingPart, weddingStyle, weddingStylePatch, weddingTextPatch, weddingValue, type WeddingPartInfo } from "@/lib/weddingEditor";
import { uploadInvitationImage } from "@/lib/uploadImage";
import type { InvitePatch } from "./CanvasEdit";

const FONT_MIN = 8;
const FONT_MAX = 100;
const clampFont = (n: number) => Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(n)));

/** Размер текста: черновик хранится строкой, чтобы «24» не превращалось в «84»; границы применяются при Enter/уходе из поля. */
function FontSizeField({ value, onCommit, label, css }: { value: string; onCommit: (value: string) => void; label: string; css: string }) {
  const [draft, setDraft] = useState(value);
  // Внешнее значение изменилось (другой элемент, отмена действия) — черновик берёт его; набор «24» его не трогает, пока не зафиксирован.
  const [seen, setSeen] = useState(value);
  if (seen !== value) { setSeen(value); setDraft(value); }
  function change(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, 3);
    setDraft(digits);
    const n = Number(digits);
    // В холст уходят только значения в допустимых границах; промежуточные («2» при вводе «24») ждут завершения.
    if (digits && n >= FONT_MIN && n <= FONT_MAX) onCommit(String(n));
  }
  function finish() {
    if (!draft) { onCommit(""); return; }
    const next = String(clampFont(Number(draft)));
    setDraft(next);
    onCommit(next);
  }
  function step(delta: number) {
    const base = Number(draft) || 22;
    const next = String(clampFont(base + delta));
    setDraft(next);
    onCommit(next);
  }
  const btn = "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-black/15 bg-white text-lg";
  return <div className="text-xs">{label}
    <div className="mt-1 flex items-center gap-1">
      <button type="button" aria-label={`${label} −`} className={btn} onClick={() => step(-2)}>−</button>
      <input aria-label={label} inputMode="numeric" className={`${css} h-11 text-center text-base`} value={draft} placeholder="Авто"
        onChange={e => change(e.target.value)} onBlur={finish} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); finish(); } }} />
      <button type="button" aria-label={`${label} +`} className={btn} onClick={() => step(2)}>+</button>
    </div>
  </div>;
}

/** Элементы в порядке регистрации: блок `section-*` открывает группу, остальные идут в неё. */
function groupBySection(parts: WeddingPartInfo[], ru: boolean) {
  const groups: { id: string; label: string; items: WeddingPartInfo[] }[] = [];
  for (const item of parts) {
    if (item.id.startsWith("section-") || !groups.length) groups.push({ id: item.id, label: item.id.startsWith("section-") ? item.label : (ru ? "Общее" : "Жалпы"), items: [] });
    groups[groups.length - 1].items.push(item);
  }
  return groups;
}

export function ElementInspector({ invitation, onChange, selected, select, parts, locale }: {
  invitation: Invitation; onChange: InvitePatch; selected: string | null; select: (id: string | null) => void; parts: WeddingPartInfo[]; locale: string;
}) {
  const ru = locale === "ru";
  const { t } = useI18n();
  const [photoSource, setPhotoSource] = useState<"online" | "device">("online");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef(invitation);
  useEffect(() => { latest.current = invitation; }, [invitation]);
  const part = parts.find(item => item.id === selected);
  const extra = invitation.extras.find(item => item.id === selected);
  const textValue = part ? weddingValue(invitation, part) : extra?.text || "";
  const isText = part?.kind === "text" || extra?.kind === "text" || extra?.kind === "button" || extra?.kind === "guestName";
  const isImage = part?.kind === "image" || extra?.kind === "image";
  const hidden = parts.filter(item => invitation.layout?.[item.id]?.hidden);
  const groups = groupBySection(parts, ru);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const css = "w-full rounded-lg border border-black/15 bg-white px-2 py-1.5 text-sm text-[#29251f]";
  function style(property: string, value: string) {
    if (!selected) return;
    if (extra && property === "fontSize") {
      onChange({ extras: invitation.extras.map(item => item.id === selected ? { ...item, fontSize: value ? Number(value) : undefined } : item) });
    } else onChange(weddingStylePatch(invitation, selected, property, value));
  }
  function image(src: string, target = selected, imagePart = part) {
    if (!target) return;
    const inv = latest.current;
    if (imagePart) onChange({ gallery: { ...inv.gallery, [imagePart.slot || target]: src } });
    else onChange({ extras: inv.extras.map(item => item.id === target ? { ...item, src } : item) });
  }
  return (
    <div className="space-y-3">
      <label className="block text-xs">{ru ? "Выбранный элемент" : "Тандалган элемент"}
        <select aria-label={ru ? "Выбранный элемент" : "Тандалган элемент"} className={css} value={selected || ""} onChange={e => select(e.target.value || null)}>
          <option value="">{ru ? "Нажмите элемент в приглашении" : "Чакыруудагы элементти басыңыз"}</option>
          {groups.map(group => <optgroup key={group.id} label={group.label}>{group.items.map(item => <option key={item.id} value={item.id}>{item.label}{invitation.layout?.[item.id]?.hidden ? (ru ? " (скрыт)" : " (катылган)") : ""}</option>)}</optgroup>)}
          {invitation.extras.map((item, index) => <option key={item.id} value={item.id}>{ru ? "Добавленный элемент" : "Кошулган элемент"} {index + 1}: {item.text || item.kind}</option>)}
        </select>
      </label>
      {isText ? <label className="block text-xs">{ru ? "Текст элемента" : "Элементтин тексти"}<textarea aria-label={ru ? "Текст элемента" : "Элементтин тексти"} rows={3} className={css} value={textValue} onChange={e => part ? onChange(weddingTextPatch(invitation, part, e.target.value)) : onChange({ extras: invitation.extras.map(item => item.id === selected ? { ...item, text: e.target.value } : item) })} /></label> : null}
      {isImage ? <div className="space-y-2">
        <div role="group" aria-label={ru ? "Источник фотографии" : "Сүрөт булагы"} className="flex rounded-full bg-black/5 p-1">
          {(["online", "device"] as const).map(source => <button
            key={source}
            type="button"
            aria-pressed={photoSource === source}
            onClick={() => { setPhotoSource(source); setError(""); }}
            className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm transition-colors ${photoSource === source ? "bg-ink text-cream" : "text-ink-soft"}`}
          >
            {source === "online" ? <Cloud size={16} /> : <Smartphone size={16} />}
            {source === "online" ? "Онлайн" : ru ? "С устройства" : "Түзмөктөн"}
          </button>)}
        </div>
        {photoSource === "online" ? <>
          <StockPhotos locale={locale} onAdd={src => image(src)} labels={{
            search: t.editor.stockSearch,
            photos: t.editor.stockPhotos,
            cover: t.editor.stockCover,
            empty: t.editor.stockEmpty,
            more: t.editor.stockMore,
            credit: t.editor.stockCredit,
          }} />
        <label className="block text-xs">{ru ? "Адрес изображения" : "Сүрөттүн дареги"}<input aria-label="Адрес изображения" className={css} value={part ? invitation.gallery?.[part.slot || part.id] ?? part.fallback ?? "" : extra?.src || ""} onChange={e => image(e.target.value)} /></label>
        </> : <>
        <label className="block text-xs">{uploading ? (ru ? "Загрузка…" : "Жүктөлүүдө…") : (ru ? "Загрузить фотографию" : "Сүрөт жүктөө")}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} className="mt-1 block w-full text-xs" onChange={async e => {
          const file = e.target.files?.[0]; if (!file) return;
          e.target.value = "";
          const target = selected, imagePart = part;
          setUploading(true); setError("");
          try { image(await uploadInvitationImage(file), target, imagePart); } catch (err) { setError(err instanceof Error ? err.message : "Не удалось загрузить фотографию"); } finally { setUploading(false); }
        }} /></label>
        </>}
        {part ? <label className="block text-xs">{ru ? "Кадрирование" : "Кадр"}<select aria-label="Кадрирование" className={css} value={weddingStyle(invitation, selected || "", "objectPosition") || "center"} onChange={e => style("objectPosition", e.target.value)}><option value="center">Центр</option><option value="top">Верх</option><option value="bottom">Низ</option><option value="left">Слева</option><option value="right">Справа</option></select></label> : null}
      </div> : null}
      {part?.kind === "date" || part?.id === "countdown" ? <div className="grid grid-cols-2 gap-2"><label className="text-xs">Дата<input aria-label="Дата мероприятия" type="date" className={css} value={invitation.date} onChange={e => onChange({ date: e.target.value })} /></label><label className="text-xs">Время<input aria-label="Время мероприятия" type="time" className={css} value={invitation.time} onChange={e => onChange({ time: e.target.value })} /></label></div> : null}
      {part?.kind === "widget" && part.fallback ? <label className="block text-xs">Подсказка в поле<input aria-label="Подсказка в поле" className={css} value={weddingStyle(invitation, part.id, "placeholder") ?? part.fallback} onChange={e => style("placeholder", e.target.value)} /></label> : null}
      {selected?.startsWith("program-icon-") ? <label className="block text-xs">Иконка<select aria-label="Иконка программы" className={css} value={weddingStyle(invitation, selected, "icon") || ""} onChange={e => style("icon", e.target.value)}><option value="">По макету</option>{["coffee", "gem", "camera", "utensils", "music", "sparkles"].map((icon, i) => <option key={icon} value={icon}>{["Встреча", "Кольцо", "Фото", "Ужин", "Музыка", "Праздник"][i]}</option>)}</select></label> : null}
      {selected === "map-button" || selected === "map-label" || extra?.kind === "button" ? <label className="block text-xs">Ссылка<input aria-label="Ссылка кнопки" className={css} value={extra ? extra.url || "" : invitation.mapUrl} onChange={e => extra ? onChange({ extras: invitation.extras.map(item => item.id === selected ? { ...item, url: e.target.value } : item) }) : onChange({ mapUrl: e.target.value })} /></label> : null}
      {selected ? <div className="grid grid-cols-2 gap-2">
        <label className="text-xs">{part?.kind === "block" ? "Фон блока" : "Цвет"}<input aria-label="Цвет элемента" type="color" className="block h-8 w-full" value={extra?.color || invitation.blockColors?.[selected] || "#443a31"} onChange={e => extra ? onChange({ extras: invitation.extras.map(item => item.id === selected ? { ...item, color: e.target.value } : item) }) : onChange({ blockColors: { ...invitation.blockColors, [selected]: e.target.value } })} /></label>
        {isText ? <FontSizeField key={selected} label="Размер текста" css={css} value={String(extra?.fontSize ?? weddingStyle(invitation, selected, "fontSize") ?? "")} onCommit={value => style("fontSize", value)} /> : null}
        {isText && !extra ? <><label className="text-xs">Выравнивание<select aria-label="Выравнивание" className={css} value={weddingStyle(invitation, selected, "align") || ""} onChange={e => style("align", e.target.value)}><option value="">По макету</option><option value="left">Слева</option><option value="center">По центру</option><option value="right">Справа</option></select></label></> : null}
      </div> : null}
      {selected && isText && !extra ? <div className="grid grid-cols-2 gap-2">
        <label className="text-xs">{ru ? "Межстрочный" : "Саптар аралыгы"}<input aria-label={ru ? "Межстрочный интервал" : "Саптар аралыгы"} type="number" inputMode="decimal" min={LINE_HEIGHT_MIN} max={LINE_HEIGHT_MAX} step="0.1" placeholder={ru ? "по шаблону" : "шаблон боюнча"} className={css} value={weddingStyle(invitation, selected, "lineHeight") ?? ""} onChange={e => style("lineHeight", e.target.value)} /></label>
        <label className="text-xs">{ru ? "Межбуквенный, px" : "Тамга аралыгы, px"}<input aria-label={ru ? "Межбуквенный интервал" : "Тамга аралыгы"} type="number" inputMode="decimal" min={LETTER_SPACING_MIN} max={LETTER_SPACING_MAX} step="0.5" placeholder={ru ? "по шаблону" : "шаблон боюнча"} className={css} value={weddingStyle(invitation, selected, "letterSpacing") ?? ""} onChange={e => style("letterSpacing", e.target.value)} /></label>
      </div> : null}
      {selected && isText && !extra ? <FontPicker value={weddingStyle(invitation, selected, "fontFamily") || ""} sample={textValue} ru={ru} onChange={value => style("fontFamily", value)} /> : null}
      {selected && !extra ? <details><summary className="cursor-pointer text-xs">Положение и оформление</summary><div className="mt-2 grid grid-cols-3 gap-2">
        {(["x", "y", "w", "h", "r"] as const).map((key, index) => <label key={key} className="text-xs">{["X", "Y", "Ширина", "Высота", "Поворот"][index]}<input aria-label={["Положение X", "Положение Y", "Ширина элемента", "Высота элемента", "Поворот элемента"][index]} type="number" className={css} value={invitation.layout?.[selected]?.[key] ?? (key === "w" ? 100 : 0)} onChange={e => onChange({ layout: { ...invitation.layout, [selected]: { ...(invitation.layout?.[selected] ?? { x: 0, y: 0, w: 100, h: 0 }), [key]: Math.max(key === "w" || key === "h" ? 0 : -360, Math.min(360, Number(e.target.value))) } } })} /></label>)}
        <label className="text-xs">Непрозрачность<input aria-label="Непрозрачность" type="number" min="0" max="100" className={css} value={weddingStyle(invitation, selected, "opacity") || "100"} onChange={e => style("opacity", String(Math.max(0, Math.min(100, Number(e.target.value)))))} /></label>
        <label className="text-xs">Скругление<input aria-label="Скругление" type="number" min="0" max="200" className={css} value={weddingStyle(invitation, selected, "radius") || "0"} onChange={e => style("radius", String(Math.max(0, Math.min(200, Number(e.target.value)))))} /></label>
      </div></details> : null}
      {selected ? <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="min-h-11 rounded-lg border px-3 text-xs" onClick={() => onChange(restoreWeddingPart(invitation, selected))}>{ru ? "Показать" : "Көрсөтүү"}</button>
        {confirmDelete === selected ? <>
          <span className="text-xs">{ru ? "Удалить элемент?" : "Элемент өчүрүлсүнбү?"}</span>
          <button type="button" className="min-h-11 rounded-lg border border-red-300 bg-red-50 px-3 text-xs text-red-700" onClick={() => { onChange(deleteCanvasId(invitation, selected, { x: 0, y: 0, w: 100, h: 0 })); setConfirmDelete(null); select(null); }}>{ru ? "Да, удалить" : "Ооба, өчүр"}</button>
          <button type="button" className="min-h-11 rounded-lg border px-3 text-xs" onClick={() => setConfirmDelete(null)}>{ru ? "Отмена" : "Жокко чыгаруу"}</button>
        </> : <button type="button" className="min-h-11 rounded-lg border border-red-200 px-3 text-xs text-red-700" onClick={() => setConfirmDelete(selected)}>{ru ? "Удалить элемент" : "Элементти өчүрүү"}</button>}
      </div> : null}
      {!selected ? <label className="block text-xs">Фон приглашения<input aria-label="Фон приглашения" type="color" value={invitation.blockColors?.page || "#f4ecdf"} onChange={e => onChange({ blockColors: { ...invitation.blockColors, page: e.target.value } })} /></label> : null}
      {hidden.length ? <p className="text-xs">Скрытых элементов: {hidden.length}. Выберите элемент в списке и нажмите «Показать».</p> : null}
      <p className="text-[11px] text-black/55">Выберите элемент. Перетаскивайте за его фон или рамку; угловые маркеры меняют размер.</p>
      {error ? <p role="alert" className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
