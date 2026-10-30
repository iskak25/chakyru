import { describe, expect, it } from "vitest";
import { cleanGuestName, personalizeText } from "@/lib/personalInvite";

describe("cleanGuestName", () => {
  it("decodes, trims and limits the name", () => {
    expect(cleanGuestName("%D0%90%D0%B9%D0%B3%D0%B5%D1%80%D0%B8%D0%BC%20%20%D0%90.")).toBe("Айгерим А.");
    expect(cleanGuestName("  x\u0000y\n z ")).toBe("xy z");
    expect(cleanGuestName("а".repeat(100))).toHaveLength(60);
    expect(cleanGuestName("100%")).toBe("100%");
    expect(cleanGuestName(undefined)).toBe("");
  });
});

describe("personalizeText", () => {
  it("puts the name into the greeting", () => {
    expect(personalizeText("intro-title", "Дорогие родные и друзья!", "Айгерим", "ru")).toBe("Дорогой(ая) Айгерим!");
    expect(personalizeText("intro-title", "x", "Айгерим", "ky")).toBe("Урматтуу Айгерим!");
  });
  it("switches the message to the singular", () => {
    expect(personalizeText("message", "Приглашаем вас на её кыз узатуу. Ждём Вас, ваши близкие!", "А", "ru")).toBe("Приглашаем тебя на её кыз узатуу. Ждём Тебя, твои близкие!");
    expect(personalizeText("message", "Сиздерди чакырабыз", "А", "ky")).toBe("Сизди чакырабыз");
  });
  it("leaves other parts and nameless invitations untouched", () => {
    expect(personalizeText("venue", "вас", "А", "ru")).toBe("вас");
    expect(personalizeText("message", "вас", "", "ru")).toBe("вас");
  });
});

describe("personalizeText: именное поздравление", () => {
  it("берёт имя и должность из «Имя | должность»", () => {
    expect(personalizeText("to-name", "Имя сотрудника", "Бакыт Сатыбалдиев | Главный инженер", "ru")).toBe("Бакыт Сатыбалдиев");
    expect(personalizeText("to-role", "Должность сотрудника", "Бакыт Сатыбалдиев | Главный инженер", "ru")).toBe("Главный инженер");
  });
  it("без должности оставляет текст шаблона", () => {
    expect(personalizeText("to-role", "Должность сотрудника", "Бакыт", "ru")).toBe("Должность сотрудника");
    expect(personalizeText("to-name", "Имя сотрудника", "", "ru")).toBe("Имя сотрудника");
  });
});
