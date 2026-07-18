import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

import { ElmBlockImage } from "./elm-block-image";

const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

describe("[Browser] ElmBlockImage", () => {
  it("opens its fallback-free lightbox and closes from the enlarged image", async () => {
    const rendered = render(() => <ElmBlockImage src={PIXEL} alt="dot" />);
    const dialog = rendered.container.querySelector("dialog")!;
    const imageContainer = rendered.container.querySelector(
      '[class*="image-container"]',
    ) as HTMLElement;

    expect(dialog.open).toBe(false);
    expect(rendered.container.querySelectorAll("img")).toHaveLength(1);
    expect(rendered.container.querySelector('[class*="fallback"]')).toBeNull();

    imageContainer.click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    await vi.waitFor(() => expect(dialog.className).toMatch(/shown/));
    await vi.waitFor(() => expect(dialog.querySelector("img")).not.toBeNull());

    const enlarged = dialog.querySelector("img")!;
    expect(enlarged).toHaveAttribute("loading", "lazy");
    expect(enlarged).toHaveAttribute("fetchpriority", "low");
    enlarged.click();

    await vi.waitFor(() => expect(dialog.open).toBe(false), { timeout: 1000 });
    expect(rendered.container.querySelectorAll("img")).toHaveLength(1);
  });
});
