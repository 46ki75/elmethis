import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";

import { ElmHtml } from "./elm-html";

// ---------------------------------------------------------------------------
// [CSR]
//
// Reproduces a bug found in code review: while `autoHeight` is at its default
// `true`, the component unconditionally overwrites both the `height` prop and
// `style.height` with the (initially unmeasured) `contentHeight` state — so a
// caller-supplied height is silently dropped instead of being used until the
// real measurement lands. No real iframe navigation is needed to see this:
// it's true of the very first synchronous render, which is why this lives in
// the unit layer rather than *.browser.spec.tsx.
// ---------------------------------------------------------------------------
describe("[CSR] ElmHtml — explicit height while autoHeight is on", () => {
  test("an explicit `height` prop is not silently dropped before measurement completes", () => {
    const { container } = render(<ElmHtml html="<p>hi</p>" height={400} />);
    const iframe = container.querySelector("iframe")!;

    expect(iframe.getAttribute("height") ?? iframe.style.height).toBe("400");
  });

  test("an explicit `style.height` is not silently dropped before measurement completes", () => {
    const { container } = render(
      <ElmHtml html="<p>hi</p>" style={{ height: 400 }} />,
    );
    const iframe = container.querySelector("iframe")!;

    expect(iframe.style.height).toBe("400px");
  });
});
