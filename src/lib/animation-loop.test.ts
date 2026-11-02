import assert from "node:assert/strict";
import { test } from "node:test";
import { createAnimationLoop } from "./animation-loop.ts";

function display() {
  let id = 0;
  const pending = new Map<number, FrameRequestCallback>();
  return {
    request(callback: FrameRequestCallback) {
      pending.set(++id, callback);
      return id;
    },
    cancel(frame: number) {
      pending.delete(frame);
    },
    refresh(timestamp: number) {
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback(timestamp));
    },
    get pending() {
      return pending.size;
    },
  };
}

for (const hz of [60, 120, 144]) {
  test(`renders every ${hz} Hz refresh without changing animation speed`, () => {
    const screen = display();
    let renders = 0;
    let elapsed = 0;
    const loop = createAnimationLoop((delta) => {
      renders++;
      elapsed += delta;
    }, screen);
    loop.start();
    screen.refresh(0);
    for (let frame = 1; frame <= hz; frame++) screen.refresh((frame * 1000) / hz);
    assert.equal(renders, hz + 1);
    assert.ok(Math.abs(elapsed - 1) < 0.00001);
    assert.equal(screen.pending, 1);
    loop.stop();
    assert.equal(screen.pending, 0);
  });
}

test("stopping for a hidden tab or pause cancels work and resumes without a time jump", () => {
  const screen = display();
  const deltas: number[] = [];
  const loop = createAnimationLoop((delta) => deltas.push(delta), screen);
  loop.start();
  loop.start();
  assert.equal(screen.pending, 1);
  screen.refresh(0);
  screen.refresh(1000 / 120);
  loop.stop();
  screen.refresh(60_000);
  assert.equal(deltas.length, 2);
  loop.start();
  screen.refresh(61_000);
  assert.equal(deltas.at(-1), 0);
  screen.refresh(61_000 + 1000 / 120);
  assert.ok(Math.abs(deltas.at(-1)! - 1 / 120) < 0.00001);
  loop.stop();
});

test("caps catch-up after a stalled frame and supports stopping inside render", () => {
  const screen = display();
  const deltas: number[] = [];
  const loop = createAnimationLoop((delta) => {
    deltas.push(delta);
    if (delta === 0.1) loop.stop();
  }, screen);
  loop.start();
  screen.refresh(0);
  screen.refresh(2000);
  assert.deepEqual(deltas, [0, 0.1]);
  assert.equal(screen.pending, 0);
});
