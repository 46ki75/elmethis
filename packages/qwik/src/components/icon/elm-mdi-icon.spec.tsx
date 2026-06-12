import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmMdiIcon } from "./elm-mdi-icon";
import { mdiCodeTags } from "@mdi/js";

describe("[CSR]", () => {
  test("renders an <svg role='img'> with the given path", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmMdiIcon d={mdiCodeTags} />);
    const html = screen.outerHTML.toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain('role="img"');
    // The `d` prop must reach the inner <path>.
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
  });

  test("size prop drives both width and height", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmMdiIcon d={mdiCodeTags} size="32px" />);
    const html = screen.outerHTML;
    expect(html).toContain('width="32px"');
    expect(html).toContain('height="32px"');
  });

  test("color prop feeds the svg fill and the scoped light color var", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmMdiIcon d={mdiCodeTags} color="#ff0000" />);
    const html = screen.outerHTML;
    expect(html).toContain('fill="#ff0000"');
    // Both --elmethis-scoped-color and --dark-color fall back to `color`.
    expect(html).toContain("--elmethis-scoped-color:#ff0000");
    expect(html).toContain("--dark-color:#ff0000");
  });

  test("lightColor / darkColor override the scoped color vars independently", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmMdiIcon d={mdiCodeTags} lightColor="#111" darkColor="#eee" />,
    );
    const html = screen.outerHTML;
    expect(html).toContain("--elmethis-scoped-color:#111");
    expect(html).toContain("--dark-color:#eee");
  });
});

describe("[SSR]", () => {
  test("renders the svg shell with the path", async () => {
    const renderResult = await renderToString(<ElmMdiIcon d={mdiCodeTags} />, {
      containerTagName: "div",
    });
    const html = renderResult.html.toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain('role="img"');
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
  });
});
