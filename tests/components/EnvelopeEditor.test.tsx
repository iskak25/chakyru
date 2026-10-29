// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EnvelopeEditor } from "@/components/EnvelopeEditor";
import { LocaleProvider } from "@/lib/locale";
import { makeInvitation } from "../fixtures";

afterEach(cleanup);

describe("редактор конверта", () => {
  it("делится на «Выбор конверта» и «Стиль конверта»", () => {
    render(<LocaleProvider><EnvelopeEditor invitation={makeInvitation()} onChange={vi.fn()} locale="ru" /></LocaleProvider>);
    expect(screen.getByText("Классический")).toBeTruthy();
    expect(screen.queryByText("Вернуть цвета дизайна")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "Стиль конверта" }));
    expect(screen.getByText("Вернуть цвета дизайна")).toBeTruthy();
    expect(screen.queryByText("Классический")).toBeNull();
  });
});
