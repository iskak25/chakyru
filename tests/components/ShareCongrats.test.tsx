// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ShareInvitationPanel } from "@/components/ShareInvitationDialog";
import { getTemplate } from "@/lib/templates";
import { inviteFromTemplate } from "@/lib/templateCanvas";

afterEach(cleanup);

describe("именное поздравление: окно «Жеке чакыруу»", () => {
  const inv = { ...inviteFromTemplate(getTemplate("corp-energy")), id: "t1" };

  it("вместо имени гостя два поля: чин и имя сотрудника", () => {
    render(<ShareInvitationPanel invitation={inv} locale="ky" personal />);
    expect(screen.getByLabelText("Кызматкердин чини")).toBeTruthy();
    expect(screen.getByLabelText("Кызматкердин аты")).toBeTruthy();
    expect(screen.queryByLabelText("Коноктун аты")).toBeNull();
  });

  it("ссылка собирается как «Имя | должность»", () => {
    render(<ShareInvitationPanel invitation={inv} locale="ky" personal />);
    fireEvent.change(screen.getByLabelText("Кызматкердин чини"), { target: { value: "Башкы инженер" } });
    fireEvent.change(screen.getByLabelText("Кызматкердин аты"), { target: { value: "Бакыт" } });
    const link = (screen.getByDisplayValue(/\/i\//) as HTMLInputElement).value;
    expect(link).toContain("/i/Бакыт~Башкы_инженер/t1");
  });

  it("у обычного шаблона остаётся одно поле", () => {
    const plain = { ...inviteFromTemplate(getTemplate("corp-noir")), id: "t2" };
    render(<ShareInvitationPanel invitation={plain} locale="ky" personal />);
    expect(screen.getByLabelText("Коноктун аты")).toBeTruthy();
  });
});
