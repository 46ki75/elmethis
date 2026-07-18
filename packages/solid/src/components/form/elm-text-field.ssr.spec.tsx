import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmTextField } from "./elm-text-field";

describe("[SSR] ElmTextField", () => {
  it("renders the complete initial shell without browser globals", () => {
    const html = renderToString(() => (
      <ElmTextField
        label="Password"
        prefix="account"
        suffix=".test"
        value="secret"
        maxLength={12}
        isPassword
        required
        class="server-field"
        data-field="server"
      />
    ));

    expect(html).toContain("Password");
    expect(html).toContain("account");
    expect(html).toContain(".test");
    expect(html).toContain("6 / 12");
    expect(html).toContain('type="password"');
    expect(html).toContain('value="secret"');
    expect(html).toContain('data-field="server"');
    expect(html).toContain("server-field");
    expect(html.match(/type="button"/g)).toHaveLength(2);
    expect(html).not.toContain(' label="Password"');
  });
});
