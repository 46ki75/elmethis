import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmHeading } from "./elm-heading";

describe("[SSR] ElmHeading", () => {
  it("renders the selected heading, content, fragment, styles, and attributes", () => {
    const html = renderToString(() => (
      <ElmHeading
        level={2}
        id="server-section"
        text="Server heading"
        class="custom-heading"
        style={{ "letter-spacing": "1px" }}
        data-heading="server"
      >
        child
      </ElmHeading>
    ));

    expect(html).toContain("<h2");
    expect(html).toContain("Server heading");
    expect(html).toContain("child");
    expect(html).toContain("#");
    expect(html).toContain('id="server-section"');
    expect(html).toContain('data-heading="server"');
    expect(html).toContain("custom-heading");
    expect(html).toContain("--elmethis-scoped-font-size:1.4em");
    expect(html).toContain("letter-spacing:1px");
  });
});
