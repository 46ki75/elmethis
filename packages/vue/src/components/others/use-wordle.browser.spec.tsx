import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { expect, test } from "vitest";

import { useWordle } from "./use-wordle";

// `useWordle` is a hook, so it has to be exercised through a host component.
// The hidden `<output>`s surface internal state for assertions without
// reaching into component internals.
const Harness = defineComponent({
  name: "Harness",
  setup() {
    const { Wordle, currentGuess, gameStatus } = useWordle({
      initialWord: "crane",
    });
    return () =>
      h("div", [
        h(Wordle),
        h("output", { "data-testid": "guess" }, currentGuess.value),
        h("output", { "data-testid": "status" }, gameStatus.value),
      ]);
  },
});

// CSR — the keyboard keys only respond if their click handler runs against the
// real event system in a real browser, which happy-dom cannot verify.
test("keyboard clicks build a guess and submit wins the game", async () => {
  render(Harness);

  for (const key of ["C", "R", "A", "N", "E"]) {
    await page.getByRole("button", { name: key, exact: true }).click();
  }
  await expect.element(page.getByTestId("guess")).toHaveTextContent("crane");

  await page.getByRole("button", { name: "Enter", exact: true }).click();
  await expect.element(page.getByText(/You won/)).toBeVisible();
});

// SSR — server HTML is produced without crashing and contains the keyboard.
test("renders the keyboard on the server", async () => {
  const html = await renderToString(createSSRApp({ render: () => h(Harness) }));
  expect(html).toContain("Enter");
});
