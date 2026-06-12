import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmBookmark } from "./elm-bookmark";

// ElmBookmark renders an external link card: an `<a href>` (new-tab + noopener)
// wrapping an OGP `<img>`, the title/description text, and a link row that shows
// the favicon when supplied or the mdi link icon as a fallback.

describe("[CSR] ElmBookmark", () => {
  test("renders an anchor to url with safe new-tab rel", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmBookmark
        title="Example"
        url="https://example.com"
        description="An example site"
      />,
    );

    const a = screen.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("https://example.com");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(screen.outerHTML).toContain("Example");
    expect(screen.outerHTML).toContain("An example site");
  });

  test("renders the OGP img with the supplied image src", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmBookmark
        title="t"
        url="https://example.com"
        image="https://example.com/ogp.png"
      />,
    );

    const img = screen.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("https://example.com/ogp.png");
  });

  test("falls back to the mdi link icon when no favicon is given", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmBookmark title="t" url="https://example.com" />);

    // No favicon -> the link row renders an ElmMdiIcon <svg>, not an
    // ElmInlineIcon <img>-based icon.
    expect(screen.querySelector('[class*="link"] svg')).toBeTruthy();
  });

  test("renders the favicon icon when favicon is provided", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmBookmark
        title="t"
        url="https://example.com"
        favicon="https://example.com/favicon.ico"
      />,
    );

    const html = screen.outerHTML;
    expect(html).toContain("https://example.com/favicon.ico");
  });
});

describe("[SSR] ElmBookmark", () => {
  test("server HTML emits the anchor and title", async () => {
    const { html } = await renderToString(
      <ElmBookmark title="Example" url="https://example.com" />,
      { containerTagName: "div" },
    );
    expect(html.toLowerCase()).toContain("<a");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("Example");
  });
});
