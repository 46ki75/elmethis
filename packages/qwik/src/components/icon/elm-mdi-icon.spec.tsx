import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmMdiIcon } from "./elm-mdi-icon";
import { mdiCodeTags } from "@mdi/js";

describe("[CSR]", () => {
  test("renders a decorative currentColor SVG with the given path", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmMdiIcon path={mdiCodeTags} />);
    const html = screen.outerHTML.toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
    expect(html).toContain('focusable="false"');
    expect(html).toContain('fill="currentcolor"');
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
  });

  test("exposes a labeled icon as an image", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmMdiIcon path={mdiCodeTags} label="Code" />);
    const html = screen.outerHTML.toLowerCase();
    expect(html).toContain('role="img"');
    expect(html).not.toContain("aria-hidden");
    expect(html).toContain("<title>code</title>");
  });

  test("size prop drives both width and height", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmMdiIcon path={mdiCodeTags} size={32} />);
    const html = screen.outerHTML;
    expect(html).toContain('width="32"');
    expect(html).toContain('height="32"');
  });

  test("color prop sets the currentColor source", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmMdiIcon path={mdiCodeTags} color="var(--elmethis-color-primary)" />,
    );
    const html = screen.outerHTML;
    expect(html).toContain('color="var(--elmethis-color-primary)"');
    expect(html).toContain('fill="currentColor"');
  });

  test("uses native ARIA naming when provided", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmMdiIcon path={mdiCodeTags} aria-label="Code" />);
    const html = screen.outerHTML;
    expect(html).toContain('role="img"');
    expect(html).not.toContain("aria-hidden");
  });
});

describe("[SSR]", () => {
  test("renders the labeled svg shell with the path", async () => {
    const renderResult = await renderToString(
      <ElmMdiIcon path={mdiCodeTags} label="Code" />,
      { containerTagName: "div" },
    );
    const html = renderResult.html.toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain('role="img"');
    expect(html).toMatch(/<title[^>]*>code<\/title>/);
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
  });
});
