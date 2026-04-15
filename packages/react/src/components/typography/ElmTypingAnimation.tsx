import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmTypingAnimation.module.css";

export interface ElmTypingAnimationCSSVariables {}

export interface ElmTypingAnimationProps {
  style?: React.CSSProperties & ElmTypingAnimationCSSVariables;

  className?: string;

  /**
   * The texts to display.
   */
  texts: string[];

  /**
   * The interval between each text (ms).
   */
  interval?: number;

  /**
   * The font size of the text.
   */
  fontSize?: React.CSSProperties["fontSize"];
}

const sleep = (duration: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

export const ElmTypingAnimation = ({
  texts = [],
  interval = 3000,
  fontSize = "1rem",
  ...props
}: ElmTypingAnimationProps) => {
  const [display, setDisplay] = useState("");
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const run = async () => {
      while (!cancelledRef.current) {
        for (const text of texts) {
          // Type forward
          for (let i = 0; i < text.length; i++) {
            if (cancelledRef.current) return;
            await sleep(75);
            if (cancelledRef.current) return;
            setDisplay(text.slice(0, i + 1));
          }
          await sleep(interval);
          if (cancelledRef.current) return;

          // Delete backward
          for (let i = text.length; i >= 0; i--) {
            if (cancelledRef.current) return;
            setDisplay(text.slice(0, i));
            await sleep(25);
            if (cancelledRef.current) return;
          }
          await sleep(200);
          if (cancelledRef.current) return;
        }
      }
    };

    run();

    return () => {
      cancelledRef.current = true;
    };
  }, [texts, interval]);

  return (
    <span
      className={[styles.text, props.className].filter(Boolean).join(" ")}
      style={{ fontSize, ...props.style }}
    >
      {display}
      <span className={styles.cursor}>&nbsp;</span>
    </span>
  );
};
