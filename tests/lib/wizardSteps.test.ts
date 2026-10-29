import { describe, expect, it } from "vitest";
import { photoPatch, photoSlots, wizardSteps } from "@/lib/wizardSteps";
import { makeInvitation } from "../fixtures";
import type { WeddingPartInfo } from "@/lib/weddingEditor";

const p = (over: Partial<WeddingPartInfo>): WeddingPartInfo => ({ id: "x", label: "X", kind: "text", ...over });

describe("шаги мастера", () => {
  it("без зарегистрированных частей показываются основные шаги и обложка", () => {
    expect(wizardSteps([])).toEqual(["about", "when", "where", "message", "hosts", "photos"]);
  });
  it("шаг без поддерживаемого поля не показывается", () => {
    const parts = [p({ id: "n", field: "names" }), p({ id: "v", field: "venue" }), p({ id: "photo", kind: "image", slot: "hero" })];
    expect(wizardSteps(parts)).toEqual(["about", "when", "where", "photos", "design"]);
  });
  it("заголовок праздника — отдельная часть eventTitle", () => {
    expect(wizardSteps([p({ id: "eventTitle" })])).toContain("about");
    expect(wizardSteps([p({ id: "m", field: "message" })])).not.toContain("about");
  });
  it("фото: не больше 3 слотов, патч идёт в gallery или в обложку", () => {
    const parts = ["a", "b", "c", "d"].map(id => p({ id, kind: "image", slot: `s-${id}` }));
    expect(photoSlots(parts).map(s => s.key)).toEqual(["s-a", "s-b", "s-c"]);
    const inv = makeInvitation({ gallery: { old: "o.jpg" } });
    expect(photoPatch(inv, parts, "s-a", "n.jpg")).toEqual({ gallery: { old: "o.jpg", "s-a": "n.jpg" } });
    expect(photoPatch(inv, [], null, "n.jpg")).toEqual({ coverImage: "n.jpg" });
  });
});
