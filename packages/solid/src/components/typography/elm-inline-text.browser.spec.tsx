import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { ElmInlineText } from "./elm-inline-text";

const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='red'/%3E%3C/svg%3E";

describe("[Browser] ElmInlineText", () => {
  it("applies text, code, and keyboard styles", async () => {
    const rendered = render(() => (
      <ElmInlineText
        data-testid="text"
        color="rgb(10, 20, 30)"
        backgroundColor="rgb(40, 50, 60)"
        size="20px"
        code
        kbd
      >
        Styled text
      </ElmInlineText>
    ));
    const screen = page.elementLocator(rendered.baseElement);

    await expect.element(screen.getByText("Styled text")).toBeInTheDocument();

    const rootStyle = getComputedStyle(rendered.getByTestId("text"));
    const codeStyle = getComputedStyle(
      rendered.container.querySelector("code")!,
    );
    const kbd = rendered.container.querySelector("kbd")!;
    const kbdStyle = getComputedStyle(kbd);
    const kbdDepth = getComputedStyle(kbd, "::before");

    expect(rootStyle.color).toBe("rgb(10, 20, 30)");
    expect(rootStyle.backgroundColor).toBe("rgb(40, 50, 60)");
    expect(rootStyle.fontSize).toBe("20px");
    expect(rootStyle.lineHeight).toBe("20px");
    expect(rootStyle.whiteSpace).toBe("pre-line");
    expect(codeStyle.fontFamily).toContain("monospace");
    expect(codeStyle.borderRadius).not.toBe("0px");
    expect(kbdStyle.position).toBe("relative");
    expect(kbdDepth.content).toBe('""');
  });

  it("renders a focusable inline-flex link and visible favicon", async () => {
    const rendered = render(() => (
      <ElmInlineText href="https://example.com" favicon={ICON}>
        External link
      </ElmInlineText>
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const link = rendered.getByRole("link", { name: /External link/ });
    const image = rendered.container.querySelector("img")!;

    await expect.element(screen.getByRole("link")).toBeInTheDocument();

    link.focus();
    expect(document.activeElement).toBe(link);
    expect(getComputedStyle(link).display).toBe("inline-flex");
    expect(getComputedStyle(link).cursor).toBe("pointer");
    expect(image.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(image.getBoundingClientRect().height).toBeGreaterThan(0);
  });
});
