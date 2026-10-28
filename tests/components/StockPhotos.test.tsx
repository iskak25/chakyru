// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StockPhotos } from "@/components/StockPhotos";

const labels = { search: "Поиск", photos: "Фото", cover: "Обложка", empty: "Ничего не найдено", more: "Ещё", credit: "Источник:" };

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("StockPhotos (BUG-04)", () => {
  it("при ошибке показывает сообщение и «Повторить», повтор делает новый запрос", async () => {
    const photo = { items: [{ id: "1", thumb: "/a.jpg", src: "/a.jpg", alt: "a", author: "x" }], page: 1, source: "openverse" };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("{}", { status: 502 }))
      .mockResolvedValue(new Response(JSON.stringify(photo), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<StockPhotos locale="ru" labels={labels} onAdd={() => {}} />);
    expect((await screen.findByRole("alert")).textContent).toContain("Не удалось загрузить фото");
    expect(screen.queryByText(labels.empty)).toBeNull();
    fireEvent.click(screen.getByText("Повторить"));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1]).toHaveProperty("signal");
  });
});
