import React, { useMemo } from "react";

import "@styles/global.css";
import styles from "./ElmCubeIcon.module.css";

export interface ElmCubeIconCSSVariables {}

export interface ElmCubeIconProps {
  style?: React.CSSProperties & ElmCubeIconCSSVariables;

  className?: string;

  /**
   * The size of the cube [px]
   */
  size?: number;
}

const faces = [
  { name: "front", rotate: "" },
  { name: "back", rotate: "rotateY(180deg)" },
  { name: "left", rotate: "rotateY(-90deg)" },
  { name: "right", rotate: "rotateY(90deg)" },
  { name: "top", rotate: "rotateX(90deg)" },
  { name: "bottom", rotate: "rotateX(-90deg)" },
];

export const ElmCubeIcon = (props: ElmCubeIconProps) => {
  const { size = 128, style } = props;

  const commonTranslateZ = useMemo(() => `translateZ(${size / 2}px)`, [size]);

  return (
    <div
      className={[styles.cube, props.className].filter(Boolean).join(" ")}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...style,
      }}
    >
      {faces.map((face) => (
        <div
          key={face.name}
          className={styles.face}
          style={{
            transform: `${face.rotate} ${commonTranslateZ}`,
          }}
        />
      ))}
    </div>
  );
};
