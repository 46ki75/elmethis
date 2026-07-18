import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmTextArea } from "./elm-text-area";

describe("[SSR] ElmTextArea", () => {
  it("renders an uncontrolled initial value and counter server-side", () => {
    const html = renderToString(() => (
      <ElmTextArea
        label="Notes"
        defaultValue="server seed"
        maxLength={30}
        required
        class="server-area"
        data-area="server"
      />
    ));

    expect(html).toContain("Notes");
    expect(html).toContain("server seed");
    expect(html).toContain("11 / 30");
    expect(html).toContain('rows="3"');
    expect(html).toContain('data-area="server"');
    expect(html).toContain("server-area");
    expect(html).not.toContain(' label="Notes"');
  });

  it("prefers controlled value over defaultValue in the initial shell", () => {
    const html = renderToString(() => (
      <ElmTextArea label="Body" value="controlled" defaultValue="fallback" />
    ));

    expect(html).toContain("controlled");
    expect(html).not.toContain("fallback");
    expect(html).toContain(">10<");
  });
});
