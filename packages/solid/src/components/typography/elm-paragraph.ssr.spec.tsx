import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmParagraph } from "./elm-paragraph";

describe("[SSR] ElmParagraph", () => {
  it("renders content, scoped styles, and native attributes", () => {
    const html = renderToString(() => (
      <ElmParagraph
        color="green"
        backgroundColor="yellow"
        class="custom-paragraph"
        style={{ "letter-spacing": "1px" }}
        data-paragraph="server"
      >
        server paragraph
      </ElmParagraph>
    ));

    expect(html).toContain("<p");
    expect(html).toContain("server paragraph");
    expect(html).toContain("custom-paragraph");
    expect(html).toContain('data-paragraph="server"');
    expect(html).toContain("--elmethis-scoped-color:green");
    expect(html).toContain("--elmethis-scoped-background-color:yellow");
    expect(html).toContain("letter-spacing:1px");
    expect(html).not.toContain("backgroundColor=");
  });
});
