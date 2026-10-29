// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InvitationSetupWizard } from "@/components/InvitationSetupWizard";
import { LocaleProvider } from "@/lib/locale";
import { makeInvitation } from "../fixtures";
import type { Invitation } from "@/lib/types";
import type { WeddingPartInfo } from "@/lib/weddingEditor";

beforeEach(() => localStorage.setItem("chakyru-locale", "ru"));
afterEach(cleanup);

const parts: WeddingPartInfo[] = [
  { id: "n", label: "Имена", kind: "text", field: "names" },
  { id: "v", label: "Место", kind: "text", field: "venue" },
  { id: "t", label: "Текст", kind: "text", field: "message" },
];

function Harness({ initial, onFinish, onPatch }: { initial: Invitation; onFinish: () => void; onPatch: (p: Partial<Invitation>) => void }) {
  const [inv, setInv] = useState(initial);
  return <LocaleProvider><InvitationSetupWizard invitation={inv} parts={parts} onChange={(p) => { onPatch(p); setInv({ ...inv, ...p }); }} onFinish={onFinish} /></LocaleProvider>;
}

function setup(over: Partial<Invitation> = {}) {
  const onFinish = vi.fn();
  const onPatch = vi.fn();
  render(<Harness initial={makeInvitation({ eventType: "toi", names: "", date: "", message: "", ...over })} onFinish={onFinish} onPatch={onPatch} />);
  return { onFinish, onPatch };
}

describe("пошаговое заполнение", () => {
  it("показывает прогресс, только поддерживаемые шаги, и сохраняет каждое изменение сразу", () => {
    const { onPatch } = setup();
    expect(screen.getByText("Шаг 1 из 5")).toBeTruthy();
    const next = screen.getByText("Далее") as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.change(screen.getByPlaceholderText("Введите имя"), { target: { value: "Айдана" } });
    expect(onPatch).toHaveBeenLastCalledWith({ names: "Айдана" });
    expect(next.disabled).toBe(false);
  });

  it("дата обязательна, остальные шаги можно пропустить, назад возвращает", () => {
    const { onPatch, onFinish } = setup({ names: "Айдана" });
    fireEvent.click(screen.getByText("Далее"));
    expect(screen.getByText("Шаг 2 из 5")).toBeTruthy();
    expect((screen.getByText("Далее") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText("Пропустить")).toBeNull();
    fireEvent.change(screen.getByLabelText(/Дата мероприятия/), { target: { value: "2026-12-01" } });
    expect(onPatch).toHaveBeenLastCalledWith({ date: "2026-12-01" });
    fireEvent.click(screen.getByText("Далее"));
    expect(screen.getByText("Шаг 3 из 5")).toBeTruthy();
    fireEvent.click(screen.getByText("Пропустить"));
    expect(screen.getByText("Шаг 4 из 5")).toBeTruthy();
    fireEvent.click(screen.getByText("Назад"));
    expect(screen.getByText("Шаг 3 из 5")).toBeTruthy();
    fireEvent.click(screen.getByText("Пропустить"));
    fireEvent.click(screen.getByText("Пропустить"));
    expect(screen.getByText("Шаг 5 из 5")).toBeTruthy();
    fireEvent.click(screen.getByText("Открыть редактор"));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("не пишет в документ ничего, кроме полей приглашения", () => {
    const { onPatch } = setup({ names: "Айдана", date: "2026-12-01" });
    fireEvent.click(screen.getByText("Далее"));
    fireEvent.click(screen.getByText("Далее"));
    fireEvent.change(screen.getByPlaceholderText("Введите название ресторана"), { target: { value: "Ала-Тоо" } });
    const allowed = new Set(["names", "date", "time", "venue", "city", "address", "mapUrl", "message", "hosts", "copy", "gallery", "coverImage"]);
    for (const [patch] of onPatch.mock.calls) for (const key of Object.keys(patch)) expect(allowed.has(key)).toBe(true);
  });
});
