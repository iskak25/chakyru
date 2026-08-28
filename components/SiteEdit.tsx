"use client";

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
  return (
    <Selectable id={`photo-${slot}`} className={className}>
      <div className="relative h-full w-full overflow-hidden">
        <img src={url} alt="" className={imgClass} />
        {onChange ? (
          <label
            className="absolute bottom-2 right-2 z-[3] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#161616] shadow"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onChange(patchGallery(invitation, slot, String(reader.result ?? "")));
                reader.readAsDataURL(file);
              }}
            />
            <ImagePlus size={14} />
          </label>
        ) : null}
      </div>
    </Selectable>
  );
}
