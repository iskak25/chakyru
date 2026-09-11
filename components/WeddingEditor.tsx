"use client";

/* eslint-disable @next/next/no-img-element -- User-selected media is displayed directly, including Firebase download URLs. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Invitation } from "@/lib/types";
import { weddingStyle, weddingTextPatch, weddingValue, type WeddingPartInfo } from "@/lib/weddingEditor";
import { MoveCanvas, Selectable } from "./MoveCanvas";
import { ExtraLayer } from "./ExtraLayer";
import type { InvitePatch } from "./CanvasEdit";
import type { ReferenceCrop } from "@/lib/referenceWeddings";
import { invitationText } from "@/lib/inviteTranslations";
import { restoredTemplateImage, templateImageSource } from "@/lib/templateImageSources";

type EditorContext = {
  locale: string;
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
    setParts(current => {
      const previous = current.find(item => item.id === part.id);
      if (previous && JSON.stringify(previous) === JSON.stringify(part)) return current;
      return previous ? current.map(item => item.id === part.id ? part : item) : [...current, part];
    });
  }, []);
  const select = useCallback((id: string | null) => { setLocalSelected(id); onSelect?.(id); }, [onSelect]);
  const context = useMemo(() => ({ invitation, onChange, register, locale }), [invitation, onChange, register, locale]);
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
  const { invitation, onChange, register, locale } = context;
  const translatedFallback = fallback === undefined ? undefined : invitationText(fallback, locale);
  const translatedLabel = invitationText(label, locale);
  useEffect(() => {
    if (onChange) register({ id, label: translatedLabel, kind, fallback: translatedFallback, field, slot });
  }, [register, onChange, id, translatedLabel, kind, translatedFallback, field, slot]);
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
  const rawValue = weddingValue(invitation, { id, label, kind, fallback, field, slot });
  const restored = restoredTemplateImage(crop);
  const value = kind === "text" ? invitationText(rawValue, locale) : rawValue;
  return (
    <Selectable flat id={id} className={onChange ? className.replaceAll("overflow-hidden", "overflow-visible") : className} style={partStyle}>
      {kind === "text" ? onChange ? (
        <WeddingInlineText
          dataId={id}
          value={value}
          placeholder={translatedFallback || translatedLabel}
          onChange={next => onChange(weddingTextPatch(invitation, { id, label, kind, fallback, field, slot }, next))}
        />
      ) : renderText ? renderText(value) : <p className="whitespace-pre-line" data-wedding-text={id}>{id === "names" ? value.replace(/\s*&\s*/g, "\n&\n") : value}</p> : kind === "image" ? (
        restored && !invitation.gallery?.[slot || id] ? <img src={restored.source} width={restored.width} height={restored.height} alt={translatedLabel} draggable={false} className="absolute inset-0 h-full w-full" style={{ objectFit: restored.fit, objectPosition: weddingStyle(invitation, id, "objectPosition") || "center", borderRadius: "inherit" }} /> : crop && !invitation.gallery?.[slot || id] ? <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: "inherit" }}>
          <img src={templateImageSource(crop.source)} alt={translatedLabel} draggable={false} style={{ position: "absolute", maxWidth: "none", width: `${crop.width / crop.w * 100}%`, height: `${crop.height / crop.h * 100}%`, left: `${-crop.x / crop.w * 100}%`, top: `${-crop.y / crop.h * 100}%` }} />
        </div> : <img src={invitation.gallery?.[slot || id] ?? fallback ?? ""} alt={label} className="h-full w-full object-cover" style={{ objectPosition: weddingStyle(invitation, id, "objectPosition") || "center", borderRadius: "inherit" }} />
      ) : children}
    </Selectable>
  );
}

function WeddingInlineText({ dataId, value, placeholder, onChange }: {
  dataId: string; value: string; placeholder: string; onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);
  useEffect(() => { fit(); }, [value, fit]);
  return (
    <textarea
      ref={ref}
      rows={1}
      data-wedding-text={dataId}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onInput={fit}
      className="w-full resize-none overflow-hidden whitespace-pre-line rounded-sm border-none bg-transparent p-0 font-[inherit] leading-[inherit] outline-none ring-1 ring-transparent scrollbar-none hover:ring-gold/60 focus:ring-gold"
    />
  );
}
