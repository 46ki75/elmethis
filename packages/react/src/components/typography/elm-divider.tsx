import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-divider.module.css";

export type ElmDividerProps = ComponentPropsWithoutRef<"hr">;

export const ElmDivider = ({ className, ...props }: ElmDividerProps) => {
  return <hr className={clsx(styles["elm-divider"], className)} {...props} />;
};
