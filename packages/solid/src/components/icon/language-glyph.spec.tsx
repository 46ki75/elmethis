import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { languageIcons, type GlyphLanguage } from "@elmethis/core";
import { describe, expect, it } from "vitest";

import { LanguageGlyph } from "./language-glyph";

describe("[CSR] LanguageGlyph", () => {
  it("scopes gradient ids and references uniquely per instance", () => {
    const { container } = render(() => (
      <>
        <LanguageGlyph icon={languageIcons.python} />
        <LanguageGlyph icon={languageIcons.python} />
      </>
    ));
    const icons = container.querySelectorAll("svg");
    const firstId = icons[0]?.querySelector("linearGradient")?.id;
    const secondId = icons[1]?.querySelector("linearGradient")?.id;

    expect(firstId).toMatch(/^deviconPython0-/);
    expect(secondId).toMatch(/^deviconPython0-/);
    expect(firstId).not.toBe(secondId);
    expect(icons[0]?.innerHTML).toContain(`url(#${firstId})`);
    expect(icons[1]?.innerHTML).toContain(`url(#${secondId})`);
  });

  it("reactively updates artwork, dimensions, class, and style", () => {
    const [language, setLanguage] = createSignal<GlyphLanguage>("rust");
    const { container } = render(() => (
      <LanguageGlyph
        icon={languageIcons[language()]}
        size={language() === "rust" ? 24 : 48}
        class={language()}
        style={{ opacity: language() === "rust" ? 1 : 0.5 }}
      />
    ));
    const icon = container.querySelector("svg")!;

    expect(container.innerHTML.toLowerCase()).toContain('fill="#a84f33"');

    setLanguage("typescript");

    expect(container.innerHTML.toLowerCase()).toContain('fill="#007acc"');
    expect(icon).toHaveAttribute("width", "48");
    expect(icon).toHaveClass("typescript");
    expect(icon.style.opacity).toBe("0.5");
  });
});
