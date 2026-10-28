// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShareInvitationPanel } from "@/components/ShareInvitationDialog";
import { makeInvitation } from "../fixtures";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("именное приглашение: отправляется только ссылка", () => {
  it("нет текста и кнопок мессенджеров; без имени отправка закрыта", () => {
    render(<ShareInvitationPanel invitation={makeInvitation({ id: "abc" })} locale="ru" personal />);
    expect(document.querySelector("textarea")).toBeNull();
    for (const name of ["WhatsApp", "Telegram", "Instagram"]) expect(screen.queryByText(name)).toBeNull();
    expect((screen.getByText("Отправить ссылку") as HTMLButtonElement).disabled).toBe(true);
  });

  it("по нажатию уходит одна именная ссылка без текста", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, share });
    render(<ShareInvitationPanel invitation={makeInvitation({ id: "abc" })} locale="ru" personal />);
    fireEvent.change(screen.getByPlaceholderText("Например: Айгерим"), { target: { value: "Айгерим" } });
    fireEvent.click(screen.getByText("Отправить ссылку"));
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    const arg = share.mock.calls[0][0];
    expect(Object.keys(arg)).toEqual(["url"]);
    expect(arg.url).toContain(`/i/${encodeURIComponent("Айгерим")}/abc?lang=ru`);
  });

  it("без Web Share ссылка копируется", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<ShareInvitationPanel invitation={makeInvitation({ id: "abc" })} locale="ky" personal />);
    fireEvent.change(screen.getByPlaceholderText("Мисалы: Айгерим"), { target: { value: "Нурлан" } });
    fireEvent.click(screen.getByText("Шилтемени жөнөтүү"));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain("/i/");
    expect(await screen.findByRole("status")).toBeTruthy();
  });
});
