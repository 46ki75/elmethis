import { render } from "vitest-browser-vue";
import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";

import { useClipboard } from "./use-clipboard";

// Real browser: the actual `navigator.clipboard.writeText` round-trip (verified
// by reading the value back — clipboard permissions are granted in the browser
// project config) and the copied-state icon feedback driven by @vueuse's
// auto-resetting `copied`.

const TEXT = "elmethis-vue-clipboard-content";

// `copy` and `CopyButton` share one hook instance, so driving `copy` from a
// plain (locatable) button still flips the `copied` state the icon reads. The
// short delay keeps the reset window observable.
const Harness = defineComponent({
  name: "Harness",
  setup() {
    const { CopyButton, copy } = useClipboard({ content: TEXT, delay: 250 });
    return () =>
      h("div", [
        h("button", { "data-testid": "copy", onClick: () => copy() }, "Copy"),
        h(CopyButton),
      ]);
  },
});

// CSS Modules hash the class but keep the authored name as a substring (e.g.
// `_use-clipboard-icon-copied_x1y2_3`), so this matches the copied-state icon.
const copiedIcon = () =>
  document.querySelector('[class*="use-clipboard-icon-copied"]');

describe("[browser] useClipboard", () => {
  test("writes the content to the real clipboard", async () => {
    const screen = render(Harness);

    await screen.getByTestId("copy").click();

    await vi.waitFor(async () =>
      expect(await navigator.clipboard.readText()).toBe(TEXT),
    );
  });

  test("shows the copied icon then resets it after the delay", async () => {
    const screen = render(Harness);
    expect(copiedIcon()).toBeNull();

    await screen.getByTestId("copy").click();

    // copied -> the check-variant class appears (the write must have resolved).
    await vi.waitFor(() => expect(copiedIcon()).not.toBeNull());
    // ...and @vueuse's copiedDuring timer clears it again.
    await vi.waitFor(() => expect(copiedIcon()).toBeNull());
  });
});
