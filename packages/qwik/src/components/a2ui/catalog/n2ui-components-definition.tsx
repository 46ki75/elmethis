import { z } from "zod";

import {
  AccessibilityAttributesSchema,
  ComponentApi,
  DynamicStringSchema,
} from "@a2ui/web_core/v0_9";

const CommonProps = {
  accessibility: AccessibilityAttributesSchema.optional(),
  weight: z
    .number()
    .describe(
      "The relative weight of this component within a Row or Column. This is similar to the CSS 'flex-grow' property. Note: this may ONLY be set when the component is a direct descendant of a Row or Column.",
    )
    .optional(),
};

export const RichTextApi = {
  name: "RichText",
  schema: z
    .object({
      ...CommonProps,
      text: DynamicStringSchema.describe(""),
      decoration: z
        .array(
          z.enum([
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "code",
            "katex",
          ]),
        )
        .describe("Text decorations to apply.")
        .optional(),
      ruby: z.string().describe("Ruby annotation text.").optional(),
      color: z
        .string()
        .describe("Text color (e.g. '#ff0000' or 'red').")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const LinkTextApi = {
  name: "LinkText",
  schema: z
    .object({
      ...CommonProps,
      text: DynamicStringSchema.describe(""),
      href: z.string().describe("The URL to link to."),
      favicon: z
        .string()
        .describe("The URL of the favicon to show before the text.")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

export { ColumnApi } from "@a2ui/web_core/v0_9/basic_catalog";

export const ParagraphApi = {
  name: "Paragraph",
  schema: z
    .object({
      ...CommonProps,
      children: z
        .union([
          z.array(z.string()),
          z.object({
            componentId: z.string(),
            path: z.string(),
          }),
        ])
        .describe(
          "Ordered list of inline component IDs (RichText, LinkText, etc.), or a list template.",
        ),
    })
    .strict(),
} satisfies ComponentApi;
