// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FontPicker } from "@/components/FontPicker";
import { FONT_LIBRARY, fontByCss, searchFonts } from "@/lib/fontLibrary";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

function setup(value = "") {
  const onChange = vi.fn();
  render(<FontPicker value={value} sample="Айдана & Бекзат" ru onChange={onChange} />);
  return onChange;
}

describe("библиотека шрифтов", () => {
  it("три прежних значения fontFamily распознаются без изменений", () => {
    for (const css of ["var(--font-cormorant), serif", "var(--font-manrope), sans-serif", "var(--font-ceremonial), cursive"]) {
      expect(fontByCss(css)).toBeDefined();
    }
  });
  it("id и css уникальны", () => {
    expect(new Set(FONT_LIBRARY.map(f => f.id)).size).toBe(FONT_LIBRARY.length);
    expect(new Set(FONT_LIBRARY.map(f => f.css)).size).toBe(FONT_LIBRARY.length);
  });
  it("поиск не зависит от регистра", () => {
    expect(searchFonts(FONT_LIBRARY, "PLAYFAIR").map(f => f.id)).toEqual(["playfair"]);
  });
});

describe("выбор шрифта", () => {
  it("карточка показывает превью текста элемента и выбирает шрифт", () => {
    const onChange = setup();
    const card = screen.getAllByText("Айдана & Бекзат")[0];
    expect(card.getAttribute("style")).toContain("font-family");
    fireEvent.click(screen.getByText("Playfair Display").closest("button")!);
    expect(onChange).toHaveBeenCalledWith("var(--font-playfair), serif");
  });
  it("«По шаблону» сбрасывает шрифт и недоступна без выбора", () => {
    const off = setup();
    expect((screen.getByText("По шаблону", { selector: "button" }) as HTMLButtonElement).disabled).toBe(true);
    cleanup();
    const onChange = setup("var(--font-manrope), sans-serif");
    fireEvent.click(screen.getByText("По шаблону", { selector: "button" }));
    expect(onChange).toHaveBeenCalledWith("");
    expect(off).not.toHaveBeenCalled();
  });
  it("выбранный шрифт попадает в «Недавние», избранное сохраняется", () => {
    setup();
    fireEvent.click(screen.getByText("Caveat").closest("button")!);
    fireEvent.click(screen.getByRole("tab", { name: "Недавние" }));
    expect(screen.getByText("Caveat")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Все" }));
    fireEvent.click(screen.getByLabelText("В избранное: Manrope"));
    fireEvent.click(screen.getByRole("tab", { name: "Избранные" }));
    expect(screen.getByText("Manrope")).toBeTruthy();
    expect(screen.queryByText("Caveat")).toBeNull();
  });
  it("шрифт без ң/ө/ү помечен", () => {
    setup();
    expect(screen.getAllByText(/запасным шрифтом/).length).toBeGreaterThan(0);
  });
});
