import React, { useEffect, useState } from "react";

import "@styles/global.css";
import styles from "./ElmTyping.module.css";

interface TypingTarget {
  char: string;
  status: "typed" | "incorrect" | "current" | "default";
}

export interface ElmTypingProps {
  style?: React.CSSProperties;

  /**
   * The target text for the typing game.
   */
  target?: string;
}

export const ElmTyping = ({
  target = "Typing game",
  style,
}: ElmTypingProps) => {
  const [targetArray, setTargetArray] = useState<TypingTarget[]>(() => {
    const arr: TypingTarget[] = target.split("").map((char) => ({ char, status: "default" }));
    if (arr.length > 0) arr[0].status = "current";
    return arr;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const arr: TypingTarget[] = target.split("").map((char) => ({ char, status: "default" }));
    if (arr.length > 0) arr[0].status = "current";
    const t = window.setTimeout(() => {
      setTargetArray(arr);
      setCurrentIndex(0);
      setMistakes(0);
      setIsFinished(false);
    }, 0);
    return () => clearTimeout(t);
  }, [target]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isFinished || event.key.length !== 1) return;

      setTargetArray((prev) => {
        if (!prev[currentIndex]) return prev;
        const next = [...prev];
        if (event.key === next[currentIndex].char) {
          next[currentIndex] = { ...next[currentIndex], status: "typed" };
          if (currentIndex === next.length - 1) {
            setIsFinished(true);
          } else {
            setCurrentIndex((i) => {
              next[i + 1] = { ...next[i + 1], status: "current" };
              return i + 1;
            });
          }
        } else {
          next[currentIndex] = { ...next[currentIndex], status: "incorrect" };
          setMistakes((m) => m + 1);
        }
        return next;
      });
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, isFinished]);

  return (
    <div style={style}>
      <div>
        {targetArray.map((t, i) => (
          <span
            key={i}
            className={[
              styles.char,
              t.status === "typed" ? styles.typed : "",
              t.status === "current" ? styles.current : "",
              t.status === "incorrect" ? styles.incorrect : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {t.char}
          </span>
        ))}
      </div>
      {isFinished && <div>FINISH!</div>}
      {mistakes > 0 && <div>Mistakes: {mistakes}</div>}
    </div>
  );
};
