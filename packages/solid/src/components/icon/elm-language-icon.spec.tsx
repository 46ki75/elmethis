import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmLanguageIcon, LANGUAGES } from "./elm-language-icon";

describe("[CSR] ElmLanguageIcon", () => {
  it("uses the core registry for languages and aliases", () => {
    expect(LANGUAGES).toContain("rust");
    const { container } = render(() => <ElmLanguageIcon language="rs" />);

    expect(container.innerHTML.toLowerCase()).toContain('fill="#a84f33"');
  });

  it("falls back to the code-tags MDI icon for unknown languages", () => {
    const { container } = render(() => (
      <ElmLanguageIcon language="unknown" size={48} class="forwarded" />
    ));
    const icon = container.querySelector("svg")!;

    expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
    expect(icon).toHaveAttribute("width", "48");
    expect(icon).toHaveClass("forwarded");
    expect(container.querySelector("path")?.getAttribute("d")).toContain(
      "M14.6,16.6",
    );
  });

  it("reactively changes glyphs, size, class, and fallback state", () => {
    const [language, setLanguage] = createSignal("rust");
    const { container } = render(() => (
      <ElmLanguageIcon
        language={language()}
        size={language() === "typescript" ? 40 : 24}
        class={language()}
      />
    ));

    expect(container.innerHTML.toLowerCase()).toContain('fill="#a84f33"');

    setLanguage("typescript");
    expect(container.innerHTML.toLowerCase()).toContain('fill="#007acc"');
    expect(container.querySelector("svg")).toHaveAttribute("width", "40");
    expect(container.querySelector("svg")).toHaveClass("typescript");

    setLanguage("unknown");
    expect(container.querySelector("svg")).toHaveAttribute(
      "viewBox",
      "0 0 24 24",
    );
  });
});
