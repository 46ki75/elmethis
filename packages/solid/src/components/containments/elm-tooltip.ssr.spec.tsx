import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmTooltip } from "./elm-tooltip";

describe("[SSR] ElmTooltip", () => {
  it("renders both contents and forwarded attributes without geometry APIs", () => {
    const html = renderToString(() => (
      <ElmTooltip
        class="custom-tooltip"
        data-tooltip="example"
        original="Trigger"
        tooltip="Tip body"
      />
    ));

    expect(html).toContain("Trigger");
    expect(html).toContain("Tip body");
    expect(html).toContain("custom-tooltip");
    expect(html).toContain('data-tooltip="example"');
  });
});
