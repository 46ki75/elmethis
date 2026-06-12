import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

import { useClipboard } from "./use-clipboard";

// The happy-dom spec (`use-clipboard.spec.tsx`) mocks `navigator.clipboard` and
// asserts the timer-cancel logic with fake timers. This layer adds what only a
// real browser can: the actual `navigator.clipboard.writeText` round-trip
// (verified by reading the value back — clipboard permissions are granted in
// the browser project config) and the copied-state icon feedback driven by the
// real click handler.

const TEXT = "elmethis-clipboard-content";

// `copy` and `CopyButton` share one hook instance, so driving `copy` from a
// plain (locatable) button still flips the `copied` state the icon reads. The
// short delay keeps the reset window observable.
const Harness = () => {
  const { CopyButton, copy } = useClipboard({
    content: TEXT,
    delay: 250,
  });
  return (
    <div>
      <button data-testid="copy" onClick={() => copy()}>
        Copy
      </button>
      <CopyButton />
    </div>
  );
};

// CSS Modules hash the class but keep the authored name as a substring (e.g.
// `_use-clipboard-icon-copied_x1y2_3`), so this matches the copied-state icon.
const copiedIcon = () =>
  document.querySelector('[class*="use-clipboard-icon-copied"]');

describe("[CSR] useClipboard", () => {
  test("writes the content to the real clipboard", async () => {
    const screen = await render(<Harness />);

    await screen.getByTestId("copy").click();

    await vi.waitFor(async () =>
      expect(await navigator.clipboard.readText()).toBe(TEXT),
    );
  });

  test("shows the copied icon then resets it after the delay", async () => {
    const screen = await render(<Harness />);
    expect(copiedIcon()).toBeNull();

    await screen.getByTestId("copy").click();

    // copied -> the check-variant class appears (the await on writeText must
    // have resolved for this to flip).
    await vi.waitFor(() => expect(copiedIcon()).not.toBeNull());
    // ...and the reset timer clears it again.
    await vi.waitFor(() => expect(copiedIcon()).toBeNull());
  });
});
