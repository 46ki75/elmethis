import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmInlineIcon } from "./elm-inline-icon";

const SRC = "https://example.com/icon.svg";

describe("[CSR]", () => {
  test("renders an <img> with the given src and alt", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmInlineIcon src={SRC} alt="my icon" />);
    const html = screen.outerHTML;
    expect(html).toContain("<img");
    expect(html).toContain(`src="${SRC}"`);
    expect(html).toContain('alt="my icon"');
  });

  test("size prop drives both width and height when neither is set", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmInlineIcon src={SRC} size={24} />);
    const html = screen.outerHTML;
    expect(html).toContain('width="24"');
    expect(html).toContain('height="24"');
  });

  test("explicit width / height take precedence over size", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmInlineIcon src={SRC} size={24} width={48} height={12} />);
    const html = screen.outerHTML;
    expect(html).toContain('width="48"');
    expect(html).toContain('height="12"');
  });
});

describe("[SSR]", () => {
  test("renders the img shell with src", async () => {
    const renderResult = await renderToString(<ElmInlineIcon src={SRC} />, {
      containerTagName: "div",
    });
    const html = renderResult.html;
    expect(html).toContain("<img");
    expect(html).toContain(`src="${SRC}"`);
  });
});
