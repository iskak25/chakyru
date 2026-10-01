"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useMemo,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { Copy, Lock, RefreshCw, Trash2, Unlock } from "lucide-react";
import type { Invitation, LayoutBox, LayoutMap } from "@/lib/types";
import type { InvitePatch } from "./CanvasEdit";
import { deleteCanvasId, duplicateCanvasId, toggleLockId } from "@/lib/canvasOps";
import { rememberCanvasPointer } from "@/lib/canvasPointer";
import { useI18n } from "@/lib/locale";

type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type DragMode = { kind: "move" } | { kind: "resize"; handle: Handle } | { kind: "rotate" };
type DragSpace = "page" | "flow";

type MoveCtxValue = {
  editable: boolean;
  selected: string | null;
  dragging: boolean;
  select: (id: string | null) => void;
  get: (id: string, fallback: LayoutBox) => LayoutBox;
  begin: (
    e: React.PointerEvent,
    id: string,
    fallback: LayoutBox,
    mode: DragMode,
    space?: DragSpace,
  ) => void;
  canvas: () => HTMLDivElement | null;
  /** Запомнить начало касания (pointerdown) для проверки «чистого» тапа. */
  tapDown: (e: React.PointerEvent, id: string) => void;
  onChange?: InvitePatch;
  invitation?: Invitation;
};

/** Окно (window) получает id элемента: открыть панель редактирования. */
export const EDIT_EVENT = "chakyru:edit";
/** Закрыть панель редактирования (тап по затемнённому холсту). */
export const CLOSE_EDIT_EVENT = "chakyru:close-edit";

// Время последнего scroll: тап во время инерционной прокрутки не считается чистым.
let lastScroll = 0;
if (typeof window !== "undefined") {
  window.addEventListener("scroll", () => { lastScroll = Date.now(); }, { passive: true, capture: true });
}

const TAP_MAX_MOVE = 8;
const TAP_MAX_MS = 400;
const TAP_AFTER_SCROLL_MS = 300;

// На таче текст на холсте readOnly (см. useIsMobile в CanvasEdit/WeddingEditor),
// поэтому input[type=text] и textarea не считаются «контролами» — их можно тащить.
function isControl(t: HTMLElement, touch: boolean) {
  return !!t.closest(
    touch ? "select, a, button, label, input:not([type='text'])" : "input, textarea, select, a, button, label",
  );
}

const FLOW_BOX: LayoutBox = { x: 0, y: 0, w: 100, h: 0, z: 8 };
const HANDLES: Handle[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

const MoveCtx = createContext<MoveCtxValue | null>(null);

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const HANDLE_CLASS: Record<Handle, string> = {
  n: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-n-resize",
  s: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-s-resize",
  e: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-e-resize",
  w: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-w-resize",
  ne: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize",
  nw: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize",
  se: "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-se-resize",
  sw: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize",
};

const BLUE = "#2b7fff";

function BoxHandles({
  id,
  defaults,
  space,
}: {
  id: string;
  defaults: LayoutBox;
  space: DragSpace;
}) {
  const ctx = useContext(MoveCtx);
  if (!ctx) return null;
  return (
    <>
      {HANDLES.map((handle) => (
        <button
          key={handle}
          type="button"
          aria-label={handle}
          data-export-hide
          // визуально 12px, зона касания 44px (after:-inset-4)
          className={`resize-handle absolute z-[91] h-3 w-3 touch-none rounded-full border border-white bg-[#c4a35e] shadow after:absolute after:-inset-4 after:content-[''] ${HANDLE_CLASS[handle]}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            ctx.begin(e, id, defaults, { kind: "resize", handle }, space);
          }}
        />
      ))}
    </>
  );
}

function BoxToolbar({
  canDuplicate = true,
  id,
  defaults,
  space,
  locked,
  nearTop,
  onAct,
}: {
  id: string;
  defaults: LayoutBox;
  space: DragSpace;
  locked: boolean;
  nearTop: boolean;
  canDuplicate?: boolean;
  onAct: (kind: "lock" | "delete" | "copy") => void;
}) {
  const ctx = useContext(MoveCtx);
  const { locale } = useI18n();
  if (!ctx) return null;
  return (
    <>
      {!locked ? (
        <button
          type="button"
          aria-label="rotate"
          data-export-hide
          className="absolute left-1/2 z-[92] flex h-10 w-10 touch-none -translate-x-1/2 items-center justify-center rounded-full border bg-white shadow"
          style={{
            borderColor: BLUE,
            color: BLUE,
            top: nearTop ? "calc(100% + 8px)" : 0,
            transform: nearTop ? "translate(-50%, 0)" : "translate(-50%, -150%)",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            ctx.begin(e, id, defaults, { kind: "rotate" }, space);
          }}
        >
          <RefreshCw size={14} strokeWidth={2.4} />
        </button>
      ) : null}
      {/* Мобилка: вместо плавающей панели — плашка «Өзгөртүү», открывает редактор */}
      <button
        type="button"
        data-export-hide
        aria-label="edit"
        className="edit-badge absolute left-1/2 z-[93] flex h-10 -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[#c4a35e] px-4 text-[13px] font-medium text-white shadow-md sm:hidden"
        style={{ top: nearTop ? (locked ? "calc(100% + 8px)" : "calc(100% + 52px)") : locked ? "-60px" : "-108px" }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => window.dispatchEvent(new CustomEvent(EDIT_EVENT, { detail: id }))}
      >
        ✏️ {locale === "ru" ? "Изменить" : "Өзгөртүү"}
      </button>
      {ctx.onChange && ctx.invitation ? (
        <div
          data-export-hide
          className="absolute left-1/2 z-[93] hidden -translate-x-1/2 sm:flex items-center gap-1 rounded-xl bg-white p-1 shadow-md"
          style={{
            top: nearTop ? (locked ? "calc(100% + 8px)" : "calc(100% + 52px)") : locked ? "-60px" : "-108px",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button type="button" aria-label="lock" className="flex h-10 min-w-10 items-center justify-center text-[#2b7fff]" onClick={() => onAct("lock")}>
            {locked ? <Lock size={18} /> : <Unlock size={18} />}
          </button>
          <button type="button" aria-label="delete" className="flex h-10 min-w-10 items-center justify-center text-[#2b7fff]" onClick={() => onAct("delete")}>
            <Trash2 size={18} />
          </button>
          {canDuplicate ? <button type="button" aria-label="duplicate" className="flex h-10 min-w-10 items-center justify-center text-[#2b7fff]" onClick={() => onAct("copy")}>
            <Copy size={18} />
          </button> : null}
        </div>
      ) : null}
    </>
  );
}

export function MoveCanvas({
  selected: controlledSelected,
  editable,
  layout,
  onLayout,
  onSelect,
  onChange,
  invitation,
  height,
  children,
  className = "",
  background,
}: {
  editable?: boolean;
  selected?: string | null;
  layout?: LayoutMap;
  onLayout?: (layout: LayoutMap) => void;
  onSelect?: (id: string | null) => void;
  onChange?: InvitePatch;
  invitation?: Invitation;
  height?: number | string;
  children: ReactNode;
  className?: string;
  background?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [localSelected, setSelected] = useState<string | null>(null);
  const selected = controlledSelected === undefined ? localSelected : controlledSelected;
  const [draft, setDraft] = useState<LayoutMap>({});
  const [dragging, setDragging] = useState(false);

  const select = useCallback(
    (id: string | null) => {
      setSelected(id);
      onSelect?.(id);
    },
    [onSelect],
  );
  const drag = useRef<{
    id: string;
    mode: DragMode;
    space: DragSpace;
    startX: number;
    startY: number;
    start: LayoutBox;
    cw: number;
    ch: number;
    scale: number;
    box: LayoutBox;
    active: boolean;
    cx: number;
    cy: number;
    startAngle: number;
  } | null>(null);

  const merged: LayoutMap = useMemo(() => ({ ...(layout ?? {}), ...draft }), [layout, draft]);

  const get = useCallback(
    (id: string, fallback: LayoutBox) => merged[id] ?? fallback,
    [merged],
  );

  const begin = useCallback(
    (e: React.PointerEvent, id: string, fallback: LayoutBox, mode: DragMode, space: DragSpace = "page") => {
      if (!editable) return;
      const canvas = ref.current;
      if (!canvas) return;
      let start = merged[id] ?? fallback;
      if (start.locked && mode.kind !== "rotate") {
        select(id);
        return;
      }
      const t = e.target as HTMLElement;
      const onControl = isControl(t, e.pointerType !== "mouse");
      e.stopPropagation();
      select(id);
      const rect = canvas.getBoundingClientRect();
      // cw/ch — в собственных (немасштабированных) пикселях холста; scale — transform: scale предков
      const scale = canvas.offsetWidth ? rect.width / canvas.offsetWidth : 1;
      const cw = Math.max(canvas.offsetWidth || rect.width, 1);
      const ch = Math.max(canvas.offsetHeight || rect.height, 1);
      if (space === "flow" && mode.kind === "resize") {
        const node = canvas.querySelector(`[data-box="${id}"]`) as HTMLElement | null;
        if (node && (!start.h || start.h === 0)) {
          start = {
            ...start,
            w: (node.offsetWidth / cw) * 100,
            h: Math.max((node.offsetHeight / cw) * 100, 4),
          };
        }
      }
      const node = space === "flow" ? (canvas.querySelector(`[data-box="${id}"]`) as HTMLElement | null) : null;
      const nr = node?.getBoundingClientRect();
      const cx = nr ? nr.left + nr.width / 2 : rect.left + ((start.x + start.w / 2) / 100) * rect.width;
      const cy = nr ? nr.top + nr.height / 2 : rect.top + ((start.y + start.h / 2) / 100) * rect.height;
      drag.current = {
        id,
        mode,
        space,
        startX: e.clientX,
        startY: e.clientY,
        start,
        cw,
        ch,
        scale,
        box: start,
        active: mode.kind === "resize" || mode.kind === "rotate",
        cx,
        cy,
        startAngle: Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI),
      };
      if (mode.kind === "move" && onControl) return;
      canvas.setPointerCapture(e.pointerId);
    },
    [editable, merged, select],
  );

  function applyMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    // координаты указателя делим на scale холста
    const px = (e.clientX - d.startX) / d.scale;
    const py = (e.clientY - d.startY) / d.scale;
    if (!d.active) {
      if (Math.hypot(px, py) * d.scale < 5) return;
      d.active = true;
      setDragging(true);
      ref.current?.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
    const start = d.start;
    let { x, y, w, h, z, r, locked, hidden } = start;
    if (d.mode.kind === "rotate") {
      const angle = Math.atan2(e.clientY - d.cy, e.clientX - d.cx) * (180 / Math.PI);
      r = Math.round(angle - d.startAngle + (start.r ?? 0));
    } else if (d.space === "flow") {
      const dx = (px / d.cw) * 100;
      const dy = (py / d.cw) * 100;
      if (d.mode.kind === "move") {
        x = clamp(x + dx, -80, 80);
        y = clamp(y + dy, -80, 80);
      } else {
        const handle = d.mode.handle;
        if (handle.includes("e")) w = clamp(w + dx, 8, 160);
        if (handle.includes("s")) h = clamp(h + dy, 4, 160);
        if (handle.includes("w")) {
          const nextW = clamp(w - dx, 8, 160);
          x += w - nextW;
          w = nextW;
        }
        if (handle.includes("n")) {
          const nextH = clamp(h - dy, 4, 160);
          y += h - nextH;
          h = nextH;
        }
      }
    } else if (d.mode.kind === "move") {
      const dx = (px / d.cw) * 100;
      const dy = (py / d.ch) * 100;
      x = clamp(x + dx, -8, 100 - 8);
      y = clamp(y + dy, 0, 100 - 4);
    } else {
      const dx = (px / d.cw) * 100;
      const dy = (py / d.ch) * 100;
      const handle = d.mode.handle;
      if (handle.includes("e")) w = clamp(w + dx, 8, 100 - x);
      if (handle.includes("s")) h = clamp(h + dy, 3.5, 100 - y);
      if (handle.includes("w")) {
        const nextW = clamp(w - dx, 8, w + x + 8);
        x += w - nextW;
        w = nextW;
      }
      if (handle.includes("n")) {
        const nextH = clamp(h - dy, 3.5, h + y);
        y += h - nextH;
        h = nextH;
      }
    }
    const box = { x, y, w, h, z, r, locked, hidden };
    d.box = box;
    setDraft((prev) => ({ ...prev, [d.id]: box }));
  }

  function endDrag() {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    setDragging(false);
    if (!d.active) return;
    const next = { ...(layout ?? {}), [d.id]: d.box };
    setDraft({});
    onLayout?.(next);
  }

  const tap = useRef<{ id: string; x: number; y: number; t: number } | null>(null);
  const tapDown = useCallback((e: React.PointerEvent, id: string) => {
    tap.current = { id, x: e.clientX, y: e.clientY, t: Date.now() };
  }, []);

  // pointerup: чистый тап по невыделенному элементу выделяет его,
  // по уже выделенному — открывает редактор (второй тап).
  function onUp(e: React.PointerEvent) {
    const tp = tap.current;
    tap.current = null;
    const dragged = !!drag.current?.active;
    endDrag();
    if (!tp || dragged || !editable) return;
    const now = Date.now();
    const clean =
      Math.hypot(e.clientX - tp.x, e.clientY - tp.y) < TAP_MAX_MOVE &&
      now - tp.t < TAP_MAX_MS &&
      now - lastScroll > TAP_AFTER_SCROLL_MS;
    if (!clean) return;
    if (selected === tp.id) window.dispatchEvent(new CustomEvent(EDIT_EVENT, { detail: tp.id }));
    else select(tp.id);
  }

  // pointercancel (системный жест, скролл): откатываем черновик, без «прыжка»
  function cancelDrag() {
    tap.current = null;
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    setDraft({});
  }

  return (
    <MoveCtx.Provider
      value={{
        editable: !!editable,
        selected,
        dragging,
        select,
        get,
        begin,
        canvas: () => ref.current,
        tapDown,
        onChange,
        invitation,
      }}
    >
      <div
        ref={ref}
        data-invite-canvas
        className={`relative ${height === "auto" ? "" : "h-full"} ${className}`}
        style={{
          ...(height === "auto"
            ? { height: "auto" }
            : height != null
              ? { height, minHeight: height }
              : { height: "100%" }),
          background,
        }}
        onPointerDown={() => {
          if (!editable) return;
          // пока открыт лист, тап по пустому месту холста закрывает его
          if (document.documentElement.dataset.sheet) {
            window.dispatchEvent(new Event(CLOSE_EDIT_EVENT));
            return;
          }
          select(null);
        }}
        onPointerMove={(e) => {
          if (editable && !drag.current) {
            rememberCanvasPointer(e.clientX, e.clientY, e.currentTarget);
          }
          applyMove(e);
        }}
        onPointerUp={onUp}
        onPointerCancel={cancelDrag}
      >
        {children}
      </div>
    </MoveCtx.Provider>
  );
}

export function FreeMove({
  id,
  defaults,
  children,
  className = "",
}: {
  id: string;
  defaults: LayoutBox;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(MoveCtx);
  if (!ctx) return <>{children}</>;
  const move = ctx;
  const box = move.get(id, defaults);
  if (box.hidden) return null;
  const selected = move.selected === id;
  const locked = !!box.locked;
  const rot = box.r ?? 0;
  const nearTop = box.y < 8;

  function act(kind: "lock" | "delete" | "copy") {
    const inv = move.invitation;
    const patch = move.onChange;
    if (!inv || !patch) return;
    if (kind === "lock") patch(toggleLockId(inv, id, box));
    if (kind === "delete") {
      patch(deleteCanvasId(inv, id, box));
      move.select(null);
    }
    if (kind === "copy") patch(duplicateCanvasId(inv, id, box));
  }

  return (
    <div
      data-box={id}
      className={`absolute overflow-visible ${move.editable && selected && !locked ? "touch-none" : ""} ${selected ? "z-[90]" : ""} ${className}`}
      style={{
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.w}%`,
        height: `${box.h}%`,
        zIndex: selected ? 90 : box.z ?? defaults.z ?? 1,
        cursor: move.editable && !locked ? (selected ? "move" : "pointer") : undefined,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (!move.editable) return;
        if (e.pointerType === "mouse") {
          move.select(id);
          if (!locked) move.begin(e, id, defaults, { kind: "move" });
          return;
        }
        // тач/перо: выделение — по «чистому» тапу (pointerup), а не по касанию,
        // иначе листание страницы выделяло бы элементы. Тащить можно только выделенный.
        move.tapDown(e, id);
        if (selected && !locked) move.begin(e, id, defaults, { kind: "move" });
      }}
    >
      <div
        className={`relative h-full w-full ${selected ? "ring-2 ring-[#c4a35e]" : ""} ${locked ? "opacity-90" : ""}`}
        style={{ transform: `rotate(${rot}deg)`, transformOrigin: "center center" }}
      >
        <div className="h-full w-full">{children}</div>
        {move.editable && selected && !locked ? (
          <BoxHandles
            id={id}
            defaults={defaults}
            space="page"
          />
        ) : null}
      </div>
      {move.editable && selected ? (
        <BoxToolbar id={id} defaults={defaults} space="page" locked={locked} nearTop={nearTop} onAct={act} />
      ) : null}
    </div>
  );
}

export function Selectable({
  flat,
  style,
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  flat?: boolean;
}) {
  const ctx = useContext(MoveCtx);
  const box = ctx?.get(id, FLOW_BOX) ?? FLOW_BOX;
  if (box.hidden) return null;
  if (!ctx) return <div className={className} style={style}>{children}</div>;

  const selected = ctx.editable && ctx.selected === id;
  const locked = !!box.locked;
  const customSize = box.h > 0;
  const cw = ctx.canvas()?.offsetWidth || 390;
  const canvas = ctx.canvas();
  const node = canvas?.querySelector(`[data-box="${id}"]`) as HTMLElement | null;
  const nearTop = node && canvas ? node.getBoundingClientRect().top - canvas.getBoundingClientRect().top < 56 : false;
  const move = ctx;

  function act(kind: "lock" | "delete" | "copy") {
    const inv = move.invitation;
    const patch = move.onChange;
    if (!inv || !patch) return;
    if (kind === "lock") patch(toggleLockId(inv, id, box));
    if (kind === "delete") {
      patch(deleteCanvasId(inv, id, box));
      move.select(null);
    }
    if (kind === "copy") patch(duplicateCanvasId(inv, id, box));
  }

  return (
    <div
      data-box={id}
      className={`relative overflow-visible ${ctx.editable && selected && !locked ? "touch-none" : ""} ${selected ? "z-[90]" : ""} ${ctx.editable && !selected ? "hover:ring-1 hover:ring-[#c4a35e]/70" : ""} ${className}`}
      style={{
        ...style,
        transform: `translate(${(box.x / 100) * cw}px, ${(box.y / 100) * cw}px)${flat ? ` rotate(${box.r ?? 0}deg)` : ""}`,
        width: customSize || box.w !== 100 ? `${(box.w / 100) * cw}px` : undefined,
        // A resized block's height is a floor, not a ceiling: if its content later needs
        // more room (e.g. a bigger font size), the block must grow and push the flow below
        // it down, rather than clipping/overlapping — a fixed `height` would do the latter.
        minHeight: customSize ? `${(box.h / 100) * cw}px` : undefined,
        cursor: ctx.editable && !locked ? (selected ? "move" : "pointer") : undefined,
      }}
      onPointerDownCapture={(e) => {
        if (!ctx.editable || e.pointerType !== "mouse") return;
        const hit = (e.target as HTMLElement).closest("[data-box]");
        if (hit && hit !== e.currentTarget) return;
        ctx.select(id);
      }}
      onPointerDown={(e) => {
        if (!ctx.editable) return;
        const hit = (e.target as HTMLElement).closest("[data-box]");
        if (hit && hit !== e.currentTarget) return;
        e.stopPropagation();
        const touch = e.pointerType !== "mouse";
        const onControl = isControl(e.target as HTMLElement, touch);
        // тач/перо: выделение — по «чистому» тапу (pointerup); тащить можно только выделенный
        if (touch) ctx.tapDown(e, id);
        if (!locked && !onControl && (!touch || selected)) {
          ctx.begin(e, id, FLOW_BOX, { kind: "move" }, "flow");
        }
      }}
    >
      <div
        className={`relative h-full w-full ${selected ? "ring-2 ring-[#c4a35e]" : ""} ${locked ? "opacity-90" : ""}`}
        style={flat ? { display: "contents" } : { transform: `rotate(${box.r ?? 0}deg)`, transformOrigin: "center center" }}
      >
        {children}
        {selected && !locked ? <BoxHandles id={id} defaults={FLOW_BOX} space="flow" /> : null}
      </div>
      {selected ? <BoxToolbar canDuplicate={!flat} id={id} defaults={FLOW_BOX} space="flow" locked={locked} nearTop={nearTop} onAct={act} /> : null}
    </div>
  );
}
