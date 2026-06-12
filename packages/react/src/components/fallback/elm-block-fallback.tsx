import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { clsx } from "clsx";

import styles from "./elm-block-fallback.module.css";
import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import { ElmRectangleWave } from "./elm-rectangle-wave";

export interface ElmBlockFallbackProps extends ComponentPropsWithoutRef<"div"> {
  height?: CSSProperties["height"];
}

export const ElmBlockFallback = ({
  className,
  style,
  height = "16rem",
  ...props
}: ElmBlockFallbackProps) => {
  return (
    <div
      className={clsx(styles["elm-block-fallback"], className)}
      style={
        {
          "--elmethis-scoped-height": height,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <ElmDotLoadingIcon />
      <ElmRectangleWave />
    </div>
  );
};
