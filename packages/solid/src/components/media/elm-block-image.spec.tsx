import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmBlockImage } from "./elm-block-image";

describe("[CSR] ElmBlockImage", () => {
  it("renders a fallback-free image, closed dialog shell, and composed figure props", () => {
    let root: HTMLElement | undefined;
    const onClick = vi.fn();
    const rendered = render(() => (
      <ElmBlockImage
        ref={(element) => {
          root = element;
        }}
        src="https://example.com/image.png"
        alt="Example"
        class="custom-image"
        data-testid="figure"
        aria-label="Image block"
        onClick={onClick}
      />
    ));
    const figure = rendered.getByTestId("figure");
    const image = figure.querySelector("img")!;

    expect(figure).toBe(root);
    expect(figure).toHaveClass("custom-image");
    expect(figure).toHaveAttribute("aria-label", "Image block");
    expect(image).toHaveAttribute("src", "https://example.com/image.png");
    expect(image).toHaveAttribute("alt", "Example");
    expect(image).toHaveAttribute("fetchpriority", "auto");
    expect(figure.querySelectorAll("img")).toHaveLength(1);
    expect(figure.querySelector("dialog")).not.toHaveAttribute("open");
    expect(figure.querySelector('[class*="fallback"]')).toBeNull();

    fireEvent.click(image);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("forwards responsive image attributes and derives its aspect ratio", () => {
    const rendered = render(() => (
      <ElmBlockImage
        src="small.png"
        srcSet="small.png 400w, large.png 800w"
        sizes="(max-width: 600px) 400px, 800px"
        width={800}
        height={400}
      />
    ));
    const image = rendered.container.querySelector("img")!;

    expect(image).toHaveAttribute("srcset", "small.png 400w, large.png 800w");
    expect(image).toHaveAttribute("sizes", "(max-width: 600px) 400px, 800px");
    expect(image).toHaveAttribute("width", "800");
    expect(image).toHaveAttribute("height", "400");
    expect(image.style.getPropertyValue("--elmethis-scoped-aspect-ratio")).toBe(
      "800 / 400",
    );
  });

  it("uses caption and then Image as alt fallbacks", () => {
    const withCaption = render(() => (
      <ElmBlockImage src="a.png" caption="A photo" />
    ));
    const withoutCaption = render(() => <ElmBlockImage src="b.png" />);

    expect(withCaption.container.querySelector("img")).toHaveAttribute(
      "alt",
      "A photo",
    );
    expect(
      withCaption.getByText("A photo").closest("figcaption"),
    ).not.toBeNull();
    expect(withoutCaption.container.querySelector("img")).toHaveAttribute(
      "alt",
      "Image",
    );
    expect(withoutCaption.container.querySelector("figcaption")).toBeNull();
  });

  it("reactively updates image and caption props", () => {
    const [src, setSrc] = createSignal("first.png");
    const [caption, setCaption] = createSignal("First caption");
    const rendered = render(() => (
      <ElmBlockImage src={src()} caption={caption()} />
    ));

    setSrc("second.png");
    setCaption("Second caption");

    const image = rendered.container.querySelector("img")!;
    expect(image).toHaveAttribute("src", "second.png");
    expect(image).toHaveAttribute("alt", "Second caption");
    expect(rendered.container).toHaveTextContent("Second caption");
    expect(rendered.container).not.toHaveTextContent("First caption");
  });

  it("does not open its lightbox when modal behavior is disabled", () => {
    const rendered = render(() => (
      <ElmBlockImage src="image.png" enableModal={false} />
    ));
    const image = rendered.container.querySelector("img")!;

    fireEvent.click(image);

    expect(rendered.container.querySelectorAll("img")).toHaveLength(1);
    expect(image.style.getPropertyValue("--elmethis-scoped-cursor")).toBe(
      "default",
    );
  });
});
