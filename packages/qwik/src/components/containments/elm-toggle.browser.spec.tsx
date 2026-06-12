import { component$, useSignal } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmToggle } from "./elm-toggle";

// Click-driven toggling needs the real Qwik optimizer: the summary's inline
// `$()` onClick (paired with `preventdefault:click`) does not resolve/mutate
// under createDOM. Uncontrolled flips an internal signal; controlled writes
// straight back to the parent's bound signal.

describe("[CSR] uncontrolled toggle", () => {
  // Inline literals only (no module-level const closure) so Qwik's segment
  // re-import does not re-run describe().
  const Uncontrolled = component$(() => (
    <ElmToggle summary="Summary">
      <span>Body content</span>
    </ElmToggle>
  ));

  test("clicking the summary flips the open modifier", async () => {
    const screen = await render(<Uncontrolled />);

    const root = document.querySelector("[class*='elm-toggle']")!;
    await vi.waitFor(() => expect(root).toBeTruthy());
    expect(root.className).not.toContain("open");

    const summary = document.querySelector<HTMLElement>("[class*='summary']")!;
    summary.click();

    await vi.waitFor(() => expect(root.className).toContain("open"));
  });
});

describe("[CSR] controlled toggle", () => {
  const Controlled = component$(() => {
    const open = useSignal(false);
    return (
      <div>
        <output data-testid="state">{String(open.value)}</output>
        <ElmToggle summary="Summary" isOpen={open}>
          <span>Body content</span>
        </ElmToggle>
      </div>
    );
  });

  test("clicking writes back to the parent-owned signal", async () => {
    const screen = await render(<Controlled />);

    await expect
      .element(screen.getByTestId("state"))
      .toHaveTextContent("false");

    const summary = document.querySelector<HTMLElement>("[class*='summary']")!;
    summary.click();

    await expect.element(screen.getByTestId("state")).toHaveTextContent("true");

    summary.click();
    await expect
      .element(screen.getByTestId("state"))
      .toHaveTextContent("false");
  });
});
