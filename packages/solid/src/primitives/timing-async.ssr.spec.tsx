import { renderToString } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createAsyncState } from "./create-async-state";
import { createDebounced } from "./create-debounced";
import { createDelayedSignal } from "./create-delayed-signal";
import { createThrottled } from "./create-throttled";
import { createThrottledQueue } from "./create-throttled-queue";

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("[SSR] timing and async primitives", () => {
  it("renders initial accessor values without scheduling timing work", () => {
    vi.useFakeTimers();
    renderToString(() => <p>baseline</p>);
    const frameworkTimerCount = vi.getTimerCount();
    vi.clearAllTimers();

    const Example = () => {
      const delayed = createDelayedSignal("delayed");
      const debounced = createDebounced("debounced", 100);
      const throttled = createThrottled("throttled", 100);

      return (
        <p>
          {delayed.value()}|{delayed.delayedValue()}|{debounced.value()}|
          {debounced.debouncedValue()}|{throttled.value()}|
          {throttled.throttledValue()}
        </p>
      );
    };

    const html = renderToString(() => <Example />).replace(/<!--.*?-->/g, "");
    expect(html).toContain(
      "delayed|delayed|debounced|debounced|throttled|throttled",
    );
    expect(vi.getTimerCount()).toBe(frameworkTimerCount);
  });

  it("does not run createAsyncState's immediate client effect", () => {
    vi.useFakeTimers();
    renderToString(() => <p>baseline</p>);
    const frameworkTimerCount = vi.getTimerCount();
    vi.clearAllTimers();
    const task = vi.fn(async () => "loaded");

    const Example = () => {
      const asyncState = createAsyncState(task, "initial", {
        immediate: true,
        delay: 100,
      });
      return (
        <p>
          {asyncState.state()}|{String(asyncState.isLoading())}|
          {String(asyncState.isReady())}
        </p>
      );
    };

    const html = renderToString(() => <Example />).replace(/<!--.*?-->/g, "");
    expect(html).toContain("initial|false|false");
    expect(task).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(frameworkTimerCount);
  });

  it("creates and disposes an owner-aware queue without browser APIs", () => {
    const Example = () => {
      createThrottledQueue();
      return <p>queue ready</p>;
    };

    expect(renderToString(() => <Example />)).toContain("queue ready");
  });
});
