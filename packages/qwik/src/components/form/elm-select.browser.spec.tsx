import { component$, useSignal } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmSelect } from "./elm-select";

// ElmSelect renders its options with a per-iteration inline `onClick$` inside
// `options.map(...)` — the exact QRL-in-iteration shape that failed to resolve
// in `use-wordle` (see [[feedback_qwik_qrl_in_jsx_iteration]]). createDOM can't
// catch it because it doesn't run the real optimizer; this real-browser spec
// drives an actual option click so a broken handler surfaces as "selection
// never changes". See [[project_qwik_browser_testing]].

// `options` is created inside the component (NOT a captured module const) so
// the lazy segment doesn't re-import this spec module mid-test.
const Harness = component$(() => {
  const selected = useSignal<string | null>(null);
  return (
    <div>
      <output data-testid="selected">{String(selected.value)}</output>
      <ElmSelect
        label="Pick"
        selectedOptionId={selected}
        options={[
          { id: "a", label: "Apple" },
          { id: "b", label: "Banana" },
          { id: "c", label: "Cherry" },
        ]}
      />
    </div>
  );
});

// The collapsed option list is hidden via ElmCollapse's `grid-template-rows:
// 0fr` + `overflow: hidden` — the options are clipped, not `display:none`, so
// Playwright still reports them "visible". Detect open/closed via the state
// class instead. CSS Modules keep the authored name as a substring.
const selectRoot = () =>
  document.querySelector('[class*="elm-select"]') as HTMLElement;
const isActive = () => /_active_/.test(selectRoot().className);
const selectedText = () =>
  document.querySelector('[class*="selected-option"]')?.textContent ?? "";

describe("[CSR] ElmSelect option selection", () => {
  test("clicking an option resolves its handler and updates the binding", async () => {
    const screen = await render(<Harness />);

    // Open the dropdown (the select root toggles `isOpen` on click).
    await screen.getByText("Pick").click();

    // Click an option — this is the QRL-in-iteration handler under test. If the
    // per-iteration handler failed to resolve, the binding would never change.
    await screen.getByText("Banana").click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("selected").element().textContent).toBe("b"),
    );
    // The selected-option area reflects the choice (scoped to avoid matching
    // the same label still present in the collapsed list).
    await vi.waitFor(() => expect(selectedText()).toContain("Banana"));
  });

  test("selecting an option closes the dropdown", async () => {
    const screen = await render(<Harness />);

    await screen.getByText("Pick").click();
    await vi.waitFor(() => expect(isActive()).toBe(true));

    await screen.getByText("Cherry").click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("selected").element().textContent).toBe("c"),
    );
    // The option handler sets `isOpen = false`, so the select drops its active
    // (open) state class.
    await vi.waitFor(() => expect(isActive()).toBe(false));
  });
});
