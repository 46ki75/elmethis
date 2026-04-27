import { ElmKatex } from "../../code/elm-katex";
import { ElmInlineText } from "../../typography/elm-inline-text";
import { CatalogRendererMap } from "../elm-a2ui-catalog-renderer";

export const elmBasicCatalogRendererMap: CatalogRendererMap = {
  RichText: ({ props, resolve }) => {
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
};
