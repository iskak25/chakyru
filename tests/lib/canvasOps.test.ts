import { describe, expect, it } from "vitest";
import { deleteCanvasId, duplicateCanvasId, toggleLockId } from "@/lib/canvasOps";
import type { CanvasItem } from "@/lib/types";
import { makeInvitation } from "../fixtures";

const extra = { id: "e1", kind: "text", text: "Привет", shape: "square", color: "#000", fontSize: 20 } as CanvasItem;

describe("deleteCanvasId", () => {
  it("removes an added element and its layout", () => {
    const inv = makeInvitation({ extras: [extra], layout: { e1: { x: 1, y: 1, w: 1, h: 1 }, other: { x: 2, y: 2, w: 2, h: 2 } } });
    const patch = deleteCanvasId(inv, "e1");
    expect(patch.extras).toEqual([]);
    expect(patch.layout).toEqual({ other: { x: 2, y: 2, w: 2, h: 2 } });
  });
  it("hides a template block instead of deleting it", () => {
    const inv = makeInvitation({ layout: { names: { x: 5, y: 6, w: 7, h: 8 } } });
    expect(deleteCanvasId(inv, "names").layout?.names).toEqual({ x: 5, y: 6, w: 7, h: 8, hidden: true });
  });
  it("uses the current box or a default for blocks without layout", () => {
    const inv = makeInvitation();
    expect(deleteCanvasId(inv, "x", { x: 9, y: 9, w: 9, h: 9 }).layout?.x).toMatchObject({ x: 9, hidden: true });
    expect(deleteCanvasId(inv, "x").layout?.x).toMatchObject({ x: 18, y: 18, hidden: true });
  });
});

describe("duplicateCanvasId", () => {
  it("copies an extra with a new id and offset box", () => {
    const inv = makeInvitation({ extras: [extra], layout: { e1: { x: 10, y: 10, w: 20, h: 5, locked: true } } });
    const patch = duplicateCanvasId(inv, "e1");
    expect(patch.extras).toHaveLength(2);
    const copy = patch.extras![1];
    expect(copy.id).not.toBe("e1");
    expect(copy.text).toBe("Привет");
    expect(patch.layout?.[copy.id]).toMatchObject({ x: 14, y: 14, locked: false, hidden: false, z: 40 });
    expect(patch.layout?.e1).toBeDefined();
  });
  it("keeps the offset inside the canvas", () => {
    const inv = makeInvitation({ extras: [extra], layout: { e1: { x: 69, y: 88, w: 1, h: 1 } } });
    const patch = duplicateCanvasId(inv, "e1");
    const box = patch.layout?.[patch.extras![1].id];
    expect(box?.x).toBe(70);
    expect(box?.y).toBe(88);
  });
  it("snapshots a template photo as an image extra", () => {
    const inv = makeInvitation({ gallery: { hero: "hero.jpg" } });
    const item = duplicateCanvasId(inv, "photo-hero").extras![0];
    expect(item.kind).toBe("image");
    expect(item.src).toBe("hero.jpg");
  });
  it("snapshots named text blocks", () => {
    expect(duplicateCanvasId(makeInvitation({ names: "А & Б" }), "names").extras![0].text).toBe("А & Б");
    expect(duplicateCanvasId(makeInvitation({ hosts: "Семья" }), "hosts").extras![0].text).toBe("Семья");
    expect(duplicateCanvasId(makeInvitation({ message: "Приглашаем" }), "message").extras![0].text).toBe("Приглашаем");
  });
  it("prefers edited copy for text blocks", () => {
    expect(duplicateCanvasId(makeInvitation({ copy: { names: "Правка" }, names: "Оригинал" }), "names").extras![0].text).toBe("Правка");
  });
});

describe("toggleLockId", () => {
  it("toggles the lock", () => {
    const inv = makeInvitation({ layout: { a: { x: 1, y: 1, w: 1, h: 1 } } });
    const locked = toggleLockId(inv, "a");
    expect(locked.layout?.a.locked).toBe(true);
    expect(toggleLockId(makeInvitation({ layout: locked.layout }), "a").layout?.a.locked).toBe(false);
  });
});
