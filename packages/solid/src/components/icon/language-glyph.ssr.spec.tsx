import { languageIcons } from "@elmethis/core";
import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { LanguageGlyph } from "./language-glyph";

describe("[SSR] LanguageGlyph", () => {
  it("renders scoped, matching gradient ids and references", () => {
    const html = renderToString(() => (
      <>
        <LanguageGlyph icon={languageIcons.python} />
        <LanguageGlyph icon={languageIcons.python} />
      </>
    ));
    const ids = [...html.matchAll(/id="(deviconPython0-[^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
    expect(html).toContain(`url(#${ids[0]})`);
    expect(html).toContain(`url(#${ids[1]})`);
  });
});
