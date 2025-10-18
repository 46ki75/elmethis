import { type ComponentProps } from "react";

import style from "./ElmInlineIcon.module.scss";

export type ElmInlineIconProps = ComponentProps<"img">;

export const ElmInlineIcon = (props: ElmInlineIconProps) => {
  return <img {...props} className={style.icon} />;
};
