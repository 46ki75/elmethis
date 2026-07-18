import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmBreadcrumb } from "./elm-breadcrumb";

describe("[SSR] ElmBreadcrumb", () => {
  it("renders the nav, all item text, separators, and forwarded attributes", () => {
    const html = renderToString(() => (
      <ElmBreadcrumb
        links={[{ text: "Home" }, { text: "Docs" }, { text: "Page" }]}
        class="custom-breadcrumb"
        aria-label="Breadcrumb"
      />
    ));

    expect(html).toContain("<nav");
    expect(html).toContain("Home");
    expect(html).toContain("Docs");
    expect(html).toContain("Page");
    expect(html.match(/chevron/g)).toHaveLength(2);
    expect(html).toContain("custom-breadcrumb");
    expect(html).toContain('aria-label="Breadcrumb"');
  });
});
