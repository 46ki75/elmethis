import React, { useEffect, useState } from "react";

import "@styles/global.css";
import styles from "./ElmPageTop.module.css";

export interface ElmPageTopCSSVariables {}

export interface ElmPageTopProps {
  style?: React.CSSProperties & ElmPageTopCSSVariables;

  /**
   * Specifies the position of the button.
   */
  position?: "left" | "right";
}

export const ElmPageTop = ({
  position = "right",
  style,
}: ElmPageTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      className={`${styles.wrapper} ${isVisible ? styles["wrapper--visible"] : ""}`}
      style={{
        "--size": "64px",
        left: position === "left" ? "0" : "auto",
        right: position === "right" ? "0" : "auto",
        ...style,
      } as React.CSSProperties}
      onClick={toTop}
    >
      <div aria-hidden="true" className={styles.partial} />
      <div aria-hidden="true" className={styles.partial} />
      <div aria-hidden="true" className={styles.partial} />
      <span className={styles.text}>Back to Top</span>
    </nav>
  );
};
