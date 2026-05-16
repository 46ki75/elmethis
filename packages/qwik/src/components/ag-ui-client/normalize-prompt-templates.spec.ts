import { describe, expect, test } from "vitest";
import type { InputContent } from "@ag-ui/client";

import { normalizePromptTemplates } from "./normalize-prompt-templates";

describe("normalizePromptTemplates", () => {
  test("wraps a string content into a single text InputContent", () => {
    const out = normalizePromptTemplates([
      { description: "greet", content: "Hello" },
    ]);

    expect(out).toEqual([
      {
        description: "greet",
        content: [{ type: "text", text: "Hello" }],
      },
    ]);
  });

  test("passes an InputContent[] through unchanged", () => {
    const content: InputContent[] = [
      { type: "text", text: "Line one" },
      { type: "text", text: "Line two" },
    ];

    const out = normalizePromptTemplates([{ description: "multi", content }]);

    expect(out).toEqual([{ description: "multi", content }]);
    // Same reference (no defensive copy) — keeps the normalizer cheap.
    expect(out[0].content).toBe(content);
  });

  test("normalizes a mixed array (string + InputContent[]) entry-by-entry", () => {
    const richContent: InputContent[] = [{ type: "text", text: "Pre-built" }];

    const out = normalizePromptTemplates([
      { description: "string-form", content: "plain" },
      { description: "array-form", content: richContent },
    ]);

    expect(out).toEqual([
      {
        description: "string-form",
        content: [{ type: "text", text: "plain" }],
      },
      { description: "array-form", content: richContent },
    ]);
  });
});
