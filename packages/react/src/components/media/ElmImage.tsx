import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmImage.module.css";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";

import { mdiMessageImageOutline } from "@mdi/js";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmImageCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmImageProps {
  style?: React.CSSProperties & ElmImageCSSVariables;

  /**
   * Image source URL
   */
  src: string;

  /**
   * Image alt text
   */
  alt?: string;

  /**
   * Whether the image is a block element.
   */
  block?: boolean;

  /**
   * Enable modal on image click. Default: `false`
   */
  enableModal?: boolean;

  /**
   * The width of the image.
   */
  width?: number;

  /**
   * The height of the image.
   */
  height?: number;
}

export const ElmImage = ({
  src,
  alt,
  block = false,
  enableModal = false,
  width,
  height,
  style,
}: ElmImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoading(false);
      setError(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      setError(true);
    };
  }, [src]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef} style={style}>
      {error && (
        <div className={styles.error}>
          <ElmInlineText color="#c56565" size="1.5rem">
            Error loading image
          </ElmInlineText>
        </div>
      )}

      <div className={styles["image-frame"]} style={style}>
        {isLoading && (
          <div
            className={styles.fallback}
            style={{
              aspectRatio:
                width && height ? `${width} / ${height}` : "1200 / 630",
              width: width ? `${width}px` : undefined,
              height: height ? `${height}px` : undefined,
            }}
          />
        )}

        <img
          className={block ? styles["image-block"] : styles["image-inline"]}
          src={src}
          alt={alt}
          width={width}
          height={height}
          onClick={() => {
            if (enableModal) setIsModalOpen(true);
          }}
          style={
            {
              "--width": width ? `${width}px` : undefined,
              "--height": height ? `${height}px` : undefined,
              cursor: enableModal ? "zoom-in" : undefined,
              opacity: !isLoading && !error ? 1 : 0,
              pointerEvents: !isLoading && !error ? undefined : "none",
            } as React.CSSProperties
          }
        />
      </div>

      {block && !isLoading && alt != null && alt.trim() !== "" && (
        <div className={styles["alt-container"]}>
          <ElmMdiIcon
            d={mdiMessageImageOutline}
            color="#b69545"
            style={{ flexShrink: 0 }}
          />
          <div className={styles["alt-text"]}>
            <ElmInlineText size="0.8rem">{alt}</ElmInlineText>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modal} onClick={() => setIsModalOpen(false)}>
          <img
            className={styles["modal-image"]}
            src={src}
            alt={alt}
            width={width}
            height={height}
          />
        </div>
      )}
    </div>
  );
};
