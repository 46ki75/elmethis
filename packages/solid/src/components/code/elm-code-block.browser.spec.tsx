import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

vi.mock("./elm-shiki-highlighter", () => ({
  ElmShikiHighlighter: (props: { code: string }) => <pre>{props.code}</pre>,
}));

import { ElmCodeBlock } from "./elm-code-block";

describe("[Browser] ElmCodeBlock", () => {
  it("copies the current source and exposes success feedback", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    const rendered = render(() => (
      <ElmCodeBlock code="const copied = true;" language="typescript" />
    ));
    const screen = page.elementLocator(rendered.baseElement);

    await screen.getByRole("button", { name: "Copy to clipboard" }).click();

    await vi.waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("const copied = true;"),
    );
    await expect
      .element(screen.getByRole("button", { name: "Copied" }))
      .toBeVisible();
  });
});
