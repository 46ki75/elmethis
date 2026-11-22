import { createEffect, createRoot, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createDelayedSignal } from "./create-delayed-signal";

const setup = <T>(initialValue: T) =>
  createRoot((dispose) => ({ ...createDelayedSignal(initialValue), dispose }));

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("createDelayedSignal", () => {
  it("commits both values together when no positive delay is supplied", () => {
    const delayed = setup("initial");

    delayed.dispatch("next");
    flush();

    expect(delayed.value()).toBe("next");
    expect(delayed.delayedValue()).toBe("next");
    expect(delayed.isValueChanging()).toBe(false);
    delayed.dispose();
  });

  it("updates eagerly, reports pending, and commits after the delay", () => {
    vi.useFakeTimers();
    const delayed = setup("initial");
    delayed.dispatch("next", 100);
    flush();

    expect(delayed.value()).toBe("next");
    expect(delayed.delayedValue()).toBe("initial");
    expect(delayed.isValueChanging()).toBe(true);

    vi.advanceTimersByTime(100);
    flush();

    expect(delayed.delayedValue()).toBe("next");
    expect(delayed.isValueChanging()).toBe(false);
    delayed.dispose();
  });

  it("cancels an older overlapping dispatch", () => {
    vi.useFakeTimers();
    const delayed = setup("initial");
    delayed.dispatch("old", 1000);
    delayed.dispatch("new", 500);

    vi.advanceTimersByTime(500);
    flush();
    expect(delayed.delayedValue()).toBe("new");

    vi.advanceTimersByTime(500);
    flush();
    expect(delayed.delayedValue()).toBe("new");
    delayed.dispose();
  });

  it("uses Object.is equality and clears pending work with its owner", () => {
    vi.useFakeTimers();
    let runs = 0;
    const delayed = createRoot((dispose) => {
      const signal = createDelayedSignal(Number.NaN);
      createEffect(signal.value, () => {
        runs++;
      });
      return { ...signal, dispose };
    });
    flush();

    delayed.dispatch(Number.NaN, 100);
    flush();
    expect(runs).toBe(1);
    expect(vi.getTimerCount()).toBe(1);

    delayed.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });
});
