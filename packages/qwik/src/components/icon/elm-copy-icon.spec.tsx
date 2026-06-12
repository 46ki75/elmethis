// @vitest-environment happy-dom

import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";

import { ElmCopyIcon } from "./elm-copy-icon";
import { mdiClipboardOutline } from "@mdi/js";

// ElmCopyIcon is a thin wrapper around useClipboard's CopyButton — clipboard
// behavior is covered by use-clipboard.spec. Here we only smoke-render and
// assert the copy affordance (the clipboard glyph) shows up.

describe("[CSR]", () => {
  test("renders the clipboard copy affordance", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmCopyIcon content="hello" />);
    const html = screen.outerHTML.toLowerCase();
    expect(html).toContain("<svg");
    // The idle state shows the clipboard-outline glyph.
    expect(html).toContain(`d="${mdiClipboardOutline.toLowerCase()}"`);
  });
});
