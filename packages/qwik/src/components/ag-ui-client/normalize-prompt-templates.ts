import type { InputContent } from "@ag-ui/client";

export interface PromptTemplateInput {
  description: string;
  content: string | InputContent[];
}

export interface PromptTemplate {
  description: string;
  content: InputContent[];
}

/**
 * Normalize prompt-template entries so every `content` field is an
 * `InputContent[]`. Plain strings are wrapped in a single `{ type: "text" }`
 * entry; pre-built `InputContent[]` arrays pass through unchanged.
 */
export function normalizePromptTemplates(
  templates: PromptTemplateInput[],
): PromptTemplate[] {
  return templates.map(({ description, content }) => {
    if (typeof content === "string") {
      return {
        description,
        content: [{ type: "text" as const, text: content }],
      };
    }
    return { description, content };
  });
}
