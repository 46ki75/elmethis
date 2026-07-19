import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-parallax.module.css";

const getTransform = (y: number, index: number) =>
  `scale(1.2) translateY(${y / (1000 * (index + 1))}%)`;

export interface ElmParallaxProps extends ComponentPropsWithoutRef<"div"> {
  images: string[];
}

export const ElmParallax = ({
  className,
  images,
  ...props
}: ElmParallaxProps) => {
  const root = useRef<HTMLDivElement>(null);
  const appliedY = useRef(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | undefined;
    let scrollY = window.scrollY;

    const updateLayers = () => {
      frame = undefined;
      const y = reducedMotion.matches ? 0 : scrollY;
      appliedY.current = y;

      root.current
        ?.querySelectorAll<HTMLElement>(`.${styles.parallax}`)
        .forEach((layer, index) => {
          layer.style.transform = getTransform(y, index);
        });
    };
    const scheduleUpdate = () => {
      scrollY = window.scrollY;
      frame ??= window.requestAnimationFrame(updateLayers);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    reducedMotion.addEventListener("change", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={root}
      className={clsx(styles["elm-parallax"], className)}
      {...props}
    >
      {images.map((image, index) => (
        <div
          key={index}
          ref={(layer) => {
            if (layer)
              layer.style.transform = getTransform(appliedY.current, index);
          }}
          aria-hidden="true"
          className={styles.parallax}
          style={{
            backgroundImage: `url(${JSON.stringify(image)})`,
            transform: "scale(1.2) translateY(0%)",
            transformOrigin: "bottom",
          }}
        ></div>
      ))}
    </div>
  );
};
