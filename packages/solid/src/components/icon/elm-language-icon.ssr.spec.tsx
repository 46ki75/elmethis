import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmLanguageIcon } from "./elm-language-icon";

describe("[SSR] ElmLanguageIcon", () => {
  it("renders registered artwork and the unknown-language fallback server-side", () => {
    const rust = renderToString(() => <ElmLanguageIcon language="rust" />);
    const fallback = renderToString(() => (
      <ElmLanguageIcon language="unknown" />
    ));

    expect(rust.toLowerCase()).toContain('fill="#a84f33"');
    expect(fallback).toContain('viewBox="0 0 24 24"');
    expect(fallback).toContain('d="M14.6,16.6');
  });
});
