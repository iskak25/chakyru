import { describe, expect, it } from "vitest";
import { inviteShareMeta, shortInviteDate } from "@/lib/inviteShareMeta";
import type { Invitation } from "@/lib/types";

const base = {
  id: "abc",
  templateId: "klassika",
  eventType: "tushoo",
  date: "2025-11-08",
  venue: "Ала-Тоо",
  city: "Бишкек",
} as unknown as Invitation;

describe("shortInviteDate", () => {
  it("shows day and month without the year", () => {
    expect(shortInviteDate("2025-11-08")).toBe("8-ноябрь");
  });
  it("ignores malformed dates", () => {
    expect(shortInviteDate("")).toBe("");
    expect(shortInviteDate("08.11.2025")).toBe("");
    expect(shortInviteDate("2025-13-40")).toBe("");
  });
});

describe("inviteShareMeta", () => {
  it("uses the invitation celebration name instead of the template default", () => {
    const meta = inviteShareMeta({
      ...base,
      templateId: "amir-falcon",
      eventType: "beshik",
      copy: { eventTitle: "  Бешик той  " },
    });
    expect(meta.title).toBe("Бешик той — 8-ноябрь");
  });

  it("falls back to the template name when the saved title is blank", () => {
    const meta = inviteShareMeta({
      ...base,
      templateId: "amir-falcon",
      copy: { eventTitle: " \n " },
    });
    expect(meta.title).toBe("Сүннөт той — 8-ноябрь");
  });

  it("takes the celebration name from the template when it has its own", () => {
    const meta = inviteShareMeta({ ...base, templateId: "amir-falcon", eventType: "beshik" } as Invitation);
    expect(meta.title).toBe("Сүннөт той — 8-ноябрь");
  });

  it("builds «type — date» title and a venue-based description", () => {
    const meta = inviteShareMeta(base);
    expect(meta.title).toBe("Тушоо той — 8-ноябрь");
    expect(meta.description).toContain("Ала-Тоо, Бишкек");
    expect(meta.description).toContain("ачып");
  });
  it("prefers the address over the stored city", () => {
    const meta = inviteShareMeta({ ...base, address: "ул. Фрунзе 87, с. Беловодское" });
    expect(meta.description).toContain("Ала-Тоо, ул. Фрунзе 87, с. Беловодское");
    expect(meta.description).not.toContain("Бишкек");
  });
  it("drops the date and place when they are missing", () => {
    const meta = inviteShareMeta({ ...base, date: "", venue: "", city: "" });
    expect(meta.title).toBe("Тушоо той");
    expect(meta.description).toBe("Чакырууну ачып, баарын көрүңүз 💌");
  });
  it("points at the compressed cover route when there is a cover", () => {
    expect(inviteShareMeta({ ...base, coverImage: "https://images.unsplash.com/a.jpg" }).image).toBe("/api/og/abc");
  });
});
