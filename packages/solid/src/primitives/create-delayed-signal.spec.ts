import { createComputed, createRoot } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createDelayedSignal } from "./create-delayed-signal";

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("createDelayedSignal", () => {
  it("updates both values immediately when no positive delay is supplied", () => {
    createRoot((dispose) => {
      const delayed = createDelayedSignal("initial");

      delayed.dispatch("next");

      expect(delayed.value()).toBe("next");
      expect(delayed.delayedValue()).toBe("next");
      expect(delayed.isValueChanging()).toBe(false);
      dispose();
    });
  });

  it("updates eagerly, reports pending, and commits after the delay", () => {
    vi.useFakeTimers();

    createRoot((dispose) => {
      const delayed = createDelayedSignal("initial");
      delayed.dispatch("next", 100);

      expect(delayed.value()).toBe("next");
      expect(delayed.delayedValue()).toBe("initial");
      expect(delayed.isValueChanging()).toBe(true);

      vi.advanceTimersByTime(100);

      expect(delayed.delayedValue()).toBe("next");
      expect(delayed.isValueChanging()).toBe(false);
      dispose();
    });
  });

  it("cancels an older overlapping dispatch", () => {
    vi.useFakeTimers();

    createRoot((dispose) => {
      const delayed = createDelayedSignal("initial");
      delayed.dispatch("old", 1000);
      delayed.dispatch("new", 500);

      vi.advanceTimersByTime(500);
      expect(delayed.delayedValue()).toBe("new");

      vi.advanceTimersByTime(500);
      expect(delayed.delayedValue()).toBe("new");
      dispose();
    });
  });

  it("uses Object.is equality and clears pending work with its owner", () => {
    vi.useFakeTimers();
    let runs = 0;

    createRoot((dispose) => {
      const delayed = createDelayedSignal(Number.NaN);
      createComputed(() => {
        delayed.value();
        runs++;
      });

      delayed.dispatch(Number.NaN, 100);
      expect(runs).toBe(1);
      expect(vi.getTimerCount()).toBe(1);

      dispose();
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
