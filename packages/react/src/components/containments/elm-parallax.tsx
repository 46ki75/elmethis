import {
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";

import styles from "./elm-parallax.module.css";

export interface ElmParallaxProps extends ComponentPropsWithoutRef<"div"> {
  images: string[];
}

export const ElmParallax = ({
  className,
  images,
  ...props
}: ElmParallaxProps) => {
  const [y, setY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={className} {...props}>
      <div className={styles["parallax-watcher"]}></div>

      {images.map((image, index) => (
        <div
          key={index}
          className={styles.parallax}
          style={
            {
              backgroundImage: `url(${image})`,
              transform: `scale(1.2) translateY(${y / (1000 * (index + 1))}%)`,
              transformOrigin: "bottom",
            } as CSSProperties
          }
        ></div>
      ))}
    </div>
  );
};
