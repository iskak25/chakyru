import { describe, expect, it } from "vitest";
import { buildShareMessage } from "@/lib/shareMessage";
import { makeInvitation } from "../fixtures";

// Мессенджеры портят эмодзи в «�» при передаче текста из браузера; ♡ и → доходят нормально.
const EMOJI = /[\u{1F000}-\u{1FFFF}\u2700-\u27BF\uFE0F\u200D]/u;

describe("текст для отправки без эмодзи", () => {
  for (const locale of ["ru", "ky"]) {
    for (const name of ["", "Айгерим"]) {
      it(`${locale}${name ? " (именной)" : ""}`, () => {
        const text = buildShareMessage(makeInvitation(), locale, "https://x/i/1", name);
        expect(text).not.toMatch(EMOJI);
        expect(text).toContain("♡");
        expect(text).toContain("https://x/i/1");
      });
    }
  }
});
