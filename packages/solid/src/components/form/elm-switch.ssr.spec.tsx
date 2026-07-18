import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmSwitch } from "./elm-switch";

describe("[SSR] ElmSwitch", () => {
  it("renders controlled state, styles, and forwarded props server-side", () => {
    const html = renderToString(() => (
      <ElmSwitch
        checked
        disabled
        color="red"
        size="24px"
        class="server-switch"
        data-switch="server"
      />
    ));

    expect(html).toContain('type="checkbox"');
    expect(html).toContain("checked");
    expect(html).toContain("disabled");
    expect(html).toContain("server-switch");
    expect(html).toContain('data-switch="server"');
    expect(html).toContain("--elmethis-scoped-color:red");
    expect(html).toContain("--elmethis-scoped-size:24px");
  });
});
