import { createComputed, createRoot } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createThrottled } from "./create-throttled";

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("createThrottled", () => {
  it("publishes the first write on the leading edge", () => {
    vi.useFakeTimers();

    createRoot((dispose) => {
      const throttled = createThrottled("", 100);
      throttled.setValue("a");

      expect(throttled.value()).toBe("a");
      expect(throttled.throttledValue()).toBe("a");
      expect(throttled.isCooling()).toBe(true);
      dispose();
    });
  });

  it("suppresses intermediate writes and publishes the latest trailing value", () => {
    vi.useFakeTimers();

    createRoot((dispose) => {
      const throttled = createThrottled("", 100);
      throttled.setValue("a");
      throttled.setValue("b");
      throttled.setValue("c");

      expect(throttled.value()).toBe("c");
      expect(throttled.throttledValue()).toBe("a");

      vi.advanceTimersByTime(100);
      expect(throttled.throttledValue()).toBe("c");
      expect(throttled.isCooling()).toBe(true);

      vi.advanceTimersByTime(100);
      expect(throttled.isCooling()).toBe(false);
      dispose();
    });
  });

  it("starts a new leading edge after the cooldown finishes", () => {
    vi.useFakeTimers();

    createRoot((dispose) => {
      const throttled = createThrottled(0, 100);
      throttled.setValue(1);
      vi.advanceTimersByTime(100);
      throttled.setValue(2);

      expect(throttled.throttledValue()).toBe(2);
      dispose();
    });
  });

  it("supports updater setters and synchronously passes through nonpositive intervals", () => {
    createRoot((dispose) => {
      const throttled = createThrottled(1, 0);
      expect(throttled.setValue((previous) => previous + 1)).toBe(2);
      expect(throttled.value()).toBe(2);
      expect(throttled.throttledValue()).toBe(2);
      expect(throttled.isCooling()).toBe(false);
      dispose();
    });
  });

  it("uses Object.is equality and cancels cooldown on disposal", () => {
    vi.useFakeTimers();
    let runs = 0;

    createRoot((dispose) => {
      const throttled = createThrottled(Number.NaN, 100);
      createComputed(() => {
        throttled.value();
        runs++;
      });

      throttled.setValue(Number.NaN);
      expect(runs).toBe(1);
      expect(vi.getTimerCount()).toBe(0);

      throttled.setValue(1);
      expect(vi.getTimerCount()).toBe(1);
      dispose();
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
