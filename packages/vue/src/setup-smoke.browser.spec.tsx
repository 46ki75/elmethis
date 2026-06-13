import { render } from "vitest-browser-vue";
import { describe, expect, test, vi } from "vitest";
import { defineComponent, ref } from "vue";

// Browser-layer smoke test. This file exists to validate the real-Chromium
// setup (vitest.browser.config.ts → vitest-browser-vue + Playwright), not to
// test a shipped component — so the subject is defined inline and nothing is
// exported from the library.
//
// It exercises what only a real browser can: the actual
// `navigator.clipboard.writeText` round-trip (clipboard permissions are granted
// in the browser project config) plus a reactive state flip driven by the real
// click handler. happy-dom cannot fake any of this.

const TEXT = "elmethis-vue-clipboard-content";

const ClipboardProbe = defineComponent({
  name: "ClipboardProbe",
  setup() {
    const copied = ref(false);
    const copy = async () => {
      await navigator.clipboard.writeText(TEXT);
      copied.value = true;
    };
    return () => (
      <button type="button" onClick={copy}>
        {copied.value ? "Copied" : "Copy"}
      </button>
    );
  },
});

describe("[browser] setup smoke", () => {
  test("writes to the real clipboard and flips reactive state on click", async () => {
    const screen = await render(ClipboardProbe);

    await screen.getByRole("button", { name: "Copy" }).click();

    // The write resolved → clipboard holds the value and the label re-rendered.
    await vi.waitFor(async () =>
      expect(await navigator.clipboard.readText()).toBe(TEXT),
    );
    await expect
      .element(screen.getByRole("button"))
      .toHaveTextContent("Copied");
  });
});
