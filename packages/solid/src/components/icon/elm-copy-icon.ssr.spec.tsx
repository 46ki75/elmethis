import { mdiClipboardOutline } from "@mdi/js";
import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmCopyIcon } from "./elm-copy-icon";

describe("[SSR] ElmCopyIcon", () => {
  it("renders an accessible idle button without browser globals", () => {
    const html = renderToString(() => (
      <ElmCopyIcon content="server" class="server-copy" />
    ));

    expect(html).toContain("<button");
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="Copy to clipboard"');
    expect(html).toContain("server-copy");
    expect(html).toContain(`d="${mdiClipboardOutline}"`);
  });
});
