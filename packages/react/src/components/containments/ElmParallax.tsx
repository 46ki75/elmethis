import React, { useEffect, useState } from "react";

import "@styles/global.css";
import styles from "./ElmParallax.module.css";

export interface ElmParallaxCSSVariables {}

export interface ElmParallaxProps {
  style?: React.CSSProperties & ElmParallaxCSSVariables;

  /** First background image URL. */
  imageUrl1: string;

  /** Second background image URL. */
  imageUrl2: string;
}

export const ElmParallax = (props: ElmParallaxProps) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div
        className={styles.parallax}
        style={{
          backgroundImage: `url(${props.imageUrl1})`,
          transform: `scale(1.2) translateY(${scrollY / 400}%)`,
          transformOrigin: "bottom",
          ...props.style,
        }}
      ></div>
      <div
        className={styles.parallax}
        style={{
          backgroundImage: `url(${props.imageUrl2})`,
          transform: `scale(1.2) translateY(${scrollY / 900}%)`,
          transformOrigin: "bottom",
        }}
      ></div>
    </>
  );
};
