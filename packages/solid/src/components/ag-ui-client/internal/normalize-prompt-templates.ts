import type { InputContent } from "@ag-ui/client";

export interface PromptTemplateInput {
  description: string;
  content: string | InputContent[];
}

export interface PromptTemplate {
  description: string;
  content: InputContent[];
}

export function normalizePromptTemplates(
  templates: PromptTemplateInput[],
): PromptTemplate[] {
  return templates.map(({ description, content }) => ({
    description,
    content:
      typeof content === "string"
        ? [{ type: "text" as const, text: content }]
        : content,
  }));
}
