"use client";

import { uploadInvitationImage } from "@/lib/uploadImage";

import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import type { Invitation } from "@/lib/types";
import { paint } from "./ExtraLayer";
import { CanvasText, type InvitePatch } from "./CanvasEdit";
import { Selectable } from "./MoveCanvas";

export function fieldValue(inv: Invitation, id: string, fallback: string) {
  const value = inv.copy?.[id];
  return value != null && value !== "" ? value : fallback;
}

export function patchCopy(inv: Invitation, id: string, value: string): Partial<Invitation> {
  return { copy: { ...(inv.copy ?? {}), [id]: value } };
}

export function patchGallery(inv: Invitation, id: string, src: string): Partial<Invitation> {
  return { gallery: { ...(inv.gallery ?? {}), [id]: src } };
}

export function Field({
  invitation,
  onChange,
  id,
  fallback,
  className = "",
  multiline,
  fallbackColor,
}: {
  invitation: Invitation;
  onChange?: InvitePatch;
  id: string;
  fallback: string;
  className?: string;
  multiline?: boolean;
  fallbackColor?: string;
}) {
  const color = paint(invitation, id, fallbackColor ?? "inherit");
  return (
    <Selectable id={id} className="w-full">
      <CanvasText
        value={fieldValue(invitation, id, fallback)}
        placeholder={fallback}
        onChange={onChange ? (value) => onChange(patchCopy(invitation, id, value)) : undefined}
        className={className}
        style={{ color }}
        multiline={multiline}
      />
    </Selectable>
  );
}

// Tap-to-drag threshold (px) below which a pointerdown+pointerup pair on the
// photo counts as a "click to replace" rather than a drag-to-reposition --
// matches the threshold MoveCanvas itself uses to tell a click from a drag.
const TAP_THRESHOLD = 5;

export function SlotPhoto({
  invitation,
  onChange,
  slot,
  src,
  className = "",
  imgClass = "h-full w-full object-cover",
}: {
  invitation: Invitation;
  onChange?: InvitePatch;
  slot: string;
  src: string;
  className?: string;
  imgClass?: string;
}) {
  const url = invitation.gallery?.[slot] || src;
  const inputRef = useRef<HTMLInputElement>(null);
  const downPos = useRef<{ x: number; y: number } | null>(null);
  if (!url && !onChange) return null;
  return (
    <Selectable id={`photo-${slot}`} className={className}>
      <div className="relative h-full w-full overflow-hidden">
        {url ? <img src={url} alt="" className={imgClass} /> : <div className={`bg-black/[0.04] ${imgClass}`} />}
        {onChange ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void uploadInvitationImage(file).then(src => onChange(patchGallery(invitation, slot, src))).catch(error => window.alert(error instanceof Error ? error.message : "Image upload failed"));
              }}
            />
            {/* Covers the whole photo so tapping anywhere opens the device
                picker (like the plain "photo" format), while still letting
                Selectable's own pointerdown handler start a reposition drag --
                it only skips that for clicks on an actual label/input/button.
                Selectable's drag-start also calls canvas.setPointerCapture on
                every plain pointerdown (not just real drags), which retargets
                the matching pointerup away from this div entirely -- so the
                tap-vs-drag decision has to happen on "click" instead, which
                mouse-compatibility events are unaffected by that capture. */}
            <div
              className="absolute inset-0 z-[2] cursor-pointer"
              onPointerDown={(e) => {
                downPos.current = { x: e.clientX, y: e.clientY };
              }}
              onClick={(e) => {
                const start = downPos.current;
                downPos.current = null;
                const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 0;
                if (moved < TAP_THRESHOLD) inputRef.current?.click();
              }}
            />
            <span className="pointer-events-none absolute bottom-2 right-2 z-[3] flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#161616] shadow">
              <ImagePlus size={14} />
            </span>
          </>
        ) : null}
      </div>
    </Selectable>
  );
}
