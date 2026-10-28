// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FloatingMusicButton } from "@/components/FloatingMusicButton";

afterEach(cleanup);

describe("FloatingMusicButton (BUG-15)", () => {
  it("скрывается при экспорте, нажимается и сообщает состояние", () => {
    const onToggle = vi.fn();
    render(<FloatingMusicButton playing={false} onToggle={onToggle} label="Включить музыку" />);
    const btn = screen.getByRole("button", { name: "Включить музыку" });
    expect(btn.hasAttribute("data-export-hide")).toBe(true);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("учитывает safe-area и имеет зону нажатия 44 px", () => {
    render(<FloatingMusicButton playing onToggle={() => {}} label="Выключить музыку" />);
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("env(safe-area-inset-bottom)");
    expect(cls).toContain("env(safe-area-inset-right)");
    expect(cls).toContain("size-11");
  });
});
