import { lint } from "@google/design.md/linter";
import { parse } from "yaml";
import { describe, expect, test } from "vitest";

import { generateDesignMd, type DesignTheme } from "./design-md";
import { semanticTokens } from "./token";

interface DesignFrontmatter {
  version: string;
  name: string;
  omitted: Array<{ section: string; reason: string }>;
  colors: Record<string, string>;
  typography: Record<string, { fontFamily: string }>;
  spacing: Record<string, string>;
}

const themes = ["light", "dark"] as const satisfies readonly DesignTheme[];

const parseFrontmatter = (document: string): DesignFrontmatter => {
  const match = document.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match?.[1]) {
    throw new Error("DESIGN.md has no YAML frontmatter");
  }
  return parse(match[1]) as DesignFrontmatter;
};

describe("generateDesignMd", () => {
  test.each(themes)("generates a warning-free %s document", (theme) => {
    const report = lint(generateDesignMd(theme));

    expect(
      report.findings.filter(({ severity }) => severity === "error"),
    ).toEqual([]);
    expect(
      report.findings.filter(({ severity }) => severity === "warning"),
    ).toEqual([]);
  });

  test.each(themes)("exports every semantic color in %s", (theme) => {
    const { colors } = parseFrontmatter(generateDesignMd(theme));
    const semanticColorNames = Object.keys(semanticTokens)
      .filter((name) => name.startsWith("color-"))
      .map((name) => name.slice("color-".length))
      .sort();

    expect(Object.keys(colors).sort()).toEqual(semanticColorNames);
    expect(Object.keys(colors)).toHaveLength(44);
    expect(Object.keys(colors)).not.toContainEqual(
      expect.stringMatching(/^primitive-/),
    );
  });

  test("resolves light and dark semantic values independently", () => {
    const light = parseFrontmatter(generateDesignMd("light")).colors;
    const dark = parseFrontmatter(generateDesignMd("dark")).colors;

    expect(light).toMatchObject({
      "box-shadow": "#3e434b40",
      "surface-base": "#efecea",
      neutral: "#6c7483",
      "neutral-strong": "#555b67",
      primary: "#a68c70",
      "primary-hover": "#a68c7026",
      selection: "#a68c7040",
      "accent-error-surface": "#e9dddd",
      "display-cyan-surface": "#dde9e7",
    });
    expect(dark).toMatchObject({
      "box-shadow": "#242629",
      "surface-base": "#393e46",
      neutral: "#b0b5be",
      "neutral-strong": "#d7d9e1",
      primary: "#c6b5a2",
      "primary-hover": "#c6b5a226",
      selection: "#c6b5a240",
      "accent-error-surface": "#291313",
      "display-cyan-surface": "#203b37",
    });
    expect(light["accent-error"]).toBe(dark["accent-error"]);
    expect(light["display-cyan"]).toBe(dark["display-cyan"]);
  });

  test.each(themes)(
    "maps the remaining supported core tokens in %s",
    (theme) => {
      const frontmatter = parseFrontmatter(generateDesignMd(theme));

      expect(frontmatter).toMatchObject({
        version: "alpha",
        name: `Elmethis ${theme === "light" ? "Light" : "Dark"}`,
        spacing: { "stack-gap": "2rem" },
      });
      expect(frontmatter.typography.sans.fontFamily).toMatch(/^"DM Sans",/);
      expect(frontmatter.typography.monospace.fontFamily).toMatch(
        /^"DM Mono",/,
      );
      expect(frontmatter.omitted.map(({ section }) => section)).toEqual([
        "rounded",
        "components",
      ]);
    },
  );

  test.each(themes)("uses the canonical prose section order in %s", (theme) => {
    const headings = [...generateDesignMd(theme).matchAll(/^## (.+)$/gm)].map(
      ([, heading]) => heading,
    );

    expect(headings).toEqual([
      "Overview",
      "Colors",
      "Typography",
      "Layout",
      "Elevation & Depth",
      "Shapes",
      "Components",
      "Do's and Don'ts",
    ]);
  });

  test.each(themes)(
    "materializes unsupported CSS expressions in %s",
    (theme) => {
      const document = generateDesignMd(theme);

      expect(document).not.toMatch(/light-dark\(|oklch\(from|var\(/);
      expect(document).not.toContain("primitive-color");
    },
  );

  test.each(themes)(
    "is deterministic and ends with one newline in %s",
    (theme) => {
      const document = generateDesignMd(theme);

      expect(generateDesignMd(theme)).toBe(document);
      expect(document).toMatch(/[^\n]\n$/);
    },
  );
});
