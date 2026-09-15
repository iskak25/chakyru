export const INVITATION_SCROLL_SPEED = 18;

/** Frame-rate independent scrolling; preserve fractional pixels on slow devices. */
export function startInvitationScroll(options: {
  position: () => number;
  limit: () => number;
  move: (position: number) => void;
  paused: () => boolean;
  frame: (callback: FrameRequestCallback) => number;
  cancel: (id: number) => void;
  done: () => void;
}) {
  let previous: number | null = null;
  let position = options.position();
  let frame = 0;
  let stopped = false;
  const tick = (time: number) => {
    if (stopped) return;
    const delta = previous === null ? 0 : Math.min(time - previous, 64);
    previous = time;
    if (!options.paused()) {
      const limit = Math.max(0, options.limit());
      if (position >= limit) { options.done(); return; }
      position = Math.min(limit, position + INVITATION_SCROLL_SPEED * delta / 1000);
      options.move(position);
    }
    frame = options.frame(tick);
  };
  frame = options.frame(tick);
  return () => { stopped = true; options.cancel(frame); };
}
