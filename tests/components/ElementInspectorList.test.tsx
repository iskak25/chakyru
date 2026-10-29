// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ElementInspector } from "@/components/ElementInspector";
import { LocaleProvider } from "@/lib/locale";
import { makeInvitation } from "../fixtures";
import type { WeddingPartInfo } from "@/lib/weddingEditor";

afterEach(cleanup);

const parts: WeddingPartInfo[] = [
  { id: "section-hero", label: "Обложка", kind: "block" },
  { id: "names", label: "Имена", kind: "text" },
  { id: "section-program", label: "Программа", kind: "block" },
  { id: "program-title", label: "Заголовок программы", kind: "text" },
];

function setup(selected: string | null = "names") {
  const onChange = vi.fn();
  const select = vi.fn();
  render(<LocaleProvider><ElementInspector invitation={makeInvitation()} onChange={onChange} selected={selected} select={select} parts={parts} locale="ru" /></LocaleProvider>);
  return { onChange, select };
}

describe("список элементов инспектора (BUG-09)", () => {
  it("элементы сгруппированы по секциям", () => {
    setup();
    const groups = Array.from(document.querySelectorAll("optgroup"));
    expect(groups.map(g => g.label)).toEqual(["Обложка", "Программа"]);
    expect(groups[1].querySelectorAll("option")).toHaveLength(2);
  });

  it("удаление требует подтверждения", () => {
    const { onChange, select } = setup();
    fireEvent.click(screen.getByText("Удалить элемент"));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Отмена"));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Удалить элемент"));
    fireEvent.click(screen.getByText("Да, удалить"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledWith(null);
  });
});
