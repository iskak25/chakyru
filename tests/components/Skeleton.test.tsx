// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardGridSkeleton, EditorSkeleton, InviteSkeleton, ListSkeleton, Skeleton } from "@/components/Skeleton";

describe("Skeleton", () => {
  it("is hidden from assistive tech and shimmers", () => {
    const { container } = render(<Skeleton className="h-4 w-4" />);
    const el = container.firstElementChild!;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.className).toContain("skeleton");
    expect(el.className).toContain("h-4");
  });

  it("renders the requested number of cards with a status label", () => {
    const { container, getByRole } = render(<CardGridSkeleton count={4} label="Загрузка…" />);
    expect(container.querySelectorAll(".skeleton").length).toBeGreaterThanOrEqual(4);
    expect(getByRole("status").textContent).toBe("Загрузка…");
  });

  it("renders list rows", () => {
    const { container } = render(<ListSkeleton rows={3} />);
    expect(container.querySelectorAll(".skeleton")).toHaveLength(3);
  });

  it("renders the invitation and editor placeholders", () => {
    expect(render(<InviteSkeleton />).container.querySelectorAll(".skeleton").length).toBeGreaterThan(3);
    expect(render(<EditorSkeleton />).container.querySelectorAll(".skeleton").length).toBeGreaterThan(3);
  });
});
