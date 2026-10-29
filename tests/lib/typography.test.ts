import { describe, expect, it } from "vitest";
import { safeLetterSpacing, safeLineHeight } from "@/lib/typography";

describe("безопасные пределы интервалов", () => {
  it("пустое и нечисловое значение означает «по шаблону»", () => {
    for (const raw of [undefined, "", "  ", "abc", "NaN", "Infinity"]) {
      expect(safeLineHeight(raw)).toBeNull();
      expect(safeLetterSpacing(raw)).toBeNull();
    }
  });
  it("межстрочный ограничен 0.9–2.5, принимает запятую", () => {
    expect(safeLineHeight("1,4")).toBe(1.4);
    expect(safeLineHeight("0")).toBe(0.9);
    expect(safeLineHeight("99")).toBe(2.5);
  });
  it("межбуквенный ограничен −1…12 px", () => {
    expect(safeLetterSpacing("2.5")).toBe(2.5);
    expect(safeLetterSpacing("-50")).toBe(-1);
    expect(safeLetterSpacing("500")).toBe(12);
  });
});
