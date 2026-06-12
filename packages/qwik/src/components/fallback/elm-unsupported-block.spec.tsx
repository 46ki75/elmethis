import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmUnsupportedBlock } from "./elm-unsupported-block";

// ElmUnsupportedBlock is the static placeholder shown for blocks the renderer
// can't handle. It always shows the "UNSUPPORTED BLOCK" message + warning icon,
// and conditionally renders a `details` sub-line.

describe("[CSR] ElmUnsupportedBlock", () => {
  test("renders the UNSUPPORTED BLOCK message with the warning icon", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmUnsupportedBlock />);

    expect(
      screen.querySelector('[class*="elm-unsupported-block"]'),
    ).toBeTruthy();
    expect(screen.querySelector("svg")).toBeTruthy();
    expect(screen.outerHTML).toContain("UNSUPPORTED BLOCK");
  });

  test("omits the details line when no details prop is given", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmUnsupportedBlock />);

    expect(screen.querySelector('[class*="details"]')).toBeFalsy();
  });

  test("renders the details line when details is supplied", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmUnsupportedBlock details="type: mermaid" />);

    const details = screen.querySelector('[class*="details"]');
    expect(details).toBeTruthy();
    expect(screen.outerHTML).toContain("type: mermaid");
  });
});

describe("[SSR] ElmUnsupportedBlock", () => {
  test("server HTML emits the message, and the details only when provided", async () => {
    const without = await renderToString(<ElmUnsupportedBlock />, {
      containerTagName: "div",
    });
    expect(without.html).toContain("UNSUPPORTED BLOCK");

    const withDetails = await renderToString(
      <ElmUnsupportedBlock details="type: mermaid" />,
      { containerTagName: "div" },
    );
    expect(withDetails.html).toContain("type: mermaid");
  });
});
