import { fireEvent, render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ElmColorPrimitiveSample } from "./elm-color-primitive-sample";
import { ElmColorSemanticSample } from "./elm-color-semantic-sample";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("[Browser] color samples", () => {
  it("passes a primitive token's computed hex value to the clipboard API", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    const rendered = render(() => <ElmColorPrimitiveSample />);
    const screen = page.elementLocator(rendered.baseElement);
    const token = "--elmethis-primitive-color-red-500";

    await screen.getByRole("button").click();
    await screen.getByTitle(token).click();

    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith("#ae6e6e"));
    expect(rendered.getByTitle(token)).toHaveTextContent("copied!");
  });

  it("resolves semantic hex values inside each swatch's theme panel", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    const rendered = render(() => <ElmColorSemanticSample />);
    const screen = page.elementLocator(rendered.baseElement);
    const token = "--elmethis-color-surface-base";
    const lightTarget = rendered.container.querySelector<HTMLElement>(
      `[data-theme="light"] [data-copy-token="${token}"]`,
    )!;
    const darkTarget = rendered.container.querySelector<HTMLElement>(
      `[data-theme="dark"] [data-copy-token="${token}"]`,
    )!;

    await screen.getByRole("button").click();
    fireEvent.click(lightTarget);
    fireEvent.click(darkTarget);

    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("#efecea");
      expect(writeText).toHaveBeenCalledWith("#393e46");
    });
  });
});
