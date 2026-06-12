import { useState } from "react";
import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

import { ElmSelect } from "./elm-select";

// ElmSelect renders its options with a per-iteration inline `onClick` inside
// `options.map(...)`, and the collapsed list is clipped (not `display:none`) by
// ElmCollapse's `grid-template-rows: 0fr` + `overflow: hidden`. Real layout/
// focus and a genuine option click are exercised here in a real browser.

const Harness = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div>
      <output data-testid="selected">{String(selected)}</output>
      <ElmSelect
        label="Pick"
        selectedOptionId={selected}
        onSelectedOptionIdChange={setSelected}
        options={[
          { id: "a", label: "Apple" },
          { id: "b", label: "Banana" },
          { id: "c", label: "Cherry" },
        ]}
      />
    </div>
  );
};

// The options are clipped, not removed, so they still report "visible". Detect
// open/closed via the state class. CSS Modules keep the authored name as a
// substring.
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

    // Click an option — if the per-iteration handler failed, the binding would
    // never change.
    await screen.getByText("Banana").click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("selected").element().textContent).toBe("b"),
    );
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
