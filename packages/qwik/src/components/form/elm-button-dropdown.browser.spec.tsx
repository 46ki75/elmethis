import { component$, useSignal } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmButtonDropdown } from "./elm-button-dropdown";

// ElmButtonDropdown renders its menu items with a per-iteration inline
// `onClick$` inside `items.map(...)` — the same QRL-in-iteration shape that
// failed to resolve elsewhere (see [[feedback_qwik_qrl_in_jsx_iteration]]).
// createDOM can't catch it because it doesn't run the real optimizer, so this
// real-browser spec drives an actual item click: a broken handler surfaces as
// "selection never changes". See [[project_qwik_browser_testing]].

// `items` is created inside the component (NOT a captured module const) so the
// lazy segment doesn't re-import this spec module mid-test.
const Harness = component$(() => {
  const selected = useSignal<string | null>(null);
  return (
    <div>
      <output data-testid="selected">{String(selected.value)}</output>
      <ElmButtonDropdown
        label="Run"
        selectedOptionId={selected}
        items={[
          { id: "edit", label: "Edit" },
          { id: "remove", label: "Remove" },
        ]}
      />
    </div>
  );
});

// The main button reflects the selection; scope to it so the same label still
// present in the collapsed menu row doesn't match.
const mainButtonText = () =>
  document.querySelector('[class*="main"]')?.textContent ?? "";

describe("[CSR] ElmButtonDropdown selection", () => {
  test("the caret opens the menu and an item click updates the binding + display", async () => {
    const screen = await render(<Harness />);

    // The caret toggles the menu open.
    await screen.getByRole("button", { name: "Toggle dropdown" }).click();

    // Click an item — this is the QRL-in-iteration handler under test. If it
    // failed to resolve, the binding would never change.
    await screen.getByText("Remove").click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("selected").element().textContent).toBe(
        "remove",
      ),
    );
    // The main action button now reflects the chosen option.
    await vi.waitFor(() => expect(mainButtonText()).toContain("Remove"));
  });
});
