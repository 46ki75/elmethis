import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmBookmark } from "./elm-bookmark";

describe("[CSR] ElmBookmark", () => {
  it("renders a safe external link and the supplied content", () => {
    const { container } = render(() => (
      <ElmBookmark
        title="Example"
        url="https://example.com"
        description="An example site"
        image="https://example.com/og.png"
      />
    ));

    const link = container.querySelector("a")!;
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(container).toHaveTextContent("Example");
    expect(container).toHaveTextContent("An example site");
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/og.png",
    );
  });

  it("resets the image error state when the image changes", () => {
    const [image, setImage] = createSignal("https://example.com/broken.png");
    const { container } = render(() => (
      <ElmBookmark title="Example" image={image()} />
    ));
    const imageElement = container.querySelector<HTMLImageElement>("img")!;

    fireEvent.error(imageElement);
    expect(imageElement).toHaveStyle({ visibility: "hidden", width: "0" });

    setImage("https://example.com/replacement.png");

    expect(imageElement).toHaveAttribute(
      "src",
      "https://example.com/replacement.png",
    );
    expect(imageElement).not.toHaveStyle({ visibility: "hidden" });
  });

  it("reactively switches between the fallback and favicon icons", () => {
    const [favicon, setFavicon] = createSignal<string>();
    const { container } = render(() => (
      <ElmBookmark title="Example" favicon={favicon()} />
    ));
    const iconContainer = container.querySelector('[class*="link"]')!;

    expect(iconContainer.querySelector("svg")).toBeInTheDocument();

    setFavicon("https://example.com/favicon.ico");

    expect(iconContainer.querySelector("svg")).not.toBeInTheDocument();
    expect(iconContainer.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/favicon.ico",
    );
  });

  it("merges class and forwards native attributes and refs to the root", () => {
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmBookmark
        ref={(element) => {
          root = element;
        }}
        title="Example"
        class="custom-bookmark"
        data-testid="bookmark"
        aria-label="Example bookmark"
      />
    ));

    const bookmark = getByTestId("bookmark");
    expect(bookmark).toBe(root);
    expect(bookmark).toHaveClass("custom-bookmark");
    expect(bookmark).toHaveAttribute("aria-label", "Example bookmark");
  });
});
