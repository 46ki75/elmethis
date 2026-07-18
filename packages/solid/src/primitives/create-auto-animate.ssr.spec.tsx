import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { createAutoAnimate } from "./create-auto-animate";

describe("[SSR] createAutoAnimate", () => {
  it("is import-safe and does not create a controller while rendering", () => {
    const html = renderToString(() => {
      const { ref, enabled, controller } = createAutoAnimate({
        enabled: false,
      });

      return (
        <ul
          ref={ref}
          data-enabled={String(enabled())}
          data-controller={String(controller() !== undefined)}
        >
          <li>Server item</li>
        </ul>
      );
    });

    expect(html).toContain("Server item");
    expect(html).toContain('data-enabled="false"');
    expect(html).toContain('data-controller="false"');
    expect(html).not.toContain("position:relative");
  });
});
