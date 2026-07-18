import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { BASIC_CATALOG_ID, ElmA2ui } from "./elm-a2ui";

describe("[SSR] ElmA2ui", () => {
  it("imports and renders its inert shell without browser globals", () => {
    const html = renderToString(() => (
      <ElmA2ui
        class="server-surface"
        data-renderer="solid"
        messages={[
          {
            version: "v0.9",
            createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
          },
        ]}
      />
    ));
    expect(html).toContain("server-surface");
    expect(html).toContain('data-renderer="solid"');
    expect(html).not.toContain("window");
  });
});
