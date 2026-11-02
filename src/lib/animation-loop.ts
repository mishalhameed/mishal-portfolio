type FrameScheduler = {
  request: (callback: FrameRequestCallback) => number;
  cancel: (id: number) => void;
};

/** Follow the display refresh rate; elapsed time keeps motion speed consistent. */
export function createAnimationLoop(
  render: (elapsedSeconds: number) => void,
  scheduler: FrameScheduler = {
    request: (callback) => window.requestAnimationFrame(callback),
    cancel: (id) => window.cancelAnimationFrame(id),
  },
) {
  let active = false;
  let frame: number | null = null;
  let previous: number | null = null;

  const tick = (now: number) => {
    frame = null;
    if (!active) return;
    const elapsed = previous === null ? 0 : Math.min(Math.max(now - previous, 0) / 1000, 0.1);
    previous = now;
    render(elapsed);
    if (active) frame = scheduler.request(tick);
  };

  return {
    start() {
      if (active) return;
      active = true;
      previous = null;
      frame = scheduler.request(tick);
    },
    stop() {
      active = false;
      if (frame !== null) scheduler.cancel(frame);
      frame = null;
      previous = null;
    },
  };
}
