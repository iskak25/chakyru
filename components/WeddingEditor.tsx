"use client";

/* eslint-disable @next/next/no-img-element -- User-selected media is displayed directly, including Firebase download URLs. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ImagePlus } from "lucide-react";
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
  nextSectionIndex: () => number;
};
const Context = createContext<EditorContext | null>(null);

// Reveal-on-scroll for guest-facing invitations: each section observes the
// viewport once, then every element inside cascades in with a short delay
// based on its order. The entrance style (fade/slide/zoom/rotate/blur) is
// picked per element so the page doesn't look like one animation repeated,
// and the slide direction for card-like blocks alternates both across
// sections and from one card to the next within a section.
const STAGGER_STEP_MS = 120;
const STAGGER_MAX_STEPS = 6;
type StaggerContextValue = { visible: boolean; sectionSide: 0 | 1; nextIndex: () => number };
const StaggerContext = createContext<StaggerContextValue | null>(null);

function SectionReveal({ sectionSide, children }: { sectionSide: 0 | 1; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const counter = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const value = useMemo<StaggerContextValue>(() => ({ visible, sectionSide, nextIndex: () => counter.current++ }), [visible, sectionSide]);
  return (
    <div ref={ref} className={`rv-fade ${visible ? "is-in" : ""}`}>
      <StaggerContext.Provider value={value}>{children}</StaggerContext.Provider>
    </div>
  );
}

function isHeadingLike(kind: WeddingPartInfo["kind"], id: string, className: string): boolean {
  if (kind !== "text") return false;
  if (/-title$|-heading$|-overline$|(^|-)names$/.test(id)) return true;
  const size = className.match(/text-\[(\d+)px\]/);
  return !!size && Number(size[1]) >= 16;
}

function pickRevealVariant(kind: WeddingPartInfo["kind"], id: string, className: string, side: 0 | 1): string {
  if (/^(decoration|ornament|mountains|heart)\b/.test(id)) return "rv-blur";
  if (kind === "image") return "rv-zoom";
  if (kind === "widget") return "rv-scale";
  if (kind === "decoration") return "rv-blur";
  if (/wish|review|testimonial|quote/i.test(id)) return "rv-rotate";
  if (isHeadingLike(kind, id, className)) return "rv-down";
  if (kind === "block") return side === 0 ? "rv-left" : "rv-right";
  return "rv-fade";
}

function useReveal(kind: WeddingPartInfo["kind"], id: string, className: string): { className: string; style?: CSSProperties } {
  const ctx = useContext(StaggerContext);
  const indexRef = useRef<number | null>(null);
  if (ctx && indexRef.current === null) indexRef.current = ctx.nextIndex();
  if (!ctx || indexRef.current === null) return { className: "" };
  const side: 0 | 1 = (ctx.sectionSide + indexRef.current) % 2 === 0 ? 0 : 1;
  const variant = pickRevealVariant(kind, id, className, side);
  const delay = Math.min(indexRef.current, STAGGER_MAX_STEPS) * STAGGER_STEP_MS;
  return { className: `${variant} ${ctx.visible ? "is-in" : ""}`, style: { transitionDelay: `${delay}ms` } };
}

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
  const sectionCounter = useRef(0);
  const nextSectionIndex = useCallback(() => sectionCounter.current++, []);
  const context = useMemo(() => ({ invitation, onChange, register, locale, nextSectionIndex }), [invitation, onChange, register, locale, nextSectionIndex]);
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
  const { invitation, onChange, register, locale, nextSectionIndex } = context;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageDownPos = useRef<{ x: number; y: number } | null>(null);
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
  const revealSection = !onChange && kind === "block" && id.startsWith("section-");
  const sectionSideRef = useRef<0 | 1 | null>(null);
  if (revealSection && sectionSideRef.current === null) sectionSideRef.current = (nextSectionIndex() % 2) as 0 | 1;
  const reveal = useReveal(kind, id, className);
  const baseClassName = onChange ? className.replaceAll("overflow-hidden", "overflow-visible") : className;
  const finalClassName = reveal.className ? `${baseClassName} ${reveal.className}`.trim() : baseClassName;
  const finalStyle: CSSProperties = reveal.style ? { ...partStyle, ...reveal.style } : partStyle;
  const rendered = (
    <Selectable flat id={id} className={finalClassName} style={finalStyle}>
      {kind === "text" ? onChange ? (
        <WeddingInlineText
          dataId={id}
          value={value}
          placeholder={translatedFallback || translatedLabel}
          onChange={next => onChange(weddingTextPatch(invitation, { id, label, kind, fallback, field, slot }, next))}
        />
      ) : renderText ? renderText(value) : <p className="whitespace-pre-line" data-wedding-text={id}>{id === "names" ? value.replace(/\s*&\s*/g, "\n&\n") : value}</p> : kind === "image" ? (
        <div className="relative h-full w-full">
          {restored && !invitation.gallery?.[slot || id] ? <img src={restored.source} width={restored.width} height={restored.height} alt={translatedLabel} draggable={false} className="absolute inset-0 h-full w-full" style={{ objectFit: restored.fit, objectPosition: weddingStyle(invitation, id, "objectPosition") || "center", borderRadius: "inherit" }} /> : crop && !invitation.gallery?.[slot || id] ? <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: "inherit" }}>
            <img src={templateImageSource(crop.source)} alt={translatedLabel} draggable={false} style={{ position: "absolute", maxWidth: "none", width: `${crop.width / crop.w * 100}%`, height: `${crop.height / crop.h * 100}%`, left: `${-crop.x / crop.w * 100}%`, top: `${-crop.y / crop.h * 100}%` }} />
          </div> : <img src={invitation.gallery?.[slot || id] ?? fallback ?? ""} alt={label} className="h-full w-full object-cover" style={{ objectPosition: weddingStyle(invitation, id, "objectPosition") || "center", borderRadius: "inherit" }} />}
          {onChange ? (
            <>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => onChange({ gallery: { ...(invitation.gallery ?? {}), [slot || id]: String(reader.result ?? "") } });
                  reader.readAsDataURL(file);
                }}
              />
              {/* Full-area tap target so clicking anywhere on the photo opens
                  the device picker (see components/SiteEdit.tsx's SlotPhoto
                  for the same pattern). Selectable's own pointerdown handler
                  still starts a reposition drag for this plain div; the
                  tap-vs-drag decision has to run on "click" rather than
                  "pointerup" because Selectable's drag-start also calls
                  canvas.setPointerCapture on every pointerdown (not just real
                  drags), which retargets pointerup away from this div, while
                  the mouse-compatibility "click" event is unaffected. */}
              <div
                className="absolute inset-0 z-[2] cursor-pointer"
                onPointerDown={e => {
                  imageDownPos.current = { x: e.clientX, y: e.clientY };
                }}
                onClick={e => {
                  const start = imageDownPos.current;
                  imageDownPos.current = null;
                  const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 0;
                  if (moved < 5) imageInputRef.current?.click();
                }}
              />
              <span className="pointer-events-none absolute bottom-2 right-2 z-[3] flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#161616] shadow">
                <ImagePlus size={14} />
              </span>
            </>
          ) : null}
        </div>
      ) : children}
    </Selectable>
  );
  if (revealSection) return <SectionReveal sectionSide={sectionSideRef.current ?? 0}>{rendered}</SectionReveal>;
  return rendered;
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
