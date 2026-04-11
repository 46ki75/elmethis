import React, { useCallback, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmColorSample.module.css";

import { parseToHsl, parseToRgb, rgbToColorString } from "polished";
import { mdiCheck } from "@mdi/js";

import { ElmTooltip } from "@components/containments/ElmTooltip";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";

export interface ElmColorSampleProps {
  style?: React.CSSProperties;

  /**
   * The color to display.
   */
  color: string;
}

export const ElmColorSample = ({ color, style }: ElmColorSampleProps) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rgb = parseToRgb(color);
  const { hue, saturation, lightness } = parseToHsl(color);

  const hex = rgbToColorString(rgb);
  const rgbStr = `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
  const hslStr = `hsl(${Math.floor(hue)}, ${Math.floor(saturation * 100)}%, ${Math.floor(lightness * 100)}%)`;

  const copyText = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 1500);
      });
    },
    [],
  );

  return (
    <div style={{ "--color": color, ...style } as React.CSSProperties}>
      <ElmTooltip
        original={
          <>
            <div
              className={styles["color-bg"]}
              style={{ "--background-color": color } as React.CSSProperties}
              onClick={() => copyText(hex)}
            >
              {copied && (
                <ElmMdiIcon d={mdiCheck} size="1em" color="white" />
              )}
            </div>
            <div className={styles.text} onClick={() => copyText(hex)}>
              {hex}
            </div>
          </>
        }
        tooltip={
          <>
            <div className={styles.text} onClick={() => copyText(hex)}>
              {hex}
            </div>
            <div className={styles.text} onClick={() => copyText(rgbStr)}>
              {rgbStr}
            </div>
            <div className={styles.text} onClick={() => copyText(hslStr)}>
              {hslStr}
            </div>
          </>
        }
      />
    </div>
  );
};
