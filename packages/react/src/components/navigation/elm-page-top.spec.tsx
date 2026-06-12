import { describe, expect, test, vi } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmPageTop } from "./elm-page-top";

// ElmPageTop is a scroll-to-top affordance. The visibility toggle is driven by
// a scroll listener that the unit layer fires unreliably, so visibility is left
// to a browser/Storybook check. What the unit layer can pin: the root nav
// renders, the `position` prop maps to the correct inline edge, and a click
// invokes the smooth `window.scrollTo` wiring.

describe("[CSR] ElmPageTop — render + position", () => {
  test("renders a nav carrying the root class and the 'Back to Top' label", () => {
    const { container } = render(<ElmPageTop />);

    const nav = container.querySelector("nav")!;
    expect(nav).toBeTruthy();
    expect(nav.className).toMatch(/elm-page-top/);
    expect(container.outerHTML).toContain("Back to Top");
  });

  test("position='right' (default) pins the button to the right edge", () => {
    const { container } = render(<ElmPageTop />);

    const nav = container.querySelector("nav") as HTMLElement;
    expect(nav.style.right).toMatch(/^0(px)?$/);
    expect(nav.style.left).toBe("auto");
  });

  test("position='left' pins the button to the left edge", () => {
    const { container } = render(<ElmPageTop position="left" />);

    const nav = container.querySelector("nav") as HTMLElement;
    expect(nav.style.left).toMatch(/^0(px)?$/);
    expect(nav.style.right).toBe("auto");
  });
});

describe("[CSR] ElmPageTop — interaction", () => {
  test("clicking the button calls window.scrollTo({ top: 0, behavior: 'smooth' })", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);

    const { container } = render(<ElmPageTop />);
    (container.querySelector("nav") as HTMLElement).click();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    vi.unstubAllGlobals();
  });
});

describe("[SSR] ElmPageTop", () => {
  test("server HTML emits the nav with the label", () => {
    const html = renderToStaticMarkup(<ElmPageTop />).toLowerCase();
    expect(html).toContain("<nav");
    expect(html).toContain("back to top");
  });
});
