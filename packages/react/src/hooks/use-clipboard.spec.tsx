// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { useClipboard } from "./use-clipboard";

// ---------------------------------------------------------------------------
// Wrapper component
// ---------------------------------------------------------------------------

const ClipboardWrapper = () => {
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
};

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

  it("clicking the copy button writes content to the clipboard", async () => {
    const { container } = render(<ClipboardWrapper />);

    const btn = container.querySelector("span") as HTMLElement;
    expect(btn).toBeTruthy();
    btn.click();

    await vi.waitFor(() => expect(writeTextSpy).toHaveBeenCalledWith("hello"));
  });

  // -------------------------------------------------------------------------
  // Repro: re-pressing the copy button before the reset timer fires must
  // cancel the previous reset, not stack a second one. The fixed hook clears
  // the previous timer before arming the next one; a buggy hook does not.
  // -------------------------------------------------------------------------
  it("re-pressing within the reset window cancels the previous timer", async () => {
    // Real timers + `waitFor`: the reset timer is only armed once the async
    // clipboard write resolves, so we wait for each copy to settle before
    // observing `clearTimeout`. The 1500ms reset never fires during the test.
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    const { container } = render(<ClipboardWrapper />);

    const btn = container.querySelector("span") as HTMLElement;

    // First press: arms reset timer #1 (nothing to clear yet).
    btn.click();
    await vi.waitFor(() => expect(writeTextSpy).toHaveBeenCalledTimes(1));
    const callsAfterFirstClick = clearSpy.mock.calls.length;

    // Second press within the window: must clear timer #1 before arming #2.
    btn.click();
    await vi.waitFor(() => expect(writeTextSpy).toHaveBeenCalledTimes(2));
    await vi.waitFor(() =>
      expect(clearSpy.mock.calls.length).toBeGreaterThan(callsAfterFirstClick),
    );
  });
});

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------

describe("[SSR] useClipboard", () => {
  it("renders the copy button server-side", () => {
    const html = renderToStaticMarkup(<ClipboardWrapper />).toLowerCase();
    expect(html).toContain("<span");
    expect(html).toContain("<svg");
  });
});
