import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";
import { mdiFormatQuoteClose, mdiFormatQuoteOpen } from "@mdi/js";

import styles from "./elm-block-quote.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmBlockQuoteProps extends ComponentPropsWithoutRef<"blockquote"> {}

export const ElmBlockQuote = ({
  className,
  children,
  ...props
}: ElmBlockQuoteProps) => {
  return (
    <blockquote
      className={clsx(styles["elm-block-quote"], textStyles.text, className)}
      {...props}
    >
      <div className={clsx(styles.icon, styles["icon-top-left"])}>
        <ElmMdiIcon d={mdiFormatQuoteOpen} />
      </div>

      <div className={styles.body}>{children}</div>

      <div className={clsx(styles.icon, styles["icon-bottom-right"])}>
        <ElmMdiIcon d={mdiFormatQuoteClose} />
      </div>
    </blockquote>
  );
};
