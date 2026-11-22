import { createEffect, createRoot, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createThrottled } from "./create-throttled";

const setup = <T>(initialValue: T, interval: number) =>
  createRoot((dispose) => ({
    ...createThrottled(initialValue, interval),
    dispose,
  }));

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("createThrottled", () => {
  it("publishes the first write on the leading edge", () => {
    vi.useFakeTimers();
    const throttled = setup("", 100);
    throttled.setValue("a");
    flush();

    expect(throttled.value()).toBe("a");
    expect(throttled.throttledValue()).toBe("a");
    expect(throttled.isCooling()).toBe(true);
    throttled.dispose();
  });

  it("suppresses intermediate writes and publishes the latest trailing value", () => {
    vi.useFakeTimers();
    const throttled = setup("", 100);
    throttled.setValue("a");
    throttled.setValue("b");
    throttled.setValue("c");
    flush();

    expect(throttled.value()).toBe("c");
    expect(throttled.throttledValue()).toBe("a");

    vi.advanceTimersByTime(100);
    flush();
    expect(throttled.throttledValue()).toBe("c");
    expect(throttled.isCooling()).toBe(true);

    vi.advanceTimersByTime(100);
    flush();
    expect(throttled.isCooling()).toBe(false);
    throttled.dispose();
  });

  it("composes rapid updater writes against staged state", () => {
    vi.useFakeTimers();
    const throttled = setup(0, 100);

    expect(throttled.setValue((previous) => previous + 1)).toBe(1);
    expect(throttled.setValue((previous) => previous + 1)).toBe(2);
    flush();
    expect(throttled.value()).toBe(2);
    expect(throttled.throttledValue()).toBe(1);

    vi.advanceTimersByTime(100);
    flush();
    expect(throttled.throttledValue()).toBe(2);
    throttled.dispose();
  });

  it("starts a new leading edge after the cooldown finishes", () => {
    vi.useFakeTimers();
    const throttled = setup(0, 100);
    throttled.setValue(1);
    vi.advanceTimersByTime(100);
    throttled.setValue(2);
    flush();

    expect(throttled.throttledValue()).toBe(2);
    throttled.dispose();
  });

  it("passes through nonpositive intervals without starting a timer", () => {
    vi.useFakeTimers();
    const throttled = setup(1, 0);
    expect(throttled.setValue((previous) => previous + 1)).toBe(2);
    flush();
    expect(throttled.value()).toBe(2);
    expect(throttled.throttledValue()).toBe(2);
    expect(throttled.isCooling()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    throttled.dispose();
  });

  it("uses Object.is equality and cancels cooldown on disposal", () => {
    vi.useFakeTimers();
    let runs = 0;
    const throttled = createRoot((dispose) => {
      const signal = createThrottled(Number.NaN, 100);
      createEffect(signal.value, () => {
        runs++;
      });
      return { ...signal, dispose };
    });
    flush();

    throttled.setValue(Number.NaN);
    flush();
    expect(runs).toBe(1);
    expect(vi.getTimerCount()).toBe(0);

    throttled.setValue(1);
    expect(vi.getTimerCount()).toBe(1);
    throttled.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });
});
