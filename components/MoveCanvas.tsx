"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Copy, Lock, RefreshCw, Trash2, Unlock } from "lucide-react";
import type { Invitation, LayoutBox, LayoutMap } from "@/lib/types";
import type { InvitePatch } from "./CanvasEdit";
import { deleteCanvasId, duplicateCanvasId, toggleLockId } from "@/lib/canvasOps";
import { rememberCanvasPointer, dropBox, getPendingPlace, pointOnCanvas, setPendingPlace, subscribePendingPlace } from "@/lib/canvasPointer";

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
  onChange?: InvitePatch;
  invitation?: Invitation;
};

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
          className={`absolute z-[91] h-3 w-3 rounded-full border border-white bg-[#c4a35e] shadow ${HANDLE_CLASS[handle]}`}
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
  onAct: (kind: "lock" | "delete" | "copy") => void;
}) {
  const ctx = useContext(MoveCtx);
  if (!ctx) return null;
  return (
    <>
      {!locked ? (
        <button
          type="button"
          aria-label="rotate"
          data-export-hide
          className="absolute left-1/2 z-[92] flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border bg-white shadow"
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
      {ctx.onChange && ctx.invitation ? (
        <div
          data-export-hide
          className="absolute left-1/2 z-[93] flex -translate-x-1/2 items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-md"
          style={{
            top: nearTop ? (locked ? "calc(100% + 8px)" : "calc(100% + 40px)") : locked ? "-52px" : "-84px",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button type="button" aria-label="lock" className="text-[#2b7fff]" onClick={() => onAct("lock")}>
            {locked ? <Lock size={18} /> : <Unlock size={18} />}
          </button>
          <button type="button" aria-label="delete" className="text-[#2b7fff]" onClick={() => onAct("delete")}>
            <Trash2 size={18} />
          </button>
          <button type="button" aria-label="duplicate" className="text-[#2b7fff]" onClick={() => onAct("copy")}>
            <Copy size={18} />
          </button>
        </div>
      ) : null}
    </>
  );
}

export function MoveCanvas({
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
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<LayoutMap>({});
  const [dragging, setDragging] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!editable) return;
    const sync = () => setPlacing(!!getPendingPlace());
    sync();
    return subscribePendingPlace(sync);
  }, [editable]);

  useEffect(() => {
    if (!placing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPendingPlace(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [placing]);

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
    box: LayoutBox;
    active: boolean;
    cx: number;
    cy: number;
    startAngle: number;
  } | null>(null);

  const merged: LayoutMap = { ...(layout ?? {}), ...draft };

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
      const onControl = !!t.closest("input, textarea, select, a, button, label");
      e.stopPropagation();
      select(id);
      const rect = canvas.getBoundingClientRect();
      const cw = Math.max(rect.width, 1);
      const ch = Math.max(rect.height, 1);
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
    const px = e.clientX - d.startX;
    const py = e.clientY - d.startY;
    if (!d.active) {
      if (Math.hypot(px, py) < 5) return;
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
        onChange,
        invitation,
      }}
    >
      <div
        ref={ref}
        data-invite-canvas
        className={`relative ${placing ? "cursor-crosshair" : ""} ${height === "auto" ? "" : "h-full"} ${className}`}
        style={{
          ...(height === "auto"
            ? { height: "auto", minHeight: "100%" }
            : height != null
              ? { height, minHeight: height }
              : { height: "100%" }),
          background,
        }}
        onPointerDownCapture={(e) => {
          const p = getPendingPlace();
          if (!p || !editable || !onChange) return;
          const canvas = ref.current;
          if (!canvas) return;
          const at = pointOnCanvas(e.clientX, e.clientY, canvas);
          const id = crypto.randomUUID();
          onChange({
            extras: [...(invitation?.extras ?? []), { ...p.item, id }],
            layout: { ...(invitation?.layout ?? {}), [id]: dropBox(p.w, p.h, p.z, at) },
          });
          setPendingPlace(null);
          select(id);
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerDown={() => {
          if (editable) select(null);
        }}
        onPointerMove={(e) => {
          if (editable && !drag.current) {
            rememberCanvasPointer(e.clientX, e.clientY, e.currentTarget);
          }
          applyMove(e);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
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
      className={`absolute overflow-visible ${move.editable && move.dragging && selected && !locked ? "touch-none" : ""} ${selected ? "z-[90]" : ""} ${className}`}
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
        move.select(id);
        if (!locked) move.begin(e, id, defaults, { kind: "move" });
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
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(MoveCtx);
  const box = ctx?.get(id, FLOW_BOX) ?? FLOW_BOX;
  if (box.hidden) return null;
  if (!ctx) return <div className={className}>{children}</div>;

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
      className={`relative overflow-visible ${ctx.editable && ctx.dragging && selected && !locked ? "touch-none" : ""} ${selected ? "z-[90]" : ""} ${ctx.editable && !selected ? "hover:ring-1 hover:ring-[#c4a35e]/70" : ""} ${className}`}
      style={{
        transform: `translate(${(box.x / 100) * cw}px, ${(box.y / 100) * cw}px)`,
        width: customSize ? `${(box.w / 100) * cw}px` : undefined,
        height: customSize ? `${(box.h / 100) * cw}px` : undefined,
        cursor: ctx.editable && !locked ? (selected ? "move" : "pointer") : undefined,
      }}
      onPointerDownCapture={(e) => {
        if (!ctx.editable) return;
        const hit = (e.target as HTMLElement).closest("[data-box]");
        if (hit && hit !== e.currentTarget) return;
        ctx.select(id);
      }}
      onPointerDown={(e) => {
        if (!ctx.editable) return;
        const hit = (e.target as HTMLElement).closest("[data-box]");
        if (hit && hit !== e.currentTarget) return;
        e.stopPropagation();
        const onControl = !!(e.target as HTMLElement).closest("input, textarea, select, a, button, label");
        if (!locked && !onControl) ctx.begin(e, id, FLOW_BOX, { kind: "move" }, "flow");
      }}
    >
      <div
        className={`relative h-full w-full ${selected ? "ring-2 ring-[#c4a35e]" : ""} ${locked ? "opacity-90" : ""}`}
        style={{ transform: `rotate(${box.r ?? 0}deg)`, transformOrigin: "center center" }}
      >
        {children}
        {selected && !locked ? <BoxHandles id={id} defaults={FLOW_BOX} space="flow" /> : null}
      </div>
      {selected ? <BoxToolbar id={id} defaults={FLOW_BOX} space="flow" locked={locked} nearTop={nearTop} onAct={act} /> : null}
    </div>
  );
}
