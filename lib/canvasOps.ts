import type { CanvasItem, Invitation, LayoutBox, LayoutMap } from "./types";

function fallbackBox(layout: LayoutMap | undefined, id: string, current?: LayoutBox): LayoutBox {
  return layout?.[id] ?? current ?? { x: 18, y: 18, w: 40, h: 8, z: 20 };
}

export function deleteCanvasId(
  inv: Invitation,
  id: string,
  current?: LayoutBox,
): Partial<Invitation> {
  const extra = (inv.extras ?? []).find((e) => e.id === id);
  if (extra) {
    const { [id]: _, ...layout } = inv.layout ?? {};
    return { extras: inv.extras.filter((el) => el.id !== id), layout };
  }
  const box = fallbackBox(inv.layout, id, current);
  return { layout: { ...(inv.layout ?? {}), [id]: { ...box, hidden: true } } };
}

export function duplicateCanvasId(
  inv: Invitation,
  id: string,
  current?: LayoutBox,
): Partial<Invitation> {
  const nid = crypto.randomUUID();
  const src = fallbackBox(inv.layout, id, current);
  const box: LayoutBox = {
    ...src,
    x: Math.min(src.x + 4, 70),
    y: Math.min(src.y + 4, 88),
    locked: false,
    hidden: false,
    z: 40,
  };
  const extra = (inv.extras ?? []).find((e) => e.id === id);
  if (extra) {
    return {
      extras: [...inv.extras, { ...extra, id: nid }],
      layout: { ...(inv.layout ?? {}), [nid]: box },
    };
  }
  const photoSlot = id.startsWith("photo-") ? id.slice("photo-".length) : "";
  const copiedText =
    inv.copy?.[id] ||
    (id === "hosts"
      ? inv.hosts
      : id === "invite" || id === "message"
        ? inv.message
        : id === "address" || id === "venue"
          ? [inv.city, inv.venue, inv.address].filter(Boolean).join("\n")
          : id === "names"
            ? inv.names
            : inv.copy?.[id] || inv.names);
  const snap: CanvasItem = {
    id: nid,
    kind: photoSlot || (id === "cover" && inv.coverImage) ? "image" : "text",
    shape: "square",
    src: photoSlot ? inv.gallery?.[photoSlot] : id === "cover" ? inv.coverImage : undefined,
    text: copiedText,
    color: inv.blockColors?.[id] ?? "#1a1a1a",
    fontSize: 22,
  };
  return {
    extras: [...(inv.extras ?? []), snap],
    layout: { ...(inv.layout ?? {}), [nid]: box },
  };
}

export function toggleLockId(
  inv: Invitation,
  id: string,
  current?: LayoutBox,
): Partial<Invitation> {
  const box = fallbackBox(inv.layout, id, current);
  return { layout: { ...(inv.layout ?? {}), [id]: { ...box, locked: !box.locked } } };
}
