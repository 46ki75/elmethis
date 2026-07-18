import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { ElmCopyIcon } from "./elm-copy-icon";

describe("[Browser] ElmCopyIcon", () => {
  it("uses Chromium's clipboard and exposes visible success feedback", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    const rendered = render(() => <ElmCopyIcon content="browser copy" />);
    const screen = page.elementLocator(rendered.baseElement);

    await screen.getByRole("button", { name: "Copy to clipboard" }).click();

    await vi.waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("browser copy"),
    );
    await expect
      .element(screen.getByRole("button", { name: "Copied" }))
      .toBeVisible();
    expect(getComputedStyle(rendered.getByRole("button")).display).toBe(
      "inline-flex",
    );
  });
});
