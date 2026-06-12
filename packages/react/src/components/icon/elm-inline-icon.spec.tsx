import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmInlineIcon } from "./elm-inline-icon";

const SRC = "https://example.com/icon.svg";

describe("[CSR]", () => {
  test("renders an <img> with the given src and alt", () => {
    const { container } = render(<ElmInlineIcon src={SRC} alt="my icon" />);
    const img = container.querySelector("img")!;
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", SRC);
    expect(img).toHaveAttribute("alt", "my icon");
  });

  test("size prop drives both width and height when neither is set", () => {
    const { container } = render(<ElmInlineIcon src={SRC} size={24} />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("width", "24");
    expect(img).toHaveAttribute("height", "24");
  });

  test("explicit width / height take precedence over size", () => {
    const { container } = render(
      <ElmInlineIcon src={SRC} size={24} width={48} height={12} />,
    );
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("width", "48");
    expect(img).toHaveAttribute("height", "12");
  });
});

describe("[SSR]", () => {
  test("renders the img shell with src", () => {
    const html = renderToStaticMarkup(<ElmInlineIcon src={SRC} />);
    expect(html).toContain("<img");
    expect(html).toContain(`src="${SRC}"`);
  });
});
