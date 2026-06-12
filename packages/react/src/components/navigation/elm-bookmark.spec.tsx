import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmBookmark } from "./elm-bookmark";

// ElmBookmark renders an external link card: an `<a href>` (new-tab + noopener)
// wrapping an OGP `<img>`, the title/description text, and a link row that shows
// the favicon when supplied or the mdi link icon as a fallback.

describe("[CSR] ElmBookmark", () => {
  it("renders an anchor to url with safe new-tab rel", () => {
    const { container } = render(
      <ElmBookmark
        title="Example"
        url="https://example.com"
        description="An example site"
      />,
    );

    const a = container.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("https://example.com");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(container.textContent).toContain("Example");
    expect(container.textContent).toContain("An example site");
  });

  it("renders the OGP img with the supplied image src", () => {
    const { container } = render(
      <ElmBookmark
        title="t"
        url="https://example.com"
        image="https://example.com/ogp.png"
      />,
    );

    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("https://example.com/ogp.png");
  });

  it("falls back to the mdi link icon when no favicon is given", () => {
    const { container } = render(
      <ElmBookmark title="t" url="https://example.com" />,
    );

    // No favicon -> the link row renders an ElmMdiIcon <svg>, not an
    // ElmInlineIcon <img>-based icon.
    expect(container.querySelector('[class*="link"] svg')).toBeTruthy();
  });

  it("renders the favicon icon when favicon is provided", () => {
    const { container } = render(
      <ElmBookmark
        title="t"
        url="https://example.com"
        favicon="https://example.com/favicon.ico"
      />,
    );

    expect(container.innerHTML).toContain("https://example.com/favicon.ico");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmBookmark
        className="custom-class"
        title="t"
        url="https://example.com"
      />,
    );
    expect(container.querySelector("div")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmBookmark", () => {
  it("server HTML emits the anchor and title", () => {
    const html = renderToStaticMarkup(
      <ElmBookmark title="Example" url="https://example.com" />,
    );
    expect(html.toLowerCase()).toContain("<a");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("Example");
  });
});
