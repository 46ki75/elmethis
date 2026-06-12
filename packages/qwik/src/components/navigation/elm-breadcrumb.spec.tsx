import { $ } from "@qwik.dev/core";
import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmBreadcrumb } from "./elm-breadcrumb";

// ElmBreadcrumb renders one `link-container` per item plus a chevron separator
// between items (n items -> n-1 chevrons). The first item gets the home icon,
// the last the application-outline icon, the rest folder-open. Item clicks are
// wired to each link's `onClick$`.

describe("[CSR] ElmBreadcrumb — structure", () => {
  test("renders one item per link with their text", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmBreadcrumb
        links={[{ text: "Home" }, { text: "Docs" }, { text: "Page" }]}
      />,
    );

    const items = screen.querySelectorAll('[class*="link-container"]');
    expect(items.length).toBe(3);
    expect(screen.outerHTML).toContain("Home");
    expect(screen.outerHTML).toContain("Docs");
    expect(screen.outerHTML).toContain("Page");
  });

  test("renders n-1 chevron separators between items", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmBreadcrumb links={[{ text: "a" }, { text: "b" }, { text: "c" }]} />,
    );

    // The chevron carries its own class; three items yield two separators.
    expect(screen.querySelectorAll('[class*="chevron"]').length).toBe(2);
  });

  test("a single link renders no separator", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmBreadcrumb links={[{ text: "only" }]} />);

    expect(screen.querySelectorAll('[class*="link-container"]').length).toBe(1);
    expect(screen.querySelectorAll('[class*="chevron"]').length).toBe(0);
  });
});

describe("[CSR] ElmBreadcrumb — interaction", () => {
  test("clicking an item fires its onClick$ handler", async () => {
    const clicked = { value: "" };
    const { screen, render, userEvent } = await createDOM();
    await render(
      <ElmBreadcrumb
        links={[
          { text: "Home", onClick$: $(() => (clicked.value = "home")) },
          { text: "Page", onClick$: $(() => (clicked.value = "page")) },
        ]}
      />,
    );

    const items = screen.querySelectorAll('[class*="link-container"]');
    await userEvent(items[1] as Element, "click");
    expect(clicked.value).toBe("page");
  });
});

describe("[SSR] ElmBreadcrumb", () => {
  test("server HTML renders the nav with every item's text", async () => {
    const { html } = await renderToString(
      <ElmBreadcrumb links={[{ text: "Home" }, { text: "Page" }]} />,
      { containerTagName: "div" },
    );
    expect(html.toLowerCase()).toContain("<nav");
    expect(html).toContain("Home");
    expect(html).toContain("Page");
  });
});
