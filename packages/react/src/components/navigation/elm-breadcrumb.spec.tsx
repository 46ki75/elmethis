import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmBreadcrumb } from "./elm-breadcrumb";

// ElmBreadcrumb renders one `link-container` per item plus a chevron separator
// between items (n items -> n-1 chevrons). The first item gets the home icon,
// the last the application-outline icon, the rest folder-open. Item clicks are
// wired to each link's `onClick`.

describe("[CSR] ElmBreadcrumb — structure", () => {
  it("renders one item per link with their text", () => {
    const { container } = render(
      <ElmBreadcrumb
        links={[{ text: "Home" }, { text: "Docs" }, { text: "Page" }]}
      />,
    );

    const items = container.querySelectorAll('[class*="link-container"]');
    expect(items.length).toBe(3);
    expect(container.textContent).toContain("Home");
    expect(container.textContent).toContain("Docs");
    expect(container.textContent).toContain("Page");
  });

  it("renders n-1 chevron separators between items", () => {
    const { container } = render(
      <ElmBreadcrumb links={[{ text: "a" }, { text: "b" }, { text: "c" }]} />,
    );

    // The chevron carries its own class; three items yield two separators.
    expect(container.querySelectorAll('[class*="chevron"]').length).toBe(2);
  });

  it("a single link renders no separator", () => {
    const { container } = render(<ElmBreadcrumb links={[{ text: "only" }]} />);

    expect(container.querySelectorAll('[class*="link-container"]').length).toBe(
      1,
    );
    expect(container.querySelectorAll('[class*="chevron"]').length).toBe(0);
  });

  it("merges a passthrough className onto the root nav", () => {
    const { container } = render(
      <ElmBreadcrumb className="custom-class" links={[{ text: "Home" }]} />,
    );
    expect(container.querySelector("nav")).toHaveClass("custom-class");
  });
});

describe("[CSR] ElmBreadcrumb — interaction", () => {
  it("clicking an item fires its onClick handler", () => {
    const onClick = vi.fn();
    const { container } = render(
      <ElmBreadcrumb links={[{ text: "Home" }, { text: "Page", onClick }]} />,
    );

    const items = container.querySelectorAll('[class*="link-container"]');
    (items[1] as HTMLElement).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("[SSR] ElmBreadcrumb", () => {
  it("server HTML renders the nav with every item's text", () => {
    const html = renderToStaticMarkup(
      <ElmBreadcrumb links={[{ text: "Home" }, { text: "Page" }]} />,
    );
    expect(html.toLowerCase()).toContain("<nav");
    expect(html).toContain("Home");
    expect(html).toContain("Page");
  });
});
