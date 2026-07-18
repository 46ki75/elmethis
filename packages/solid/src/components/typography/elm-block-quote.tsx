import { splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-block-quote.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

const FORMAT_QUOTE_OPEN =
  "M10,7L8,11H11V17H5V11L7,7H10M18,7L16,11H19V17H13V11L15,7H18Z";
const FORMAT_QUOTE_CLOSE =
  "M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z";

export interface ElmBlockQuoteProps extends JSX.BlockquoteHTMLAttributes<HTMLQuoteElement> {}

export const ElmBlockQuote = (props: ElmBlockQuoteProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <blockquote
      {...rest}
      class={clsx(styles["elm-block-quote"], textStyles.text, local.class)}
    >
      <div class={clsx(styles.icon, styles["icon-top-left"])}>
        <ElmMdiIcon d={FORMAT_QUOTE_OPEN} />
      </div>

      <div class={styles.body}>{local.children}</div>

      <div class={clsx(styles.icon, styles["icon-bottom-right"])}>
        <ElmMdiIcon d={FORMAT_QUOTE_CLOSE} />
      </div>
    </blockquote>
  );
};
