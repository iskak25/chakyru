import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEDDING_PROGRAM, restoreWeddingPart, safeWeddingLink, weddingProgram, weddingStyle, weddingStylePatch,
  weddingTextPatch, weddingValue, type WeddingPartInfo,
} from "@/lib/weddingEditor";
import { makeInvitation } from "../fixtures";

const part = (over: Partial<WeddingPartInfo> = {}): WeddingPartInfo => ({ id: "p1", label: "P", kind: "text", ...over });

describe("weddingValue", () => {
  it("prefers the bound invitation field", () => {
    expect(weddingValue(makeInvitation({ hosts: "Искак" }), part({ field: "hosts", fallback: "x" }))).toBe("Искак");
  });
  it("falls back to copy, then the fallback, then empty", () => {
    expect(weddingValue(makeInvitation({ copy: { p1: "custom" } }), part({ fallback: "x" }))).toBe("custom");
    expect(weddingValue(makeInvitation(), part({ fallback: "x" }))).toBe("x");
    expect(weddingValue(makeInvitation(), part())).toBe("");
  });
  it("uses copy when the bound field is empty", () => {
    expect(weddingValue(makeInvitation({ hosts: "", copy: { p1: "copy" } }), part({ field: "hosts" }))).toBe("copy");
  });
  it("keeps an empty copy override instead of the fallback", () => {
    expect(weddingValue(makeInvitation({ copy: { p1: "" } }), part({ fallback: "x" }))).toBe("");
  });
});

describe("weddingTextPatch", () => {
  it("writes copy and the bound field", () => {
    const inv = makeInvitation({ copy: { other: "1" } });
    expect(weddingTextPatch(inv, part({ field: "hosts" }), "Новые")).toEqual({ copy: { other: "1", p1: "Новые" }, hosts: "Новые" });
  });
  it("writes copy only for unbound parts", () => {
    expect(weddingTextPatch(makeInvitation(), part(), "v")).toEqual({ copy: { p1: "v" } });
  });
});

describe("styles", () => {
  it("round-trips a style value", () => {
    const inv = makeInvitation();
    const patch = weddingStylePatch(inv, "p1", "color", "#fff");
    expect(patch.copy).toEqual({ "$color:p1": "#fff" });
    expect(weddingStyle(makeInvitation(patch), "p1", "color")).toBe("#fff");
    expect(weddingStyle(inv, "p1", "color")).toBeUndefined();
  });
});

describe("restoreWeddingPart", () => {
  it("unhides an existing box", () => {
    const inv = makeInvitation({ layout: { p1: { x: 1, y: 2, w: 3, h: 4, hidden: true } } });
    expect(restoreWeddingPart(inv, "p1").layout?.p1).toEqual({ x: 1, y: 2, w: 3, h: 4, hidden: false });
  });
  it("creates a default box when none exists", () => {
    expect(restoreWeddingPart(makeInvitation(), "p1").layout?.p1).toEqual({ x: 0, y: 0, w: 100, h: 0, hidden: false });
  });
});

describe("safeWeddingLink", () => {
  it.each(["https://a.kg/x", "http://a.kg", "tel:+996700", "mailto:a@b.c", "/relative", "#anchor"])("accepts %s", (v) => {
    expect(safeWeddingLink(v)).toBe(v);
  });
  it.each(["javascript:alert(1)", "data:text/html,x", "//evil.com", "ftp://x", ""])("rejects %s", (v) => {
    expect(safeWeddingLink(v)).toBe("#");
  });
  it("trims whitespace", () => {
    expect(safeWeddingLink("  https://a.kg  ")).toBe("https://a.kg");
  });
});

describe("weddingProgram", () => {
  const program = (raw?: string) => weddingProgram(makeInvitation({ copy: raw === undefined ? {} : { "wedding.program": raw } }));
  it("defaults when missing or malformed", () => {
    expect(program()).toBe(DEFAULT_WEDDING_PROGRAM);
    expect(program("{bad json")).toBe(DEFAULT_WEDDING_PROGRAM);
    expect(program(JSON.stringify({ not: "array" }))).toBe(DEFAULT_WEDDING_PROGRAM);
    expect(program(JSON.stringify([{ id: "a" }]))).toBe(DEFAULT_WEDDING_PROGRAM);
  });
  it("uses a valid custom program, capped at 40 rows", () => {
    const items = Array.from({ length: 45 }, (_, i) => ({ id: `i${i}`, time: "10:00", title: "T", subtitle: "", icon: "x" }));
    expect(program(JSON.stringify(items.slice(0, 2)))).toHaveLength(2);
    expect(program(JSON.stringify(items))).toHaveLength(40);
  });
});
