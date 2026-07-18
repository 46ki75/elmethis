import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmUnsupportedBlock } from "./elm-unsupported-block";

describe("[SSR] ElmUnsupportedBlock", () => {
  it("renders the message, optional details, and forwarded attributes", () => {
    const withoutDetails = renderToString(() => <ElmUnsupportedBlock />);
    const withDetails = renderToString(() => (
      <ElmUnsupportedBlock details="type: mermaid" data-block="unsupported" />
    ));

    expect(withoutDetails).toContain("UNSUPPORTED BLOCK");
    expect(withoutDetails).not.toContain("type: mermaid");
    expect(withDetails).toContain("type: mermaid");
    expect(withDetails).toContain('data-block="unsupported"');
  });
});
