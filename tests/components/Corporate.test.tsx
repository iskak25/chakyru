// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LocaleProvider } from "@/lib/locale";
import { FormatInvite } from "@/components/FormatInvite";
import { getTemplate } from "@/lib/templates";
import { inviteFromTemplate } from "@/lib/templateCanvas";

afterEach(cleanup);

Object.defineProperty(window, "matchMedia", {
  value: (query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }),
});

class FakeObserver { observe() {} unobserve() {} disconnect() {} }
(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeObserver;

describe.each(["corp-velvet", "corp-emerald", "corp-winter", "corp-noir"])("%s", (id) => {
  for (const editing of [false, true]) {
    it(`renders all sections (${editing ? "editor" : "guest"}) without looping`, () => {
      const inv = { ...inviteFromTemplate(getTemplate(id)), id: "t1" };
      const { container } = render(
        <LocaleProvider>
          <FormatInvite invitation={inv} locale="ky" interactive={!editing} startOpen onChange={editing ? () => {} : undefined} />
        </LocaleProvider>,
      );
      const root = container.querySelector('[data-family="corporate"]');
      expect(root).not.toBeNull();
      expect(root!.querySelectorAll('[data-box^="section-"]').length).toBeGreaterThanOrEqual(8);
      expect(inv.hosts).toBe("");
      expect(root!.querySelector('[data-box="photo-hero"] img')?.getAttribute("src")).toBe(`/images/corporate/${id.replace("corp-", "")}.webp`);
    });
  }
});
