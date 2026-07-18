import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmCheckbox } from "./elm-checkbox";

describe("[SSR] ElmCheckbox", () => {
  it("renders initial checked markup and forwarded props server-side", () => {
    const html = renderToString(() => (
      <ElmCheckbox
        label="Server checkbox"
        defaultChecked
        class="server-checkbox"
        data-checkbox="server"
      />
    ));

    expect(html).toContain("Server checkbox");
    expect(html).toContain("server-checkbox");
    expect(html).toContain('data-checkbox="server"');
    expect(html).toContain("check-line");
    expect(html).not.toContain(" defaultChecked=");
    expect(html).not.toContain(" label=");
  });

  it("honors a falsy controlled value over defaultChecked server-side", () => {
    const html = renderToString(() => (
      <ElmCheckbox label="Controlled false" checked={false} defaultChecked />
    ));

    expect(html).not.toContain("check-line");
  });
});
