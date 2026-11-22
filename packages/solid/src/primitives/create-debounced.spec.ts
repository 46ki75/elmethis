import { createEffect, createRoot, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createDebounced } from "./create-debounced";

const setup = <T>(initialValue: T, delay: number) =>
  createRoot((dispose) => ({
    ...createDebounced(initialValue, delay),
    dispose,
  }));

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("createDebounced", () => {
  it("updates the writable value before the debounced trailing value", () => {
    vi.useFakeTimers();
    const debounced = setup("", 100);
    debounced.setValue("a");
    flush();

    expect(debounced.value()).toBe("a");
    expect(debounced.debouncedValue()).toBe("");
    expect(debounced.isPending()).toBe(true);

    vi.advanceTimersByTime(99);
    flush();
    expect(debounced.debouncedValue()).toBe("");
    vi.advanceTimersByTime(1);
    flush();
    expect(debounced.debouncedValue()).toBe("a");
    expect(debounced.isPending()).toBe(false);
    debounced.dispose();
  });

  it("resets the timer and only commits the latest rapid write", () => {
    vi.useFakeTimers();
    const debounced = setup("", 100);
    debounced.setValue("a");
    vi.advanceTimersByTime(75);
    debounced.setValue("b");
    vi.advanceTimersByTime(25);
    flush();

    expect(debounced.debouncedValue()).toBe("");
    vi.advanceTimersByTime(75);
    flush();
    expect(debounced.debouncedValue()).toBe("b");
    debounced.dispose();
  });

  it("passes through function values without interpreting them as computations", () => {
    const initial = vi.fn(() => "initial");
    const replacement = () => "replacement";
    const functions = setup<() => string>(initial, 0);
    expect(functions.value()).toBe(initial);
    expect(functions.debouncedValue()).toBe(initial);
    expect(initial).not.toHaveBeenCalled();

    functions.setValue(() => replacement);
    flush();
    expect(functions.value()).toBe(replacement);
    expect(functions.debouncedValue()).toBe(replacement);
    functions.dispose();
  });

  it("composes rapid updater writes against staged state", () => {
    vi.useFakeTimers();
    const debounced = setup(0, 100);

    expect(debounced.setValue((previous) => previous + 1)).toBe(1);
    expect(debounced.setValue((previous) => previous + 1)).toBe(2);
    expect(debounced.value()).toBe(0);
    flush();
    expect(debounced.value()).toBe(2);

    vi.advanceTimersByTime(100);
    flush();
    expect(debounced.debouncedValue()).toBe(2);
    debounced.dispose();
  });

  it("does not notify or reschedule Object.is-equivalent writes", () => {
    vi.useFakeTimers();
    let runs = 0;
    const debounced = createRoot((dispose) => {
      const signal = createDebounced(Number.NaN, 100);
      createEffect(signal.value, () => {
        runs++;
      });
      return { ...signal, dispose };
    });
    flush();

    debounced.setValue(Number.NaN);
    flush();
    expect(runs).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
    debounced.dispose();
  });

  it("cancels its timer when the owner is disposed", () => {
    vi.useFakeTimers();
    const debounced = setup("", 100);
    debounced.setValue("pending");
    expect(vi.getTimerCount()).toBe(1);
    debounced.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });
});
