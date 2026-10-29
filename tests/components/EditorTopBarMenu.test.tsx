// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditorTopBar } from "@/components/EditorTopBar";
import { PreviewBackBar } from "@/components/PreviewBackBar";

afterEach(cleanup);

function bar() {
  render(<EditorTopBar locale="ru" saveState="saved" canUndo={false} canRedo={false} onUndo={vi.fn()} onRedo={vi.fn()} onExit={vi.fn()} onReset={vi.fn()} onHelp={vi.fn()} />);
  const more = screen.getByLabelText("Ещё");
  return { more, open: () => fireEvent.click(more) };
}

describe("меню ⋯ в редакторе (BUG-13)", () => {
  it("закрывается по Escape", () => {
    const { more, open } = bar();
    open();
    expect(more.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Подсказки")).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("Подсказки")).toBeNull();
    expect(more.getAttribute("aria-expanded")).toBe("false");
  });

  it("закрывается при прокрутке страницы", () => {
    const { open } = bar();
    open();
    act(() => { window.dispatchEvent(new Event("scroll")); });
    expect(screen.queryByText("Подсказки")).toBeNull();
  });

  it("другие клавиши меню не закрывают", () => {
    const { open } = bar();
    open();
    fireEvent.keyDown(window, { key: "a" });
    expect(screen.getByText("Подсказки")).toBeTruthy();
  });
});

describe("плашка предпросмотра (BUG-10)", () => {
  it("ведёт обратно в редактор этого приглашения", () => {
    render(<PreviewBackBar id="a b" locale="ru" />);
    const link = screen.getByText("Назад к редактированию").closest("a")!;
    expect(link.getAttribute("href")).toBe("/create/a%20b");
  });
  it("по-кыргызски", () => {
    render(<PreviewBackBar id="x" locale="ky" />);
    expect(screen.getByText("Оңдоого кайтуу")).toBeTruthy();
  });
});
