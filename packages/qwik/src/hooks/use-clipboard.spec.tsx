// @vitest-environment happy-dom

import { component$ } from "@qwik.dev/core";
import { createDOM } from "@qwik.dev/core/testing";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useClipboard } from "./use-clipboard";

// ---------------------------------------------------------------------------
// Wrapper component
// ---------------------------------------------------------------------------

const ClipboardWrapper = component$(() => {
  const { CopyButton } = useClipboard({
    content: "hello",
    // Short delay so tests can advance through it cleanly with fake timers.
    delay: 1500,
  });
  return (
    <div>
      <CopyButton />
    </div>
  );
});

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------

describe("[CSR] useClipboard", () => {
  let writeTextSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText: writeTextSpy },
    });
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("clicking the copy button writes content to the clipboard", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ClipboardWrapper />);

    const btn = screen.querySelector("span") as HTMLElement;
    expect(btn).toBeTruthy();
    await userEvent(btn, "click");

    expect(writeTextSpy).toHaveBeenCalledWith("hello");
  });

  // -------------------------------------------------------------------------
  // Repro: re-pressing the copy button before the reset timer fires must
  // cancel the previous reset, not stack a second one.
  //
  // Original code:
  //   copied.value = true;
  //   setTimeout(() => { copied.value = false; }, delay);
  //
  // — never cancels the previous timeout. Two presses within the window arm
  // two timers. The first one fires after `delay` ms, flipping copied back
  // to false while the second press's window is still active. The user sees
  // the "copied" feedback disappear early.
  //
  // We assert the fix by spying on `clearTimeout`: the fixed hook clears the
  // previous timer before arming the next one; the buggy hook does not.
  // -------------------------------------------------------------------------
  test("re-pressing within the reset window cancels the previous timer", async () => {
    // Spy AFTER enabling fake timers — vi swaps the global setTimeout /
    // clearTimeout implementations, so spying first would attach to the
    // unswapped versions that the hook no longer calls.
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    const { screen, render, userEvent } = await createDOM();
    await render(<ClipboardWrapper />);

    const btn = screen.querySelector("span") as HTMLElement;

    await userEvent(btn, "click");
    await vi.advanceTimersByTimeAsync(0);
    const callsAfterFirstClick = clearSpy.mock.calls.length;

    // Half-way through the window, press again.
    await vi.advanceTimersByTimeAsync(800);
    await userEvent(btn, "click");
    await vi.advanceTimersByTimeAsync(0);

    // The second click must have called clearTimeout to cancel the first
    // press's reset before arming its own.
    expect(clearSpy.mock.calls.length).toBeGreaterThan(callsAfterFirstClick);
  });
});
