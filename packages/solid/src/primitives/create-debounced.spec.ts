import { createComputed, createRoot } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createDebounced } from "./create-debounced";

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("createDebounced", () => {
  it("updates the writable value immediately and debounces the trailing value", () => {
    vi.useFakeTimers();

    createRoot((dispose) => {
      const debounced = createDebounced("", 100);
      debounced.setValue("a");

      expect(debounced.value()).toBe("a");
      expect(debounced.debouncedValue()).toBe("");
      expect(debounced.isPending()).toBe(true);

      vi.advanceTimersByTime(99);
      expect(debounced.debouncedValue()).toBe("");
      vi.advanceTimersByTime(1);
      expect(debounced.debouncedValue()).toBe("a");
      expect(debounced.isPending()).toBe(false);
      dispose();
    });
  });

  it("resets the timer and only commits the latest rapid write", () => {
    vi.useFakeTimers();

    createRoot((dispose) => {
      const debounced = createDebounced("", 100);
      debounced.setValue("a");
      vi.advanceTimersByTime(75);
      debounced.setValue("b");
      vi.advanceTimersByTime(25);

      expect(debounced.debouncedValue()).toBe("");
      vi.advanceTimersByTime(75);
      expect(debounced.debouncedValue()).toBe("b");
      dispose();
    });
  });

  it("supports updater setters, function values, and synchronous passthrough", () => {
    createRoot((dispose) => {
      const debounced = createDebounced(1, 0);
      expect(debounced.setValue((previous) => previous + 1)).toBe(2);
      expect(debounced.value()).toBe(2);
      expect(debounced.debouncedValue()).toBe(2);

      const initial = () => "initial";
      const replacement = () => "replacement";
      const functions = createDebounced(initial, 0);
      functions.setValue(() => replacement);
      expect(functions.value()()).toBe("replacement");
      expect(functions.debouncedValue()()).toBe("replacement");
      dispose();
    });
  });

  it("does not notify or reschedule Object.is-equivalent writes", () => {
    vi.useFakeTimers();
    let runs = 0;

    createRoot((dispose) => {
      const debounced = createDebounced(Number.NaN, 100);
      createComputed(() => {
        debounced.value();
        runs++;
      });

      debounced.setValue(Number.NaN);
      expect(runs).toBe(1);
      expect(vi.getTimerCount()).toBe(0);
      dispose();
    });
  });

  it("cancels its timer when the owner is disposed", () => {
    vi.useFakeTimers();

    createRoot((dispose) => {
      const debounced = createDebounced("", 100);
      debounced.setValue("pending");
      expect(vi.getTimerCount()).toBe(1);
      dispose();
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
