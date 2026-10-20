// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { InvitationMotion } from "@/components/InvitationMotion";

let intersect: IntersectionObserverCallback;
let reduce = false;
const observe = vi.fn();
const disconnect = vi.fn();
beforeEach(() => {
  reduce = false;
  vi.stubGlobal("React", React);
  vi.stubGlobal("matchMedia", () => ({ matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersect = callback; }
    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
  });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

it("reveals text when scrolled into view without animating its nested lines twice", () => {
  const { container } = render(<InvitationMotion enabled><div data-wedding-text="title"><p>Hello</p></div></InvitationMotion>);
  const text = container.querySelector("[data-wedding-text]")!;
  expect(text.getAttribute("data-ethno-reveal")).toBe("pending");
  expect(container.querySelector("p")?.hasAttribute("data-ethno-reveal")).toBe(false);
  act(() => intersect([{ isIntersecting: true, target: text } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(text.getAttribute("data-ethno-reveal")).toBe("visible");
});

it("finds text mounted later and clears hidden states when editing starts", async () => {
  const view = render(<InvitationMotion enabled><div /></InvitationMotion>);
  view.rerender(<InvitationMotion enabled><p>New content</p></InvitationMotion>);
  await act(async () => {});
  expect(view.container.querySelector("p")?.getAttribute("data-ethno-reveal")).toBe("pending");
  view.rerender(<InvitationMotion enabled={false}><p>New content</p></InvitationMotion>);
  expect(view.container.querySelector("p")?.hasAttribute("data-ethno-reveal")).toBe(false);
  expect(disconnect).toHaveBeenCalled();
});

it("leaves text visible when reduced motion is requested", () => {
  reduce = true;
  const { container } = render(<InvitationMotion enabled><p>Hello</p></InvitationMotion>);
  expect(container.querySelector("p")?.hasAttribute("data-ethno-reveal")).toBe(false);
  expect(observe).not.toHaveBeenCalled();
});
