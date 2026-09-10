"use client";

/* eslint-disable @next/next/no-img-element -- User-selected media is displayed directly, including Firebase download URLs. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { Invitation } from "@/lib/types";
import { weddingStyle, weddingValue, type WeddingPartInfo } from "@/lib/weddingEditor";
import { MoveCanvas, Selectable } from "./MoveCanvas";
import { ExtraLayer } from "./ExtraLayer";
import type { InvitePatch } from "./CanvasEdit";
import type { ReferenceCrop } from "@/lib/referenceWeddings";

type EditorContext = {
  invitation: Invitation;
  onChange?: InvitePatch;
  register: (part: WeddingPartInfo) => void;
};
const Context = createContext<EditorContext | null>(null);

export function WeddingEditor({ invitation, onChange, selected: controlledSelected, onSelect, onPartsChange, locale, children }: {
  invitation: Invitation; onChange?: InvitePatch; selected?: string | null; onSelect?: (id: string | null) => void; onPartsChange?: (parts: WeddingPartInfo[]) => void; locale: string; children: ReactNode;
}) {
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const selected = controlledSelected === undefined ? localSelected : controlledSelected;
  const [parts, setParts] = useState<WeddingPartInfo[]>([]);
  const register = useCallback((part: WeddingPartInfo) => {
    setParts(current => current.some(item => item.id === part.id) ? current : [...current, part]);
  }, []);
  const select = useCallback((id: string | null) => { setLocalSelected(id); onSelect?.(id); }, [onSelect]);
  const context = useMemo(() => ({ invitation, onChange, register }), [invitation, onChange, register]);
  useEffect(() => { onPartsChange?.(parts); }, [parts, onPartsChange]);
  return (
    <Context.Provider value={context}>
      <MoveCanvas editable={!!onChange} selected={selected} layout={invitation.layout} onLayout={onChange ? layout => onChange({ layout }) : undefined} onChange={onChange} onSelect={select} invitation={invitation} height="auto">
        {children}
        <ExtraLayer invitation={invitation} onChange={onChange} locale={locale} />
      </MoveCanvas>
    </Context.Provider>
  );
}

export function WeddingPart({ id, label, kind = "block", fallback, field, slot, className = "", style, children, crop, renderText }: WeddingPartInfo & {
  className?: string; style?: CSSProperties; children?: ReactNode; crop?: ReferenceCrop; renderText?: (value: string) => ReactNode;
}) {
  const context = useContext(Context);
  if (!context) throw new Error("WeddingPart requires WeddingEditor");
  const { invitation, onChange, register } = context;
  useEffect(() => {
    if (onChange) register({ id, label, kind, fallback, field, slot });
  }, [register, onChange, id, label, kind, fallback, field, slot]);
  const color = invitation.blockColors?.[id];
  const fontSize = weddingStyle(invitation, id, "fontSize");
  const alignment = weddingStyle(invitation, id, "align");
  const opacity = weddingStyle(invitation, id, "opacity");
  const radius = weddingStyle(invitation, id, "radius");
  const partStyle: CSSProperties = {
    ...style,
    ...(kind === "block" ? { backgroundColor: color ?? style?.backgroundColor } : { color: color ?? style?.color }),
    ...(fontSize ? { fontSize: `${Number(fontSize)}px` } : {}),
    ...(alignment && ["left", "center", "right"].includes(alignment) ? { textAlign: alignment as CSSProperties["textAlign"] } : {}),
    ...(opacity ? { opacity: Number(opacity) / 100 } : {}),
    ...(radius ? { borderRadius: `${Number(radius)}px` } : {}),
    fontFamily: weddingStyle(invitation, id, "fontFamily") || style?.fontFamily,
  };
  const value = weddingValue(invitation, { id, label, kind, fallback, field, slot });
  return (
    <Selectable flat id={id} className={onChange ? className.replaceAll("overflow-hidden", "overflow-visible") : className} style={partStyle}>
      {kind === "text" ? renderText ? renderText(value) : <p className="whitespace-pre-line" data-wedding-text={id}>{id === "names" ? value.replace(/\s*&\s*/g, "\n&\n") : value}</p> : kind === "image" ? (
        crop && !invitation.gallery?.[slot || id] ? <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: "inherit" }}>
          <img src={crop.source} alt={label} draggable={false} style={{ position: "absolute", maxWidth: "none", width: `${crop.width / crop.w * 100}%`, height: `${crop.height / crop.h * 100}%`, left: `${-crop.x / crop.w * 100}%`, top: `${-crop.y / crop.h * 100}%` }} />
        </div> : <img src={invitation.gallery?.[slot || id] ?? fallback ?? ""} alt={label} className="h-full w-full object-cover" style={{ objectPosition: weddingStyle(invitation, id, "objectPosition") || "center", borderRadius: "inherit" }} />
      ) : children}
    </Selectable>
  );
}
