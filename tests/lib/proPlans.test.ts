import { describe, expect, it } from "vitest";
import {
  isProPlanMonths,
  normalizeStoredProMonths,
  proBonusMonths,
  proGrantMonths,
  proPlanPrice,
} from "@/lib/proPlans";

describe("Pro plans", () => {
  it("costs 1500 for a month and 10000 for six months", () => {
    expect(proPlanPrice(1)).toBe(1500);
    expect(proPlanPrice(6)).toBe(10000);
  });
  it("gives six bonus months with the half-year plan, so a year in total", () => {
    expect(proBonusMonths(6)).toBe(6);
    expect(proGrantMonths(6)).toBe(12);
    expect(proBonusMonths(1)).toBe(0);
    expect(proGrantMonths(1)).toBe(1);
  });
  it("accepts only the offered periods when buying", () => {
    expect([1, 6].every(isProPlanMonths)).toBe(true);
    for (const bad of [0, 2, 3, 12, "6", null, undefined]) expect(isProPlanMonths(bad)).toBe(false);
  });
  it("still honours an old pending 3-month purchase", () => {
    expect(normalizeStoredProMonths(3)).toBe(3);
    expect(proGrantMonths(3)).toBe(3);
    expect(normalizeStoredProMonths("x")).toBe(1);
  });
});
