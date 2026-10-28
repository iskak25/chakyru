import { describe, expect, it } from "vitest";
import { paginate } from "@/lib/pagination";

const list = Array.from({ length: 45 }, (_, i) => i + 1);

describe("paginate", () => {
  it("по 20 на страницу, считает общее число", () => {
    const first = paginate(list, 1, 20);
    expect(first).toMatchObject({ page: 1, pages: 3, total: 45, from: 1, to: 20 });
    expect(first.items).toHaveLength(20);
    expect(paginate(list, 3, 20)).toMatchObject({ from: 41, to: 45, items: [41, 42, 43, 44, 45] });
  });
  it("номер страницы приводится к допустимому", () => {
    expect(paginate(list, 99, 20).page).toBe(3);
    expect(paginate(list, 0, 20).page).toBe(1);
    expect(paginate(list, Number.NaN, 20).page).toBe(1);
  });
  it("пустой список", () => {
    expect(paginate([], 1, 20)).toMatchObject({ items: [], page: 1, pages: 1, total: 0, from: 0, to: 0 });
  });
  it("ровно 20 — одна страница", () => {
    expect(paginate(list.slice(0, 20), 1, 20).pages).toBe(1);
  });
});
