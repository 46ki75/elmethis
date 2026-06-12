import { useState } from "react";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { describe, expect, test, vi } from "vitest";

import { ElmToggle } from "./elm-toggle";

// Click-driven toggling is verified in a real browser to mirror the qwik twin's
// split. Uncontrolled flips internal state; controlled writes straight back to
// the parent-owned value.

describe("[CSR] uncontrolled toggle", () => {
  test("clicking the summary flips the open modifier", async () => {
    await render(
      <ElmToggle summary="Summary">
        <span>Body content</span>
      </ElmToggle>,
    );

    const root = document.querySelector("[class*='elm-toggle']")!;
    expect(root).toBeTruthy();
    expect(root.className).not.toContain("open");

    const summary = document.querySelector<HTMLElement>("[class*='summary']")!;
    summary.click();

    await vi.waitFor(() => expect(root.className).toContain("open"));
  });
});

describe("[CSR] controlled toggle", () => {
  const Controlled = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <output data-testid="state">{String(isOpen)}</output>
        <ElmToggle summary="Summary" isOpen={isOpen} onOpenChange={setIsOpen}>
          <span>Body content</span>
        </ElmToggle>
      </div>
    );
  };

  test("clicking writes back to the parent-owned value", async () => {
    render(<Controlled />);

    await expect.element(page.getByTestId("state")).toHaveTextContent("false");

    const summary = document.querySelector<HTMLElement>("[class*='summary']")!;
    summary.click();

    await expect.element(page.getByTestId("state")).toHaveTextContent("true");

    summary.click();
    await expect.element(page.getByTestId("state")).toHaveTextContent("false");
  });
});
