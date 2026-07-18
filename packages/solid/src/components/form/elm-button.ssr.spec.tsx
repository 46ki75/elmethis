import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmButton } from "./elm-button";

describe("[SSR] ElmButton", () => {
  it("renders its initial content, styles, and native props server-side", () => {
    const html = renderToString(() => (
      <ElmButton
        primary
        block
        color="red"
        class="server-button"
        data-button="server"
      >
        Submit
      </ElmButton>
    ));

    expect(html).toContain("<button");
    expect(html).toContain("Submit");
    expect(html).toContain("server-button");
    expect(html).toContain('data-button="server"');
    expect(html).toContain("--elmethis-scoped-color:red");
    expect(html).not.toContain(" isLoading=");
    expect(html).not.toContain(" primary=");
  });

  it("renders the loading shell without children server-side", () => {
    const html = renderToString(() => (
      <ElmButton isLoading>Hidden child</ElmButton>
    ));

    expect(html).toContain("elm-dot-loading-icon");
    expect(html).not.toContain("Hidden child");
  });
});
