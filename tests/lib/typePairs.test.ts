import { describe, expect, it } from "vitest";
import { TYPE_PAIRS, isHeadingPart, pairCss, typePairPatch } from "@/lib/typePairs";
import { FONT_LIBRARY } from "@/lib/fontLibrary";
import { makeInvitation } from "../fixtures";
import type { WeddingPartInfo } from "@/lib/weddingEditor";

const parts: WeddingPartInfo[] = [
  { id: "hero-names", label: "Имена", kind: "text" },
  { id: "message", label: "Текст", kind: "text" },
  { id: "rsvp-hint", label: "Подсказка", kind: "text" },
  { id: "hero-photo", label: "Фото", kind: "image" },
];

describe("сочетания шрифтов", () => {
  it("их ровно 6, шрифты существуют и поддерживают ң/ө/ү полностью", () => {
    expect(TYPE_PAIRS).toHaveLength(6);
    for (const p of TYPE_PAIRS) for (const id of [p.heading, p.body]) {
      expect(FONT_LIBRARY.find(f => f.id === id)?.ky).toBe("full");
    }
  });
  it("заголовки и основной текст различаются по id", () => {
    expect(isHeadingPart("hero-names")).toBe(true);
    expect(isHeadingPart("programme-title")).toBe(true);
    expect(isHeadingPart("message")).toBe(false);
    expect(isHeadingPart("rsvp-name-label")).toBe(false);
  });
  it("применение меняет только fontFamily текстовых элементов и не трогает прочие данные", () => {
    const inv = makeInvitation({ copy: { "hero-names": "Айдана", "$color:x": "red" } });
    const { copy } = typePairPatch(inv, parts, TYPE_PAIRS[0]) as { copy: Record<string, string> };
    const css = pairCss(TYPE_PAIRS[0]);
    expect(copy["$fontFamily:hero-names"]).toBe(css.heading);
    expect(copy["$fontFamily:message"]).toBe(css.body);
    expect(copy["$fontFamily:hero-photo"]).toBeUndefined();
    expect(copy["hero-names"]).toBe("Айдана");
    expect(copy["$color:x"]).toBe("red");
  });
  it("сброс снимает только fontFamily", () => {
    const inv = makeInvitation({ copy: { "$fontFamily:message": "x", "message": "Привет" } });
    const { copy } = typePairPatch(inv, parts, null) as { copy: Record<string, string> };
    expect(copy["$fontFamily:message"]).toBeUndefined();
    expect(copy.message).toBe("Привет");
  });
});
