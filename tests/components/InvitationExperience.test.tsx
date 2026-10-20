// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { InvitationExperience } from "@/components/InvitationExperience";
import type { Invitation } from "@/lib/types";

vi.mock("@/components/EnvelopeIntro", () => ({
  EnvelopeIntro: ({ onOpen, onOpened }: { onOpen: () => void; onOpened: () => void }) =>
    <button onClick={() => { onOpen(); onOpened(); }}>Open envelope</button>,
}));

const invitation = {
  id: "music-test", names: "Аят", date: "2026-11-28",
  eventType: "beshik", music: false, musicUrl: "/song.mp3",
} as Invitation;

function mount() {
  return render(<InvitationExperience invitation={invitation} locale="ru" intro variant="cream">
    <p>Invitation</p>
  </InvitationExperience>);
}

beforeEach(() => {
  vi.stubGlobal("React", React);
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("envelope music", () => {
  it("starts the selected song synchronously on opening even when saved music is off", () => {
    const { container } = mount();
    expect(container.querySelector("audio")?.getAttribute("src")).toBe("/song.mp3");
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Open envelope"));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  it("retries a blocked launch on a guest gesture and respects manual pause", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new DOMException("Blocked", "NotAllowedError"));
    const { container } = mount();
    await act(async () => { fireEvent.click(screen.getByText("Open envelope")); });
    fireEvent.click(document.body);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    fireEvent.playing(container.querySelector("audio")!);
    fireEvent.click(screen.getByRole("button", { name: "Выключить музыку" }));
    fireEvent.click(document.body);
    fireEvent.canPlay(container.querySelector("audio")!);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it("starts music again on a new visit after the guest paused it", () => {
    const first = mount();
    fireEvent.click(screen.getByText("Open envelope"));
    fireEvent.playing(first.container.querySelector("audio")!);
    fireEvent.click(screen.getByRole("button", { name: "Выключить музыку" }));
    first.unmount();
    mount();
    fireEvent.click(screen.getByText("Open envelope"));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
  });
});
