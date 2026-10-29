import { describe, expect, it } from "vitest";
import { formatPosition, parsePosition, photoFrameStyle, safeZoom } from "@/lib/photoCrop";

describe("кадрирование фото", () => {
  it("прежние ключевые слова работают как раньше", () => {
    expect(parsePosition("top")).toEqual({ x: 50, y: 0 });
    expect(parsePosition("right")).toEqual({ x: 100, y: 50 });
    expect(parsePosition(undefined)).toEqual({ x: 50, y: 50 });
  });
  it("«X% Y%» разбирается и ограничивается 0–100, мусор даёт центр", () => {
    expect(parsePosition("20% 80%")).toEqual({ x: 20, y: 80 });
    expect(parsePosition("500% -5%")).toEqual({ x: 100, y: 0 });
    expect(parsePosition("url(x) 1px")).toEqual({ x: 50, y: 50 });
    expect(formatPosition(33.4, 120)).toBe("33% 100%");
  });
  it("масштаб 1–3, пустое и нечисловое значение — без увеличения", () => {
    expect(safeZoom(undefined)).toBe(1);
    expect(safeZoom("")).toBe(1);
    expect(safeZoom("abc")).toBe(1);
    expect(safeZoom("0.2")).toBe(1);
    expect(safeZoom("9")).toBe(3);
    expect(safeZoom("1,5")).toBe(1.5);
  });
  it("при масштабе 1 transform не добавляется, иначе увеличение идёт вокруг фокуса", () => {
    expect(photoFrameStyle("left", undefined)).toEqual({ objectPosition: "0% 50%" });
    expect(photoFrameStyle("20% 80%", "2")).toEqual({ objectPosition: "20% 80%", transform: "scale(2)", transformOrigin: "20% 80%" });
  });
});
