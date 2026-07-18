import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmToggle } from "./elm-toggle";

describe("[SSR] ElmToggle", () => {
  it("renders initial state, summary, content, and forwarded props server-side", () => {
    const html = renderToString(() => (
      <ElmToggle
        class="server-toggle"
        data-toggle="server"
        summary="Summary text"
        defaultIsOpen
        monochrome
      >
        <span>Body content</span>
      </ElmToggle>
    ));

    expect(html).toContain("Summary text");
    expect(html).toContain("Body content");
    expect(html).toContain("server-toggle");
    expect(html).toContain('data-toggle="server"');
    expect(html).toContain("open");
    expect(html).not.toContain("defaultIsOpen=");
    expect(html).not.toContain("monochrome=");
    expect(html).not.toContain("summary=");
  });
});
