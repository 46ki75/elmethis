import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { ElmMarkdown } from "./elm-markdown";

describe("[Browser] ElmMarkdown streaming", () => {
  it("updates the tail without remounting a completed block", async () => {
    const Harness = () => {
      const [markdown, setMarkdown] = createSignal(
        "Stable browser block\n\nTail starts",
      );
      return (
        <>
          <button
            type="button"
            onClick={() =>
              setMarkdown("Stable browser block\n\nTail starts growing")
            }
          >
            Grow
          </button>
          <ElmMarkdown markdown={markdown()} isStreaming />
        </>
      );
    };
    const rendered = render(() => <Harness />);
    const screen = page.elementLocator(rendered.baseElement);
    const stable = rendered.getByText("Stable browser block").closest("p")!;
    const tail = rendered.getByText("Tail starts").closest("p")!;

    await screen.getByRole("button", { name: "Grow" }).click();
    await vi.waitFor(() =>
      expect(rendered.container.textContent).toContain("Tail starts growing"),
    );

    expect(rendered.getByText("Stable browser block").closest("p")).toBe(
      stable,
    );
    expect(rendered.getByText("Tail starts growing").closest("p")).not.toBe(
      tail,
    );
    expect(stable.isConnected).toBe(true);
    expect(tail.isConnected).toBe(false);
  });
});
