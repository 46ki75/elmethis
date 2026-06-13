import { describe, expect, it } from "vitest";
import {
  LANGUAGE_REGISTRY,
  LANGUAGES,
  languageIcons,
  normalizeLanguage,
} from "./registry";

describe("language registry derivations", () => {
  it("derives LANGUAGES as the registry keys in order", () => {
    expect(LANGUAGES).toEqual(LANGUAGE_REGISTRY.map((e) => e.key));
  });

  it("gives every glyph language an icon, and none to file", () => {
    for (const entry of LANGUAGE_REGISTRY) {
      if (entry.key === "file") {
        expect(entry.icon).toBeNull();
        expect(languageIcons).not.toHaveProperty("file");
      } else {
        expect(languageIcons[entry.key as keyof typeof languageIcons]).toBe(
          entry.icon,
        );
      }
    }
  });

  it("normalizes each key and alias onto its key", () => {
    for (const entry of LANGUAGE_REGISTRY) {
      expect(normalizeLanguage(entry.key)).toBe(entry.key);
      for (const alias of entry.aliases) {
        expect(normalizeLanguage(alias)).toBe(entry.key);
      }
    }
  });

  it("normalizes an unknown hint to file", () => {
    expect(normalizeLanguage("totally-unknown-lang")).toBe("file");
  });

  it("has no colliding key or alias across entries", () => {
    const hints = LANGUAGE_REGISTRY.flatMap((e) => [e.key, ...e.aliases]);
    expect(new Set(hints).size).toBe(hints.length);
  });
});
