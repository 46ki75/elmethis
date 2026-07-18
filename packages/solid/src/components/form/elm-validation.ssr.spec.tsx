import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmValidation } from "./elm-validation";

describe("[SSR] ElmValidation", () => {
  it("renders its icon, text, styles, and forwarded props server-side", () => {
    const html = renderToString(() => (
      <ElmValidation
        text="Server checked"
        isValid
        validColor="red"
        class="server-validation"
        data-validation="server"
      />
    ));

    expect(html).toContain("Server checked");
    expect(html).toContain("<svg");
    expect(html).toContain("server-validation");
    expect(html).toContain('data-validation="server"');
    expect(html).toContain("--elmethis-scoped-opacity:1");
    expect(html).not.toContain(" isValid=");
    expect(html).not.toContain(" validColor=");
  });
});
