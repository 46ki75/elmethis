import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmToggleTheme } from "./elm-toggle-theme";

describe("[SSR] ElmToggleTheme", () => {
  it("renders deterministic light controls with unique SVG references", () => {
    const renderPair = () =>
      renderToString(() => (
        <>
          <ElmToggleTheme />
          <ElmToggleTheme />
        </>
      ));
    const html = renderPair();
    const ids = [...html.matchAll(/<mask id="([^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(html).toContain('aria-label="Switch to dark theme"');
    expect(html).toContain('width="2rem"');
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(renderPair()).toBe(html);
  });
});
