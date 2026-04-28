import { z } from "zod";
import { ElmKatex } from "../../code/elm-katex";
import { ElmInlineText } from "../../typography/elm-inline-text";
import {
  CatalogRendererMap,
  RenderContext,
} from "../elm-a2ui-catalog-renderer";
import {
  LinkTextApi,
  ParagraphApi,
  RichTextApi,
} from "./n2ui-components-definition";
import { ElmParagraph } from "../../typography/elm-paragraph";
import { elmBasicCatalogRendererMap } from "../elm-a2ui-basic-catalog-renderer";

type Props<T extends { schema: z.ZodTypeAny }> = z.infer<T["schema"]>;
type Ctx<T extends { schema: z.ZodTypeAny }> = RenderContext<Props<T>>;

export const elmN2UICatalogRendererMap: CatalogRendererMap<
  "RichText" | "LinkText" | "Column" | "Paragraph"
> = {
  RichText: ({ props, resolve }: Ctx<typeof RichTextApi>) => {
    const text = resolve(props.text);
    const katex = props.decoration?.includes("katex");

    if (katex) {
      return <ElmKatex expression={text} block={false} />;
    }

    const bold = props.decoration?.includes("bold");
    const italic = props.decoration?.includes("italic");
    const underline = props.decoration?.includes("underline");
    const strikethrough = props.decoration?.includes("strikethrough");
    const code = props.decoration?.includes("code");

    return (
      <ElmInlineText
        bold={bold}
        italic={italic}
        underline={underline}
        strikethrough={strikethrough}
        code={code}
        color={props.color}
      >
        {text}
      </ElmInlineText>
    );
  },

  LinkText: ({ props, resolve }: Ctx<typeof LinkTextApi>) => {
    const text = resolve(props.text);
    return (
      <ElmInlineText href={props.href} favicon={props.favicon}>
        {text}
      </ElmInlineText>
    );
  },

  Column: elmBasicCatalogRendererMap.Column,

  Paragraph: ({ props, childRefs, renderChild }: Ctx<typeof ParagraphApi>) => (
    <ElmParagraph>
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`}>{renderChild(id, path)}</span>
      ))}
    </ElmParagraph>
  ),
};
