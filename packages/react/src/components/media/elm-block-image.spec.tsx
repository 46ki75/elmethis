import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmBlockImage } from "./elm-block-image";

// ElmBlockImage renders a `<figure>` with the inline image, a rectangle-wave
// loading fallback, an optional caption, and a `useModal` lightbox.
//
// The unit layer covers structure and the CLOSED/loading markup: happy-dom
// neither resolves `<img>.decode()` nor fires a real network `onLoad`, so the
// loaded image + click-to-zoom OPEN lifecycle (`<dialog>.showModal()`, top
// layer) lives in `elm-block-image.browser.spec.tsx`.

describe("[CSR] ElmBlockImage — structure", () => {
  test("renders a figure with the inline image pointing at src", () => {
    const { container } = render(
      <ElmBlockImage src="https://example.com/a.png" alt="A" />,
    );
    expect(container.querySelector("figure")).toBeTruthy();
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("https://example.com/a.png");
    expect(img.getAttribute("alt")).toBe("A");
  });

  test("renders the rectangle-wave loading fallback", () => {
    const { container } = render(
      <ElmBlockImage src="https://example.com/a.png" />,
    );
    expect(container.querySelector('[class*="fallback"]')).toBeTruthy();
    expect(
      container.querySelector('[class*="elm-rectangle-wave"]'),
    ).toBeTruthy();
  });

  test("the lightbox <dialog> shell is present and closed (only the inline image)", () => {
    const { container } = render(
      <ElmBlockImage src="https://example.com/a.png" />,
    );
    const dialog = container.querySelector("dialog")!;
    expect(dialog).toBeTruthy();
    expect(dialog.open).toBe(false);
    // Closed: only the inline <img> is rendered (the enlarged modal image is
    // gated behind the open state).
    expect(container.querySelectorAll("img").length).toBe(1);
  });

  test("merges a passthrough className onto the figure", () => {
    const { container } = render(
      <ElmBlockImage
        src="https://example.com/a.png"
        className="custom-class"
      />,
    );
    expect(container.querySelector("figure")).toHaveClass("custom-class");
  });
});

describe("[CSR] ElmBlockImage — alt fallback", () => {
  test("alt falls back to caption when alt is absent", () => {
    const { container } = render(
      <ElmBlockImage src="https://example.com/a.png" caption="A photo" />,
    );
    expect(container.querySelector("img")!.getAttribute("alt")).toBe("A photo");
  });

  test("alt falls back to 'Image' when neither alt nor caption is given", () => {
    const { container } = render(
      <ElmBlockImage src="https://example.com/a.png" />,
    );
    expect(container.querySelector("img")!.getAttribute("alt")).toBe("Image");
  });
});

describe("[CSR] ElmBlockImage — caption", () => {
  test("renders the figcaption when a caption is provided", () => {
    const { container } = render(
      <ElmBlockImage src="https://example.com/a.png" caption="A photo" />,
    );
    expect(container.querySelector("figcaption")).toBeTruthy();
    expect(container.querySelector("figcaption")).toHaveTextContent("A photo");
  });

  test("omits the figcaption when no caption is provided", () => {
    const { container } = render(
      <ElmBlockImage src="https://example.com/a.png" />,
    );
    expect(container.querySelector("figcaption")).toBeNull();
  });
});

describe("[SSR] ElmBlockImage", () => {
  test("renders a figure with the inline image pointing at src", () => {
    const html = renderToStaticMarkup(
      <ElmBlockImage src="https://example.com/a.png" alt="A" />,
    );
    const lower = html.toLowerCase();
    expect(lower).toContain("<figure");
    expect(lower).toContain("elm-block-image");
    expect(html).toContain('src="https://example.com/a.png"');
    expect(html).toContain('alt="A"');
  });

  test("renders the rectangle-wave loading fallback", () => {
    const html = renderToStaticMarkup(
      <ElmBlockImage src="https://example.com/a.png" />,
    );
    expect(html).toContain("fallback");
    expect(html).toContain("elm-rectangle-wave");
  });

  test("the lightbox <dialog> shell is present and closed (no enlarged image)", () => {
    const html = renderToStaticMarkup(
      <ElmBlockImage src="https://example.com/a.png" />,
    ).toLowerCase();
    expect(html).toContain("<dialog");
    expect((html.match(/<img/g) ?? []).length).toBe(1);
  });

  test("alt falls back to caption when alt is absent", () => {
    const html = renderToStaticMarkup(
      <ElmBlockImage src="https://example.com/a.png" caption="A photo" />,
    );
    expect(html).toContain('alt="A photo"');
  });

  test("alt falls back to 'Image' when neither alt nor caption is given", () => {
    const html = renderToStaticMarkup(
      <ElmBlockImage src="https://example.com/a.png" />,
    );
    expect(html).toContain('alt="Image"');
  });

  test("renders the figcaption when a caption is provided", () => {
    const html = renderToStaticMarkup(
      <ElmBlockImage src="https://example.com/a.png" caption="A photo" />,
    );
    expect(html.toLowerCase()).toContain("<figcaption");
    expect(html).toContain("A photo");
  });

  test("omits the figcaption when no caption is provided", () => {
    const html = renderToStaticMarkup(
      <ElmBlockImage src="https://example.com/a.png" />,
    );
    expect(html.toLowerCase()).not.toContain("<figcaption");
  });
});
