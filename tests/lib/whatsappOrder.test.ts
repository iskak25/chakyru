import { describe, expect, it } from "vitest";
import { EMPTY_ORDER, buildOrderMessage, orderWhatsAppUrl, validateOrder, type OrderDraft } from "@/lib/whatsappOrder";

const full: OrderDraft = { event: "wedding", customEvent: "", date: "2026-12-20", time: "17:00", names: "Азамат и Айпери", place: "Ресторан «Алтын Ордо»", template: "" };

describe("заявка в WhatsApp", () => {
  it("требует все обязательные поля, шаблон необязателен", () => {
    expect(Object.keys(validateOrder(EMPTY_ORDER)).sort()).toEqual(["date", "event", "names", "place", "time"]);
    expect(validateOrder(full)).toEqual({});
    expect(validateOrder({ ...full, event: "other" }).customEvent).toBe(true);
    expect(validateOrder({ ...full, time: "25:99" }).time).toBe(true);
  });

  it("собирает русское и кыргызское сообщение", () => {
    const ru = buildOrderMessage({ ...full, template: "Нежность" }, "ru");
    expect(ru).toContain("📅 Дата и время: 20.12.2026, 17:00");
    expect(ru).toContain("🎨 Выбранный шаблон: Нежность");
    expect(buildOrderMessage(full, "ru")).toContain("Пока не выбран");
    const ky = buildOrderMessage(full, "ky");
    expect(ky).toContain("🎉 Тойдун аталышы: Үйлөнүү той");
    expect(ky).toContain("Азырынча тандала элек");
  });

  it("добавляет ссылку, только пока шаблон не изменён вручную", () => {
    const tpl = { name: "Нежность", url: "https://x.kg/templates/a" };
    expect(buildOrderMessage({ ...full, template: "Нежность" }, "ru", tpl)).toContain("Нежность — https://x.kg/templates/a");
    expect(buildOrderMessage({ ...full, template: "№15" }, "ru", tpl)).not.toContain("https://");
  });

  it("ведёт на номер +996 555 66 20 21", () => {
    expect(orderWhatsAppUrl("привет")).toMatch(/^https:\/\/wa\.me\/996555662021\?text=/);
  });
});
