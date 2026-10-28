// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShareInvitationPanel } from "@/components/ShareInvitationDialog";
import { makeInvitation } from "../fixtures";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const renderPanel = (locale = "ru") => render(<ShareInvitationPanel invitation={makeInvitation({ id: "abc" })} locale={locale} personal />);
const typeName = (placeholder: string, value: string) => fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });

describe("именное приглашение: 4 кнопки, отправляется только ссылка", () => {
  it("текста нет; без имени все четыре кнопки закрыты", () => {
    renderPanel();
    expect(document.querySelector("textarea")).toBeNull();
    for (const name of ["WhatsApp", "Telegram", "Instagram", "Скопировать"]) {
      expect((screen.getByText(name) as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it("WhatsApp и Telegram получают одну именную ссылку без текста", () => {
    renderPanel();
    typeName("Например: Айгерим", "Айгерим");
    const link = `${window.location.origin}/i/${encodeURIComponent("Айгерим")}/abc?lang=ru`;
    expect(screen.getByText("WhatsApp").getAttribute("href")).toBe(`https://wa.me/?text=${encodeURIComponent(link)}`);
    expect(screen.getByText("Telegram").getAttribute("href")).toBe(`https://t.me/share/url?url=${encodeURIComponent(link)}`);
  });

  it("«Скопировать» копирует ссылку, а не текст", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    renderPanel("ky");
    typeName("Мисалы: Айгерим", "Нурлан");
    fireEvent.click(screen.getByText("Көчүрүү"));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toMatch(/\/i\/.+\/abc\?lang=ky$/);
    expect(await screen.findByRole("status")).toBeTruthy();
  });

  it("Instagram отправляет через системное меню только url", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });
    renderPanel();
    typeName("Например: Айгерим", "Айгерим");
    fireEvent.click(screen.getByText("Instagram"));
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(Object.keys(share.mock.calls[0][0])).toEqual(["url"]);
  });
});
