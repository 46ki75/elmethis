import {
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { clsx } from "clsx";

import styles from "./elm-page-top.module.css";

export interface ElmPageTopProps extends ComponentPropsWithoutRef<"nav"> {
  /**
   * Specifies the position of the button.
   */
  position?: "left" | "right";
}

export const ElmPageTop = ({
  className,
  style,
  position = "right",
  ...props
}: ElmPageTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Initial check and scroll listener
  useEffect(() => {
    const checkScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll(); // Check initial state

    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      className={clsx(
        styles["elm-page-top"],
        isVisible && styles.visible,
        className,
      )}
      style={
        {
          "--elmethis-scoped-size": `${64}px`,
          left: position === "left" ? "0" : "auto",
          right: position === "right" ? "0" : "auto",
          ...style,
        } as CSSProperties
      }
      onClick={toTop}
      {...props}
    >
      <div aria-hidden="true" className={styles.partial}></div>
      <div aria-hidden="true" className={styles.partial}></div>
      <div aria-hidden="true" className={styles.partial}></div>
      <span className={styles.text}>Back to Top</span>
    </nav>
  );
};
