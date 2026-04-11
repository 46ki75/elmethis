import React from "react";

import "@styles/global.css";
import styles from "./ElmLoginIcon.module.css";
import { ElmMdiIcon } from "./ElmMdiIcon";
import { mdiLoading, mdiLoginVariant, mdiLogoutVariant } from "@mdi/js";

export interface ElmLoginIconCSSVariables {}

export interface ElmLoginIconProps {
  style?: React.CSSProperties & ElmLoginIconCSSVariables;

  /**
   * Specifies the width of the icon.
   */
  size?: string;

  /**
   * Specifies whether the icon is for login or logout.
   */
  isLogin?: boolean;

  /**
   * Specifies whether the icon is loading.
   */
  isLoading?: boolean;
}

export const ElmLoginIcon = (props: ElmLoginIconProps) => {
  const { size = "2rem", isLogin = false, isLoading = false, style } = props;

  const d = isLoading
    ? mdiLoading
    : isLogin
      ? mdiLogoutVariant
      : mdiLoginVariant;

  const color = isLoading ? "gray" : isLogin ? "#b36472" : "#6987b8";

  return (
    <div className={styles.icon} style={style}>
      <ElmMdiIcon d={d} color={color} size={size} />
    </div>
  );
};
