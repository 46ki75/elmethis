import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { ElmTemplate } from "./elm-template";

describe("[Browser] ElmTemplate", () => {
  it("applies its padding and resolves theme colors from its parent", async () => {
    const foreground = "rgb(10, 20, 30)";
    const background = "rgb(230, 240, 250)";
    const rendered = render(() => (
      <div
        style={{
          "--elmethis-color-neutral": foreground,
          "--elmethis-color-surface-raised": background,
        }}
      >
        <ElmTemplate>Template content</ElmTemplate>
      </div>
    ));
    const screen = page.elementLocator(rendered.baseElement);

    await expect.element(screen.getByText("Template content")).toBeVisible();

    const style = getComputedStyle(rendered.getByText("Template content"));
    expect(style.padding).toBe(
      getComputedStyle(document.documentElement).fontSize,
    );
    expect(style.color).toBe(foreground);
    expect(style.backgroundColor).toBe(background);
  });
});
