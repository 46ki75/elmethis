import { type ComponentProps } from "react";

import style from "./ElmInlineIcon.module.scss";

export type ElmInlineIconProps = ComponentProps<"img">;

const ElmInlineIcon = (props: ElmInlineIconProps) => {
  return <img {...props} className={style.icon} />;
};

export default ElmInlineIcon;
