// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ElementInspector } from "@/components/ElementInspector";
import { LocaleProvider } from "@/lib/locale";
import { makeInvitation } from "../fixtures";
import type { CanvasItem } from "@/lib/types";

afterEach(cleanup);

function setup(fontSize = 22) {
  const extra = { id: "e1", kind: "text", text: "Привет", color: "#000", fontSize } as unknown as CanvasItem;
  const invitation = makeInvitation({ extras: [extra] });
  const onChange = vi.fn();
  render(<LocaleProvider><ElementInspector invitation={invitation} onChange={onChange} selected="e1" select={() => {}} parts={[]} locale="ru" /></LocaleProvider>);
  const input = screen.getByLabelText("Размер текста") as HTMLInputElement;
  const sizes = () => onChange.mock.calls.map(([patch]) => (patch.extras as CanvasItem[])[0].fontSize);
  return { input, onChange, sizes };
}

describe("размер текста (BUG-03)", () => {
  it("набор «24» не превращается в «84»", () => {
    const { input, sizes } = setup();
    fireEvent.change(input, { target: { value: "2" } });
    expect(input.value).toBe("2");
    fireEvent.change(input, { target: { value: "24" } });
    expect(input.value).toBe("24");
    expect(sizes()).toEqual([24]);
  });

  it("границы 8 и 100 применяются при завершении ввода", () => {
    const { input, sizes } = setup();
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.blur(input);
    expect(input.value).toBe("8");
    fireEvent.change(input, { target: { value: "250" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("100");
    expect(sizes().at(-1)).toBe(100);
  });

  it("кнопки −/+ меняют размер на 2", () => {
    const { sizes } = setup(22);
    fireEvent.click(screen.getByLabelText("Размер текста +"));
    expect(sizes()).toEqual([24]);
  });
});
