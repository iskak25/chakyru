// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WishesCarousel } from "@/components/WishesCarousel";
import { setWishHiddenRemote } from "@/lib/accessClient";
import { makeInvitation, makeWish } from "../fixtures";

vi.mock("@/lib/accessClient", () => ({ setWishHiddenRemote: vi.fn() }));

const wishes = [
  makeWish({ id: "w1", name: "Асан", text: "Первое пожелание" }),
  makeWish({ id: "w2", name: "Үсөн", text: "Второе пожелание", hidden: true }),
  makeWish({ id: "w3", name: "Гүл", text: "Третье пожелание" }),
];
const invitation = makeInvitation({ wishes });

beforeEach(() => vi.mocked(setWishHiddenRemote).mockReset());
afterEach(() => vi.useRealTimers());

describe("WishesCarousel (guest view)", () => {
  it("shows only visible wishes", () => {
    render(<WishesCarousel invitation={invitation} ru editable={false} />);
    expect(screen.getByText("Первое пожелание")).toBeTruthy();
    expect(screen.getByText(/Все пожелания \(2\)/)).toBeTruthy();
  });

  it("rotates through visible wishes and skips hidden ones", () => {
    vi.useFakeTimers();
    render(<WishesCarousel invitation={invitation} ru editable={false} />);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Третье пожелание")).toBeTruthy();
    expect(screen.queryByText("Второе пожелание")).toBeNull();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Первое пожелание")).toBeTruthy();
  });

  it("opens and closes the modal, without moderation controls", () => {
    render(<WishesCarousel invitation={invitation} ru editable={false} />);
    fireEvent.click(screen.getByText(/Все пожелания/));
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("Третье пожелание");
    expect(dialog.textContent).not.toContain("Второе пожелание");
    expect(screen.queryByText("Скрыть от гостей")).toBeNull();
    fireEvent.click(screen.getByLabelText("close"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes on Escape", () => {
    render(<WishesCarousel invitation={invitation} ru editable={false} />);
    fireEvent.click(screen.getByText(/Все пожелания/));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows a placeholder when there are no visible wishes", () => {
    render(<WishesCarousel invitation={makeInvitation({ wishes: [] })} ru editable={false} />);
    expect(screen.getByText(/появятся пожелания/)).toBeTruthy();
  });

  it("renders Kyrgyz labels", () => {
    render(<WishesCarousel invitation={invitation} ru={false} editable={false} />);
    expect(screen.getByText(/Бардык каалоолор/)).toBeTruthy();
  });
});

describe("WishesCarousel (editor)", () => {
  it("lists every wish including hidden ones", () => {
    render(<WishesCarousel invitation={invitation} ru editable onChange={vi.fn()} />);
    fireEvent.click(screen.getByText(/Все пожелания \(3\)/));
    expect(screen.getByRole("dialog").textContent).toContain("Второе пожелание");
  });

  it("hides a wish via the API and updates the invitation", async () => {
    vi.mocked(setWishHiddenRemote).mockResolvedValue(true);
    const onChange = vi.fn();
    render(<WishesCarousel invitation={invitation} ru editable onChange={onChange} />);
    fireEvent.click(screen.getByText(/Все пожелания/));
    fireEvent.click(screen.getAllByText("Скрыть от гостей")[0]);
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(setWishHiddenRemote).toHaveBeenCalledWith("inv1", "w1", true);
    const next = onChange.mock.calls[0][0].wishes;
    expect(next.find((w: { id: string }) => w.id === "w1").hidden).toBe(true);
    expect(next.find((w: { id: string }) => w.id === "w3").hidden).toBeUndefined();
  });

  it("shows a hidden wish again", async () => {
    vi.mocked(setWishHiddenRemote).mockResolvedValue(true);
    const onChange = vi.fn();
    render(<WishesCarousel invitation={invitation} ru editable onChange={onChange} />);
    fireEvent.click(screen.getByText(/Все пожелания/));
    fireEvent.click(screen.getByText("Показать гостям"));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(setWishHiddenRemote).toHaveBeenCalledWith("inv1", "w2", false);
  });

  it("reports an error and does not change state when saving fails", async () => {
    vi.mocked(setWishHiddenRemote).mockResolvedValue(false);
    const onChange = vi.fn();
    render(<WishesCarousel invitation={invitation} ru editable onChange={onChange} />);
    fireEvent.click(screen.getByText(/Все пожелания/));
    fireEvent.click(screen.getAllByText("Скрыть от гостей")[0]);
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(onChange).not.toHaveBeenCalled();
  });
});
