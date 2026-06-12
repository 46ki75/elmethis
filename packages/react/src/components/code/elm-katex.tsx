import { type ComponentPropsWithoutRef, useMemo } from "react";
import { clsx } from "clsx";

import textStyle from "../../styles/text.module.css";
import styles from "./elm-katex.module.css";

import { renderToString } from "katex";

export interface ElmKatexProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The KaTex expression.
   */
  expression: string;

  /**
   * Whether to render the equation in block mode.
   * - If `true`, the equation will be rendered in block mode.
   * - If `false`, the equation will be rendered in inline mode.
   *
   * Default is `false`.
   */
  block?: boolean;
}

export const ElmKatex = ({
  className,
  expression,
  block,
  ...rest
}: ElmKatexProps) => {
  const html = useMemo(
    () =>
      renderToString(expression, {
        displayMode: block ?? false,
        output: "mathml",
      }),
    [expression, block],
  );

  return (
    <div
      className={clsx(
        textStyle.text,
        block ? styles["elm-katex"] : undefined,
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  );
};
