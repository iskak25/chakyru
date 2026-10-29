import { describe, expect, it } from "vitest";
import { getDict } from "@/lib/i18n";

// Буквы, которых нет в русском: если они в русской части словаря — туда попал кыргызский текст.
const KYRGYZ_ONLY = /[ңөүҢӨҮ]/;

function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, i) => strings(item, `${path}[${i}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}

describe("словарь", () => {
  it("в русской части нет кыргызских букв ң ө ү", () => {
    const bad = strings(getDict("ru")).filter(([, text]) => KYRGYZ_ONLY.test(text));
    expect(bad).toEqual([]);
  });

  it("известные опечатки исправлены", () => {
    const all = strings(getDict("ky")).map(([, text]) => text).join("\n");
    expect(all).not.toContain("кела албайм");
    expect(getDict("ky").site3d.rsvpNo).toBe("Өкүнүчтүүсү, келе албайм");
  });
});
